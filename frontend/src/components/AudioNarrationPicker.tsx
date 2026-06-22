import { useState, useRef, useEffect } from 'react';
import { Volume2, Play, Square, AlertCircle } from 'lucide-react';

type SupportedLanguage = 'ENGLISH' | 'PIDGIN' | 'YORUBA' | 'IGBO' | 'HAUSA';

const LANGUAGES: { value: SupportedLanguage; label: string }[] = [
  { value: 'ENGLISH', label: 'English' },
  { value: 'PIDGIN', label: 'Pidgin (Nigerian)' },
  { value: 'YORUBA', label: 'Yorùbá' },
  { value: 'IGBO', label: 'Igbo' },
  { value: 'HAUSA', label: 'Hausa' },
];

const VOICES = [
  { name: 'Idera', desc: 'Melodic, gentle (F)' },
  { name: 'Emma', desc: 'Authoritative, deep (M)' },
  { name: 'Zainab', desc: 'Soothing, gentle (F)' },
  { name: 'Osagie', desc: 'Smooth, calm (M)' },
  { name: 'Wura', desc: 'Young, sweet (F)' },
  { name: 'Jude', desc: 'Warm, confident (M)' },
  { name: 'Chinenye', desc: 'Engaging, warm (F)' },
  { name: 'Tayo', desc: 'Upbeat, energetic (M)' },
  { name: 'Regina', desc: 'Mature, warm (F)' },
  { name: 'Femi', desc: 'Rich, reassuring (M)' },
  { name: 'Adaora', desc: 'Warm, engaging (F)' },
  { name: 'Umar', desc: 'Calm, smooth (M)' },
  { name: 'Mary', desc: 'Energetic, youthful (F)' },
  { name: 'Nonso', desc: 'Bold, resonant (M)' },
  { name: 'Remi', desc: 'Melodious, warm (F)' },
  { name: 'Adam', desc: 'Deep, clear (M)' },
];

interface AudioNarrationPickerProps {
  reportId: string;
}

export default function AudioNarrationPicker({ reportId }: AudioNarrationPickerProps) {
  const [language, setLanguage] = useState<SupportedLanguage>('ENGLISH');
  const [voice, setVoice] = useState('Idera');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Stop audio if reportId changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, [reportId]);

  async function handlePlay() {
    if (isPlaying) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlaying(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/audio/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId, language, voice }),
      });

      const contentType = response.headers.get('Content-Type') ?? '';

      if (contentType.includes('application/json')) {
        const data = await response.json();

        if (data.useBrowserFallback) {
          if (language !== 'ENGLISH') {
            setError(
              "Voice playback isn't available right now for this language. Try English, or check back shortly."
            );
            return;
          }
          const utterance = new SpeechSynthesisUtterance(data.narrationText);
          utterance.onend = () => setIsPlaying(false);
          setIsPlaying(true);
          window.speechSynthesis.speak(utterance);
          return;
        }

        throw new Error(data.error || 'Failed to generate audio.');
      }

      const blob = await response.blob();
      const audioUrl = URL.createObjectURL(blob);

      if (audioRef.current) {
        audioRef.current.src = audioUrl;
      } else {
        const audio = new Audio(audioUrl);
        audioRef.current = audio;
      }

      audioRef.current.onended = () => {
        setIsPlaying(false);
      };

      await audioRef.current.play();
      setIsPlaying(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="bg-[#FAF6F2] border border-[#F4DFD7] rounded-2xl p-5 space-y-4 font-sans max-w-full">
      <div className="flex items-center gap-2 text-[#5D3754]">
        <Volume2 size={18} className="text-[#8FA998]" />
        <h4 className="font-serif font-semibold text-base">Listen to Full Narration</h4>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Language select */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-[#5D3754]/80" htmlFor="audio-language">
            Language
          </label>
          <div className="relative">
            <select
              id="audio-language"
              value={language}
              onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
              className="w-full bg-white border border-[#F4DFD7] rounded-xl px-3 py-2.5 text-xs text-[#5D3754] focus:outline-none focus:ring-1 focus:ring-[#5D3754] appearance-none cursor-pointer"
            >
              {LANGUAGES.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-xs text-[#5D3754]/70">
              ▼
            </div>
          </div>
        </div>

        {/* Voice select */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-[#5D3754]/80" htmlFor="audio-voice">
            Voice
          </label>
          <div className="relative">
            <select
              id="audio-voice"
              value={voice}
              onChange={(e) => setVoice(e.target.value)}
              className="w-full bg-white border border-[#F4DFD7] rounded-xl px-3 py-2.5 text-xs text-[#5D3754] focus:outline-none focus:ring-1 focus:ring-[#5D3754] appearance-none cursor-pointer"
            >
              {VOICES.map((v) => (
                <option key={v.name} value={v.name}>
                  {v.name} ({v.desc})
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-xs text-[#5D3754]/70">
              ▼
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 pt-1">
        <button
          onClick={handlePlay}
          disabled={isLoading}
          className={`flex items-center gap-2 font-sans text-xs font-semibold px-5 py-3 rounded-full transition-all duration-200 shadow-sm ${
            isPlaying
              ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
              : 'bg-[#5D3754] hover:bg-[#4C2C44] text-[#FAF6F2] hover:-translate-y-0.5'
          } disabled:opacity-50`}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              Generating Translation & Audio...
            </span>
          ) : isPlaying ? (
            <>
              <Square size={13} fill="currentColor" />
              Stop Narration
            </>
          ) : (
            <>
              <Play size={13} fill="currentColor" />
              Listen in {LANGUAGES.find((l) => l.value === language)?.label}
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="flex gap-2 items-center bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-600">
          <AlertCircle size={14} className="shrink-0" />
          <p>{error}</p>
        </div>
      )}
    </div>
  );
}
