'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Clock, Trash2, Plus, Search, X, Pin, Tag } from 'lucide-react';
import { PageWrapper } from '../../../src/components/PageWrapper';

type Category = 'Общее' | 'Решение' | 'Идея' | 'Риск' | 'Встреча';
interface Note { id: string; text: string; title: string; date: string; category: Category; pinned: boolean; }

const CAT_COLORS: Record<Category, string> = {
  'Общее':   'bg-slate-100 text-slate-500',
  'Решение': 'bg-blue-100 text-blue-600',
  'Идея':    'bg-purple-100 text-purple-600',
  'Риск':    'bg-red-100 text-red-600',
  'Встреча': 'bg-green-100 text-green-600',
};
const CATS: Category[] = ['Общее', 'Решение', 'Идея', 'Риск', 'Встреча'];
const STORAGE_KEY = 'proji_journal_notes_v2';

export default function ManagementJournalPage() {
  const [notes, setNotes]       = useState<Note[]>([]);
  const [search, setSearch]     = useState('');
  const [showForm, setShowForm] = useState(false);
  const [catFilter, setCatFilter] = useState<Category | 'all'>('all');

  // form
  const [title, setTitle]       = useState('');
  const [text, setText]         = useState('');
  const [category, setCategory] = useState<Category>('Общее');

  useEffect(() => {
    try { setNotes(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')); } catch {}
  }, []);

  const save = (updated: Note[]) => {
    setNotes(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const addNote = () => {
    if (!text.trim() && !title.trim()) return;
    const note: Note = {
      id:       Date.now().toString(),
      title:    title.trim() || 'Без названия',
      text:     text.trim(),
      date:     new Date().toISOString(),
      category,
      pinned:   false,
    };
    save([note, ...notes]);
    setTitle(''); setText(''); setCategory('Общее'); setShowForm(false);
  };

  const deleteNote = (id: string) => save(notes.filter((n) => n.id !== id));
  const togglePin  = (id: string) => save(notes.map((n) => n.id === id ? { ...n, pinned: !n.pinned } : n));

  const filtered = notes
    .filter((n) => {
      const q = search.toLowerCase();
      return (!search || n.title.toLowerCase().includes(q) || n.text.toLowerCase().includes(q))
        && (catFilter === 'all' || n.category === catFilter);
    })
    .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

  return (
    <PageWrapper>
      <div className="max-w-3xl mx-auto w-full px-4 md:px-10 pb-16">

        <div className="flex items-center justify-between mb-2 pt-1">
          <div className="flex items-center gap-2">
            <BookOpen size={20} className="text-proji-primary" />
            <h1 className="text-xl font-black text-slate-900">Управленческий журнал</h1>
          </div>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="flex items-center gap-2 px-4 py-2 bg-proji-primary text-white text-sm font-bold rounded-xl hover:bg-proji-primary/90 transition-colors"
          >
            <Plus size={14} /> Запись
          </button>
        </div>
        <p className="text-sm text-slate-400 mb-6">Личные заметки, решения, идеи и риски</p>

        {/* New note form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
              className="overflow-hidden mb-6"
            >
              <div className="bg-white rounded-3xl border border-slate-200 p-6 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">Новая запись</p>
                  <button onClick={() => setShowForm(false)}><X size={14} className="text-slate-400" /></button>
                </div>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Заголовок записи..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-800 placeholder:text-slate-300 outline-none focus:border-proji-primary/40 transition-colors"
                />
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Содержание записи, решение, идея..."
                  rows={4}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-800 placeholder:text-slate-300 outline-none resize-none leading-relaxed focus:border-proji-primary/40 transition-colors"
                />
                <div className="flex items-center gap-2 flex-wrap">
                  {CATS.map((c) => (
                    <button key={c} onClick={() => setCategory(c)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-colors ${category === c ? 'bg-proji-primary text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
                <button
                  onClick={addNote}
                  disabled={!text.trim() && !title.trim()}
                  className={`py-3 rounded-2xl text-sm font-black transition-all ${
                    text.trim() || title.trim() ? 'bg-proji-primary text-white hover:bg-proji-primary/90' : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  Сохранить запись
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search + filter */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <div className="flex-1 min-w-48 flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-2xl">
            <Search size={14} className="text-slate-300 shrink-0" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск по записям..."
              className="flex-1 text-sm text-slate-800 placeholder:text-slate-300 outline-none"
            />
            {search && <button onClick={() => setSearch('')}><X size={13} className="text-slate-300" /></button>}
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <button onClick={() => setCatFilter('all')}
              className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-colors ${catFilter === 'all' ? 'bg-slate-800 text-white' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'}`}
            >
              Все
            </button>
            {CATS.map((c) => (
              <button key={c} onClick={() => setCatFilter(c)}
                className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-colors ${catFilter === c ? 'bg-slate-800 text-white' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'}`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Notes list */}
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen size={28} className="text-slate-200 mx-auto mb-3" />
            <p className="text-sm text-slate-400">{search ? 'Ничего не найдено' : 'Нет записей'}</p>
            <p className="text-xs text-slate-300 mt-1">Нажмите «Запись» чтобы добавить первую заметку</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((note) => (
              <motion.div
                key={note.id} layout
                className={`bg-white rounded-2xl border p-5 group ${note.pinned ? 'border-proji-primary/30' : 'border-slate-100'}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      {note.pinned && <Pin size={11} className="text-proji-primary shrink-0" />}
                      <p className="text-sm font-bold text-slate-800">{note.title}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${CAT_COLORS[note.category]}`}>
                        {note.category}
                      </span>
                    </div>
                    {note.text && (
                      <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{note.text}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button onClick={() => togglePin(note.id)}
                      className={`p-1.5 rounded-lg transition-all ${note.pinned ? 'text-proji-primary bg-proji-primary/10' : 'text-slate-400 hover:text-proji-primary hover:bg-proji-primary/10'}`}
                    >
                      <Pin size={13} />
                    </button>
                    <button onClick={() => deleteNote(note.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-slate-50">
                  <Clock size={10} className="text-slate-300" />
                  <span className="text-[10px] text-slate-400">
                    {new Date(note.date).toLocaleString('ru', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}

      </div>
    </PageWrapper>
  );
}
