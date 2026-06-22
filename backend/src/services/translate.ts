// backend/src/services/translate.ts

export type SupportedLanguage = 'ENGLISH' | 'PIDGIN' | 'YORUBA' | 'IGBO' | 'HAUSA';

const GROQ_BASE_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.3-70b-versatile';

const LANGUAGE_NAMES: Record<SupportedLanguage, string> = {
    ENGLISH: 'English',
    PIDGIN: 'Nigerian Pidgin',
    YORUBA: 'Yoruba',
    IGBO: 'Igbo',
    HAUSA: 'Hausa',
};

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1500;
const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

function isRetryableError(err: unknown): boolean {
    if (err instanceof Error) {
        const msg = err.message.toLowerCase();
        const cause = (err as any).cause?.code as string | undefined;
        if (msg.includes('fetch failed')) return true;
        if (cause && ['UND_ERR_CONNECT_TIMEOUT', 'ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND', 'EAI_AGAIN'].includes(cause)) {
            return true;
        }
    }
    return false;
}

/**
 * Translates plain-English health explanation text into a target Nigerian
 * language, preserving tone (warm, clear, non-clinical) for natural TTS reading.
 */
export async function translateText(
    text: string,
    targetLanguage: SupportedLanguage,
): Promise<string> {
    if (targetLanguage === 'ENGLISH') return text;

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
        throw new Error('GROQ_API_KEY is not set in environment variables.');
    }

    const languageName = LANGUAGE_NAMES[targetLanguage];

    const systemPrompt = `You are a professional translator specializing in Nigerian languages and health communication.
Translate the given English health explanation into natural, conversational ${languageName}, as it would actually be spoken aloud to a patient.
Rules:
- Keep the warm, reassuring, plain-language tone of the original.
- Do not transliterate medical jargon literally — express it the way a Nigerian doctor or nurse would explain it to a patient in ${languageName} in everyday speech.
- Output ONLY the translated text. No notes, no English, no explanations, no markdown.`;

    let lastErr: unknown;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            const response = await fetch(GROQ_BASE_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                    model: MODEL,
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: text },
                    ],
                    temperature: 0.3,
                    max_tokens: 2048,
                }),
            });

            if (!response.ok) {
                const errText = await response.text();
                if ((response.status === 429 || response.status >= 500) && attempt < MAX_RETRIES) {
                    await sleep(BASE_DELAY_MS * attempt);
                    continue;
                }
                throw new Error(`Groq translation failed (${response.status}): ${errText.slice(0, 300)}`);
            }

            const data = (await response.json()) as { choices?: { message?: { content?: string } }[] };
            const translated = data.choices?.[0]?.message?.content?.trim();

            if (!translated) {
                throw new Error('Groq returned an empty translation.');
            }

            return translated;
        } catch (err) {
            lastErr = err;
            if (isRetryableError(err) && attempt < MAX_RETRIES) {
                await sleep(BASE_DELAY_MS * attempt);
                continue;
            }
            throw err;
        }
    }

    throw lastErr;
}

import { AnalysisResult } from './groq';

/**
 * Translates only the human-readable text fields of an AnalysisResult,
 * preserving the exact JSON shape (markerName and status are left untouched
 * since they're used as enum/lookup keys elsewhere in the app).
 *
 * One Groq call handles the whole object — cheaper and more consistent in
 * tone than translating field-by-field.
 */
export async function translateAnalysisResult(
    analysis: AnalysisResult,
    targetLanguage: SupportedLanguage,
): Promise<AnalysisResult> {
    if (targetLanguage === 'ENGLISH') return analysis;

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
        throw new Error('GROQ_API_KEY is not set in environment variables.');
    }

    const languageName = LANGUAGE_NAMES[targetLanguage];

    const systemPrompt = `You are a professional translator specializing in Nigerian languages and health communication.

You will receive a JSON object with this exact shape:
{
  "summary": string,
  "cycleContext": string | null,
  "markerExplanations": [
    { "markerName": string, "status": string, "plainExplanation": string, "trendNote": string | null }
  ],
  "advocacyChecklist": string[]
}

Translate ONLY these fields into natural, conversational ${languageName}, as it would be spoken aloud to a patient:
- summary
- cycleContext (if not null)
- markerExplanations[].plainExplanation
- markerExplanations[].trendNote (if not null)
- advocacyChecklist[] (each question)

DO NOT translate or alter:
- markerExplanations[].markerName (keep exact original value — it's a medical label used elsewhere in the app)
- markerExplanations[].status (keep exact original value — it's an enum)
- The JSON keys themselves
- The overall structure, array order, or null values

Keep the warm, reassuring, plain-language tone of the original. Do not transliterate medical jargon literally — express it the way a Nigerian doctor or nurse would explain it in everyday ${languageName}.

Respond with ONLY the translated JSON object. No markdown fences, no commentary.`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: JSON.stringify(analysis) },
            ],
            temperature: 0.3,
            max_tokens: 4096,
            response_format: { type: 'json_object' },
        }),
    });

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Groq translation failed (${response.status}): ${errText.slice(0, 300)}`);
    }

    const data = (await response.json()) as { choices?: { message?: { content?: string } }[] };
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
        throw new Error('Groq returned an empty translation.');
    }

    try {
        return JSON.parse(content) as AnalysisResult;
    } catch (err) {
        throw new Error(`Groq did not return valid JSON for translation. Preview: ${content.slice(0, 200)}`);
    }
}
