import { Router, Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { prisma } from '../lib/prisma';
import { MarkerStatus } from '@prisma/client';
import { upload } from '../middleware/upload';
import { uploadFileToCloudinary } from '../services/cloudinary';
import { extractMarkersFromFile } from '../services/gemini';
import { analyzeMarkers, HistoricalMarker } from '../services/groq';

export const reportRouter = Router();

// ─── GET /api/reports?sessionId=xxx ──────────────────────────────────────────
// List all reports for a user (for history page)
reportRouter.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const { sessionId } = req.query as { sessionId?: string };
    if (!sessionId) { res.status(400).json({ error: 'sessionId required' }); return; }

    const user = await prisma.user.findUnique({ where: { sessionId } });
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }

    const reports = await prisma.report.findMany({
      where: { userId: user.id },
      include: { markers: true },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ reports });
  }),
);

// ─── GET /api/reports/:id ─────────────────────────────────────────────────────
reportRouter.get(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const report = await prisma.report.findUnique({
      where: { id: req.params.id as string },
      include: { markers: true },
    });

    if (!report) { res.status(404).json({ error: 'Report not found' }); return; }
    res.json({ report });
  }),
);

// ─── POST /api/reports/upload ─────────────────────────────────────────────────
// The main pipeline: upload → extract → analyze → save
reportRouter.post(
  '/upload',
  upload.single('file'),
  asyncHandler(async (req: Request, res: Response) => {
    const { sessionId, cycleDay, cyclePhase } = req.body as {
      sessionId?: string;
      cycleDay?: string;
      cyclePhase?: string;
    };

    if (!sessionId) { res.status(400).json({ error: 'sessionId required' }); return; }
    if (!req.file) { res.status(400).json({ error: 'No file uploaded' }); return; }

    // 1. Get or create user
    const user = await prisma.user.upsert({
      where: { sessionId },
      update: {},
      create: { sessionId },
    });

    // 2. Create a pending report record immediately (for polling)
    const report = await prisma.report.create({
      data: {
        userId: user.id,
        fileUrl: '',       // filled after Cloudinary upload
        fileName: req.file.originalname,
        fileType: req.file.mimetype === 'application/pdf' ? 'pdf' : 'image',
        cycleDay: cycleDay ? parseInt(cycleDay, 10) : null,
        cyclePhase: cyclePhase ?? null,
        status: 'PENDING',
      },
    });

    // Run the pipeline asynchronously and respond immediately with the report id
    // so the frontend can poll for status
    processReport(report.id, req.file, user.id).catch(console.error);

    res.status(202).json({
      message: 'Report accepted. Processing started.',
      reportId: report.id,
    });
  }),
);

// ─── DELETE /api/reports/:id ──────────────────────────────────────────────────
reportRouter.delete(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    await prisma.report.delete({ where: { id: req.params.id as string } });
    res.json({ message: 'Report deleted' });
  }),
);

// ─── Pipeline ─────────────────────────────────────────────────────────────────
async function processReport(
  reportId: string,
  file: any,
  userId: string,
) {
  try {
    // Step 1: Upload to Cloudinary
    await prisma.report.update({ where: { id: reportId }, data: { status: 'EXTRACTING' } });

    const { url: fileUrl } = await uploadFileToCloudinary(
      file.buffer,
      file.originalname,
      file.mimetype,
    );

    await prisma.report.update({ where: { id: reportId }, data: { fileUrl } });

    // Step 2: Extract markers via Gemini
    const extraction = await extractMarkersFromFile(fileUrl, file.mimetype);

    await prisma.report.update({
      where: { id: reportId },
      data: { rawExtraction: JSON.stringify(extraction) },
    });

    // Step 3: Fetch historical data for trend analysis
    await prisma.report.update({ where: { id: reportId }, data: { status: 'ANALYZING' } });

    const markerNames = extraction.markers.map(m => m.name);

    const historicalMarkers = await prisma.marker.findMany({
      where: {
        name: { in: markerNames },
        report: { userId, id: { not: reportId } },
      },
      orderBy: { createdAt: 'desc' },
      distinct: ['name'],
      include: { report: { select: { createdAt: true } } },
    });

    const historyForGroq: HistoricalMarker[] = historicalMarkers.map((m: any) => ({
      name: m.name,
      previousValue: m.value,
      previousDate: m.report.createdAt.toISOString().split('T')[0],
      unit: m.unit ?? null,
    }));

    // Step 4: Get the stored report for cycle info
    const storedReport = await prisma.report.findUnique({ where: { id: reportId } });

    // Step 5: Analyze via Groq
    const analysis = await analyzeMarkers(
      extraction.markers,
      storedReport?.cycleDay ?? null,
      storedReport?.cyclePhase ?? null,
      historyForGroq,
      extraction.reportType,
    );

    // Step 6: Save markers to DB (one row per marker)
    const markerData = extraction.markers.map(m => {
      const explanation = analysis.markerExplanations.find(
        e => e.markerName === m.name,
      );
      const histEntry = historyForGroq.find(h => h.name === m.name);

      return {
        reportId,
        name: m.name,
        displayName: m.displayName,
        value: m.value,
        unit: m.unit ?? null,
        refLow: m.refLow ?? null,
        refHigh: m.refHigh ?? null,
        refLabel: m.refLabel ?? null,
        status: (explanation?.status ?? 'UNKNOWN') as MarkerStatus,
        plainExplanation: explanation?.plainExplanation ?? null,
        trendNote: explanation?.trendNote ?? (histEntry ? `Previously ${histEntry.previousValue} ${histEntry.unit}` : null),
      };
    });

    await prisma.marker.createMany({ data: markerData });

    // Step 7: Mark report as complete
    await prisma.report.update({
      where: { id: reportId },
      data: {
        status: 'COMPLETE',
        explanation: JSON.stringify(analysis),
        advocacyChecklist: JSON.stringify(analysis.advocacyChecklist),
      },
    });

    console.log(`✅ Report ${reportId} complete`);
  } catch (err) {
    console.error(`❌ Report ${reportId} failed:`, err);
    await prisma.report.update({
      where: { id: reportId },
      data: {
        status: 'FAILED',
        error: err instanceof Error ? err.message : 'Unknown error',
      },
    });
  }
}
