import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import AppShell from '../../Components/AppShell';
import {
  ArrowLeft,
  PlusCircle,
} from 'lucide-react';
import { getStatusBadgeColor } from '../../lib/statusGizi';
import { UserSession } from '../../Components/Navbar';

interface BumilShowProps {
  bumil: any;
}

export default function Show({ bumil }: BumilShowProps) {
  const page = usePage();
  const user = (page.props as any).auth?.user as UserSession | null;

  if (!bumil) return null;

  const latestExam = bumil.pengukuran && bumil.pengukuran.length > 0 ? bumil.pengukuran[0] : null;
  const hphtFormatted = new Date(bumil.hpht).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <AppShell user={user}>
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Link
              href="/ibu-hamil"
              className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-brand-600 mb-2 min-h-[44px]"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Daftar Ibu Hamil</span>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
              <span>{bumil.nama}</span>
              <span className="px-3 py-1 bg-brand-100 text-brand-700 rounded-full text-xs font-bold">
                Kehamilan ke-G{bumil.kehamilan_ke}
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              NIK: <span className="font-mono text-slate-700 font-medium">{bumil.nik}</span> • Posyandu {bumil.posyandu?.nama_pos}
            </p>
          </div>

          <Link
            href={`/ibu-hamil/${bumil.id}/input`}
            className="inline-flex items-center justify-center space-x-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm rounded-xl transition-all shadow-md shadow-brand-600/20 min-h-[44px]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Input Pemeriksaan Baru</span>
          </Link>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-2">
              Identitas & Kehamilan
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Nama Suami:</span>
                <span className="font-bold text-slate-800">{bumil.nama_suami}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">HPHT:</span>
                <span className="font-semibold text-slate-800">{hphtFormatted}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Tanggal Lahir:</span>
                <span className="font-semibold text-slate-800">
                  {new Date(bumil.tanggal_lahir).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
              <div className="py-1">
                <span className="text-slate-500 block">Alamat:</span>
                <span className="font-medium text-slate-800 mt-0.5 block">{bumil.alamat}</span>
              </div>
            </div>
          </div>

          {/* Latest Examination Summary */}
          <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-bold text-slate-900 text-base">Pemeriksaan Terakhir</h3>
              {latestExam && (
                <span className="text-xs text-slate-500">
                  {new Date(latestExam.tanggal_periksa).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              )}
            </div>

            {latestExam ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/70 text-center">
                  <span className="text-[11px] text-slate-500 block">Usia Kehamilan</span>
                  <div className="text-xl font-black text-slate-900">{latestExam.usia_kehamilan_minggu} <span className="text-xs font-normal">Mgg</span></div>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/70 text-center">
                  <span className="text-[11px] text-slate-500 block">Berat Badan</span>
                  <div className="text-xl font-black text-slate-900">{latestExam.berat_kg} <span className="text-xs font-normal">kg</span></div>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/70 text-center">
                  <span className="text-[11px] text-slate-500 block">Lingkar Lengan (LiLA)</span>
                  <div className="text-xl font-black text-slate-900">{latestExam.lila_cm} <span className="text-xs font-normal">cm</span></div>
                </div>

                <div className={`p-3.5 rounded-xl border text-center ${getStatusBadgeColor(latestExam.status_gizi_bumil).bg} ${getStatusBadgeColor(latestExam.status_gizi_bumil).border}`}>
                  <span className="text-[11px] font-semibold text-slate-600 block">Status KEK</span>
                  <div className={`text-xl font-black ${getStatusBadgeColor(latestExam.status_gizi_bumil).text}`}>
                    {latestExam.status_gizi_bumil}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">Belum ada catatan pemeriksaan.</p>
            )}
          </div>
        </div>

        {/* History Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-4">
          <h3 className="font-bold text-slate-900 text-base">Riwayat Pemeriksaan Kehamilan</h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <th className="p-3 font-bold">Tanggal Periksa</th>
                  <th className="p-3 font-bold">Usia Kehamilan</th>
                  <th className="p-3 font-bold">Berat (kg)</th>
                  <th className="p-3 font-bold">Tinggi (cm)</th>
                  <th className="p-3 font-bold">LiLA (cm)</th>
                  <th className="p-3 font-bold">Tekanan Darah</th>
                  <th className="p-3 font-bold">Status KEK</th>
                  <th className="p-3 font-bold">Petugas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bumil.pengukuran && bumil.pengukuran.map((p: any) => {
                  const badge = getStatusBadgeColor(p.status_gizi_bumil);
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 font-medium text-slate-800">
                        {new Date(p.tanggal_periksa).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="p-3 font-semibold text-slate-700">{p.usia_kehamilan_minggu} Minggu</td>
                      <td className="p-3 font-bold text-slate-900">{p.berat_kg} kg</td>
                      <td className="p-3 text-slate-600">{p.tinggi_cm} cm</td>
                      <td className="p-3 font-bold text-rose-700">{p.lila_cm} cm</td>
                      <td className="p-3 text-slate-600">{p.tekanan_darah}</td>
                      <td className="p-3">
                        <span className={`px-2.5 py-0.5 rounded-md font-bold text-[11px] ${badge.bg} ${badge.text}`}>
                          {p.status_gizi_bumil}
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
