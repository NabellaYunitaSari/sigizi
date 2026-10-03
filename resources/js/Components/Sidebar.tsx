import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
  LayoutDashboard,
  Baby,
  Heart,
  FileSpreadsheet,
  Users,
  Building2,
  ChevronRight,
  Syringe,
  Pill,
  Scale,
} from 'lucide-react';
import { UserSession } from './Navbar';

interface SidebarProps {
  user?: UserSession | null;
}

export default function Sidebar({ user: propUser }: SidebarProps) {
  const page = usePage();
  const pageUser = (page.props as any).auth?.user as UserSession | null;
  const user = propUser || pageUser;
  const pathname = page.url;

  if (!user) return null;

  const isKader = user.role === 'kader';
  const isKoordinatorOrAdmin = user.role === 'koordinator' || user.role === 'admin';

  const navItems = [
    ...(isKader
      ? [
          {
            label: 'Dashboard Posyandu',
            href: '/dashboard',
            icon: LayoutDashboard,
          },
        ]
      : []),
    ...(isKoordinatorOrAdmin
      ? [
          {
            label: 'Dashboard Desa',
            href: '/dashboard-desa',
            icon: Building2,
          },
          {
            label: 'Posyandu Saya',
            href: '/dashboard',
            icon: LayoutDashboard,
          },
        ]
      : []),
    {
      label: 'Data Anak Balita',
      href: '/anak',
      icon: Baby,
    },
    {
      label: 'Data Ibu Hamil',
      href: '/ibu-hamil',
      icon: Heart,
    },
    {
      label: 'Pengukuran Balita',
      href: '/pengukuran',
      icon: Scale,
    },
    {
      label: 'Imunisasi Balita',
      href: '/imunisasi',
      icon: Syringe,
    },
    {
      label: 'Vitamin Balita',
      href: '/vitamin',
      icon: Pill,
    },
    {
      label: 'Laporan & Rekap',
      href: '/laporan',
      icon: FileSpreadsheet,
    },
    ...(isKoordinatorOrAdmin
      ? [
          {
            label: 'Kelola Akun Kader',
            href: '/kelola-user',
            icon: Users,
          },
        ]
      : []),
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200/80 shrink-0 min-h-[calc(100vh-65px)] p-4 space-y-6">
      {/* Posyandu Badge Info */}
      <div className="bg-gradient-to-br from-brand-50 to-teal-50/50 p-3.5 rounded-2xl border border-brand-100/80">
        <div className="font-bold text-slate-800 text-sm">
          {user.role === 'kader' ? `Pos ${user.nama_pos || ''}` : '6 Posyandu Aktif'}
        </div>
        <div className="text-xs text-slate-500 mt-0.5">
          {user.role === 'kader' ? 'Petugas Input Pengukuran' : 'Monitoring & Evaluasi'}
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="space-y-1.5 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/dashboard' && item.href !== '/dashboard-desa' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3.5 py-3 rounded-xl font-medium text-sm transition-all min-h-[44px] ${
                isActive
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20'
                  : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </div>
              {isActive && <ChevronRight className="w-4 h-4 text-brand-200" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="pt-4 border-t border-slate-100 text-xs text-slate-400 text-center">
        SIGIZI Desa v1.0 • Standar Kemenkes RI
      </div>
    </aside>
  );
}
