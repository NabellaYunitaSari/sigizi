import React, { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import {
  Phone,
  Lock,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Send,
} from 'lucide-react';

export default function LupaPassword() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [noHp, setNoHp] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  // Step 1: Request OTP code via WhatsApp
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ action: 'request_otp', no_hp: noHp }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal mengirim kode verifikasi WhatsApp');

      setInfoMessage(`Pesan WhatsApp berisi Kode OTP telah terkirim secara otomatis ke nomor WA ${data.no_hp}! Silakan cek aplikasi WhatsApp Anda.`);
      
      setOtpCode('');
      setNewPassword('');
      setConfirmPassword('');

      setStep(2);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP code & Reset password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Konfirmasi kata sandi tidak cocok');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          action: 'reset_password',
          no_hp: noHp,
          otp: otpCode,
          new_password: newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal mereset kata sandi');

      setStep(3);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 py-8 relative">
      <Link
        href="/login"
        className="absolute top-6 left-6 text-xs font-semibold text-slate-500 hover:text-brand-600 flex items-center space-x-1 min-h-[44px] min-w-[44px] px-2 rounded-xl hover:bg-slate-100 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Kembali ke Halaman Login</span>
      </Link>

      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/80 shadow-xl p-6 sm:p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white mx-auto shadow-lg shadow-emerald-500/20">
            <MessageSquare className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Verifikasi WhatsApp</h1>
          <p className="text-xs text-slate-500">Pengiriman Otomatis Kode OTP Lupa Password</p>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: Enter Phone Number */}
        {step === 1 && (
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Masukkan Nomor WA Terdaftar *</label>
              <div className="relative">
                <Phone className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  value={noHp}
                  onChange={(e) => setNoHp(e.target.value)}
                  placeholder="Contoh: 085853485521"
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none min-h-[48px] bg-slate-50/50"
                />
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">Nomor WhatsApp aktif yang terdaftar di akun Anda</span>
            </div>

            <button
              type="submit"
              disabled={loading || !noHp}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-2xl text-sm transition-all shadow-md shadow-emerald-600/20 min-h-[48px] disabled:opacity-60 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <span>Mengirim via WhatsApp Gateway...</span>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Kirim Kode OTP Otomatis ke WA</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 2: Input OTP & New Password */}
        {step === 2 && (
          <form onSubmit={handleResetPassword} className="space-y-4" autoComplete="off">
            <div className="bg-emerald-50 border border-emerald-200/80 p-4 rounded-2xl text-xs text-emerald-800 leading-relaxed font-medium">
              {infoMessage}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Masukkan Kode OTP (6 Digit) dari WhatsApp *</label>
              <input
                type="text"
                required
                maxLength={6}
                autoComplete="off"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="Masukkan 6 digit kode OTP"
                className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 text-xl font-mono font-bold tracking-widest text-center focus:ring-2 focus:ring-emerald-500 focus:outline-none min-h-[50px] bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Kata Sandi Baru *</label>
              <div className="relative">
                <Lock className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none min-h-[48px] bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Ulangi Kata Sandi Baru *</label>
              <div className="relative">
                <Lock className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi kata sandi baru"
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none min-h-[48px] bg-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-2xl text-sm transition-all shadow-md shadow-emerald-600/20 min-h-[48px] disabled:opacity-60 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <span>Memperbarui Kata Sandi...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Simpan Kata Sandi Baru</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 3: SUCCESS STATE */}
        {step === 3 && (
          <div className="py-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-bold text-slate-900">Kata Sandi Berhasil Diperbarui!</h2>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Silakan masuk kembali dengan nomor WhatsApp <span className="font-semibold text-slate-700">{noHp}</span> dan kata sandi baru Anda.
              </p>
            </div>

            <button
              onClick={() => router.visit('/login')}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-2xl text-sm transition-all shadow-md shadow-emerald-600/20 min-h-[48px]"
            >
              Masuk Sekarang
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
