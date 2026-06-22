import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  AlertTriangle, XCircle, FileText, Shield,
  Calendar, Sparkles, ChevronRight
} from 'lucide-react';
import AdvocacyChecklist from '../components/AdvocacyChecklist';
import AudioNarrationPicker from '../components/AudioNarrationPicker';
import { getReport, getMarkerTrend } from '../lib/api';
import { useSession } from '../hooks/useSession';
import { Report, AnalysisResult, ReportStatus } from '../types';

const STATUS_STEPS: ReportStatus[] = ['PENDING', 'EXTRACTING', 'ANALYZING', 'COMPLETE'];

const PROCESSING_LABELS: Record<ReportStatus, string> = {
  PENDING:    'Uploading your report…',
  EXTRACTING: 'Our AI is reading your lab values…',
  ANALYZING:  'Lumina is generating your insights…',
  COMPLETE:   'Analysis complete!',
  FAILED:     'Analysis failed.',
};

const PROCESSING_SUBS: Record<ReportStatus, string> = {
  PENDING:    'Securing your file on Cloudinary.',
  EXTRACTING: 'Extracting every marker, value, unit, and reference range.',
  ANALYZING:  "Building your 'Don't Panic' explanations and advocacy checklist.",
  COMPLETE:   '',
  FAILED:     'Please try uploading a clearer image or PDF.',
};

export default function Results() {
  const { reportId } = useParams<{ reportId: string }>();
  const { sessionId } = useSession();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [polling, setPolling] = useState(true);
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [loadingTrend, setLoadingTrend] = useState(false);

  const fetchReport = useCallback(async () => {
    if (!reportId) return;
    try {
      const r = await getReport(reportId);
      setReport(r);
      if (r.status === 'COMPLETE' || r.status === 'FAILED') {
        setPolling(false);
      }
    } catch {
      setPolling(false);
    } finally {
      setLoading(false);
    }
  }, [reportId]);

  // Poll while processing
  useEffect(() => {
    fetchReport();
    if (!polling) return;
    const interval = setInterval(() => {
      if (polling) fetchReport();
    }, 3000);
    return () => clearInterval(interval);
  }, [fetchReport, polling]);

  // Selected Marker
  const selectedMarker = report?.markers.find(m => m.id === selectedMarkerId) ?? report?.markers[0] ?? null;

  // Fetch trend data when selected marker changes
  useEffect(() => {
    if (!sessionId || !selectedMarker) return;
    setLoadingTrend(true);
    getMarkerTrend(sessionId, selectedMarker.name)
      .then(setTrendData)
      .catch(() => setTrendData([]))
      .finally(() => setLoadingTrend(false));
  }, [sessionId, selectedMarker?.name]);

  // Loading skeleton
  if (loading) {
    return (
      <div className="bg-[#FAF6F2] min-h-screen py-16 px-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="skeleton h-8 w-48" />
          <div className="skeleton h-44 w-full" />
          <div className="skeleton h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="bg-[#FAF6F2] min-h-screen py-16 px-6 flex items-center justify-center">
        <div className="max-w-md w-full bg-white border border-[#F4DFD7] rounded-3xl p-8 text-center space-y-6 shadow-sm">
          <XCircle size={48} className="text-red-500 mx-auto" />
          <div className="space-y-1">
            <h2 className="font-serif text-2xl font-semibold text-[#5D3754]">Report not found</h2>
            <p className="text-sm text-[#5D3754]/80">This report may have been deleted or the link is invalid.</p>
          </div>
          <Link to="/upload" className="block text-center bg-[#5D3754] hover:bg-[#4C2C44] text-[#FAF6F2] font-semibold py-3.5 rounded-full transition-colors">
            Upload a New Report
          </Link>
        </div>
      </div>
    );
  }

  // Processing state
  if (report.status !== 'COMPLETE' && report.status !== 'FAILED') {
    const currentStep = STATUS_STEPS.indexOf(report.status);

    return (
      <div className="bg-[#FAF6F2] min-h-screen py-16 px-6 flex items-center justify-center">
        <div className="max-w-lg w-full bg-white border border-[#F4DFD7] rounded-3xl p-8 text-center space-y-8 shadow-sm">
          <div className="space-y-3">
            <div className="spinner mx-auto" />
            <h2 className="font-serif text-2xl font-semibold text-[#5D3754]">
              {PROCESSING_LABELS[report.status]}
            </h2>
            <p className="text-xs text-[#5D3754]/75 max-w-sm mx-auto">
              {PROCESSING_SUBS[report.status]}
            </p>
          </div>

          {/* Stepper indicator */}
          <div className="flex items-center justify-center gap-1.5 font-sans">
            {STATUS_STEPS.map((s, idx) => {
              const isActive = idx <= currentStep;
              return (
                <div key={s} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                    isActive ? 'bg-[#5D3754] text-white shadow' : 'bg-[#FAF6F2] text-[#5D3754]/40 border border-[#F4DFD7]'
                  }`}>
                    {idx + 1}
                  </div>
                  {idx < STATUS_STEPS.length - 1 && (
                    <div className={`w-8 h-[2px] transition-all duration-300 ${
                      idx < currentStep ? 'bg-[#5D3754]' : 'bg-[#F4DFD7]'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Failed state
  if (report.status === 'FAILED') {
    const rawError = report.error ?? '';
    const isTechnical = 
      rawError.includes('unparseable') || 
      rawError.includes('JSON') || 
      rawError.includes('Gemini') || 
      rawError.includes('Prisma') || 
      rawError.includes('database') || 
      rawError.includes('API key') || 
      rawError.includes('failed');
      
    const friendlyError = isTechnical 
      ? 'We encountered an issue reading your lab report. Please make sure the upload is a clear image or PDF containing readable results, and try again.'
      : (report.error ?? 'Something went wrong processing your report.');

    return (
      <div className="bg-[#FAF6F2] min-h-screen py-16 px-6 flex items-center justify-center">
        <div className="max-w-md w-full bg-white border border-[#F4DFD7] rounded-3xl p-8 text-center space-y-6 shadow-sm">
          <XCircle size={48} className="text-red-500 mx-auto" />
          <div className="space-y-1">
            <h2 className="font-serif text-2xl font-semibold text-[#5D3754]">Analysis failed</h2>
            <p className="text-sm text-[#5D3754]/85 leading-relaxed">{friendlyError}</p>
          </div>
          <Link to="/upload" className="block text-center bg-[#5D3754] hover:bg-[#4C2C44] text-[#FAF6F2] font-semibold py-3.5 rounded-full transition-colors">
            Try Again
          </Link>
        </div>
      </div>
    );
  }

  // Parse results
  let analysis: AnalysisResult | null = null;
  let checklist: string[] = [];

  try {
    if (report.explanation) analysis = JSON.parse(report.explanation) as AnalysisResult;
    if (report.advocacyChecklist) checklist = JSON.parse(report.advocacyChecklist) as string[];
  } catch { /* degrade */ }

  const criticalMarkers = report.markers.filter(
    m => m.status === 'CRITICAL_LOW' || m.status === 'CRITICAL_HIGH',
  );

  return (
    <div className="bg-[#FAF6F2] min-h-screen text-[#2A1A24] py-12 px-6">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Top bar back link */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F4DFD7]/60 pb-6">
          <Link to="/history" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#5D3754] hover:text-[#5D3754]/80">
            <ArrowLeft size={16} />
            Back to history
          </Link>

          <div className="flex items-center gap-2 text-xs text-[#5D3754]/75 bg-white border border-[#F4DFD7] px-4 py-2 rounded-full shadow-sm">
            <FileText size={13} className="text-[#8FA998]" />
            <span className="font-medium truncate max-w-[180px]">{report.fileName}</span>
            {report.cycleDay && (
              <>
                <span>·</span>
                <Calendar size={13} className="text-[#8FA998]" />
                <span>Days since period: {report.cycleDay}</span>
              </>
            )}
          </div>
        </div>

        {/* Critical alert banner */}
        {criticalMarkers.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex items-start gap-3.5 text-red-700 animate-fade-up">
            <AlertTriangle size={20} className="shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-sm">
                {criticalMarkers.length} marker{criticalMarkers.length > 1 ? 's' : ''} returned a critical value
              </p>
              <p className="text-xs text-red-700/90 leading-relaxed">
                {criticalMarkers.map(m => m.name).join(', ')} — please discuss these with your healthcare provider soon.
              </p>
            </div>
          </div>
        )}

        {/* Summary Card with Audio Player (Top Section) */}
        {analysis?.summary && (
          <div className="bg-white border border-[#F4DFD7] rounded-3xl p-8 space-y-6 shadow-sm animate-fade-up">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#8FA998] uppercase tracking-wider">
                <Sparkles size={11} />
                Overview Report Summary
              </span>
              <h2 className="font-serif text-3xl font-semibold text-[#5D3754]">Empathy Summary</h2>
              <p className="font-sans text-sm md:text-base text-[#5D3754]/95 leading-relaxed">
                {analysis.summary}
              </p>
            </div>

            {/* Multilingual Audio Narration Player */}
            <AudioNarrationPicker reportId={report.id} />
          </div>
        )}

        {/* Two Column Layout: Left (Markers List), Right (Empathetic Translation for Selected Marker) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: All Markers List (Image 2 style) */}
          <div className="lg:col-span-6 bg-white border border-[#F4DFD7] rounded-3xl p-8 space-y-6 shadow-sm">
            <div className="space-y-1">
              <h2 className="font-serif text-2xl font-semibold text-[#5D3754]">Your Hormonal Health Insight</h2>
              <p className="text-xs text-[#5D3754]/75">
                Analyzed on {new Date(report.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                {report.cycleDay ? ` • Days since last period: ${report.cycleDay} Reference` : ''}
              </p>
            </div>

            {/* Markers List */}
            <div className="space-y-3">
              {report.markers.map((m) => {
                const isSelected = selectedMarker?.id === m.id;
                const isOutOfRange = m.status !== 'NORMAL' && m.status !== 'UNKNOWN';
                
                return (
                  <div
                    key={m.id}
                    onClick={() => setSelectedMarkerId(m.id)}
                    className={`flex items-center justify-between gap-4 p-4 rounded-2xl border cursor-pointer transition-all duration-200 ${
                      isSelected 
                        ? 'bg-[#FAF6F2] border-[#5D3754] shadow-sm' 
                        : 'bg-white border-[#F4DFD7]/60 hover:bg-[#FAF6F2]/30 hover:border-[#F4DFD7]'
                    }`}
                  >
                    <div className="space-y-1">
                      <p className="font-serif text-base font-semibold text-[#5D3754]">{m.displayName}</p>
                      {m.refLow != null && m.refHigh != null ? (
                        <p className="text-xs text-[#5D3754]/60">
                          Ref Range: {m.refLow} - {m.refHigh} {m.unit}
                        </p>
                      ) : (
                        <p className="text-xs text-[#5D3754]/60">General range</p>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <div className={`px-4 py-2 rounded-full text-xs font-semibold ${
                        isOutOfRange 
                          ? 'bg-[#F4DFD7] text-[#5D3754]' 
                          : 'bg-[#FAF6F2] text-[#5D3754]/75'
                      }`}>
                        {m.value} {m.unit}
                      </div>
                      <ChevronRight size={16} className={`text-[#5D3754]/40 transition-transform ${isSelected ? 'translate-x-0.5 text-[#5D3754]' : ''}`} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Empathetic Translation & Trend (Image 2 style) */}
          <div className="lg:col-span-6 bg-white border border-[#F4DFD7] rounded-3xl p-8 space-y-8 shadow-sm">
            
            {/* Header */}
            <div className="space-y-2 border-b border-[#F4DFD7]/40 pb-4">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#8FA998] uppercase tracking-wider">
                <Sparkles size={13} className="text-[#8FA998]" />
                Empathetic Translation
              </span>
              <h2 className="font-serif text-2xl font-semibold text-[#5D3754]">
                Understanding your {selectedMarker ? selectedMarker.name : 'Markers'}
              </h2>
            </div>

            {selectedMarker ? (
              <div className="space-y-6 font-sans">
                {/* Empathetic explanation box */}
                <div className="bg-[#FAF6F2] border border-[#F4DFD7] rounded-2xl p-5 text-sm text-[#5D3754] leading-relaxed relative">
                  <div className="absolute top-4 right-4 text-xs font-bold uppercase tracking-wider text-[#8FA998]">
                    {selectedMarker.status}
                  </div>
                  <p className="font-medium text-[#5D3754] pr-12">
                    {selectedMarker.plainExplanation ?? 'No deep translation available for this marker yet.'}
                  </p>
                  {selectedMarker.trendNote && (
                    <p className="mt-4 text-xs text-[#5D3754]/80 border-t border-[#F4DFD7]/50 pt-3">
                      <strong>Trend Note:</strong> {selectedMarker.trendNote}
                    </p>
                  )}
                </div>

                {/* Trend Chart (Matching Image 2 styling) */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#5D3754]/85">
                      {selectedMarker.name} Trend (Last 12 Months)
                    </h3>
                    
                    {trendData.length >= 2 && (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold">
                        Trend active
                      </span>
                    )}
                  </div>

                  {loadingTrend ? (
                    <div className="skeleton h-24 w-full" />
                  ) : trendData.length >= 2 ? (
                    <div className="flex items-end gap-3 h-28 w-full border-b border-[#F4DFD7] pb-2 px-4 justify-around">
                      {trendData.slice(-3).map((pt, idx) => {
                        const maxVal = Math.max(...trendData.map(p => p.value));
                        const pct = maxVal > 0 ? (pt.value / maxVal) * 80 : 40;
                        return (
                          <div key={idx} className="flex flex-col items-center gap-1.5 w-16">
                            <div 
                              className="bg-[#5D3754] rounded-t-lg w-10 flex items-center justify-center relative transition-all duration-300"
                              style={{ height: `${Math.max(pct, 20)}px` }}
                            >
                              <span className="text-[10px] font-bold text-white absolute -top-4">{pt.value}</span>
                            </div>
                            <span className="text-[9px] text-[#5D3754]/60 font-semibold">{pt.date}</span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="bg-[#FAF6F2]/30 border border-[#F4DFD7]/40 rounded-xl p-4 text-center text-xs text-[#5D3754]/75">
                      No historical trends recorded yet. Upload future lab reports to build your marker timeline.
                    </div>
                  )}
                </div>

              </div>
            ) : (
              <div className="text-center py-12 text-sm text-[#5D3754]/60 italic">
                Select a marker on the left to read its translation and review trends.
              </div>
            )}

          </div>

        </div>

        {/* Advocacy Checklist */}
        {checklist.length > 0 && (
          <div className="animate-fade-up anim-delay-2">
            <AdvocacyChecklist questions={checklist} />
          </div>
        )}

        {/* Trend Prompt Banner */}
        <div className="bg-white border border-[#F4DFD7] rounded-3xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm animate-fade-up anim-delay-3">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="font-serif text-xl font-semibold text-[#5D3754]">Track these markers over time</h3>
            <p className="text-xs text-[#5D3754]/80">Upload future reports and Lumina will automatically map your healthy marker trends.</p>
          </div>
          <Link to="/history" className="w-full sm:w-auto text-center font-sans text-xs font-semibold bg-[#FAF6F2] hover:bg-[#F4DFD7] text-[#5D3754] px-6 py-3 rounded-full border border-[#F4DFD7] transition-colors">
            View My History
          </Link>
        </div>

        {/* Legal Medical Disclaimer */}
        <div className="flex gap-2.5 text-xs text-[#5D3754]/65 pt-6 leading-relaxed max-w-2xl mx-auto text-center justify-center">
          <Shield size={14} className="shrink-0 mt-0.5 text-[#8FA998]" />
          <p>
            Lumina is an educational tool. These insights do not replace professional medical advice, diagnosis, or treatment. Always discuss lab results with a qualified healthcare professional.
          </p>
        </div>

      </div>
    </div>
  );
}
