import axios from 'axios';
import { Report, TrendPoint, User } from '../types';

const api = axios.create({
  baseURL: (import.meta as any).env.VITE_API_URL ?? '/api',
  timeout: 30_000,
});

// ─── Session ──────────────────────────────────────────────────────────────────
export const createOrGetSession = async (sessionId: string): Promise<User> => {
  const { data } = await api.post('/users/session', { sessionId });
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
  form.append('file', file);
  form.append('sessionId', sessionId);
  if (cycleDay !== null) form.append('cycleDay', String(cycleDay));
  form.append('cyclePhase', cyclePhase);

  const { data } = await api.post('/reports/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60_000,
  });
  return data as { reportId: string };
};

export const getReport = async (reportId: string): Promise<Report> => {
  const { data } = await api.get(`/reports/${reportId}`);
  return data.report as Report;
};

export const getReports = async (sessionId: string): Promise<Report[]> => {
  const { data } = await api.get('/reports', { params: { sessionId } });
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
  const { data } = await api.get('/markers/trend', { params: { sessionId, name } });
  return data.trend as TrendPoint[];
};

export const getAllMarkerNames = async (
  sessionId: string,
): Promise<{ name: string; displayName: string; unit: string }[]> => {
  const { data } = await api.get('/markers/all', { params: { sessionId } });
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
  voice = 'Idera',
): Promise<{ audioObjectUrl: string | null; useBrowserFallback: boolean }> => {
  try {
    const response = await api.post(
      '/audio/synthesize',
      { text, voice, format: 'mp3' },
      { responseType: 'blob', timeout: 20_000 },
    );

    // Backend returned a fallback JSON signal (content-type will be application/json)
    const contentType = String(response.headers['content-type'] ?? '');
    if (contentType.includes('application/json')) {
      return { audioObjectUrl: null, useBrowserFallback: true };
    }

    // Binary audio — create a blob URL the <audio> element can play
    const blob = new Blob([response.data as BlobPart], { type: 'audio/mpeg' });
    const audioObjectUrl = URL.createObjectURL(blob);
    return { audioObjectUrl, useBrowserFallback: false };
  } catch {
    return { audioObjectUrl: null, useBrowserFallback: true };
  }
};

// ─── Authentication ──────────────────────────────────────────────────────────
export const registerUser = async (email: string, password: string, sessionId: string): Promise<User> => {
  const { data } = await api.post('/users/signup', { email, password, sessionId });
  return data.user as User;
};

export const loginUser = async (email: string, password: string): Promise<User> => {
  const { data } = await api.post('/users/login', { email, password });
  return data.user as User;
};
