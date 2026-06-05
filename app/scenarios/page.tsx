'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useModalClose } from '../../src/hooks/useModalClose';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus, Trash2, Crown, Pencil, Check, X, MessageCircle,
  Megaphone, Palette, Briefcase, Send, AlertCircle, Save,
} from 'lucide-react';

const STORAGE_KEY = 'proji_prompt_libraries';
const FREE_LIMIT = 3;

type PromptMsg = { id: string; text: string };
type Library = { id: string; name: string; description: string; isDefault: boolean; icon: string; messages: PromptMsg[] };

const DEFAULT_LIBRARIES: Library[] = [
  {
    id: 'marketing', name: 'Marketing', isDefault: true, icon: 'megaphone',
    description: 'Готовые промты для маркетолога: контент-планы, скрипты продаж, SEO-тексты и стратегии роста.',
    messages: [
      { id: 'm1',  text: 'Напиши продающий текст для Instagram-поста о новом продукте нашей компании.' },
      { id: 'm2',  text: 'Составь контент-план на месяц для B2B SaaS компании.' },
      { id: 'm3',  text: 'Придумай 5 цепляющих заголовков для email-рассылки с конверсией выше 30%.' },
      { id: 'm4',  text: 'Проанализируй целевую аудиторию и опиши портрет идеального клиента.' },
      { id: 'm5',  text: 'Напиши скрипт для холодного звонка руководителю отдела маркетинга.' },
      { id: 'm6',  text: 'Создай стратегию выхода на новый рынок за 90 дней.' },
      { id: 'm7',  text: 'Напиши SEO-оптимизированное описание для лендинга SaaS-продукта.' },
      { id: 'm8',  text: 'Предложи 10 идей для вирусного контента в нише B2B.' },
      { id: 'm9',  text: 'Составь скрипт для Reels-видео о кейсе клиента.' },
      { id: 'm10', text: 'Разработай программу реферального маркетинга для текущих клиентов.' },
    ],
  },
  {
    id: 'designer', name: 'Designer', isDefault: true, icon: 'palette',
    description: 'Промты для дизайнера: UX-аудит, дизайн-системы, типографика, анимации и accessibility.',
    messages: [
      { id: 'd1',  text: 'Опиши концепцию дизайн-системы для мобильного приложения в стиле neomorphism.' },
      { id: 'd2',  text: 'Предложи цветовую палитру для финтех-стартапа, вызывающую доверие.' },
      { id: 'd3',  text: 'Напиши ТЗ для дизайна онбординга нового пользователя.' },
      { id: 'd4',  text: 'Дай фидбек по UX: какие паттерны убивают конверсию на лендинге?' },
      { id: 'd5',  text: 'Как правильно выстроить иерархию типографики для SaaS-дашборда?' },
      { id: 'd6',  text: 'Предложи 5 вариантов логотипа для tech-компании в виде текстового описания.' },
      { id: 'd7',  text: 'Как провести юзабилити-тест прототипа и что измерить?' },
      { id: 'd8',  text: 'Напиши принципы accessibility (a11y) для нашего дизайна.' },
      { id: 'd9',  text: 'Создай гайдлайн по иконографике для корпоративного продукта.' },
      { id: 'd10', text: 'Опиши анимационную концепцию для micro-interactions в мобильном приложении.' },
    ],
  },
  {
    id: 'manager', name: 'Manager', isDefault: true, icon: 'briefcase',
    description: 'Для руководителей: OKR, ретроспективы, 1-on-1, адаптация и системы мотивации.',
    messages: [
      { id: 'mg1',  text: 'Составь повестку для еженедельного синка команды на 30 минут.' },
      { id: 'mg2',  text: 'Напиши шаблон OKR для продуктовой команды на квартал.' },
      { id: 'mg3',  text: 'Как провести performance review сотрудника, который не достиг целей?' },
      { id: 'mg4',  text: 'Опиши структуру monthly report для C-level менеджмента.' },
      { id: 'mg5',  text: 'Помоги написать письмо команде о смене приоритетов проекта.' },
      { id: 'mg6',  text: 'Создай шаблон для ретроспективы спринта по методу 4Ls.' },
      { id: 'mg7',  text: 'Как приоритизировать бэклог с помощью метода RICE?' },
      { id: 'mg8',  text: 'Напиши план адаптации нового сотрудника на первые 30-60-90 дней.' },
      { id: 'mg9',  text: 'Составь список вопросов для 1-on-1 встречи с подчинённым.' },
      { id: 'mg10', text: 'Как выстроить систему мотивации без повышения зарплат?' },
    ],
  },
];

function IconEl({ icon, size = 14 }: { icon: string; size?: number }) {
  if (icon === 'megaphone') return <Megaphone size={size} />;
  if (icon === 'palette') return <Palette size={size} />;
  return <Briefcase size={size} />;
}

function loadLibraries(): Library[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return DEFAULT_LIBRARIES;
    const custom: Library[] = JSON.parse(saved);
    return [...DEFAULT_LIBRARIES, ...custom];
  } catch {
    return DEFAULT_LIBRARIES;
  }
}

function persistLibraries(libs: Library[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(libs.filter((l) => !l.isDefault)));
}

const COL_COLORS: Record<string, { stripe: string; icon: string; bubble: string; addBtn: string }> = {
  marketing: { stripe: 'bg-orange-400', icon: 'bg-orange-50 text-orange-500', bubble: 'bg-orange-50 border-orange-200 hover:bg-orange-100', addBtn: 'border-orange-300 text-orange-400 hover:border-orange-500 hover:text-orange-600' },
  designer:  { stripe: 'bg-violet-400', icon: 'bg-violet-50 text-violet-500', bubble: 'bg-violet-50 border-violet-200 hover:bg-violet-100', addBtn: 'border-violet-300 text-violet-400 hover:border-violet-500 hover:text-violet-600' },
  manager:   { stripe: 'bg-blue-400',   icon: 'bg-blue-50 text-blue-500',     bubble: 'bg-blue-50 border-blue-200 hover:bg-blue-100',       addBtn: 'border-blue-300 text-blue-400 hover:border-blue-500 hover:text-blue-600' },
};
const CUSTOM_COLORS = { stripe: 'bg-slate-400', icon: 'bg-slate-100 text-slate-500', bubble: 'bg-white border-slate-200 hover:bg-slate-50', addBtn: 'border-slate-300 text-slate-400 hover:border-slate-500 hover:text-slate-600' };

function getColors(id: string) { return COL_COLORS[id] ?? CUSTOM_COLORS; }

// ─── Modal state: a local draft that only gets saved on explicit action ───────
type ModalState = { lib: Library; isNew: boolean };

export default function ScenariosPage() {
  const router = useRouter();
  const [libraries, setLibraries] = useState<Library[]>([]);
  const [modal, setModal] = useState<ModalState | null>(null);
  const [editingMsgKey, setEditingMsgKey] = useState<string | null>(null);
  const [editingMsgText, setEditingMsgText] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setLibraries(loadLibraries()); }, []);

  const closeModal = useCallback(() => {
    // If new and user just closes without saving → discard (don't add to list)
    setModal(null);
    setEditingMsgKey(null);
  }, []);

  useModalClose(closeModal, !!modal);

  const persistAndSet = (updated: Library[]) => {
    setLibraries(updated);
    persistLibraries(updated);
  };

  const customCount = libraries.filter((l) => !l.isDefault).length;
  const atLimit = customCount >= FREE_LIMIT;

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  // ── Open create modal ──────────────────────────────────────────────────────
  const openCreate = () => {
    if (atLimit) { router.push('/tariffs'); return; }
    const lib: Library = {
      id: crypto.randomUUID(), name: '', description: '',
      isDefault: false, icon: 'briefcase', messages: [],
    };
    setModal({ lib, isNew: true });
    setTimeout(() => nameRef.current?.focus(), 50);
  };

  // ── Open edit modal ────────────────────────────────────────────────────────
  const openEdit = (lib: Library) => {
    setModal({ lib: { ...lib, messages: lib.messages.map((m) => ({ ...m })) }, isNew: false });
  };

  // ── Save modal (create or update) ─────────────────────────────────────────
  const saveModal = () => {
    if (!modal) return;
    const lib = { ...modal.lib, name: modal.lib.name.trim() || 'Без названия' };
    if (modal.isNew) {
      persistAndSet([...libraries, lib]);
    } else {
      persistAndSet(libraries.map((l) => l.id === lib.id ? lib : l));
    }
    setModal(null);
    setEditingMsgKey(null);
  };

  // ── Modal-local message ops (edit the draft, not libraries) ───────────────
  const modalAddMsg = () => {
    if (!modal) return;
    const msg: PromptMsg = { id: crypto.randomUUID(), text: '' };
    setModal((m) => m ? { ...m, lib: { ...m.lib, messages: [...m.lib.messages, msg] } } : m);
    setEditingMsgKey(msg.id);
    setEditingMsgText('');
  };

  const modalSaveMsg = (msgId: string) => {
    if (!modal || !editingMsgText.trim()) {
      // discard empty message
      setModal((m) => m ? { ...m, lib: { ...m.lib, messages: m.lib.messages.filter((msg) => msg.id !== msgId) } } : m);
    } else {
      setModal((m) => m ? {
        ...m, lib: { ...m.lib, messages: m.lib.messages.map((msg) => msg.id === msgId ? { ...msg, text: editingMsgText } : msg) },
      } : m);
    }
    setEditingMsgKey(null);
  };

  const modalDeleteMsg = (msgId: string) => {
    setModal((m) => m ? { ...m, lib: { ...m.lib, messages: m.lib.messages.filter((msg) => msg.id !== msgId) } } : m);
    if (editingMsgKey === msgId) setEditingMsgKey(null);
  };

  // ── Delete from list ───────────────────────────────────────────────────────
  const deleteLibrary = (id: string) => persistAndSet(libraries.filter((l) => l.id !== id));
  const deleteAllCustom = () => persistAndSet(libraries.filter((l) => l.isDefault));

  const usePrompt = (text: string) => {
    localStorage.setItem('proji_pending_prompt', text);
    router.push('/chat');
  };

  const c = modal ? getColors(modal.lib.id) : CUSTOM_COLORS;

  return (
    <div className="flex flex-col h-full bg-[#f5f7fc] overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-4 px-8 pt-7 pb-4 border-b border-slate-200 bg-white shrink-0">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-0.5">AI Tools</p>
          <h1 className="text-xl font-black text-slate-800 tracking-tight">Prompts Library</h1>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {customCount > 0 && (
            <button onClick={deleteAllCustom} className="flex items-center gap-1.5 px-3 py-2 text-xs text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors font-medium">
              <Trash2 size={12} /> Удалить все свои
            </button>
          )}
          <motion.button
            onClick={openCreate}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              atLimit ? 'bg-yellow-400 text-yellow-900 hover:bg-yellow-300' : 'bg-slate-800 text-white hover:bg-slate-700'
            }`}
          >
            {atLimit && <Crown size={11} className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-yellow-600" />}
            <Plus size={13} />
            {atLimit ? 'Докупить места →' : 'Создать библиотеку'}
          </motion.button>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="grid grid-cols-3 gap-6 items-start">
          {libraries.map((lib, i) => {
            const lc = getColors(lib.id);
            return (
              <motion.div
                key={lib.id} layout
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                onClick={() => openEdit(lib)}
                className="group rounded-2xl border border-slate-200 overflow-hidden shadow-sm bg-white cursor-pointer hover:shadow-md hover:-translate-y-1 transition-all"
              >
                <div className={`h-1.5 w-full ${lc.stripe}`} />
                <div className="px-5 py-4 flex items-center gap-3">
                  <span className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${lc.icon}`}>
                    <IconEl icon={lib.icon} size={16} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-slate-800 truncate">{lib.name || 'Без названия'}</p>
                    <p className="text-[11px] text-slate-400">{lib.messages.length} промтов</p>
                  </div>
                  {lib.isDefault && <span className="text-[9px] uppercase font-bold tracking-widest text-slate-400 shrink-0">default</span>}
                </div>
                <div className="px-5 py-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-400 italic line-clamp-1 flex-1">{lib.description || 'Нет описания'}</span>
                  {!lib.isDefault && (
                    <button onClick={(e) => { e.stopPropagation(); deleteLibrary(lib.id); }} className="shrink-0 p-1 text-slate-300 hover:text-red-400 transition-colors">
                      <Trash2 size={11} />
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Create / Edit Modal */}
      <AnimatePresence>
        {modal && (
          <motion.div
            key="lib-modal"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={closeModal}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 16 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[88vh] flex flex-col overflow-hidden"
            >
              {/* Modal header */}
              <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 shrink-0">
                <span className={`w-8 h-8 rounded-xl flex items-center justify-center ${c.icon}`}>
                  <IconEl icon={modal.lib.icon} size={15} />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">
                    {modal.isNew ? 'Новая библиотека' : (modal.lib.isDefault ? 'Default библиотека' : 'Редактировать')}
                  </p>
                  <p className="text-sm font-black text-slate-700 truncate">{modal.lib.name || '—'}</p>
                </div>
                <button onClick={saveModal} className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 text-white text-xs font-bold rounded-xl hover:bg-slate-700 transition-colors">
                  <Save size={13} /> Сохранить
                </button>
                <button onClick={closeModal} className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
                  <X size={16} />
                </button>
              </div>

              {/* Name + description fields (only for custom) */}
              {!modal.lib.isDefault && (
                <div className="px-6 pt-4 pb-3 border-b border-slate-100 shrink-0 space-y-3">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Название</label>
                    <input
                      ref={nameRef}
                      value={modal.lib.name}
                      onChange={(e) => setModal((m) => m ? { ...m, lib: { ...m.lib, name: e.target.value } } : m)}
                      placeholder="Например: Sales Scripts"
                      className="w-full px-3 py-2.5 text-sm font-semibold text-slate-800 border border-slate-200 rounded-xl outline-none focus:border-slate-400 bg-slate-50 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Описание</label>
                    <input
                      value={modal.lib.description}
                      onChange={(e) => setModal((m) => m ? { ...m, lib: { ...m.lib, description: e.target.value } } : m)}
                      placeholder="Кратко о содержимом библиотеки..."
                      className="w-full px-3 py-2.5 text-sm text-slate-600 border border-slate-200 rounded-xl outline-none focus:border-slate-400 bg-slate-50 transition-colors"
                    />
                  </div>
                </div>
              )}

              {/* Description edit for default (read-only name, editable description) */}
              {modal.lib.isDefault && (
                <div className="px-6 pt-4 pb-3 border-b border-slate-100 shrink-0">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Описание</label>
                  <input
                    value={modal.lib.description}
                    onChange={(e) => setModal((m) => m ? { ...m, lib: { ...m.lib, description: e.target.value } } : m)}
                    className="w-full px-3 py-2.5 text-sm text-slate-600 border border-slate-200 rounded-xl outline-none focus:border-slate-400 bg-slate-50 transition-colors"
                  />
                </div>
              )}

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-2">
                {modal.lib.messages.map((msg) => {
                  const isEditing = editingMsgKey === msg.id;
                  if (!isEditing && !msg.text) return null;
                  return (
                    <motion.div key={msg.id} layout className="group relative">
                      {isEditing ? (
                        <div className="rounded-xl border border-slate-300 p-3 bg-white shadow-sm">
                          <textarea
                            autoFocus
                            value={editingMsgText}
                            onChange={(e) => setEditingMsgText(e.target.value)}
                            placeholder="Текст промта..."
                            className="w-full text-sm text-slate-700 bg-transparent outline-none resize-none leading-relaxed"
                            rows={3}
                          />
                          <div className="flex justify-end gap-1 mt-2">
                            <button onClick={() => modalSaveMsg(msg.id)} className="p-1 text-green-500 hover:text-green-700"><Check size={13} /></button>
                            <button onClick={() => { setEditingMsgKey(null); if (!msg.text) modalDeleteMsg(msg.id); }} className="p-1 text-slate-400 hover:text-slate-600"><X size={13} /></button>
                          </div>
                        </div>
                      ) : (
                        <div
                          onClick={() => !modal.lib.isDefault ? (setEditingMsgKey(msg.id), setEditingMsgText(msg.text)) : usePrompt(msg.text)}
                          className={`cursor-pointer rounded-xl border px-4 py-3 text-sm text-slate-700 leading-relaxed transition-all hover:shadow-sm ${c.bubble}`}
                        >
                          <div className="flex items-start gap-2.5 pr-20">
                            <MessageCircle size={13} className="shrink-0 mt-0.5 text-slate-400" />
                            <span>{msg.text}</span>
                          </div>
                          <div className="absolute top-2 right-2 hidden group-hover:flex items-center gap-0.5 bg-white/90 rounded-lg p-0.5 shadow-sm">
                            {!modal.lib.isDefault && (
                              <button onClick={(e) => { e.stopPropagation(); setEditingMsgKey(msg.id); setEditingMsgText(msg.text); }} className="p-1.5 text-slate-400 hover:text-slate-700"><Pencil size={11} /></button>
                            )}
                            {!modal.lib.isDefault && (
                              <button onClick={(e) => { e.stopPropagation(); modalDeleteMsg(msg.id); }} className="p-1.5 text-slate-400 hover:text-red-500"><Trash2 size={11} /></button>
                            )}
                            <button onClick={(e) => { e.stopPropagation(); usePrompt(msg.text); }} className="p-1.5 text-slate-400 hover:text-blue-500"><Send size={11} /></button>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  );
                })}

                {!modal.lib.isDefault && (
                  <button onClick={modalAddMsg} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed text-sm transition-colors ${c.addBtn}`}>
                    <Plus size={13} /> Добавить промт
                  </button>
                )}

                {modal.lib.messages.length === 0 && modal.lib.isDefault && (
                  <p className="text-sm text-slate-400 text-center py-10">Промты не найдены</p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-slate-800 text-white text-xs font-medium px-4 py-3 rounded-2xl shadow-xl z-[60]"
          >
            <AlertCircle size={14} className="text-yellow-400" />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
