import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface ChartItem {
  name: string;
  value: number;
}

interface NutritionDonutChartProps {
  data: ChartItem[];
}

const COLORS: Record<string, string> = {
  'Normal': '#10b981',
  'Gizi Kurang / Pendek': '#f59e0b',
  'Gizi Buruk / Sangat Pendek': '#ef4444',
  'Risiko Gizi Lebih / Obesitas': '#06b6d4',
};

export default function NutritionDonutChart({ data }: NutritionDonutChartProps) {
  const activeData = data ? data.filter((d) => d.value > 0) : [];

  if (activeData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-xs text-slate-400">
        Belum ada data grafik
      </div>
    );
  }

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={activeData}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={4}
            dataKey="value"
          >
            {activeData.map((entry) => (
              <Cell
                key={`cell-${entry.name}`}
                fill={COLORS[entry.name] || '#94a3b8'}
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => [`${value} Balita`, 'Jumlah']}
            contentStyle={{
              backgroundColor: '#ffffff',
              borderRadius: '0.75rem',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              fontSize: '12px',
            }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            formatter={(value) => (
              <span className="text-xs text-slate-600 font-medium">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
