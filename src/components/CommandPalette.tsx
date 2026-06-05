'use client';
import { useState, useRef, useEffect } from 'react';
import { useModalClose } from '../hooks/useModalClose';
import { Tooltip } from './Tooltip';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, X, History, Plus, LayoutGrid, ChevronRight,
  CheckCircle2, Folder, FileText,
} from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { useAppStore } from '../store/useAppStore';
import { useI18n } from '../context/I18nContext';

const PATH_KEYS: Record<string, string> = {
  '/chat': 'topbar.routes.chat',
  '/analytics': 'commandPalette.analytics',
  '/board': 'commandPalette.taskBoard',
  '/tasks': 'topbar.routes.tasks',
  '/documents': 'topbar.routes.documents',
  '/team': 'topbar.routes.team',
  '/projects': 'topbar.routes.projects',
  '/messages': 'topbar.routes.messages',
  '/discussions': 'commandPalette.discussions',
  '/management/journal': 'commandPalette.mgmtJournal',
  '/management/report': 'commandPalette.mgmtReport',
  '/tqm': 'sidebar.items.tqm',
  '/pains': 'commandPalette.painsList',
  '/hadi': 'sidebar.details.hadiCycles',
  '/legal/dashboard': 'commandPalette.legalDashboard',
  '/agile': 'sidebar.details.agile',
  '/pages-list': 'commandPalette.pages',
  '/goals-tree': 'commandPalette.goalsTree',
};

const RECENT_KEY = 'proji_recent_pages';

type RecentPage = { href: string; label: string };
type SearchResult = { label: string; sub: string; href: string; type: string };

export function CommandPalette() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [recent, setRecent] = useState<RecentPage[]>([]);
  const [noteMode, setNoteMode] = useState(false);

  useModalClose(() => { setOpen(false); setNoteMode(false); }, open);
  const [noteText, setNoteText] = useState('');
  const [noteSaved, setNoteSaved] = useState(false);

  const router = useRouter();
  const pathname = usePathname();
  const { allTasks, projects, setShowQuickAddModal, setQuickAddType } = useAppStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const noteRef = useRef<HTMLTextAreaElement>(null);

  // Track recent pages in localStorage
  useEffect(() => {
    const key = PATH_KEYS[pathname];
    const label = key ? t(key) : undefined;
    if (!label) return;
    try {
      const stored: RecentPage[] = JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
      const deduped = [{ href: pathname, label }, ...stored.filter((p) => p.href !== pathname)].slice(0, 5);
      localStorage.setItem(RECENT_KEY, JSON.stringify(deduped));
      setRecent(deduped);
    } catch {}
  }, [pathname, t]);

  useEffect(() => {
    try {
      setRecent(JSON.parse(localStorage.getItem(RECENT_KEY) || '[]'));
    } catch {}
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setOpen(false); setNoteMode(false); }
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setOpen(true); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 60);
    if (!open) { setQuery(''); setNoteMode(false); setNoteText(''); setNoteSaved(false); }
  }, [open]);

  useEffect(() => {
    if (noteMode) setTimeout(() => noteRef.current?.focus(), 60);
  }, [noteMode]);

  const results: SearchResult[] = query.trim().length > 1
    ? [
        ...allTasks
          .filter((t) => t.title.toLowerCase().includes(query.toLowerCase()))
          .slice(0, 4)
          .map((task) => ({ label: task.title, sub: t('commandPalette.task'), href: '/tasks', type: 'task' })),
        ...projects
          .filter((p) => p.name?.toLowerCase().includes(query.toLowerCase()))
          .slice(0, 3)
          .map((p) => ({ label: p.name ?? '', sub: t('commandPalette.project'), href: '/projects', type: 'project' })),
      ]
    : [];

  const go = (href: string) => {
    router.push(href);
    setOpen(false);
  };

  const saveNote = () => {
    if (!noteText.trim()) return;
    // Store note to journal (localStorage for now — journal page can read it)
    try {
      const notes: { text: string; date: string }[] = JSON.parse(localStorage.getItem('proji_journal_notes') || '[]');
      notes.unshift({ text: noteText.trim(), date: new Date().toISOString() });
      localStorage.setItem('proji_journal_notes', JSON.stringify(notes));
    } catch {}
    setNoteSaved(true);
    setTimeout(() => {
      setOpen(false);
      router.push('/management/journal');
    }, 800);
  };

  const typeIcon: Record<string, React.ComponentType<any>> = {
    task: CheckCircle2,
    project: Folder,
    document: FileText,
  };

  return (
    <>
      {/* Trigger button in topbar */}
      <Tooltip text={t('topbar.searchHint')} side="bottom">
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 h-8 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-400 hover:border-proji-primary/60 hover:text-slate-600 transition-all w-44"
      >
        <Search size={13} className="shrink-0" />
        <span className="flex-1 text-left">{t('topbar.search')}</span>
        <kbd className="text-[9px] text-slate-300 font-mono border border-slate-200 px-1 py-0.5 rounded">⌘K</kbd>
      </button>
      </Tooltip>

      {/* Palette overlay */}
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-[400] flex items-start justify-center pt-[8vh] px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="absolute inset-0 bg-black/25 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: -12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: -12 }}
              transition={{ type: 'spring', stiffness: 450, damping: 32 }}
              className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100"
            >
              {/* Search input row */}
              <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100">
                <Search size={16} className="text-slate-400 shrink-0" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setNoteMode(false); }}
                  placeholder={t('topbar.searchPlaceholder')}
                  className="flex-1 text-sm text-slate-800 placeholder:text-slate-400 outline-none"
                />
                <button
                  onClick={() => setOpen(false)}
                  className="text-[10px] font-bold text-slate-400 border border-slate-200 px-1.5 py-0.5 rounded-md hover:text-slate-600 transition-colors"
                >
                  ESC
                </button>
              </div>

              <div className="max-h-[65vh] overflow-y-auto">
                {/* Note writing mode */}
                {noteMode && (
                  <div className="p-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">
                      {t('commandPalette.newNoteJournal')}
                    </p>
                    <textarea
                      ref={noteRef}
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      placeholder={t('commandPalette.notePlaceholder')}
                      className="w-full h-36 text-sm text-slate-800 placeholder:text-slate-400 outline-none resize-none leading-relaxed"
                    />
                    <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-slate-100">
                      <button
                        onClick={() => setNoteMode(false)}
                        className="text-xs text-slate-400 hover:text-slate-700 transition-colors px-3 py-1.5"
                      >
                        {t('common.cancel')}
                      </button>
                      <button
                        onClick={saveNote}
                        disabled={!noteText.trim() || noteSaved}
                        className="bg-proji-primary text-white px-4 py-1.5 rounded-xl text-xs font-bold hover:bg-proji-primary/90 disabled:opacity-40 transition-all flex items-center gap-2"
                      >
                        {noteSaved ? `✓ ${t('commandPalette.saved')}` : t('commandPalette.saveToJournal')}
                      </button>
                    </div>
                  </div>
                )}

                {/* Search results */}
                {!noteMode && query.trim().length > 1 && (
                  <div className="p-2">
                    {results.length > 0 ? (
                      results.map((r, i) => {
                        const Icon = typeIcon[r.type] ?? Search;
                        return (
                          <button
                            key={i}
                            onClick={() => go(r.href)}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 text-left transition-colors"
                          >
                            <Icon size={14} className="text-proji-primary shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-slate-800 truncate">{r.label}</p>
                              <p className="text-[11px] text-slate-400">{r.sub}</p>
                            </div>
                            <ChevronRight size={14} className="text-slate-300 shrink-0" />
                          </button>
                        );
                      })
                    ) : (
                      <p className="text-xs text-slate-400 text-center py-6">{t('commandPalette.noResults')}</p>
                    )}
                  </div>
                )}

                {/* Default: recent + quick actions */}
                {!noteMode && query.trim().length < 2 && (
                  <>
                    {recent.length > 0 && (
                      <div className="p-2">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-3 py-2">
                          {t('commandPalette.recentPages')}
                        </p>
                        {recent.map((p, i) => (
                          <button
                            key={i}
                            onClick={() => go(p.href)}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 text-left transition-colors"
                          >
                            <History size={14} className="text-slate-400 shrink-0" />
                            <span className="text-sm font-semibold text-slate-800 flex-1">{p.label}</span>
                            <ChevronRight size={14} className="text-slate-300 shrink-0" />
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Quick actions */}
                    <div className="p-2 border-t border-slate-100">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-3 py-2">
                        {t('commandPalette.quickActions')}
                      </p>
                      <div className="grid grid-cols-2 gap-2 px-1 pb-1">
                        <button
                          onClick={() => {
                            setQuickAddType('задача');
                            setShowQuickAddModal(true);
                            setOpen(false);
                          }}
                          className="flex flex-col gap-2 p-3 rounded-xl border border-slate-100 hover:border-proji-primary/30 hover:bg-proji-primary/5 text-left transition-all"
                        >
                          <div className="w-8 h-8 rounded-lg bg-proji-primary/10 flex items-center justify-center">
                            <Plus size={15} className="text-proji-primary" />
                          </div>
                          <p className="text-sm font-bold text-slate-800">{t('commandPalette.newTask')}</p>
                          <p className="text-[11px] text-slate-400 leading-snug">{t('commandPalette.newTaskDesc')}</p>
                        </button>

                        <button
                          onClick={() => setNoteMode(true)}
                          className="flex flex-col gap-2 p-3 rounded-xl border border-slate-100 hover:border-proji-primary/30 hover:bg-proji-primary/5 text-left transition-all"
                        >
                          <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center">
                            <LayoutGrid size={15} className="text-teal-500" />
                          </div>
                          <p className="text-sm font-bold text-slate-800">{t('commandPalette.createPage')}</p>
                          <p className="text-[11px] text-slate-400 leading-snug">{t('commandPalette.createPageDesc')}</p>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
