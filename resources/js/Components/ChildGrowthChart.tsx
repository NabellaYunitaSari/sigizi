import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface ChartPoint {
  tanggal: string;
  umur: string;
  berat: number;
  tinggi: number;
}

interface ChildGrowthChartProps {
  data: ChartPoint[];
}

export default function ChildGrowthChart({ data }: ChildGrowthChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-xs text-slate-400">
        Belum ada grafik riwayat pertumbuhan.
      </div>
    );
  }

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="tanggal" tick={{ fontSize: 11, fill: '#64748b' }} />
          <YAxis yAxisId="left" orientation="left" stroke="#0d9488" tick={{ fontSize: 11 }} domain={['dataMin - 1', 'dataMax + 1']} />
          <YAxis yAxisId="right" orientation="right" stroke="#0284c7" tick={{ fontSize: 11 }} domain={['dataMin - 2', 'dataMax + 2']} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#ffffff',
              borderRadius: '0.75rem',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              fontSize: '12px',
            }}
          />
          <Legend verticalAlign="top" height={36} iconType="plainline" />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="berat"
            name="Berat Badan (kg)"
            stroke="#0d9488"
            strokeWidth={3}
            dot={{ r: 5, fill: '#0d9488' }}
            activeDot={{ r: 7 }}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="tinggi"
            name="Tinggi Badan (cm)"
            stroke="#0284c7"
            strokeWidth={3}
            dot={{ r: 5, fill: '#0284c7' }}
            activeDot={{ r: 7 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
