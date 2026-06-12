'use client';
import { useState, useRef, useEffect } from 'react';
import { useModalClose } from '../hooks/useModalClose';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Send, Loader2, History, Zap, ChevronRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAppStore } from '../store/useAppStore';
import { usePathname } from 'next/navigation';

const PATH_ACTIONS: Record<string, string[]> = {
  '/board': ['Найти заторы', 'Прогноз спринта', 'Оптимизировать'],
  '/documents': ['Анализ рисков', 'Рекомендации', 'Резюме'],
  '/analytics': ['Deep Drill', 'Прогноз Q3', 'Экспорт'],
  '/chat': ['Ключевые инсайты', 'Резюме сессии'],
  '/projects': ['Статус проектов', 'Риски', 'Дедлайны'],
  '/team': ['Загрузка команды', 'KPI сотрудников'],
};

export function ContextSidebar() {
  const pathname = usePathname();
  const {
    isAiPanelOpen, setIsAiPanelOpen,
    currentDomain, isProcessing, setIsProcessing,
    chatHistory,
  } = useAppStore();

  const [messages, setMessages] = useState<{ role: 'user' | 'model'; text: string }[]>([]);
  const [input, setInput] = useState('');
  const [tab, setTab] = useState<'chat' | 'history'>('chat');
  const [thought, setThought] = useState('');

  useModalClose(() => setIsAiPanelOpen(false), isAiPanelOpen);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isAiPanelOpen) {
      const t = setTimeout(() => inputRef.current?.focus(), 120);
      return () => clearTimeout(t);
    }
  }, [isAiPanelOpen]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, thought]);

  const actions = PATH_ACTIONS[pathname] ?? [];

  const send = async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || isProcessing) return;
    setInput('');
    setMessages((p) => [...p, { role: 'user', text: msg }]);
    setIsProcessing(true);
    setThought('Анализирую...');
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: msg,
          history: messages.slice(-10).map((m) => ({ role: m.role === 'model' ? 'assistant' : m.role, text: m.text })),
          domain: currentDomain,
        }),
      });
      const data = await res.json();
      setMessages((p) => [...p, { role: 'model', text: data.text ?? 'Ошибка' }]);
    } catch {
      setMessages((p) => [...p, { role: 'model', text: 'Ошибка соединения.' }]);
    } finally {
      setIsProcessing(false);
      setThought('');
    }
  };

  return (
    <AnimatePresence>
      {isAiPanelOpen && (
        <>
        {/* Backdrop on mobile */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="sm:hidden fixed inset-0 bg-black/30 z-[149]"
          onClick={() => setIsAiPanelOpen(false)}
        />

        <motion.aside
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-0 sm:top-0 right-0 h-[90dvh] sm:h-full w-full sm:w-80 bg-white sm:border-l border-slate-200 rounded-t-3xl sm:rounded-none shadow-2xl z-[150] flex flex-col"
        >
          {/* Mobile drag indicator */}
          <div className="sm:hidden flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-slate-200" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-proji-primary/10 flex items-center justify-center">
                <Sparkles size={14} className="text-proji-primary" />
              </div>
              <div>
                <p className="text-xs font-black text-slate-800">Proji AI</p>
                <p className="text-[9px] text-slate-400 uppercase tracking-widest">{currentDomain}</p>
              </div>
            </div>
            <button onClick={() => setIsAiPanelOpen(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
              <X size={16} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-slate-100">
            {(['chat', 'history'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-2 text-[10px] font-black uppercase tracking-wider transition-colors ${tab === t ? 'text-proji-primary border-b-2 border-proji-primary' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {t === 'chat' ? 'Чат' : 'История'}
              </button>
            ))}
          </div>

          {/* Chat tab */}
          {tab === 'chat' && (
            <>
              <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
                {/* Quick actions */}
                {actions.length > 0 && messages.length === 0 && (
                  <div className="space-y-2">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Быстрые действия</p>
                    {actions.map((a) => (
                      <button
                        key={a}
                        onClick={() => send(a)}
                        className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-slate-50 hover:bg-proji-primary/5 hover:text-proji-primary text-slate-600 text-xs font-semibold transition-all group"
                      >
                        {a}
                        <ChevronRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    ))}
                  </div>
                )}

                {messages.length === 0 && actions.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-32 text-center">
                    <Zap size={24} className="text-slate-200 mb-2" />
                    <p className="text-xs text-slate-400">Задайте вопрос по текущей странице</p>
                  </div>
                )}

                {/* Messages */}
                {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${
                      m.role === 'user'
                        ? 'bg-proji-primary text-white rounded-tr-sm'
                        : 'bg-slate-50 border border-slate-100 text-slate-700 rounded-tl-sm'
                    }`}>
                      {m.role === 'model' ? (
                        <div className="prose prose-xs max-w-none prose-p:text-slate-700 prose-headings:text-slate-800">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.text}</ReactMarkdown>
                        </div>
                      ) : m.text}
                    </div>
                  </div>
                ))}

                {isProcessing && thought && (
                  <div className="flex justify-start">
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl rounded-tl-sm px-3 py-2 flex items-center gap-2">
                      <Loader2 size={11} className="text-proji-primary animate-spin" />
                      <span className="text-[11px] text-slate-400">{thought}</span>
                    </div>
                  </div>
                )}
                <div ref={endRef} />
              </div>

              {/* Input */}
              <div className="p-3 border-t border-slate-100">
                <div className="flex items-end gap-2">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => { setInput(e.target.value); e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'; }}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
                    placeholder="Спросить про эту страницу..."
                    rows={1}
                    className="flex-1 min-w-0 resize-none bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-proji-primary transition-colors"
                    style={{ minHeight: 38 }}
                  />
                  <button
                    onClick={() => send()}
                    disabled={!input.trim() || isProcessing}
                    className="flex-shrink-0 w-9 h-9 rounded-xl bg-proji-primary text-white flex items-center justify-center hover:bg-proji-primary/90 disabled:opacity-40 transition-all"
                  >
                    {isProcessing ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                  </button>
                </div>
              </div>
            </>
          )}

          {/* History tab */}
          {tab === 'history' && (
            <div className="flex-1 overflow-y-auto px-3 py-4">
              {chatHistory.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-center">
                  <History size={24} className="text-slate-200 mb-2" />
                  <p className="text-xs text-slate-400">История пуста</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {chatHistory.slice().reverse().map((session) => {
                    const first = session.messages.find((m) => m.role === 'user');
                    return (
                      <button
                        key={session.id}
                        onClick={() => { setMessages(session.messages.map((m) => ({ role: m.role, text: m.text }))); setTab('chat'); }}
                        className="w-full text-left p-3 rounded-xl bg-slate-50 hover:bg-proji-primary/5 hover:border-proji-primary/20 border border-transparent transition-all"
                      >
                        <p className="text-[9px] text-slate-400 uppercase tracking-wide mb-1">{session.domain} · {new Date(session.date).toLocaleDateString('ru')}</p>
                        <p className="text-xs font-semibold text-slate-700 truncate">{first?.text ?? 'Сессия'}</p>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
