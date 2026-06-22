/**
 * YarnGPT TTS — Official hosted API at https://yarngpt.ai/api/v1/tts
 * Returns binary MP3/WAV audio. We proxy it back to the client.
 */

export type YarnGPTVoice =
  | 'Idera' | 'Emma' | 'Zainab' | 'Osagie' | 'Wura' | 'Jude'
  | 'Chinenye' | 'Tayo' | 'Regina' | 'Femi' | 'Adaora' | 'Umar'
  | 'Mary' | 'Nonso' | 'Remi' | 'Adam';

export type YarnGPTFormat = 'mp3' | 'wav' | 'opus' | 'flac';

export interface TTSResult {
  audioBuffer: Buffer | null;
  mimeType: string;
  useBrowserFallback: boolean;
  error?: string;
}

const YARNGPT_URL = 'https://yarngpt.ai/api/v1/tts';

/**
 * Call the YarnGPT API and return the audio buffer.
 * Falls back gracefully if the key is missing or the call fails.
 */
export async function synthesizeSpeech(
  text: string,
  voice: YarnGPTVoice = 'Idera',
  format: YarnGPTFormat = 'mp3',
): Promise<TTSResult> {
  const apiKey = process.env.YARNGPT_API_KEY;

  if (!apiKey) {
    console.warn('[YarnGPT] No API key set — falling back to browser TTS');
    return { audioBuffer: null, mimeType: 'audio/mpeg', useBrowserFallback: true };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 90_000); // 90s timeout

  try {
    const response = await fetch(YARNGPT_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: text.slice(0, 2000), // API max
        voice,
        response_format: format,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      console.error(`[YarnGPT] API error ${response.status}: ${errText}`);
      return { audioBuffer: null, mimeType: 'audio/mpeg', useBrowserFallback: true, error: errText };
    }

    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = Buffer.from(arrayBuffer);

    const mimeTypes: Record<YarnGPTFormat, string> = {
      mp3:  'audio/mpeg',
      wav:  'audio/wav',
      opus: 'audio/ogg; codecs=opus',
      flac: 'audio/flac',
    };

    return {
      audioBuffer,
      mimeType: mimeTypes[format],
      useBrowserFallback: false,
    };
  } catch (err: any) {
    clearTimeout(timeout);
    let msg = err instanceof Error ? err.message : 'Unknown error';
    
    if (err.name === 'AbortError' || msg.includes('aborted')) {
      msg = 'The request timed out after 90 seconds (YarnGPT took too long to generate the speech).';
    }
    
    console.warn(`[YarnGPT] Request failed: ${msg}. Browser TTS fallback active.`);
    return { audioBuffer: null, mimeType: 'audio/mpeg', useBrowserFallback: true, error: msg };
  }
}
