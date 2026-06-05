'use client';
import { useRef, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard, Mail, Folder, Target, Users, FileText, Layout,
  Settings2, Factory, Shield, Briefcase, History, BarChart3,
  RefreshCw, ClipboardCheck, Smile, Workflow, Search, MessageSquare,
  CheckCircle2, Archive, BookOpen, User, RotateCcw, Activity,
  Scale, Sparkles, ChevronDown, ChevronRight, ChevronLeft,
  Settings, Moon, Sun, Monitor, KeyRound, LogOut, Bot, CreditCard, Wallet, Plus,
} from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import { useI18n } from '../context/I18nContext';
import { Tooltip } from './Tooltip';
import { useAppStore } from '../store/useAppStore';
import type { BusinessDomain, Theme } from '../types';
import { SIDEBAR_ROUTES } from '../i18n/sidebar-keys';

type NavDetail = { key: string; icon: React.ComponentType<any>; isAction?: boolean };
type NavItem = { key: string; icon: React.ComponentType<any>; href: string; details: NavDetail[] };

const BASE_ITEMS: NavItem[] = [
  { key: 'aiTools', icon: Bot, href: '/chat', details: [
    { key: 'chat', icon: Sparkles },
    { key: 'agents', icon: Bot },
    { key: 'promptsLibrary', icon: CheckCircle2 },
    { key: 'agile', icon: Workflow },
    { key: 'sprintReview', icon: Search },
  ]},
  { key: 'messages', icon: Mail, href: '/messages', details: [
    { key: 'messages', icon: Mail },
    { key: 'discussions', icon: MessageSquare },
  ]},
  { key: 'projects', icon: Folder, href: '/projects', details: [
    { key: 'createNew', icon: Plus, isAction: true },
    { key: 'reports', icon: BarChart3 },
  ]},
  { key: 'team', icon: Users, href: '/team', details: [
    { key: 'team', icon: Users },
    { key: 'stakeholders', icon: Users },
  ]},
  { key: 'reports', icon: BarChart3, href: '/reports', details: [
    { key: 'reports', icon: BarChart3 },
  ]},
  { key: 'documents', icon: FileText, href: '/documents', details: [
    { key: 'documents', icon: Archive },
    { key: 'regulations', icon: BookOpen },
  ]},
  { key: 'notes', icon: History, href: '/notes', details: [
    { key: 'notes', icon: History },
  ]},
];

const DOMAIN_SPECIFIC: Record<string, NavItem[]> = {
  'Юридический': [
    { key: 'legal', icon: Briefcase, href: '/legal/dashboard', details: [
      { key: 'legalDashboard', icon: Scale },
    ]},
  ],
  'Стратегия': [
    { key: 'strategy', icon: Target, href: '/pains', details: [
      { key: 'painsList', icon: Activity },
      { key: 'stakeholders', icon: Users },
      { key: 'hadiCycles', icon: RotateCcw },
    ]},
    { key: 'pages', icon: Layout, href: '/pages-list', details: [
      { key: 'pages', icon: Layout },
      { key: 'pagesTree', icon: LayoutDashboard },
    ]},
  ],
  'Производство': [
    { key: 'tqm', icon: Shield, href: '/tqm', details: [
      { key: 'tqmDashboard', icon: Shield },
      { key: 'tqmDwm', icon: BarChart3 },
      { key: 'continuousImprovement', icon: RefreshCw },
      { key: 'qualityAudits', icon: ClipboardCheck },
      { key: 'clientSatisfaction', icon: Smile },
    ]},
    { key: 'factory', icon: Factory, href: '/equipment/inspections', details: [
      { key: 'inspectionJournal', icon: ClipboardCheck },
      { key: 'tpSchemes', icon: Workflow },
      { key: 'regulations', icon: BookOpen },
    ]},
  ],
  'Оборудование': [
    { key: 'equipment', icon: Settings2, href: '/equipment/journal', details: [
      { key: 'equipmentJournal', icon: Settings2 },
      { key: 'equipmentBoard', icon: LayoutDashboard },
      { key: 'repairArchive', icon: Archive },
    ]},
    { key: 'tqm', icon: Shield, href: '/tqm', details: [
      { key: 'tqmDashboard', icon: Shield },
      { key: 'qualityAudits', icon: ClipboardCheck },
    ]},
  ],
  'Управление': [
    { key: 'diary', icon: History, href: '/management/journal', details: [
      { key: 'mgmtJournal', icon: History },
      { key: 'mgmtReport', icon: FileText },
    ]},
  ],
};

function userInitials(name?: string | null, email?: string | null): string {
  if (name?.trim()) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  }
  return (email?.slice(0, 2) ?? '??').toUpperCase();
}

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const sidebarRef = useRef<HTMLElement>(null);
  const { data: session } = useSession();
  const { t } = useI18n();
  const displayName = session?.user?.name ?? 'User';
  const displayEmail = session?.user?.email ?? '';
  const initials = userInitials(session?.user?.name, session?.user?.email);

  const {
    currentDomain, isSidebarExpanded, setIsSidebarExpanded,
    showAccountMenu, setShowAccountMenu, theme, setTheme,
    setShowQuickAddModal, setQuickAddType, projects,
  } = useAppStore();

  // tri-state: null = auto (follow active route), string = explicitly open, 'closed' = explicitly closed
  const [panelOverride, setPanelOverride] = useState<string | null | 'closed'>(null);

  useEffect(() => {
    if (!showAccountMenu) return;
    const close = () => setShowAccountMenu(false);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [showAccountMenu, setShowAccountMenu]);

  const domainExtras = DOMAIN_SPECIFIC[currentDomain as keyof typeof DOMAIN_SPECIFIC] ?? [];
  const sideItems = [...BASE_ITEMS, ...domainExtras];

  // Derive which parent item owns the current route
  const activeParentKey = sideItems.find(
    (item) =>
      item.details.some((d) => SIDEBAR_ROUTES[d.key] === pathname) ||
      pathname === item.href ||
      pathname.startsWith(item.href + '/')
  )?.key ?? null;

  // Reset override on navigation so new route auto-opens its group
  useEffect(() => { setPanelOverride(null); }, [pathname]);

  const openPanel = isSidebarExpanded
    ? (panelOverride === 'closed' ? null : panelOverride ?? activeParentKey)
    : null;

  const labelItem = (key: string) => t(`sidebar.items.${key}`);
  const labelDetail = (key: string) =>
    key === 'createNew' ? t('sidebar.createNew') : t(`sidebar.details.${key}`);
  const tipItem = (key: string) => {
    const tip = t(`sidebar.itemTips.${key}`);
    return tip.startsWith('sidebar.') ? '' : tip;
  };
  const tipDetail = (key: string) => {
    const tip = t(`sidebar.detailTips.${key}`);
    return tip.startsWith('sidebar.') ? '' : tip;
  };

  const navigate = (d: NavDetail) => {
    if (d.isAction) {
      setQuickAddType('проект');
      setShowQuickAddModal(true);
      return;
    }
    const href = SIDEBAR_ROUTES[d.key];
    if (href) router.push(href);
  };

  const handleItemClick = (e: React.MouseEvent, item: NavItem) => {
    if (item.details.length === 1) {
      navigate(item.details[0]);
    } else if (isSidebarExpanded) {
      e.stopPropagation();
      setPanelOverride(openPanel === item.key ? 'closed' : item.key);
    } else {
      e.stopPropagation();
      setIsSidebarExpanded(true);
      setPanelOverride(item.key);
    }
  };

  const isActive = (item: NavItem) =>
    openPanel === item.key || (openPanel === null && item.key === activeParentKey);

  return (
    <aside
      ref={sidebarRef}
      className={`hidden md:flex flex-col py-2 z-[40] shrink-0 transition-all duration-300 bg-[#edf0f7] border-r border-[#d5dae8] ${
        isSidebarExpanded ? 'w-56 items-stretch px-2' : 'w-14 items-center'
      }`}
    >
      {/* Toggle button */}
      <button
        onClick={(e) => { e.stopPropagation(); setIsSidebarExpanded((v) => !v); }}
        className={`mb-1 shrink-0 flex items-center justify-center w-9 h-9 text-slate-400 hover:text-slate-700 transition-all ${isSidebarExpanded ? 'self-end' : ''}`}
        title={isSidebarExpanded ? t('sidebar.collapse') : t('sidebar.expand')}
      >
        {isSidebarExpanded ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
      </button>

      {/* Nav items */}
      <div className={`flex flex-col gap-0.5 overflow-y-auto overflow-x-hidden scrollbar-hide flex-1 w-full proji-scrollbar ${isSidebarExpanded ? '' : 'items-center'}`}>
        {sideItems.map((item) => (
          <div key={item.key} className="flex flex-col w-full">
            <Tooltip text={tipItem(item.key)} side="right" className="w-full">
            <button
              onClick={(e) => handleItemClick(e, item)}
              className={`w-full transition-all duration-200 flex items-center ${
                isSidebarExpanded ? 'px-3 py-2.5 gap-3 text-sm font-semibold justify-start' : 'p-3 justify-center'
              } ${
                isActive(item)
                  ? 'bg-slate-100 text-slate-900 font-bold'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              <item.icon size={18} className="shrink-0" />
              {isSidebarExpanded && <span className="whitespace-nowrap flex-1">{labelItem(item.key)}</span>}
              {isSidebarExpanded && item.details.length > 1 && (
                <ChevronDown size={13} className={`transition-transform duration-200 ${openPanel === item.key ? 'rotate-180' : ''}`} />
              )}
            </button>
            </Tooltip>

            {/* Inline dropdown (expanded) */}
            <AnimatePresence>
              {isSidebarExpanded && openPanel === item.key && item.details.length > 1 && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="flex flex-col overflow-hidden"
                >
                  {item.key === 'projects' ? (
                    <>
                      {/* Dynamic project list */}
                      {projects.map((p) => (
                        <Tooltip key={p.id} text={p.description || p.name} side="right">
                          <button
                            onClick={() => router.push(`/projects/${p.id}`)}
                            className={`w-full flex items-center gap-3 text-[12px] font-medium py-2 pl-10 pr-3 transition-all text-left ${
                              pathname === `/projects/${p.id}` ? 'bg-slate-200 text-slate-900 font-semibold' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-700'
                            }`}
                          >
                            <Folder size={12} className="shrink-0" />
                            <span className="truncate">{p.name}</span>
                          </button>
                        </Tooltip>
                      ))}

                      {/* Создать новый — last */}
                      <Tooltip text={t('sidebar.createNewTip')} side="right">
                        <button
                          onClick={() => { setQuickAddType('проект'); setShowQuickAddModal(true); }}
                          className="w-full flex items-center gap-3 text-[12px] font-medium py-2 pl-10 pr-3 transition-all text-left text-proji-primary hover:bg-proji-primary/10 font-semibold"
                        >
                          <Plus size={12} className="shrink-0" />
                          {t('sidebar.createNew')}
                        </button>
                      </Tooltip>
                    </>
                  ) : (
                    item.details.map((d) => (
                      <Tooltip key={d.key} text={tipDetail(d.key)} side="right">
                      <button
                        onClick={() => navigate(d)}
                        className={`w-full flex items-center gap-3 text-[12px] font-medium py-2 pl-10 pr-3 transition-all text-left ${
                          d.isAction
                            ? 'text-proji-primary hover:bg-proji-primary/10 font-semibold'
                            : SIDEBAR_ROUTES[d.key] === pathname
                              ? 'bg-slate-200 text-slate-900 font-semibold'
                              : 'text-slate-400 hover:bg-slate-50 hover:text-slate-700'
                        }`}
                      >
                        <d.icon size={12} className="shrink-0" />
                        {labelDetail(d.key)}
                      </button>
                      </Tooltip>
                    ))
                  )}
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        ))}
      </div>

      {/* Account section */}
      <div className={`mt-auto flex flex-col gap-0 border-t border-[#d5dae8] pt-1 ${isSidebarExpanded ? 'w-full' : ''}`}>
        <div className="relative">
          <div
            onClick={(e) => { e.stopPropagation(); setShowAccountMenu(!showAccountMenu); }}
            className={`flex items-center gap-3 cursor-pointer p-2 transition-all group ${isSidebarExpanded ? 'w-full px-3 hover:bg-slate-50' : 'justify-center hover:bg-slate-50'}`}
          >
            <div className="w-9 h-9 shrink-0 rounded-full flex items-center justify-center text-[10px] font-bold bg-slate-200 text-slate-700">
              {session?.user?.image ? (
                <img src={session.user.image} alt="" className="w-full h-full object-cover rounded-full" />
              ) : (
                initials
              )}
            </div>
            {isSidebarExpanded && (
              <div className="flex flex-col text-left min-w-0">
                <span className="text-sm font-bold text-slate-800 truncate">{displayName}</span>
                <span className="text-[10px] text-slate-500 truncate w-32">{displayEmail}</span>
              </div>
            )}
          </div>
          <AnimatePresence>
            {showAccountMenu && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="absolute left-full bottom-0 ml-4 min-w-[200px] bg-proji-bg border border-proji-border rounded-2xl shadow-2xl p-4 z-[110]"
              >
                <p className="text-[9px] uppercase font-bold tracking-[0.2em] text-proji-secondary mb-3 border-b border-proji-border pb-2">
                  {t('account.title')}
                </p>
                <div className="flex flex-col gap-1">
                  <div className="px-3 py-2 mb-2 bg-proji-sidebar rounded-xl border border-proji-border">
                    <p className="text-sm font-bold text-proji-dark truncate">{displayName}</p>
                    <p className="text-[10px] text-proji-secondary truncate">{displayEmail}</p>
                  </div>
                  <button
                    onClick={() => { router.push('/cabinet'); setShowAccountMenu(false); }}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-proji-secondary hover:bg-proji-sidebar hover:text-proji-dark transition-colors"
                  >
                    <KeyRound size={14} /> {t('account.cabinet')}
                  </button>
                  <button className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-proji-secondary hover:bg-proji-sidebar hover:text-proji-dark transition-colors">
                    <Settings size={14} /> {t('account.settings')}
                  </button>
                  <button
                    onClick={() => { router.push('/tariffs'); setShowAccountMenu(false); }}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-proji-secondary hover:bg-proji-sidebar hover:text-proji-dark transition-colors"
                  >
                    <CreditCard size={14} /> {t('account.tariffs')}
                  </button>
                  <button
                    onClick={() => { router.push('/payment'); setShowAccountMenu(false); }}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-proji-secondary hover:bg-proji-sidebar hover:text-proji-dark transition-colors"
                  >
                    <Wallet size={14} /> {t('account.payment')}
                  </button>
                  <button
                    onClick={() => signOut({ callbackUrl: '/login' })}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                  >
                    <LogOut size={14} /> {t('account.signOut')}
                  </button>
                  <div className="h-px bg-proji-border my-2" />
                  <p className="text-[8px] uppercase font-bold tracking-widest text-proji-secondary px-3 mb-1">{t('account.theme')}</p>
                  {(['light', 'dark', 'system'] as Theme[]).map((themeKey) => (
                    <button
                      key={themeKey}
                      onClick={() => setTheme(themeKey)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${theme === themeKey ? 'bg-proji-dark text-white' : 'text-proji-secondary hover:bg-proji-sidebar hover:text-proji-dark'}`}
                    >
                      {themeKey === 'light' ? <Sun size={12} /> : themeKey === 'dark' ? <Moon size={12} /> : <Monitor size={12} />}
                      {themeKey === 'light' ? t('account.themeLight') : themeKey === 'dark' ? t('account.themeDark') : t('account.themeSystem')}
                    </button>
                  ))}
                </div>
                <div className="absolute left-[-6px] bottom-5 w-3 h-3 bg-proji-bg border-b border-l border-proji-border rotate-45 rounded-sm" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </aside>
  );
}
