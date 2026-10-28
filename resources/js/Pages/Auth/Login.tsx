import React, { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import { HeartPulse, ArrowRight, ArrowLeft, AlertCircle, Eye, EyeOff, Sprout, Check } from 'lucide-react';

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
    <div className="grid min-h-screen bg-[#f7f7f0] lg:grid-cols-2">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-brand-900 p-12 text-white lg:flex xl:p-16">
        <Link href="/" className="inline-flex w-fit items-center gap-3"><HeartPulse className="h-8 w-8 text-brand-200" strokeWidth={1.5} /><span className="text-2xl font-bold tracking-[-0.06em]">sigizi<span className="text-[#dfb67c]">.</span></span></Link>
        <div className="relative z-10 max-w-lg py-16">
          <span className="mb-8 inline-flex items-center gap-2 rounded-full border border-brand-600 px-3 py-2 text-xs text-brand-200"><Sprout className="h-4 w-4" />Ruang kerja kader posyandu</span>
          <h1 className="editorial-title text-5xl leading-[1.15] xl:text-6xl">Pendataan terintegrasi,<br /><span className="text-[#c7d7ac]">pelayanan lebih terarah.</span></h1>
          <p className="mt-7 max-w-sm text-base leading-8 text-brand-200">Sistem pencatatan pelayanan posyandu untuk mendukung pemantauan gizi balita dan kesehatan ibu hamil di Desa Sukomalo.</p>
          <div className="mt-10 flex flex-col gap-4 border-t border-brand-700 pt-7 text-sm text-brand-100">{['Riwayat pelayanan dalam satu tempat', 'Pencatatan yang mudah dari ponsel', 'Rekap lebih rapi, pendampingan lebih dekat'].map(text => <p key={text} className="flex items-center gap-3"><Check className="h-4 w-4 text-[#d9bd81]" />{text}</p>)}</div>
        </div>
        <p className="relative z-10 text-xs text-brand-300">SIGIZI · Posyandu Desa Sukomalo</p>
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full border-[65px] border-brand-800" />
      </aside>
      <main className="flex flex-col px-6 py-7 sm:px-12 lg:px-16">
        <Link href="/" className="inline-flex min-h-[44px] w-fit items-center gap-2 text-sm text-slate-500 hover:text-brand-800"><ArrowLeft className="h-4 w-4" />Kembali ke beranda</Link>
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-12">
          <div className="mb-9">
            <span className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-800 text-white lg:hidden"><HeartPulse className="h-7 w-7" /></span>
            <p className="eyebrow mb-3">Selamat datang kembali</p>
            <h2 className="editorial-title text-4xl text-brand-900">Masuk ke SIGIZI</h2>
            <p className="mt-4 text-sm leading-6 text-slate-500">Masuk menggunakan akun yang sudah terdaftar.</p>
          </div>
          {error && <div role="alert" className="mb-5 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-sm leading-relaxed text-rose-700"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /><span>{error}</span></div>}
          <form onSubmit={handleLogin} className="space-y-5">
            <div><label htmlFor="username" className="mb-2 block text-sm font-medium text-slate-700">Nomor HP atau username</label><input id="username" name="username" autoComplete="username" autoCapitalize="none" spellCheck={false} type="text" required value={username} onChange={e => setUsername(e.target.value)} placeholder="Masukkan nomor HP atau username" className="auth-input" /></div>
            <div>
              <div className="mb-2 flex items-center justify-between gap-2"><label htmlFor="password" className="text-sm font-medium text-slate-700">Kata sandi</label><Link href="/lupa-password" className="py-1 text-xs font-semibold text-brand-700 hover:underline">Lupa kata sandi?</Link></div>
              <div className="relative"><input id="password" name="password" autoComplete="current-password" type={showPassword ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)} placeholder="Masukkan kata sandi" className="auth-input pr-14" /><button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'} aria-pressed={showPassword} className="absolute right-1 top-1 flex h-11 w-11 items-center justify-center rounded-lg text-slate-400 hover:text-brand-700">{showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button></div>
            </div>
            <button type="submit" disabled={loading} className="primary-action w-full">{loading ? 'Sedang masuk…' : 'Masuk ke akun'}{!loading && <ArrowRight className="h-4 w-4" />}</button>
          </form>
          <p className="mt-5 text-center text-xs leading-6 text-slate-500">Belum memiliki akun? Hubungi koordinator desa<br />untuk mendapatkan akses SIGIZI.</p>
          <details className="mt-8 border-t border-slate-200 pt-4">
            <summary className="cursor-pointer py-2 text-xs font-medium text-slate-500">Coba dengan akun demo</summary>
            <div className="mt-3 grid grid-cols-3 gap-2">{[
              { label: 'Kader', phone: '081200000003', password: 'kader123' },
              { label: 'Koordinator', phone: '081200000002', password: 'koordinator123' },
              { label: 'Admin', phone: '081200000001', password: 'admin123' },
            ].map(account => <button type="button" key={account.label} onClick={() => { quickFill(account.phone, account.password); document.getElementById('username')?.focus(); }} className="min-h-[44px] rounded-lg border border-slate-200 bg-white px-2 py-3 text-xs font-medium text-slate-600 hover:border-brand-300 hover:bg-brand-50">{account.label}</button>)}</div>
          </details>
        </div>
        <p className="text-center text-[11px] text-slate-400">SIGIZI - Posyandu Desa Sukomalo</p>
      </main>
    </div>
  );
}
