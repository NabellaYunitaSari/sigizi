import React, { useState } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import AppShell from '../../Components/AppShell';
import {
  ArrowLeft,
  CheckCircle2,
  Heart,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { classifyBumilStatus, getStatusBadgeColor } from '../../lib/statusGizi';
import { UserSession } from '../../Components/Navbar';

interface BumilInputProps {
  bumil: any;
}

export default function Input({ bumil }: BumilInputProps) {
  const page = usePage();
  const user = (page.props as any).auth?.user as UserSession | null;

  const [tanggalPeriksa, setTanggalPeriksa] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [usiaKehamilan, setUsiaKehamilan] = useState(() => {
    if (!bumil || !bumil.hpht) return '16';
    const hphtDate = new Date(bumil.hpht);
    const now = new Date();
    const diffWeeks = Math.max(1, Math.floor((now.getTime() - hphtDate.getTime()) / (1000 * 60 * 60 * 24 * 7)));
    return diffWeeks.toString();
  });
  const [beratKg, setBeratKg] = useState('');
  const [tinggiCm, setTinggiCm] = useState('156');
  const [lilaCm, setLilaCm] = useState('');
  const [tekananDarah, setTekananDarah] = useState('120/80');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!bumil) return null;

  const currentStatusKek = lilaCm ? classifyBumilStatus(parseFloat(lilaCm)) : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const res = await fetch(`/api/ibu-hamil/${bumil.id}/pengukuran`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          tanggal_periksa: tanggalPeriksa,
          usia_kehamilan_minggu: usiaKehamilan,
          berat_kg: beratKg,
          tinggi_cm: tinggiCm,
          lila_cm: lilaCm,
          tekanan_darah: tekananDarah,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menyimpan data pemeriksaan');

      router.visit(`/ibu-hamil/${bumil.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppShell user={user}>
      <div className="max-w-2xl mx-auto space-y-6">
        <Link
          href={`/ibu-hamil/${bumil.id}`}
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-rose-600 min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Detail {bumil.nama}</span>
        </Link>

        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <div className="flex items-center space-x-2 text-xs font-semibold text-rose-600 uppercase tracking-wider mb-0.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Pemeriksaan Kesehatan Ibu Hamil</span>
            </div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              {bumil.nama}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Posyandu {bumil.posyandu?.nama_pos}
            </p>
          </div>

          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Tanggal Periksa *</label>
                <input
                  type="date"
                  required
                  value={tanggalPeriksa}
                  onChange={(e) => setTanggalPeriksa(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none min-h-[48px]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Usia Kehamilan (Minggu) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  max="44"
                  value={usiaKehamilan}
                  onChange={(e) => setUsiaKehamilan(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none min-h-[48px]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Berat Badan (kg) *</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={beratKg}
                  onChange={(e) => setBeratKg(e.target.value)}
                  placeholder="Contoh: 62.5"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none min-h-[48px]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Tinggi Badan (cm) *</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={tinggiCm}
                  onChange={(e) => setTinggiCm(e.target.value)}
                  placeholder="Contoh: 156.0"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none min-h-[48px]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Lingkar Lengan Atas / LiLA (cm) *</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={lilaCm}
                  onChange={(e) => setLilaCm(e.target.value)}
                  placeholder="Contoh: 24.0"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none min-h-[48px]"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">&lt; 23.5 cm terdeteksi KEK (Kekurangan Energi Kronis)</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Tekanan Darah (mmHg) *</label>
                <input
                  type="text"
                  required
                  value={tekananDarah}
                  onChange={(e) => setTekananDarah(e.target.value)}
                  placeholder="Contoh: 120/80"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none min-h-[48px]"
                />
              </div>
            </div>

            {/* Live KEK Preview Banner */}
            {currentStatusKek && (
              <div className={`p-4 rounded-2xl border flex items-center justify-between ${getStatusBadgeColor(currentStatusKek).bg} ${getStatusBadgeColor(currentStatusKek).border}`}>
                <div>
                  <span className="text-xs text-slate-600 block">Klasifikasi Status KEK Ibu Hamil:</span>
                  <div className={`text-lg font-black ${getStatusBadgeColor(currentStatusKek).text}`}>
                    {currentStatusKek === 'KEK' ? 'Bumil KEK (Risiko Kurang Energi Kronis)' : 'Status Gizi Normal'}
                  </div>
                </div>
                <Heart className={`w-8 h-8 ${currentStatusKek === 'KEK' ? 'text-rose-600' : 'text-emerald-600'}`} />
              </div>
            )}

            <div className="pt-4 flex items-center justify-end space-x-2">
              <Link
                href={`/ibu-hamil/${bumil.id}`}
                className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-2xl min-h-[48px] flex items-center"
              >
                Batal
              </Link>

              <button
                type="submit"
                disabled={submitting}
                className="px-7 py-3 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm rounded-2xl shadow-md shadow-rose-600/20 min-h-[48px] flex items-center space-x-2 disabled:opacity-60"
              >
                {submitting ? (
                  <span>Menyimpan...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Simpan Pemeriksaan</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AppShell>
  );
}
