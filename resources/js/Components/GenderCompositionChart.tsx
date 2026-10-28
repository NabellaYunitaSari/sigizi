import React from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { SERVICE_CHART_COLORS } from './ServiceBarChart';

interface GenderCompositionChartProps {
  data: { name: string; value: number }[];
}

interface SliceLabelProps {
  cx: number;
  cy: number;
  midAngle: number;
  outerRadius: number;
  percent: number;
  index: number;
}

function SliceLabel({ cx, cy, midAngle, outerRadius, percent, index }: SliceLabelProps) {
  if (percent < 0.05) return null;

  const radians = Math.PI / 180;
  const radius = outerRadius * 0.62;
  const x = cx + radius * Math.cos(-midAngle * radians);
  const y = cy + radius * Math.sin(-midAngle * radians);

  return <text x={x} y={y} textAnchor="middle" dominantBaseline="central" fill={index === 0 ? '#213827' : '#ffffff'} fontSize={16} fontWeight={600}>{Math.round(percent * 100)}%</text>;
}

export default function GenderCompositionChart({ data }: GenderCompositionChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <figure className="flex min-h-[340px] w-full flex-1 flex-col items-center justify-center gap-4">
      <figcaption className="sr-only">Komposisi balita berdasarkan jenis kelamin: {data.map(item => `${item.name} ${item.value} balita`).join(', ')}.</figcaption>
      <div className="h-[240px] w-full max-w-[300px] sm:h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius="88%" startAngle={90} endAngle={-270} stroke="#ffffff" strokeWidth={3} labelLine={false} label={SliceLabel} isAnimationActive={false}>
              {data.map((item, index) => <Cell key={item.name} fill={SERVICE_CHART_COLORS[index % SERVICE_CHART_COLORS.length]} />)}
            </Pie>
            <Tooltip formatter={(value: number, name: string) => [`${value} orang (${total ? Math.round(value / total * 100) : 0}%)`, name]} itemStyle={{ color: '#2b4530' }} contentStyle={{ borderRadius: 8, border: '1px solid #dfe3d8', fontSize: 12 }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul aria-label="Legenda komposisi balita" className="grid w-full max-w-[320px] grid-cols-2 gap-4 text-sm">
        {data.map((item, index) => (
          <li key={item.name} className="flex items-start justify-center gap-2">
            <span className="mt-1 h-3 w-3 shrink-0 rounded-[3px]" style={{ backgroundColor: SERVICE_CHART_COLORS[index % SERVICE_CHART_COLORS.length] }} />
            <div><p className="text-xs text-slate-500">{item.name}</p><p className="mt-1 font-semibold text-slate-800">{item.value} <span className="text-xs font-normal text-slate-500">balita</span></p></div>
          </li>
        ))}
      </ul>
    </figure>
  );
}
