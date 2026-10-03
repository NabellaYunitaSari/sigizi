import React, { useState } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import AppShell from '../../Components/AppShell';
import {
  Heart,
  Search,
  Plus,
  ChevronRight,
  X,
  Edit2,
} from 'lucide-react';
import { getStatusBadgeColor } from '../../lib/statusGizi';
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

          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm rounded-xl transition-all shadow-md shadow-brand-600/20 min-h-[44px]"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Ibu Hamil</span>
          </button>
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
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 min-h-[44px] bg-white"
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
        </div>

        {/* List */}
        {bumilList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bumilList.map((bumil) => {
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

                  {/* Actions */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleOpenEditModal(bumil)}
                      className="p-2 text-brand-600 hover:bg-brand-50 rounded-xl transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center border border-slate-200"
                      title="Edit Data Ibu Hamil"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <Link
                      href={`/ibu-hamil/${bumil.id}`}
                      className="flex-1 py-2 px-3 text-center bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors min-h-[44px] flex items-center justify-center"
                    >
                      Detail Riwayat
                    </Link>

                    <Link
                      href={`/ibu-hamil/${bumil.id}/input`}
                      className="flex-1 py-2 px-3 text-center bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs rounded-xl transition-all shadow-sm min-h-[44px] flex items-center justify-center space-x-1"
                    >
                      <span>Input Periksa</span>
                      <ChevronRight className="w-3.5 h-3.5" />
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
                  {editingBumil ? 'Edit Data Ibu Hamil' : 'Tambah Ibu Hamil Baru'}
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
      </div>
    </AppShell>
  );
}
