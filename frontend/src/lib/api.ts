import axios from "axios";
import { Report, TrendPoint, User } from "../types";

const api = axios.create({
  baseURL: (import.meta as any).env.VITE_API_URL ?? "/api",
  timeout: 30_000,
});

// ─── Session ──────────────────────────────────────────────────────────────────
export const createOrGetSession = async (sessionId: string): Promise<User> => {
  const { data } = await api.post("/users/session", { sessionId });
  return data.user as User;
};

// ─── Reports ─────────────────────────────────────────────────────────────────
export const uploadReport = async (
  file: File,
  sessionId: string,
  cycleDay: number | null,
  cyclePhase: string,
): Promise<{ reportId: string }> => {
  const form = new FormData();
  form.append("file", file);
  form.append("sessionId", sessionId);
  if (cycleDay !== null) form.append("cycleDay", String(cycleDay));
  form.append("cyclePhase", cyclePhase);

  const { data } = await api.post("/reports/upload", form, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 60_000,
  });
  return data as { reportId: string };
};

export const getReport = async (reportId: string): Promise<Report> => {
  const { data } = await api.get(`/reports/${reportId}`);
  return data.report as Report;
};

export const getReports = async (sessionId: string): Promise<Report[]> => {
  const { data } = await api.get("/reports", { params: { sessionId } });
  return data.reports as Report[];
};

export const deleteReport = async (reportId: string): Promise<void> => {
  await api.delete(`/reports/${reportId}`);
};

// ─── Markers ─────────────────────────────────────────────────────────────────
export const getMarkerTrend = async (
  sessionId: string,
  name: string,
): Promise<TrendPoint[]> => {
  const { data } = await api.get("/markers/trend", {
    params: { sessionId, name },
  });
  return data.trend as TrendPoint[];
};

export const getAllMarkerNames = async (
  sessionId: string,
): Promise<{ name: string; displayName: string; unit: string }[]> => {
  const { data } = await api.get("/markers/all", { params: { sessionId } });
  return data.markers as { name: string; displayName: string; unit: string }[];
};

// ─── Audio ────────────────────────────────────────────────────────────────────
/**
 * Calls the backend TTS endpoint.
 * Returns an object URL (blob URL) for the audio if YarnGPT succeeded,
 * or { useBrowserFallback: true } if the backend fell back.
 */
export const synthesizeSpeech = async (
  text: string,
  voice = "Idera",
): Promise<{ audioObjectUrl: string | null; useBrowserFallback: boolean }> => {
  try {
    console.log("[AUDIO-CLIENT] Requesting audio synthesis...");
    const response = await api.post(
      "/audio/synthesize",
      { text, voice, format: "mp3" },
      { responseType: "blob", timeout: 20_000 },
    );

    // Backend returned a fallback JSON signal (content-type will be application/json)
    const contentType = String(response.headers["content-type"] ?? "");
    console.log(
      `[AUDIO-CLIENT] Response received: contentType=${contentType}, status=${response.status}, dataSize=${(response.data as any).size || "unknown"}`,
    );
    if (contentType.includes("application/json")) {
      console.log("[AUDIO-CLIENT] Received JSON fallback signal");
      return { audioObjectUrl: null, useBrowserFallback: true };
    }

    // Ensure response.data is a Blob; if already a Blob, use directly
    const audioBlob =
      response.data instanceof Blob
        ? response.data
        : new Blob([response.data as BlobPart], { type: "audio/mpeg" });

    console.log(
      `[AUDIO-CLIENT] Blob created: size=${audioBlob.size} bytes, type=${audioBlob.type}`,
    );

    // Validation: empty blob is invalid
    if (audioBlob.size === 0) {
      console.error("[AUDIO-CLIENT] ERROR: Blob is empty (0 bytes)");
      return { audioObjectUrl: null, useBrowserFallback: true };
    }

    // Create object URL for the audio element
    const audioObjectUrl = URL.createObjectURL(audioBlob);
    console.log(
      `[AUDIO-CLIENT] Object URL created: ${audioObjectUrl.substring(0, 50)}...`,
    );
    return { audioObjectUrl, useBrowserFallback: false };
  } catch (error) {
    console.error("[AUDIO-CLIENT] Audio synthesis failed:", error);
    return { audioObjectUrl: null, useBrowserFallback: true };
  }
};

// ─── Authentication ──────────────────────────────────────────────────────────
export const registerUser = async (
  email: string,
  password: string,
  sessionId: string,
): Promise<User> => {
  const { data } = await api.post("/users/signup", {
    email,
    password,
    sessionId,
  });
  return data.user as User;
};

export const loginUser = async (
  email: string,
  password: string,
): Promise<User> => {
  const { data } = await api.post("/users/login", { email, password });
  return data.user as User;
};
