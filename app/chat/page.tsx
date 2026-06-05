'use client';
import { useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, Sparkles, ChevronRight, Info, CircleCheck } from 'lucide-react';
import { BottomCommandBar } from '../../src/components/unified/BottomCommandBar';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Link from 'next/link';
import { useAppStore } from '../../src/store/useAppStore';
import { useI18n } from '../../src/context/I18nContext';

const SCENARIO_KEYS = ['chat.scenarios.s1', 'chat.scenarios.s2', 'chat.scenarios.s3', 'chat.scenarios.s4', 'chat.scenarios.s5', 'chat.scenarios.s6'] as const;

export default function ChatPage() {
  const { t } = useI18n();
  const {
    allMessages, setAllMessages,
    inputText, setInputText,
    isProcessing, setIsProcessing,
    currentThought, setCurrentThought,
    currentDomain,
    setChatHistory,
    isAiPanelOpen, setIsAiPanelOpen,
  } = useAppStore();

  const scenarioPrompts = useMemo(() => SCENARIO_KEYS.map((key) => t(key)), [t]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [allMessages, currentThought]);

  useEffect(() => {
    const pending = localStorage.getItem('proji_pending_prompt');
    if (pending) {
      setInputText(pending);
      localStorage.removeItem('proji_pending_prompt');
      textareaRef.current?.focus();
    }
  }, [setInputText]);

  const sendMessage = useCallback(async (text?: string) => {
    const messageText = (text ?? inputText).trim();
    if (!messageText || isProcessing) return;

    const userMsg = { id: Date.now().toString(), role: 'user' as const, text: messageText, timestamp: new Date() };
    setAllMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsProcessing(true);
    setCurrentThought(t('chat.thinking'));

    try {
      const history = allMessages.slice(-20).map((m) => ({ role: m.role === 'model' ? 'model' : 'user', text: m.text }));
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageText, history, domain: currentDomain }),
      });
      const data = await res.json();
      const aiText = data.text ?? data.error ?? t('chat.errorResponse');

      const aiMsg = { id: (Date.now() + 1).toString(), role: 'model' as const, text: aiText, timestamp: new Date() };
      setAllMessages((prev) => [...prev, aiMsg]);
      setChatHistory((prev) => {
        const today = new Date().toDateString();
        const existing = prev.find((s) => new Date(s.date).toDateString() === today && s.domain === currentDomain);
        if (existing) {
          return prev.map((s) => s.id === existing.id ? { ...s, messages: [...s.messages, userMsg, aiMsg] } : s);
        }
        return [...prev, { id: Date.now().toString(), date: new Date(), domain: currentDomain, messages: [userMsg, aiMsg] }];
      });
    } catch {
      setAllMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), role: 'model' as const, text: t('chat.errorNetwork'), timestamp: new Date() }]);
    } finally {
      setIsProcessing(false);
      setCurrentThought('');
    }
  }, [inputText, isProcessing, allMessages, currentDomain, setAllMessages, setInputText, setIsProcessing, setCurrentThought, setChatHistory, t]);

  return (
    <div className="flex flex-col h-full relative">
      <button
        type="button"
        onClick={() => setIsAiPanelOpen(!isAiPanelOpen)}
        className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full border border-slate-200 bg-white text-slate-400 hover:text-proji-primary hover:border-proji-primary/40 flex items-center justify-center transition-colors shadow-sm"
        title={t('chat.serviceHelp')}
      >
        <Info size={14} />
      </button>

      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-6">
        {allMessages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center min-h-full gap-8 text-center pt-8 pb-4"
          >
            <div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-3 leading-tight">
                <span className="bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
                  {t('chat.heroTitle1')}
                  <br />
                  {t('chat.heroTitle2')}
                </span>
              </h1>
              <p className="text-proji-secondary text-sm max-w-xs mx-auto leading-relaxed">
                {t('chat.heroSubtitle')}
              </p>
            </div>

            <div className="w-full max-w-lg space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-proji-secondary">
                {t('chat.scenariosTitle')}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {scenarioPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => {
                      setInputText(prompt);
                      textareaRef.current?.focus();
                    }}
                    className="px-3 py-2.5 rounded-xl border border-proji-border bg-white hover:border-proji-primary/30 hover:bg-proji-primary/5 transition-all text-sm text-proji-dark hover:text-proji-primary font-medium"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>

            <Link
              href="/scenarios"
              className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-proji-border bg-white hover:border-proji-primary/30 hover:bg-proji-primary/5 transition-all text-sm text-proji-dark hover:text-proji-primary"
            >
              <CircleCheck size={15} className="text-proji-primary" />
              <span>{t('chat.scenariosLibrary')}</span>
              <ChevronRight size={14} />
            </Link>
          </motion.div>
        )}

        <AnimatePresence initial={false}>
          {allMessages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'model' && (
                <div className="w-7 h-7 rounded-xl bg-proji-primary/10 flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                  <Sparkles size={13} className="text-proji-primary" />
                </div>
              )}
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-proji-primary text-white rounded-tr-sm'
                    : 'bg-white border border-proji-border text-proji-dark rounded-tl-sm'
                }`}
              >
                {msg.role === 'model' ? (
                  <div className="prose prose-sm max-w-none prose-headings:text-proji-dark prose-p:text-proji-dark prose-li:text-proji-dark prose-strong:text-proji-dark">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
                  </div>
                ) : (
                  <p>{msg.text}</p>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isProcessing && currentThought && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="w-7 h-7 rounded-xl bg-proji-primary/10 flex items-center justify-center mr-3 mt-1 flex-shrink-0">
              <Sparkles size={13} className="text-proji-primary" />
            </div>
            <div className="bg-white border border-proji-border rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2">
              <Loader2 size={14} className="text-proji-primary animate-spin" />
              <span className="text-xs text-proji-secondary">{currentThought}</span>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="px-4 md:px-8 py-4 border-t border-proji-border bg-proji-bg">
        <div className="max-w-3xl mx-auto">
          <BottomCommandBar
            value={inputText}
            onChange={setInputText}
            onSend={(message) => void sendMessage(message)}
            placeholder={t('chat.inputPlaceholder')}
            isSending={isProcessing}
            inputRef={textareaRef}
          />
        </div>
      </div>
    </div>
  );
}
