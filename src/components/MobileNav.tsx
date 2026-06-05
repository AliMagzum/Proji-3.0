'use client';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutGrid, Folder, CheckCircle2, Users, MessageSquare } from 'lucide-react';
import { useI18n } from '../context/I18nContext';

export function MobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useI18n();

  const items = [
    { icon: MessageSquare, labelKey: 'nav.chat', href: '/chat' },
    { icon: Folder, labelKey: 'nav.projects', href: '/projects' },
    { icon: CheckCircle2, labelKey: 'nav.tasks', href: '/tasks' },
    { icon: Users, labelKey: 'nav.team', href: '/team' },
    { icon: LayoutGrid, labelKey: 'nav.domains', href: '/domains' },
  ] as const;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[100] bg-white/95 backdrop-blur-md border-t border-slate-200 flex items-stretch justify-around px-1 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
      {items.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <button
            key={item.href}
            type="button"
            onClick={() => router.push(item.href)}
            className={`flex flex-1 flex-col items-center justify-center gap-1 min-h-[44px] px-1 rounded-xl transition-colors ${
              active ? 'text-proji-primary' : 'text-slate-400 active:text-slate-600'
            }`}
          >
            <item.icon size={20} strokeWidth={active ? 2.25 : 2} />
            <span className="text-[10px] font-bold leading-none max-w-full truncate">
              {t(item.labelKey)}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
