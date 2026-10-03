import React, { useState } from 'react';
import { usePage } from '@inertiajs/react';
import AppShell from '../../Components/AppShell';
import {
  FileSpreadsheet,
  Download,
  Printer,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { UserSession } from '../../Components/Navbar';

interface LaporanProps {
  posyandus: any[];
  children: any[];
  bumilList: any[];
}

export default function Index({ posyandus = [], children = [], bumilList = [] }: LaporanProps) {
  const page = usePage();
  const user = (page.props as any).auth?.user as UserSession | null;

  const [selectedPos, setSelectedPos] = useState(user?.role === 'kader' && user.id_pos ? user.id_pos : '');
  const [selectedMonth, setSelectedMonth] = useState('10');
  const [selectedYear, setSelectedYear] = useState('2026');

  const filteredChildren = children.filter((c) => {
    if (selectedPos && c.id_pos !== selectedPos) return false;
    return true;
  });

  const filteredBumil = bumilList.filter((b) => {
    if (selectedPos && b.id_pos !== selectedPos) return false;
    return true;
  });

  const handleExportExcel = () => {
    // 1. Sheet Anak
    const anakRows = filteredChildren.map((c, idx) => {
      const lastM = c.pengukuran ? c.pengukuran[0] : {};
      return {
        No: idx + 1,
        'NIK Anak': c.nik,
        'Nama Balita': c.nama_anak,
        'Jenis Kelamin': c.jenis_kelamin,
        'Tanggal Lahir': new Date(c.tanggal_lahir).toLocaleDateString('id-ID'),
        'Nama Ibu': c.nama_ibu,
        Posyandu: c.posyandu?.nama_pos || '-',
        'Berat (kg)': lastM?.berat_kg || '-',
        'Tinggi (cm)': lastM?.tinggi_cm || '-',
        'Status BB/U': lastM?.status_bbu || '-',
        'Status TB/U': lastM?.status_tbu || '-',
        'Status BB/TB': lastM?.status_bbtb || '-',
      };
    });

    // 2. Sheet Ibu Hamil
    const bumilRows = filteredBumil.map((b, idx) => {
      const lastP = b.pengukuran ? b.pengukuran[0] : {};
      return {
        No: idx + 1,
        'NIK Ibu': b.nik,
        'Nama Ibu Hamil': b.nama,
        'Nama Suami': b.nama_suami,
        'Kehamilan Ke': b.kehamilan_ke,
        Posyandu: b.posyandu?.nama_pos || '-',
        'Usia Kehamilan (Mgg)': lastP?.usia_kehamilan_minggu || '-',
        'LiLA (cm)': lastP?.lila_cm || '-',
        'Tekanan Darah': lastP?.tekanan_darah || '-',
        'Status KEK': lastP?.status_gizi_bumil || '-',
      };
    });

    const wb = XLSX.utils.book_new();
    const wsAnak = XLSX.utils.json_to_sheet(anakRows);
    const wsBumil = XLSX.utils.json_to_sheet(bumilRows);

    XLSX.utils.book_append_sheet(wb, wsAnak, 'Data Balita');
    XLSX.utils.book_append_sheet(wb, wsBumil, 'Data Ibu Hamil');

    XLSX.writeFile(wb, `Laporan_Posyandu_Sukomalo_${selectedMonth}_${selectedYear}.xlsx`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <AppShell user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Laporan & Rekapitulasi Data
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Cetak dan export rekapitulasi penimbangan balita dan kesehatan ibu hamil
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors min-h-[44px] flex items-center space-x-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Cetak PDF</span>
            </button>

            <button
              onClick={handleExportExcel}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl transition-all shadow-md shadow-emerald-600/20 min-h-[44px] flex items-center space-x-1.5"
            >
              <Download className="w-4 h-4" />
              <span>Export Excel</span>
            </button>
          </div>
        </div>

        {/* Filter Selection Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Pilih Posyandu</label>
            <select
              value={selectedPos}
              disabled={user?.role === 'kader'}
              onChange={(e) => setSelectedPos(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500 min-h-[44px] bg-white disabled:bg-slate-50"
            >
              {user?.role !== 'kader' && <option value="">Semua 6 Posyandu</option>}
              {posyandus.map((p) => (
                <option key={p.id} value={p.id}>
                  Posyandu {p.nama_pos}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Bulan Laporan</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500 min-h-[44px] bg-white"
            >
              <option value="01">Januari</option>
              <option value="02">Februari</option>
              <option value="03">Maret</option>
              <option value="04">April</option>
              <option value="05">Mei</option>
              <option value="06">Juni</option>
              <option value="07">Juli</option>
              <option value="08">Agustus</option>
              <option value="09">September</option>
              <option value="10">Oktober</option>
              <option value="11">November</option>
              <option value="12">Desember</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Tahun Laporan</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500 min-h-[44px] bg-white"
            >
              <option value="2026">2026</option>
              <option value="2025">2025</option>
            </select>
          </div>
        </div>

        {/* Report Preview Tables */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-6">
          <div className="text-center space-y-1 border-b border-slate-100 pb-4">
            <h2 className="text-xl font-bold text-slate-900 uppercase">
              REKAPITULASI LAPORAN POSYANDU DESA SUKOMALO
            </h2>
            <p className="text-xs text-slate-500">
              Periode: Oktober 2026 • Wilayah: {selectedPos ? `Posyandu ${posyandus.find((p) => p.id === selectedPos)?.nama_pos}` : 'Semua 6 Posyandu'}
            </p>
          </div>

          {/* Section 1: Balita Table */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-brand-600" />
              <span>A. Rekapitulasi Data Balita ({filteredChildren.length} Anak)</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-200 border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                    <th className="p-2 border border-slate-200 font-bold">No</th>
                    <th className="p-2 border border-slate-200 font-bold">NIK</th>
                    <th className="p-2 border border-slate-200 font-bold">Nama Balita</th>
                    <th className="p-2 border border-slate-200 font-bold">JK</th>
                    <th className="p-2 border border-slate-200 font-bold">Nama Ibu</th>
                    <th className="p-2 border border-slate-200 font-bold">Posyandu</th>
                    <th className="p-2 border border-slate-200 font-bold">BB (kg)</th>
                    <th className="p-2 border border-slate-200 font-bold">TB (cm)</th>
                    <th className="p-2 border border-slate-200 font-bold">Status TB/U</th>
                    <th className="p-2 border border-slate-200 font-bold">Status BB/U</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredChildren.map((c, idx) => {
                    const lastM = c.pengukuran ? c.pengukuran[0] : {};
                    return (
                      <tr key={c.id}>
                        <td className="p-2 border border-slate-200 text-center">{idx + 1}</td>
                        <td className="p-2 border border-slate-200 font-mono text-[11px]">{c.nik}</td>
                        <td className="p-2 border border-slate-200 font-bold text-slate-800">{c.nama_anak}</td>
                        <td className="p-2 border border-slate-200 text-center">{c.jenis_kelamin}</td>
                        <td className="p-2 border border-slate-200">{c.nama_ibu}</td>
                        <td className="p-2 border border-slate-200">{c.posyandu?.nama_pos}</td>
                        <td className="p-2 border border-slate-200 font-semibold">{lastM?.berat_kg || '-'}</td>
                        <td className="p-2 border border-slate-200 font-semibold">{lastM?.tinggi_cm || '-'}</td>
                        <td className="p-2 border border-slate-200 font-bold">{lastM?.status_tbu || '-'}</td>
                        <td className="p-2 border border-slate-200 font-bold">{lastM?.status_bbu || '-'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 2: Ibu Hamil Table */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-rose-600" />
              <span>B. Rekapitulasi Data Ibu Hamil ({filteredBumil.length} Ibu)</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-200 border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                    <th className="p-2 border border-slate-200 font-bold">No</th>
                    <th className="p-2 border border-slate-200 font-bold">NIK</th>
                    <th className="p-2 border border-slate-200 font-bold">Nama Ibu Hamil</th>
                    <th className="p-2 border border-slate-200 font-bold">Nama Suami</th>
                    <th className="p-2 border border-slate-200 font-bold">Posyandu</th>
                    <th className="p-2 border border-slate-200 font-bold">Usia Hamil</th>
                    <th className="p-2 border border-slate-200 font-bold">LiLA (cm)</th>
                    <th className="p-2 border border-slate-200 font-bold">TD</th>
                    <th className="p-2 border border-slate-200 font-bold">Status KEK</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredBumil.map((b, idx) => {
                    const lastP = b.pengukuran ? b.pengukuran[0] : {};
                    return (
                      <tr key={b.id}>
                        <td className="p-2 border border-slate-200 text-center">{idx + 1}</td>
                        <td className="p-2 border border-slate-200 font-mono text-[11px]">{b.nik}</td>
                        <td className="p-2 border border-slate-200 font-bold text-slate-800">{b.nama}</td>
                        <td className="p-2 border border-slate-200">{b.nama_suami}</td>
                        <td className="p-2 border border-slate-200">{b.posyandu?.nama_pos}</td>
                        <td className="p-2 border border-slate-200">{lastP?.usia_kehamilan_minggu ? `${lastP.usia_kehamilan_minggu} Mgg` : '-'}</td>
                        <td className="p-2 border border-slate-200 font-semibold">{lastP?.lila_cm || '-'}</td>
                        <td className="p-2 border border-slate-200">{lastP?.tekanan_darah || '-'}</td>
                        <td className="p-2 border border-slate-200 font-bold">{lastP?.status_gizi_bumil || '-'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
