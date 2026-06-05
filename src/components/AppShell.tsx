'use client';
import { motion } from 'motion/react';
import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { MobileNav } from './MobileNav';
import { AIBadge } from './AIBadge';
import { ContextSidebar } from './ContextSidebar';
import { QuickAddModal } from './QuickAddModal';
import { TaskCreateModal } from './TaskCreateModal';
import { useAppStore } from '../store/useAppStore';
import { hasOrganization } from '../lib/organization';

const AUTH_ROUTES = ['/', '/login', '/register', '/onboarding'];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { status } = useSession();
  const isAuth =
    pathname === '/' ||
    AUTH_ROUTES.some((r) => r !== '/' && pathname.startsWith(r));
  const initProjects = useAppStore((s) => s.initProjects);

  useEffect(() => { initProjects(); }, [initProjects]);

  useEffect(() => {
    if (isAuth || status !== 'authenticated') return;
    if (!hasOrganization() && !pathname.startsWith('/onboarding')) {
      router.replace('/onboarding');
    }
  }, [isAuth, status, pathname, router]);

  if (isAuth) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col h-[100dvh] overflow-hidden bg-proji-bg">
      <Topbar />
      <motion.div className="flex flex-1 overflow-hidden pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0">
        <Sidebar />
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-proji-bg min-w-0">
          {children}
        </main>
      </motion.div>
      <MobileNav />
      {pathname !== '/chat' && <AIBadge />}
      <ContextSidebar />
      <QuickAddModal />
      <TaskCreateModal />
    </div>
  );
}
