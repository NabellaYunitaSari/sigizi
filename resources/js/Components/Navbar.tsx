import React, { useEffect, useRef, useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import { LogOut, HeartPulse, Menu, X } from 'lucide-react';
import Sidebar from './Sidebar';

export interface UserSession {
  id: string;
  nama: string;
  username: string;
  no_hp?: string | null;
  role: 'kader' | 'koordinator' | 'admin';
  id_pos: string | null;
  nama_pos?: string;
}

interface NavbarProps { user?: UserSession | null; }

export default function Navbar({ user: propUser }: NavbarProps) {
  const page = usePage();
  const user = propUser || (page.props as any).auth?.user as UserSession | null;
  const [menuOpen, setMenuOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);

  useEffect(() => { setMenuOpen(false); }, [page.url]);
  useEffect(() => {
    if (menuOpen) {
      dialog.current?.showModal();
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = previousOverflow;
        dialog.current?.close();
        menuButton.current?.focus();
      };
    }
  }, [menuOpen]);

  return <>
    <header className="app-navbar sticky top-0 z-40 border-b border-slate-200 bg-[#fffefa] px-4 md:px-6 lg:px-8">
      <div className="flex h-[76px] items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {user && <button ref={menuButton} type="button" onClick={() => setMenuOpen(true)} aria-label="Buka menu navigasi" aria-expanded={menuOpen} aria-controls="mobile-navigation" className="flex h-11 w-11 items-center justify-center rounded-lg border border-slate-200 text-slate-600 md:hidden"><Menu className="h-5 w-5" /></button>}
          <Link href={user ? (user.role === 'kader' ? '/dashboard' : '/dashboard-desa') : '/'} className="flex items-center gap-2.5" aria-label="SIGIZI, beranda">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-800 text-white"><HeartPulse className="h-6 w-6" strokeWidth={1.6} /></span>
            <span><span className="block text-xl font-bold tracking-[-0.06em] text-brand-900">sigizi<span className="text-[#bd8049]">.</span></span><span className="block text-[10px] tracking-wide text-slate-500">DESA SUKOMALO</span></span>
          </Link>
        </div>
        {user ? <div className="flex items-center gap-3 sm:gap-4">
          <div className="hidden text-right sm:block"><p className="text-sm font-semibold text-slate-800">{user.nama}</p><p className="mt-0.5 text-[11px] text-slate-500">{user.role === 'kader' ? 'Kader posyandu' : user.role === 'koordinator' ? 'Koordinator desa' : 'Administrator'}</p></div>
          <span aria-hidden="true" className="flex h-10 w-10 items-center justify-center rounded-full border border-brand-200 bg-brand-50 text-sm font-semibold text-brand-800">{user.nama.trim().split(/\s+/).slice(0, 2).map(name => name[0]).join('')}</span>
          <button type="button" onClick={() => router.post('/logout')} className="flex h-11 items-center justify-center gap-2 rounded-lg px-3 text-xs font-medium text-slate-500 hover:bg-rose-50 hover:text-rose-700" aria-label="Keluar dari akun" title="Keluar dari akun"><LogOut className="h-4 w-4" /><span className="hidden xl:inline">Keluar</span></button>
        </div> : <Link href="/login" className="inline-flex min-h-[44px] items-center rounded-lg bg-brand-800 px-5 text-sm font-semibold text-white hover:bg-brand-900">Masuk akun</Link>}
      </div>
    </header>
    {menuOpen && <dialog ref={dialog} id="mobile-navigation" aria-labelledby="mobile-menu-title" onCancel={() => setMenuOpen(false)} onClick={event => { if (event.target === event.currentTarget) setMenuOpen(false); }} className="navigation-dialog fixed inset-y-0 left-0 m-0 h-dvh max-h-none w-[min(320px,88vw)] max-w-none overflow-y-auto border-0 bg-[#fffefa] p-0 shadow-xl backdrop:bg-slate-900/40">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4"><h2 id="mobile-menu-title" className="font-semibold text-brand-900">Menu SIGIZI</h2><button autoFocus type="button" onClick={() => setMenuOpen(false)} aria-label="Tutup menu" className="flex h-11 w-11 items-center justify-center rounded-lg text-slate-500 hover:bg-brand-50"><X className="h-5 w-5" /></button></div>
      <Sidebar user={user} mobile onNavigate={() => setMenuOpen(false)} />
    </dialog>}
  </>;
}
