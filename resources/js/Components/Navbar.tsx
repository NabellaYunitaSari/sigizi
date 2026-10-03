import React from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import { LogOut, HeartPulse, User, ShieldCheck } from 'lucide-react';

export interface UserSession {
  id: string;
  nama: string;
  username: string;
  no_hp?: string | null;
  role: 'kader' | 'koordinator' | 'admin';
  id_pos: string | null;
  nama_pos?: string;
}

interface NavbarProps {
  user?: UserSession | null;
}

export default function Navbar({ user: propUser }: NavbarProps) {
  const page = usePage();
  const pageUser = (page.props as any).auth?.user as UserSession | null;
  const user = propUser || pageUser;

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    router.post('/logout');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 lg:px-8 py-3 transition-all shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <Link href={user ? (user.role === 'kader' ? '/dashboard' : '/dashboard-desa') : '/'} className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-teal-400 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
            <HeartPulse className="w-6 h-6" />
          </div>
          <div>
            <div className="font-bold text-slate-900 tracking-tight text-lg flex items-center gap-1.5">
              SIGIZI <span className="text-brand-600">Desa</span>
            </div>
          </div>
        </Link>

        {/* Right User Info */}
        {user ? (
          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex flex-col items-end text-right">
              <span className="text-sm font-semibold text-slate-800 flex items-center gap-1">
                {user.nama}
                {user.role === 'admin' && <ShieldCheck className="w-4 h-4 text-emerald-600 inline" />}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {user.role === 'kader' ? `Kader Pos ${user.nama_pos || ''}` : user.role === 'koordinator' ? 'Koordinator Desa' : 'Administrator'}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="inline-flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors text-sm font-medium border border-slate-200 min-h-[44px] min-w-[44px]"
              title="Keluar"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-medium text-sm transition-all shadow-sm shadow-brand-600/30 flex items-center space-x-2 min-h-[44px]"
          >
            <User className="w-4 h-4" />
            <span>Masuk Kader</span>
          </Link>
        )}
      </div>
    </header>
  );
}
