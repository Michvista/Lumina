// ─── Shared Types ──────────────────────────────────────────────────────────────

export type MarkerStatus = 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL_LOW' | 'CRITICAL_HIGH' | 'UNKNOWN';
export type ReportStatus = 'PENDING' | 'EXTRACTING' | 'ANALYZING' | 'COMPLETE' | 'FAILED';
export type CyclePhase = 'follicular' | 'ovulatory' | 'luteal' | 'menstrual' | 'not_applicable' | 'menopausal' | 'unknown';

export interface Marker {
  id: string;
  reportId: string;
  name: string;
  displayName: string;
  value: number;
  unit: string;
  refLow: number | null;
  refHigh: number | null;
  refLabel: string | null;
  status: MarkerStatus;
  plainExplanation: string | null;
  trendNote: string | null;
  createdAt: string;
}

export interface MarkerExplanation {
  markerName: string;
  plainExplanation: string;
  trendNote?: string;
  status: MarkerStatus;
}

export interface AnalysisResult {
  summary: string;
  cycleContext?: string;
  markerExplanations: MarkerExplanation[];
  advocacyChecklist: string[];
}

export interface Report {
  id: string;
  userId: string;
  fileUrl: string;
  fileName: string;
  fileType: 'pdf' | 'image';
  cycleDay: number | null;
  cyclePhase: string | null;
  rawExtraction: string | null;
  explanation: string | null;   // stringified AnalysisResult
  advocacyChecklist: string | null; // stringified string[]
  status: ReportStatus;
  error: string | null;
  createdAt: string;
  updatedAt: string;
  markers: Marker[];
}

export interface TrendPoint {
  date: string;
  value: number;
  unit: string;
  status: MarkerStatus;
  cycleDay: number | null;
  refLow: number | null;
  refHigh: number | null;
}

export interface User {
  id: string;
  sessionId: string;
  email?: string;
  createdAt: string;
}
