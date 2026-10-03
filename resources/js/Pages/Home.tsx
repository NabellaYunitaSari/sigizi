import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
  HeartPulse,
  Baby,
  Heart,
  BarChart3,
  ArrowRight,
  MapPin,
  CheckCircle2,
  Users,
} from 'lucide-react';
import { UserSession } from '../Components/Navbar';

export default function Home() {
  const page = usePage();
  const user = (page.props as any).auth?.user as UserSession | null;

  const posyanduList = [
    { nama: 'Anggrek', dusun: 'Dusun Krajan' },
    { nama: 'Bougenfil', dusun: 'Dusun Sukomaju' },
    { nama: 'Dahlia', dusun: 'Dusun Karanganyar' },
    { nama: 'Lily', dusun: 'Dusun Wonosari' },
    { nama: 'Mawar', dusun: 'Dusun Sukahening' },
    { nama: 'Melati', dusun: 'Dusun Sumberrejo' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-teal-50/30 text-slate-800 flex flex-col">
      {/* Header Bar */}
      <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-md border-b border-slate-200/70 px-4 lg:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-teal-400 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
              <HeartPulse className="w-6 h-6" />
            </div>
            <div>
              <span className="font-bold text-slate-900 text-lg tracking-tight">
                SIGIZI <span className="text-brand-600">Desa</span>
              </span>
              <p className="text-xs text-slate-500 font-medium hidden sm:block">Sistem Informasi Posyandu Desa Sukomalo</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {user ? (
              <Link
                href={user.role === 'kader' ? '/dashboard' : '/dashboard-desa'}
                className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-medium text-sm rounded-2xl transition-all shadow-md shadow-brand-600/20 flex items-center space-x-2 min-h-[44px]"
              >
                <span>Buka Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <Link
                href="/login"
                className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-medium text-sm rounded-2xl transition-all shadow-md shadow-brand-600/20 flex items-center space-x-2 min-h-[44px]"
              >
                <span>Masuk Sistem</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-4 pt-12 pb-16 lg:pt-20 lg:pb-24 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight sm:leading-none">
            Digitalisasi Pencatatan Gizi & Posyandu <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-600 to-teal-500">Desa Sukomalo</span>
          </h1>

          <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Sistem terpadu kader posyandu untuk mencatat antropometri balita, memantau stunting, dan mendeteksi KEK ibu hamil secara otomatis berdasarkan standar Kemenkes RI.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href={user ? '/dashboard' : '/login'}
              className="w-full sm:w-auto px-7 py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-base rounded-2xl transition-all shadow-lg shadow-brand-600/30 flex items-center justify-center space-x-2 min-h-[50px]"
            >
              <span>{user ? 'Lanjut ke Dashboard' : 'Mulai Pencatatan Kader'}</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            
            <a
              href="#posyandu-list"
              className="w-full sm:w-auto px-6 py-3.5 bg-white hover:bg-slate-100/80 text-slate-700 border border-slate-200 font-semibold text-base rounded-2xl transition-all flex items-center justify-center space-x-2 min-h-[50px]"
            >
              <MapPin className="w-5 h-5 text-brand-600" />
              <span>Lihat 6 Posyandu</span>
            </a>
          </div>

          {/* Quick Badges */}
          <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
              <div className="text-brand-600 font-extrabold text-2xl">6 Pos</div>
              <div className="text-slate-500 text-xs font-medium">Anggrek, Bougenfil, Dahlia, Lily, Mawar, Melati</div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
              <div className="text-brand-600 font-extrabold text-2xl">Z-Score</div>
              <div className="text-slate-500 text-xs font-medium">Kalkulasi Otomatis BB/U, TB/U, BB/TB</div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
              <div className="text-brand-600 font-extrabold text-2xl">LiLA & KEK</div>
              <div className="text-slate-500 text-xs font-medium">Deteksi Dini Risiko Ibu Hamil KEK</div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
              <div className="text-brand-600 font-extrabold text-2xl">PDF & Excel</div>
              <div className="text-slate-500 text-xs font-medium">Export Laporan Bulanan Sekali Klik</div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="px-4 py-12 bg-white border-y border-slate-200/70">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Fitur Utama SIGIZI Desa</h2>
            <p className="text-slate-600 text-sm sm:text-base mt-2">
              Dirancang khusus untuk kemudahan kader di lapangan dan transparansi koordinator desa
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80 space-y-4 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
                <Baby className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg">Input Pengukuran Balita Wizard</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Form bertahap yang praktis digunakan dari HP. Sistem langsung menghitung umur bulan dan menampilkan status gizi dengan indikator warna yang besar & jelas.
              </p>
              <ul className="text-xs text-slate-500 space-y-1.5 pt-2">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Deteksi Stunting (Sangat Pendek / Pendek)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Deteksi Wasting & Risiko Obesitas</span>
                </li>
              </ul>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80 space-y-4 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                <Heart className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg">Pemantauan Ibu Hamil (KEK)</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Pencatatan usia kehamilan, berat badan, tekanan darah, serta lingkar lengan atas (LiLA). Peringatan otomatis jika LiLA di bawah 23.5 cm.
              </p>
              <ul className="text-xs text-slate-500 space-y-1.5 pt-2">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Kategori Risiko Kurang Energi Kronis</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Riwayat Pemeriksaan Berkala</span>
                </li>
              </ul>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80 space-y-4 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg">Dashboard Visual Desa</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Grafik perbandingan cakupan antar 6 posyandu dan tren pertumbuhan bulanan untuk kebutuhan evaluasi bidan desa & koordinator.
              </p>
              <ul className="text-xs text-slate-500 space-y-1.5 pt-2">
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Horizontal Bar Chart 6 Posyandu</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Monitoring Hasil Pre/Post Test Pelatihan Kader</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Posyandu List Section */}
      <section id="posyandu-list" className="px-4 py-16 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold mb-2">
            <Users className="w-3.5 h-3.5" />
            <span>Wilayah Desa Sukomalo</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">6 Posyandu Terintegrasi</h2>
          <p className="text-slate-600 text-sm mt-1">Setiap pos didampingi oleh kader yang mencatat pertumbuhan anak dan kesehatan ibu hamil</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {posyanduList.map((pos, idx) => (
            <div key={pos.nama} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-teal-600 text-white font-bold flex items-center justify-center text-lg shadow-sm">
                0{idx + 1}
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-base">Posyandu {pos.nama}</h4>
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {pos.dusun}, Sukomalo
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6 px-4 text-center text-xs text-slate-500 space-y-1">
        <p className="font-semibold text-slate-700">SIGIZI Desa Sukomalo</p>
        <p className="text-slate-400 text-[11px]">Sistem Informasi Pencatatan Gizi & Monitoring Posyandu</p>
      </footer>
    </div>
  );
}
