import React, { useState } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import AppShell from '../../Components/AppShell';
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Scale,
  Ruler,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { calculateAgeInMonths, classifyNutritionStatus, getStatusBadgeColor } from '../../lib/statusGizi';
import { UserSession } from '../../Components/Navbar';

interface InputProps {
  child: any;
  nextChildId: string | null;
}

export default function Input({ child, nextChildId }: InputProps) {
  const page = usePage();
  const user = (page.props as any).auth?.user as UserSession | null;

  // Wizard Step: 1 = Berat, 2 = Tinggi, 3 = Preview & Confirm, 4 = Success
  const [step, setStep] = useState(1);

  const [tanggalUkur, setTanggalUkur] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [beratKg, setBeratKg] = useState('');
  const [tinggiCm, setTinggiCm] = useState('');
  const [caraUkur, setCaraUkur] = useState<'berdiri' | 'telentang'>(() => {
    if (!child) return 'telentang';
    const ageM = calculateAgeInMonths(child.tanggal_lahir, new Date());
    return ageM >= 24 ? 'berdiri' : 'telentang';
  });
  const [lilaCm, setLilaCm] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!child) return null;

  const ageMonths = calculateAgeInMonths(child.tanggal_lahir, tanggalUkur);
  const nutResult =
    beratKg && tinggiCm
      ? classifyNutritionStatus(parseFloat(beratKg), parseFloat(tinggiCm), ageMonths, child.jenis_kelamin)
      : null;

  const handleSave = async () => {
    setError('');
    setSubmitting(true);

    try {
      const res = await fetch(`/api/anak/${child.id}/pengukuran`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          tanggal_ukur: tanggalUkur,
          berat_kg: beratKg,
          tinggi_cm: tinggiCm,
          cara_ukur: caraUkur,
          lila_cm: lilaCm || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menyimpan pengukuran');

      setStep(4); // Success step
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppShell user={user}>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Back Link */}
        <Link
          href={`/anak/${child.id}`}
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-brand-600 min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Detail {child.nama_anak}</span>
        </Link>

        {/* Wizard Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl p-6 sm:p-8 space-y-6">
          {/* Header Info */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                {child.nama_anak}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Umur: <span className="font-bold text-slate-700">{ageMonths} Bulan</span> • {child.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
              </p>
            </div>

            {/* Step Counter Badge */}
            {step < 4 && (
              <div className="text-right">
                <span className="text-xs font-bold text-slate-400">Langkah</span>
                <div className="text-xl font-black text-brand-600">0{step} <span className="text-xs font-medium text-slate-400">/ 03</span></div>
              </div>
            )}
          </div>

          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: BERAT BADAN & TANGGAL */}
          {step === 1 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="space-y-1">
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <Scale className="w-5 h-5 text-brand-600" />
                  <span>Input Berat Badan Balita</span>
                </h3>
                <p className="text-xs text-slate-500">Masukkan tanggal ukur dan hasil timbangan dalam kilogram (kg)</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Tanggal Penimbangan *</label>
                <input
                  type="date"
                  value={tanggalUkur}
                  onChange={(e) => setTanggalUkur(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none min-h-[48px]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Berat Badan (kg) *</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.05"
                    required
                    autoFocus
                    value={beratKg}
                    onChange={(e) => setBeratKg(e.target.value)}
                    placeholder="Contoh: 9.8"
                    className="w-full pl-4 pr-16 py-4 text-2xl font-bold text-slate-900 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:outline-none min-h-[56px] bg-slate-50/50"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-base">KG</span>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  disabled={!beratKg || parseFloat(beratKg) <= 0}
                  onClick={() => setStep(2)}
                  className="px-6 py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm rounded-2xl transition-all shadow-md shadow-brand-600/20 flex items-center space-x-2 min-h-[48px] disabled:opacity-50"
                >
                  <span>Lanjut: Tinggi Badan</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: TINGGI BADAN & CARA UKUR */}
          {step === 2 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="space-y-1">
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <Ruler className="w-5 h-5 text-teal-600" />
                  <span>Input Tinggi / Panjang Badan</span>
                </h3>
                <p className="text-xs text-slate-500">Masukkan tinggi badan dalam centimeter (cm) dan metode pengukuran</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Tinggi / Panjang Badan (cm) *</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    required
                    autoFocus
                    value={tinggiCm}
                    onChange={(e) => setTinggiCm(e.target.value)}
                    placeholder="Contoh: 76.5"
                    className="w-full pl-4 pr-16 py-4 text-2xl font-bold text-slate-900 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:outline-none min-h-[56px] bg-slate-50/50"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-base">CM</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Cara Ukur *</label>
                  <select
                    value={caraUkur}
                    onChange={(e) => setCaraUkur(e.target.value as any)}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none min-h-[48px] bg-white"
                  >
                    <option value="telentang">Telentang (&lt; 24 Bulan)</option>
                    <option value="berdiri">Berdiri (&ge; 24 Bulan)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Lingkar Lengan LiLA (cm, Opsional)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={lilaCm}
                    onChange={(e) => setLilaCm(e.target.value)}
                    placeholder="Contoh: 14.5"
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none min-h-[48px]"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-5 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-2xl transition-colors flex items-center space-x-1 min-h-[48px]"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Kembali</span>
                </button>

                <button
                  type="button"
                  disabled={!tinggiCm || parseFloat(tinggiCm) <= 0}
                  onClick={() => setStep(3)}
                  className="px-6 py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm rounded-2xl transition-all shadow-md shadow-brand-600/20 flex items-center space-x-2 min-h-[48px] disabled:opacity-50"
                >
                  <span>Preview Status Gizi</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: PREVIEW HASIL KALKULASI OTOMATIS & CONFIRM */}
          {step === 3 && nutResult && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="space-y-1">
                <h3 className="font-bold text-slate-900 text-base">Preview & Pratinjau Status Gizi</h3>
                <p className="text-xs text-slate-500">Sistem otomatis menghitung status gizi Kemenkes/WHO</p>
              </div>

              {/* Big Nutrition Badges Display */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* TB/U Badge */}
                <div className={`p-5 rounded-2xl border space-y-1 text-center ${getStatusBadgeColor(nutResult.status_tbu).bg} ${getStatusBadgeColor(nutResult.status_tbu).border}`}>
                  <span className="text-xs font-semibold text-slate-600 block">Indikator Stunting (TB/U)</span>
                  <div className={`text-2xl font-black ${getStatusBadgeColor(nutResult.status_tbu).text}`}>
                    {nutResult.status_tbu}
                  </div>
                  <span className="text-[11px] text-slate-500 block">Tinggi {tinggiCm} cm pada umur {ageMonths} bln</span>
                </div>

                {/* BB/U Badge */}
                <div className={`p-5 rounded-2xl border space-y-1 text-center ${getStatusBadgeColor(nutResult.status_bbu).bg} ${getStatusBadgeColor(nutResult.status_bbu).border}`}>
                  <span className="text-xs font-semibold text-slate-600 block">Status Berat (BB/U)</span>
                  <div className={`text-2xl font-black ${getStatusBadgeColor(nutResult.status_bbu).text}`}>
                    {nutResult.status_bbu}
                  </div>
                  <span className="text-[11px] text-slate-500 block">Berat {beratKg} kg</span>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/70 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Kategori BB/TB (Wasting):</span>
                  <span className="font-bold text-slate-800">{nutResult.status_bbtb}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Cara Pengukuran:</span>
                  <span className="font-semibold text-slate-800 capitalize">{caraUkur}</span>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-5 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-2xl transition-colors flex items-center space-x-1 min-h-[48px]"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Ubah Data</span>
                </button>

                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleSave}
                  className="flex-1 py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm rounded-2xl transition-all shadow-lg shadow-brand-600/30 flex items-center justify-center space-x-2 min-h-[48px] disabled:opacity-60"
                >
                  {submitting ? (
                    <span>Menyimpan...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      <span>Simpan Hasil Pengukuran</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: SUCCESS & NEXT ACTIONS */}
          {step === 4 && (
            <div className="py-8 text-center space-y-6 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-1">
                <h2 className="text-2xl font-extrabold text-slate-900">Pengukuran Berhasil Disimpan!</h2>
                <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto">
                  Data penimbangan {child.nama_anak} telah diperbarui di database Posyandu {child.posyandu?.nama_pos}.
                </p>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                {nextChildId && (
                  <Link
                    href={`/anak/${nextChildId}/input`}
                    onClick={() => {
                      setStep(1);
                      setBeratKg('');
                      setTinggiCm('');
                    }}
                    className="w-full sm:w-auto px-6 py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm rounded-2xl transition-all shadow-md shadow-brand-600/20 flex items-center justify-center space-x-2 min-h-[48px]"
                  >
                    <span>Lanjut ke Anak Berikutnya</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}

                <Link
                  href={`/anak/${child.id}`}
                  className="w-full sm:w-auto px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-2xl transition-colors flex items-center justify-center min-h-[48px]"
                >
                  Lihat Detail & Grafik Anak
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
