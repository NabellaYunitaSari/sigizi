import React, { useState, useMemo } from 'react';
import { usePage, router } from '@inertiajs/react';
import AppShell from '../../Components/AppShell';
import {
  Sliders,
  PlusCircle,
  Search,
  Syringe,
  Pill,
  Scale,
  Edit2,
  Trash2,
  X,
  CheckCircle2,
  ShieldCheck,
  Info,
} from 'lucide-react';
import { UserSession } from '../../Components/Navbar';

interface MasterStandard {
  id: string;
  kategori: 'imunisasi' | 'vitamin' | 'pengukuran';
  nama: string;
  satuan_atau_dosis?: string | null;
  keterangan?: string | null;
  created_by?: string | null;
  creator?: {
    nama: string;
    role: string;
  };
}

interface KelolaStandarProps {
  standards: MasterStandard[];
}

export default function Index({ standards = [] }: KelolaStandarProps) {
  const page = usePage();
  const user = (page.props as any).auth?.user as UserSession | null;

  const [activeTab, setActiveTab] = useState<'imunisasi' | 'vitamin' | 'pengukuran'>('imunisasi');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MasterStandard | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    kategori: 'imunisasi' as 'imunisasi' | 'vitamin' | 'pengukuran',
    nama: '',
    satuan_atau_dosis: '',
    keterangan: '',
  });

  const handleOpenAddModal = (tabCategory?: 'imunisasi' | 'vitamin' | 'pengukuran') => {
    setEditingItem(null);
    setFormData({
      kategori: tabCategory || activeTab,
      nama: '',
      satuan_atau_dosis: '',
      keterangan: '',
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (item: MasterStandard) => {
    setEditingItem(item);
    setFormData({
      kategori: item.kategori,
      nama: item.nama,
      satuan_atau_dosis: item.satuan_atau_dosis || '',
      keterangan: item.keterangan || '',
    });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama.trim()) return;

    setSubmitting(true);
    if (editingItem) {
      router.put(`/kelola-standar/${editingItem.id}`, formData, {
        onFinish: () => {
          setSubmitting(false);
          setShowModal(false);
        },
      });
    } else {
      router.post('/kelola-standar', formData, {
        onFinish: () => {
          setSubmitting(false);
          setShowModal(false);
        },
      });
    }
  };

  const handleDelete = (id: string, nama: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus standar "${nama}"?`)) {
      router.delete(`/kelola-standar/${id}`);
    }
  };

  const filteredStandards = useMemo(() => {
    return standards.filter((item) => {
      const isTab = item.kategori === activeTab;
      if (!isTab) return false;
      if (!searchTerm.trim()) return true;

      const q = searchTerm.toLowerCase();
      const nama = item.nama.toLowerCase();
      const ket = (item.keterangan || '').toLowerCase();
      const dosis = (item.satuan_atau_dosis || '').toLowerCase();
      return nama.includes(q) || ket.includes(q) || dosis.includes(q);
    });
  }, [standards, activeTab, searchTerm]);

  const categoryLabels = {
    imunisasi: {
      title: 'Standar Imunisasi Balita',
      desc: 'Daftar jenis vaksin dan imunisasi resmi sesuai standar Kemenkes & Permenkes RI.',
      icon: Syringe,
      badgeColor: 'bg-brand-50 text-brand-800 border-brand-200',
    },
    vitamin: {
      title: 'Standar Vitamin & Suplemen',
      desc: 'Daftar kapsul vitamin A, suplemen taburia, serta obat cacing balita.',
      icon: Pill,
      badgeColor: 'bg-teal-50 text-teal-800 border-teal-200',
    },
    pengukuran: {
      title: 'Standar Parameter Pengukuran',
      desc: 'Parameter antropometri (BB, TB/PB, LiLA, LK, Hb) dan indikator gizi posyandu.',
      icon: Scale,
      badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    },
  };

  const currentCat = categoryLabels[activeTab];
  const CurrentIcon = currentCat.icon;

  return (
    <AppShell user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-brand-700 uppercase tracking-wider mb-1">
              <Sliders className="w-4 h-4 text-brand-600" />
              <span>Kelola Master Data & Standar Posyandu</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Pengaturan Standar Posyandu</span>
              <ShieldCheck className="w-6 h-6 text-brand-600 inline" />
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Fitur khusus Bu Bidan (Koordinator) & Admin untuk menambah & memperbarui daftar resmi Imunisasi, Vitamin, dan Parameter Pengukuran.
            </p>
          </div>

          <button
            onClick={() => handleOpenAddModal()}
            className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm rounded-xl shadow-md shadow-brand-600/20 flex items-center justify-center gap-2 transition-all min-h-[44px] shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Tambah Standar Baru</span>
          </button>
        </div>

        {/* Tab Selection */}
        <div className="bg-white p-2 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <button
            onClick={() => setActiveTab('imunisasi')}
            className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 min-h-[44px] ${
              activeTab === 'imunisasi'
                ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Syringe className="w-4 h-4" />
            <span>Daftar Imunisasi ({standards.filter((s) => s.kategori === 'imunisasi').length})</span>
          </button>

          <button
            onClick={() => setActiveTab('vitamin')}
            className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 min-h-[44px] ${
              activeTab === 'vitamin'
                ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Pill className="w-4 h-4" />
            <span>Daftar Vitamin ({standards.filter((s) => s.kategori === 'vitamin').length})</span>
          </button>

          <button
            onClick={() => setActiveTab('pengukuran')}
            className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 min-h-[44px] ${
              activeTab === 'pengukuran'
                ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>Parameter Pengukuran ({standards.filter((s) => s.kategori === 'pengukuran').length})</span>
          </button>
        </div>

        {/* Banner Info */}
        <div className="bg-brand-50/60 border border-brand-200/80 rounded-2xl p-4 flex items-start gap-3">
          <div className="p-2 bg-brand-100 text-brand-700 rounded-xl shrink-0 mt-0.5">
            <CurrentIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-brand-900 text-sm">{currentCat.title}</h3>
            <p className="text-xs text-brand-700 mt-0.5">{currentCat.desc}</p>
          </div>
        </div>

        {/* Main Card List */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={`Cari ${activeTab}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all outline-none"
              />
            </div>

            <span className="text-xs text-slate-500 font-medium self-end sm:self-center">
              Total {filteredStandards.length} item tersimpan
            </span>
          </div>

          {filteredStandards.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 space-y-2">
              <Info className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-sm font-bold text-slate-700">Belum ada standar untuk kategori ini.</p>
              <p className="text-xs text-slate-500">Klik tombol "Tambah Standar Baru" di atas untuk menambahkan daftar baru.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 border-b border-slate-200">
                    <th className="p-3.5 font-bold">No</th>
                    <th className="p-3.5 font-bold">Nama Item / Standar</th>
                    <th className="p-3.5 font-bold">Dosis / Satuan Target</th>
                    <th className="p-3.5 font-bold">Keterangan / Pedoman Operasional</th>
                    <th className="p-3.5 font-bold">Ditambahkan Oleh</th>
                    <th className="p-3.5 font-bold text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStandards.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5 text-slate-500 font-medium">{idx + 1}</td>
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0" />
                          <span>{item.nama}</span>
                        </div>
                      </td>
                      <td className="p-3.5 font-semibold text-slate-700">
                        {item.satuan_atau_dosis ? (
                          <span className="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-lg text-[11px]">
                            {item.satuan_atau_dosis}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">-</span>
                        )}
                      </td>
                      <td className="p-3.5 text-slate-600 max-w-xs">
                        {item.keterangan || <span className="text-slate-400 italic text-[11px]">-</span>}
                      </td>
                      <td className="p-3.5">
                        {item.creator ? (
                          <span className="text-[11px] font-semibold text-slate-700 block">
                            {item.creator.nama} ({item.creator.role === 'koordinator' ? 'Bu Bidan' : 'Admin'})
                          </span>
                        ) : (
                          <span className="text-[11px] font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-md border border-brand-200">
                            Standar Nasional
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(item)}
                            className="p-1.5 text-slate-600 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors min-h-[32px] min-w-[32px]"
                            title="Edit Standar"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id, item.nama)}
                            className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors min-h-[32px] min-w-[32px]"
                            title="Hapus Standar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal Add / Edit Master Standard */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-brand-600" />
                <h3 className="font-bold text-slate-900 text-base">
                  {editingItem ? 'Edit Standar Posyandu' : 'Tambah Standar Posyandu Baru'}
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Kategori Standar <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.kategori}
                  onChange={(e) =>
                    setFormData({ ...formData, kategori: e.target.value as 'imunisasi' | 'vitamin' | 'pengukuran' })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-brand-500 outline-none"
                  required
                >
                  <option value="imunisasi">Imunisasi Balita (Vaksin)</option>
                  <option value="vitamin">Vitamin & Suplemen Nutrisi</option>
                  <option value="pengukuran">Parameter Pengukuran Antropometri</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Standar / Produk <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Rotavirus, Taburia, Lingkar Kepala"
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-brand-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Target Dosis / Satuan (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: 200.000 IU, 0.5 mL, cm, Dosis Pertama"
                  value={formData.satuan_atau_dosis}
                  onChange={(e) => setFormData({ ...formData, satuan_atau_dosis: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-brand-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Keterangan / Pedoman Pemberian (Opsional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Penjelasan sasaran usia, cara pemberian, atau dasar regulasi pemerintah..."
                  value={formData.keterangan}
                  onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-brand-500 outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-semibold text-xs hover:bg-slate-50 transition-all min-h-[38px]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold text-xs shadow-md shadow-brand-600/20 transition-all min-h-[38px] disabled:opacity-50"
                >
                  {submitting ? 'Menyimpan...' : editingItem ? 'Simpan Perubahan' : 'Tambah Standar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
