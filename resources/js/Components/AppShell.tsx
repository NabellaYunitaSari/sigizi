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
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar user={user} />
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar user={user} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 md:pb-8 max-w-full overflow-hidden">
          {children}
        </main>
      </div>
      <BottomNav user={user} />
    </div>
  );
}
