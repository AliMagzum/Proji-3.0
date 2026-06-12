'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Send, Loader2 } from 'lucide-react';
import type { TaskChatMessage } from '../../types/workspace';
import { useI18n } from '../../context/I18nContext';
import { isTokensApiClientEnabled } from '../../lib/tokens-api/config';

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return `${parts[0]![0]}${parts[1]![0]}`.toUpperCase();
  return name.slice(0, 1).toUpperCase();
}

export function TeamChat({
  workspaceId,
  taskId = null,
  taskTitle,
  currentUserEmail,
  className = '',
  variant = 'default',
}: {
  workspaceId?: string | null;
  taskId?: string | null;
  taskTitle?: string;
  currentUserEmail?: string | null;
  className?: string;
  variant?: 'default' | 'telegram';
}) {
  const { t, locale } = useI18n();
  const [messages, setMessages] = useState<TaskChatMessage[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const nearBottomRef = useRef(true);

  const dateLocale = locale === 'kz' ? 'kk-KZ' : locale === 'en' ? 'en-US' : 'ru-RU';

  const formatDayLabel = (iso: string) =>
    new Date(iso).toLocaleDateString(dateLocale, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

  const messagesApiPath = useCallback(() => {
    if (!workspaceId) return null;
    if (isTokensApiClientEnabled()) {
      const q = new URLSearchParams();
      if (taskId) q.set('task_id', taskId);
      const qs = q.toString();
      return `/api/tokens/workspace/${workspaceId}/messages${qs ? `?${qs}` : ''}`;
    }
    const q = new URLSearchParams({ workspace_id: workspaceId });
    if (taskId) q.set('task_id', taskId);
    return `/api/task-chat?${q}`;
  }, [workspaceId, taskId]);

  const load = useCallback(async () => {
    const path = messagesApiPath();
    if (!path) return;
    setLoading(true);
    try {
      const res = await fetch(path);
      if (!res.ok) return;
      const data = await res.json();
      setMessages(data.messages ?? []);
    } finally {
      setLoading(false);
    }
  }, [messagesApiPath]);

  useEffect(() => {
    load();
    const id = setInterval(load, 4000);
    return () => clearInterval(id);
  }, [load]);

  useEffect(() => {
    const el = listRef.current;
    if (!el || !nearBottomRef.current) return;
    el.scrollTop = el.scrollHeight;
  }, [messages]);

  const onScroll = () => {
    const el = listRef.current;
    if (!el) return;
    nearBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  };

  const send = async () => {
    if (!workspaceId || !text.trim() || sending) return;
    setSending(true);
    try {
      const path = isTokensApiClientEnabled()
        ? `/api/tokens/workspace/${workspaceId}/messages`
        : '/api/task-chat';
      const body = isTokensApiClientEnabled()
        ? { text: text.trim(), task_id: taskId ?? null }
        : { workspace_id: workspaceId, task_id: taskId, text: text.trim() };
      const res = await fetch(path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) return;
      const data = await res.json();
      setMessages((prev) => [...prev, data.message]);
      setText('');
      nearBottomRef.current = true;
    } finally {
      setSending(false);
    }
  };

  if (!workspaceId) {
    return (
      <div className={`flex items-center justify-center h-48 text-sm text-slate-500 ${className}`}>
        {t('teamChat.pickTeam')}
      </div>
    );
  }

  let lastDay = '';

  const isTelegram = variant === 'telegram';

  return (
    <div
      className={`flex flex-col overflow-hidden ${
        isTelegram
          ? 'bg-[#f0f4f8] min-h-0 h-full'
          : 'bg-slate-50 rounded-xl border border-slate-200 min-h-[420px]'
      } ${className}`}
    >
      {taskTitle && !isTelegram && (
        <div className="px-4 py-2 border-b border-slate-200 bg-white text-xs font-bold text-slate-600">
          {t('teamChat.chatTask').replace('{title}', taskTitle)}
        </div>
      )}

      <div
        ref={listRef}
        onScroll={onScroll}
        className={`flex-1 overflow-y-auto p-3 md:p-4 space-y-3 min-h-0 ${
          isTelegram ? '' : 'min-h-[280px] max-h-[min(60vh,520px)]'
        }`}
      >
        {loading && messages.length === 0 && (
          <div className="flex justify-center py-8">
            <Loader2 className="animate-spin text-slate-400" size={20} />
          </div>
        )}

        {messages.map((msg) => {
          const day = formatDayLabel(msg.created_at);
          const showDay = day !== lastDay;
          lastDay = day;
          const me =
            currentUserEmail &&
            msg.user_email.toLowerCase() === currentUserEmail.toLowerCase();

          return (
            <div key={msg.id}>
              {showDay && (
                <p className="text-center text-[11px] text-slate-400 font-medium my-3 px-3 py-1 bg-white/80 rounded-full w-fit mx-auto border border-slate-100">
                  {day}
                </p>
              )}
              <div className={`flex gap-2 ${me ? 'flex-row-reverse' : ''}`}>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${
                    me ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {initials(msg.user_name)}
                </div>
                <div className={`max-w-[75%] ${me ? 'items-end' : ''}`}>
                  <p className="text-[10px] text-slate-500 mb-1 font-medium px-1">
                    {msg.user_name}
                  </p>
                  <div
                    className={`px-3 py-2 text-sm leading-relaxed ${
                      isTelegram
                        ? me
                          ? 'bg-proji-primary text-white rounded-2xl rounded-br-sm shadow-sm'
                          : 'bg-white text-slate-800 rounded-2xl rounded-bl-sm shadow-sm border border-slate-100'
                        : me
                          ? 'bg-blue-50 border-blue-100 text-slate-800 rounded-2xl rounded-br-md border'
                          : 'bg-white border-slate-200 text-slate-800 rounded-2xl rounded-bl-md border'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className={`p-2 md:p-3 shrink-0 ${isTelegram ? 'bg-white border-t border-proji-border' : 'border-t border-slate-200 bg-white'}`}>
        <div className={`flex items-center gap-2 rounded-full pl-4 pr-1 py-1 ${
          isTelegram ? 'bg-[#f0f4f8] border border-proji-border' : 'border border-slate-200 bg-slate-50'
        }`}>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder={t('teamChat.placeholder')}
            className="flex-1 bg-transparent text-sm outline-none text-slate-800 placeholder:text-slate-400 min-w-0"
            disabled={sending}
          />
          <button
            type="button"
            onClick={send}
            disabled={sending || !text.trim()}
            className="w-9 h-9 rounded-full bg-proji-primary text-white flex items-center justify-center disabled:opacity-40 shrink-0 hover:bg-proji-primary/90 transition-colors"
          >
            {sending ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Send size={16} />
            )}
          </button>
        </div>
        {sending && (
          <p className="text-[10px] text-slate-400 mt-1.5 text-center">{t('teamChat.sending')}</p>
        )}
      </div>
    </div>
  );
}
