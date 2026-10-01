import React from 'react';
import { usePage } from '@inertiajs/react';
import AppShell from '../../Components/AppShell';
import {
  CheckCircle2,
  TrendingUp,
  Award,
  Sparkles,
  BarChart2,
  Heart,
  Baby,
} from 'lucide-react';
import VillageComparisonBarChart from '../../Components/VillageComparisonBarChart';
import { UserSession } from '../../Components/Navbar';

interface DesaProps {
  barChartData: any[];
  trainingResults: any[];
  overallCoverage: number;
  stuntingRate: number;
  totalVillageAnak: number;
  totalVillageMeasured: number;
  totalVillageStunting: number;
  totalVillageBumil: number;
  totalVillageBumilKek: number;
}

export default function Desa({
  barChartData = [],
  trainingResults = [],
  overallCoverage,
  stuntingRate,
  totalVillageAnak,
  totalVillageMeasured,
  totalVillageStunting,
  totalVillageBumil,
  totalVillageBumilKek,
}: DesaProps) {
  const page = usePage();
  const user = (page.props as any).auth?.user as UserSession | null;

  return (
    <AppShell user={user}>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-brand-600 uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Monitoring Tingkat Desa • Sukomalo</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Dashboard Desa Sukomalo
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Visualisasi & Rekapitulasi Komparasi 6 Posyandu Wilayah Desa
            </p>
          </div>

          <div className="px-4 py-2 bg-emerald-50 border border-emerald-200/80 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>6 Posyandu Aktif Terkoneksi</span>
          </div>
        </div>

        {/* Top Village Key Performance Indicators */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Total Balita Desa</span>
              <Baby className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900">{totalVillageAnak} <span className="text-xs font-normal text-slate-500">anak</span></div>
            <div className="text-[11px] text-slate-400">Tersebar di 6 Dusun</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Cakupan Penimbangan</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-extrabold text-brand-600">{overallCoverage}%</div>
            <div className="text-[11px] text-slate-500">{totalVillageMeasured} dari {totalVillageAnak} balita diukur bulan ini</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Prevalensi Stunting</span>
              <TrendingUp className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-extrabold text-amber-700">{stuntingRate}%</div>
            <div className="text-[11px] text-amber-600 font-medium">{totalVillageStunting} anak terindikasi pendek/sangat pendek</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Total Ibu Hamil & KEK</span>
              <Heart className="w-4 h-4 text-rose-500" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900">{totalVillageBumil} <span className="text-xs font-normal text-slate-500">bumil</span></div>
            <div className="text-[11px] text-rose-600 font-semibold">{totalVillageBumilKek} bumil KEK (LiLA &lt; 23.5 cm)</div>
          </div>
        </div>

        {/* Horizontal Bar Chart Comparison */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div>
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-brand-600" />
              <span>Perbandingan Cakupan Penimbangan 6 Posyandu</span>
            </h3>
            <p className="text-xs text-slate-500">Grafik perbandingan total balita vs balita yang sudah ditimbang bulan ini</p>
          </div>

          <VillageComparisonBarChart data={barChartData} />
        </div>

        {/* Village Summary Recap Table */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-base">Rekapitulasi Per Posyandu</h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <th className="p-3 font-bold">Nama Posyandu</th>
                  <th className="p-3 font-bold">Dusun</th>
                  <th className="p-3 font-bold">Total Balita</th>
                  <th className="p-3 font-bold">Diukur Bulan Ini</th>
                  <th className="p-3 font-bold">Cakupan (%)</th>
                  <th className="p-3 font-bold">Jumlah Stunting</th>
                  <th className="p-3 font-bold">Ibu Hamil KEK</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {barChartData.map((pos) => {
                  const cov = pos.totalAnak > 0 ? Math.round((pos.sudahDiukur / pos.totalAnak) * 100) : 0;
                  return (
                    <tr key={pos.name} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 font-bold text-slate-900">Pos {pos.name}</td>
                      <td className="p-3 text-slate-500">{pos.dusun}</td>
                      <td className="p-3 font-semibold text-slate-800">{pos.totalAnak}</td>
                      <td className="p-3 font-bold text-brand-700">{pos.sudahDiukur}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${cov >= 75 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                          {cov}%
                        </span>
                      </td>
                      <td className="p-3 font-bold text-amber-700">{pos.stunting} anak</td>
                      <td className="p-3 font-bold text-rose-700">{pos.bumilKek} bumil</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Monitoring Pelatihan Pre-Test / Post-Test Kader */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                <span>Hasil Monitoring Pre-Test & Post-Test Pelatihan Kader</span>
              </h3>
              <p className="text-xs text-slate-500">Evaluasi peningkatan kompetensi kader antropometri</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {trainingResults.map((t) => {
              const delta = t.skor_posttest - t.skor_pretest;
              return (
                <div key={t.id} className="p-4 rounded-xl border border-slate-200/80 bg-slate-50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 text-sm">{t.user?.nama}</span>
                    <span className="px-2 py-0.5 bg-brand-100 text-brand-800 text-[10px] font-bold rounded-md">
                      Pos {t.user?.posyandu?.nama_pos || 'Desa'}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1 border-t border-slate-200/60">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Pre-Test</span>
                      <span className="font-bold text-slate-600">{t.skor_pretest}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Post-Test</span>
                      <span className="font-bold text-emerald-600">{t.skor_posttest}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Kenaikan</span>
                      <span className="font-bold text-brand-600">+{delta} pts</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
