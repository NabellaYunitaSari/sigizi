import React, { useState, useMemo, useEffect } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import AppShell from '../../Components/AppShell';
import {
  Heart,
  Search,
  Plus,
  ChevronRight,
  X,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Activity,
} from 'lucide-react';
import { getStatusBadgeColor, classifyBumilStatus } from '../../lib/statusGizi';
import { UserSession } from '../../Components/Navbar';

interface BumilData {
  id: string;
  nik: string;
  nama: string;
  nama_suami: string;
  alamat: string;
  kehamilan_ke: number;
  hpht: string;
  posyandu: { nama_pos: string };
  pengukuran: Array<{
    tanggal_periksa: string;
    usia_kehamilan_minggu: number;
    berat_kg: number;
    lila_cm: number;
    tekanan_darah: string;
    status_gizi_bumil: string;
  }>;
}

interface BumilIndexProps {
  initialBumilList: BumilData[];
  posyandus: any[];
}

export default function Index({ initialBumilList = [], posyandus = [] }: BumilIndexProps) {
  const page = usePage();
  const user = (page.props as any).auth?.user as UserSession | null;

  const [bumilList, setBumilList] = useState<BumilData[]>(initialBumilList);
  const [search, setSearch] = useState('');
  const [posyanduFilter, setPosyanduFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');

  const filteredBumilList = useMemo(() => {
    return bumilList.filter((bumil) => {
      if (statusFilter === 'Semua') return true;
      const lastExam = bumil.pengukuran ? bumil.pengukuran[0] : null;
      if (!lastExam) return false;
      if (statusFilter === 'KEK') return lastExam.status_gizi_bumil === 'KEK';
      if (statusFilter === 'Normal') return lastExam.status_gizi_bumil === 'Normal';
      return true;
    });
  }, [bumilList, statusFilter]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBumil, setEditingBumil] = useState<any | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const [formData, setFormData] = useState({
    nik: '',
    nama: '',
    tanggal_lahir: '',
    nama_suami: '',
    alamat: '',
    kehamilan_ke: '1',
    hpht: '',
    id_pos: user?.id_pos || '',
  });

  // Examination / Service Modal State
  const [showExamModal, setShowExamModal] = useState(false);
  const [selectedBumilForExam, setSelectedBumilForExam] = useState<BumilData | null>(null);
  const [bumilSearchQuery, setBumilSearchQuery] = useState('');
  const [isBumilDropdownOpen, setIsBumilDropdownOpen] = useState(false);
  const [examSubmitting, setExamSubmitting] = useState(false);
  const [examError, setExamError] = useState('');
  const [examSuccess, setExamSuccess] = useState('');

  // Form Periksa Bumil
  const [tanggalPeriksa, setTanggalPeriksa] = useState(new Date().toISOString().split('T')[0]);
  const [usiaKehamilan, setUsiaKehamilan] = useState('16');
  const [beratKg, setBeratKg] = useState('');
  const [tinggiCm, setTinggiCm] = useState('155');
  const [lilaCm, setLilaCm] = useState('');
  const [tekananDarah, setTekananDarah] = useState('120/80');

  const filteredBumilForModal = useMemo(() => {
    if (!bumilSearchQuery.trim()) return bumilList.slice(0, 15);
    const q = bumilSearchQuery.toLowerCase();
    return bumilList.filter(
      (b) =>
        b.nama.toLowerCase().includes(q) ||
        b.nik.includes(q) ||
        (b.nama_suami && b.nama_suami.toLowerCase().includes(q))
    );
  }, [bumilList, bumilSearchQuery]);

  const handleSelectBumil = (bumil: BumilData) => {
    setSelectedBumilForExam(bumil);
    setBumilSearchQuery(bumil.nama);
    setIsBumilDropdownOpen(false);
    setExamError('');

    if (bumil.hpht) {
      const hphtDate = new Date(bumil.hpht);
      const examDate = new Date(tanggalPeriksa || new Date().toISOString().split('T')[0]);
      const diffWeeks = Math.max(1, Math.floor((examDate.getTime() - hphtDate.getTime()) / (1000 * 60 * 60 * 24 * 7)));
      setUsiaKehamilan(diffWeeks.toString());
    }
  };

  const handleOpenExamModal = (bumil: BumilData | null = null) => {
    setSelectedBumilForExam(bumil);
    setBumilSearchQuery(bumil ? bumil.nama : '');
    setIsBumilDropdownOpen(false);
    setExamError('');
    setExamSuccess('');

    const todayStr = new Date().toISOString().split('T')[0];
    setTanggalPeriksa(todayStr);
    setBeratKg('');
    setTinggiCm('155');
    setLilaCm('');
    setTekananDarah('120/80');

    if (bumil && bumil.hpht) {
      const hphtDate = new Date(bumil.hpht);
      const now = new Date();
      const diffWeeks = Math.max(1, Math.floor((now.getTime() - hphtDate.getTime()) / (1000 * 60 * 60 * 24 * 7)));
      setUsiaKehamilan(diffWeeks.toString());
    } else {
      setUsiaKehamilan('16');
    }

    setShowExamModal(true);
  };

  const handleExamSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBumilForExam) {
      setExamError('Silakan cari dan pilih nama ibu hamil terlebih dahulu.');
      return;
    }

    if (!beratKg || !tinggiCm || !lilaCm || !tekananDarah) {
      setExamError('Semua kolom wajib diisi.');
      return;
    }

    setExamError('');
    setExamSuccess('');
    setExamSubmitting(true);

    const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '';

    try {
      const res = await fetch(`/api/ibu-hamil/${selectedBumilForExam.id}/pengukuran`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'X-CSRF-TOKEN': csrfToken,
        },
        body: JSON.stringify({
          tanggal_periksa: tanggalPeriksa,
          usia_kehamilan_minggu: parseInt(usiaKehamilan),
          berat_kg: parseFloat(beratKg),
          tinggi_cm: parseFloat(tinggiCm),
          lila_cm: parseFloat(lilaCm),
          tekanan_darah: tekananDarah,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        const errMsg = data.errors
          ? Object.values(data.errors).flat().join(', ')
          : data.error || data.message || 'Gagal menyimpan pemeriksaan';
        throw new Error(errMsg);
      }

      setExamSuccess('Data pemeriksaan ibu hamil berhasil disimpan!');
      await loadBumil();
      setTimeout(() => {
        setShowExamModal(false);
      }, 1200);
    } catch (err: any) {
      setExamError(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setExamSubmitting(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingBumil(null);
    setFormError('');
    setFormData({
      nik: '',
      nama: '',
      tanggal_lahir: '',
      nama_suami: '',
      alamat: '',
      kehamilan_ke: '1',
      hpht: '',
      id_pos: user?.id_pos || '',
    });
    setShowAddModal(true);
  };

  const handleOpenEditModal = (bumil: any) => {
    setEditingBumil(bumil);
    setFormError('');
    setFormData({
      nik: bumil.nik,
      nama: bumil.nama,
      tanggal_lahir: bumil.tanggal_lahir || '',
      nama_suami: bumil.nama_suami,
      alamat: bumil.alamat,
      kehamilan_ke: bumil.kehamilan_ke ? bumil.kehamilan_ke.toString() : '1',
      hpht: bumil.hpht,
      id_pos: bumil.id_pos || user?.id_pos || '',
    });
    setShowAddModal(true);
  };

  const loadBumil = async (s = search, p = posyanduFilter) => {
    let url = `/api/ibu-hamil?search=${encodeURIComponent(s)}`;
    if (p) url += `&posyanduId=${p}`;
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (res.ok) {
      const data = await res.json();
      setBumilList(data);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSubmitting(true);

    try {
      if (editingBumil) {
        router.put(`/ibu-hamil/${editingBumil.id}`, formData, {
          onSuccess: () => {
            setShowAddModal(false);
            setEditingBumil(null);
            loadBumil();
          },
          onError: (errs) => {
            setFormError(Object.values(errs).join(', ') || 'Gagal memperbarui data ibu hamil');
          },
          onFinish: () => setFormSubmitting(false),
        });
      } else {
        const res = await fetch('/api/ibu-hamil', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Gagal menyimpan data ibu hamil');

        setShowAddModal(false);
        loadBumil();
        setFormSubmitting(false);
      }
    } catch (err: any) {
      setFormError(err.message);
      setFormSubmitting(false);
    }
  };

  return (
    <AppShell user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Daftar Ibu Hamil
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Pemantauan usia kehamilan, tekanan darah, dan deteksi risiko KEK (LiLA &lt; 23.5 cm)
            </p>
          </div>

          <div>
            <button
              type="button"
              onClick={() => handleOpenExamModal()}
              className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-brand-600/20 min-h-[44px]"
            >
              <Plus className="w-4 h-4" />
              <span>Catat Pelayanan</span>
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                loadBumil(e.target.value, posyanduFilter);
              }}
              placeholder="Cari NIK, nama ibu, atau nama suami..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 min-h-[44px]"
            />
          </div>

          {user && (user.role === 'koordinator' || user.role === 'admin') && (
            <div className="w-full md:w-48">
              <select
                value={posyanduFilter}
                onChange={(e) => {
                  setPosyanduFilter(e.target.value);
                  loadBumil(search, e.target.value);
                }}
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

          {/* Status Gizi Filter */}
          <div className="w-full md:w-52">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 min-h-[44px] bg-white"
            >
              <option value="Semua">Semua Status Gizi</option>
              <option value="KEK">Risiko KEK (LiLA &lt; 23.5 cm)</option>
              <option value="Normal">Status Gizi Normal</option>
            </select>
          </div>
        </div>

        {/* List */}
        {filteredBumilList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBumilList.map((bumil) => {
              const lastExam = bumil.pengukuran ? bumil.pengukuran[0] : null;
              const isKek = lastExam?.status_gizi_bumil === 'KEK';
              const badgeColor = isKek ? getStatusBadgeColor('KEK') : getStatusBadgeColor('Normal');

              return (
                <div
                  key={bumil.id}
                  className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center font-bold">
                          <Heart className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 text-base leading-tight">
                            {bumil.nama}
                          </h3>
                          <p className="text-xs text-slate-400 font-mono mt-0.5">NIK: {bumil.nik}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Suami:</span>
                        <span className="font-semibold text-slate-800">{bumil.nama_suami}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Hamil Ke:</span>
                        <span className="font-semibold text-slate-800">G{bumil.kehamilan_ke}</span>
                      </div>
                      <div className="flex justify-between pt-1 border-t border-slate-200/60 text-[11px] text-slate-500">
                        <span>Posyandu {bumil.posyandu?.nama_pos}</span>
                      </div>
                    </div>

                    {/* Status Gizi Bumil Badge */}
                    <div className="space-y-1">
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Pemeriksaan Terakhir:</span>
                      {lastExam ? (
                        <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          <div>
                            <span className="text-xs text-slate-600 block">{lastExam.usia_kehamilan_minggu} Minggu • LiLA {lastExam.lila_cm} cm</span>
                            <span className="text-[10px] text-slate-400">TD: {lastExam.tekanan_darah}</span>
                          </div>
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${badgeColor.bg} ${badgeColor.text} ${badgeColor.border}`}>
                            {lastExam.status_gizi_bumil}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Belum ada data pemeriksaan</span>
                      )}
                    </div>
                  </div>

                  {/* Actions: Hanya untuk edit data dan detail riwayat */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(bumil)}
                      className="flex-1 py-2 px-3 text-center bg-brand-50 hover:bg-brand-100 text-brand-700 font-semibold text-xs rounded-xl transition-colors min-h-[44px] flex items-center justify-center space-x-1.5 border border-brand-200"
                      title="Edit Data Ibu Hamil"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-brand-600" />
                      <span>Edit Data</span>
                    </button>

                    <Link
                      href={`/ibu-hamil/${bumil.id}`}
                      className="flex-1 py-2 px-3 text-center bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors min-h-[44px] flex items-center justify-center space-x-1"
                    >
                      <span>Detail Riwayat</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 bg-white rounded-2xl border border-dashed border-slate-300 text-center space-y-3">
            <Heart className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="font-bold text-slate-700">Belum ada data ibu hamil</p>
          </div>
        )}

        {/* Modal Tambah / Edit Bumil */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-900 text-lg">
                  {editingBumil ? 'Edit Data Ibu Hamil' : 'Tambah Data Ibu Hamil Baru'}
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
                    <label className="block text-xs font-semibold text-slate-700 mb-1">NIK Ibu Hamil *</label>
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
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Lengkap Ibu *</label>
                    <input
                      type="text"
                      required
                      value={formData.nama}
                      onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                      placeholder="Nama Ibu"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm min-h-[44px]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Tanggal Lahir Ibu *</label>
                    <input
                      type="date"
                      required
                      value={formData.tanggal_lahir}
                      onChange={(e) => setFormData({ ...formData, tanggal_lahir: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm min-h-[44px]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Suami *</label>
                    <input
                      type="text"
                      required
                      value={formData.nama_suami}
                      onChange={(e) => setFormData({ ...formData, nama_suami: e.target.value })}
                      placeholder="Nama suami"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm min-h-[44px]"
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
                      value={formData.kehamilan_ke}
                      onChange={(e) => setFormData({ ...formData, kehamilan_ke: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm min-h-[44px]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">HPHT (Hari Pertama Haid Terakhir) *</label>
                    <input
                      type="date"
                      required
                      value={formData.hpht}
                      onChange={(e) => setFormData({ ...formData, hpht: e.target.value })}
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
                    placeholder="Dusun/RT RW Sukomalo"
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
                    {formSubmitting ? 'Menyimpan...' : 'Simpan Data'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Catat Pemeriksaan Ibu Hamil */}
        {showExamModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-5 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg leading-tight">
                    Catat Pemeriksaan Ibu Hamil
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Pilih nama ibu hamil dan masukkan hasil penimbangan & lingkar lengan atas
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowExamModal(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 min-h-[40px] min-w-[40px] flex items-center justify-center"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Pemilihan Nama Ibu Hamil */}
              <div className="space-y-2">
                <div className="relative">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Pilih Nama Ibu Hamil *
                  </label>
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={bumilSearchQuery}
                      onFocus={() => setIsBumilDropdownOpen(true)}
                      onChange={(e) => {
                        setBumilSearchQuery(e.target.value);
                        setIsBumilDropdownOpen(true);
                        if (selectedBumilForExam && e.target.value !== selectedBumilForExam.nama) {
                          setSelectedBumilForExam(null);
                        }
                      }}
                      placeholder="Ketik nama ibu hamil, NIK, atau nama suami..."
                      className="w-full pl-10 pr-8 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 bg-slate-50/50 min-h-[44px]"
                    />
                    {bumilSearchQuery && (
                      <button
                        type="button"
                        onClick={() => {
                          setBumilSearchQuery('');
                          setSelectedBumilForExam(null);
                          setIsBumilDropdownOpen(true);
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 font-bold"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Dropdown Options */}
                  {isBumilDropdownOpen && (
                    <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-2xl border border-slate-200 shadow-2xl z-30 max-h-52 overflow-y-auto divide-y divide-slate-100">
                      {filteredBumilForModal.length === 0 ? (
                        <div className="p-3 text-center text-xs text-slate-400">
                          Tidak ada ibu hamil yang cocok dengan "{bumilSearchQuery}"
                        </div>
                      ) : (
                        filteredBumilForModal.map((b) => (
                          <button
                            key={b.id}
                            type="button"
                            onClick={() => handleSelectBumil(b)}
                            className="w-full text-left p-3 hover:bg-brand-50 transition-colors flex items-center justify-between gap-2 text-xs"
                          >
                            <div>
                              <div className="font-bold text-slate-900">{b.nama}</div>
                              <div className="text-[11px] text-slate-500">
                                NIK: {b.nik} • Suami: {b.nama_suami} • Posyandu {b.posyandu?.nama_pos}
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

                {/* Info Ibu Hamil Terpilih */}
                {selectedBumilForExam ? (
                  <div className="p-3 bg-gradient-to-r from-brand-50 to-teal-50/50 border border-brand-200/80 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center font-bold">
                        <Heart className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-sm">{selectedBumilForExam.nama}</div>
                        <div className="text-[11px] text-slate-500">
                          NIK: {selectedBumilForExam.nik} • Suami: {selectedBumilForExam.nama_suami} • G{selectedBumilForExam.kehamilan_ke} • Posyandu {selectedBumilForExam.posyandu?.nama_pos}
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
                    <span>Silakan cari dan pilih ibu hamil di atas untuk melanjutkan pemeriksaan.</span>
                  </div>
                )}
              </div>

              {/* Success Alert */}
              {examSuccess && (
                <div className="p-3.5 bg-emerald-50 text-emerald-800 rounded-2xl text-xs font-semibold border border-emerald-200 flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{examSuccess}</span>
                </div>
              )}

              {/* Error Alert */}
              {examError && (
                <div className="p-3.5 bg-rose-50 text-rose-700 rounded-2xl text-xs font-medium border border-rose-200 flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{examError}</span>
                </div>
              )}

              {/* Form Input Pemeriksaan */}
              <form onSubmit={handleExamSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Tanggal Pemeriksaan *
                    </label>
                    <input
                      type="date"
                      required
                      value={tanggalPeriksa}
                      onChange={(e) => setTanggalPeriksa(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm min-h-[44px]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Usia Kehamilan (Minggu) *
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        required
                        min="1"
                        max="45"
                        placeholder="Contoh: 16"
                        value={usiaKehamilan}
                        onChange={(e) => setUsiaKehamilan(e.target.value)}
                        className="w-full pl-3 pr-16 py-2 rounded-xl border border-slate-200 text-sm font-semibold min-h-[44px]"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">
                        Minggu
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Berat Badan (kg) *
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        required
                        min="30"
                        max="150"
                        placeholder="Contoh: 54.5"
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
                      Tinggi Badan (cm) *
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        required
                        min="120"
                        max="200"
                        placeholder="Contoh: 155.0"
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Lingkar Lengan Atas / LiLA (cm) *
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        required
                        min="10"
                        max="50"
                        placeholder="Contoh: 24.5"
                        value={lilaCm}
                        onChange={(e) => setLilaCm(e.target.value)}
                        className="w-full pl-3 pr-10 py-2 rounded-xl border border-slate-200 text-sm font-semibold min-h-[44px]"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">
                        cm
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 block">Batas normal Kemenkes: &ge; 23.5 cm</span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Tekanan Darah (mmHg) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: 120/80"
                      value={tekananDarah}
                      onChange={(e) => setTekananDarah(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm min-h-[44px]"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">Format: Sistolik / Diastolik</span>
                  </div>
                </div>

                {/* Live Preview Status KEK */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-50 to-brand-50/30 border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">
                      Deteksi Risiko KEK (Kekurangan Energi Kronis):
                    </span>
                    <span className="text-[10px] text-slate-400">Live Preview</span>
                  </div>

                  {lilaCm && !isNaN(parseFloat(lilaCm)) ? (
                    <div className="flex items-center justify-between p-2.5 rounded-xl border bg-white border-slate-200">
                      <div>
                        <span className="text-xs font-bold text-slate-800">LiLA: {lilaCm} cm</span>
                        <span className="text-[10px] text-slate-500 block">
                          {parseFloat(lilaCm) < 23.5
                            ? 'LiLA < 23.5 cm menunjukkan risiko KEK (perlu intervensi PMT)'
                            : 'LiLA ≥ 23.5 cm dalam batas normal gizi ibu hamil'}
                        </span>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-lg text-xs font-bold border ${
                          parseFloat(lilaCm) < 23.5
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}
                      >
                        {parseFloat(lilaCm) < 23.5 ? 'Risiko KEK' : 'Normal'}
                      </span>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">
                      Ketik angka Lingkar Lengan Atas (LiLA) di atas untuk melihat status risiko KEK otomatis.
                    </p>
                  )}
                </div>

                {/* Modal Footer Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowExamModal(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl min-h-[44px]"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={examSubmitting}
                    className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl shadow-md min-h-[44px] disabled:opacity-60 flex items-center space-x-1.5"
                  >
                    <span>{examSubmitting ? 'Menyimpan...' : 'Simpan Pemeriksaan'}</span>
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
