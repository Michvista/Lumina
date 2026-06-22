import { SupportedLanguage } from '@prisma/client';
import { translateAnalysisResult } from './translate';
import { AnalysisResult } from './groq'; // adjust path to match your actual groq service location
import { prisma } from '../lib/prisma';

/**
 * Returns the AnalysisResult object for a report in the requested language.
 * - ENGLISH always parses and returns the report's raw explanation JSON, no DB write.
 * - Other languages check the Translation cache first (stored as a JSON string,
 *   same AnalysisResult shape); on a miss, translates via Groq and caches it.
 */
export async function getOrCreateTranslation(
    reportId: string,
    language: SupportedLanguage,
): Promise<AnalysisResult> {
    const report = await prisma.report.findUnique({
        where: { id: reportId },
        select: { explanation: true },
    });

    if (!report?.explanation) {
        throw new Error(`Report ${reportId} has no explanation to translate.`);
    }

    const original = JSON.parse(report.explanation) as AnalysisResult;

    if (language === 'ENGLISH') {
        return original;
    }

    const cached = await prisma.translation.findUnique({
        where: { reportId_language: { reportId, language } },
    });

    if (cached) {
        return JSON.parse(cached.text) as AnalysisResult;
    }

    const translated = await translateAnalysisResult(original, language);

    await prisma.translation.create({
        data: { reportId, language, text: JSON.stringify(translated) },
    });

    return translated;
}
