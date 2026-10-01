import React, { useState } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import AppShell from '../../Components/AppShell';
import {
  Baby,
  Search,
  Plus,
  ChevronRight,
  X,
  Sparkles,
  Building2,
} from 'lucide-react';
import { getStatusBadgeColor, calculateAgeInMonths } from '../../lib/statusGizi';
import { UserSession } from '../../Components/Navbar';

interface ChildData {
  id: string;
  nik: string;
  nama_anak: string;
  jenis_kelamin: 'L' | 'P';
  tanggal_lahir: string;
  nama_ibu: string;
  alamat: string;
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
}

export default function Index({ initialChildren = [], posyandus = [] }: AnakIndexProps) {
  const page = usePage();
  const user = (page.props as any).auth?.user as UserSession | null;

  const [children, setChildren] = useState<ChildData[]>(initialChildren);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');
  const [posyanduFilter, setPosyanduFilter] = useState('');

  const [showAddModal, setShowAddModal] = useState(false);
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
      const res = await fetch('/api/anak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menyimpan anak baru');

      setShowAddModal(false);
      loadChildren();
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
    } catch (err: any) {
      setFormError(err.message);
    } finally {
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

  return (
    <AppShell user={user}>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-brand-600 uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Modul Balita • Desa Sukomalo</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Daftar Anak Balita
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Kelola data sasaran balita & riwayat tumbuh kembang
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm rounded-xl transition-all shadow-md shadow-brand-600/20 min-h-[44px]"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Anak Baru</span>
          </button>
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

                  {/* Actions */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <Link
                      href={`/anak/${child.id}`}
                      className="flex-1 py-2 px-3 text-center bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors min-h-[44px] flex items-center justify-center"
                    >
                      Detail & Grafik
                    </Link>

                    <Link
                      href={`/anak/${child.id}/input`}
                      className="flex-1 py-2 px-3 text-center bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs rounded-xl transition-all shadow-sm min-h-[44px] flex items-center justify-center space-x-1"
                    >
                      <span>Input Ukur</span>
                      <ChevronRight className="w-3.5 h-3.5" />
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

        {/* Modal Tambah Anak */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-900 text-lg">Tambah Balita Baru</h3>
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
      </div>
    </AppShell>
  );
}
