import { Router, Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { synthesizeSpeech, YarnGPTVoice, YarnGPTFormat } from '../services/yarngpt';
import { getOrCreateTranslation } from '../services/translationCache';
import { flattenForNarration } from '../services/flattenfornarration';
import { SupportedLanguage } from '@prisma/client';

export const audioRouter = Router();

/**
 * POST /api/audio/synthesize
 *
 * Two modes, both supported:
 *
 * 1. Legacy / direct text mode (unchanged): pass `text` directly, gets read as-is.
 *    Still used for anything that isn't a report explanation.
 *
 * 2. Report narration mode (new): pass `reportId` + `language`. The route
 *    fetches (or translates + caches) the structured explanation for that
 *    language, flattens it into narration prose, and sends THAT to YarnGPT.
 *
 * In both modes, if YarnGPT is unavailable, returns { useBrowserFallback: true }
 * so the client falls back to window.speechSynthesis — this behavior is untouched.
 */
audioRouter.post(
  '/synthesize',
  asyncHandler(async (req: Request, res: Response) => {
    const {
      text,
      reportId,
      language = 'ENGLISH',
      voice = 'Idera',
      format = 'mp3',
    } = req.body as {
      text?: string;
      reportId?: string;
      language?: SupportedLanguage;
      voice?: YarnGPTVoice;
      format?: YarnGPTFormat;
    };

    let narrationText: string;

    if (reportId) {
      // Report narration mode — translate (cached) + flatten to prose.
      const analysis = await getOrCreateTranslation(reportId, language);
      narrationText = flattenForNarration(analysis, language);
    } else if (text && typeof text === 'string' && text.trim().length > 0) {
      // Legacy direct-text mode.
      narrationText = text.trim();
    } else {
      res.status(400).json({ error: 'Either text or reportId is required' });
      return;
    }

    // YarnGPT caps at 2000 characters per request — chunk if narration is long.
    if (narrationText.length > 2000) {
      narrationText = narrationText.slice(0, 1997) + '...';
    }

    const result = await synthesizeSpeech(narrationText, voice, format);

    // Fallback signal — client will use browser TTS. Untouched.
    if (result.useBrowserFallback || !result.audioBuffer) {
      res.json({ useBrowserFallback: true, narrationText });
      return;
    }

    // Stream binary audio back directly.
    res.set({
      'Content-Type': result.mimeType,
      'Content-Length': result.audioBuffer.length,
      'Cache-Control': 'no-cache',
    });
    res.send(result.audioBuffer);
  }),
);
