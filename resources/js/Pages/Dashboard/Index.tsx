import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import AppShell from '../../Components/AppShell';
import {
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Baby,
  Calendar,
  Sparkles,
  Users,
  BarChart3,
  Syringe,
  Heart,
  X,
  ChevronRight,
  Info,
  Clock,
  Utensils,
  Phone,
  ShieldAlert,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { getStatusBadgeColor } from '../../lib/statusGizi';
import { UserSession } from '../../Components/Navbar';

interface DashboardProps {
  childrenInPos: any[];
  totalAnak: number;
  countMeasured: number;
  progressPercent: number;
  unmeasuredThisMonthList: any[];
  genderCompositionData?: {
    name: string;
    value: number;
    percentage: number;
    color: string;
  }[];
  growthStatusChartData?: {
    name: string;
    fullName: string;
    count: number;
    children: any[];
    color: string;
  }[];
  immunizationChartData?: {
    name: string;
    sudah: number;
    belum: number;
    percentage: number;
    total: number;
  }[];
  trimesterChartData?: {
    name: string;
    desc: string;
    count: number;
    color: string;
  }[];
  totalBumil?: number;
  currentMonthName: string;
  pmtAnakList?: any[];
  pmtBumilList?: any[];
}

export default function Dashboard({
  totalAnak = 0,
  countMeasured = 0,
  progressPercent = 0,
  unmeasuredThisMonthList = [],
  genderCompositionData = [],
  growthStatusChartData = [],
  immunizationChartData = [],
  trimesterChartData = [],
  totalBumil = 0,
  currentMonthName = '',
  pmtAnakList = [],
  pmtBumilList = [],
}: DashboardProps) {
  const page = usePage();
  const user = (page.props as any).auth?.user as UserSession | null;

  // Modal State for Growth Status Click
  const [selectedCategory, setSelectedCategory] = useState<{
    fullName: string;
    children: any[];
  } | null>(null);

  // Tab State for PMT Section at the bottom
  const [activePmtTab, setActivePmtTab] = useState<'anak' | 'bumil'>('anak');

  // Tooltips
  const GenderTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900/90 backdrop-blur-md text-white px-3.5 py-2 rounded-xl text-xs shadow-xl border border-slate-700/50 space-y-0.5">
          <div className="font-bold flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: data.color }} />
            <span>{data.name}</span>
          </div>
          <div>Jumlah: <span className="font-bold text-slate-100">{data.value} Anak</span></div>
          <div>Persentase: <span className="font-bold text-brand-300">{data.percentage}%</span></div>
        </div>
      );
    }
    return null;
  };

  const GrowthTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900/90 backdrop-blur-md text-white px-3.5 py-2 rounded-xl text-xs shadow-xl border border-slate-700/50 space-y-0.5">
          <div className="font-bold text-amber-300">{data.fullName}</div>
          <div>Jumlah Balita: <span className="font-bold text-white text-sm">{data.count} Anak</span></div>
          <div className="text-[10px] text-slate-300 italic pt-0.5">Klik bar untuk melihat daftar anak</div>
        </div>
      );
    }
    return null;
  };

  const ImmunizationTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900/90 backdrop-blur-md text-white px-3.5 py-2.5 rounded-xl text-xs shadow-xl border border-slate-700/50 space-y-1">
          <div className="font-bold text-teal-300 text-sm">{data.name}</div>
          <div className="grid grid-cols-2 gap-x-3 text-[11px]">
            <span>Sudah Menerima:</span>
            <span className="font-bold text-emerald-400 text-right">{data.sudah} anak</span>
            <span>Belum Menerima:</span>
            <span className="font-bold text-rose-400 text-right">{data.belum} anak</span>
            <span>Cakupan:</span>
            <span className="font-bold text-teal-300 text-right">{data.percentage}%</span>
          </div>
        </div>
      );
    }
    return null;
  };

  const TrimesterTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900/90 backdrop-blur-md text-white px-3.5 py-2 rounded-xl text-xs shadow-xl border border-slate-700/50 space-y-0.5">
          <div className="font-bold text-pink-300 text-sm">{data.name}</div>
          <div className="text-[10px] text-slate-300">{data.desc}</div>
          <div>Jumlah Ibu Hamil: <span className="font-bold text-white text-sm">{data.count} Bumil</span></div>
        </div>
      );
    }
    return null;
  };

  // Greeting
  const kaderName = user?.nama ? user.nama.split(',')[0].replace(/^(Kader|Bu|Bpk\.)\s*/i, '') : 'Kader';

  return (
    <AppShell user={user}>
      <div className="space-y-6">
        {/* Header Title */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Ringkasan pelayanan hari ini khusus Posyandu {user?.nama_pos || 'Aktif'}
          </p>
        </div>

        {/* Welcome Banner Banner Box (matching mockup) */}
        <div className="bg-gradient-to-r from-blue-50/90 via-sky-50/70 to-indigo-50/50 p-5 rounded-2xl border border-blue-100 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <span>Selamat datang, Bu {kaderName}</span>
              <span className="animate-bounce inline-block">👋</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              <span className="font-bold text-slate-800">{countMeasured} balita</span> dan <span className="font-bold text-slate-800">{totalBumil} ibu hamil</span> terdaftar pelayanan periode {currentMonthName}.
            </p>
          </div>

          <div className="px-4 py-2 bg-white/90 backdrop-blur-sm rounded-xl border border-blue-200/80 shadow-sm text-xs text-slate-700 font-semibold flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
            <Clock className="w-4 h-4 text-brand-600" />
            <div>
              <div className="text-[10px] text-slate-400 font-normal uppercase">Pelayanan Hari Ini</div>
              <div className="font-bold text-slate-800">08.00 - 12.00 WIB</div>
            </div>
          </div>
        </div>

        {/* Top 4 KPI Cards (Matching mockup style) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Balita Terdaftar */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Baby className="w-5 h-5" />
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Aktif</span>
              </span>
            </div>
            <div>
              <div className="text-3xl font-black text-slate-900">{totalAnak}</div>
              <div className="text-xs font-semibold text-slate-600 mt-0.5">Balita Terdaftar</div>
              <div className="text-[11px] text-slate-400 mt-1">Posyandu {user?.nama_pos || ''}</div>
            </div>
          </div>

          {/* Card 2: Ibu Hamil Terdaftar */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                <Heart className="w-5 h-5" />
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Aktif</span>
              </span>
            </div>
            <div>
              <div className="text-3xl font-black text-slate-900">{totalBumil}</div>
              <div className="text-xs font-semibold text-slate-600 mt-0.5">Ibu Hamil Terdaftar</div>
              <div className="text-[11px] text-slate-400 mt-1">Tersebar Trimester I - III</div>
            </div>
          </div>

          {/* Card 3: Balita Diukur */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Aktif</span>
              </span>
            </div>
            <div>
              <div className="text-3xl font-black text-slate-900">{countMeasured}</div>
              <div className="text-xs font-semibold text-slate-600 mt-0.5">Balita Diukur Bulan Ini</div>
              <div className="text-[11px] text-emerald-600 font-bold mt-1">{progressPercent}% dari terdaftar</div>
            </div>
          </div>

          {/* Card 4: Ibu Hamil Dipantau */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Aktif</span>
              </span>
            </div>
            <div>
              <div className="text-3xl font-black text-slate-900">{totalBumil}</div>
              <div className="text-xs font-semibold text-slate-600 mt-0.5">Ibu Hamil Dipantau</div>
              <div className="text-[11px] text-slate-400 mt-1">Status Gizi & KEK</div>
            </div>
          </div>
        </div>

        {/* ========================================== */}
        {/* BARIS 1 VISUALISASI: KOMPOSISI & STATUS    */}
        {/* ========================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* CHART 1: Komposisi Balita (Donut Chart matching mockup) */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <Users className="w-5 h-5 text-brand-600" />
                  <span>Komposisi Balita</span>
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Berdasarkan jenis kelamin • {totalAnak} balita
              </p>
            </div>

            {totalAnak > 0 ? (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 my-2">
                {/* Donut Graphic */}
                <div className="w-44 h-44 relative shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={genderCompositionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {genderCompositionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<GenderTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>

                  {/* Center Text inside Donut */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-2xl font-black text-slate-900">{totalAnak}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Balita</span>
                  </div>
                </div>

                {/* Legend Details */}
                <div className="space-y-3.5 w-full sm:w-auto">
                  {genderCompositionData.map((g) => (
                    <div key={g.name} className="flex items-center justify-between sm:justify-start gap-4">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: g.color }} />
                        <span className="text-xs font-bold text-slate-700">{g.name}</span>
                      </div>
                      <div className="text-right text-xs">
                        <span className="font-extrabold text-slate-900">{g.value}</span>
                        <span className="font-medium text-slate-400 ml-1.5">({g.percentage}%)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-44 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-slate-200 rounded-2xl">
                <Users className="w-8 h-8 text-slate-300 mb-2" />
                <p className="text-sm font-semibold text-slate-600">Belum ada data balita</p>
              </div>
            )}
          </div>

          {/* CHART 2: Status Pertumbuhan Balita (Bar Chart + Clickable Bars) */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-emerald-600" />
                  <span>Status Pertumbuhan Balita</span>
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  <span>Klik Bar untuk List</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Interpretasi pengukuran terakhir (Klik bar grafik untuk detail nama balita)
              </p>
            </div>

            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={growthStatusChartData}
                  margin={{ top: 15, right: 10, left: -20, bottom: 25 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }}
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                  />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip content={<GrowthTooltip />} />
                  <Bar
                    dataKey="count"
                    radius={[6, 6, 0, 0]}
                    className="cursor-pointer transition-opacity hover:opacity-80"
                    label={{ position: 'top', fill: '#334155', fontSize: 11, fontWeight: 'bold' }}
                    onClick={(data) => {
                      if (data && data.fullName) {
                        setSelectedCategory({
                          fullName: data.fullName,
                          children: data.children || [],
                        });
                      }
                    }}
                  >
                    {growthStatusChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* ========================================== */}
        {/* BARIS 2 VISUALISASI: IMUNISASI & TRIMESTER */}
        {/* ========================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* CHART 3: Cakupan Imunisasi Balita (Horizontal Bar Chart matching mockup) */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <Syringe className="w-5 h-5 text-teal-600" />
                  <span>Cakupan Imunisasi</span>
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Persentase balita sesuai jadwal imunisasi dasar
              </p>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={immunizationChartData}
                  margin={{ top: 5, right: 35, left: 25, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis
                    type="number"
                    domain={[0, 100]}
                    tickFormatter={(v) => `${v}%`}
                    tick={{ fontSize: 11, fill: '#64748b' }}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 11, fill: '#334155', fontWeight: 600 }}
                    width={90}
                  />
                  <Tooltip content={<ImmunizationTooltip />} />
                  <Bar
                    dataKey="percentage"
                    fill="#0d9488"
                    radius={[0, 6, 6, 0]}
                    barSize={14}
                    label={{ position: 'right', fill: '#0f766e', fontSize: 11, fontWeight: 'bold', formatter: (val: any) => `${val}%` }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* CHART 4: Distribusi Ibu Hamil (Vertical Bar Chart matching mockup) */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <Heart className="w-5 h-5 text-brand-600" />
                  <span>Distribusi Ibu Hamil</span>
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {totalBumil} ibu hamil aktif • per trimester
              </p>
            </div>

            {totalBumil > 0 ? (
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={trimesterChartData}
                    margin={{ top: 15, right: 20, left: -15, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11, fill: '#334155', fontWeight: 700 }}
                    />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                    <Tooltip content={<TrimesterTooltip />} />
                    <Bar
                      dataKey="count"
                      radius={[8, 8, 0, 0]}
                      barSize={42}
                      label={{ position: 'top', fill: '#334155', fontSize: 12, fontWeight: 'bold' }}
                    >
                      {trimesterChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-56 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-slate-200 rounded-2xl">
                <Heart className="w-8 h-8 text-slate-300 mb-2" />
                <p className="text-sm font-semibold text-slate-600">Belum ada data ibu hamil</p>
              </div>
            )}
          </div>
        </div>

        {/* ========================================== */}
        {/* BARIS 3: UNMEASURED CHILDREN LIST          */}
        {/* ========================================== */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4 flex flex-col">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <span>Anak Belum Diukur Bulan Ini</span>
                <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-xs font-bold rounded-full">
                  {unmeasuredThisMonthList.length}
                </span>
              </h3>
              <p className="text-xs text-slate-500">Klik tombol cepat "Input Sekarang" untuk mencatat hasil penimbangan</p>
            </div>
          </div>

          {unmeasuredThisMonthList.length > 0 ? (
            <div className="space-y-2.5 overflow-y-auto max-h-[340px] pr-1">
              {unmeasuredThisMonthList.map((child) => {
                const lastNut = child.pengukuran ? child.pengukuran[0] : null;
                const badgeColor = lastNut ? getStatusBadgeColor(lastNut.status_tbu) : { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200' };

                return (
                  <div
                    key={child.id}
                    className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-slate-50 flex items-center justify-between gap-3 transition-colors"
                  >
                    <div>
                      <div className="font-bold text-slate-800 text-sm">{child.nama_anak}</div>
                      <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                        <span>{child.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</span>
                        <span>•</span>
                        <span>Ibu: {child.nama_ibu}</span>
                      </div>
                      {lastNut && (
                        <div className="mt-1">
                          <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-semibold ${badgeColor.bg} ${badgeColor.text}`}>
                            Bulan lalu: {lastNut.status_tbu}
                          </span>
                        </div>
                      )}
                    </div>

                    <Link
                      href={`/anak/${child.id}/input`}
                      className="px-3 py-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs rounded-xl transition-all shadow-sm flex items-center space-x-1 shrink-0 min-h-[44px]"
                    >
                      <span>Input Sekarang</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border border-dashed border-slate-200 rounded-2xl">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mb-2" />
              <p className="font-bold text-slate-800 text-base">Hebat! Semua Anak Sudah Diukur</p>
              <p className="text-xs text-slate-500 mt-1 max-w-xs">Seluruh balita terdaftar di Pos {user?.nama_pos || ''} telah ditimbang untuk bulan ini.</p>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* BARIS DI BAGIAN PALING BAWAH DASHBOARD: TARGET PMT (BALITA & IBU HAMIL)  */}
        {/* ========================================================================= */}
        <div className="bg-white p-5 rounded-2xl border border-amber-200/80 shadow-sm space-y-4 relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center space-x-2 text-xs font-semibold text-amber-700 uppercase tracking-wider mb-1">
                <Utensils className="w-4 h-4 text-amber-600" />
                <span>Intervensi Gizi & Pemulihan</span>
              </div>
              <h3 className="font-bold text-slate-900 text-lg sm:text-xl flex items-center gap-2">
                <span>Daftar Target PMT (Pemberian Makanan Tambahan)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Balita bermasalah gizi (Stunting/Gizi Kurang) & Ibu Hamil KEK yang memerlukan intervensi PMT
              </p>
            </div>

            {/* Tab Selector */}
            <div className="flex items-center p-1 bg-slate-100 rounded-xl shrink-0">
              <button
                onClick={() => setActivePmtTab('anak')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 min-h-[36px] ${
                  activePmtTab === 'anak'
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Baby className="w-3.5 h-3.5" />
                <span>Balita PMT ({pmtAnakList.length})</span>
              </button>

              <button
                onClick={() => setActivePmtTab('bumil')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 min-h-[36px] ${
                  activePmtTab === 'bumil'
                    ? 'bg-rose-500 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Heart className="w-3.5 h-3.5" />
                <span>Ibu Hamil KEK ({pmtBumilList.length})</span>
              </button>
            </div>
          </div>

          {/* TAB BALITA PMT */}
          {activePmtTab === 'anak' && (
            <div>
              {pmtAnakList.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 space-y-1">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-1" />
                  <p className="text-sm font-bold text-slate-700">Tidak ada balita yang membutuhkan PMT saat ini.</p>
                  <p className="text-xs text-slate-500">Seluruh balita di Posyandu ini berada dalam status gizi baik & normal.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-amber-50/60 text-slate-700 border-b border-amber-100">
                        <th className="p-3 font-bold">Nama Balita</th>
                        <th className="p-3 font-bold">Usia & Antropometri</th>
                        <th className="p-3 font-bold">Indikasi Masalah Gizi</th>
                        <th className="p-3 font-bold">Orang Tua / Kontak</th>
                        <th className="p-3 font-bold">Rekomendasi Intervensi</th>
                        <th className="p-3 font-bold text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {pmtAnakList.map((anak) => (
                        <tr key={anak.id} className="hover:bg-amber-50/20 transition-colors">
                          <td className="p-3">
                            <div className="font-bold text-slate-900">{anak.nama_anak}</div>
                            <div className="text-[10px] text-slate-500">NIK: {anak.nik} ({anak.jenis_kelamin})</div>
                          </td>
                          <td className="p-3">
                            <div className="font-bold text-slate-800">{anak.umur_bulan} bulan</div>
                            <div className="text-[10px] text-slate-500">BB: {anak.berat_kg} kg | TB: {anak.tinggi_cm} cm</div>
                          </td>
                          <td className="p-3">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 font-bold text-[11px] border border-rose-200">
                              <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" />
                              <span>{anak.alasan_pmt}</span>
                            </span>
                          </td>
                          <td className="p-3">
                            <div className="font-medium text-slate-700">Ibu: {anak.nama_ibu}</div>
                            {anak.no_hp_ortu && (
                              <a
                                href={`https://wa.me/${anak.no_hp_ortu.replace(/^0/, '62')}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[11px] font-semibold text-emerald-600 hover:underline flex items-center gap-1 mt-0.5"
                              >
                                <Phone className="w-3 h-3 text-emerald-600" />
                                <span>{anak.no_hp_ortu}</span>
                              </a>
                            )}
                          </td>
                          <td className="p-3 text-[11px] text-slate-600 font-medium">
                            <span className="bg-amber-50 text-amber-900 border border-amber-200 px-2 py-1 rounded-md block">
                              {anak.rekomendasi}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <Link
                              href={`/anak/${anak.id}`}
                              className="px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-semibold text-[11px] inline-flex items-center gap-1 shadow-sm transition-all min-h-[32px]"
                            >
                              <span>Detail</span>
                              <ArrowRight className="w-3 h-3" />
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB IBU HAMIL KEK */}
          {activePmtTab === 'bumil' && (
            <div>
              {pmtBumilList.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 space-y-1">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-1" />
                  <p className="text-sm font-bold text-slate-700">Tidak ada Ibu Hamil KEK yang terdeteksi.</p>
                  <p className="text-xs text-slate-500">Seluruh ibu hamil terdaftar memiliki ukuran LiLA &ge; 23.5 cm.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-rose-50/60 text-slate-700 border-b border-rose-100">
                        <th className="p-3 font-bold">Nama Ibu Hamil</th>
                        <th className="p-3 font-bold">Usia Kehamilan & LiLA</th>
                        <th className="p-3 font-bold">Status Risiko Gizi</th>
                        <th className="p-3 font-bold">Nama Suami</th>
                        <th className="p-3 font-bold">Rekomendasi Intervensi</th>
                        <th className="p-3 font-bold text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {pmtBumilList.map((bumil) => (
                        <tr key={bumil.id} className="hover:bg-rose-50/20 transition-colors">
                          <td className="p-3">
                            <div className="font-bold text-slate-900">{bumil.nama}</div>
                            <div className="text-[10px] text-slate-500">NIK: {bumil.nik}</div>
                          </td>
                          <td className="p-3">
                            <div className="font-bold text-slate-800">{bumil.usia_kehamilan_minggu} Minggu</div>
                            <div className="text-[10px] text-rose-600 font-bold">LiLA: {bumil.lila_cm} cm</div>
                          </td>
                          <td className="p-3">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 font-bold text-[11px] border border-rose-200">
                              <ShieldAlert className="w-3 h-3 text-rose-600 shrink-0" />
                              <span>{bumil.alasan_pmt}</span>
                            </span>
                          </td>
                          <td className="p-3 font-medium text-slate-700">
                            {bumil.nama_suami}
                          </td>
                          <td className="p-3 text-[11px] text-slate-600 font-medium">
                            <span className="bg-rose-50 text-rose-900 border border-rose-200 px-2 py-1 rounded-md block">
                              {bumil.rekomendasi}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <Link
                              href={`/ibu-hamil/${bumil.id}`}
                              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold text-[11px] inline-flex items-center gap-1 shadow-sm transition-all min-h-[32px]"
                            >
                              <span>Detail</span>
                              <ArrowRight className="w-3 h-3" />
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* MODAL DETAILED LIST FOR GROWTH STATUS BAR CLICK */}
      {selectedCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden space-y-4 p-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Detail Status Pertumbuhan</span>
                <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <span>Kategori: {selectedCategory.fullName}</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-brand-100 text-brand-800 text-xs font-bold">
                    {selectedCategory.children.length} Balita
                  </span>
                </h3>
              </div>
              <button
                onClick={() => setSelectedCategory(null)}
                className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-[380px] overflow-y-auto space-y-2.5 pr-1">
              {selectedCategory.children.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-1">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-1" />
                  <p className="font-bold text-slate-700 text-sm">Tidak ada balita pada kategori ini</p>
                  <p className="text-xs text-slate-400">Semua balita di Posyandu ini berada di luar kategori {selectedCategory.fullName}</p>
                </div>
              ) : (
                selectedCategory.children.map((child: any) => (
                  <div key={child.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-slate-100/80 transition-colors flex items-center justify-between gap-3">
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{child.nama_anak}</div>
                      <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                        <span>{child.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</span>
                        <span>•</span>
                        <span>Umur: {child.umur_bulan} bln</span>
                        <span>•</span>
                        <span>Ibu: {child.nama_ibu}</span>
                      </div>
                      <div className="text-[11px] text-slate-600 mt-1 font-medium flex flex-wrap items-center gap-x-3 gap-y-0.5">
                        <span>BB: <strong>{child.berat_kg} kg</strong></span>
                        <span>TB: <strong>{child.tinggi_cm} cm</strong></span>
                        <span>TB/U: <strong className="text-brand-700">{child.status_tbu}</strong></span>
                        <span>BB/U: <strong className="text-brand-700">{child.status_bbu}</strong></span>
                      </div>
                    </div>
                    <Link
                      href={`/anak/${child.id}`}
                      className="px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-all shrink-0 flex items-center gap-1 min-h-[36px]"
                    >
                      <span>Detail</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedCategory(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold text-xs rounded-xl transition-all"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
