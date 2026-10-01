import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import AppShell from '../../Components/AppShell';
import {
  ArrowLeft,
  PlusCircle,
  Calendar,
  TrendingUp,
} from 'lucide-react';
import ChildGrowthChart from '../../Components/ChildGrowthChart';
import { calculateAgeInMonths, getStatusBadgeColor } from '../../lib/statusGizi';
import { UserSession } from '../../Components/Navbar';

interface ChildShowProps {
  child: any;
}

export default function Show({ child }: ChildShowProps) {
  const page = usePage();
  const user = (page.props as any).auth?.user as UserSession | null;

  if (!child) return null;

  const ageM = calculateAgeInMonths(child.tanggal_lahir, new Date());
  const birthDateFormatted = new Date(child.tanggal_lahir).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const chartData = child.pengukuran ? child.pengukuran.map((p: any) => ({
    tanggal: new Date(p.tanggal_ukur).toLocaleDateString('id-ID', { month: 'short', year: '2-digit' }),
    umur: `${p.umur_bulan} bln`,
    berat: p.berat_kg,
    tinggi: p.tinggi_cm,
  })) : [];

  const latestNut = child.pengukuran && child.pengukuran.length > 0 ? child.pengukuran[child.pengukuran.length - 1] : null;

  return (
    <AppShell user={user}>
      <div className="space-y-6">
        {/* Top Back & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Link
              href="/anak"
              className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-brand-600 mb-2 min-h-[44px]"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Daftar Anak</span>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
              <span>{child.nama_anak}</span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  child.jenis_kelamin === 'L' ? 'bg-sky-100 text-sky-700' : 'bg-rose-100 text-rose-700'
                }`}
              >
                {child.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              NIK: <span className="font-mono text-slate-700 font-medium">{child.nik}</span> • Posyandu {child.posyandu?.nama_pos}
            </p>
          </div>

          <Link
            href={`/anak/${child.id}/input`}
            className="inline-flex items-center justify-center space-x-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm rounded-xl transition-all shadow-md shadow-brand-600/20 min-h-[44px]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Input Pengukuran Baru</span>
          </Link>
        </div>

        {/* Identity & Status Summary Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4 lg:col-span-1">
            <h3 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-2">
              Data Identitas Balita
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Umur Saat Ini:</span>
                <span className="font-bold text-slate-800">{ageM} Bulan</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Tanggal Lahir:</span>
                <span className="font-semibold text-slate-800">{birthDateFormatted}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Berat Lahir:</span>
                <span className="font-semibold text-slate-800">{child.berat_lahir_gram} gram</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Panjang Lahir:</span>
                <span className="font-semibold text-slate-800">{child.panjang_lahir_cm} cm</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Nama Ibu:</span>
                <span className="font-semibold text-slate-800">{child.nama_ibu}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Nama Ayah:</span>
                <span className="font-semibold text-slate-800">{child.nama_ayah || '-'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">No. HP Orang Tua:</span>
                <span className="font-semibold text-slate-800">{child.no_hp_ortu || '-'}</span>
              </div>
              <div className="py-1">
                <span className="text-slate-500 block">Alamat:</span>
                <span className="font-medium text-slate-800 mt-0.5 block">{child.alamat}</span>
              </div>
            </div>
          </div>

          {/* Latest Nutrition Summary Cards */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-base">Status Gizi Terakhir</h3>
                {latestNut && (
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(latestNut.tanggal_ukur).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                )}
              </div>

              {latestNut ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* TB/U */}
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/70 space-y-1">
                    <span className="text-[11px] font-semibold text-slate-500 block">Tinggi Badan / Umur (TB/U)</span>
                    <div className="text-sm font-bold text-slate-800">{latestNut.tinggi_cm} cm</div>
                    <span className={`inline-block px-2.5 py-0.5 rounded-md text-xs font-bold ${getStatusBadgeColor(latestNut.status_tbu).bg} ${getStatusBadgeColor(latestNut.status_tbu).text}`}>
                      {latestNut.status_tbu}
                    </span>
                  </div>

                  {/* BB/U */}
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/70 space-y-1">
                    <span className="text-[11px] font-semibold text-slate-500 block">Berat Badan / Umur (BB/U)</span>
                    <div className="text-sm font-bold text-slate-800">{latestNut.berat_kg} kg</div>
                    <span className={`inline-block px-2.5 py-0.5 rounded-md text-xs font-bold ${getStatusBadgeColor(latestNut.status_bbu).bg} ${getStatusBadgeColor(latestNut.status_bbu).text}`}>
                      {latestNut.status_bbu}
                    </span>
                  </div>

                  {/* BB/TB */}
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/70 space-y-1">
                    <span className="text-[11px] font-semibold text-slate-500 block">BB / TB (Wasting / Obesitas)</span>
                    <div className="text-sm font-bold text-slate-800">{latestNut.status_bbtb}</div>
                    <span className={`inline-block px-2.5 py-0.5 rounded-md text-xs font-bold ${getStatusBadgeColor(latestNut.status_bbtb).bg} ${getStatusBadgeColor(latestNut.status_bbtb).text}`}>
                      {latestNut.status_bbtb}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">Belum ada data pengukuran recorded.</p>
              )}
            </div>

            {/* Line Chart */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-brand-600" />
                <span>Grafik Tren Pertumbuhan (BB & TB)</span>
              </h3>
              <ChildGrowthChart data={chartData} />
            </div>
          </div>
        </div>

        {/* Measurement History Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base">Riwayat Penimbangan & Pengukuran</h3>
            <span className="text-xs text-slate-500">{child.pengukuran ? child.pengukuran.length : 0} Kali Pengukuran</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <th className="p-3 font-bold">Tanggal Ukur</th>
                  <th className="p-3 font-bold">Umur</th>
                  <th className="p-3 font-bold">Berat (kg)</th>
                  <th className="p-3 font-bold">Tinggi (cm)</th>
                  <th className="p-3 font-bold">Cara Ukur</th>
                  <th className="p-3 font-bold">Status TB/U</th>
                  <th className="p-3 font-bold">Status BB/U</th>
                  <th className="p-3 font-bold">Petugas Input</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {child.pengukuran && child.pengukuran.slice().reverse().map((p: any) => {
                  const tbuBadge = getStatusBadgeColor(p.status_tbu);
                  const bbuBadge = getStatusBadgeColor(p.status_bbu);

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 font-medium text-slate-800">
                        {new Date(p.tanggal_ukur).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="p-3 font-semibold text-slate-700">{p.umur_bulan} Bulan</td>
                      <td className="p-3 font-bold text-brand-700 text-sm">{p.berat_kg} kg</td>
                      <td className="p-3 font-bold text-teal-700 text-sm">{p.tinggi_cm} cm</td>
                      <td className="p-3 text-slate-500 capitalize">{p.cara_ukur}</td>
                      <td className="p-3">
                        <span className={`px-2.5 py-0.5 rounded-md font-bold text-[11px] ${tbuBadge.bg} ${tbuBadge.text}`}>
                          {p.status_tbu}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2.5 py-0.5 rounded-md font-bold text-[11px] ${bbuBadge.bg} ${bbuBadge.text}`}>
                          {p.status_bbu}
                        </span>
                      </td>
                      <td className="p-3 text-slate-500">{p.user_input?.nama || 'Kader'}</td>
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
