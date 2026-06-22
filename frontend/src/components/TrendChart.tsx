import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer, ReferenceArea
} from 'recharts';
import { TrendPoint, MarkerStatus } from '../types';

interface TrendChartProps {
  data: TrendPoint[];
  markerName: string;
  displayName?: string;
}

const STATUS_COLORS: Record<MarkerStatus, string> = {
  NORMAL:        '#34d399',
  LOW:           '#60a5fa',
  HIGH:          '#fbbf24',
  CRITICAL_LOW:  '#f87171',
  CRITICAL_HIGH: '#f87171',
  UNKNOWN:       '#94a3b8',
};

function CustomDot(props: {
  cx?: number; cy?: number;
  payload?: TrendPoint;
}) {
  const { cx, cy, payload } = props;
  if (!cx || !cy || !payload) return null;
  const color = STATUS_COLORS[payload.status] ?? '#94a3b8';
  return (
    <g>
      <circle cx={cx} cy={cy} r={10} fill={color} stroke={color} strokeWidth={2} opacity={0.15} />
      <circle cx={cx} cy={cy} r={5} fill={color} stroke="#FAF6F2" strokeWidth={2} />
    </g>
  );
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: { payload: TrendPoint }[];
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const color = STATUS_COLORS[d.status] ?? '#94a3b8';

  return (
    <div className="bg-white border border-[#F4DFD7] rounded-xl shadow-lg p-3 text-xs space-y-1 font-sans">
      <p className="font-bold text-[#5D3754]/80">{d.date}</p>
      <p className="font-bold text-base" style={{ color }}>
        {d.value} <span className="text-[10px] font-normal text-[#5D3754]/60">{d.unit}</span>
      </p>
      {d.refLow != null && d.refHigh != null && (
        <p className="text-[#5D3754]/60">Ref: {d.refLow}–{d.refHigh} {d.unit}</p>
      )}
      {d.cycleDay && (
        <p className="text-[#8FA998]">Day {d.cycleDay} of cycle</p>
      )}
    </div>
  );
}

export default function TrendChart({ data, markerName, displayName }: TrendChartProps) {
  if (data.length === 0) {
    return (
      <div className="text-center py-12 space-y-1">
        <p className="font-serif text-lg text-[#5D3754]/80">Not enough data yet</p>
        <p className="text-xs text-[#5D3754]/55">Upload more reports to see {markerName} over time.</p>
      </div>
    );
  }

  const refEntry = data.find(d => d.refLow != null && d.refHigh != null);
  const refLow  = refEntry?.refLow;
  const refHigh = refEntry?.refHigh;
  const unit = data[0].unit;

  const values = data.map(d => d.value);
  const allVals = [...values, ...(refLow != null ? [refLow] : []), ...(refHigh != null ? [refHigh] : [])];
  const minVal = Math.min(...allVals);
  const maxVal = Math.max(...allVals);
  const pad = (maxVal - minVal) * 0.25 || 1;
  const yMin = Math.max(0, +(minVal - pad).toFixed(2));
  const yMax = +(maxVal + pad).toFixed(2);

  return (
    <div className="space-y-4">
      {/* Chart header */}
      <div className="flex items-center justify-between">
        <span className="font-serif text-lg font-semibold text-[#5D3754]">{displayName ?? markerName}</span>
        <span className="text-xs text-[#5D3754]/60 bg-[#FAF6F2] border border-[#F4DFD7] px-3 py-1 rounded-full">{unit}</span>
      </div>

      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data} margin={{ top: 12, right: 20, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="lineGradLumina" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#5D3754" />
              <stop offset="100%" stopColor="#8FA998" />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="rgba(93, 55, 84, 0.06)" />

          <XAxis
            dataKey="date"
            tick={{ fill: '#9b8090', fontSize: 10, fontFamily: 'Inter, sans-serif' }}
            axisLine={{ stroke: 'rgba(93, 55, 84, 0.1)' }}
            tickLine={false}
            tickFormatter={(d: string) => d.slice(5)}
          />
          <YAxis
            domain={[yMin, yMax]}
            tick={{ fill: '#9b8090', fontSize: 10, fontFamily: 'Inter, sans-serif' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => String(+v.toFixed(1))}
          />

          <Tooltip content={<CustomTooltip />} />

          {refLow != null && refHigh != null && (
            <ReferenceArea
              y1={refLow} y2={refHigh}
              fill="rgba(143, 169, 152, 0.1)"
              stroke="rgba(143, 169, 152, 0.3)"
              strokeDasharray="4 4"
            />
          )}
          {refLow != null && (
            <ReferenceLine
              y={refLow}
              stroke="rgba(143, 169, 152, 0.5)"
              strokeDasharray="5 3"
              label={{ value: `Low ${refLow}`, position: 'insideTopLeft', fill: '#8FA998', fontSize: 10 }}
            />
          )}
          {refHigh != null && (
            <ReferenceLine
              y={refHigh}
              stroke="rgba(251,191,36,0.5)"
              strokeDasharray="5 3"
              label={{ value: `High ${refHigh}`, position: 'insideBottomLeft', fill: '#b38a00', fontSize: 10 }}
            />
          )}

          <Line
            type="monotone"
            dataKey="value"
            stroke="url(#lineGradLumina)"
            strokeWidth={2.5}
            dot={<CustomDot />}
            activeDot={{ r: 7, fill: '#5D3754', stroke: '#FAF6F2', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>

      {data.length === 1 && (
        <p className="text-center text-xs text-[#5D3754]/60 italic">
          Only one data point so far. Upload another report to see your trend over time.
        </p>
      )}
    </div>
  );
}
