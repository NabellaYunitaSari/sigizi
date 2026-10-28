import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
  LayoutDashboard,
  Baby,
  Heart,
  FileSpreadsheet,
  Building2,
} from 'lucide-react';
import { UserSession } from './Navbar';

interface BottomNavProps {
  user?: UserSession | null;
}

export default function BottomNav({ user: propUser }: BottomNavProps) {
  const page = usePage();
  const pageUser = (page.props as any).auth?.user as UserSession | null;
  const user = propUser || pageUser;
  const pathname = page.url.split('?')[0];

  if (!user) return null;

  const isKoordinatorOrAdmin = user.role === 'koordinator' || user.role === 'admin';

  const navItems = [
    {
      label: 'Dashboard',
      href: isKoordinatorOrAdmin ? '/dashboard-desa' : '/dashboard',
      icon: isKoordinatorOrAdmin ? Building2 : LayoutDashboard,
    },
    {
      label: 'Balita',
      href: '/anak',
      icon: Baby,
    },
    {
      label: 'Ibu Hamil',
      href: '/ibu-hamil',
      icon: Heart,
    },
    {
      label: 'Laporan',
      href: '/laporan',
      icon: FileSpreadsheet,
    },
  ];

  return (
    <nav aria-label="Navigasi cepat" className="app-bottom-nav md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#fffefa] border-t border-slate-200 px-2 pt-2 pb-[max(8px,env(safe-area-inset-bottom))]">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/dashboard' && item.href !== '/dashboard-desa' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? 'page' : undefined}
              className={`flex flex-col items-center justify-center min-h-[48px] min-w-[60px] py-1 px-2 rounded-xl transition-all ${
                isActive ? 'text-brand-600 font-bold' : 'text-slate-500 font-medium hover:text-slate-800'
              }`}
            >
              <div className={`p-1 rounded-lg ${isActive ? 'bg-brand-50' : ''}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[11px] leading-tight mt-0.5">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
