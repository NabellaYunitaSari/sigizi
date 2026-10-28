import React, { useState, useMemo } from 'react';
import { Link, usePage } from '@inertiajs/react';
import AppShell from '../../Components/AppShell';
import {
  Heart,
  Search,
  ChevronRight,
  Activity,
  Smile,
  ShieldAlert,
  CheckCircle2,
  UserCheck,
} from 'lucide-react';
import { getStatusBadgeColor } from '../../lib/statusGizi';
import { UserSession } from '../../Components/Navbar';

interface KunjunganNifasItem {
  id: string;
  id_bumil: string;
  tanggal_melahirkan: string;
  tanggal_kunjungan: string;
  periode_kf: string;
  jenis_tenaga: string;
  kesadaran: string;
  perdarahan_masif: boolean;
  kejang: boolean;
  syok: boolean;
  frekuensi_pernafasan: string;
  frekuensi_nadi: string;
  tekanan_darah: string;
  suhu_tubuh: string;
  kondisi_payudara: string;
  kontraksi_uterus: string;
  warna_lokhia: string;
  produksi_asi: string;
  buang_air_kecil: boolean;
  buang_air_besar: boolean;
  mood: string;
  diberikan_ttd: boolean;
  diberikan_vit_a: boolean;
  dirujuk: boolean;
  tempat?: string;
  userInput?: { nama: string };
}

interface PemantauanMenyusuiItem {
  id: string;
  id_bumil: string;
  tanggal_pemantauan: string;
  status_asi: string;
  produksi_asi: string;
  masalah_menyusui?: string;
  konseling_asi: boolean;
  asi_eksklusif: boolean;
  keterangan?: string;
  userInput?: { nama: string };
}

interface BumilData {
  id: string;
  nik: string;
  nik_belum_tersedia?: boolean;
  no_kk?: string;
  nama: string;
  tanggal_lahir?: string;
  no_hp?: string;
  nama_suami: string;
  nik_suami?: string;
  no_hp_suami?: string;
  alamat: string;
  rt?: string;
  rw?: string;
  kehamilan_ke: number;
  jumlah_persalinan?: number;
  jumlah_keguguran?: number;
  hpht: string;
  hpl?: string;
  bb_sebelum_hamil?: number;
  tb_sebelum_hamil?: number;
  lila_sebelum_hamil?: number;
  imt_sebelum_hamil?: number;
  status_kek_awal?: string;
  golongan_darah?: string;
  lab_rhesus?: string;
  buku_kia?: boolean;
  jaminan_kesehatan?: string;
  status_kehamilan: string;
  id_pos: string;
  posyandu: { nama_pos: string };
  pengukuran?: Array<{
    id: string;
    tanggal_periksa: string;
    usia_kehamilan_minggu: number;
    berat_kg: number;
    tinggi_cm?: number;
    lila_cm: number;
    tekanan_darah: string;
    status_gizi_bumil: string;
    tfu_cm?: number;
    djj?: number;
    presentasi_janin?: string;
    usg?: boolean;
    lab_hb?: number;
    menerima_mbg?: boolean;
    userInput?: { nama: string };
  }>;
  kunjunganNifas?: KunjunganNifasItem[];
  pemantauanMenyusui?: PemantauanMenyusuiItem[];
}

interface BumilIndexProps {
  initialBumilList: BumilData[];
  posyandus: any[];
  activeTab?: string;
}

export default function Index({
  initialBumilList = [],
  posyandus = [],
  activeTab = 'kehamilan',
}: BumilIndexProps) {
  const page = usePage();
  const user = (page.props as any).auth?.user as UserSession | null;

  const [currentTab, setCurrentTab] = useState<'kehamilan' | 'nifas' | 'menyusui' | 'profil'>(
    (activeTab as any) || 'kehamilan'
  );

  const [bumilList] = useState<BumilData[]>(initialBumilList);
  const [search, setSearch] = useState('');
  const [posyanduFilter, setPosyanduFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');

  // Filtered lists
  const filteredBumilList = useMemo(() => {
    return bumilList.filter((bumil) => {
      const matchSearch =
        !search.trim() ||
        bumil.nama.toLowerCase().includes(search.toLowerCase()) ||
        bumil.nik.toLowerCase().includes(search.toLowerCase()) ||
        bumil.nama_suami.toLowerCase().includes(search.toLowerCase());

      const matchPos = !posyanduFilter || bumil.id_pos === posyanduFilter;

      if (!matchSearch || !matchPos) return false;

      if (statusFilter === 'Semua') return true;
      const lastExam = bumil.pengukuran && bumil.pengukuran.length > 0 ? bumil.pengukuran[0] : null;
      if (!lastExam) return statusFilter === 'Belum Diperiksa';
      if (statusFilter === 'KEK') return lastExam.status_gizi_bumil === 'KEK';
      if (statusFilter === 'Normal') return lastExam.status_gizi_bumil === 'Normal';
      return true;
    });
  }, [bumilList, search, posyanduFilter, statusFilter]);

  // Semua riwayat nifas dari seluruh ibu
  const allNifasRecords = useMemo(() => {
    const list: Array<KunjunganNifasItem & { bumilNama: string; bumilNik: string; posyandu: string }> = [];
    bumilList.forEach((b) => {
      if (b.kunjunganNifas) {
        b.kunjunganNifas.forEach((kn) => {
          list.push({
            ...kn,
            bumilNama: b.nama,
            bumilNik: b.nik,
            posyandu: b.posyandu?.nama_pos || '-',
          });
        });
      }
    });
    return list.sort((a, b) => new Date(b.tanggal_kunjungan).getTime() - new Date(a.tanggal_kunjungan).getTime());
  }, [bumilList]);

  // Semua riwayat pemantauan menyusui dari seluruh ibu
  const allMenyusuiRecords = useMemo(() => {
    const list: Array<PemantauanMenyusuiItem & { bumilNama: string; bumilNik: string; posyandu: string }> = [];
    bumilList.forEach((b) => {
      if (b.pemantauanMenyusui) {
        b.pemantauanMenyusui.forEach((pm) => {
          list.push({
            ...pm,
            bumilNama: b.nama,
            bumilNik: b.nik,
            posyandu: b.posyandu?.nama_pos || '-',
          });
        });
      }
    });
    return list.sort((a, b) => new Date(b.tanggal_pemantauan).getTime() - new Date(a.tanggal_pemantauan).getTime());
  }, [bumilList]);

  return (
    <AppShell title="Data Ibu Hamil">
      <div className="space-y-6">
        {/* Header Bersih Tanpa Tombol Input (Input Ada di Sidebar Pengukuran) */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                <Heart className="w-7 h-7 text-rose-500 fill-rose-500" />
                Data Pelayanan Kesehatan Ibu
              </h1>
              <p className="text-slate-500 text-sm mt-1">
                Data kehamilan, masa nifas (KF1–KF4), dan pemberian ASI eksklusif terpadu di Desa Sukomalo
              </p>
            </div>
          </div>

          {/* Sub Navigation Bar Tabs */}
          <div className="flex border-b border-slate-200 overflow-x-auto gap-2">
            <button
              onClick={() => setCurrentTab('kehamilan')}
              className={`pb-3 px-4 text-sm font-semibold border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
                currentTab === 'kehamilan'
                  ? 'border-rose-600 text-rose-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <Heart className="w-4 h-4" />
              1. Kehamilan & ANC ({bumilList.length})
            </button>

            <button
              onClick={() => setCurrentTab('nifas')}
              className={`pb-3 px-4 text-sm font-semibold border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
                currentTab === 'nifas'
                  ? 'border-teal-600 text-teal-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <Activity className="w-4 h-4" />
              2. Kunjungan Nifas KF ({allNifasRecords.length})
            </button>

            <button
              onClick={() => setCurrentTab('menyusui')}
              className={`pb-3 px-4 text-sm font-semibold border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
                currentTab === 'menyusui'
                  ? 'border-amber-600 text-amber-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <Smile className="w-4 h-4" />
              3. Pemantauan Menyusui ({allMenyusuiRecords.length})
            </button>

            <button
              onClick={() => setCurrentTab('profil')}
              className={`pb-3 px-4 text-sm font-semibold border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
                currentTab === 'profil'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              4. Master Profil Ibu ({bumilList.length})
            </button>
          </div>
        </div>

        {/* TAB 1: KEHAMILAN & ANC */}
        {currentTab === 'kehamilan' && (
          <div className="space-y-4">
            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-3 items-center justify-between">
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari nama ibu, NIK, nama suami..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
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

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700"
                >
                  <option value="Semua">Semua Status Gizi</option>
                  <option value="Normal">Normal</option>
                  <option value="KEK">KEK (LiLA &lt; 23.5 cm)</option>
                  <option value="Belum Diperiksa">Belum Diperiksa</option>
                </select>
              </div>
            </div>

            {/* List Table */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-100">
                      <th className="py-3.5 px-4">Nama Ibu / Suami</th>
                      <th className="py-3.5 px-4">NIK</th>
                      <th className="py-3.5 px-4">Posyandu & RT/RW</th>
                      <th className="py-3.5 px-4">Usia Hamil & HPL</th>
                      <th className="py-3.5 px-4">Pemeriksaan Terakhir</th>
                      <th className="py-3.5 px-4">Status Gizi</th>
                      <th className="py-3.5 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredBumilList.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-400">
                          Tidak ada data ibu hamil ditemukan.
                        </td>
                      </tr>
                    ) : (
                      filteredBumilList.map((b) => {
                        const lastExam = b.pengukuran && b.pengukuran.length > 0 ? b.pengukuran[0] : null;
                        return (
                          <tr key={b.id} className="hover:bg-slate-50/80 transition">
                            <td className="py-3.5 px-4">
                              <Link href={`/ibu-hamil/${b.id}`} className="font-semibold text-slate-800 hover:text-rose-600">
                                {b.nama}
                              </Link>
                              <div className="text-xs text-slate-400">Suami: {b.nama_suami || '-'}</div>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="font-mono text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                                {b.nik_belum_tersedia ? 'Belum Ada NIK' : b.nik}
                              </span>
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="text-slate-700">{b.posyandu?.nama_pos}</div>
                              <div className="text-xs text-slate-400">RT {b.rt || '-'} / RW {b.rw || '-'}</div>
                            </td>
                            <td className="py-3.5 px-4">
                              {lastExam ? (
                                <div className="font-medium text-slate-800">{lastExam.usia_kehamilan_minggu} Minggu</div>
                              ) : (
                                <div className="text-xs text-slate-400">Hamil ke-{b.kehamilan_ke}</div>
                              )}
                              <div className="text-xs text-rose-500">
                                HPL: {b.hpl ? new Date(b.hpl).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                              </div>
                            </td>
                            <td className="py-3.5 px-4">
                              {lastExam ? (
                                <div>
                                  <div className="text-xs font-medium text-slate-700">
                                    {new Date(lastExam.tanggal_periksa).toLocaleDateString('id-ID')}
                                  </div>
                                  <div className="text-xs text-slate-500">
                                    BB: {lastExam.berat_kg} kg | TD: {lastExam.tekanan_darah}
                                  </div>
                                </div>
                              ) : (
                                <span className="text-xs text-slate-400 italic">Belum periksa</span>
                              )}
                            </td>
                            <td className="py-3.5 px-4">
                              {lastExam ? (
                                <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(lastExam.status_gizi_bumil)}`}>
                                  {lastExam.status_gizi_bumil} ({lastExam.lila_cm} cm)
                                </span>
                              ) : (
                                <span className="px-2.5 py-1 text-xs font-medium bg-slate-100 text-slate-500 rounded-full">
                                  Belum Ada Data
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <Link
                                href={`/ibu-hamil/${b.id}`}
                                title="Lihat Rekam Medis Lengkap"
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium transition"
                              >
                                Detail Medis
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

        {/* TAB 2: KUNJUNGAN NIFAS (KF1-KF4) */}
        {currentTab === 'nifas' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
              <h2 className="text-lg font-bold text-slate-800">Riwayat Kunjungan Nifas (KF1–KF4)</h2>
              <p className="text-slate-500 text-xs">Pencatatan data pelayanan masa nifas 42 hari pasca melahirkan</p>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-100">
                      <th className="py-3.5 px-4">Nama Ibu</th>
                      <th className="py-3.5 px-4">Tgl Melahirkan</th>
                      <th className="py-3.5 px-4">Tgl Kunjungan</th>
                      <th className="py-3.5 px-4">Periode KF</th>
                      <th className="py-3.5 px-4">TTV & Tekanan Darah</th>
                      <th className="py-3.5 px-4">Kondisi Payudara & Lokhia</th>
                      <th className="py-3.5 px-4">Tanda Bahaya</th>
                      <th className="py-3.5 px-4">Pemeriksa</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {allNifasRecords.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-slate-400">
                          Belum ada catatan kunjungan nifas.
                        </td>
                      </tr>
                    ) : (
                      allNifasRecords.map((kn) => {
                        const hasBahaya = kn.perdarahan_masif || kn.kejang || kn.syok;
                        return (
                          <tr key={kn.id} className="hover:bg-slate-50/80 transition">
                            <td className="py-3.5 px-4 font-semibold text-slate-800">
                              {kn.bumilNama}
                              <div className="text-xs text-slate-400 font-mono">{kn.bumilNik}</div>
                            </td>
                            <td className="py-3.5 px-4 text-slate-600">
                              {new Date(kn.tanggal_melahirkan).toLocaleDateString('id-ID')}
                            </td>
                            <td className="py-3.5 px-4 text-slate-600">
                              {new Date(kn.tanggal_kunjungan).toLocaleDateString('id-ID')}
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-teal-100 text-teal-800">
                                {kn.periode_kf}
                              </span>
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="font-medium text-slate-700">TD: {kn.tekanan_darah}</div>
                              <div className="text-xs text-slate-400">Suhu: {kn.suhu_tubuh}</div>
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="text-slate-700">Payudara: {kn.kondisi_payudara}</div>
                              <div className="text-xs text-slate-500">Lokhia: {kn.warna_lokhia} | ASI: {kn.produksi_asi}</div>
                            </td>
                            <td className="py-3.5 px-4">
                              {hasBahaya ? (
                                <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">
                                  <ShieldAlert className="w-3.5 h-3.5" /> Bahaya!
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                                  <CheckCircle2 className="w-3.5 h-3.5" /> Normal
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-xs text-slate-500">
                              {kn.jenis_tenaga} ({kn.userInput?.nama || 'Petugas'})
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

        {/* TAB 3: PEMANTAUAN MENYUSUI */}
        {currentTab === 'menyusui' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
              <h2 className="text-lg font-bold text-slate-800">Pemantauan Menyusui & ASI Eksklusif</h2>
              <p className="text-slate-500 text-xs">Evaluasi status produksi ASI, konseling, dan kendala menyusui</p>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-100">
                      <th className="py-3.5 px-4">Nama Ibu</th>
                      <th className="py-3.5 px-4">Tanggal Pantau</th>
                      <th className="py-3.5 px-4">Status & Produksi ASI</th>
                      <th className="py-3.5 px-4">Masalah Menyusui</th>
                      <th className="py-3.5 px-4">ASI Eksklusif</th>
                      <th className="py-3.5 px-4">Konseling</th>
                      <th className="py-3.5 px-4">Petugas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {allMenyusuiRecords.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-400">
                          Belum ada catatan pemantauan menyusui.
                        </td>
                      </tr>
                    ) : (
                      allMenyusuiRecords.map((pm) => (
                        <tr key={pm.id} className="hover:bg-slate-50/80 transition">
                          <td className="py-3.5 px-4 font-semibold text-slate-800">
                            {pm.bumilNama}
                            <div className="text-xs text-slate-400">{pm.posyandu}</div>
                          </td>
                          <td className="py-3.5 px-4 text-slate-600">
                            {new Date(pm.tanggal_pemantauan).toLocaleDateString('id-ID')}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-medium text-slate-800">{pm.status_asi}</span>
                            <span className="text-xs text-slate-500 ml-1">({pm.produksi_asi})</span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-600 text-xs">
                            {pm.masalah_menyusui || 'Tidak ada'}
                          </td>
                          <td className="py-3.5 px-4">
                            {pm.asi_eksklusif ? (
                              <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800">
                                Ya, Eksklusif
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-800">
                                Tidak Eksklusif
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-xs">
                            {pm.konseling_asi ? 'Diberikan Konseling' : 'Tidak'}
                          </td>
                          <td className="py-3.5 px-4 text-xs text-slate-500">
                            {pm.userInput?.nama || 'Petugas'}
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

        {/* TAB 4: MASTER PROFIL IBU */}
        {currentTab === 'profil' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
              <h2 className="text-lg font-bold text-slate-800">Master Data Profil Ibu (Sesuai Tabel Ibu)</h2>
              <p className="text-slate-500 text-xs">Data demografi, identitas kependudukan, status GPA, dan kepesertaan jaminan (Pendaftaran baru ada di Master Data)</p>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-100">
                      <th className="py-3.5 px-4">Nama Ibu</th>
                      <th className="py-3.5 px-4">NIK & No KK</th>
                      <th className="py-3.5 px-4">Tgl Lahir / Usia</th>
                      <th className="py-3.5 px-4">Suami</th>
                      <th className="py-3.5 px-4">Posyandu & RT/RW</th>
                      <th className="py-3.5 px-4">Riwayat GPA</th>
                      <th className="py-3.5 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredBumilList.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-800">{b.nama}</div>
                          <div className="text-xs text-slate-400">{b.no_hp || '-'}</div>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-xs text-slate-600">
                          <div>NIK: {b.nik_belum_tersedia ? 'Belum Ada NIK' : b.nik}</div>
                          <div className="text-slate-400">KK: {b.no_kk || '-'}</div>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-600">
                          {b.tanggal_lahir ? new Date(b.tanggal_lahir).toLocaleDateString('id-ID') : '-'}
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-700">
                          <div>{b.nama_suami}</div>
                          <div className="text-slate-400">NIK: {b.nik_suami || '-'}</div>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-600">
                          <div>{b.posyandu?.nama_pos}</div>
                          <div>RT {b.rt || '-'} / RW {b.rw || '-'}</div>
                        </td>
                        <td className="py-3.5 px-4 text-xs font-medium text-slate-700">
                          G{b.kehamilan_ke} P{b.jumlah_persalinan || 0} A{b.jumlah_keguguran || 0}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 text-xs font-semibold rounded bg-slate-100 text-slate-700">
                            {b.status_kehamilan || 'Hamil'}
                          </span>
                        </td>
                      </tr>
                    ))}
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
