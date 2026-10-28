import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import { LayoutDashboard, Baby, Heart, FileSpreadsheet, Users, Sliders, Database, Scale, Syringe, Pill, MapPin } from 'lucide-react';
import type { UserSession } from './Navbar';

interface SidebarProps {
  user?: UserSession | null;
  mobile?: boolean;
  onNavigate?: () => void;
}

export default function Sidebar({ user: propUser, mobile = false, onNavigate }: SidebarProps) {
  const page = usePage();
  const user = propUser || (page.props as any).auth?.user as UserSession | null;
  const pathname = page.url.split('?')[0];
  if (!user) return null;

  const canManage = user.role === 'koordinator' || user.role === 'admin';
  const groups = [
    { label: 'Ringkasan', items: [
      { label: 'Dashboard', href: canManage ? '/dashboard-desa' : '/dashboard', icon: LayoutDashboard },
    ] },
    { label: 'Pelayanan', items: [
      { label: 'Data balita', href: '/anak', icon: Baby },
      { label: 'Data ibu hamil', href: '/ibu-hamil', icon: Heart },
      { label: 'Pengukuran', href: '/pengukuran', icon: Scale },
      { label: 'Imunisasi', href: '/imunisasi', icon: Syringe },
      { label: 'Vitamin', href: '/vitamin', icon: Pill },
      { label: 'Laporan & rekap', href: '/laporan', icon: FileSpreadsheet },
    ] },
    ...(canManage ? [{ label: 'Pengelolaan', items: [
      { label: 'Master data', href: '/master-data', icon: Database },
      { label: 'Standar layanan', href: '/kelola-standar', icon: Sliders },
      { label: 'Akun pengguna', href: '/kelola-user', icon: Users },
    ] }] : []),
  ];

  return (
    <aside className={mobile ? 'flex flex-col gap-6 p-5' : 'app-sidebar hidden md:flex w-60 xl:w-64 shrink-0 flex-col gap-7 border-r border-slate-200 px-5 py-7'}>
      <div className="flex items-start gap-3 rounded-xl border border-brand-100 bg-brand-50/70 p-3.5">
        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-700" />
        <div><p className="text-sm font-semibold text-brand-900">{user.role === 'kader' ? `Posyandu ${user.nama_pos || 'Saya'}` : 'Desa Sukomalo'}</p><p className="mt-1 text-xs leading-relaxed text-brand-700">{user.role === 'kader' ? 'Ruang kerja kader posyandu' : 'Pemantauan layanan posyandu'}</p></div>
      </div>
      <nav aria-label={mobile ? 'Menu seluler' : 'Menu utama'} className="flex-1 space-y-6">
        {groups.map(group => <div key={group.label}>
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">{group.label}</p>
          <div className="space-y-1">{group.items.map(item => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            return <Link key={item.href} href={item.href} onClick={onNavigate} aria-current={active ? 'page' : undefined} className={`group flex min-h-[44px] items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] transition-colors ${active ? 'bg-brand-800 font-semibold text-white' : 'font-medium text-slate-600 hover:bg-brand-50 hover:text-brand-900'}`}><Icon className={`h-[18px] w-[18px] shrink-0 ${active ? 'text-brand-200' : 'text-slate-400 group-hover:text-brand-700'}`} strokeWidth={1.7} /><span>{item.label}</span>{active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-brand-200" />}</Link>;
          })}</div>
        </div>)}
      </nav>
    </aside>
  );
}
