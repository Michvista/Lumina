import { useState, useRef, useEffect } from "react";
import { Volume2, VolumeX, Play, Pause, Loader2 } from "lucide-react";
import { synthesizeSpeech } from "../lib/api";

const DEFAULT_VOICE = "Idera";

interface AudioPlayerProps {
  text: string;
  label?: string;
  voice?: string;
}

type PlayerState = "idle" | "loading" | "playing" | "paused" | "error";

export default function AudioPlayer({
  text,
  label = "Listen to summary",
  voice = DEFAULT_VOICE,
}: AudioPlayerProps) {
  const [state, setState] = useState<PlayerState>("idle");
  const [usedFallback, setUsedFallback] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      window.speechSynthesis.cancel();
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  const speakWithBrowser = (txt: string) => {
    setUsedFallback(true);
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(txt.slice(0, 2000));
    utt.rate = 0.92;
    utt.pitch = 1.05;
    const voices = window.speechSynthesis.getVoices();
    const preferred =
      voices.find(
        (v) =>
          v.lang.startsWith("en") &&
          (v.name.toLowerCase().includes("female") ||
            v.name.toLowerCase().includes("samantha") ||
            v.name.toLowerCase().includes("karen") ||
            v.name.toLowerCase().includes("victoria")),
      ) ?? voices.find((v) => v.lang.startsWith("en"));
    if (preferred) utt.voice = preferred;
    utt.onstart = () => setState("playing");
    utt.onend = () => setState("idle");
    utt.onerror = () => setState("error");
    window.speechSynthesis.speak(utt);
  };

  const handlePlay = async () => {
    if (state === "playing") {
      if (usedFallback) window.speechSynthesis.pause();
      else audioRef.current?.pause();
      setState("paused");
      return;
    }
    if (state === "paused") {
      if (usedFallback) window.speechSynthesis.resume();
      else audioRef.current?.play();
      setState("playing");
      return;
    }

    setState("loading");
    setErrorMsg("");

    try {
      console.log(
        "[AUDIO-PLAYER] Play button clicked, requesting synthesis...",
      );
      const result = await synthesizeSpeech(text, voice);

      if (result.useBrowserFallback || !result.audioObjectUrl) {
        console.log("[AUDIO-PLAYER] Audio synthesis fell back to browser TTS");
        speakWithBrowser(text);
        return;
      }

      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = result.audioObjectUrl;

      setUsedFallback(false);
      const audio = new Audio(result.audioObjectUrl);
      audioRef.current = audio;

      console.log(
        `[AUDIO-PLAYER] Audio element created, readyState=${audio.readyState}`,
      );

      audio.onplay = () => {
        console.log("[AUDIO-PLAYER] Audio started playing");
        setState("playing");
        setErrorMsg("");
      };
      audio.onpause = () => {
        if (audio.ended) {
          console.log("[AUDIO-PLAYER] Audio ended");
          setState("idle");
        } else {
          console.log("[AUDIO-PLAYER] Audio paused");
          setState("paused");
        }
      };
      audio.onended = () => {
        console.log("[AUDIO-PLAYER] Audio finished");
        setState("idle");
        setErrorMsg("");
      };
      audio.onerror = (e) => {
        const errorCode = audio.error?.code ?? "UNKNOWN";
        const errorMsg = audio.error?.message ?? "Unknown error";
        console.error(
          `[AUDIO-PLAYER] Audio playback error: code=${errorCode}, message=${errorMsg}`,
          e,
        );
        setErrorMsg(`Playback error: ${errorMsg}`);
        setState("error");
        setTimeout(() => speakWithBrowser(text), 500);
      };

      audio.onloadstart = () => {
        console.log("[AUDIO-PLAYER] Audio loading started");
      };
      audio.oncanplay = () => {
        console.log("[AUDIO-PLAYER] Audio can play");
      };
      audio.onloadeddata = () => {
        console.log("[AUDIO-PLAYER] Audio data loaded");
      };

      console.log("[AUDIO-PLAYER] Calling audio.play()...");
      audio.play().catch((err) => {
        console.error("[AUDIO-PLAYER] audio.play() failed:", err);
        setErrorMsg(`Play error: ${err.message}`);
        setState("error");
        speakWithBrowser(text);
      });
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Unknown error";
      console.error("[AUDIO-PLAYER] Audio synthesis error:", err);
      setErrorMsg(`Synthesis error: ${errMsg}`);
      setState("error");
      setTimeout(() => speakWithBrowser(text), 500);
    }
  };

  const handleStop = () => {
    audioRef.current?.pause();
    if (audioRef.current) audioRef.current.currentTime = 0;
    window.speechSynthesis.cancel();
    setState("idle");
    setErrorMsg("");
  };

  const isActive = state === "playing" || state === "paused";

  return (
    <div
      className={`flex items-center justify-between gap-4 p-4 rounded-2xl border transition-all duration-300 ${
        isActive
          ? "bg-[#FAF6F2]/90 border-[#8FA998]/50 shadow-sm"
          : "bg-[#FAF6F2]/30 border-[#F4DFD7]/70"
      }`}>
      <div className="flex items-center gap-3">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-[#5D3754] ${
            isActive ? "bg-[#8FA998]/20 animate-pulse" : "bg-[#FAF6F2]"
          }`}>
          <Volume2 size={15} />
        </div>

        <div className="flex flex-col">
          <span className="text-xs font-semibold text-[#5D3754]">{label}</span>
          <span className="text-[10px] text-[#5D3754]/60">
            {state === "error"
              ? `Error: ${errorMsg}`
              : isActive
                ? usedFallback
                  ? "Browser Voice"
                  : `AI Voice · ${voice}`
                : state === "loading"
                  ? "Loading audio..."
                  : "Listen to empathetic audio summary"}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handlePlay}
          disabled={state === "loading" || state === "error"}
          className="bg-[#5D3754] hover:bg-[#4C2C44] disabled:opacity-50 text-[#FAF6F2] font-semibold text-xs px-4 py-2 rounded-full transition-all duration-200 flex items-center gap-1.5">
          {state === "loading" ? (
            <>
              <Loader2 size={12} className="animate-spin" />
              Loading...
            </>
          ) : state === "playing" ? (
            <>
              <Pause size={12} />
              Pause
            </>
          ) : state === "paused" ? (
            <>
              <Play size={12} />
              Resume
            </>
          ) : (
            <>
              <Play size={12} />
              Listen
            </>
          )}
        </button>

        {isActive && (
          <button
            onClick={handleStop}
            className="w-8 h-8 rounded-full hover:bg-[#FAF6F2] text-[#5D3754]/80 hover:text-[#5D3754] flex items-center justify-center transition-colors"
            title="Stop playing">
            <VolumeX size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
