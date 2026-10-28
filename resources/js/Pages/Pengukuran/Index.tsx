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
  Heart,
  Stethoscope,
  Smile,
  ShieldAlert,
  Edit2,
  TrendingUp,
} from 'lucide-react';
import { UserSession } from '../../Components/Navbar';
import { getStatusBadgeColor } from '../../lib/statusGizi';
import SearchableSelect, { SearchOption } from '../../Components/SearchableSelect';

interface Child {
  id: string;
  nik: string;
  nama_anak: string;
  jenis_kelamin: 'L' | 'P';
  tanggal_lahir: string;
  nama_ibu: string;
  nama_ayah?: string;
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
  cara_ukur_berat?: string;
  lila_cm?: number | null;
  lingkar_kepala_cm?: number | null;
  pitting_edema_bilateral?: boolean;
  umur_bulan: number;
  status_bbu: string;
  status_tbu: string;
  status_bbtb: string;
  naik_berat_badan?: string;
  keterangan_naik_bb?: string;
  kelas_balita?: boolean;
  menerima_mbg?: boolean;
  vitamin_a?: boolean;
  anak?: Child;
  userInput?: { nama: string };
}

interface Bumil {
  id: string;
  nik: string;
  nama: string;
  nama_suami: string;
  hpht?: string;
  id_pos: string;
  posyandu?: { nama_pos: string };
}

interface AncRecord {
  id: string;
  id_bumil: string;
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
  lab_protein_urine?: string;
  lab_gula_sewaktu?: number;
  menerima_mbg?: boolean;
  tatalaksana_kek?: boolean;
  konseling?: boolean;
  keluhan?: string;
  ibuHamil?: Bumil;
  ibu_hamil?: Bumil;
  userInput?: { nama: string };
}

interface NifasRecord {
  id: string;
  id_bumil: string;
  tanggal_melahirkan: string;
  tanggal_kunjungan: string;
  periode_kf: string;
  jenis_tenaga: string;
  kesadaran: string;
  tekanan_darah: string;
  suhu_tubuh: string;
  kondisi_payudara: string;
  kontraksi_uterus: string;
  warna_lokhia: string;
  produksi_asi: string;
  perdarahan_masif: boolean;
  kejang: boolean;
  syok: boolean;
  frekuensi_pernafasan?: string;
  bau_lokhia?: string;
  perineum?: string;
  vitamin_a_nifas?: boolean;
  rencana_kb?: string;
  keluhan?: string;
  tindakan?: string;
  bumil?: Bumil;
  ibu_hamil?: Bumil;
  userInput?: { nama: string };
}

interface MenyusuiRecord {
  id: string;
  id_bumil: string;
  tanggal_pemantauan: string;
  status_asi: string;
  produksi_asi: string;
  masalah_menyusui?: string;
  konseling_asi: boolean;
  asi_eksklusif: boolean;
  keterangan?: string;
  bumil?: Bumil;
  ibu_hamil?: Bumil;
  userInput?: { nama: string };
}

interface PengukuranPageProps {
  childrenList: Child[];
  pengukuranList?: PengukuranRecord[];
  bumilList?: Bumil[];
  ancList?: AncRecord[];
  nifasList?: NifasRecord[];
  menyusuiList?: MenyusuiRecord[];
  posyandus?: any[];
}

export default function Index({
  childrenList = [],
  pengukuranList = [],
  bumilList = [],
  ancList = [],
  nifasList = [],
  menyusuiList = [],
  posyandus = [],
}: PengukuranPageProps) {
  const page = usePage();
  const user = (page.props as any).auth?.user as UserSession | null;

  // Master Slide Bar: 'balita' | 'ibu'
  const [mainTab, setMainTab] = useState<'balita' | 'ibu'>('balita');

  // Sub Tab for Ibu: 'anc' | 'nifas' | 'menyusui'
  const [ibuSubTab, setIbuSubTab] = useState<'anc' | 'nifas' | 'menyusui'>('anc');

  const [searchTerm, setSearchTerm] = useState('');
  const [posyanduFilter, setPosyanduFilter] = useState('');

  // Search Options for SearchableSelect
  const childOptions: SearchOption[] = useMemo(() => {
    return childrenList.map((c) => ({
      id: c.id,
      title: c.nama_anak,
      subtitle: `NIK: ${c.nik} | Ibu: ${c.nama_ibu || '-'}${c.nama_ayah ? ` | Ayah: ${c.nama_ayah}` : ''}`,
      badge: c.posyandu?.nama_pos ? `Pos ${c.posyandu.nama_pos}` : undefined,
    }));
  }, [childrenList]);

  const bumilOptions: SearchOption[] = useMemo(() => {
    return bumilList.map((b) => ({
      id: b.id,
      title: b.nama,
      subtitle: `NIK: ${b.nik} | Suami: ${b.nama_suami || '-'}`,
      badge: b.posyandu?.nama_pos ? `Pos ${b.posyandu.nama_pos}` : undefined,
    }));
  }, [bumilList]);

  // ==========================================================
  // 1. BALITA MEASUREMENT MODAL & ACTIONS
  // ==========================================================
  const [showChildMeasureModal, setShowChildMeasureModal] = useState(false);
  const [childMeasureSubmitting, setChildMeasureSubmitting] = useState(false);
  const [childMeasureError, setChildMeasureError] = useState('');
  const [editingChildMeasureId, setEditingChildMeasureId] = useState<string | null>(null);

  const [childMeasureForm, setChildMeasureForm] = useState({
    id_anak: '',
    tanggal_ukur: new Date().toISOString().split('T')[0],
    berat_kg: '',
    tinggi_cm: '',
    cara_ukur: 'telentang',
    cara_ukur_berat: 'digital',
    lila_cm: '',
    lingkar_kepala_cm: '',
    pitting_edema_bilateral: false,
    naik_berat_badan: '',
    keterangan_naik_bb: '',
    kelas_balita: false,
    menerima_mbg: false,
    vitamin_a: false,
  });

  const openAddChildMeasure = () => {
    setEditingChildMeasureId(null);
    setChildMeasureForm({
      id_anak: childrenList[0]?.id || '',
      tanggal_ukur: new Date().toISOString().split('T')[0],
      berat_kg: '',
      tinggi_cm: '',
      cara_ukur: 'telentang',
      cara_ukur_berat: 'digital',
      lila_cm: '',
      lingkar_kepala_cm: '',
      pitting_edema_bilateral: false,
      naik_berat_badan: '',
      keterangan_naik_bb: '',
      kelas_balita: false,
      menerima_mbg: false,
      vitamin_a: false,
    });
    setChildMeasureError('');
    setShowChildMeasureModal(true);
  };

  const openEditChildMeasure = (m: PengukuranRecord) => {
    setEditingChildMeasureId(m.id);
    setChildMeasureForm({
      id_anak: m.id_anak,
      tanggal_ukur: m.tanggal_ukur ? m.tanggal_ukur.split('T')[0] : '',
      berat_kg: m.berat_kg.toString(),
      tinggi_cm: m.tinggi_cm.toString(),
      cara_ukur: m.cara_ukur || 'telentang',
      cara_ukur_berat: m.cara_ukur_berat || 'digital',
      lila_cm: m.lila_cm ? m.lila_cm.toString() : '',
      lingkar_kepala_cm: m.lingkar_kepala_cm ? m.lingkar_kepala_cm.toString() : '',
      pitting_edema_bilateral: !!m.pitting_edema_bilateral,
      naik_berat_badan: m.naik_berat_badan || '',
      keterangan_naik_bb: m.keterangan_naik_bb || '',
      kelas_balita: !!m.kelas_balita,
      menerima_mbg: !!m.menerima_mbg,
      vitamin_a: !!m.vitamin_a,
    });
    setChildMeasureError('');
    setShowChildMeasureModal(true);
  };

  const handleChildMeasureSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!childMeasureForm.id_anak) {
      setChildMeasureError('Silakan pilih balita terlebih dahulu.');
      return;
    }
    setChildMeasureSubmitting(true);
    setChildMeasureError('');

    if (editingChildMeasureId) {
      router.put(`/pengukuran/${editingChildMeasureId}`, childMeasureForm, {
        preserveScroll: true,
        onSuccess: () => {
          setShowChildMeasureModal(false);
          setChildMeasureSubmitting(false);
          setEditingChildMeasureId(null);
        },
        onError: (errs) => {
          setChildMeasureError(Object.values(errs)[0] as string);
          setChildMeasureSubmitting(false);
        },
      });
    } else {
      router.post('/pengukuran', childMeasureForm, {
        preserveScroll: true,
        onSuccess: () => {
          setShowChildMeasureModal(false);
          setChildMeasureSubmitting(false);
        },
        onError: (errs) => {
          setChildMeasureError(Object.values(errs)[0] as string);
          setChildMeasureSubmitting(false);
        },
      });
    }
  };

  const handleDeleteChildMeasure = (id: string) => {
    if (confirm('Yakin ingin menghapus data pengukuran balita ini?')) {
      router.delete(`/pengukuran/${id}`, { preserveScroll: true });
    }
  };

  // Filtered Pengukuran Balita List
  const filteredChildMeasures = useMemo(() => {
    return pengukuranList.filter((m) => {
      const matchSearch =
        !searchTerm.trim() ||
        m.anak?.nama_anak.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.anak?.nik.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.anak?.nama_ibu && m.anak.nama_ibu.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchPos = !posyanduFilter || m.anak?.id_pos === posyanduFilter;
      return matchSearch && matchPos;
    });
  }, [pengukuranList, searchTerm, posyanduFilter]);

  // ==========================================================
  // 2. IBU HAMIL (ANC) MODAL & ACTIONS
  // ==========================================================
  const [showAncModal, setShowAncModal] = useState(false);
  const [ancSubmitting, setAncSubmitting] = useState(false);
  const [ancError, setAncError] = useState('');
  const [editingAncId, setEditingAncId] = useState<string | null>(null);

  const [ancForm, setAncForm] = useState({
    id_bumil: '',
    tanggal_periksa: new Date().toISOString().split('T')[0],
    usia_kehamilan_minggu: '16',
    berat_kg: '',
    tinggi_cm: '155',
    lila_cm: '',
    tekanan_darah: '120/80',
    tfu_cm: '',
    presentasi_janin: 'Kepala',
    djj: '140',
    usg: false,
    lab_hb: '12.0',
    lab_protein_urine: 'Negatif (-)',
    lab_gula_sewaktu: '95',
    tatalaksana_kek: false,
    menerima_mbg: false,
    konseling: true,
    keluhan: '',
  });

  const openAddAnc = () => {
    setEditingAncId(null);
    setAncForm({
      id_bumil: bumilList[0]?.id || '',
      tanggal_periksa: new Date().toISOString().split('T')[0],
      usia_kehamilan_minggu: '16',
      berat_kg: '',
      tinggi_cm: '155',
      lila_cm: '',
      tekanan_darah: '120/80',
      tfu_cm: '',
      presentasi_janin: 'Kepala',
      djj: '140',
      usg: false,
      lab_hb: '12.0',
      lab_protein_urine: 'Negatif (-)',
      lab_gula_sewaktu: '95',
      tatalaksana_kek: false,
      menerima_mbg: false,
      konseling: true,
      keluhan: '',
    });
    setAncError('');
    setShowAncModal(true);
  };

  const openEditAnc = (a: AncRecord) => {
    setEditingAncId(a.id);
    setAncForm({
      id_bumil: a.id_bumil,
      tanggal_periksa: a.tanggal_periksa ? a.tanggal_periksa.split('T')[0] : '',
      usia_kehamilan_minggu: a.usia_kehamilan_minggu.toString(),
      berat_kg: a.berat_kg.toString(),
      tinggi_cm: a.tinggi_cm ? a.tinggi_cm.toString() : '155',
      lila_cm: a.lila_cm.toString(),
      tekanan_darah: a.tekanan_darah,
      tfu_cm: a.tfu_cm ? a.tfu_cm.toString() : '',
      presentasi_janin: a.presentasi_janin || 'Kepala',
      djj: a.djj ? a.djj.toString() : '140',
      usg: !!a.usg,
      lab_hb: a.lab_hb ? a.lab_hb.toString() : '12.0',
      lab_protein_urine: a.lab_protein_urine || 'Negatif (-)',
      lab_gula_sewaktu: a.lab_gula_sewaktu ? a.lab_gula_sewaktu.toString() : '95',
      tatalaksana_kek: !!a.tatalaksana_kek,
      menerima_mbg: !!a.menerima_mbg,
      konseling: !!a.konseling,
      keluhan: a.keluhan || '',
    });
    setAncError('');
    setShowAncModal(true);
  };

  const handleAncSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ancForm.id_bumil) {
      setAncError('Silakan pilih ibu hamil sasaran.');
      return;
    }
    setAncSubmitting(true);
    setAncError('');

    if (editingAncId) {
      router.put(`/ibu-hamil/pengukuran/${editingAncId}`, ancForm, {
        preserveScroll: true,
        onSuccess: () => {
          setShowAncModal(false);
          setAncSubmitting(false);
          setEditingAncId(null);
        },
        onError: (errs) => {
          setAncError(Object.values(errs)[0] as string);
          setAncSubmitting(false);
        },
      });
    } else {
      router.post(`/ibu-hamil/${ancForm.id_bumil}/pengukuran`, ancForm, {
        preserveScroll: true,
        onSuccess: () => {
          setShowAncModal(false);
          setAncSubmitting(false);
        },
        onError: (errs) => {
          setAncError(Object.values(errs)[0] as string);
          setAncSubmitting(false);
        },
      });
    }
  };

  const handleDeleteAnc = (id: string) => {
    if (confirm('Yakin ingin menghapus catatan pemeriksaan ANC ini?')) {
      router.delete(`/ibu-hamil/pengukuran/${id}`, { preserveScroll: true });
    }
  };

  // Filtered ANC List
  const filteredAncList = useMemo(() => {
    return ancList.filter((a) => {
      const bumil = a.ibu_hamil || a.ibuHamil;
      const matchSearch =
        !searchTerm.trim() ||
        (bumil?.nama && bumil.nama.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (bumil?.nik && bumil.nik.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (bumil?.nama_suami && bumil.nama_suami.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchPos = !posyanduFilter || bumil?.id_pos === posyanduFilter;
      return matchSearch && matchPos;
    });
  }, [ancList, searchTerm, posyanduFilter]);

  // ==========================================================
  // 3. KUNJUNGAN NIFAS (KF1-KF4) MODAL & ACTIONS
  // ==========================================================
  const [showNifasModal, setShowNifasModal] = useState(false);
  const [nifasSubmitting, setNifasSubmitting] = useState(false);
  const [nifasError, setNifasError] = useState('');
  const [editingNifasId, setEditingNifasId] = useState<string | null>(null);

  const [nifasForm, setNifasForm] = useState({
    id_bumil: '',
    tanggal_melahirkan: new Date().toISOString().split('T')[0],
    tanggal_kunjungan: new Date().toISOString().split('T')[0],
    jenis_tenaga: 'Bidan',
    kesadaran: 'Compos Mentis',
    perdarahan_masif: false,
    kejang: false,
    syok: false,
    tekanan_darah: '120/80',
    suhu_tubuh: 'Normal (36-37,5 C)',
    kondisi_payudara: 'Normal',
    kontraksi_uterus: 'Baik',
    warna_lokhia: 'Merah',
    produksi_asi: 'Ada, Banyak',
    buang_air_kecil: true,
    buang_air_besar: true,
    mood: 'Tidak Depresif',
    diberikan_ttd: true,
    diberikan_vit_a: true,
    tempat: 'Puskesmas Sukomalo',
  });

  const openAddNifas = () => {
    setEditingNifasId(null);
    setNifasForm({
      id_bumil: bumilList[0]?.id || '',
      tanggal_melahirkan: new Date().toISOString().split('T')[0],
      tanggal_kunjungan: new Date().toISOString().split('T')[0],
      jenis_tenaga: 'Bidan',
      kesadaran: 'Compos Mentis',
      perdarahan_masif: false,
      kejang: false,
      syok: false,
      tekanan_darah: '120/80',
      suhu_tubuh: 'Normal (36-37,5 C)',
      kondisi_payudara: 'Normal',
      kontraksi_uterus: 'Baik',
      warna_lokhia: 'Merah',
      produksi_asi: 'Ada, Banyak',
      buang_air_kecil: true,
      buang_air_besar: true,
      mood: 'Tidak Depresif',
      diberikan_ttd: true,
      diberikan_vit_a: true,
      tempat: 'Puskesmas Sukomalo',
    });
    setNifasError('');
    setShowNifasModal(true);
  };

  const openEditNifas = (kn: NifasRecord) => {
    setEditingNifasId(kn.id);
    setNifasForm({
      id_bumil: kn.id_bumil,
      tanggal_melahirkan: kn.tanggal_melahirkan ? kn.tanggal_melahirkan.split('T')[0] : '',
      tanggal_kunjungan: kn.tanggal_kunjungan ? kn.tanggal_kunjungan.split('T')[0] : '',
      jenis_tenaga: kn.jenis_tenaga || 'Bidan',
      kesadaran: kn.kesadaran || 'Compos Mentis',
      perdarahan_masif: !!kn.perdarahan_masif,
      kejang: !!kn.kejang,
      syok: !!kn.syok,
      tekanan_darah: kn.tekanan_darah || '120/80',
      suhu_tubuh: kn.suhu_tubuh || 'Normal (36-37,5 C)',
      kondisi_payudara: kn.kondisi_payudara || 'Normal',
      kontraksi_uterus: kn.kontraksi_uterus || 'Baik',
      warna_lokhia: kn.warna_lokhia || 'Merah',
      produksi_asi: kn.produksi_asi || 'Ada, Banyak',
      buang_air_kecil: true,
      buang_air_besar: true,
      mood: 'Tidak Depresif',
      diberikan_ttd: true,
      diberikan_vit_a: !!kn.vitamin_a_nifas,
      tempat: 'Puskesmas Sukomalo',
    });
    setNifasError('');
    setShowNifasModal(true);
  };

  const handleNifasSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nifasForm.id_bumil) {
      setNifasError('Silakan pilih ibu sasaran.');
      return;
    }
    setNifasSubmitting(true);
    setNifasError('');

    if (editingNifasId) {
      router.put(`/ibu-hamil/nifas/${editingNifasId}`, nifasForm, {
        preserveScroll: true,
        onSuccess: () => {
          setShowNifasModal(false);
          setNifasSubmitting(false);
          setEditingNifasId(null);
        },
        onError: (errs) => {
          setNifasError(Object.values(errs)[0] as string);
          setNifasSubmitting(false);
        },
      });
    } else {
      router.post('/ibu-hamil/nifas', nifasForm, {
        preserveScroll: true,
        onSuccess: () => {
          setShowNifasModal(false);
          setNifasSubmitting(false);
        },
        onError: (errs) => {
          setNifasError(Object.values(errs)[0] as string);
          setNifasSubmitting(false);
        },
      });
    }
  };

  const handleDeleteNifas = (id: string) => {
    if (confirm('Yakin ingin menghapus data kunjungan nifas ini?')) {
      router.delete(`/ibu-hamil/nifas/${id}`, { preserveScroll: true });
    }
  };

  // ==========================================================
  // 4. PEMANTAUAN MENYUSUI MODAL & ACTIONS
  // ==========================================================
  const [showMenyusuiModal, setShowMenyusuiModal] = useState(false);
  const [menyusuiSubmitting, setMenyusuiSubmitting] = useState(false);
  const [menyusuiError, setMenyusuiError] = useState('');
  const [editingMenyusuiId, setEditingMenyusuiId] = useState<string | null>(null);

  const [menyusuiForm, setMenyusuiForm] = useState({
    id_bumil: '',
    tanggal_pemantauan: new Date().toISOString().split('T')[0],
    status_asi: 'Ada',
    produksi_asi: 'Banyak',
    masalah_menyusui: 'Tidak ada',
    konseling_asi: true,
    asi_eksklusif: true,
  });

  const openAddMenyusui = () => {
    setEditingMenyusuiId(null);
    setMenyusuiForm({
      id_bumil: bumilList[0]?.id || '',
      tanggal_pemantauan: new Date().toISOString().split('T')[0],
      status_asi: 'Ada',
      produksi_asi: 'Banyak',
      masalah_menyusui: 'Tidak ada',
      konseling_asi: true,
      asi_eksklusif: true,
    });
    setMenyusuiError('');
    setShowMenyusuiModal(true);
  };

  const openEditMenyusui = (m: MenyusuiRecord) => {
    setEditingMenyusuiId(m.id);
    setMenyusuiForm({
      id_bumil: m.id_bumil,
      tanggal_pemantauan: m.tanggal_pemantauan ? m.tanggal_pemantauan.split('T')[0] : '',
      status_asi: m.status_asi || 'Ada',
      produksi_asi: m.produksi_asi || 'Banyak',
      masalah_menyusui: m.masalah_menyusui || 'Tidak ada',
      konseling_asi: !!m.konseling_asi,
      asi_eksklusif: !!m.asi_eksklusif,
    });
    setMenyusuiError('');
    setShowMenyusuiModal(true);
  };

  const handleMenyusuiSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!menyusuiForm.id_bumil) {
      setMenyusuiError('Silakan pilih ibu sasaran.');
      return;
    }
    setMenyusuiSubmitting(true);
    setMenyusuiError('');

    if (editingMenyusuiId) {
      router.put(`/ibu-hamil/menyusui/${editingMenyusuiId}`, menyusuiForm, {
        preserveScroll: true,
        onSuccess: () => {
          setShowMenyusuiModal(false);
          setMenyusuiSubmitting(false);
          setEditingMenyusuiId(null);
        },
        onError: (errs) => {
          setMenyusuiError(Object.values(errs)[0] as string);
          setMenyusuiSubmitting(false);
        },
      });
    } else {
      router.post('/ibu-hamil/menyusui', menyusuiForm, {
        preserveScroll: true,
        onSuccess: () => {
          setShowMenyusuiModal(false);
          setMenyusuiSubmitting(false);
        },
        onError: (errs) => {
          setMenyusuiError(Object.values(errs)[0] as string);
          setMenyusuiSubmitting(false);
        },
      });
    }
  };

  const handleDeleteMenyusui = (id: string) => {
    if (confirm('Yakin ingin menghapus data pemantauan menyusui ini?')) {
      router.delete(`/ibu-hamil/menyusui/${id}`, { preserveScroll: true });
    }
  };

  return (
    <AppShell user={user}>
      <div className="space-y-6">
        {/* Header & Page Title */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-teal-50 text-teal-700 rounded-2xl">
                <Scale className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
                  Pusat Pencatatan Pelayanan Posyandu
                </h1>
                <p className="text-slate-500 text-sm mt-0.5">
                  Entri penimbangan antropometri balita dan pemeriksaan fisik lengkap ibu (ANC, Nifas, Menyusui)
                </p>
              </div>
            </div>
          </div>

          {/* Master Slide Bar Switcher */}
          <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200/80 shadow-inner">
            <button
              onClick={() => setMainTab('balita')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 shadow-sm ${
                mainTab === 'balita'
                  ? 'bg-teal-600 text-white shadow-teal-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Baby className="w-4 h-4" />
              Pengukuran Balita ({pengukuranList.length})
            </button>

            <button
              onClick={() => setMainTab('ibu')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 shadow-sm ${
                mainTab === 'ibu'
                  ? 'bg-rose-600 text-white shadow-rose-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Heart className="w-4 h-4" />
              Pemeriksaan Ibu ({ancList.length + nifasList.length + menyusuiList.length})
            </button>
          </div>
        </div>

        {/* Sub Switcher Jika Memilih Tab Ibu */}
        {mainTab === 'ibu' && (
          <div className="bg-white px-6 pt-2 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex border-b border-slate-200 overflow-x-auto gap-2">
              <button
                onClick={() => setIbuSubTab('anc')}
                className={`pb-3 px-4 text-sm font-semibold border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
                  ibuSubTab === 'anc'
                    ? 'border-rose-600 text-rose-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <Stethoscope className="w-4 h-4" />
                1. Pemeriksaan Kehamilan / ANC ({ancList.length})
              </button>

              <button
                onClick={() => setIbuSubTab('nifas')}
                className={`pb-3 px-4 text-sm font-semibold border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
                  ibuSubTab === 'nifas'
                    ? 'border-teal-600 text-teal-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <Activity className="w-4 h-4" />
                2. Kunjungan Nifas KF1–KF4 ({nifasList.length})
              </button>

              <button
                onClick={() => setIbuSubTab('menyusui')}
                className={`pb-3 px-4 text-sm font-semibold border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
                  ibuSubTab === 'menyusui'
                    ? 'border-amber-600 text-amber-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <Smile className="w-4 h-4" />
                3. Pemantauan Menyusui / ASI ({menyusuiList.length})
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* BAGIAN 1: TAB PENGUKURAN BALITA                          */}
        {/* ======================================================== */}
        {mainTab === 'balita' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-3 items-center justify-between">
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Cari balita, NIK, nama ibu..."
                  className="w-full pl-10 pr-4 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                {posyandus.length > 0 && (
                  <select
                    value={posyanduFilter}
                    onChange={(e) => setPosyanduFilter(e.target.value)}
                    className="border rounded-xl px-3 py-2 text-sm bg-white"
                  >
                    <option value="">Semua Posyandu</option>
                    {posyandus.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nama_pos}
                      </option>
                    ))}
                  </select>
                )}

                <button
                  onClick={openAddChildMeasure}
                  className="bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition flex items-center gap-2 shrink-0 ml-auto"
                >
                  <PlusCircle className="w-4 h-4" />
                  + Catat Pengukuran Balita
                </button>
              </div>
            </div>

            {/* Tabel Pengukuran Balita */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-100">
                      <th className="py-3.5 px-4">Nama Balita</th>
                      <th className="py-3.5 px-4">Posyandu</th>
                      <th className="py-3.5 px-4">Tgl Ukur & Usia</th>
                      <th className="py-3.5 px-4">Hasil (BB / TB / LiLA / LK)</th>
                      <th className="py-3.5 px-4">Status Gizi (BB/U & TB/U)</th>
                      <th className="py-3.5 px-4" title="T: Tidak Naik | N: Naik | B: Baru ditimbang">
                        Kenaikan BB (T/N)
                      </th>
                      <th className="py-3.5 px-4">Program (MBG/Vit)</th>
                      <th className="py-3.5 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredChildMeasures.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-slate-400">
                          Tidak ada catatan pengukuran balita ditemukan.
                        </td>
                      </tr>
                    ) : (
                      filteredChildMeasures.map((m) => (
                        <tr key={m.id} className="hover:bg-slate-50/80 transition">
                          <td className="py-3.5 px-4">
                            <Link href={`/anak/${m.id_anak}`} className="font-semibold text-slate-800 hover:text-teal-600">
                              {m.anak?.nama_anak}
                            </Link>
                            <div className="text-xs text-slate-400">
                              Ibu: {m.anak?.nama_ibu || '-'}
                              {m.anak?.nama_ayah ? ` • Ayah: ${m.anak.nama_ayah}` : ''}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-slate-600">{m.anak?.posyandu?.nama_pos}</td>
                          <td className="py-3.5 px-4">
                            <div className="font-medium text-slate-800">
                              {new Date(m.tanggal_ukur).toLocaleDateString('id-ID')}
                            </div>
                            <div className="text-xs text-slate-400">{m.umur_bulan} Bulan</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-slate-800">{m.berat_kg} kg • {m.tinggi_cm} cm</div>
                            <div className="text-xs text-slate-500">
                              Cara: {m.cara_ukur} | LiLA: {m.lila_cm || '-'} cm | LK: {m.lingkar_kepala_cm || '-'} cm
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full ${getStatusBadgeColor(m.status_bbu)}`}>
                              BB/U: {m.status_bbu}
                            </span>
                            <div className="text-[11px] text-slate-500 mt-0.5">TB/U: {m.status_tbu}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            {m.naik_berat_badan === 'N' ? (
                              <span
                                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-emerald-100 text-emerald-800"
                                title="Naik (N): Berat badan naik memenuhi target kenaikan minimal (KBM)"
                              >
                                Naik (N)
                              </span>
                            ) : m.naik_berat_badan === 'T' ? (
                              <span
                                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-rose-100 text-rose-800"
                                title="Tidak Naik (T): Berat badan tidak naik, tetap, atau turun"
                              >
                                Tidak Naik (T)
                              </span>
                            ) : m.naik_berat_badan === 'B' ? (
                              <span
                                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-blue-100 text-blue-800"
                                title="Baru (B): Balita baru pertama kali ditimbang"
                              >
                                Baru (B)
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600">
                                {m.naik_berat_badan || '-'}
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-xs space-y-0.5">
                            {m.menerima_mbg && <div className="text-emerald-700 font-medium">✓ MBG</div>}
                            {m.vitamin_a && <div className="text-amber-700 font-medium">✓ Vitamin A</div>}
                            {!m.menerima_mbg && !m.vitamin_a && <div className="text-slate-400">-</div>}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => openEditChildMeasure(m)}
                                className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition"
                                title="Edit Pengukuran"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteChildMeasure(m.id)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                                title="Hapus Pengukuran"
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
        )}

        {/* ======================================================== */}
        {/* BAGIAN 2: TAB PEMERIKSAAN KESEHATAN IBU                  */}
        {/* ======================================================== */}
        {mainTab === 'ibu' && (
          <div className="space-y-4">
            {/* SUB-TAB 1: ANC */}
            {ibuSubTab === 'anc' && (
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">Catatan Pemeriksaan Kehamilan (ANC)</h2>
                    <p className="text-slate-500 text-xs">Pemeriksaan fisik, laboratorium, DJJ, dan status gizi ibu hamil</p>
                  </div>
                  <button
                    onClick={openAddAnc}
                    className="bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition flex items-center gap-2"
                  >
                    <PlusCircle className="w-4 h-4" />
                    + Catat Pemeriksaan ANC
                  </button>
                </div>

                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm">
                      <thead>
                        <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-100">
                          <th className="py-3.5 px-4">Nama Ibu</th>
                          <th className="py-3.5 px-4">Tgl Periksa & Usia</th>
                          <th className="py-3.5 px-4">Tensi & BB/TB</th>
                          <th className="py-3.5 px-4">LiLA & Status Gizi</th>
                          <th className="py-3.5 px-4">TFU & DJJ</th>
                          <th className="py-3.5 px-4">Laboratorium</th>
                          <th className="py-3.5 px-4">Pemeriksa</th>
                          <th className="py-3.5 px-4 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredAncList.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="py-12 text-center text-slate-400">
                              Belum ada catatan pemeriksaan ANC.
                            </td>
                          </tr>
                        ) : (
                          filteredAncList.map((a) => {
                            const bumil = a.ibu_hamil || a.ibuHamil;
                            return (
                              <tr key={a.id} className="hover:bg-slate-50/80 transition">
                                <td className="py-3.5 px-4">
                                  <div className="font-semibold text-slate-800">{bumil?.nama || 'Nama Tidak Tersedia'}</div>
                                  <div className="text-xs text-slate-500">
                                    Suami: <span className="text-slate-700 font-medium">{bumil?.nama_suami || '-'}</span>
                                    {bumil?.nik && ` • NIK: ${bumil.nik}`}
                                  </div>
                                </td>
                                <td className="py-3.5 px-4 text-slate-600">
                                  {new Date(a.tanggal_periksa).toLocaleDateString('id-ID')}
                                  <div className="text-xs text-slate-500">{a.usia_kehamilan_minggu} Minggu</div>
                                </td>
                                <td className="py-3.5 px-4">
                                  <div className="font-medium text-slate-800">TD: {a.tekanan_darah}</div>
                                  <div className="text-xs text-slate-500">BB: {a.berat_kg} kg | TB: {a.tinggi_cm || '-'} cm</div>
                                </td>
                                <td className="py-3.5 px-4">
                                  <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${getStatusBadgeColor(a.status_gizi_bumil)}`}>
                                    {a.status_gizi_bumil} ({a.lila_cm} cm)
                                  </span>
                                </td>
                                <td className="py-3.5 px-4 text-xs text-slate-700">
                                  <div>TFU: {a.tfu_cm ? `${a.tfu_cm} cm` : '-'}</div>
                                  <div>DJJ: {a.djj ? `${a.djj} dpm` : '-'}</div>
                                </td>
                                <td className="py-3.5 px-4 text-xs text-slate-600">
                                  <div>Hb: {a.lab_hb ? `${a.lab_hb} g/dL` : '-'}</div>
                                  <div>Protein: {a.lab_protein_urine || '-'}</div>
                                </td>
                                <td className="py-3.5 px-4 text-xs text-slate-500">
                                  {a.userInput?.nama || 'Bidan'}
                                </td>
                                <td className="py-3.5 px-4 text-right">
                                  <div className="flex items-center justify-end gap-1.5">
                                    <button
                                      onClick={() => openEditAnc(a)}
                                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                                      title="Edit Pemeriksaan ANC"
                                    >
                                      <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteAnc(a.id)}
                                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                                      title="Hapus Pemeriksaan ANC"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
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

            {/* SUB-TAB 2: NIFAS */}
            {ibuSubTab === 'nifas' && (
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">Catatan Kunjungan Nifas (KF1–KF4)</h2>
                    <p className="text-slate-500 text-xs">Pencatatan tanda bahaya nifas, TTV, kontraksi, dan lokhia</p>
                  </div>
                  <button
                    onClick={openAddNifas}
                    className="bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition flex items-center gap-2"
                  >
                    <PlusCircle className="w-4 h-4" />
                    + Catat Kunjungan Nifas
                  </button>
                </div>

                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm">
                      <thead>
                        <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-100">
                          <th className="py-3.5 px-4">Nama Ibu</th>
                          <th className="py-3.5 px-4">Tgl Melahirkan & Kunjungan</th>
                          <th className="py-3.5 px-4">Periode KF</th>
                          <th className="py-3.5 px-4">TTV & TD</th>
                          <th className="py-3.5 px-4">Kondisi Payudara & Lokhia</th>
                          <th className="py-3.5 px-4">Tanda Bahaya</th>
                          <th className="py-3.5 px-4 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {nifasList.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="py-12 text-center text-slate-400">
                              Belum ada catatan kunjungan nifas.
                            </td>
                          </tr>
                        ) : (
                          nifasList.map((kn) => {
                            const bumil = kn.bumil || kn.ibu_hamil;
                            const hasBahaya = kn.perdarahan_masif || kn.kejang || kn.syok;
                            return (
                              <tr key={kn.id} className="hover:bg-slate-50/80 transition">
                                <td className="py-3.5 px-4 font-semibold text-slate-800">
                                  {bumil?.nama}
                                  <div className="text-xs text-slate-400">
                                    Suami: {bumil?.nama_suami || '-'} • Pos: {bumil?.posyandu?.nama_pos || '-'}
                                  </div>
                                </td>
                                <td className="py-3.5 px-4 text-slate-600">
                                  <div>Kunjungan: {new Date(kn.tanggal_kunjungan).toLocaleDateString('id-ID')}</div>
                                  <div className="text-xs text-slate-400">Lahir: {new Date(kn.tanggal_melahirkan).toLocaleDateString('id-ID')}</div>
                                </td>
                                <td className="py-3.5 px-4">
                                  <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-teal-100 text-teal-800">
                                    {kn.periode_kf}
                                  </span>
                                </td>
                                <td className="py-3.5 px-4 text-slate-700">
                                  <div className="font-medium">TD: {kn.tekanan_darah}</div>
                                  <div className="text-xs text-slate-400">{kn.suhu_tubuh}</div>
                                </td>
                                <td className="py-3.5 px-4 text-xs text-slate-600">
                                  <div>Payudara: {kn.kondisi_payudara}</div>
                                  <div>Lokhia: {kn.warna_lokhia} | ASI: {kn.produksi_asi}</div>
                                </td>
                                <td className="py-3.5 px-4">
                                  {hasBahaya ? (
                                    <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">
                                      <ShieldAlert className="w-3.5 h-3.5" /> Bahaya
                                    </span>
                                  ) : (
                                    <span className="text-xs text-emerald-600 font-medium">Aman</span>
                                  )}
                                </td>
                                <td className="py-3.5 px-4 text-right">
                                  <div className="flex items-center justify-end gap-1.5">
                                    <button
                                      onClick={() => openEditNifas(kn)}
                                      className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition"
                                      title="Edit Kunjungan Nifas"
                                    >
                                      <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteNifas(kn.id)}
                                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                                      title="Hapus Kunjungan Nifas"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
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

            {/* SUB-TAB 3: MENYUSUI */}
            {ibuSubTab === 'menyusui' && (
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">Catatan Pemantauan Menyusui (ASI)</h2>
                    <p className="text-slate-500 text-xs">Status pemberian ASI eksklusif dan konseling laktasi</p>
                  </div>
                  <button
                    onClick={openAddMenyusui}
                    className="bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition flex items-center gap-2"
                  >
                    <PlusCircle className="w-4 h-4" />
                    + Catat Pemantauan Menyusui
                  </button>
                </div>

                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm">
                      <thead>
                        <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-100">
                          <th className="py-3.5 px-4">Nama Ibu</th>
                          <th className="py-3.5 px-4">Tgl Pemantauan</th>
                          <th className="py-3.5 px-4">Status & Produksi ASI</th>
                          <th className="py-3.5 px-4">Masalah Menyusui</th>
                          <th className="py-3.5 px-4">Konseling</th>
                          <th className="py-3.5 px-4 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {menyusuiList.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-12 text-center text-slate-400">
                              Belum ada catatan pemantauan menyusui.
                            </td>
                          </tr>
                        ) : (
                          menyusuiList.map((m) => {
                            const bumil = m.bumil || m.ibu_hamil;
                            return (
                              <tr key={m.id} className="hover:bg-slate-50/80 transition">
                                <td className="py-3.5 px-4 font-semibold text-slate-800">
                                  {bumil?.nama}
                                  <div className="text-xs text-slate-400">
                                    Suami: {bumil?.nama_suami || '-'} • Pos: {bumil?.posyandu?.nama_pos || '-'}
                                  </div>
                                </td>
                                <td className="py-3.5 px-4 text-slate-600">
                                  {new Date(m.tanggal_pemantauan).toLocaleDateString('id-ID')}
                                </td>
                                <td className="py-3.5 px-4">
                                  <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${
                                    m.asi_eksklusif ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                                  }`}>
                                    {m.asi_eksklusif ? 'ASI Eksklusif' : 'Non-Eksklusif'}
                                  </span>
                                  <div className="text-xs text-slate-400 mt-0.5">Produksi: {m.produksi_asi}</div>
                                </td>
                                <td className="py-3.5 px-4 text-slate-600 text-xs">
                                  {m.masalah_menyusui || 'Tidak ada'}
                                </td>
                                <td className="py-3.5 px-4 text-xs font-medium">
                                  {m.konseling_asi ? (
                                    <span className="text-emerald-600">✓ Diberikan Edukasi</span>
                                  ) : (
                                    <span className="text-slate-400">-</span>
                                  )}
                                </td>
                                <td className="py-3.5 px-4 text-right">
                                  <div className="flex items-center justify-end gap-1.5">
                                    <button
                                      onClick={() => openEditMenyusui(m)}
                                      className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
                                      title="Edit Pemantauan Menyusui"
                                    >
                                      <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteMenyusui(m.id)}
                                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                                      title="Hapus Pemantauan Menyusui"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
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
          </div>
        )}

        {/* ======================================================== */}
        {/* MODAL 1: FORM PENGUKURAN BALITA LENGKAP                 */}
        {/* ======================================================== */}
        {showChildMeasureModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 p-6 space-y-6">
              <div className="flex items-center justify-between border-b pb-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-800">
                    {editingChildMeasureId ? 'Edit Catatan Pengukuran Balita' : 'Catat Pengukuran Balita'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Sesuai instrumen antropometri lengkap Kemenkes</p>
                </div>
                <button
                  onClick={() => setShowChildMeasureModal(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {childMeasureError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {childMeasureError}
                </div>
              )}

              <form onSubmit={handleChildMeasureSubmit} className="space-y-4 text-sm">
                {/* Searchable Balita Picker */}
                <SearchableSelect
                  label="Pilih Balita Sasaran"
                  placeholder="Ketik nama balita, NIK, atau nama ibu..."
                  value={childMeasureForm.id_anak}
                  onChange={(val) => setChildMeasureForm({ ...childMeasureForm, id_anak: val })}
                  options={childOptions}
                  required
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Tanggal Pengukuran *</label>
                    <input
                      type="date"
                      required
                      value={childMeasureForm.tanggal_ukur}
                      onChange={(e) => setChildMeasureForm({ ...childMeasureForm, tanggal_ukur: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Berat Badan (kg) *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={childMeasureForm.berat_kg}
                      onChange={(e) => setChildMeasureForm({ ...childMeasureForm, berat_kg: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl"
                      placeholder="Contoh: 10.25"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Panjang / Tinggi (cm) *</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={childMeasureForm.tinggi_cm}
                      onChange={(e) => setChildMeasureForm({ ...childMeasureForm, tinggi_cm: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl"
                      placeholder="Contoh: 82.5"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Cara Ukur Tinggi *</label>
                    <select
                      value={childMeasureForm.cara_ukur}
                      onChange={(e) => setChildMeasureForm({ ...childMeasureForm, cara_ukur: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl"
                    >
                      <option value="telentang">Telentang (&lt; 2 tahun)</option>
                      <option value="berdiri">Berdiri (&ge; 2 tahun)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-medium mb-1">LiLA (cm)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={childMeasureForm.lila_cm}
                      onChange={(e) => setChildMeasureForm({ ...childMeasureForm, lila_cm: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl"
                      placeholder="14.5"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Lingkar Kepala (cm)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={childMeasureForm.lingkar_kepala_cm}
                      onChange={(e) => setChildMeasureForm({ ...childMeasureForm, lingkar_kepala_cm: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl"
                      placeholder="46.5"
                    />
                  </div>
                </div>

                {/* Status Kenaikan Berat Badan (T/N) Field with clear explanation */}
                <div>
                  <label className="block text-slate-700 font-medium mb-1">
                    Status Kenaikan Berat Badan (T/N)
                  </label>
                  <select
                    value={childMeasureForm.naik_berat_badan}
                    onChange={(e) => setChildMeasureForm({ ...childMeasureForm, naik_berat_badan: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl text-sm bg-white"
                  >
                    <option value="">Otomatis (Sistem menghitung dari riwayat penimbangan bulan lalu)</option>
                    <option value="N">N - Naik (Berat badan naik sesuai target KBM / Kenaikan Minimal)</option>
                    <option value="T">T - Tidak Naik (Berat badan tetap, turun, atau kenaikan di bawah KBM)</option>
                    <option value="B">B - Baru (Balita baru pertama kali ditimbang di Posyandu)</option>
                  </select>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Catatan: Jika dikosongkan, sistem SIGIZI otomatis membandingkan dengan penimbangan bulan sebelumnya.
                  </p>
                </div>

                {/* Program & Indikator Tambahan */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={childMeasureForm.pitting_edema_bilateral}
                      onChange={(e) => setChildMeasureForm({ ...childMeasureForm, pitting_edema_bilateral: e.target.checked })}
                      className="rounded"
                    />
                    Pitting Edema Bilateral
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={childMeasureForm.kelas_balita}
                      onChange={(e) => setChildMeasureForm({ ...childMeasureForm, kelas_balita: e.target.checked })}
                      className="rounded"
                    />
                    Ikut Kelas Balita
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={childMeasureForm.menerima_mbg}
                      onChange={(e) => setChildMeasureForm({ ...childMeasureForm, menerima_mbg: e.target.checked })}
                      className="rounded"
                    />
                    Menerima MBG
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={childMeasureForm.vitamin_a}
                      onChange={(e) => setChildMeasureForm({ ...childMeasureForm, vitamin_a: e.target.checked })}
                      className="rounded"
                    />
                    Diberikan Vitamin A
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t">
                  <button
                    type="button"
                    onClick={() => setShowChildMeasureModal(false)}
                    className="px-4 py-2 border rounded-xl text-slate-600 hover:bg-slate-50"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={childMeasureSubmitting}
                    className="px-5 py-2 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 disabled:opacity-50"
                  >
                    {childMeasureSubmitting
                      ? 'Menyimpan...'
                      : editingChildMeasureId
                      ? 'Perbarui Pengukuran'
                      : 'Simpan Pengukuran Balita'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* MODAL 2: FORM ANC IBU HAMIL LENGKAP                      */}
        {/* ======================================================== */}
        {showAncModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 p-6 space-y-6">
              <div className="flex items-center justify-between border-b pb-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-800">
                    {editingAncId ? 'Edit Pemeriksaan ANC Ibu Hamil' : 'Catat Pemeriksaan ANC Ibu Hamil'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Sesuai instrumen ANC terpadu Kemenkes</p>
                </div>
                <button onClick={() => setShowAncModal(false)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {ancError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {ancError}
                </div>
              )}

              <form onSubmit={handleAncSubmit} className="space-y-4 text-sm">
                {/* Searchable Bumil Picker */}
                <SearchableSelect
                  label="Pilih Ibu Hamil Sasaran"
                  placeholder="Ketik nama ibu hamil, NIK, atau nama suami..."
                  value={ancForm.id_bumil}
                  onChange={(val) => setAncForm({ ...ancForm, id_bumil: val })}
                  options={bumilOptions}
                  required
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Tgl Periksa *</label>
                    <input
                      type="date"
                      required
                      value={ancForm.tanggal_periksa}
                      onChange={(e) => setAncForm({ ...ancForm, tanggal_periksa: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Usia Kehamilan (Minggu) *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={ancForm.usia_kehamilan_minggu}
                      onChange={(e) => setAncForm({ ...ancForm, usia_kehamilan_minggu: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Tekanan Darah *</label>
                    <input
                      type="text"
                      required
                      value={ancForm.tekanan_darah}
                      onChange={(e) => setAncForm({ ...ancForm, tekanan_darah: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl"
                      placeholder="120/80"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Berat Badan (kg) *</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={ancForm.berat_kg}
                      onChange={(e) => setAncForm({ ...ancForm, berat_kg: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Tinggi Badan (cm)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={ancForm.tinggi_cm}
                      onChange={(e) => setAncForm({ ...ancForm, tinggi_cm: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-medium mb-1">LiLA (cm) *</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={ancForm.lila_cm}
                      onChange={(e) => setAncForm({ ...ancForm, lila_cm: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl"
                      placeholder="24.5"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-medium mb-1">TFU (cm)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={ancForm.tfu_cm}
                      onChange={(e) => setAncForm({ ...ancForm, tfu_cm: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl"
                      placeholder="20"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-medium mb-1">DJJ (dpm)</label>
                    <input
                      type="number"
                      value={ancForm.djj}
                      onChange={(e) => setAncForm({ ...ancForm, djj: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl"
                      placeholder="140"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Kadar Hb (g/dL)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={ancForm.lab_hb}
                      onChange={(e) => setAncForm({ ...ancForm, lab_hb: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Protein Urine</label>
                    <select
                      value={ancForm.lab_protein_urine}
                      onChange={(e) => setAncForm({ ...ancForm, lab_protein_urine: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl"
                    >
                      <option value="Negatif (-)">Negatif (-)</option>
                      <option value="Positif 1 (+1)">Positif 1 (+1)</option>
                      <option value="Positif 2 (+2)">Positif 2 (+2)</option>
                      <option value="Positif 3 (+3)">Positif 3 (+3)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Presentasi Janin</label>
                    <select
                      value={ancForm.presentasi_janin}
                      onChange={(e) => setAncForm({ ...ancForm, presentasi_janin: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl"
                    >
                      <option value="Kepala">Kepala</option>
                      <option value="Sungsang">Sungsang</option>
                      <option value="Lintang">Lintang</option>
                      <option value="Belum Teraba">Belum Teraba</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Keluhan / Catatan Medis</label>
                  <input
                    type="text"
                    value={ancForm.keluhan}
                    onChange={(e) => setAncForm({ ...ancForm, keluhan: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                    placeholder="Mual di pagi hari, pusing, dll"
                  />
                </div>

                <div className="flex items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={ancForm.usg}
                      onChange={(e) => setAncForm({ ...ancForm, usg: e.target.checked })}
                      className="rounded"
                    />
                    Pemeriksaan USG
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={ancForm.menerima_mbg}
                      onChange={(e) => setAncForm({ ...ancForm, menerima_mbg: e.target.checked })}
                      className="rounded"
                    />
                    Menerima MBG
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={ancForm.konseling}
                      onChange={(e) => setAncForm({ ...ancForm, konseling: e.target.checked })}
                      className="rounded"
                    />
                    Konseling Gizi/KIA
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t">
                  <button
                    type="button"
                    onClick={() => setShowAncModal(false)}
                    className="px-4 py-2 border rounded-xl text-slate-600 hover:bg-slate-50"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={ancSubmitting}
                    className="px-5 py-2 bg-rose-600 text-white rounded-xl font-medium hover:bg-rose-700 disabled:opacity-50"
                  >
                    {ancSubmitting ? 'Menyimpan...' : editingAncId ? 'Perbarui ANC' : 'Simpan Pemeriksaan ANC'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* MODAL 3: FORM KUNJUNGAN NIFAS LENGKAP                    */}
        {/* ======================================================== */}
        {showNifasModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 p-6 space-y-6">
              <div className="flex items-center justify-between border-b pb-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-800">
                    {editingNifasId ? 'Edit Kunjungan Nifas (KF)' : 'Catat Kunjungan Nifas (KF1–KF4)'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Sesuai instrumen pelayanan masa nifas Kemenkes</p>
                </div>
                <button onClick={() => setShowNifasModal(false)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {nifasError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {nifasError}
                </div>
              )}

              <form onSubmit={handleNifasSubmit} className="space-y-4 text-sm">
                {/* Searchable Bumil Picker */}
                <SearchableSelect
                  label="Pilih Ibu Sasaran Nifas"
                  placeholder="Ketik nama ibu nifas, NIK, atau nama suami..."
                  value={nifasForm.id_bumil}
                  onChange={(val) => setNifasForm({ ...nifasForm, id_bumil: val })}
                  options={bumilOptions}
                  required
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Tanggal Melahirkan *</label>
                    <input
                      type="date"
                      required
                      value={nifasForm.tanggal_melahirkan}
                      onChange={(e) => setNifasForm({ ...nifasForm, tanggal_melahirkan: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Tanggal Kunjungan Nifas *</label>
                    <input
                      type="date"
                      required
                      value={nifasForm.tanggal_kunjungan}
                      onChange={(e) => setNifasForm({ ...nifasForm, tanggal_kunjungan: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Tekanan Darah *</label>
                    <input
                      type="text"
                      required
                      value={nifasForm.tekanan_darah}
                      onChange={(e) => setNifasForm({ ...nifasForm, tekanan_darah: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl"
                      placeholder="120/80"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Suhu Tubuh</label>
                    <input
                      type="text"
                      value={nifasForm.suhu_tubuh}
                      onChange={(e) => setNifasForm({ ...nifasForm, suhu_tubuh: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl"
                      placeholder="36.5 C"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Kondisi Payudara</label>
                    <select
                      value={nifasForm.kondisi_payudara}
                      onChange={(e) => setNifasForm({ ...nifasForm, kondisi_payudara: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl"
                    >
                      <option value="Normal">Normal</option>
                      <option value="Bengkak">Bengkak</option>
                      <option value="Puting Lecet">Puting Lecet</option>
                      <option value="Mastitis">Mastitis</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Kontraksi Uterus</label>
                    <select
                      value={nifasForm.kontraksi_uterus}
                      onChange={(e) => setNifasForm({ ...nifasForm, kontraksi_uterus: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl"
                    >
                      <option value="Baik">Baik (Keras)</option>
                      <option value="Lembek">Lembek</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Warna Lokhia</label>
                    <select
                      value={nifasForm.warna_lokhia}
                      onChange={(e) => setNifasForm({ ...nifasForm, warna_lokhia: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl"
                    >
                      <option value="Merah">Merah (Rubra)</option>
                      <option value="Kecokelatan">Kecokelatan (Sanguinolenta)</option>
                      <option value="Kuning">Kuning (Serosa)</option>
                      <option value="Putih">Putih (Alba)</option>
                    </select>
                  </div>
                </div>

                <div className="bg-red-50/50 p-4 rounded-xl border border-red-200">
                  <div className="text-xs font-bold text-red-800 mb-2 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-red-600" />
                    Skrining Tanda Bahaya Nifas
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                      <input
                        type="checkbox"
                        checked={nifasForm.perdarahan_masif}
                        onChange={(e) => setNifasForm({ ...nifasForm, perdarahan_masif: e.target.checked })}
                        className="rounded text-red-600"
                      />
                      Perdarahan Masif
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                      <input
                        type="checkbox"
                        checked={nifasForm.kejang}
                        onChange={(e) => setNifasForm({ ...nifasForm, kejang: e.target.checked })}
                        className="rounded text-red-600"
                      />
                      Kejang
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                      <input
                        type="checkbox"
                        checked={nifasForm.syok}
                        onChange={(e) => setNifasForm({ ...nifasForm, syok: e.target.checked })}
                        className="rounded text-red-600"
                      />
                      Tanda Syok / Pingsan
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t">
                  <button
                    type="button"
                    onClick={() => setShowNifasModal(false)}
                    className="px-4 py-2 border rounded-xl text-slate-600 hover:bg-slate-50"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={nifasSubmitting}
                    className="px-5 py-2 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 disabled:opacity-50"
                  >
                    {nifasSubmitting ? 'Menyimpan...' : editingNifasId ? 'Perbarui Kunjungan' : 'Simpan Kunjungan Nifas'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* MODAL 4: FORM PEMANTAUAN MENYUSUI LENGKAP                */}
        {/* ======================================================== */}
        {showMenyusuiModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 p-6 space-y-6">
              <div className="flex items-center justify-between border-b pb-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-800">
                    {editingMenyusuiId ? 'Edit Pemantauan Menyusui' : 'Catat Pemantauan Menyusui (ASI)'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Pemantauan produksi ASI dan keluhan laktasi</p>
                </div>
                <button onClick={() => setShowMenyusuiModal(false)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {menyusuiError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {menyusuiError}
                </div>
              )}

              <form onSubmit={handleMenyusuiSubmit} className="space-y-4 text-sm">
                {/* Searchable Bumil Picker */}
                <SearchableSelect
                  label="Pilih Ibu Sasaran Menyusui"
                  placeholder="Ketik nama ibu menyusui, NIK, atau nama suami..."
                  value={menyusuiForm.id_bumil}
                  onChange={(val) => setMenyusuiForm({ ...menyusuiForm, id_bumil: val })}
                  options={bumilOptions}
                  required
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Tanggal Pemantauan *</label>
                    <input
                      type="date"
                      required
                      value={menyusuiForm.tanggal_pemantauan}
                      onChange={(e) => setMenyusuiForm({ ...menyusuiForm, tanggal_pemantauan: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Produksi ASI</label>
                    <select
                      value={menyusuiForm.produksi_asi}
                      onChange={(e) => setMenyusuiForm({ ...menyusuiForm, produksi_asi: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl"
                    >
                      <option value="Banyak">Banyak / Melimpah</option>
                      <option value="Sedikit">Sedikit / Kurang</option>
                      <option value="Tidak Ada">Tidak Ada</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Masalah / Keluhan Menyusui</label>
                  <input
                    type="text"
                    value={menyusuiForm.masalah_menyusui}
                    onChange={(e) => setMenyusuiForm({ ...menyusuiForm, masalah_menyusui: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                    placeholder="Puting lecet / bingung puting / dll"
                  />
                </div>

                <div className="flex items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={menyusuiForm.asi_eksklusif}
                      onChange={(e) => setMenyusuiForm({ ...menyusuiForm, asi_eksklusif: e.target.checked })}
                      className="rounded"
                    />
                    ASI Eksklusif
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={menyusuiForm.konseling_asi}
                      onChange={(e) => setMenyusuiForm({ ...menyusuiForm, konseling_asi: e.target.checked })}
                      className="rounded"
                    />
                    Diberikan Konseling
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t">
                  <button
                    type="button"
                    onClick={() => setShowMenyusuiModal(false)}
                    className="px-4 py-2 border rounded-xl text-slate-600 hover:bg-slate-50"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={menyusuiSubmitting}
                    className="px-5 py-2 bg-amber-600 text-white rounded-xl font-medium hover:bg-amber-700 disabled:opacity-50"
                  >
                    {menyusuiSubmitting ? 'Menyimpan...' : editingMenyusuiId ? 'Perbarui Pemantauan' : 'Simpan Pemantauan ASI'}
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
