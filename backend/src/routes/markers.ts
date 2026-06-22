import { Router, Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { prisma } from '../lib/prisma';

export const markerRouter = Router();

/**
 * GET /api/markers/trend?sessionId=xxx&name=TSH
 * Returns all values for a given marker across all reports for a user.
 * Used for the trend line chart on the history page.
 */
markerRouter.get(
  '/trend',
  asyncHandler(async (req: Request, res: Response) => {
    const { sessionId, name } = req.query as { sessionId?: string; name?: string };

    if (!sessionId || !name) {
      res.status(400).json({ error: 'sessionId and name are required' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { sessionId } });
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }

    const markers = await prisma.marker.findMany({
      where: {
        name: name.toUpperCase(),
        report: { userId: user.id, status: 'COMPLETE' },
      },
      include: { report: { select: { createdAt: true, cycleDay: true } } },
      orderBy: { createdAt: 'asc' },
    });

    const trend = markers.map((m: any) => ({
      date: m.report.createdAt.toISOString().split('T')[0],
      value: m.value,
      unit: m.unit,
      status: m.status,
      cycleDay: m.report.cycleDay,
      refLow: m.refLow,
      refHigh: m.refHigh,
    }));

    res.json({ name, trend });
  }),
);

/**
 * GET /api/markers/all?sessionId=xxx
 * Returns all distinct marker names the user has ever had recorded.
 * Used to populate the trend chart dropdown.
 */
markerRouter.get(
  '/all',
  asyncHandler(async (req: Request, res: Response) => {
    const { sessionId } = req.query as { sessionId?: string };
    if (!sessionId) { res.status(400).json({ error: 'sessionId required' }); return; }

    const user = await prisma.user.findUnique({ where: { sessionId } });
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }

    const markers = await prisma.marker.findMany({
      where: { report: { userId: user.id } },
      select: { name: true, displayName: true, unit: true },
      distinct: ['name'],
      orderBy: { name: 'asc' },
    });

    res.json({ markers });
  }),
);
