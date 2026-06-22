/**
 * Groq LLM service for empathetic marker analysis.
 *
 * Uses raw fetch (OpenAI-compatible endpoint) instead of the SDK so that
 * HTTP-level errors (401, 429, 503 etc.) are fully visible in the console.
 * Swapping providers later only requires changing GROQ_BASE_URL / model name.
 *
 * Includes retry-with-backoff for flaky network connections (connect timeouts,
 * DNS failures, rate limits, transient 5xx errors from Groq).
 */

import { ExtractedMarker } from './gemini';

const GROQ_BASE_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.3-70b-versatile';

const MAX_RETRIES = 4;
const BASE_DELAY_MS = 1500;

export interface MarkerExplanation {
  markerName: string;
  plainExplanation: string;
  trendNote?: string;
  status: 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL_LOW' | 'CRITICAL_HIGH' | 'UNKNOWN';
}

export interface AnalysisResult {
  summary: string;
  markerExplanations: MarkerExplanation[];
  advocacyChecklist: string[];
  cycleContext?: string;
}

export interface HistoricalMarker {
  name: string;
  previousValue: number;
  previousDate: string;
  unit: string;
}

const SYSTEM_PROMPT = `You are Lumina — a warm, empathetic health guide. Your role is to translate complex lab results into clear, reassuring language for anyone reviewing their blood work.

Core principles:
1. NEVER use clinical jargon without immediately explaining it in plain English.
2. NEVER just state a value is "Low" or "High" without context. Always explain WHAT that means for this specific person.
3. Acknowledge anxiety. When values are outside range, explicitly say "This does not automatically mean X" to address common fears.
4. Reference relevant health context: hormones, thyroid, iron, immune health where relevant.
5. Be honest without being alarming. The goal is empowered, not scared.
6. ALWAYS end with encouragement — the user is being proactive about their health.
7. Never give diagnoses. Always recommend discussing with a doctor.

You MUST respond with ONLY valid JSON — no markdown fences, no extra commentary outside the JSON object.`;

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

function isRetryableStatus(status: number): boolean {
  return status === 429 || status >= 500;
}

const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

async function callGroq(systemPrompt: string, userPrompt: string): Promise<unknown> {
  if (!process.env.GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY is not set in environment variables.');
  }

  let lastErr: unknown;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`[Groq] Sending request to Groq API... (attempt ${attempt}/${MAX_RETRIES})`);

      const response = await fetch(GROQ_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.3,
          max_tokens: 4096,
          response_format: { type: 'json_object' },
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error(`[Groq] HTTP error ${response.status}:`, errText);

        if (isRetryableStatus(response.status) && attempt < MAX_RETRIES) {
          const delay = BASE_DELAY_MS * attempt;
          console.warn(`[Groq] Retryable status ${response.status}, retrying in ${delay}ms... (attempt ${attempt}/${MAX_RETRIES})`);
          await sleep(delay);
          continue;
        }
        throw new Error(`Groq API request failed (${response.status}): ${errText.slice(0, 300)}`);
      }

      const data = (await response.json()) as { choices?: { message?: { content?: string } }[] };
      const content = data.choices?.[0]?.message?.content;

      if (!content) {
        console.error('[Groq] No content in response:', JSON.stringify(data));
        throw new Error('Groq returned an empty response.');
      }

      console.log('[Groq] Response received, length:', content.length);
      console.log('[Groq] Preview:', content.slice(0, 200));

      try {
        return JSON.parse(content);
      } catch (parseErr) {
        console.error('[Groq] JSON parse failed. Full content was:');
        console.error(content);
        console.error('[Groq] Parse error:', parseErr);
        throw new Error(
          `Groq did not return valid JSON. Content preview: ${content.slice(0, 200)}`,
        );
      }
    } catch (err) {
      lastErr = err;

      if (isRetryableError(err) && attempt < MAX_RETRIES) {
        const delay = BASE_DELAY_MS * attempt;
        console.warn(
          `[Groq] Network error (${(err as Error).message}), retrying in ${delay}ms... (attempt ${attempt}/${MAX_RETRIES})`,
        );
        await sleep(delay);
        continue;
      }

      throw err;
    }
  }

  throw lastErr;
}

/**
 * Send extracted markers + historical data to Groq for empathetic analysis.
 */
export async function analyzeMarkers(
  markers: ExtractedMarker[],
  cycleDay: number | null,
  cyclePhase: string | null,
  historicalData: HistoricalMarker[],
  reportType: string,
): Promise<AnalysisResult> {

  const cycleContext = cycleDay
    ? `The blood was drawn on day ${cycleDay} of the user's menstrual cycle (${cyclePhase ?? 'unknown phase'}).`
    : cyclePhase === 'menopausal'
      ? 'The user is menopausal — standard cycling reference ranges do not apply.'
      : 'No cycle day was provided. Use general reference ranges.';

  const historyContext = historicalData.length > 0
    ? `Historical data for trend analysis:\n${historicalData
      .map(h => `- ${h.name}: was ${h.previousValue} ${h.unit} on ${h.previousDate}`)
      .join('\n')}`
    : 'No historical data available (first report).';

  const userPrompt = `
Report type: ${reportType}
Cycle context: ${cycleContext}
${historyContext}

Current markers:
${JSON.stringify(markers, null, 2)}

Respond with ONLY this JSON structure:
{
  "summary": "2-3 sentence warm, plain-language overview of the overall picture",
  "cycleContext": "1 sentence explaining how cycle day affects these results, or null",
  "markerExplanations": [
    {
      "markerName": "EXACT name from input",
      "status": "LOW | NORMAL | HIGH | CRITICAL_LOW | CRITICAL_HIGH | UNKNOWN",
      "plainExplanation": "2-4 sentence explanation — contextualize, normalize where appropriate, be specific and human",
      "trendNote": "1-2 sentences about the trend vs historical data, or null if no history"
    }
  ],
  "advocacyChecklist": [
    "Question 1 phrased exactly how a real patient would ask it",
    "Question 2",
    "Question 3",
    "Question 4 (optional)",
    "Question 5 (optional)"
  ]
}
`;

  try {
    const result = await callGroq(SYSTEM_PROMPT, userPrompt);
    return result as AnalysisResult;
  } catch (err: any) {
    console.error('[Groq] analyzeMarkers failed:', err.message);
    throw err;
  }
}