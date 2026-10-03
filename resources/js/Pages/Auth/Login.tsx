import React, { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import { HeartPulse, Lock, Phone, LogIn, ArrowLeft, AlertCircle, Sparkles, KeyRound, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.message || 'Login gagal');
      }

      const role = data.user.role;
      if (role === 'admin' || role === 'koordinator') {
        router.visit('/dashboard-desa');
      } else {
        router.visit('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat masuk');
    } finally {
      setLoading(false);
    }
  };

  const quickFill = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 py-8 relative">
      <Link
        href="/"
        className="absolute top-6 left-6 text-xs font-semibold text-slate-500 hover:text-brand-600 flex items-center space-x-1 min-h-[44px] min-w-[44px] px-2 rounded-xl hover:bg-slate-100 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Kembali ke Beranda</span>
      </Link>

      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-200/50 p-6 sm:p-8 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-teal-400 flex items-center justify-center text-white mx-auto shadow-lg shadow-brand-500/20">
            <HeartPulse className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Masuk Sistem SIGIZI</h1>
          <p className="text-xs text-slate-500">Pencatatan Posyandu Desa Sukomalo</p>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3.5 rounded-2xl text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Nomor HP / Username *</label>
            <div className="relative">
              <Phone className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Contoh: 081200000003"
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm bg-slate-50/50 min-h-[44px]"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700">Kata Sandi *</label>
              <Link href="/lupa-password" className="text-xs font-semibold text-brand-600 hover:underline flex items-center gap-1">
                <KeyRound className="w-3.5 h-3.5" />
                <span>Lupa Password?</span>
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-11 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm bg-slate-50/50 min-h-[44px]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none p-1 rounded-lg"
                title={showPassword ? 'Sembunyikan Kata Sandi' : 'Tampilkan Kata Sandi'}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl text-sm transition-all shadow-md shadow-brand-600/20 flex items-center justify-center space-x-2 min-h-[48px] disabled:opacity-60"
          >
            {loading ? (
              <span>Memproses...</span>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Masuk Sekarang</span>
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Accounts */}
        <div className="pt-4 border-t border-slate-100 space-y-2.5">
          <div className="flex items-center space-x-1 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-brand-600" />
            <span>Uji Coba Cepat via No HP (Demo)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => quickFill('081200000003', 'kader123')}
              className="p-2.5 rounded-xl border border-slate-200 hover:border-brand-500 bg-slate-50 hover:bg-brand-50/50 text-left transition-all text-xs min-h-[44px]"
            >
              <div className="font-bold text-slate-800">Kader Anggrek</div>
              <div className="text-[10px] text-slate-500">081200000003</div>
            </button>

            <button
              type="button"
              onClick={() => quickFill('081200000002', 'koordinator123')}
              className="p-2.5 rounded-xl border border-slate-200 hover:border-brand-500 bg-slate-50 hover:bg-brand-50/50 text-left transition-all text-xs min-h-[44px]"
            >
              <div className="font-bold text-slate-800">Koordinator</div>
              <div className="text-[10px] text-slate-500">081200000002</div>
            </button>

            <button
              type="button"
              onClick={() => quickFill('081200000001', 'admin123')}
              className="p-2.5 rounded-xl border border-slate-200 hover:border-brand-500 bg-slate-50 hover:bg-brand-50/50 text-left transition-all text-xs min-h-[44px]"
            >
              <div className="font-bold text-slate-800">Admin Utama</div>
              <div className="text-[10px] text-slate-500">081200000001</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
