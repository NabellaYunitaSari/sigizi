import React, { useState } from 'react';
import { usePage, router } from '@inertiajs/react';
import AppShell from '../../Components/AppShell';
import { DashboardContent, type DashboardProps } from './Index';
import {
  CheckCircle2,
  TrendingUp,
  BarChart2,
  Heart,
  Baby,
} from 'lucide-react';
import VillageComparisonBarChart from '../../Components/VillageComparisonBarChart';
import { UserSession } from '../../Components/Navbar';

interface DesaProps {
  posyandus: { id: string; nama_pos: string }[];
  selectedPosyanduId: string;
  posyanduDashboard: DashboardProps;
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
  posyandus,
  selectedPosyanduId,
  posyanduDashboard,
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
  const [filterLoading, setFilterLoading] = useState(false);

  return (
    <AppShell user={user}>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight">
              Informasi Kesehatan Desa Sukomalo
            </h1>
          </div>

        </div>

        {/* Top Village Key Performance Indicators */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Total Balita Desa</span>
              <Baby className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl font-semibold text-slate-900">{totalVillageAnak} <span className="text-xs font-normal text-slate-500">anak</span></div>
            <div className="text-[11px] text-slate-400">Tersebar di 6 Dusun</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Cakupan Penimbangan</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-semibold text-brand-600">{overallCoverage}%</div>
            <div className="text-[11px] text-slate-500">{totalVillageMeasured} dari {totalVillageAnak} balita diukur bulan ini</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Prevalensi Stunting</span>
              <TrendingUp className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-semibold text-amber-700">{stuntingRate}%</div>
            <div className="text-[11px] text-amber-600 font-medium">{totalVillageStunting} anak terindikasi pendek/sangat pendek</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Total Ibu Hamil & KEK</span>
              <Heart className="w-4 h-4 text-rose-500" />
            </div>
            <div className="text-2xl font-semibold text-slate-900">{totalVillageBumil} <span className="text-xs font-normal text-slate-500">bumil</span></div>
            <div className="text-[11px] text-rose-600 font-semibold">{totalVillageBumilKek} bumil KEK (LiLA &lt; 23.5 cm)</div>
          </div>
        </div>

        {/* Perbandingan pelayanan antarposyandu */}
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
        <section id="dashboard-posyandu" aria-labelledby="posyandu-filter-title" aria-busy={filterLoading} className="rounded-2xl border border-brand-200 bg-brand-50/30 p-4 sm:p-6">
          <DashboardContent
            key={selectedPosyanduId || 'all'}
            {...posyanduDashboard}
            embedded
            posyanduName={selectedPosyanduId ? `Posyandu ${posyandus.find(posyandu => posyandu.id === selectedPosyanduId)?.nama_pos || ''}` : 'Semua posyandu'}
            headerActions={
              <div className="w-full shrink-0 sm:w-60">
                <label htmlFor="dashboard-posyandu-filter" className="sr-only">Fokus posyandu</label>
                <select id="dashboard-posyandu-filter" value={selectedPosyanduId || ''} disabled={filterLoading} onChange={event => {
                  router.get('/dashboard-desa', event.target.value ? { posyandu: event.target.value } : {}, {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                    only: ['selectedPosyanduId', 'posyanduDashboard'],
                    onStart: () => setFilterLoading(true),
                    onFinish: () => setFilterLoading(false),
                  });
                }} className="min-h-[44px] w-full rounded-xl border border-brand-200 bg-white px-3 py-2 text-sm text-brand-900 disabled:opacity-60">
                  <option value="">Semua posyandu</option>
                  {posyandus.map(posyandu => <option key={posyandu.id} value={posyandu.id}>Posyandu {posyandu.nama_pos}</option>)}
                </select>
                {filterLoading && <p role="status" className="mt-2 text-xs text-brand-700">Memuat data posyandu...</p>}
              </div>
            }
          />
        </section>
      </div>
    </AppShell>
  );
}
