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
  const pathname = page.url;

  if (!user) return null;

  const isKoordinatorOrAdmin = user.role === 'koordinator' || user.role === 'admin';

  const navItems = [
    {
      label: isKoordinatorOrAdmin ? 'Desa' : 'Home',
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
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-2 py-1.5 shadow-lg">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/dashboard' && item.href !== '/dashboard-desa' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
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
    </div>
  );
}
