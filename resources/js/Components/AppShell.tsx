import React from 'react';
import { usePage } from '@inertiajs/react';
import Navbar, { UserSession } from './Navbar';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';

interface AppShellProps {
  user?: UserSession | null;
  children: React.ReactNode;
}

export default function AppShell({ user: propUser, children }: AppShellProps) {
  const page = usePage();
  const pageUser = (page.props as any).auth?.user as UserSession | null;
  const user = propUser || pageUser;

  return (
    <div className="app-shell min-h-screen flex flex-col bg-[#f5f5ef]">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-brand-900 focus:px-4 focus:py-3 focus:text-white">Langsung ke konten</a>
      <Navbar user={user} />
      <div className="flex-1 flex w-full mx-auto">
        <Sidebar user={user} />
        <main id="main-content" tabIndex={-1} className="app-content min-w-0 flex-1 px-4 py-6 sm:p-7 lg:p-9 pb-28 md:pb-9 max-w-[1600px] outline-none">
          {children}
        </main>
      </div>
      <BottomNav user={user} />
    </div>
  );
}
