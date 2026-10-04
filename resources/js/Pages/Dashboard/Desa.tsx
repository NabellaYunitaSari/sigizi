import React, { useState } from 'react';
import { usePage, Link } from '@inertiajs/react';
import AppShell from '../../Components/AppShell';
import {
  CheckCircle2,
  TrendingUp,
  BarChart2,
  Heart,
  Baby,
  Utensils,
  AlertTriangle,
  Phone,
  ArrowRight,
  ShieldAlert,
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
  pmtAnakList?: any[];
  pmtBumilList?: any[];
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
  pmtAnakList = [],
  pmtBumilList = [],
}: DesaProps) {
  const page = usePage();
  const user = (page.props as any).auth?.user as UserSession | null;
  const [activeTab, setActiveTab] = useState<'anak' | 'bumil'>('anak');

  return (
    <AppShell user={user}>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
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

        {/* DAFTAR SASARAN PMT (ROLE BIDAN DESA / KOORDINATOR) */}
        <div className="bg-white p-5 rounded-2xl border border-amber-200/80 shadow-sm space-y-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-full blur-2xl -z-10 pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center space-x-2 text-xs font-semibold text-amber-700 uppercase tracking-wider mb-1">
                <Utensils className="w-4 h-4 text-amber-600" />
                <span>Intervensi Gizi Bidan Desa</span>
              </div>
              <h3 className="font-bold text-slate-900 text-lg sm:text-xl flex items-center gap-2">
                <span>Daftar Target PMT (Pemberian Makanan Tambahan)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Daftar balita indikasi stunting / gizi kurang & ibu hamil KEK yang wajib menerima PMT Pemulihan
              </p>
            </div>

            {/* Tab Selector */}
            <div className="flex items-center p-1 bg-slate-100 rounded-xl self-start md:self-auto shrink-0">
              <button
                onClick={() => setActiveTab('anak')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 min-h-[36px] ${
                  activeTab === 'anak'
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Baby className="w-3.5 h-3.5" />
                <span>Balita PMT ({pmtAnakList.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('bumil')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 min-h-[36px] ${
                  activeTab === 'bumil'
                    ? 'bg-rose-500 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Heart className="w-3.5 h-3.5" />
                <span>Ibu Hamil KEK ({pmtBumilList.length})</span>
              </button>
            </div>
          </div>

          {/* TAB 1: BALITA PMT */}
          {activeTab === 'anak' && (
            <div>
              {pmtAnakList.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                  <p className="text-sm font-bold text-slate-700">Tidak ada balita yang membutuhkan PMT saat ini.</p>
                  <p className="text-xs text-slate-500">Seluruh balita terpantau berada dalam batas antropometri normal.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-amber-50/60 text-slate-700 border-b border-amber-100">
                        <th className="p-3 font-bold">Nama Balita</th>
                        <th className="p-3 font-bold">Posyandu & Dusun</th>
                        <th className="p-3 font-bold">Usia & Antropometri</th>
                        <th className="p-3 font-bold">Indikasi Masalah Gizi</th>
                        <th className="p-3 font-bold">Orang Tua / Kontak</th>
                        <th className="p-3 font-bold">Rekomendasi Intervensi</th>
                        <th className="p-3 font-bold text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {pmtAnakList.map((anak) => (
                        <tr key={anak.id} className="hover:bg-amber-50/20 transition-colors">
                          <td className="p-3">
                            <div className="font-bold text-slate-900">{anak.nama_anak}</div>
                            <div className="text-[10px] text-slate-500">NIK: {anak.nik} ({anak.jenis_kelamin})</div>
                          </td>
                          <td className="p-3">
                            <div className="font-semibold text-slate-800">{anak.posyandu}</div>
                            <div className="text-[10px] text-slate-500">{anak.dusun}</div>
                          </td>
                          <td className="p-3">
                            <div className="font-bold text-slate-800">{anak.umur_bulan} bulan</div>
                            <div className="text-[10px] text-slate-500">BB: {anak.berat_kg} kg | TB: {anak.tinggi_cm} cm</div>
                          </td>
                          <td className="p-3">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 font-bold text-[11px] border border-rose-200">
                              <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" />
                              <span>{anak.alasan_pmt}</span>
                            </span>
                          </td>
                          <td className="p-3">
                            <div className="font-medium text-slate-700">Ibu: {anak.nama_ibu}</div>
                            {anak.no_hp_ortu && (
                              <a
                                href={`https://wa.me/${anak.no_hp_ortu.replace(/^0/, '62')}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[11px] font-semibold text-emerald-600 hover:underline flex items-center gap-1 mt-0.5"
                              >
                                <Phone className="w-3 h-3 text-emerald-600" />
                                <span>{anak.no_hp_ortu}</span>
                              </a>
                            )}
                          </td>
                          <td className="p-3 text-[11px] text-slate-600 font-medium">
                            <span className="bg-amber-50 text-amber-900 border border-amber-200 px-2 py-1 rounded-md block">
                              {anak.rekomendasi}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <Link
                              href={`/anak/${anak.id}`}
                              className="px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-semibold text-[11px] inline-flex items-center gap-1 shadow-sm transition-all min-h-[32px]"
                            >
                              <span>Detail</span>
                              <ArrowRight className="w-3 h-3" />
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: IBU HAMIL KEK */}
          {activeTab === 'bumil' && (
            <div>
              {pmtBumilList.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                  <p className="text-sm font-bold text-slate-700">Tidak ada Ibu Hamil KEK yang terdeteksi.</p>
                  <p className="text-xs text-slate-500">Seluruh ibu hamil terpantau memiliki LiLA &ge; 23.5 cm.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-rose-50/60 text-slate-700 border-b border-rose-100">
                        <th className="p-3 font-bold">Nama Ibu Hamil</th>
                        <th className="p-3 font-bold">Posyandu & Dusun</th>
                        <th className="p-3 font-bold">Usia Kehamilan & LiLA</th>
                        <th className="p-3 font-bold">Status Risiko Gizi</th>
                        <th className="p-3 font-bold">Nama Suami</th>
                        <th className="p-3 font-bold">Rekomendasi Intervensi</th>
                        <th className="p-3 font-bold text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {pmtBumilList.map((bumil) => (
                        <tr key={bumil.id} className="hover:bg-rose-50/20 transition-colors">
                          <td className="p-3">
                            <div className="font-bold text-slate-900">{bumil.nama}</div>
                            <div className="text-[10px] text-slate-500">NIK: {bumil.nik}</div>
                          </td>
                          <td className="p-3">
                            <div className="font-semibold text-slate-800">{bumil.posyandu}</div>
                            <div className="text-[10px] text-slate-500">{bumil.dusun}</div>
                          </td>
                          <td className="p-3">
                            <div className="font-bold text-slate-800">{bumil.usia_kehamilan_minggu} Minggu</div>
                            <div className="text-[10px] text-rose-600 font-bold">LiLA: {bumil.lila_cm} cm</div>
                          </td>
                          <td className="p-3">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 font-bold text-[11px] border border-rose-200">
                              <ShieldAlert className="w-3 h-3 text-rose-600 shrink-0" />
                              <span>{bumil.alasan_pmt}</span>
                            </span>
                          </td>
                          <td className="p-3 font-medium text-slate-700">
                            {bumil.nama_suami}
                          </td>
                          <td className="p-3 text-[11px] text-slate-600 font-medium">
                            <span className="bg-rose-50 text-rose-900 border border-rose-200 px-2 py-1 rounded-md block">
                              {bumil.rekomendasi}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <Link
                              href={`/ibu-hamil/${bumil.id}`}
                              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold text-[11px] inline-flex items-center gap-1 shadow-sm transition-all min-h-[32px]"
                            >
                              <span>Detail</span>
                              <ArrowRight className="w-3 h-3" />
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
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
      </div>
    </AppShell>
  );
}
