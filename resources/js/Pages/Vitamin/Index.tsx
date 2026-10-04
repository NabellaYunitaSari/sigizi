import React, { useState, useMemo } from 'react';
import { usePage, router } from '@inertiajs/react';
import AppShell from '../../Components/AppShell';
import {
  Pill,
  PlusCircle,
  Search,
  Calendar,
  X,
  Trash2,
  Edit2,
  CheckCircle2,
} from 'lucide-react';
import { UserSession } from '../../Components/Navbar';

interface Child {
  id: string;
  nik: string;
  nama_anak: string;
  jenis_kelamin: 'L' | 'P';
  tanggal_lahir: string;
  nama_ibu: string;
  id_pos: string;
  posyandu?: { nama_pos: string };
}

interface VitaminRecord {
  id: string;
  id_anak: string;
  jenis_vitamin: string;
  tanggal: string;
  keterangan?: string | null;
  anak?: Child;
}

interface VitaminProps {
  vitaminList: VitaminRecord[];
  childrenList: Child[];
  masterOptions?: string[];
}

export default function Index({ vitaminList = [], childrenList = [], masterOptions = [] }: VitaminProps) {
  const page = usePage();
  const user = (page.props as any).auth?.user as UserSession | null;
  const isKoordinatorOrAdmin = user?.role === 'koordinator' || user?.role === 'admin';

  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingItem, setEditingItem] = useState<VitaminRecord | null>(null);

  // Modal quick-add master standard
  const [showMasterModal, setShowMasterModal] = useState(false);
  const [newMasterName, setNewMasterName] = useState('');
  const [newMasterKet, setNewMasterKet] = useState('');
  const [submittingMaster, setSubmittingMaster] = useState(false);

  // Autocomplete child selection in modal
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [childSearchQuery, setChildSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const defaultJenisOptions = [
    'Vitamin A Biru (100.000 IU) - Bayi 6-11 Bulan',
    'Vitamin A Merah (200.000 IU) - Balita 12-59 Bulan',
    'Obat Cacing (Pirantel Pamoat) - Balita 12-59 Bulan',
    'Vitamin & Suplemen Nutrisi Tambahan',
  ];

  const jenisOptions = useMemo(() => {
    return Array.from(new Set([...defaultJenisOptions, ...masterOptions]));
  }, [masterOptions]);

  const [formData, setFormData] = useState({
    jenis_vitamin: 'Vitamin A Merah (200.000 IU)',
    tanggal: new Date().toISOString().split('T')[0],
    keterangan: '',
  });

  const filteredChildrenForInput = useMemo(() => {
    if (!childSearchQuery.trim()) return childrenList.slice(0, 10);
    const q = childSearchQuery.toLowerCase();
    return childrenList.filter(
      (c) =>
        c.nama_anak.toLowerCase().includes(q) ||
        c.nik.includes(q) ||
        (c.nama_ibu && c.nama_ibu.toLowerCase().includes(q))
    );
  }, [childrenList, childSearchQuery]);

  const filteredList = useMemo(() => {
    if (!searchTerm.trim()) return vitaminList;
    const search = searchTerm.toLowerCase();
    return vitaminList.filter((item) => {
      const nama = item.anak?.nama_anak?.toLowerCase() || '';
      const nik = item.anak?.nik?.toLowerCase() || '';
      const jenis = item.jenis_vitamin?.toLowerCase() || '';
      return nama.includes(search) || nik.includes(search) || jenis.includes(search);
    });
  }, [vitaminList, searchTerm]);

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setSelectedChild(null);
    setChildSearchQuery('');
    setFormData({
      jenis_vitamin: 'Vitamin A Merah (200.000 IU)',
      tanggal: new Date().toISOString().split('T')[0],
      keterangan: '',
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (item: VitaminRecord) => {
    setEditingItem(item);
    if (item.anak) {
      setSelectedChild(item.anak);
      setChildSearchQuery(item.anak.nama_anak);
    }
    setFormData({
      jenis_vitamin: item.jenis_vitamin,
      tanggal: item.tanggal,
      keterangan: item.keterangan || '',
    });
    setShowModal(true);
  };

  const handleSelectChild = (child: Child) => {
    setSelectedChild(child);
    setChildSearchQuery(child.nama_anak);
    setIsDropdownOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChild) {
      alert('Silakan pilih nama balita.');
      return;
    }

    setSubmitting(true);
    const payload = {
      id_anak: selectedChild.id,
      jenis_vitamin: formData.jenis_vitamin,
      tanggal: formData.tanggal,
      keterangan: formData.keterangan,
    };

    if (editingItem) {
      router.put(`/vitamin/${editingItem.id}`, payload, {
        onSuccess: () => {
          setShowModal(false);
          setEditingItem(null);
        },
        onFinish: () => setSubmitting(false),
      });
    } else {
      router.post('/vitamin', payload, {
        onSuccess: () => {
          setShowModal(false);
        },
        onFinish: () => setSubmitting(false),
      });
    }
  };

  const handleCreateNewMaster = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMasterName.trim()) return;

    setSubmittingMaster(true);
    router.post('/kelola-standar', {
      kategori: 'vitamin',
      nama: newMasterName.trim(),
      keterangan: newMasterKet.trim(),
    }, {
      onSuccess: () => {
        setFormData({ ...formData, jenis_vitamin: newMasterName.trim() });
        setNewMasterName('');
        setNewMasterKet('');
        setShowMasterModal(false);
      },
      onFinish: () => setSubmittingMaster(false),
    });
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus catatan vitamin untuk ${name}?`)) {
      router.delete(`/vitamin/${id}`);
    }
  };

  return (
    <AppShell user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Pencatatan Vitamin & Obat Cacing Balita
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Kelola & catat pemberian Kapsul Vitamin A (Bulan Februari & Agustus) dan Obat Cacing
            </p>
          </div>

          <div className="flex items-center gap-2">
            {isKoordinatorOrAdmin && (
              <button
                onClick={() => setShowMasterModal(true)}
                className="inline-flex items-center justify-center space-x-1.5 px-3.5 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 font-bold text-xs rounded-xl transition-all min-h-[44px]"
              >
                <PlusCircle className="w-4 h-4 text-emerald-600" />
                <span>+ Jenis Vitamin Baru</span>
              </button>
            )}

            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm rounded-xl transition-all shadow-md shadow-brand-600/20 min-h-[44px]"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Catat Vitamin Baru</span>
            </button>
          </div>
        </div>

        {/* Search & Stats Filter */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari nama balita, NIK, atau jenis vitamin..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 min-h-[40px] bg-slate-50/50"
            />
          </div>

          <div className="text-xs font-medium text-slate-500">
            Total Pemberian Vitamin: <span className="font-bold text-slate-900">{filteredList.length}</span> catatan
          </div>
        </div>

        {/* Table List */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <th className="p-3.5 font-bold">Nama Balita</th>
                  <th className="p-3.5 font-bold">Posyandu</th>
                  <th className="p-3.5 font-bold">Jenis Vitamin / Obat Cacing</th>
                  <th className="p-3.5 font-bold">Tanggal Pemberian</th>
                  <th className="p-3.5 font-bold">Keterangan</th>
                  <th className="p-3.5 font-bold text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">
                      <Pill className="w-8 h-8 mx-auto mb-2 text-slate-300 stroke-1" />
                      <p className="font-medium">Belum ada riwayat pemberian vitamin yang ditemukan</p>
                    </td>
                  </tr>
                ) : (
                  filteredList.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900 text-sm">{item.anak?.nama_anak}</div>
                        <div className="text-[10px] text-slate-500">NIK: {item.anak?.nik} • Ibu: {item.anak?.nama_ibu}</div>
                      </td>
                      <td className="p-3.5 font-medium text-slate-600">
                        Pos {item.anak?.posyandu?.nama_pos || '-'}
                      </td>
                      <td className="p-3.5">
                        <span className="px-2.5 py-1 rounded-full bg-brand-100 text-brand-800 font-bold text-[11px] border border-brand-200">
                          {item.jenis_vitamin}
                        </span>
                      </td>
                      <td className="p-3.5 font-medium text-slate-700">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{item.tanggal}</span>
                        </div>
                      </td>
                      <td className="p-3.5 text-slate-500">
                        {item.keterangan || '-'}
                      </td>
                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center space-x-1">
                          <button
                            onClick={() => handleOpenEditModal(item)}
                            className="p-1.5 text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                            title="Edit Catatan"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id, item.anak?.nama_anak || 'Balita')}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Hapus Catatan"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL CATAT / EDIT VITAMIN */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2 text-slate-900 font-bold text-base">
                <Pill className="w-5 h-5 text-brand-600" />
                <span>{editingItem ? 'Edit Catatan Vitamin' : 'Catat Vitamin / Obat Cacing Balita'}</span>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Autocomplete Child Picker */}
              <div className="space-y-1.5">
                <label className="block font-semibold text-slate-700">Pilih Nama Balita *</label>
                <div className="relative">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={childSearchQuery}
                      onFocus={() => setIsDropdownOpen(true)}
                      onChange={(e) => {
                        setChildSearchQuery(e.target.value);
                        setIsDropdownOpen(true);
                        if (selectedChild && e.target.value !== selectedChild.nama_anak) {
                          setSelectedChild(null);
                        }
                      }}
                      placeholder="Ketik inisial/huruf pertama (Contoh: 'N' untuk Nisa)..."
                      className="w-full pl-10 pr-8 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 bg-slate-50/50 min-h-[42px]"
                    />
                    {childSearchQuery && (
                      <button
                        type="button"
                        onClick={() => {
                          setChildSearchQuery('');
                          setSelectedChild(null);
                          setIsDropdownOpen(true);
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-sm font-bold"
                      >
                        ×
                      </button>
                    )}
                  </div>

                  {/* Dropdown Options */}
                  {isDropdownOpen && (
                    <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-2xl border border-slate-200 shadow-xl z-30 max-h-48 overflow-y-auto divide-y divide-slate-100">
                      {filteredChildrenForInput.length === 0 ? (
                        <div className="p-3 text-center text-slate-500">
                          Tidak ada balita yang cocok dengan "{childSearchQuery}"
                        </div>
                      ) : (
                        filteredChildrenForInput.map((child) => (
                          <button
                            key={child.id}
                            type="button"
                            onClick={() => handleSelectChild(child)}
                            className="w-full text-left p-2.5 hover:bg-brand-50/60 transition-colors flex items-center justify-between gap-2 text-xs"
                          >
                            <div>
                              <div className="font-bold text-slate-900">{child.nama_anak}</div>
                              <div className="text-[10px] text-slate-500">NIK: {child.nik} • Ibu: {child.nama_ibu}</div>
                            </div>
                            <span className="text-[10px] font-semibold text-brand-600">Pilih</span>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>

              {selectedChild && (
                <div className="p-2.5 bg-brand-50 border border-brand-200 rounded-xl text-xs flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900">{selectedChild.nama_anak}</span>
                    <span className="text-[10px] text-slate-500 block">NIK: {selectedChild.nik} • Posyandu {selectedChild.posyandu?.nama_pos || ''}</span>
                  </div>
                  <span className="px-2 py-0.5 bg-brand-600 text-white font-bold rounded text-[10px]">Terpilih</span>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-semibold text-slate-700">Jenis Vitamin / Dosis *</label>
                  {isKoordinatorOrAdmin && (
                    <button
                      type="button"
                      onClick={() => setShowMasterModal(true)}
                      className="text-[11px] font-bold text-brand-600 hover:text-brand-700 hover:underline"
                    >
                      + Tambah Jenis Vitamin Baru
                    </button>
                  )}
                </div>
                <select
                  required
                  value={formData.jenis_vitamin}
                  onChange={(e) => setFormData({ ...formData, jenis_vitamin: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs min-h-[42px] bg-white focus:ring-2 focus:ring-brand-500"
                >
                  {jenisOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tanggal Pemberian *</label>
                <input
                  type="date"
                  required
                  value={formData.tanggal}
                  onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs min-h-[42px] focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Catatan Tambahan (Opsional)</label>
                <input
                  type="text"
                  value={formData.keterangan}
                  onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                  placeholder="Contoh: Diberikan saat posyandu bulan Februari"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs min-h-[42px] focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting || !selectedChild}
                  className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl shadow-md shadow-brand-600/20 disabled:opacity-50"
                >
                  {submitting ? 'Menyimpan...' : editingItem ? 'Simpan Perubahan' : 'Simpan Vitamin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Quick Add Standar Vitamin Baru */}
      {showMasterModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Tambah Jenis Vitamin / Suplemen Baru</h3>
              <button
                type="button"
                onClick={() => setShowMasterModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewMaster} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Vitamin / Suplemen Baru <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Taburia, Sirup Besi (Zat Besi), Zinc 20mg"
                  value={newMasterName}
                  onChange={(e) => setNewMasterName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-brand-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Keterangan / Sasaran Dosis (Opsional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Contoh: Suplementasi mikronutrien tabur untuk balita usia 6-24 bulan"
                  value={newMasterKet}
                  onChange={(e) => setNewMasterKet(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-brand-500 outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowMasterModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-semibold text-xs hover:bg-slate-50 transition-all min-h-[38px]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submittingMaster}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-600/20 transition-all min-h-[38px] disabled:opacity-50"
                >
                  {submittingMaster ? 'Menyimpan...' : 'Tambah Standar Vitamin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
