'use client';
import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronLeft, FilePlus, Search, ArrowUpDown, Send,
  FileText, Trash2, Edit3, X, Check, Bold, Italic,
  Underline, Download, CheckSquare, Square,
} from 'lucide-react';
import { PageWrapper } from '../../../../src/components/PageWrapper';
import { useModalClose } from '../../../../src/hooks/useModalClose';

interface Doc {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  markedForSend: boolean;
}

function exportToDoc(title: string, content: string) {
  const html = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office"
          xmlns:w="urn:schemas-microsoft-com:office:word"
          xmlns="http://www.w3.org/TR/REC-html40">
    <head><meta charset="utf-8"><title>${title}</title>
    <style>body{font-family:Calibri,sans-serif;font-size:12pt;margin:2cm;} h1{font-size:18pt;}</style>
    </head>
    <body><h1>${title}</h1><div>${content.replace(/\n/g, '<br/>')}</div></body>
    </html>`;
  const blob = new Blob(['﻿', html], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `${title}.doc`; a.click();
  URL.revokeObjectURL(url);
}

const STORAGE_KEY = (id: string) => `proji_docs_${id}`;

type SortOrder = 'newest' | 'oldest' | 'alpha';

export default function ProjectDocsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [docs, setDocs] = useState<Doc[]>([]);
  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [showSearch, setShowSearch] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [editingDoc, setEditingDoc] = useState<Doc | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [selectAll, setSelectAll] = useState(false);

  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try { setDocs(JSON.parse(localStorage.getItem(STORAGE_KEY(id)) || '[]')); } catch {}
  }, [id]);

  const persist = (updated: Doc[]) => {
    setDocs(updated);
    localStorage.setItem(STORAGE_KEY(id), JSON.stringify(updated));
  };

  useEffect(() => {
    if (!showSortMenu) return;
    const h = (e: MouseEvent) => { if (sortRef.current && !sortRef.current.contains(e.target as Node)) setShowSortMenu(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [showSortMenu]);

  useModalClose(() => setEditingDoc(null), !!editingDoc);

  const openCreate = () => {
    setIsNew(true);
    setEditingDoc({ id: Date.now().toString(), title: '', content: '', createdAt: new Date().toISOString(), markedForSend: false });
  };

  const saveDoc = () => {
    if (!editingDoc || !editingDoc.title.trim()) return;
    if (isNew) persist([editingDoc, ...docs]);
    else persist(docs.map((d) => d.id === editingDoc.id ? editingDoc : d));
    setEditingDoc(null);
    setIsNew(false);
  };

  const deleteDoc = (docId: string) => persist(docs.filter((d) => d.id !== docId));

  const toggleMark = (docId: string) => persist(docs.map((d) => d.id === docId ? { ...d, markedForSend: !d.markedForSend } : d));

  const toggleAll = () => {
    const next = !selectAll;
    setSelectAll(next);
    persist(docs.map((d) => ({ ...d, markedForSend: next })));
  };

  const sendMarked = () => {
    const marked = docs.filter((d) => d.markedForSend);
    marked.forEach((d) => exportToDoc(d.title, d.content));
  };

  const applyFormat = (tag: string) => {
    const textarea = document.getElementById('doc-editor') as HTMLTextAreaElement;
    if (!textarea || !editingDoc) return;
    const { selectionStart: s, selectionEnd: e, value } = textarea;
    const selected = value.slice(s, e);
    const wrapped = selected ? `<${tag}>${selected}</${tag}>` : `<${tag}></${tag}>`;
    const newContent = value.slice(0, s) + wrapped + value.slice(e);
    setEditingDoc({ ...editingDoc, content: newContent });
  };

  const sorted = [...docs]
    .filter((d) => d.title.toLowerCase().includes(search.toLowerCase()) || d.content.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortOrder === 'alpha') return a.title.localeCompare(b.title);
      if (sortOrder === 'oldest') return a.createdAt.localeCompare(b.createdAt);
      return b.createdAt.localeCompare(a.createdAt);
    });

  const markedCount = docs.filter((d) => d.markedForSend).length;

  const SORT_LABELS: Record<SortOrder, string> = { newest: 'Сначала новые', oldest: 'Сначала старые', alpha: 'По алфавиту' };

  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto w-full px-4 md:px-10 pb-16">

        {/* Back */}
        <button
          onClick={() => router.push(`/projects/${id}`)}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-700 transition-colors mb-6 mt-1"
        >
          <ChevronLeft size={14} /> Назад к проекту
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-8 flex-wrap">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <h2 className="text-xl font-black text-slate-900">Документы</h2>
            {docs.length > 0 && (
              <span className="text-[11px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{docs.length}</span>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={openCreate}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-proji-primary text-white text-sm font-bold hover:bg-proji-primary/90 transition-all"
            >
              <FilePlus size={14} /> Создать документ
            </button>
            <button
              onClick={() => setShowSearch((v) => !v)}
              className={`p-2 rounded-xl border text-sm font-semibold transition-all ${showSearch ? 'border-proji-primary text-proji-primary bg-proji-primary/5' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}
            >
              <Search size={15} />
            </button>
            <div ref={sortRef} className="relative">
              <button
                onClick={() => setShowSortMenu((v) => !v)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-500 hover:border-slate-300 transition-all"
              >
                <ArrowUpDown size={14} /> Сортировка
              </button>
              <AnimatePresence>
                {showSortMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    className="absolute right-0 top-full mt-2 w-44 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-50"
                  >
                    {(['newest', 'oldest', 'alpha'] as SortOrder[]).map((s) => (
                      <button
                        key={s}
                        onClick={() => { setSortOrder(s); setShowSortMenu(false); }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${sortOrder === s ? 'bg-proji-primary/10 text-proji-primary' : 'text-slate-600 hover:bg-slate-50'}`}
                      >
                        {SORT_LABELS[s]}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <button
              onClick={sendMarked}
              disabled={markedCount === 0}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-500 hover:border-proji-primary hover:text-proji-primary transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send size={14} />
              {markedCount > 0 ? `Отправить (${markedCount})` : 'Отправить'}
            </button>
          </div>
        </div>

        {/* Search bar */}
        <AnimatePresence>
          {showSearch && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 overflow-hidden"
            >
              <div className="flex items-center gap-2 px-4 py-3 bg-white border border-slate-200 rounded-2xl">
                <Search size={14} className="text-slate-400 shrink-0" />
                <input
                  autoFocus
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Поиск по документам..."
                  className="flex-1 text-sm text-slate-800 placeholder:text-slate-400 outline-none"
                />
                {search && <button onClick={() => setSearch('')}><X size={13} className="text-slate-400" /></button>}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Doc list */}
        {sorted.length === 0 ? (
          <div className="text-center py-16">
            <FileText size={32} className="text-slate-200 mx-auto mb-3" />
            <p className="text-sm text-slate-400">{search ? 'Ничего не найдено' : 'Документов пока нет'}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {/* Select all row */}
            <div className="flex items-center gap-3 px-4 py-2 text-xs text-slate-400 font-semibold">
              <button onClick={toggleAll} className="flex items-center gap-2 hover:text-slate-600 transition-colors">
                {selectAll ? <CheckSquare size={14} className="text-proji-primary" /> : <Square size={14} />}
                Отметить все
              </button>
            </div>

            {sorted.map((doc) => (
              <motion.div
                key={doc.id}
                layout
                className={`flex items-center gap-3 bg-white border rounded-2xl px-4 py-3.5 transition-all ${doc.markedForSend ? 'border-proji-primary/30 bg-proji-primary/5' : 'border-slate-100 hover:border-slate-200'}`}
              >
                <button onClick={() => toggleMark(doc.id)} className="shrink-0">
                  {doc.markedForSend
                    ? <CheckSquare size={16} className="text-proji-primary" />
                    : <Square size={16} className="text-slate-300" />}
                </button>
                <FileText size={16} className="text-slate-300 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800 truncate">{doc.title}</p>
                  <p className="text-[11px] text-slate-400">
                    {new Date(doc.createdAt).toLocaleDateString('ru', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => { setIsNew(false); setEditingDoc(doc); }}
                    className="p-2 rounded-lg text-slate-400 hover:text-proji-primary hover:bg-proji-primary/10 transition-colors"
                  >
                    <Edit3 size={14} />
                  </button>
                  <button
                    onClick={() => exportToDoc(doc.title, doc.content)}
                    className="p-2 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-blue-50 transition-colors"
                  >
                    <Download size={14} />
                  </button>
                  <button
                    onClick={() => deleteDoc(doc.id)}
                    className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Editor modal */}
      <AnimatePresence>
        {editingDoc && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingDoc(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 16 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden"
              style={{ maxHeight: '85vh' }}
            >
              {/* Editor header */}
              <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 shrink-0">
                <input
                  value={editingDoc.title}
                  onChange={(e) => setEditingDoc({ ...editingDoc, title: e.target.value })}
                  placeholder="Название документа"
                  className="flex-1 text-base font-black text-slate-800 placeholder:text-slate-300 outline-none"
                />
                <button
                  onClick={() => exportToDoc(editingDoc.title, editingDoc.content)}
                  disabled={!editingDoc.title.trim()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-500 hover:border-blue-300 hover:text-blue-600 transition-all disabled:opacity-40"
                >
                  <Download size={13} /> Скачать .doc
                </button>
                <button
                  onClick={() => setEditingDoc(null)}
                  className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 transition-colors"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Formatting toolbar */}
              <div className="flex items-center gap-1 px-5 py-2 border-b border-slate-100 shrink-0 bg-slate-50">
                {[
                  { icon: Bold,      tag: 'b',  label: 'Жирный' },
                  { icon: Italic,    tag: 'i',  label: 'Курсив' },
                  { icon: Underline, tag: 'u',  label: 'Подчёркнутый' },
                ].map(({ icon: Icon, tag, label }) => (
                  <button
                    key={tag}
                    title={label}
                    onMouseDown={(e) => { e.preventDefault(); applyFormat(tag); }}
                    className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors"
                  >
                    <Icon size={14} />
                  </button>
                ))}
                <span className="w-px h-4 bg-slate-200 mx-1" />
                <span className="text-[10px] text-slate-400 font-medium">Выделите текст и нажмите форматирование</span>
              </div>

              {/* Content area */}
              <textarea
                id="doc-editor"
                value={editingDoc.content}
                onChange={(e) => setEditingDoc({ ...editingDoc, content: e.target.value })}
                placeholder="Начните писать документ..."
                className="flex-1 px-6 py-5 text-sm text-slate-800 placeholder:text-slate-300 outline-none resize-none leading-relaxed font-[Calibri,sans-serif] overflow-y-auto"
              />

              {/* Footer */}
              <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-100 shrink-0 bg-slate-50">
                <span className="text-[11px] text-slate-400">{editingDoc.content.length} символов</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditingDoc(null)}
                    className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-400 hover:text-slate-700 transition-colors"
                  >
                    Отмена
                  </button>
                  <button
                    onClick={saveDoc}
                    disabled={!editingDoc.title.trim()}
                    className="flex items-center gap-2 px-5 py-2 rounded-xl bg-proji-primary text-white text-sm font-bold hover:bg-proji-primary/90 disabled:opacity-40 transition-all"
                  >
                    <Check size={14} /> Сохранить
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </PageWrapper>
  );
}
