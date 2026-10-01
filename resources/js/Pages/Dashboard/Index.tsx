import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import AppShell from '../../Components/AppShell';
import {
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  PlusCircle,
  Baby,
  Calendar,
  Sparkles,
} from 'lucide-react';
import NutritionDonutChart from '../../Components/NutritionDonutChart';
import { getStatusBadgeColor } from '../../lib/statusGizi';
import { UserSession } from '../../Components/Navbar';

interface DashboardProps {
  childrenInPos: any[];
  totalAnak: number;
  countMeasured: number;
  progressPercent: number;
  unmeasuredThisMonthList: any[];
  donutData: { name: string; value: number }[];
  currentMonthName: string;
}

export default function Dashboard({
  totalAnak,
  countMeasured,
  progressPercent,
  unmeasuredThisMonthList = [],
  donutData = [],
  currentMonthName,
}: DashboardProps) {
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
              <span>Ringkasan Kader • Posyandu {user?.nama_pos || 'Aktif'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Dashboard Posyandu
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5 flex items-center gap-1">
              <Calendar className="w-4 h-4 text-slate-400" />
              Periode Penimbangan: <span className="font-semibold text-slate-700">{currentMonthName}</span>
            </p>
          </div>

          <Link
            href="/anak"
            className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm rounded-xl transition-all shadow-md shadow-brand-600/20 min-h-[44px]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Tambah Balita Baru</span>
          </Link>
        </div>

        {/* Top Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Total Anak */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
              <Baby className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-medium text-slate-500">Total Anak Balita</div>
              <div className="text-2xl font-extrabold text-slate-900">{totalAnak} <span className="text-xs font-normal text-slate-500">anak</span></div>
              <div className="text-[11px] text-slate-400 mt-0.5">Terdaftar di Pos {user?.nama_pos || ''}</div>
            </div>
          </div>

          {/* Measured count & progress */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs font-medium text-slate-500">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Sudah Diukur Bulan Ini</span>
              </div>
              <span className="text-xs font-bold text-slate-800">{progressPercent}%</span>
            </div>

            <div className="text-2xl font-extrabold text-slate-900">
              {countMeasured} <span className="text-xs font-normal text-slate-500">/ {totalAnak} anak</span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-brand-500 to-emerald-500 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Unmeasured Count */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-medium text-slate-500">Belum Penimbangan</div>
              <div className="text-2xl font-extrabold text-amber-700">{unmeasuredThisMonthList.length} <span className="text-xs font-normal text-slate-500">anak</span></div>
              <div className="text-[11px] text-amber-600 font-medium mt-0.5">Perlu diukur segera</div>
            </div>
          </div>
        </div>

        {/* Middle Grid: Donut Chart & Unmeasured List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Donut Chart Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Distribusi Status Gizi Balita</h3>
              <p className="text-xs text-slate-500">Berdasarkan hasil pengukuran bulan {currentMonthName}</p>
            </div>

            {countMeasured > 0 ? (
              <NutritionDonutChart data={donutData} />
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-slate-200 rounded-2xl">
                <AlertTriangle className="w-10 h-10 text-slate-300 mb-2" />
                <p className="text-sm font-semibold text-slate-600">Belum ada data pengukuran bulan ini</p>
                <p className="text-xs text-slate-400 mt-1">Lakukan penimbangan anak untuk melihat grafik distribusi status gizi.</p>
              </div>
            )}
          </div>

          {/* Unmeasured Children List */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4 flex flex-col">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <span>Anak Belum Diukur Bulan Ini</span>
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-xs font-bold rounded-full">
                    {unmeasuredThisMonthList.length}
                  </span>
                </h3>
                <p className="text-xs text-slate-500">Klik tombol cepat "Input Sekarang" untuk mencatat</p>
              </div>
            </div>

            {unmeasuredThisMonthList.length > 0 ? (
              <div className="space-y-2.5 overflow-y-auto max-h-[340px] pr-1">
                {unmeasuredThisMonthList.map((child) => {
                  const lastNut = child.pengukuran ? child.pengukuran[0] : null;
                  const badgeColor = lastNut ? getStatusBadgeColor(lastNut.status_tbu) : { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200' };

                  return (
                    <div
                      key={child.id}
                      className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-slate-50 flex items-center justify-between gap-3 transition-colors"
                    >
                      <div>
                        <div className="font-bold text-slate-800 text-sm">{child.nama_anak}</div>
                        <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                          <span>{child.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</span>
                          <span>•</span>
                          <span>Ibu: {child.nama_ibu}</span>
                        </div>
                        {lastNut && (
                          <div className="mt-1">
                            <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-semibold ${badgeColor.bg} ${badgeColor.text}`}>
                              Bulan lalu: {lastNut.status_tbu}
                            </span>
                          </div>
                        )}
                      </div>

                      <Link
                        href={`/anak/${child.id}/input`}
                        className="px-3 py-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs rounded-xl transition-all shadow-sm flex items-center space-x-1 shrink-0 min-h-[44px]"
                      >
                        <span>Input Sekarang</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border border-dashed border-slate-200 rounded-2xl">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mb-2" />
                <p className="font-bold text-slate-800 text-base">Hebat! Semua Anak Sudah Diukur</p>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">Seluruh balita terdaftar di Pos {user?.nama_pos || ''} telah ditimbang untuk bulan ini.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
