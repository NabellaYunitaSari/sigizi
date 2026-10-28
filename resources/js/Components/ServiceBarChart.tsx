import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts';

export const SERVICE_CHART_COLORS = ['#9dbb94', '#496a43', '#2b4530', '#c1d7b9', '#7a9e71', '#395636', '#5e8255'];

interface ChartSeries {
  key: string;
  label: string;
  color?: string;
}

interface ServiceBarChartProps {
  data: Record<string, string | number>[];
  series: ChartSeries[];
  categoryKey?: string;
  description: string;
  unit?: string;
  minWidth?: number;
  maxValue?: number;
  onBarClick?: (key: string) => void;
}

interface ValueLabelProps {
  x?: number | string;
  y?: number | string;
  width?: number | string;
  value?: number | string;
  suffix?: string;
}

function ValueLabel({ x, y, width, value, suffix = '' }: ValueLabelProps) {
  const label = `${Number(value).toLocaleString('id-ID')}${suffix}`;
  if (!Number.isFinite(Number(value))) return null;
  const labelWidth = Math.max(24, label.length * 6 + 12);
  const center = Number(x) + Number(width) / 2;

  return (
    <g aria-hidden="true">
      <rect x={center - labelWidth / 2} y={Number(y) - 23} width={labelWidth} height={18} rx={4} fill="#eff5ed" />
      <text x={center} y={Number(y) - 11} textAnchor="middle" fill="#303b2c" fontSize={10} fontWeight={600}>{label}</text>
    </g>
  );
}

export default function ServiceBarChart({
  data,
  series,
  categoryKey = 'name',
  description,
  unit = 'orang',
  minWidth = 420,
  maxValue,
  onBarClick,
}: ServiceBarChartProps) {
  return (
    <figure className="w-full min-w-0">
      <figcaption className="sr-only">{description}. {data.map(row => `${row[categoryKey]}: ${series.map(item => `${item.label} ${row[item.key]} ${unit}`).join(', ')}`).join('; ')}</figcaption>
      <ul aria-label="Legenda grafik" className="mb-3 flex flex-wrap justify-center gap-x-4 gap-y-2 text-[11px] leading-5 text-[#687361]">
        {series.map((item, index) => (
          <li key={item.key} className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 shrink-0 rounded-[3px] border border-black/5" style={{ backgroundColor: item.color || SERVICE_CHART_COLORS[index % SERVICE_CHART_COLORS.length] }} />
            {onBarClick ? <button type="button" onClick={() => onBarClick(item.key)} className="rounded px-1 py-1 text-left underline decoration-dotted underline-offset-4 hover:text-[#2b4530]" aria-label={`Lihat rincian ${item.label}`}>{item.label}</button> : item.label}
          </li>
        ))}
      </ul>
      <div className="overflow-x-auto overscroll-x-contain pb-1" role="region" aria-label={description} tabIndex={0}>
        <div className="h-[300px] w-full" style={{ minWidth }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 30, right: 20, left: -20, bottom: 10 }} barGap={6} barCategoryGap="24%">
              <CartesianGrid vertical={false} stroke="#e5e9df" />
              <XAxis dataKey={categoryKey} tick={{ fontSize: 11, fill: '#687361' }} axisLine={{ stroke: '#dfe3d8' }} tickLine={false} interval={0} tickMargin={12} height={44} />
              <YAxis domain={maxValue ? [0, maxValue] : undefined} allowDecimals={false} tick={{ fontSize: 10, fill: '#687361' }} axisLine={false} tickLine={false} tickFormatter={value => `${Number(value).toLocaleString('id-ID')}${unit === '%' ? '%' : ''}`} />
              <Tooltip cursor={{ fill: '#f7f8f3' }} formatter={(value: number, name: string) => [`${Number(value).toLocaleString('id-ID')} ${unit}`, name]} contentStyle={{ borderRadius: 8, border: '1px solid #dfe3d8', fontSize: 12, boxShadow: '0 4px 16px rgb(43 69 48 / 6%)' }} />
              {series.map((item, index) => (
                <Bar key={item.key} dataKey={item.key} name={item.label} fill={item.color || SERVICE_CHART_COLORS[index % SERVICE_CHART_COLORS.length]} radius={[4, 4, 0, 0]} maxBarSize={34} isAnimationActive={false} onClick={onBarClick ? () => onBarClick(item.key) : undefined} className={onBarClick ? 'cursor-pointer' : undefined}>
                  <LabelList dataKey={item.key} content={<ValueLabel suffix={unit === '%' ? '%' : ''} />} />
                </Bar>
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <p className="mt-1 text-center text-[10px] text-slate-500 sm:hidden">Geser grafik ke samping untuk melihat seluruh data.</p>
    </figure>
  );
}
