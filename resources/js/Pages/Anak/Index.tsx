import React, { useState, useEffect, useMemo } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import AppShell from '../../Components/AppShell';
import {
  Baby,
  Search,
  Plus,
  ChevronRight,
  X,
  Building2,
  Edit2,
  Scale,
  Syringe,
  Pill,
  Activity,
  CheckCircle2,
  AlertCircle,
  Calendar,
} from 'lucide-react';
import {
  getStatusBadgeColor,
  calculateAgeInMonths,
  classifyNutritionStatus,
} from '../../lib/statusGizi';
import { UserSession } from '../../Components/Navbar';

interface ChildData {
  id: string;
  nik: string;
  no_kk?: string;
  nama_anak: string;
  jenis_kelamin: 'L' | 'P';
  tanggal_lahir: string;
  nama_ayah?: string;
  nama_ibu: string;
  no_hp_ortu?: string;
  alamat: string;
  berat_lahir_gram?: number | string;
  panjang_lahir_cm?: number | string;
  id_pos: string;
  posyandu: { nama_pos: string; dusun: string };
  pengukuran: Array<{
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
  posyandus: any[];
  masterImunisasi?: string[];
  masterVitamin?: string[];
}

const DEFAULT_IMUNISASI = [
  'HB-0 (0-7 Hari)',
  'BCG',
  'Polio 1',
  'DPT-HB-Hib 1',
  'Polio 2',
  'DPT-HB-Hib 2',
  'Polio 3',
  'DPT-HB-Hib 3',
  'Polio 4',
  'IPV',
  'Campak / MR 1',
  'PCV 1',
  'PCV 2',
  'PCV 3',
  'Booster DPT-HB-Hib',
  'Booster Campak / MR 2',
];

const DEFAULT_VITAMIN = [
  'Vitamin A Biru (100.000 IU) - Bayi 6-11 Bulan',
  'Vitamin A Merah (200.000 IU) - Balita 12-59 Bulan',
];

export default function Index({
  initialChildren = [],
  posyandus = [],
  masterImunisasi = [],
  masterVitamin = [],
}: AnakIndexProps) {
  const page = usePage();
  const user = (page.props as any).auth?.user as UserSession | null;

  const [children, setChildren] = useState<ChildData[]>(initialChildren);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');
  const [posyanduFilter, setPosyanduFilter] = useState('');

  const imunisasiList = useMemo(() => {
    return Array.from(new Set([...DEFAULT_IMUNISASI, ...(masterImunisasi || [])]));
  }, [masterImunisasi]);

  const vitaminList = useMemo(() => {
    return Array.from(new Set([...DEFAULT_VITAMIN, ...(masterVitamin || [])]));
  }, [masterVitamin]);

  // Unified Service Modal States
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [selectedChildForService, setSelectedChildForService] = useState<ChildData | null>(null);
  const [childSearchQuery, setChildSearchQuery] = useState('');
  const [isChildDropdownOpen, setIsChildDropdownOpen] = useState(false);
  const [serviceTab, setServiceTab] = useState<'pengukuran' | 'imunisasi' | 'vitamin'>('pengukuran');
  const [serviceSubmitting, setServiceSubmitting] = useState(false);
  const [serviceError, setServiceError] = useState('');
  const [serviceSuccess, setServiceSuccess] = useState('');

  const filteredChildrenForModal = useMemo(() => {
    if (!childSearchQuery.trim()) return children.slice(0, 15);
    const q = childSearchQuery.toLowerCase();
    return children.filter(
      (c) =>
        c.nama_anak.toLowerCase().includes(q) ||
        c.nik.includes(q) ||
        (c.nama_ibu && c.nama_ibu.toLowerCase().includes(q))
    );
  }, [children, childSearchQuery]);

  // Form Pengukuran
  const [tanggalUkur, setTanggalUkur] = useState(new Date().toISOString().split('T')[0]);
  const [beratKg, setBeratKg] = useState('');
  const [tinggiCm, setTinggiCm] = useState('');
  const [caraUkur, setCaraUkur] = useState<'berdiri' | 'telentang'>('telentang');
  const [lilaCm, setLilaCm] = useState('');

  // Form Imunisasi
  const [tanggalImunisasi, setTanggalImunisasi] = useState(new Date().toISOString().split('T')[0]);
  const [jenisImunisasi, setJenisImunisasi] = useState('');

  // Form Vitamin
  const [tanggalVitamin, setTanggalVitamin] = useState(new Date().toISOString().split('T')[0]);
  const [jenisVitamin, setJenisVitamin] = useState('');
  const [keteranganVitamin, setKeteranganVitamin] = useState('');

  const handleSelectChild = (child: ChildData) => {
    setSelectedChildForService(child);
    setChildSearchQuery(child.nama_anak);
    setIsChildDropdownOpen(false);
    setServiceError('');

    const todayStr = tanggalUkur || new Date().toISOString().split('T')[0];
    const ageM = calculateAgeInMonths(child.tanggal_lahir, todayStr);
    setCaraUkur(ageM >= 24 ? 'berdiri' : 'telentang');

    const defaultVit =
      ageM < 12
        ? vitaminList.find((v) => v.toLowerCase().includes('biru')) || vitaminList[0]
        : vitaminList.find((v) => v.toLowerCase().includes('merah')) || vitaminList[0];
    setJenisVitamin(defaultVit || '');
  };

  const handleOpenServiceModal = (
    child: ChildData | null = null,
    tab: 'pengukuran' | 'imunisasi' | 'vitamin' = 'pengukuran'
  ) => {
    setSelectedChildForService(child);
    setChildSearchQuery(child ? child.nama_anak : '');
    setIsChildDropdownOpen(false);
    setServiceTab(tab);
    setServiceError('');
    setServiceSuccess('');

    const todayStr = new Date().toISOString().split('T')[0];
    setTanggalUkur(todayStr);
    setBeratKg('');
    setTinggiCm('');
    setLilaCm('');

    if (child) {
      const ageM = calculateAgeInMonths(child.tanggal_lahir, todayStr);
      setCaraUkur(ageM >= 24 ? 'berdiri' : 'telentang');
      const defaultVit =
        ageM < 12
          ? vitaminList.find((v) => v.toLowerCase().includes('biru')) || vitaminList[0]
          : vitaminList.find((v) => v.toLowerCase().includes('merah')) || vitaminList[0];
      setJenisVitamin(defaultVit || '');
    } else {
      setCaraUkur('telentang');
      setJenisVitamin(vitaminList[0] || '');
    }

    setTanggalImunisasi(todayStr);
    setJenisImunisasi(imunisasiList[0] || 'BCG');
    setTanggalVitamin(todayStr);
    setKeteranganVitamin('Pemberian Posyandu Rutin');

    setShowServiceModal(true);
  };

  const handleServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChildForService) {
      setServiceError('Silakan cari dan pilih nama balita terlebih dahulu.');
      return;
    }

    setServiceError('');
    setServiceSuccess('');
    setServiceSubmitting(true);

    const csrfToken =
      (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '';

    try {
      if (serviceTab === 'pengukuran') {
        if (!beratKg || !tinggiCm) {
          throw new Error('Berat Badan dan Tinggi Badan wajib diisi.');
        }

        const res = await fetch(`/api/anak/${selectedChildForService.id}/pengukuran`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'X-CSRF-TOKEN': csrfToken,
          },
          body: JSON.stringify({
            tanggal_ukur: tanggalUkur,
            berat_kg: parseFloat(beratKg),
            tinggi_cm: parseFloat(tinggiCm),
            cara_ukur: caraUkur,
            lila_cm: lilaCm ? parseFloat(lilaCm) : null,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          const errMsg = data.errors
            ? Object.values(data.errors).flat().join(', ')
            : data.error || data.message || 'Gagal menyimpan pengukuran';
          throw new Error(errMsg);
        }

        setServiceSuccess('Data pengukuran antropometri berhasil disimpan!');
      } else if (serviceTab === 'imunisasi') {
        if (!jenisImunisasi) {
          throw new Error('Pilih jenis imunisasi terlebih dahulu.');
        }

        const res = await fetch('/imunisasi', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'X-CSRF-TOKEN': csrfToken,
          },
          body: JSON.stringify({
            id_anak: selectedChildForService.id,
            jenis_imunisasi: jenisImunisasi,
            tanggal: tanggalImunisasi,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          const errMsg = data.errors
            ? Object.values(data.errors).flat().join(', ')
            : data.error || data.message || 'Gagal menyimpan data imunisasi';
          throw new Error(errMsg);
        }

        setServiceSuccess('Data pencatatan imunisasi berhasil disimpan!');
      } else if (serviceTab === 'vitamin') {
        if (!jenisVitamin) {
          throw new Error('Pilih jenis vitamin terlebih dahulu.');
        }

        const res = await fetch('/vitamin', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'X-CSRF-TOKEN': csrfToken,
          },
          body: JSON.stringify({
            id_anak: selectedChildForService.id,
            jenis_vitamin: jenisVitamin,
            tanggal: tanggalVitamin,
            keterangan: keteranganVitamin || null,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          const errMsg = data.errors
            ? Object.values(data.errors).flat().join(', ')
            : data.error || data.message || 'Gagal menyimpan data vitamin';
          throw new Error(errMsg);
        }

        setServiceSuccess('Data pemberian vitamin A berhasil disimpan!');
      }

      await loadChildren();
      setTimeout(() => {
        setShowServiceModal(false);
      }, 1200);
    } catch (err: any) {
      setServiceError(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setServiceSubmitting(false);
    }
  };

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingChild, setEditingChild] = useState<ChildData | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const [formData, setFormData] = useState({
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
    id_pos: user?.id_pos || '',
  });

  const handleOpenAddModal = () => {
    setEditingChild(null);
    setFormError('');
    setFormData({
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
      id_pos: user?.id_pos || '',
    });
    setShowAddModal(true);
  };

  const handleOpenEditModal = (child: ChildData) => {
    setEditingChild(child);
    setFormError('');
    setFormData({
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
      id_pos: child.id_pos || '',
    });
    setShowAddModal(true);
  };

  const loadChildren = async (s = search, p = posyanduFilter) => {
    let url = `/api/anak?search=${encodeURIComponent(s)}`;
    if (p) url += `&posyanduId=${p}`;
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (res.ok) {
      const data = await res.json();
      setChildren(data);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearch(val);
    loadChildren(val, posyanduFilter);
  };

  const handlePosFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setPosyanduFilter(val);
    loadChildren(search, val);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSubmitting(true);

    try {
      if (editingChild) {
        router.put(`/anak/${editingChild.id}`, formData, {
          onSuccess: () => {
            setShowAddModal(false);
            setEditingChild(null);
            loadChildren();
          },
          onError: (errs) => {
            setFormError(Object.values(errs).join(', ') || 'Gagal memperbarui data balita');
          },
          onFinish: () => setFormSubmitting(false),
        });
      } else {
        const res = await fetch('/api/anak', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Gagal menyimpan anak baru');

        setShowAddModal(false);
        loadChildren();
        setFormSubmitting(false);
      }
    } catch (err: any) {
      setFormError(err.message);
      setFormSubmitting(false);
    }
  };

  const filteredChildren = children.filter((c) => {
    if (statusFilter === 'Semua') return true;
    const lastNut = c.pengukuran ? c.pengukuran[0] : null;
    if (!lastNut) return false;
    if (statusFilter === 'Normal') return lastNut.status_tbu === 'Normal' && lastNut.status_bbu === 'Normal';
    if (statusFilter === 'Stunting / Pendek') return lastNut.status_tbu === 'Pendek' || lastNut.status_tbu === 'Sangat Pendek';
    if (statusFilter === 'Gizi Kurang / Buruk') return lastNut.status_bbu === 'Gizi Kurang' || lastNut.status_bbu === 'Gizi Buruk';
    return true;
  });

  const previewAgeM =
    selectedChildForService && tanggalUkur
      ? calculateAgeInMonths(selectedChildForService.tanggal_lahir, tanggalUkur)
      : 0;

  const nutPreview =
    selectedChildForService &&
    beratKg &&
    tinggiCm &&
    !isNaN(parseFloat(beratKg)) &&
    !isNaN(parseFloat(tinggiCm))
      ? classifyNutritionStatus(
          parseFloat(beratKg),
          parseFloat(tinggiCm),
          previewAgeM,
          selectedChildForService.jenis_kelamin
        )
      : null;

  const badgeTbuPreview = nutPreview ? getStatusBadgeColor(nutPreview.status_tbu) : null;
  const badgeBbuPreview = nutPreview ? getStatusBadgeColor(nutPreview.status_bbu) : null;
  const badgeBbtbPreview = nutPreview ? getStatusBadgeColor(nutPreview.status_bbtb) : null;

  return (
    <AppShell user={user}>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Daftar Anak Balita
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Kelola data sasaran balita & riwayat tumbuh kembang
            </p>
          </div>

          <div>
            <button
              type="button"
              onClick={() => handleOpenServiceModal()}
              className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-brand-600/20 min-h-[44px]"
            >
              <Plus className="w-4 h-4" />
              <span>Catat Pelayanan</span>
            </button>
          </div>
        </div>

        {/* Filters & Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={handleSearchChange}
              placeholder="Cari NIK, nama anak, atau nama ibu..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 min-h-[44px]"
            />
          </div>

          {/* Posyandu Filter */}
          {user && (user.role === 'koordinator' || user.role === 'admin') && (
            <div className="w-full md:w-48">
              <select
                value={posyanduFilter}
                onChange={handlePosFilterChange}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 min-h-[44px] bg-white"
              >
                <option value="">Semua Posyandu</option>
                {posyandus.map((p) => (
                  <option key={p.id} value={p.id}>
                    Posyandu {p.nama_pos}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Nutrition Status Filter */}
          <div className="w-full md:w-52">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 min-h-[44px] bg-white"
            >
              <option value="Semua">Semua Status Gizi</option>
              <option value="Normal">Normal</option>
              <option value="Stunting / Pendek">Stunting / Pendek</option>
              <option value="Gizi Kurang / Buruk">Gizi Kurang / Buruk</option>
            </select>
          </div>
        </div>

        {/* Children Grid / List */}
        {filteredChildren.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredChildren.map((child) => {
              const ageM = calculateAgeInMonths(child.tanggal_lahir, new Date());
              const lastNut = child.pengukuran ? child.pengukuran[0] : null;
              const badgeTbu = lastNut ? getStatusBadgeColor(lastNut.status_tbu) : null;
              const badgeBbu = lastNut ? getStatusBadgeColor(lastNut.status_bbu) : null;

              return (
                <div
                  key={child.id}
                  className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                            child.jenis_kelamin === 'L'
                              ? 'bg-sky-100 text-sky-700'
                              : 'bg-rose-100 text-rose-700'
                          }`}
                        >
                          {child.jenis_kelamin}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 text-base leading-tight">
                            {child.nama_anak}
                          </h3>
                          <p className="text-xs text-slate-400 font-mono mt-0.5">NIK: {child.nik}</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl text-xs">
                      <div>
                        <span className="text-slate-400 block">Umur:</span>
                        <span className="font-bold text-slate-800">{ageM} Bulan</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Ibu Kandung:</span>
                        <span className="font-semibold text-slate-800">{child.nama_ibu}</span>
                      </div>
                      <div className="col-span-2 pt-1 border-t border-slate-200/60 flex items-center gap-1 text-[11px] text-slate-500">
                        <Building2 className="w-3 h-3 text-brand-600" />
                        <span>Posyandu {child.posyandu?.nama_pos}</span>
                      </div>
                    </div>

                    {/* Status Badges */}
                    <div className="space-y-1">
                      <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Status Terakhir:</div>
                      {lastNut ? (
                        <div className="flex flex-wrap gap-1.5">
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${badgeTbu?.bg} ${badgeTbu?.text} ${badgeTbu?.border}`}>
                            TB/U: {lastNut.status_tbu}
                          </span>
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${badgeBbu?.bg} ${badgeBbu?.text} ${badgeBbu?.border}`}>
                            BB/U: {lastNut.status_bbu}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Belum pernah diukur</span>
                      )}
                    </div>
                  </div>

                  {/* Actions: Hanya untuk edit data dan detail balita */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(child)}
                      className="flex-1 py-2 px-3 text-center bg-brand-50 hover:bg-brand-100 text-brand-700 font-semibold text-xs rounded-xl transition-colors min-h-[44px] flex items-center justify-center space-x-1.5 border border-brand-200"
                      title="Edit Data Balita"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-brand-600" />
                      <span>Edit Data</span>
                    </button>

                    <Link
                      href={`/anak/${child.id}`}
                      className="flex-1 py-2 px-3 text-center bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors min-h-[44px] flex items-center justify-center space-x-1"
                    >
                      <span>Detail & Grafik</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 bg-white rounded-2xl border border-dashed border-slate-300 text-center space-y-3">
            <Baby className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="font-bold text-slate-700">Tidak ada data anak ditemukan</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Coba sesuaikan kata kunci pencarian atau filter status gizi.
            </p>
          </div>
        )}

        {/* Modal Tambah / Edit Anak */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-900 text-lg">
                  {editingChild ? 'Edit Data Balita' : 'Tambah Data Balita Baru'}
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {formError && (
                <div className="p-3 bg-rose-50 text-rose-700 rounded-xl text-xs border border-rose-200">
                  {formError}
                </div>
              )}

              <form onSubmit={handleAddSubmit} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">NIK Anak *</label>
                    <input
                      type="text"
                      required
                      value={formData.nik}
                      onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                      placeholder="16 digit NIK"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm min-h-[44px]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">No. KK (Opsional)</label>
                    <input
                      type="text"
                      value={formData.no_kk}
                      onChange={(e) => setFormData({ ...formData, no_kk: e.target.value })}
                      placeholder="16 digit KK"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm min-h-[44px]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Lengkap Anak *</label>
                  <input
                    type="text"
                    required
                    value={formData.nama_anak}
                    onChange={(e) => setFormData({ ...formData, nama_anak: e.target.value })}
                    placeholder="Nama balita"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm min-h-[44px]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Jenis Kelamin *</label>
                    <select
                      value={formData.jenis_kelamin}
                      onChange={(e) => setFormData({ ...formData, jenis_kelamin: e.target.value as any })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm min-h-[44px] bg-white"
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
                      value={formData.tanggal_lahir}
                      onChange={(e) => setFormData({ ...formData, tanggal_lahir: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm min-h-[44px]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Ibu *</label>
                    <input
                      type="text"
                      required
                      value={formData.nama_ibu}
                      onChange={(e) => setFormData({ ...formData, nama_ibu: e.target.value })}
                      placeholder="Nama ibu kandung"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm min-h-[44px]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Ayah</label>
                    <input
                      type="text"
                      value={formData.nama_ayah}
                      onChange={(e) => setFormData({ ...formData, nama_ayah: e.target.value })}
                      placeholder="Nama ayah"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm min-h-[44px]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Berat Lahir (gram) *</label>
                    <input
                      type="number"
                      required
                      value={formData.berat_lahir_gram}
                      onChange={(e) => setFormData({ ...formData, berat_lahir_gram: e.target.value })}
                      placeholder="Contoh: 3100"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm min-h-[44px]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Panjang Lahir (cm) *</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={formData.panjang_lahir_cm}
                      onChange={(e) => setFormData({ ...formData, panjang_lahir_cm: e.target.value })}
                      placeholder="Contoh: 49.0"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm min-h-[44px]"
                    />
                  </div>
                </div>

                {user && user.role !== 'kader' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Posyandu *</label>
                    <select
                      value={formData.id_pos}
                      onChange={(e) => setFormData({ ...formData, id_pos: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm min-h-[44px] bg-white"
                    >
                      <option value="">Pilih Posyandu</option>
                      {posyandus.map((p) => (
                        <option key={p.id} value={p.id}>
                          Posyandu {p.nama_pos}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Alamat Lengkap *</label>
                  <textarea
                    required
                    value={formData.alamat}
                    onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                    rows={2}
                    placeholder="RT/RW Dusun, Sukomalo"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                  />
                </div>

                <div className="pt-3 flex items-center justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl min-h-[44px]"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={formSubmitting}
                    className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl shadow-md min-h-[44px] disabled:opacity-60"
                  >
                    {formSubmitting ? 'Menyimpan...' : 'Simpan Balita'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Catat Pelayanan Posyandu Terpadu (Pengukuran, Imunisasi, Vitamin) */}
        {showServiceModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-5 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg leading-tight">
                    Catat Pelayanan Posyandu
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Pilih nama balita dan jenis pelayanan yang diberikan
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowServiceModal(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 min-h-[40px] min-w-[40px] flex items-center justify-center"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Pemilihan Nama Balita */}
              <div className="space-y-2">
                <div className="relative">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Pilih Nama Balita *
                  </label>
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={childSearchQuery}
                      onFocus={() => setIsChildDropdownOpen(true)}
                      onChange={(e) => {
                        setChildSearchQuery(e.target.value);
                        setIsChildDropdownOpen(true);
                        if (selectedChildForService && e.target.value !== selectedChildForService.nama_anak) {
                          setSelectedChildForService(null);
                        }
                      }}
                      placeholder="Ketik nama balita atau NIK untuk memilih..."
                      className="w-full pl-10 pr-8 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 bg-slate-50/50 min-h-[44px]"
                    />
                    {childSearchQuery && (
                      <button
                        type="button"
                        onClick={() => {
                          setChildSearchQuery('');
                          setSelectedChildForService(null);
                          setIsChildDropdownOpen(true);
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 font-bold"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Dropdown Options */}
                  {isChildDropdownOpen && (
                    <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-2xl border border-slate-200 shadow-2xl z-30 max-h-52 overflow-y-auto divide-y divide-slate-100">
                      {filteredChildrenForModal.length === 0 ? (
                        <div className="p-3 text-center text-xs text-slate-400">
                          Tidak ada balita yang cocok dengan "{childSearchQuery}"
                        </div>
                      ) : (
                        filteredChildrenForModal.map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => handleSelectChild(c)}
                            className="w-full text-left p-3 hover:bg-brand-50 transition-colors flex items-center justify-between gap-2 text-xs"
                          >
                            <div>
                              <div className="font-bold text-slate-900">{c.nama_anak}</div>
                              <div className="text-[11px] text-slate-500">
                                NIK: {c.nik} • Ibu: {c.nama_ibu} • Posyandu {c.posyandu?.nama_pos}
                              </div>
                            </div>
                            <span className="text-[11px] font-bold text-brand-600 bg-brand-50 px-2 py-1 rounded-lg border border-brand-200">
                              Pilih
                            </span>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {/* Info Balita Terpilih */}
                {selectedChildForService ? (
                  <div className="p-3 bg-gradient-to-r from-brand-50 to-teal-50/50 border border-brand-200/80 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shadow-inner ${
                          selectedChildForService.jenis_kelamin === 'L'
                            ? 'bg-sky-100 text-sky-700'
                            : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {selectedChildForService.jenis_kelamin}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-sm">{selectedChildForService.nama_anak}</div>
                        <div className="text-[11px] text-slate-500">
                          NIK: {selectedChildForService.nik} • Usia: {calculateAgeInMonths(selectedChildForService.tanggal_lahir, new Date())} Bulan • Posyandu {selectedChildForService.posyandu?.nama_pos}
                        </div>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 bg-brand-600 text-white font-bold rounded-lg text-[10px]">
                      Terpilih
                    </span>
                  </div>
                ) : (
                  <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-2xl text-xs text-amber-800 flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Silakan cari dan pilih balita di atas untuk melanjutkan pencatatan.</span>
                  </div>
                )}
              </div>

              {/* Success Alert */}
              {serviceSuccess && (
                <div className="p-3.5 bg-emerald-50 text-emerald-800 rounded-2xl text-xs font-semibold border border-emerald-200 flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{serviceSuccess}</span>
                </div>
              )}

              {/* Error Alert */}
              {serviceError && (
                <div className="p-3.5 bg-rose-50 text-rose-700 rounded-2xl text-xs font-medium border border-rose-200 flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{serviceError}</span>
                </div>
              )}

              {/* Tab Selector: Pengukuran | Imunisasi | Vitamin */}
              <div className="grid grid-cols-3 gap-1.5 bg-slate-100 p-1.5 rounded-2xl">
                <button
                  type="button"
                  onClick={() => {
                    setServiceTab('pengukuran');
                    setServiceError('');
                  }}
                  className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 min-h-[42px] ${
                    serviceTab === 'pengukuran'
                      ? 'bg-white text-brand-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                  <Scale className="w-3.5 h-3.5" />
                  <span className="truncate">Pengukuran</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setServiceTab('imunisasi');
                    setServiceError('');
                  }}
                  className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 min-h-[42px] ${
                    serviceTab === 'imunisasi'
                      ? 'bg-white text-indigo-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                  <Syringe className="w-3.5 h-3.5" />
                  <span className="truncate">Imunisasi</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setServiceTab('vitamin');
                    setServiceError('');
                  }}
                  className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 min-h-[42px] ${
                    serviceTab === 'vitamin'
                      ? 'bg-white text-amber-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                  <Pill className="w-3.5 h-3.5" />
                  <span className="truncate">Vitamin A</span>
                </button>
              </div>

              {/* Service Form */}
              <form onSubmit={handleServiceSubmit} className="space-y-4">
                {/* TAB 1: PENGUKURAN ANTROPOMETRI */}
                {serviceTab === 'pengukuran' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Tanggal Pengukuran *
                      </label>
                      <input
                        type="date"
                        required
                        value={tanggalUkur}
                        onChange={(e) => setTanggalUkur(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm min-h-[44px]"
                      />
                      <span className="text-[11px] text-slate-400 mt-1 block">
                        Usia saat pengukuran:{' '}
                        <span className="font-semibold text-slate-600">
                          {selectedChildForService ? `${previewAgeM} Bulan` : '-'}
                        </span>
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Berat Badan (kg) *
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            step="0.05"
                            required
                            min="1"
                            max="50"
                            placeholder="Contoh: 8.5"
                            value={beratKg}
                            onChange={(e) => setBeratKg(e.target.value)}
                            className="w-full pl-3 pr-10 py-2 rounded-xl border border-slate-200 text-sm font-semibold min-h-[44px]"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">
                            kg
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Tinggi / Panjang (cm) *
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            step="0.1"
                            required
                            min="30"
                            max="140"
                            placeholder="Contoh: 72.0"
                            value={tinggiCm}
                            onChange={(e) => setTinggiCm(e.target.value)}
                            className="w-full pl-3 pr-10 py-2 rounded-xl border border-slate-200 text-sm font-semibold min-h-[44px]"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">
                            cm
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Posisi / Cara Pengukuran *
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setCaraUkur('telentang')}
                          className={`p-2.5 rounded-xl border text-xs font-semibold text-left transition-all ${
                            caraUkur === 'telentang'
                              ? 'border-brand-600 bg-brand-50 text-brand-800 ring-2 ring-brand-500/20'
                              : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <div className="font-bold">Berbaring / Telentang</div>
                          <div className="text-[10px] text-slate-500 mt-0.5">Disarankan umur &lt; 24 bulan</div>
                        </button>
                        <button
                          type="button"
                          onClick={() => setCaraUkur('berdiri')}
                          className={`p-2.5 rounded-xl border text-xs font-semibold text-left transition-all ${
                            caraUkur === 'berdiri'
                              ? 'border-brand-600 bg-brand-50 text-brand-800 ring-2 ring-brand-500/20'
                              : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <div className="font-bold">Berdiri</div>
                          <div className="text-[10px] text-slate-500 mt-0.5">Disarankan umur &ge; 24 bulan</div>
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Lingkar Lengan Atas / LiLA (cm) - Opsional
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.1"
                          min="5"
                          max="30"
                          placeholder="Contoh: 13.5"
                          value={lilaCm}
                          onChange={(e) => setLilaCm(e.target.value)}
                          className="w-full pl-3 pr-10 py-2 rounded-xl border border-slate-200 text-sm min-h-[44px]"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">
                          cm
                        </span>
                      </div>
                    </div>

                    {/* Live Preview Hasil Klasifikasi Gizi */}
                    <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-50 to-brand-50/30 border border-slate-200/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800">
                          Hasil Otomatis Standar Kemenkes RI:
                        </span>
                        <span className="text-[10px] text-slate-400">Live Preview</span>
                      </div>

                      {nutPreview ? (
                        <div className="grid grid-cols-3 gap-2 pt-1">
                          <div className={`p-2 rounded-xl border text-center ${badgeTbuPreview?.bg} ${badgeTbuPreview?.border}`}>
                            <span className="text-[10px] text-slate-500 block uppercase font-medium">TB / U (Stunting)</span>
                            <span className={`text-xs font-extrabold ${badgeTbuPreview?.text}`}>
                              {nutPreview.status_tbu}
                            </span>
                          </div>

                          <div className={`p-2 rounded-xl border text-center ${badgeBbuPreview?.bg} ${badgeBbuPreview?.border}`}>
                            <span className="text-[10px] text-slate-500 block uppercase font-medium">BB / U (Gizi)</span>
                            <span className={`text-xs font-extrabold ${badgeBbuPreview?.text}`}>
                              {nutPreview.status_bbu}
                            </span>
                          </div>

                          <div className={`p-2 rounded-xl border text-center ${badgeBbtbPreview?.bg} ${badgeBbtbPreview?.border}`}>
                            <span className="text-[10px] text-slate-500 block uppercase font-medium">BB / TB (Wasting)</span>
                            <span className={`text-xs font-extrabold ${badgeBbtbPreview?.text}`}>
                              {nutPreview.status_bbtb}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic">
                          {selectedChildForService
                            ? 'Ketik Berat Badan dan Tinggi Badan di atas untuk melihat klasifikasi otomatis.'
                            : 'Pilih balita serta ketik Berat Badan dan Tinggi Badan untuk melihat klasifikasi otomatis.'}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* TAB 2: IMUNISASI */}
                {serviceTab === 'imunisasi' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Tanggal Pemberian Imunisasi *
                      </label>
                      <input
                        type="date"
                        required
                        value={tanggalImunisasi}
                        onChange={(e) => setTanggalImunisasi(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm min-h-[44px]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Jenis Vaksin / Imunisasi *
                      </label>
                      <select
                        required
                        value={jenisImunisasi}
                        onChange={(e) => setJenisImunisasi(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm min-h-[44px] bg-white font-medium text-slate-800"
                      >
                        {imunisasiList.map((imun, idx) => (
                          <option key={idx} value={imun}>
                            {imun}
                          </option>
                        ))}
                      </select>
                      <span className="text-[11px] text-slate-400 mt-1 block">
                        Pilih vaksin dasar lengkap atau lanjutan yang diberikan hari ini.
                      </span>
                    </div>

                    <div className="p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-2xl text-xs text-indigo-800 space-y-1">
                      <div className="font-bold flex items-center space-x-1.5">
                        <Syringe className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Pencatatan Rekam Vaksinasi</span>
                      </div>
                      <p className="text-[11px] text-indigo-700/90 leading-relaxed">
                        Data imunisasi ini akan otomatis terhubung ke riwayat lengkap buku KIA balita dan laporan rekap posyandu bulanan.
                      </p>
                    </div>
                  </div>
                )}

                {/* TAB 3: VITAMIN A */}
                {serviceTab === 'vitamin' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Tanggal Pemberian Vitamin *
                      </label>
                      <input
                        type="date"
                        required
                        value={tanggalVitamin}
                        onChange={(e) => setTanggalVitamin(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm min-h-[44px]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Jenis Kapsul Vitamin A *
                      </label>
                      <select
                        required
                        value={jenisVitamin}
                        onChange={(e) => setJenisVitamin(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm min-h-[44px] bg-white font-medium text-slate-800"
                      >
                        {vitaminList.map((vit, idx) => (
                          <option key={idx} value={vit}>
                            {vit}
                          </option>
                        ))}
                      </select>
                      <span className="text-[11px] text-slate-400 mt-1 block">
                        Kapsul Biru (100.000 IU) untuk bayi 6-11 bulan • Kapsul Merah (200.000 IU) untuk anak 12-59 bulan.
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Keterangan / Catatan Tambahan (Opsional)
                      </label>
                      <input
                        type="text"
                        value={keteranganVitamin}
                        onChange={(e) => setKeteranganVitamin(e.target.value)}
                        placeholder="Contoh: Bulan Vitamin A Februari, dosis pertama"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm min-h-[44px]"
                      />
                    </div>

                    <div className="p-3.5 bg-amber-50/70 border border-amber-100 rounded-2xl text-xs text-amber-800 space-y-1">
                      <div className="font-bold flex items-center space-x-1.5">
                        <Pill className="w-3.5 h-3.5 text-amber-600" />
                        <span>Kapsul Vitamin A Posyandu</span>
                      </div>
                      <p className="text-[11px] text-amber-700/90 leading-relaxed">
                        Pemberian vitamin A rutin setiap bulan Februari dan Agustus untuk mencegah defisiensi vitamin A serta meningkatkan kekebalan tubuh balita.
                      </p>
                    </div>
                  </div>
                )}

                {/* Modal Footer Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowServiceModal(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl min-h-[44px]"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={serviceSubmitting}
                    className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl shadow-md min-h-[44px] disabled:opacity-60 flex items-center space-x-1.5"
                  >
                    <span>
                      {serviceSubmitting
                        ? 'Menyimpan...'
                        : serviceTab === 'pengukuran'
                        ? 'Simpan Pengukuran'
                        : serviceTab === 'imunisasi'
                        ? 'Simpan Imunisasi'
                        : 'Simpan Vitamin'}
                    </span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
