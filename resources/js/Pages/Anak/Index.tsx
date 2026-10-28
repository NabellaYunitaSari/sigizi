import React, { useState, useMemo } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import AppShell from '../../Components/AppShell';
import {
  Baby,
  Search,
  ChevronRight,
  School,
  Trash2,
  RotateCcw,
} from 'lucide-react';
import {
  getStatusBadgeColor,
  calculateAgeInMonths,
} from '../../lib/statusGizi';
import { UserSession } from '../../Components/Navbar';

interface ChildData {
  id: string;
  nik: string;
  nik_tidak_tersedia?: boolean;
  no_kk?: string;
  nama_anak: string;
  anak_ke?: number;
  jenis_kelamin: 'L' | 'P';
  tanggal_lahir: string;
  nama_ayah?: string;
  nama_ibu: string;
  no_hp_ortu?: string;
  alamat: string;
  rt?: string;
  rw?: string;
  berat_lahir_gram?: number | string;
  panjang_lahir_cm?: number | string;
  buku_kia?: boolean;
  paud?: string;
  id_pos: string;
  posyandu: { nama_pos: string; dusun: string };
  pengukuran?: Array<{
    id?: string;
    tanggal_ukur: string;
    berat_kg: number;
    tinggi_cm: number;
    umur_bulan: number;
    status_bbu: string;
    status_tbu: string;
    status_bbtb: string;
  }>;
}

interface AnakIndexProps {
  initialChildren: ChildData[];
  trashedChildren?: ChildData[];
  posyandus: any[];
  activeTab?: string;
}

export default function Index({
  initialChildren = [],
  trashedChildren = [],
  posyandus = [],
  activeTab = 'balita',
}: AnakIndexProps) {
  const page = usePage();
  const user = (page.props as any).auth?.user as UserSession | null;
  const isBidanOrAdmin = user?.role === 'koordinator' || user?.role === 'admin';

  const [currentTab, setCurrentTab] = useState<'balita' | 'prasekolah' | 'recycle'>(
    activeTab === 'recycle' ? 'recycle' : activeTab === 'prasekolah' ? 'prasekolah' : 'balita'
  );

  const [children] = useState<ChildData[]>(initialChildren);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');
  const [posyanduFilter, setPosyanduFilter] = useState('');
  const [paudFilter, setPaudFilter] = useState('');

  // Filtered children
  const filteredChildren = useMemo(() => {
    return children.filter((child) => {
      const ageM = calculateAgeInMonths(child.tanggal_lahir, new Date());

      // If on tab prasekolah, only children aged >= 24 months or having PAUD registered
      if (currentTab === 'prasekolah') {
        if (ageM < 24 && !child.paud) return false;
        if (paudFilter && (!child.paud || !child.paud.toLowerCase().includes(paudFilter.toLowerCase()))) {
          return false;
        }
      }

      const matchSearch =
        !search.trim() ||
        child.nama_anak.toLowerCase().includes(search.toLowerCase()) ||
        child.nik.toLowerCase().includes(search.toLowerCase()) ||
        child.nama_ibu.toLowerCase().includes(search.toLowerCase());

      const matchPos = !posyanduFilter || child.id_pos === posyanduFilter;

      if (!matchSearch || !matchPos) return false;

      if (statusFilter === 'Semua') return true;
      const latestNut = child.pengukuran && child.pengukuran.length > 0 ? child.pengukuran[0] : null;
      if (!latestNut) return statusFilter === 'Belum Diukur';
      return (
        latestNut.status_bbu === statusFilter ||
        latestNut.status_tbu === statusFilter ||
        latestNut.status_bbtb === statusFilter
      );
    });
  }, [children, search, posyanduFilter, statusFilter, currentTab, paudFilter]);

  const handleRestoreChild = (id: string) => {
    if (confirm('Pulihkan data balita ini dari keranjang sampah?')) {
      router.post(`/anak/${id}/restore`, {}, { preserveScroll: true });
    }
  };

  return (
    <AppShell title="Data Balita">
      <div className="space-y-6">
        {/* Header Bersih Tanpa Tombol Input (Input Ada di Sidebar Pengukuran) */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                <Baby className="w-7 h-7 text-indigo-600" />
                Data Pelayanan Balita & Anak
              </h1>
              <p className="text-slate-500 text-sm mt-1">
                Data sasaran balita, pemantauan status gizi terintegrasi, dan integrasi PAUD di Desa Sukomalo
              </p>
            </div>
          </div>

          {/* Sub Navigation Bar Tabs */}
          <div className="flex border-b border-slate-200 overflow-x-auto gap-2">
            <button
              onClick={() => setCurrentTab('balita')}
              className={`pb-3 px-4 text-sm font-semibold border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
                currentTab === 'balita'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <Baby className="w-4 h-4" />
              1. Balita 0–59 Bulan ({children.length})
            </button>

            <button
              onClick={() => setCurrentTab('prasekolah')}
              className={`pb-3 px-4 text-sm font-semibold border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
                currentTab === 'prasekolah'
                  ? 'border-sky-600 text-sky-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <School className="w-4 h-4" />
              2. Anak Prasekolah & PAUD
            </button>

            {isBidanOrAdmin && (
              <button
                onClick={() => setCurrentTab('recycle')}
                className={`pb-3 px-4 text-sm font-semibold border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
                  currentTab === 'recycle'
                    ? 'border-rose-600 text-rose-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <Trash2 className="w-4 h-4" />
                3. Recycle Bin ({trashedChildren.length})
              </button>
            )}
          </div>
        </div>

        {/* TAB 1 & 2: BALITA & ANAK PRASEKOLAH */}
        {(currentTab === 'balita' || currentTab === 'prasekolah') && (
          <div className="space-y-4">
            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-3 items-center justify-between">
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari nama balita, NIK, nama ibu..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                <select
                  value={posyanduFilter}
                  onChange={(e) => setPosyanduFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700"
                >
                  <option value="">Semua Posyandu</option>
                  {posyandus.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nama_pos}
                    </option>
                  ))}
                </select>

                {currentTab === 'prasekolah' && (
                  <input
                    type="text"
                    placeholder="Filter nama PAUD..."
                    value={paudFilter}
                    onChange={(e) => setPaudFilter(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 w-44"
                  />
                )}

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700"
                >
                  <option value="Semua">Semua Status Gizi</option>
                  <option value="Normal">Normal / Gizi Baik</option>
                  <option value="Kurang">Gizi Kurang</option>
                  <option value="Gizi Kurang">Gizi Kurang</option>
                  <option value="Gizi Buruk">Gizi Buruk</option>
                  <option value="Pendek (Stunting)">Pendek (Stunting)</option>
                  <option value="Sangat Pendek">Sangat Pendek</option>
                  <option value="Belum Diukur">Belum Diukur</option>
                </select>
              </div>
            </div>

            {/* Children Data Table */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-100">
                      <th className="py-3.5 px-4">Nama Anak</th>
                      <th className="py-3.5 px-4">JK & Usia</th>
                      <th className="py-3.5 px-4">NIK & Orang Tua</th>
                      <th className="py-3.5 px-4">Posyandu & PAUD</th>
                      <th className="py-3.5 px-4">Pengukuran Terakhir</th>
                      <th className="py-3.5 px-4">Status Gizi</th>
                      <th className="py-3.5 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredChildren.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-400">
                          Tidak ada data balita ditemukan.
                        </td>
                      </tr>
                    ) : (
                      filteredChildren.map((child) => {
                        const ageM = calculateAgeInMonths(child.tanggal_lahir, new Date());
                        const latestNut = child.pengukuran && child.pengukuran.length > 0 ? child.pengukuran[0] : null;
                        return (
                          <tr key={child.id} className="hover:bg-slate-50/80 transition">
                            <td className="py-3.5 px-4">
                              <Link href={`/anak/${child.id}`} className="font-semibold text-slate-800 hover:text-indigo-600">
                                {child.nama_anak}
                              </Link>
                              {child.anak_ke && (
                                <div className="text-xs text-slate-400">Anak ke-{child.anak_ke}</div>
                              )}
                            </td>
                            <td className="py-3.5 px-4">
                              <span
                                className={`text-xs font-semibold px-2 py-0.5 rounded ${
                                  child.jenis_kelamin === 'L' ? 'bg-blue-50 text-blue-700' : 'bg-pink-50 text-pink-700'
                                }`}
                              >
                                {child.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
                              </span>
                              <div className="text-xs text-slate-500 mt-1">{ageM} Bulan</div>
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="font-mono text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded inline-block">
                                {child.nik_tidak_tersedia ? 'Belum Ada NIK' : child.nik}
                              </div>
                              <div className="text-xs text-slate-500 mt-0.5">
                                Ibu: {child.nama_ibu} {child.nama_ayah ? `| Ayah: ${child.nama_ayah}` : ''}
                              </div>
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="text-slate-700">{child.posyandu?.nama_pos}</div>
                              {child.paud && (
                                <div className="text-xs text-sky-600 font-medium flex items-center gap-1">
                                  <School className="w-3 h-3" /> {child.paud}
                                </div>
                              )}
                            </td>
                            <td className="py-3.5 px-4">
                              {latestNut ? (
                                <div>
                                  <div className="text-xs font-medium text-slate-700">
                                    {latestNut.berat_kg} kg • {latestNut.tinggi_cm} cm
                                  </div>
                                  <div className="text-xs text-slate-400">
                                    {new Date(latestNut.tanggal_ukur).toLocaleDateString('id-ID')}
                                  </div>
                                </div>
                              ) : (
                                <span className="text-xs text-slate-400 italic">Belum diukur</span>
                              )}
                            </td>
                            <td className="py-3.5 px-4">
                              {latestNut ? (
                                <div className="space-y-1">
                                  <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full ${getStatusBadgeColor(latestNut.status_bbu)}`}>
                                    BB/U: {latestNut.status_bbu}
                                  </span>
                                  <div className="text-[11px] text-slate-500">
                                    TB/U: {latestNut.status_tbu}
                                  </div>
                                </div>
                              ) : (
                                <span className="text-xs text-slate-400">Belum ada</span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <Link
                                href={`/anak/${child.id}`}
                                title="Lihat Rekam Pertumbuhan & Grafik"
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium transition"
                              >
                                Detail Rekam Medis
                                <ChevronRight className="w-3.5 h-3.5" />
                              </Link>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: RECYCLE BIN */}
        {currentTab === 'recycle' && isBidanOrAdmin && (
          <div className="space-y-4">
            <div className="bg-rose-50 p-4 rounded-2xl border border-rose-200">
              <h2 className="text-lg font-bold text-rose-900">Keranjang Sampah (Daftar Balita Recycle)</h2>
              <p className="text-rose-700 text-xs">
                Data balita yang terhapus dapat dipulihkan kembali ke daftar aktif posyandu.
              </p>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-100">
                      <th className="py-3.5 px-4">Nama Balita</th>
                      <th className="py-3.5 px-4">NIK</th>
                      <th className="py-3.5 px-4">Nama Ibu</th>
                      <th className="py-3.5 px-4">Posyandu</th>
                      <th className="py-3.5 px-4 text-right">Aksi Pemulihan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {trashedChildren.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-slate-400">
                          Keranjang sampah kosong. Tidak ada data balita yang terhapus.
                        </td>
                      </tr>
                    ) : (
                      trashedChildren.map((c) => (
                        <tr key={c.id} className="hover:bg-slate-50/80 transition">
                          <td className="py-3.5 px-4 font-semibold text-slate-800">{c.nama_anak}</td>
                          <td className="py-3.5 px-4 font-mono text-xs text-slate-600">{c.nik}</td>
                          <td className="py-3.5 px-4 text-slate-600">{c.nama_ibu}</td>
                          <td className="py-3.5 px-4 text-slate-600">{c.posyandu?.nama_pos}</td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => handleRestoreChild(c.id)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              Pulihkan Data
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
