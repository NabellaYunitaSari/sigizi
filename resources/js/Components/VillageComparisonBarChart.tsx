import React from 'react';
import ServiceBarChart from './ServiceBarChart';

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
    <ServiceBarChart
      data={data.map(row => ({ ...row }))}
      description="Perbandingan pelayanan balita antarposyandu"
      unit="balita"
      minWidth={680}
      series={[
        { key: 'totalAnak', label: 'Balita terdaftar' },
        { key: 'sudahDiukur', label: 'Sudah diukur bulan ini' },
        { key: 'stunting', label: 'TB/U pendek atau sangat pendek' },
      ]}
    />
  );
}
