import React, { useState, useMemo } from 'react';
import { usePage, router, Link } from '@inertiajs/react';
import AppShell from '../../Components/AppShell';
import {
  Scale,
  Search,
  Calendar,
  User,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  Trash2,
  X,
  ChevronRight,
  Activity,
  Baby,
  Edit2,
} from 'lucide-react';
import { UserSession } from '../../Components/Navbar';
import { calculateAgeInMonths, classifyNutritionStatus, getStatusBadgeColor } from '../../lib/statusGizi';

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

interface PengukuranRecord {
  id: string;
  id_anak: string;
  tanggal_ukur: string;
  berat_kg: number;
  tinggi_cm: number;
  cara_ukur: string;
  lila_cm?: number | null;
  umur_bulan: number;
  status_bbu: string;
  status_tbu: string;
  status_bbtb: string;
  anak?: Child;
}

interface PengukuranPageProps {
  childrenList: Child[];
  pengukuranList?: PengukuranRecord[];
  masterOptions?: any[];
}

export default function Index({ childrenList = [], pengukuranList = [], masterOptions = [] }: PengukuranPageProps) {
  const page = usePage();
  const user = (page.props as any).auth?.user as UserSession | null;
  const isKoordinatorOrAdmin = user?.role === 'koordinator' || user?.role === 'admin';

  // Search filter
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<PengukuranRecord | null>(null);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [childSearchQuery, setChildSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Modal quick-add master standard
  const [showMasterModal, setShowMasterModal] = useState(false);
  const [newMasterName, setNewMasterName] = useState('');
  const [newMasterKet, setNewMasterKet] = useState('');
  const [submittingMaster, setSubmittingMaster] = useState(false);

  // Form fields
  const [tanggalUkur, setTanggalUkur] = useState(new Date().toISOString().split('T')[0]);
  const [beratKg, setBeratKg] = useState('');
  const [tinggiCm, setTinggiCm] = useState('');
  const [caraUkur, setCaraUkur] = useState<'telentang' | 'berdiri'>('telentang');
  const [lilaCm, setLilaCm] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Autocomplete child search in modal (search by name initial, e.g. "N")
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

  // Calculated age in months for selected child
  const ageMonths = useMemo(() => {
    if (!selectedChild) return 0;
    return calculateAgeInMonths(selectedChild.tanggal_lahir, tanggalUkur);
  }, [selectedChild, tanggalUkur]);

  // Live Nutrition Status Preview
  const liveStatus = useMemo(() => {
    if (!selectedChild || !beratKg || !tinggiCm) return null;
    const bb = parseFloat(beratKg);
    const tb = parseFloat(tinggiCm);
    if (isNaN(bb) || isNaN(tb) || bb <= 0 || tb <= 0) return null;

    return classifyNutritionStatus(bb, tb, ageMonths, selectedChild.jenis_kelamin);
  }, [selectedChild, beratKg, tinggiCm, ageMonths]);

  // Filtered measurement history for table view
  const filteredPengukuran = useMemo(() => {
    if (!searchTerm.trim()) return pengukuranList;
    const q = searchTerm.toLowerCase();
    return pengukuranList.filter((item) => {
      const childName = item.anak?.nama_anak?.toLowerCase() || '';
      const posName = item.anak?.posyandu?.nama_pos?.toLowerCase() || '';
      const nik = item.anak?.nik || '';
      return childName.includes(q) || posName.includes(q) || nik.includes(q);
    });
  }, [pengukuranList, searchTerm]);

  const handleSelectChild = (child: Child) => {
    setSelectedChild(child);
    setChildSearchQuery(child.nama_anak);
    setIsDropdownOpen(false);

    // Auto set cara_ukur by age
    const m = calculateAgeInMonths(child.tanggal_lahir, tanggalUkur);
    setCaraUkur(m < 24 ? 'telentang' : 'berdiri');
  };

  const handleOpenModalWithChild = (child?: Child) => {
    setError('');
    setSuccessMsg('');
    setEditingItem(null);
    if (child) {
      handleSelectChild(child);
    } else {
      setSelectedChild(null);
      setChildSearchQuery('');
    }
    setBeratKg('');
    setTinggiCm('');
    setLilaCm('');
    setShowModal(true);
  };

  const handleOpenEditModal = (item: PengukuranRecord) => {
    setError('');
    setSuccessMsg('');
    setEditingItem(item);
    if (item.anak) {
      setSelectedChild(item.anak);
      setChildSearchQuery(item.anak.nama_anak);
    }
    setTanggalUkur(item.tanggal_ukur);
    setCaraUkur(item.cara_ukur as any);
    setBeratKg(item.berat_kg.toString());
    setTinggiCm(item.tinggi_cm.toString());
    setLilaCm(item.lila_cm ? item.lila_cm.toString() : '');
    setShowModal(true);
  };

  const handleResetForm = () => {
    setEditingItem(null);
    setSelectedChild(null);
    setChildSearchQuery('');
    setBeratKg('');
    setTinggiCm('');
    setLilaCm('');
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChild) {
      setError('Silakan pilih balita terlebih dahulu.');
      return;
    }
    if (!beratKg || !tinggiCm) {
      setError('Berat badan dan tinggi badan wajib diisi.');
      return;
    }

    setSubmitting(true);
    setError('');

    const payload = {
      id_anak: selectedChild.id,
      tanggal_ukur: tanggalUkur,
      berat_kg: parseFloat(beratKg),
      tinggi_cm: parseFloat(tinggiCm),
      cara_ukur: caraUkur,
      lila_cm: lilaCm ? parseFloat(lilaCm) : null,
    };

    if (editingItem) {
      router.put(`/pengukuran/${editingItem.id}`, payload, {
        onSuccess: () => {
          setSubmitting(false);
          setShowModal(false);
          handleResetForm();
          setSuccessMsg(`Hasil pengukuran untuk ${selectedChild.nama_anak} berhasil diperbarui!`);
        },
        onError: (errs) => {
          setSubmitting(false);
          setError(Object.values(errs).join(', ') || 'Gagal memperbarui pengukuran.');
        },
      });
    } else {
      router.post('/pengukuran', payload, {
        onSuccess: () => {
          setSubmitting(false);
          setShowModal(false);
          handleResetForm();
          setSuccessMsg(`Hasil pengukuran untuk ${selectedChild.nama_anak} berhasil disimpan!`);
        },
        onError: (errs) => {
          setSubmitting(false);
          setError(Object.values(errs).join(', ') || 'Gagal menyimpan pengukuran.');
        },
      });
    }
  };

  const handleCreateNewMaster = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMasterName.trim()) return;

    setSubmittingMaster(true);
    router.post('/kelola-standar', {
      kategori: 'pengukuran',
      nama: newMasterName.trim(),
      keterangan: newMasterKet.trim(),
    }, {
      onSuccess: () => {
        setNewMasterName('');
        setNewMasterKet('');
        setShowMasterModal(false);
        setSuccessMsg(`Standar parameter baru "${newMasterName.trim()}" berhasil ditambahkan!`);
      },
      onFinish: () => setSubmittingMaster(false),
    });
  };

  const handleDelete = (id: string, childName: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus catatan pengukuran untuk ${childName}?`)) {
      router.delete(`/pengukuran/${id}`, {
        onSuccess: () => {
          setSuccessMsg('Catatan pengukuran berhasil dihapus.');
        },
      });
    }
  };

  return (
    <AppShell user={user}>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Pencatatan Antropometri Balita
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Kelola & catat hasil penimbangan berat badan dan tinggi badan balita
            </p>
          </div>

          <div className="flex items-center gap-2">
            {isKoordinatorOrAdmin && (
              <button
                onClick={() => setShowMasterModal(true)}
                className="inline-flex items-center justify-center space-x-1.5 px-3.5 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 font-bold text-xs rounded-xl transition-all min-h-[44px]"
              >
                <PlusCircle className="w-4 h-4 text-emerald-600" />
                <span>+ Standar Parameter Baru</span>
              </button>
            )}

            <button
              onClick={() => handleOpenModalWithChild()}
              className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm rounded-xl transition-all shadow-md shadow-brand-600/20 min-h-[44px]"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Catat Pengukuran Baru</span>
            </button>
          </div>
        </div>

        {/* Success Alert */}
        {successMsg && (
          <div className="bg-brand-50 border border-brand-200 p-4 rounded-2xl text-xs text-brand-900 flex items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-brand-600 shrink-0" />
              <span className="font-semibold">{successMsg}</span>
            </div>
            <button
              onClick={() => setSuccessMsg('')}
              className="text-slate-400 hover:text-slate-600 text-sm font-bold"
            >
              ×
            </button>
          </div>
        )}

        {/* Search Card Bar */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari nama balita, NIK, atau posyandu..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 min-h-[44px] bg-slate-50/50"
            />
          </div>

          <div className="text-xs text-slate-500 font-semibold self-end sm:self-center">
            Total Riwayat Pengukuran: <span className="font-bold text-slate-900">{filteredPengukuran.length}</span> catatan
          </div>
        </div>

        {/* Measurement History Table Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="p-4">Nama Balita</th>
                  <th className="p-4">Posyandu</th>
                  <th className="p-4">Usia Diukur</th>
                  <th className="p-4">Hasil Pengukuran</th>
                  <th className="p-4">Status Gizi</th>
                  <th className="p-4">Tanggal Ukur</th>
                  <th className="p-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredPengukuran.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <Scale className="w-12 h-12 text-slate-300 stroke-1" />
                        <p className="text-sm font-medium text-slate-500">
                          Belum ada riwayat pengukuran yang ditemukan
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredPengukuran.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-4 font-bold text-slate-900">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-8 h-8 rounded-lg bg-brand-100 text-brand-700 font-bold flex items-center justify-center shrink-0">
                            {item.anak?.nama_anak?.charAt(0).toUpperCase() || 'B'}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-sm">{item.anak?.nama_anak}</div>
                            <div className="text-[10px] text-slate-400 font-normal">NIK: {item.anak?.nik}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-slate-600 font-medium">
                        {item.anak?.posyandu?.nama_pos ? `Pos ${item.anak.posyandu.nama_pos}` : '-'}
                      </td>
                      <td className="p-4 font-semibold text-slate-700">
                        {item.umur_bulan} Bulan
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-slate-800">
                          {item.berat_kg} kg • {item.tinggi_cm} cm
                        </div>
                        {item.lila_cm && (
                          <div className="text-[10px] text-slate-500">LiLA: {item.lila_cm} cm</div>
                        )}
                      </td>
                      <td className="p-4 space-y-1">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${getStatusBadgeColor(item.status_bbu)}`}>
                          BB/U: {item.status_bbu}
                        </span>
                        <br />
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${getStatusBadgeColor(item.status_tbu)}`}>
                          TB/U: {item.status_tbu}
                        </span>
                      </td>
                      <td className="p-4 text-slate-600 font-medium">
                        {item.tanggal_ukur}
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center space-x-1.5">
                          <button
                            onClick={() => handleOpenEditModal(item)}
                            className="p-1.5 text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                            title="Edit Pengukuran"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          {item.anak && (
                            <Link
                              href={`/anak/${item.anak.id}`}
                              className="px-2 py-1 bg-brand-50 hover:bg-brand-100 text-brand-700 font-semibold rounded-lg text-xs transition-colors"
                            >
                              Detail
                            </Link>
                          )}
                          <button
                            onClick={() => handleDelete(item.id, item.anak?.nama_anak || 'Balita')}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Hapus"
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

        {/* INPUT PENGUKURAN MODAL */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative my-8">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center space-x-2.5">
                  <div className="w-9 h-9 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center">
                    <Scale className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      {editingItem ? 'Edit Data Pengukuran Balita' : 'Input Pengukuran Balita Baru'}
                    </h2>
                    <p className="text-xs text-slate-500">Cari nama balita & masukkan data antropometri terbaru</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {error && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* STEP 1: AUTOCOMPLETE CHILD SEARCH (INITIAL MATCHING) */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    1. Cari & Pilih Nama Balita *
                  </label>

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
                        className="w-full pl-10 pr-10 py-3 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-slate-50/50 min-h-[46px]"
                      />
                      {childSearchQuery && (
                        <button
                          type="button"
                          onClick={() => {
                            setChildSearchQuery('');
                            setSelectedChild(null);
                            setIsDropdownOpen(true);
                          }}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-sm font-bold"
                        >
                          ×
                        </button>
                      )}
                    </div>

                    {/* Autocomplete Dropdown */}
                    {isDropdownOpen && (
                      <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl border border-slate-200 shadow-2xl z-30 max-h-56 overflow-y-auto divide-y divide-slate-100">
                        {filteredChildrenForInput.length === 0 ? (
                          <div className="p-4 text-center text-xs text-slate-500">
                            Tidak ada balita yang cocok dengan "{childSearchQuery}"
                          </div>
                        ) : (
                          filteredChildrenForInput.map((child) => (
                            <button
                              key={child.id}
                              type="button"
                              onClick={() => handleSelectChild(child)}
                              className="w-full text-left p-3 hover:bg-brand-50/60 transition-colors flex items-center justify-between gap-3 text-xs"
                            >
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 rounded-xl bg-brand-100 text-brand-700 font-bold flex items-center justify-center text-xs shrink-0">
                                  {child.nama_anak.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <div className="font-bold text-slate-900 text-xs sm:text-sm">{child.nama_anak}</div>
                                  <div className="text-[10px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                                    <span>NIK: {child.nik}</span>
                                    <span>•</span>
                                    <span>{child.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</span>
                                    <span>•</span>
                                    <span>Ibu: {child.nama_ibu}</span>
                                  </div>
                                </div>
                              </div>
                              <span className="text-[11px] font-semibold text-brand-600 shrink-0">Pilih</span>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Selected Child Info Badge */}
                {selectedChild && (
                  <div className="p-3 bg-brand-50 border border-brand-200/80 rounded-2xl flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-xl bg-brand-600 text-white font-bold flex items-center justify-center shrink-0">
                        {selectedChild.nama_anak.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-extrabold text-slate-900">{selectedChild.nama_anak}</div>
                        <div className="text-[11px] text-slate-600">
                          {selectedChild.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'} • Usia: <strong>{ageMonths} Bulan</strong>
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleOpenModalWithChild()}
                      className="text-[11px] font-semibold text-brand-700 hover:underline"
                    >
                      Ganti
                    </button>
                  </div>
                )}

                {/* STEP 2: MEASUREMENT INPUT FORM */}
                <div className="space-y-3 pt-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    2. Data Pengukuran Antropometri
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Tanggal Penimbangan *</label>
                      <input
                        type="date"
                        required
                        value={tanggalUkur}
                        onChange={(e) => setTanggalUkur(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none bg-white min-h-[42px]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Cara Pengukuran *</label>
                      <select
                        value={caraUkur}
                        onChange={(e) => setCaraUkur(e.target.value as any)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none bg-white min-h-[42px]"
                      >
                        <option value="telentang">Telentang / Baring (&lt; 24 bln)</option>
                        <option value="berdiri">Berdiri (&ge; 24 bln)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Berat Badan (Kg) *</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={beratKg}
                        onChange={(e) => setBeratKg(e.target.value)}
                        placeholder="Contoh: 9.8"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none bg-white min-h-[42px]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Tinggi / Panjang Badan (Cm) *</label>
                      <input
                        type="number"
                        step="0.1"
                        required
                        value={tinggiCm}
                        onChange={(e) => setTinggiCm(e.target.value)}
                        placeholder="Contoh: 77.0"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none bg-white min-h-[42px]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">LiLA (Cm - Opsional)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={lilaCm}
                      onChange={(e) => setLilaCm(e.target.value)}
                      placeholder="Contoh: 14.5"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none bg-white min-h-[42px]"
                    />
                  </div>
                </div>

                {/* Live nutrition status preview */}
                {liveStatus && (
                  <div className="p-3.5 bg-brand-50/80 border border-brand-200 rounded-2xl space-y-1.5">
                    <div className="flex items-center space-x-2 text-[11px] font-bold text-brand-800 uppercase tracking-wider">
                      <Activity className="w-3.5 h-3.5 text-brand-600" />
                      <span>Kalkulasi Status Gizi Otomatis</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-white p-2 rounded-xl border border-brand-100">
                        <span className="text-[10px] text-slate-400 block">Status BB/U</span>
                        <span className="font-extrabold text-slate-900">{liveStatus.statusBbu}</span>
                      </div>
                      <div className="bg-white p-2 rounded-xl border border-brand-100">
                        <span className="text-[10px] text-slate-400 block">Status TB/U</span>
                        <span className="font-extrabold text-brand-700">{liveStatus.statusTbu}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl min-h-[42px]"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !selectedChild}
                    className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl min-h-[42px] shadow-md shadow-brand-600/20 disabled:opacity-50"
                  >
                    {submitting ? 'Menyimpan...' : 'Simpan Pengukuran'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Quick Add Standar Parameter Pengukuran Baru */}
        {showMasterModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-900 text-base">Tambah Parameter / Standar Pengukuran Baru</h3>
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
                    Nama Parameter / Standar Baru <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Lingkar Kepala (LK), Pemeriksaan Hb Balita, IMT Balita"
                    value={newMasterName}
                    onChange={(e) => setNewMasterName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-brand-500 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Keterangan / Satuan (Opsional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Contoh: Satuan cm, batas normal Lingkar Kepala bayi sesuai grafik WHO 2026"
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
                    {submittingMaster ? 'Menyimpan...' : 'Tambah Standar Parameter'}
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
