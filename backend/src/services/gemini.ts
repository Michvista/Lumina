import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? '');

export interface ExtractedMarker {
  name: string;         // Normalized key e.g. "TSH"
  displayName: string;  // Full name e.g. "Thyroid Stimulating Hormone"
  value: number;
  unit: string;
  refLow?: number;
  refHigh?: number;
  refLabel?: string;    // "Low" | "Normal" | "High" etc.
}

export interface ExtractionResult {
  markers: ExtractedMarker[];
  reportType: string;   // e.g. "Hormone Panel", "Complete Blood Count"
  labName?: string;
  drawDate?: string;
  rawText?: string;
}

const EXTRACTION_PROMPT = `You are a medical lab report parser. Your task is to extract ALL lab markers from this report and return ONLY valid JSON — no markdown, no explanation, no surrounding text.

Return this exact JSON shape:
{
  "reportType": "string (e.g. Hormone Panel, CBC, Metabolic Panel)",
  "labName": "string or null",
  "drawDate": "string or null (ISO format if possible)",
  "markers": [
    {
      "name": "NORMALIZED_KEY (e.g. TSH, AMH, LH, FSH, E2, TESTOSTERONE, PROGESTERONE, PROLACTIN, INSULIN, HBA1C, DHEA_S, CORTISOL, FERRITIN, VIT_D, B12)",
      "displayName": "Full human-readable name",
      "value": <number>,
      "unit": "string",
      "refLow": <number or null>,
      "refHigh": <number or null>,
      "refLabel": "Low | Normal | High | Critical or null"
    }
  ]
}

Rules:
- Extract EVERY marker with a numeric value you can see.
- If a value shows "<0.5" or ">100", use the number (0.5 or 100).
- If refLow/refHigh cannot be parsed as numbers, set them to null.
- The name field must be a short ALL_CAPS code — use common abbreviations.
- Return ONLY the JSON object. Do not wrap in code fences.`;

const MODELS = ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-1.5-flash-latest'];

/**
 * Send a file URL to Gemini Vision and extract structured lab markers.
 */
export async function extractMarkersFromFile(
  fileUrl: string,
  mimeType: string,
): Promise<ExtractionResult> {
  // Fetch the file and convert to base64 for Gemini
  const response = await fetch(fileUrl);
  const arrayBuffer = await response.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString('base64');

  const imagePart = {
    inlineData: {
      data: base64,
      mimeType: mimeType === 'application/pdf' ? 'application/pdf' : mimeType,
    },
  };

  let lastError: any;

  for (const modelName of MODELS) {
    const maxAttempts = 3;
    let attempts = 0;

    while (attempts < maxAttempts) {
      attempts += 1;
      try {
        console.log(`Trying extraction using model: ${modelName} (attempt ${attempts})`);
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: { responseMimeType: 'application/json' },
        });
        const result = await model.generateContent([EXTRACTION_PROMPT, imagePart]);
        const text = result.response.text().trim();
        const cleaned = text.replace(/^```json\n?/i, '').replace(/\n?```$/i, '').trim();
        const parsed = JSON.parse(cleaned) as ExtractionResult;
        return parsed;
      } catch (err: any) {
        lastError = err;

        // Try to surface an HTTP-like status if available on the error object
        const status = err?.status || err?.statusCode || err?.response?.status;
        console.warn(
          `Model ${modelName} attempt ${attempts} failed: status=${status ?? 'unknown'} message=${
            err.message || err
          }`,
        );

        // Transient server-side error: retry with a small backoff
        if ((status === 503 || String(err).includes('503')) && attempts < maxAttempts) {
          const wait = 500 * attempts; // 500ms, 1000ms, ...
          console.log(`Transient 503 from ${modelName} — retrying in ${wait}ms...`);
          await new Promise((r) => setTimeout(r, wait));
          continue;
        }

        // If the model isn't found (404), stop trying this model and move on
        if (status === 404 || String(err).toLowerCase().includes('not found')) {
          console.warn(`Model ${modelName} not found (404). Skipping to next model.`);
          break;
        }

        // Any other error: do not aggressively retry this model
        break;
      }
    }
  }

  console.error("All models failed. Last error:", lastError);
  throw new Error(`We encountered an issue reading your lab report. Please make sure the upload is a clear image or PDF containing readable results, and try again.`);
}
