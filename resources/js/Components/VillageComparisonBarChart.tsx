import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface VillageBarData {
  name: string;
  totalAnak: number;
  sudahDiukur: number;
  stunting: number;
}

interface VillageComparisonBarChartProps {
  data: VillageBarData[];
}

export default function VillageComparisonBarChart({ data }: VillageComparisonBarChartProps) {
  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={data}
          margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} />
          <YAxis dataKey="name" type="category" tick={{ fontSize: 12, fill: '#1e293b', fontWeight: 'bold' }} width={80} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#ffffff',
              borderRadius: '0.75rem',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              fontSize: '12px',
            }}
          />
          <Legend verticalAlign="top" height={36} />
          <Bar dataKey="totalAnak" name="Total Balita Registered" fill="#94a3b8" radius={[0, 4, 4, 0]} barSize={14} />
          <Bar dataKey="sudahDiukur" name="Sudah Diukur Bulan Ini" fill="#0d9488" radius={[0, 4, 4, 0]} barSize={14} />
          <Bar dataKey="stunting" name="Anak Stunting (TB/U Pendek)" fill="#f59e0b" radius={[0, 4, 4, 0]} barSize={14} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
