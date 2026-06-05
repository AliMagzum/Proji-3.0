'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, Save, X, StickyNote, Search, Palette } from 'lucide-react';
import { useI18n } from '../../src/context/I18nContext';
import type { Locale } from '../../src/i18n/types';

type Note = {
  id: string;
  title: string;
  body: string;
  color: string;
  createdAt: number;
  updatedAt: number;
};

const COLORS = [
  { bg: 'bg-white', border: 'border-slate-200', label: 'white' },
  { bg: 'bg-yellow-50', border: 'border-yellow-200', label: 'yellow' },
  { bg: 'bg-blue-50', border: 'border-blue-200', label: 'blue' },
  { bg: 'bg-green-50', border: 'border-green-200', label: 'green' },
  { bg: 'bg-pink-50', border: 'border-pink-200', label: 'pink' },
  { bg: 'bg-purple-50', border: 'border-purple-200', label: 'purple' },
  { bg: 'bg-orange-50', border: 'border-orange-200', label: 'orange' },
];

const STORAGE_KEY = 'proji_notes';

function load(): Note[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
  } catch {
    return [];
  }
}

function save(notes: Note[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

function dateLocale(locale: Locale) {
  if (locale === 'kz') return 'kk-KZ';
  if (locale === 'en') return 'en-US';
  return 'ru-RU';
}

export default function NotesPage() {
  const { t, locale } = useI18n();
  const [notes, setNotes] = useState<Note[]>([]);
  const [editing, setEditing] = useState<Note | null>(null);
  const [search, setSearch] = useState('');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  const fmt = useCallback(
    (ts: number) => {
      const d = new Date(ts);
      return d.toLocaleDateString(dateLocale(locale), { day: '2-digit', month: 'short', year: 'numeric' });
    },
    [locale],
  );

  useEffect(() => {
    setNotes(load());
  }, []);

  const persist = (updated: Note[]) => {
    setNotes(updated);
    save(updated);
  };

  const createNote = () => {
    const note: Note = {
      id: crypto.randomUUID(),
      title: '',
      body: '',
      color: 'white',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setEditing(note);
  };

  const saveNote = () => {
    if (!editing) return;
    if (!editing.title.trim() && !editing.body.trim()) {
      setEditing(null);
      return;
    }
    const updated = editing;
    updated.updatedAt = Date.now();
    const idx = notes.findIndex((n) => n.id === editing.id);
    if (idx >= 0) {
      const list = [...notes];
      list[idx] = updated;
      persist(list);
    } else {
      persist([updated, ...notes]);
    }
    setEditing(null);
  };

  const deleteNote = (id: string) => {
    persist(notes.filter((n) => n.id !== id));
    if (editing?.id === id) setEditing(null);
  };

  const colorMeta = (label: string) => COLORS.find((c) => c.label === label) ?? COLORS[0];

  const filtered = notes.filter(
    (n) =>
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.body.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="flex h-full bg-[#f5f7fc]">
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="flex items-center gap-3 px-6 pt-6 pb-4 border-b border-slate-200 bg-white shrink-0">
          <StickyNote size={18} className="text-slate-400" />
          <h1 className="text-lg font-black text-slate-800 tracking-tight">{t('notesPage.title')}</h1>
          <span className="text-xs text-slate-400 font-medium ml-1">{notes.length}</span>
          <div className="relative ml-auto w-52">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('notesPage.searchPlaceholder')}
              className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-slate-400 transition-colors"
            />
          </div>
          <button
            onClick={createNote}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white text-xs font-bold rounded-xl hover:bg-slate-700 transition-colors"
          >
            <Plus size={13} /> {t('notesPage.new')}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-400">
              <StickyNote size={40} strokeWidth={1.5} />
              <p className="text-sm font-medium">{search ? t('notesPage.nothingFound') : t('notesPage.empty')}</p>
              {!search && (
                <button
                  onClick={createNote}
                  className="text-xs text-slate-600 underline underline-offset-2 hover:text-slate-800"
                >
                  {t('notesPage.createFirst')}
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              <AnimatePresence>
                {filtered.map((note) => {
                  const cm = colorMeta(note.color);
                  return (
                    <motion.div
                      key={note.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      onClick={() => setEditing({ ...note })}
                      className={`group relative cursor-pointer rounded-2xl border p-4 shadow-sm hover:shadow-md transition-all ${cm.bg} ${cm.border}`}
                    >
                      {note.title && (
                        <p className="text-sm font-bold text-slate-800 mb-1 line-clamp-1">{note.title}</p>
                      )}
                      {note.body && (
                        <p className="text-xs text-slate-500 line-clamp-4 leading-relaxed">{note.body}</p>
                      )}
                      <p className="text-[10px] text-slate-400 mt-3">{fmt(note.updatedAt)}</p>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteNote(note.id); }}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-white/80 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                      >
                        <Trash2 size={12} />
                      </button>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {editing && (
          <motion.div
            initial={{ x: 60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 60, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={`w-96 shrink-0 border-l border-slate-200 flex flex-col h-full shadow-xl ${colorMeta(editing.color).bg}`}
          >
            <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-200/70 shrink-0">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                {notes.find((n) => n.id === editing.id) ? t('notesPage.edit') : t('notesPage.newNote')}
              </span>
              <div className="ml-auto flex items-center gap-1">
                <div className="relative">
                  <button
                    onClick={() => setShowColorPicker((v) => !v)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-white/70 transition-colors"
                    title={t('notesPage.color')}
                  >
                    <Palette size={14} />
                  </button>
                  <AnimatePresence>
                    {showColorPicker && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="absolute right-0 top-8 bg-white border border-slate-200 rounded-xl shadow-lg p-2 flex gap-1.5 z-10"
                      >
                        {COLORS.map((c) => (
                          <button
                            key={c.label}
                            onClick={() => { setEditing((e) => e ? { ...e, color: c.label } : e); setShowColorPicker(false); }}
                            className={`w-5 h-5 rounded-full border-2 transition-transform hover:scale-110 ${c.bg} ${editing.color === c.label ? 'border-slate-600' : 'border-slate-300'}`}
                          />
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <button
                  onClick={saveNote}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 text-white text-xs font-bold rounded-lg hover:bg-slate-700 transition-colors"
                >
                  <Save size={12} /> {t('notesPage.save')}
                </button>
                <button
                  onClick={() => setEditing(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-white/70 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            <input
              value={editing.title}
              onChange={(e) => setEditing((n) => n ? { ...n, title: e.target.value } : n)}
              placeholder={t('notesPage.titlePlaceholder')}
              className="px-5 pt-4 pb-2 text-base font-bold text-slate-800 bg-transparent outline-none placeholder:text-slate-400 border-none"
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); bodyRef.current?.focus(); } }}
            />

            <textarea
              ref={bodyRef}
              value={editing.body}
              onChange={(e) => setEditing((n) => n ? { ...n, body: e.target.value } : n)}
              placeholder={t('notesPage.bodyPlaceholder')}
              className="flex-1 px-5 py-2 text-sm text-slate-600 bg-transparent outline-none placeholder:text-slate-400 resize-none leading-relaxed border-none"
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === 's') { e.preventDefault(); saveNote(); }
              }}
            />

            <div className="px-5 py-3 border-t border-slate-200/70 flex items-center justify-between shrink-0">
              {editing.createdAt ? (
                <span className="text-[10px] text-slate-400">
                  {t('notesPage.created').replace('{date}', fmt(editing.createdAt))}
                </span>
              ) : (
                <span />
              )}
              {notes.find((n) => n.id === editing.id) && (
                <button
                  onClick={() => deleteNote(editing.id)}
                  className="flex items-center gap-1 text-[11px] text-red-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 size={11} /> {t('notesPage.delete')}
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
