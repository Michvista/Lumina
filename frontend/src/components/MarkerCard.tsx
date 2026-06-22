import { useState } from 'react';
import { ChevronDown, TrendingUp, TrendingDown, Minus, AlertTriangle } from 'lucide-react';
import { Marker, MarkerStatus } from '../types';

interface MarkerCardProps {
  marker: Marker;
  index?: number;
}

const STATUS_CONFIG: Record<MarkerStatus, { label: string; colorClass: string; barColor: string; bgClass: string }> = {
  NORMAL:        { label: 'Normal',        colorClass: 'text-emerald-600',  barColor: '#34d399', bgClass: 'bg-emerald-50 border-emerald-200' },
  LOW:           { label: 'Low',           colorClass: 'text-blue-600',     barColor: '#60a5fa', bgClass: 'bg-blue-50 border-blue-200' },
  HIGH:          { label: 'High',          colorClass: 'text-amber-600',    barColor: '#fbbf24', bgClass: 'bg-amber-50 border-amber-200' },
  CRITICAL_LOW:  { label: 'Critical Low',  colorClass: 'text-red-600',      barColor: '#f87171', bgClass: 'bg-red-50 border-red-200' },
  CRITICAL_HIGH: { label: 'Critical High', colorClass: 'text-red-600',      barColor: '#f87171', bgClass: 'bg-red-50 border-red-200' },
  UNKNOWN:       { label: 'Unknown',       colorClass: 'text-slate-500',    barColor: '#94a3b8', bgClass: 'bg-slate-50 border-slate-200' },
};

function getBarPercent(marker: Marker): number {
  const { value, refLow, refHigh } = marker;
  if (refLow == null || refHigh == null) return 50;
  const range = refHigh - refLow;
  if (range <= 0) return 50;
  const extended = range * 0.3;
  const min = refLow - extended;
  const max = refHigh + extended;
  const pct = ((value - min) / (max - min)) * 100;
  return Math.min(Math.max(pct, 2), 98);
}

function TrendIcon({ note }: { note: string }) {
  const lower = note.toLowerCase();
  if (lower.includes('creep') || lower.includes('rising') || lower.includes('up') || lower.includes('increas')) {
    return <TrendingUp size={13} />;
  }
  if (lower.includes('down') || lower.includes('decreas') || lower.includes('lower')) {
    return <TrendingDown size={13} />;
  }
  return <Minus size={13} />;
}

export default function MarkerCard({ marker, index = 0 }: MarkerCardProps) {
  const [expanded, setExpanded] = useState(false);
  const cfg = STATUS_CONFIG[marker.status] ?? STATUS_CONFIG.UNKNOWN;
  const barPct = getBarPercent(marker);
  const isCritical = marker.status === 'CRITICAL_LOW' || marker.status === 'CRITICAL_HIGH';

  return (
    <div
      className={`border rounded-2xl overflow-hidden transition-all duration-200 animate-fade-up ${
        isCritical
          ? 'border-red-200 bg-red-50/30'
          : 'border-[#F4DFD7]/70 bg-white hover:border-[#5D3754]/20 hover:shadow-sm'
      }`}
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      {/* ── Header row */}
      <div
        className="flex items-center gap-3 px-5 py-4 cursor-pointer select-none"
        onClick={() => setExpanded(e => !e)}
      >
        {isCritical && (
          <AlertTriangle size={15} className="text-red-500 shrink-0" />
        )}

        <div className="flex-1 min-w-0">
          <p className="font-serif text-base font-semibold text-[#5D3754] truncate">{marker.displayName}</p>
          <p className="text-xs text-[#5D3754]/60 mt-0.5">{marker.name}</p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <span className="font-bold text-sm text-[#5D3754]">{marker.value}</span>
            <span className="text-xs text-[#5D3754]/60 ml-1">{marker.unit}</span>
          </div>

          <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${cfg.bgClass} ${cfg.colorClass}`}>
            {cfg.label}
          </span>

          <ChevronDown
            size={16}
            className={`text-[#5D3754]/50 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}
          />
        </div>
      </div>

      {/* ── Range bar */}
      {(marker.refLow != null || marker.refHigh != null) && (
        <div className="px-5 pb-3">
          <div className="relative h-1.5 bg-[#FAF6F2] rounded-full overflow-visible border border-[#F4DFD7]">
            {/* Normal zone highlight */}
            {marker.refLow != null && marker.refHigh != null && (
              <div
                className="absolute top-0 h-full bg-emerald-100 rounded-full"
                style={{ left: '23%', width: '54%' }}
              />
            )}
            {/* Indicator dot */}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-white shadow-sm transition-all duration-300"
              style={{
                left: `${barPct}%`,
                transform: 'translate(-50%, -50%)',
                backgroundColor: cfg.barColor,
              }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-[#5D3754]/55 mt-1.5">
            {marker.refLow != null && <span>{marker.refLow} {marker.unit}</span>}
            {marker.refHigh != null && <span>{marker.refHigh} {marker.unit}</span>}
          </div>
        </div>
      )}

      {/* ── Expanded explanation */}
      {expanded && (
        <div className="px-5 pb-5 pt-1 border-t border-[#F4DFD7]/50 space-y-3 animate-fade-in">
          {marker.plainExplanation && (
            <div className="bg-[#FAF6F2] rounded-xl p-4 text-xs text-[#5D3754]/95 leading-relaxed">
              {marker.plainExplanation}
            </div>
          )}

          {marker.trendNote && (
            <div className="flex items-start gap-2 text-xs text-[#5D3754]/80">
              <span className="mt-0.5 text-[#8FA998]">
                <TrendIcon note={marker.trendNote} />
              </span>
              <p className="leading-relaxed">{marker.trendNote}</p>
            </div>
          )}

          {!marker.plainExplanation && !marker.trendNote && (
            <p className="text-xs text-[#5D3754]/55 italic">No additional context available for this marker.</p>
          )}
        </div>
      )}
    </div>
  );
}
