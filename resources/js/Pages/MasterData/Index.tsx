import React, { useState, useMemo } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import AppShell from '../../Components/AppShell';
import {
  Database,
  Baby,
  Heart,
  Plus,
  Search,
  Building2,
  ChevronRight,
  Edit2,
  X,
  Phone,
  Calendar,
} from 'lucide-react';
import { UserSession } from '../../Components/Navbar';

interface ChildData {
  id: string;
  nik: string;
  no_kk?: string | null;
  nama_anak: string;
  jenis_kelamin: 'L' | 'P';
  tanggal_lahir: string;
  nama_ayah?: string | null;
  nama_ibu: string;
  no_hp_ortu?: string | null;
  alamat: string;
  berat_lahir_gram?: number | null;
  panjang_lahir_cm?: number | null;
  id_pos: string;
  posyandu: { nama_pos: string; dusun: string };
  pengukuran?: Array<{
    tanggal_ukur: string;
    berat_kg: number;
    tinggi_cm: number;
    umur_bulan: number;
    status_bbu: string;
    status_tbu: string;
    status_bbtb: string;
  }>;
}

interface BumilData {
  id: string;
  nik: string;
  nama: string;
  tanggal_lahir?: string | null;
  nama_suami: string;
  alamat: string;
  kehamilan_ke: number;
  hpht: string;
  id_pos: string;
  posyandu: { nama_pos: string };
  pengukuran?: Array<{
    tanggal_periksa: string;
    usia_kehamilan_minggu: number;
    berat_kg: number;
    lila_cm: number;
    tekanan_darah: string;
    status_gizi_bumil: string;
  }>;
}

interface MasterDataProps {
  initialChildren: ChildData[];
  initialBumilList: BumilData[];
  posyandus: any[];
}

export default function Index({
  initialChildren = [],
  initialBumilList = [],
  posyandus = [],
}: MasterDataProps) {
  const page = usePage();
  const user = (page.props as any).auth?.user as UserSession | null;

  const [activeTab, setActiveTab] = useState<'balita' | 'bumil'>('balita');

  // Search & Filter States
  const [childSearch, setChildSearch] = useState('');
  const [childPosFilter, setChildPosFilter] = useState('');
  const [bumilSearch, setBumilSearch] = useState('');
  const [bumilPosFilter, setBumilPosFilter] = useState('');

  // Children State
  const [children, setChildren] = useState<ChildData[]>(initialChildren);
  const [showChildModal, setShowChildModal] = useState(false);
  const [editingChild, setEditingChild] = useState<ChildData | null>(null);
  const [childSubmitting, setChildSubmitting] = useState(false);
  const [childError, setChildError] = useState('');

  const [childFormData, setChildFormData] = useState({
    nik: '',
    no_kk: '',
    nama_anak: '',
    jenis_kelamin: 'L',
    tanggal_lahir: '',
    nama_ayah: '',
    nama_ibu: '',
    no_hp_ortu: '',
    alamat: '',
    berat_lahir_gram: '3100',
    panjang_lahir_cm: '49',
    id_pos: posyandus[0]?.id || '',
  });

  // Bumil State
  const [bumilList, setBumilList] = useState<BumilData[]>(initialBumilList);
  const [showBumilModal, setShowBumilModal] = useState(false);
  const [editingBumil, setEditingBumil] = useState<BumilData | null>(null);
  const [bumilSubmitting, setBumilSubmitting] = useState(false);
  const [bumilError, setBumilError] = useState('');

  const [bumilFormData, setBumilFormData] = useState({
    nik: '',
    nama: '',
    tanggal_lahir: '',
    nama_suami: '',
    alamat: '',
    kehamilan_ke: '1',
    hpht: '',
    id_pos: posyandus[0]?.id || '',
  });

  // Open Child Modal Handlers
  const handleOpenAddChild = () => {
    setEditingChild(null);
    setChildError('');
    setChildFormData({
      nik: '',
      no_kk: '',
      nama_anak: '',
      jenis_kelamin: 'L',
      tanggal_lahir: '',
      nama_ayah: '',
      nama_ibu: '',
      no_hp_ortu: '',
      alamat: '',
      berat_lahir_gram: '3100',
      panjang_lahir_cm: '49',
      id_pos: posyandus[0]?.id || '',
    });
    setShowChildModal(true);
  };

  const handleOpenEditChild = (child: ChildData) => {
    setEditingChild(child);
    setChildError('');
    setChildFormData({
      nik: child.nik,
      no_kk: child.no_kk || '',
      nama_anak: child.nama_anak,
      jenis_kelamin: child.jenis_kelamin,
      tanggal_lahir: child.tanggal_lahir,
      nama_ayah: child.nama_ayah || '',
      nama_ibu: child.nama_ibu,
      no_hp_ortu: child.no_hp_ortu || '',
      alamat: child.alamat,
      berat_lahir_gram: child.berat_lahir_gram ? child.berat_lahir_gram.toString() : '3100',
      panjang_lahir_cm: child.panjang_lahir_cm ? child.panjang_lahir_cm.toString() : '49',
      id_pos: child.id_pos || posyandus[0]?.id || '',
    });
    setShowChildModal(true);
  };

  // Open Bumil Modal Handlers
  const handleOpenAddBumil = () => {
    setEditingBumil(null);
    setBumilError('');
    setBumilFormData({
      nik: '',
      nama: '',
      tanggal_lahir: '',
      nama_suami: '',
      alamat: '',
      kehamilan_ke: '1',
      hpht: '',
      id_pos: posyandus[0]?.id || '',
    });
    setShowBumilModal(true);
  };

  const handleOpenEditBumil = (bumil: BumilData) => {
    setEditingBumil(bumil);
    setBumilError('');
    setBumilFormData({
      nik: bumil.nik,
      nama: bumil.nama,
      tanggal_lahir: bumil.tanggal_lahir || '',
      nama_suami: bumil.nama_suami,
      alamat: bumil.alamat,
      kehamilan_ke: bumil.kehamilan_ke ? bumil.kehamilan_ke.toString() : '1',
      hpht: bumil.hpht,
      id_pos: bumil.id_pos || posyandus[0]?.id || '',
    });
    setShowBumilModal(true);
  };

  // Reload data
  const reloadChildren = async () => {
    const res = await fetch('/api/anak', { headers: { Accept: 'application/json' } });
    if (res.ok) {
      const data = await res.json();
      setChildren(data);
    }
  };

  const reloadBumil = async () => {
    const res = await fetch('/api/ibu-hamil', { headers: { Accept: 'application/json' } });
    if (res.ok) {
      const data = await res.json();
      setBumilList(data);
    }
  };

  // Submit Child Form
  const handleSubmitChild = async (e: React.FormEvent) => {
    e.preventDefault();
    setChildError('');
    setChildSubmitting(true);

    try {
      if (editingChild) {
        router.put(`/anak/${editingChild.id}`, childFormData, {
          onSuccess: () => {
            setShowChildModal(false);
            setEditingChild(null);
            reloadChildren();
          },
          onError: (errs) => {
            setChildError(Object.values(errs).join(', ') || 'Gagal memperbarui data balita');
          },
          onFinish: () => setChildSubmitting(false),
        });
      } else {
        const res = await fetch('/api/anak', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
          },
          body: JSON.stringify(childFormData),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Gagal mendaftarkan balita baru');

        setShowChildModal(false);
        reloadChildren();
        setChildSubmitting(false);
      }
    } catch (err: any) {
      setChildError(err.message);
      setChildSubmitting(false);
    }
  };

  // Submit Bumil Form
  const handleSubmitBumil = async (e: React.FormEvent) => {
    e.preventDefault();
    setBumilError('');
    setBumilSubmitting(true);

    try {
      if (editingBumil) {
        router.put(`/ibu-hamil/${editingBumil.id}`, bumilFormData, {
          onSuccess: () => {
            setShowBumilModal(false);
            setEditingBumil(null);
            reloadBumil();
          },
          onError: (errs) => {
            setBumilError(Object.values(errs).join(', ') || 'Gagal memperbarui data ibu hamil');
          },
          onFinish: () => setBumilSubmitting(false),
        });
      } else {
        const res = await fetch('/api/ibu-hamil', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
          },
          body: JSON.stringify(bumilFormData),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Gagal mendaftarkan ibu hamil baru');

        setShowBumilModal(false);
        reloadBumil();
        setBumilSubmitting(false);
      }
    } catch (err: any) {
      setBumilError(err.message);
      setBumilSubmitting(false);
    }
  };

  // Filtered Children
  const filteredChildren = useMemo(() => {
    return children.filter((c) => {
      if (childPosFilter && c.id_pos !== childPosFilter) return false;
      if (childSearch.trim()) {
        const q = childSearch.toLowerCase();
        const matchesName = c.nama_anak.toLowerCase().includes(q);
        const matchesNik = c.nik.includes(q);
        const matchesIbu = c.nama_ibu.toLowerCase().includes(q);
        if (!matchesName && !matchesNik && !matchesIbu) return false;
      }
      return true;
    });
  }, [children, childSearch, childPosFilter]);

  // Filtered Bumil
  const filteredBumilList = useMemo(() => {
    return bumilList.filter((b) => {
      if (bumilPosFilter && b.id_pos !== bumilPosFilter) return false;
      if (bumilSearch.trim()) {
        const q = bumilSearch.toLowerCase();
        const matchesName = b.nama.toLowerCase().includes(q);
        const matchesNik = b.nik.includes(q);
        const matchesSuami = b.nama_suami.toLowerCase().includes(q);
        if (!matchesName && !matchesNik && !matchesSuami) return false;
      }
      return true;
    });
  }, [bumilList, bumilSearch, bumilPosFilter]);

  return (
    <AppShell user={user}>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-brand-600 uppercase tracking-wider mb-1">
              <Database className="w-4 h-4" />
              <span>Kelola Sasaran • Khusus Koordinator & Admin</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Master Data Posyandu
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Pusat pendaftaran dan pengelolaan data master sasaran Balita dan Ibu Hamil Desa Sukomalo
            </p>
          </div>

          {/* Tab Selector */}
          <div className="flex items-center p-1 bg-slate-100 rounded-2xl shrink-0 self-start sm:self-auto border border-slate-200/80">
            <button
              onClick={() => setActiveTab('balita')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 min-h-[40px] ${
                activeTab === 'balita'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Baby className="w-4 h-4" />
              <span>Data Balita ({children.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('bumil')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 min-h-[40px] ${
                activeTab === 'bumil'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Heart className="w-4 h-4" />
              <span>Data Ibu Hamil ({bumilList.length})</span>
            </button>
          </div>
        </div>

        {/* ============================================================== */}
        {/* TAB 1: MASTER DATA BALITA                                       */}
        {/* ============================================================== */}
        {activeTab === 'balita' && (
          <div className="space-y-4">
            {/* Action Bar: Search, Posyandu Filter & Add Button */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto flex-1">
                {/* Search */}
                <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={childSearch}
                    onChange={(e) => setChildSearch(e.target.value)}
                    placeholder="Cari NIK, nama anak, atau nama ibu..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 min-h-[44px]"
                  />
                </div>

                {/* Posyandu Filter */}
                <div className="w-full sm:w-56">
                  <select
                    value={childPosFilter}
                    onChange={(e) => setChildPosFilter(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 min-h-[44px] bg-white"
                  >
                    <option value="">Semua Posyandu (6 Pos)</option>
                    {posyandus.map((p) => (
                      <option key={p.id} value={p.id}>
                        Posyandu {p.nama_pos}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Tambah Balita Button */}
              <button
                onClick={handleOpenAddChild}
                className="w-full md:w-auto inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm rounded-xl transition-all shadow-md shadow-teal-600/20 min-h-[44px] shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>+ Tambah Data Balita</span>
              </button>
            </div>

            {/* Table Children */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
              {filteredChildren.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-700 border-b border-slate-200">
                        <th className="p-3.5 font-bold">NIK & KK</th>
                        <th className="p-3.5 font-bold">Nama Balita</th>
                        <th className="p-3.5 font-bold">Jenis Kelamin</th>
                        <th className="p-3.5 font-bold">Tanggal Lahir</th>
                        <th className="p-3.5 font-bold">Orang Tua</th>
                        <th className="p-3.5 font-bold">Posyandu</th>
                        <th className="p-3.5 font-bold">Lahir (BB/TB)</th>
                        <th className="p-3.5 font-bold text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredChildren.map((child) => (
                        <tr key={child.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3.5">
                            <div className="font-bold text-slate-900">{child.nik}</div>
                            {child.no_kk && <div className="text-[10px] text-slate-400">KK: {child.no_kk}</div>}
                          </td>
                          <td className="p-3.5">
                            <div className="font-bold text-slate-900">{child.nama_anak}</div>
                            <div className="text-[10px] text-slate-500">{child.alamat}</div>
                          </td>
                          <td className="p-3.5">
                            <span
                              className={`inline-block px-2 py-0.5 rounded-full font-bold text-[10px] ${
                                child.jenis_kelamin === 'L'
                                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                  : 'bg-pink-50 text-pink-700 border border-pink-200'
                              }`}
                            >
                              {child.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
                            </span>
                          </td>
                          <td className="p-3.5 font-medium text-slate-700">
                            {new Date(child.tanggal_lahir).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </td>
                          <td className="p-3.5">
                            <div className="font-semibold text-slate-800">Ibu: {child.nama_ibu}</div>
                            {child.nama_ayah && <div className="text-[10px] text-slate-400">Ayah: {child.nama_ayah}</div>}
                            {child.no_hp_ortu && (
                              <div className="text-[10px] text-emerald-600 flex items-center gap-1 mt-0.5">
                                <Phone className="w-2.5 h-2.5" />
                                <span>{child.no_hp_ortu}</span>
                              </div>
                            )}
                          </td>
                          <td className="p-3.5">
                            <span className="font-bold text-slate-800">
                              Pos {child.posyandu?.nama_pos || '-'}
                            </span>
                          </td>
                          <td className="p-3.5 text-[11px] text-slate-600">
                            {child.berat_lahir_gram ? `${child.berat_lahir_gram} g` : '-'} /{' '}
                            {child.panjang_lahir_cm ? `${child.panjang_lahir_cm} cm` : '-'}
                          </td>
                          <td className="p-3.5 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => handleOpenEditChild(child)}
                                className="p-2 text-teal-700 hover:bg-teal-50 rounded-lg transition-colors border border-teal-200"
                                title="Edit Data Balita"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <Link
                                href={`/anak/${child.id}`}
                                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold text-[11px] inline-flex items-center gap-1 transition-colors"
                              >
                                <span>Detail</span>
                                <ChevronRight className="w-3 h-3" />
                              </Link>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-12 text-center space-y-2">
                  <Baby className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="font-bold text-slate-700 text-sm">Tidak ada data balita ditemukan</p>
                  <p className="text-xs text-slate-400">Silakan sesuaikan filter posyandu atau kata kunci pencarian.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: MASTER DATA IBU HAMIL                                   */}
        {/* ============================================================== */}
        {activeTab === 'bumil' && (
          <div className="space-y-4">
            {/* Action Bar: Search, Posyandu Filter & Add Button */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto flex-1">
                {/* Search */}
                <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={bumilSearch}
                    onChange={(e) => setBumilSearch(e.target.value)}
                    placeholder="Cari NIK, nama ibu, atau nama suami..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 min-h-[44px]"
                  />
                </div>

                {/* Posyandu Filter */}
                <div className="w-full sm:w-56">
                  <select
                    value={bumilPosFilter}
                    onChange={(e) => setBumilPosFilter(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 min-h-[44px] bg-white"
                  >
                    <option value="">Semua Posyandu (6 Pos)</option>
                    {posyandus.map((p) => (
                      <option key={p.id} value={p.id}>
                        Posyandu {p.nama_pos}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Tambah Bumil Button */}
              <button
                onClick={handleOpenAddBumil}
                className="w-full md:w-auto inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm rounded-xl transition-all shadow-md shadow-rose-600/20 min-h-[44px] shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>+ Tambah Data Ibu Hamil</span>
              </button>
            </div>

            {/* Table Bumil */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
              {filteredBumilList.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-700 border-b border-slate-200">
                        <th className="p-3.5 font-bold">NIK</th>
                        <th className="p-3.5 font-bold">Nama Ibu Hamil</th>
                        <th className="p-3.5 font-bold">Nama Suami</th>
                        <th className="p-3.5 font-bold">Kehamilan Ke (G)</th>
                        <th className="p-3.5 font-bold">HPHT</th>
                        <th className="p-3.5 font-bold">Posyandu</th>
                        <th className="p-3.5 font-bold">Alamat</th>
                        <th className="p-3.5 font-bold text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredBumilList.map((bumil) => (
                        <tr key={bumil.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3.5">
                            <span className="font-bold text-slate-900">{bumil.nik}</span>
                          </td>
                          <td className="p-3.5">
                            <div className="font-bold text-slate-900">{bumil.nama}</div>
                            {bumil.tanggal_lahir && (
                              <div className="text-[10px] text-slate-400">
                                Lahir: {new Date(bumil.tanggal_lahir).toLocaleDateString('id-ID')}
                              </div>
                            )}
                          </td>
                          <td className="p-3.5 font-medium text-slate-700">
                            {bumil.nama_suami}
                          </td>
                          <td className="p-3.5">
                            <span className="inline-block px-2 py-0.5 rounded-full font-bold text-[10px] bg-purple-50 text-purple-700 border border-purple-200">
                              G{bumil.kehamilan_ke}
                            </span>
                          </td>
                          <td className="p-3.5 font-medium text-slate-700">
                            {new Date(bumil.hpht).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </td>
                          <td className="p-3.5">
                            <span className="font-bold text-slate-800">
                              Pos {bumil.posyandu?.nama_pos || '-'}
                            </span>
                          </td>
                          <td className="p-3.5 text-slate-600 max-w-[200px] truncate">
                            {bumil.alamat}
                          </td>
                          <td className="p-3.5 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => handleOpenEditBumil(bumil)}
                                className="p-2 text-rose-700 hover:bg-rose-50 rounded-lg transition-colors border border-rose-200"
                                title="Edit Data Ibu Hamil"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <Link
                                href={`/ibu-hamil/${bumil.id}`}
                                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold text-[11px] inline-flex items-center gap-1 transition-colors"
                              >
                                <span>Detail</span>
                                <ChevronRight className="w-3 h-3" />
                              </Link>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-12 text-center space-y-2">
                  <Heart className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="font-bold text-slate-700 text-sm">Tidak ada data ibu hamil ditemukan</p>
                  <p className="text-xs text-slate-400">Silakan sesuaikan filter posyandu atau kata kunci pencarian.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* MODAL FORM TAMBAH / EDIT BALITA                                */}
      {/* ============================================================== */}
      {showChildModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                <Baby className="w-5 h-5 text-teal-600" />
                <span>{editingChild ? 'Edit Data Balita' : 'Tambah Data Balita Baru'}</span>
              </h3>
              <button
                onClick={() => setShowChildModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 min-h-[40px] min-w-[40px] flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {childError && (
              <div className="p-3 bg-rose-50 text-rose-700 rounded-xl text-xs border border-rose-200 font-medium">
                {childError}
              </div>
            )}

            <form onSubmit={handleSubmitChild} className="space-y-3">
              {/* Posyandu Sasaran (Selector for Coordinator / Admin) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Posyandu Sasaran *</label>
                <select
                  required
                  value={childFormData.id_pos}
                  onChange={(e) => setChildFormData({ ...childFormData, id_pos: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm min-h-[44px] bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                >
                  {posyandus.map((p) => (
                    <option key={p.id} value={p.id}>
                      Posyandu {p.nama_pos} ({p.dusun})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">NIK Anak (16 Digit) *</label>
                  <input
                    type="text"
                    required
                    maxLength={16}
                    value={childFormData.nik}
                    onChange={(e) => setChildFormData({ ...childFormData, nik: e.target.value })}
                    placeholder="Contoh: 3507123456780001"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm min-h-[44px] focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">No. KK (Opsional)</label>
                  <input
                    type="text"
                    maxLength={16}
                    value={childFormData.no_kk}
                    onChange={(e) => setChildFormData({ ...childFormData, no_kk: e.target.value })}
                    placeholder="16 digit KK"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm min-h-[44px] focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Lengkap Anak *</label>
                <input
                  type="text"
                  required
                  value={childFormData.nama_anak}
                  onChange={(e) => setChildFormData({ ...childFormData, nama_anak: e.target.value })}
                  placeholder="Nama balita"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm min-h-[44px] focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Jenis Kelamin *</label>
                  <select
                    value={childFormData.jenis_kelamin}
                    onChange={(e) => setChildFormData({ ...childFormData, jenis_kelamin: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm min-h-[44px] bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  >
                    <option value="L">Laki-laki (L)</option>
                    <option value="P">Perempuan (P)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tanggal Lahir *</label>
                  <input
                    type="date"
                    required
                    value={childFormData.tanggal_lahir}
                    onChange={(e) => setChildFormData({ ...childFormData, tanggal_lahir: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm min-h-[44px] focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Ibu Kandung *</label>
                  <input
                    type="text"
                    required
                    value={childFormData.nama_ibu}
                    onChange={(e) => setChildFormData({ ...childFormData, nama_ibu: e.target.value })}
                    placeholder="Nama ibu"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm min-h-[44px] focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Ayah</label>
                  <input
                    type="text"
                    value={childFormData.nama_ayah}
                    onChange={(e) => setChildFormData({ ...childFormData, nama_ayah: e.target.value })}
                    placeholder="Nama ayah"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm min-h-[44px] focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Berat Lahir (gram) *</label>
                  <input
                    type="number"
                    required
                    value={childFormData.berat_lahir_gram}
                    onChange={(e) => setChildFormData({ ...childFormData, berat_lahir_gram: e.target.value })}
                    placeholder="Contoh: 3100"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm min-h-[44px] focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Panjang Lahir (cm) *</label>
                  <input
                    type="number"
                    required
                    step="0.1"
                    value={childFormData.panjang_lahir_cm}
                    onChange={(e) => setChildFormData({ ...childFormData, panjang_lahir_cm: e.target.value })}
                    placeholder="Contoh: 49"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm min-h-[44px] focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">No. WhatsApp / HP Ortu</label>
                <input
                  type="text"
                  value={childFormData.no_hp_ortu}
                  onChange={(e) => setChildFormData({ ...childFormData, no_hp_ortu: e.target.value })}
                  placeholder="Contoh: 08123456789"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm min-h-[44px] focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Alamat Domisili *</label>
                <textarea
                  required
                  rows={2}
                  value={childFormData.alamat}
                  onChange={(e) => setChildFormData({ ...childFormData, alamat: e.target.value })}
                  placeholder="RT/RW atau alamat lengkap di Desa Sukomalo"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowChildModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-semibold text-xs min-h-[44px]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={childSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-md shadow-teal-600/20 disabled:opacity-60 min-h-[44px]"
                >
                  {childSubmitting ? 'Menyimpan Data...' : editingChild ? 'Perbarui Data' : 'Simpan Balita Baru'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL FORM TAMBAH / EDIT IBU HAMIL                             */}
      {/* ============================================================== */}
      {showBumilModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-600" />
                <span>{editingBumil ? 'Edit Data Ibu Hamil' : 'Tambah Data Ibu Hamil Baru'}</span>
              </h3>
              <button
                onClick={() => setShowBumilModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 min-h-[40px] min-w-[40px] flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {bumilError && (
              <div className="p-3 bg-rose-50 text-rose-700 rounded-xl text-xs border border-rose-200 font-medium">
                {bumilError}
              </div>
            )}

            <form onSubmit={handleSubmitBumil} className="space-y-3">
              {/* Posyandu Sasaran */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Posyandu Sasaran *</label>
                <select
                  required
                  value={bumilFormData.id_pos}
                  onChange={(e) => setBumilFormData({ ...bumilFormData, id_pos: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm min-h-[44px] bg-slate-50 focus:bg-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
                >
                  {posyandus.map((p) => (
                    <option key={p.id} value={p.id}>
                      Posyandu {p.nama_pos} ({p.dusun})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">NIK Ibu Hamil (16 Digit) *</label>
                  <input
                    type="text"
                    required
                    maxLength={16}
                    value={bumilFormData.nik}
                    onChange={(e) => setBumilFormData({ ...bumilFormData, nik: e.target.value })}
                    placeholder="Contoh: 3507123456780002"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm min-h-[44px] focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Lengkap Ibu *</label>
                  <input
                    type="text"
                    required
                    value={bumilFormData.nama}
                    onChange={(e) => setBumilFormData({ ...bumilFormData, nama: e.target.value })}
                    placeholder="Nama lengkap ibu"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm min-h-[44px] focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tanggal Lahir Ibu *</label>
                  <input
                    type="date"
                    required
                    value={bumilFormData.tanggal_lahir}
                    onChange={(e) => setBumilFormData({ ...bumilFormData, tanggal_lahir: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm min-h-[44px] focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Suami *</label>
                  <input
                    type="text"
                    required
                    value={bumilFormData.nama_suami}
                    onChange={(e) => setBumilFormData({ ...bumilFormData, nama_suami: e.target.value })}
                    placeholder="Nama suami"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm min-h-[44px] focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Kehamilan Ke (G) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={bumilFormData.kehamilan_ke}
                    onChange={(e) => setBumilFormData({ ...bumilFormData, kehamilan_ke: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm min-h-[44px] focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">HPHT (Hari Pertama Haid Terakhir) *</label>
                  <input
                    type="date"
                    required
                    value={bumilFormData.hpht}
                    onChange={(e) => setBumilFormData({ ...bumilFormData, hpht: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm min-h-[44px] focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Alamat Domisili *</label>
                <textarea
                  required
                  rows={2}
                  value={bumilFormData.alamat}
                  onChange={(e) => setBumilFormData({ ...bumilFormData, alamat: e.target.value })}
                  placeholder="RT/RW atau alamat lengkap di Desa Sukomalo"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowBumilModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-semibold text-xs min-h-[44px]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={bumilSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-md shadow-rose-600/20 disabled:opacity-60 min-h-[44px]"
                >
                  {bumilSubmitting ? 'Menyimpan Data...' : editingBumil ? 'Perbarui Data' : 'Simpan Ibu Hamil Baru'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
