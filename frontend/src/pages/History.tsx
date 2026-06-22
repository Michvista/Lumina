import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp, Upload, FileText, Calendar,
  ChevronRight, Clock, AlertTriangle,
  Trash2, BarChart2
} from 'lucide-react';
import TrendChart from '../components/TrendChart';
import { useSession } from '../hooks/useSession';
import { getReports, getMarkerTrend, getAllMarkerNames, deleteReport } from '../lib/api';
import { Report, TrendPoint } from '../types';
import { format } from 'date-fns';

export default function History() {
  const { sessionId, ready } = useSession();
  const [reports, setReports] = useState<Report[]>([]);
  const [markerNames, setMarkerNames] = useState<{ name: string; displayName: string; unit: string }[]>([]);
  const [selectedMarker, setSelectedMarker] = useState<string>('');
  const [trendData, setTrendData] = useState<TrendPoint[]>([]);
  const [loadingReports, setLoadingReports] = useState(true);
  const [loadingTrend, setLoadingTrend] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'reports' | 'trends'>('reports');

  // Load reports + marker names
  useEffect(() => {
    if (!ready || !sessionId) return;

    Promise.all([
      getReports(sessionId),
      getAllMarkerNames(sessionId),
    ]).then(([r, m]) => {
      setReports(r);
      setMarkerNames(m);
      if (m.length > 0) setSelectedMarker(m[0].name);
    }).catch(console.error)
      .finally(() => setLoadingReports(false));
  }, [ready, sessionId]);

  // Load trend data when selected marker changes
  useEffect(() => {
    if (!sessionId || !selectedMarker) return;
    setLoadingTrend(true);
    getMarkerTrend(sessionId, selectedMarker)
      .then(setTrendData)
      .catch(() => setTrendData([]))
      .finally(() => setLoadingTrend(false));
  }, [sessionId, selectedMarker]);

  const handleDelete = async (reportId: string) => {
    if (!confirm('Delete this report? This cannot be undone.')) return;
    setDeletingId(reportId);
    try {
      await deleteReport(reportId);
      setReports(prev => prev.filter(r => r.id !== reportId));
    } catch {
      alert('Failed to delete report.');
    } finally {
      setDeletingId(null);
    }
  };

  const selectedMarkerMeta = markerNames.find(m => m.name === selectedMarker);
  const completedReports = reports.filter(r => r.status === 'COMPLETE');
  const processingReports = reports.filter(r => r.status !== 'COMPLETE' && r.status !== 'FAILED');

  if (!loadingReports && reports.length === 0) {
    return (
      <div className="bg-[#FAF6F2] min-h-screen py-16 px-6 flex items-center justify-center">
        <div className="max-w-md w-full bg-white border border-[#F4DFD7] rounded-3xl p-8 text-center space-y-6 shadow-sm animate-fade-up">
          <div className="w-16 h-16 rounded-full bg-[#8FA998]/10 flex items-center justify-center text-[#8FA998] mx-auto">
            <BarChart2 size={32} />
          </div>
          <div className="space-y-1">
            <h2 className="font-serif text-2xl font-semibold text-[#5D3754]">No reports yet</h2>
            <p className="text-xs text-[#5D3754]/80">Upload your first lab report to start tracking your health markers over time.</p>
          </div>
          <Link
            to="/upload"
            className="inline-flex items-center gap-2 bg-[#5D3754] hover:bg-[#4C2C44] text-[#FAF6F2] font-semibold px-6 py-3.5 rounded-full shadow transition-all duration-200 hover:-translate-y-0.5"
          >
            <Upload size={16} />
            Upload Your First Report
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FAF6F2] min-h-screen text-[#2A1A24] py-12 px-6">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-[#F4DFD7]/60 pb-6 animate-fade-up">
          <div className="space-y-1">
            <h1 className="font-serif text-4xl font-semibold text-[#5D3754]">Your Health History</h1>
            <p className="text-xs text-[#5D3754]/75">
              {completedReports.length} report{completedReports.length !== 1 ? 's' : ''} ·{' '}
              {markerNames.length} unique marker{markerNames.length !== 1 ? 's' : ''} tracked
            </p>
          </div>
          
          <Link
            to="/upload"
            className="inline-flex items-center gap-1.5 font-sans text-xs font-semibold bg-[#5D3754] hover:bg-[#4C2C44] text-[#FAF6F2] px-5 py-3 rounded-full shadow-md transition-all duration-200 hover:-translate-y-0.5"
          >
            <Upload size={14} />
            New Report
          </Link>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-[#F4DFD7]/40 gap-6 animate-fade-up anim-delay-1">
          <button
            onClick={() => setActiveTab('reports')}
            className={`font-sans text-sm font-semibold pb-3.5 transition-all relative ${
              activeTab === 'reports' 
                ? 'text-[#5D3754] border-b-2 border-[#5D3754]' 
                : 'text-[#5D3754]/60 hover:text-[#5D3754]'
            }`}
          >
            Reports ({reports.length})
          </button>
          
          <button
            onClick={() => setActiveTab('trends')}
            disabled={markerNames.length === 0}
            className={`font-sans text-sm font-semibold pb-3.5 transition-all relative disabled:opacity-40 disabled:cursor-not-allowed ${
              activeTab === 'trends' 
                ? 'text-[#5D3754] border-b-2 border-[#5D3754]' 
                : 'text-[#5D3754]/60 hover:text-[#5D3754]'
            }`}
          >
            Trend Charts ({markerNames.length})
          </button>
        </div>

        {/* Reports Tab Content */}
        {activeTab === 'reports' && (
          <div className="space-y-6 animate-fade-in">
            {loadingReports ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="skeleton h-20 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {processingReports.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-xs font-bold text-[#8FA998] uppercase tracking-wider">Processing</p>
                    {processingReports.map(r => (
                      <ReportRow
                        key={r.id}
                        report={r}
                        onDelete={handleDelete}
                        deletingId={deletingId}
                      />
                    ))}
                  </div>
                )}

                <div className="space-y-3">
                  {processingReports.length > 0 && (
                    <p className="text-xs font-bold text-[#8FA998] uppercase tracking-wider">Completed</p>
                  )}
                  {completedReports.map(r => (
                    <ReportRow
                      key={r.id}
                      report={r}
                      onDelete={handleDelete}
                      deletingId={deletingId}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Trends Tab Content */}
        {activeTab === 'trends' && (
          <div className="bg-white border border-[#F4DFD7] rounded-3xl p-8 space-y-8 animate-fade-in">
            {markerNames.length === 0 ? (
              <p className="text-center text-xs text-[#5D3754]/60 py-6 italic">No marker history yet. Complete your first report to see trends.</p>
            ) : (
              <>
                {/* Marker Pills Selector */}
                <div className="space-y-3">
                  <p className="text-xs font-bold text-[#5D3754]/80 uppercase tracking-wide flex items-center gap-1.5">
                    <TrendingUp size={14} className="text-[#8FA998]" />
                    Select a marker to view timeline:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {markerNames.map(m => (
                      <button
                        key={m.name}
                        onClick={() => setSelectedMarker(m.name)}
                        className={`text-xs font-semibold px-4 py-2 rounded-full border transition-all duration-200 ${
                          selectedMarker === m.name
                            ? 'bg-[#5D3754] text-[#FAF6F2] border-[#5D3754]'
                            : 'bg-[#FAF6F2] hover:bg-[#FAF6F2]/80 text-[#5D3754] border-[#F4DFD7]'
                        }`}
                      >
                        {m.name}
                        <span className={`text-[10px] ml-1.5 opacity-60 ${selectedMarker === m.name ? 'text-white' : 'text-[#5D3754]'}`}>
                          ({m.unit})
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Trend Chart Area */}
                <div className="bg-[#FAF6F2]/45 border border-[#F4DFD7] rounded-2xl p-6">
                  {loadingTrend ? (
                    <div className="skeleton h-72 w-full" />
                  ) : (
                    <TrendChart
                      data={trendData}
                      markerName={selectedMarker}
                      displayName={selectedMarkerMeta?.displayName}
                    />
                  )}
                </div>

                {/* Narrative Trend Insight */}
                {!loadingTrend && trendData.length >= 2 && (
                  <TrendInsight
                    data={trendData}
                    markerName={selectedMarker}
                    unit={selectedMarkerMeta?.unit ?? ''}
                  />
                )}
              </>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

// ── SUB COMPONENTS ──────────────────────────────────────────────────────────

function ReportRow({
  report, onDelete, deletingId,
}: {
  report: Report;
  onDelete: (id: string) => void;
  deletingId: string | null;
}) {
  const isDeleting = deletingId === report.id;
  const isProcessing = report.status !== 'COMPLETE' && report.status !== 'FAILED';
  const isFailed = report.status === 'FAILED';

  const criticalCount = report.markers.filter(
    m => m.status === 'CRITICAL_LOW' || m.status === 'CRITICAL_HIGH',
  ).length;
  const flaggedCount = report.markers.filter(
    m => m.status === 'LOW' || m.status === 'HIGH',
  ).length;

  return (
    <div className={`bg-white border border-[#F4DFD7] rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-200 ${
      isDeleting ? 'opacity-40 pointer-events-none' : 'hover:shadow-sm'
    }`}>
      
      {/* Icon and Details */}
      <div className="flex items-start gap-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
          isFailed 
            ? 'bg-red-50 text-red-500' 
            : isProcessing 
              ? 'bg-[#FAF6F2]' 
              : 'bg-[#8FA998]/10 text-[#8FA998]'
        }`}>
          {isProcessing ? (
            <div className="spinner spinner--sm" />
          ) : isFailed ? (
            <AlertTriangle size={18} />
          ) : (
            <FileText size={18} />
          )}
        </div>

        <div className="space-y-1">
          <p className="font-serif text-base font-semibold text-[#5D3754] leading-tight truncate max-w-xs sm:max-w-md">
            {report.fileName}
          </p>
          
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#5D3754]/65">
            <span className="flex items-center gap-1">
              <Clock size={12} className="text-[#8FA998]" />
              {format(new Date(report.createdAt), 'MMM d, yyyy · h:mm a')}
            </span>
            {report.cycleDay && (
              <>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Calendar size={12} className="text-[#8FA998]" />
                  Day {report.cycleDay}
                </span>
              </>
            )}
            {report.status === 'COMPLETE' && (
              <>
                <span>·</span>
                <span>{report.markers.length} markers</span>
              </>
            )}
            {isProcessing && (
              <>
                <span>·</span>
                <span className="text-[#5D3754] font-semibold uppercase text-[10px] tracking-wider animate-pulse">
                  {report.status.toLowerCase()}...
                </span>
              </>
            )}
          </div>

          {/* Alert badges */}
          {report.status === 'COMPLETE' && (criticalCount > 0 || flaggedCount > 0) && (
            <div className="flex gap-2 pt-1">
              {criticalCount > 0 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-50 border border-red-200 text-red-600 text-[10px] font-semibold">
                  <AlertTriangle size={10} />
                  {criticalCount} critical
                </span>
              )}
              {flaggedCount > 0 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-600 text-[10px] font-semibold">
                  {flaggedCount} flagged
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Row Actions */}
      <div className="flex items-center justify-end gap-3 self-end sm:self-auto">
        {report.status === 'COMPLETE' && (
          <Link
            to={`/results/${report.id}`}
            className="inline-flex items-center gap-1 bg-[#FAF6F2] hover:bg-[#F4DFD7] text-[#5D3754] border border-[#F4DFD7] text-xs font-semibold px-4 py-2 rounded-full transition-colors"
          >
            View
            <ChevronRight size={12} />
          </Link>
        )}
        
        <button
          onClick={() => onDelete(report.id)}
          disabled={isDeleting}
          className="w-8 h-8 rounded-full flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
          title="Delete report"
        >
          <Trash2 size={15} />
        </button>
      </div>

    </div>
  );
}

function TrendInsight({ data, markerName, unit }: { data: TrendPoint[]; markerName: string; unit: string }) {
  const first = data[0];
  const last = data[data.length - 1];
  const diff = last.value - first.value;
  const pct = Math.abs(((diff / first.value) * 100)).toFixed(0);
  const direction = diff > 0 ? 'risen' : diff < 0 ? 'fallen' : 'stayed stable';
  const isWorrying = (diff > 0 && last.status === 'HIGH') || (diff < 0 && last.status === 'LOW');

  return (
    <div className="bg-[#FAF6F2] border border-[#F4DFD7] rounded-2xl p-5 flex gap-3 text-sm text-[#5D3754] animate-fade-in">
      <TrendingUp size={18} className="text-[#8FA998] shrink-0 mt-0.5" />
      <div className="space-y-1">
        <p className="font-semibold">Trend insight for {markerName}</p>
        <p className="text-xs text-[#5D3754]/85 leading-relaxed">
          Your {markerName} has <strong>{direction}</strong> by{' '}
          <strong>{Math.abs(+diff.toFixed(2))} {unit}</strong> ({pct}%) since your first recorded report
          {isWorrying ? ' — this trend is worth pointing out to your provider.' : '.'}
        </p>
      </div>
    </div>
  );
}
