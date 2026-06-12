'use client';

import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, Hash, CheckSquare, MessageCircle, Users } from 'lucide-react';
import { TeamChat } from '../workspace/TeamChat';
import { loadWorkspaceTasks } from '../../lib/workspace-tasks';
import { getOrganization, getWorkspaceId } from '../../lib/organization';
import type { WorkspaceTask } from '../../types/workspace';
import { useI18n } from '../../context/I18nContext';

type StreamId = 'general' | 'tasks' | 'clients';

interface Thread {
  id: string;
  title: string;
  subtitle?: string;
  taskId: string | null;
}

interface MessagesLayoutProps {
  workspaceId?: string | null;
  currentUserEmail?: string | null;
}

export function MessagesLayout({ workspaceId, currentUserEmail }: MessagesLayoutProps) {
  const { t } = useI18n();
  const org = getOrganization();
  const wsId = workspaceId ?? getWorkspaceId(org);

  const [stream, setStream] = useState<StreamId>('general');
  const [threadId, setThreadId] = useState('general');
  const [tasks, setTasks] = useState<WorkspaceTask[]>([]);
  const [mobilePane, setMobilePane] = useState<'threads' | 'chat'>('threads');

  useEffect(() => {
    if (!wsId) return;
    loadWorkspaceTasks(wsId).then(setTasks).catch(() => setTasks([]));
  }, [wsId]);

  const streams: { id: StreamId; label: string; icon: typeof Hash; soon?: boolean }[] = [
    { id: 'general', label: t('messages.streams.general'), icon: Hash },
    { id: 'tasks', label: t('messages.streams.tasks'), icon: CheckSquare },
    { id: 'clients', label: t('messages.streams.clients'), icon: MessageCircle, soon: true },
  ];

  const threads = useMemo((): Thread[] => {
    if (stream === 'general') {
      return [{ id: 'general', title: t('messages.threads.general'), taskId: null }];
    }
    if (stream === 'tasks') {
      const list = tasks.map((task) => ({
        id: task.id,
        title: task.title,
        subtitle: task.assigneeName || task.status,
        taskId: task.id,
      }));
      return list.length > 0
        ? list
        : [{ id: 'empty', title: t('messages.threads.noTasks'), taskId: null }];
    }
    return [{ id: 'wazzup', title: t('messages.threads.wazzupSoon'), subtitle: 'Wazzup', taskId: null }];
  }, [stream, tasks, t]);

  const activeThread = threads.find((th) => th.id === threadId) ?? threads[0]!;

  useEffect(() => {
    if (!threads.some((th) => th.id === threadId)) {
      setThreadId(threads[0]?.id ?? 'general');
    }
  }, [threads, threadId]);

  const openChat = (id: string) => {
    setThreadId(id);
    setMobilePane('chat');
  };

  const initials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return `${parts[0]![0]}${parts[1]![0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  if (!wsId) {
    return (
      <div className="flex items-center justify-center h-64 text-sm text-slate-500">
        {t('teamChat.pickTeam')}
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100dvh-7rem)] md:h-[calc(100dvh-5.5rem)] -mx-4 md:-mx-8 border-t md:border border-proji-border md:rounded-2xl overflow-hidden bg-white">
      {/* Streams — desktop only */}
      <aside className="hidden lg:flex flex-col w-52 shrink-0 border-r border-proji-border bg-proji-bg">
        <div className="px-3 py-3 border-b border-proji-border">
          <p className="text-[10px] font-black uppercase tracking-widest text-proji-secondary">
            {t('messages.streams.title')}
          </p>
        </div>
        <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {streams.map((s) => {
            const Icon = s.icon;
            const active = stream === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  setStream(s.id);
                  setMobilePane('threads');
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  active
                    ? 'bg-proji-primary/10 text-proji-primary'
                    : 'text-proji-dark hover:bg-white'
                }`}
              >
                <Icon size={16} className="shrink-0" />
                <span className="truncate flex-1 text-left">{s.label}</span>
                {s.soon && (
                  <span className="text-[9px] font-bold uppercase text-proji-secondary bg-white px-1.5 py-0.5 rounded">
                    soon
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Threads list — desktop + mobile (telegram chat list) */}
      <aside
        className={`flex flex-col w-full lg:w-72 shrink-0 border-r border-proji-border bg-proji-bg ${
          mobilePane === 'chat' ? 'hidden lg:flex' : 'flex'
        }`}
      >
        {/* Mobile stream chips */}
        <div className="lg:hidden flex gap-1.5 p-2 overflow-x-auto border-b border-proji-border bg-white">
          {streams.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setStream(s.id)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                stream === s.id
                  ? 'bg-proji-primary text-white'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="px-3 py-3 border-b border-proji-border hidden lg:block">
          <p className="text-[10px] font-black uppercase tracking-widest text-proji-secondary">
            {t('messages.threads.title')}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {threads.map((th) => {
            const active = threadId === th.id;
            const disabled = th.id === 'empty' || th.id === 'wazzup';
            return (
              <button
                key={th.id}
                type="button"
                disabled={disabled}
                onClick={() => !disabled && openChat(th.id)}
                className={`w-full flex items-center gap-3 px-3 py-3 text-left transition-colors border-b border-proji-border/50 ${
                  active ? 'bg-white' : 'hover:bg-white/70'
                } ${disabled ? 'opacity-50 cursor-default' : ''}`}
              >
                <div
                  className={`w-11 h-11 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                    th.taskId
                      ? 'bg-proji-primary/15 text-proji-primary'
                      : 'bg-proji-primary text-white'
                  }`}
                >
                  {th.taskId ? initials(th.title) : <Users size={18} />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-proji-dark truncate">{th.title}</p>
                  {th.subtitle && (
                    <p className="text-xs text-proji-secondary truncate">{th.subtitle}</p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </aside>

      {/* Chat pane */}
      <section
        className={`flex flex-col flex-1 min-w-0 min-h-0 bg-white ${
          mobilePane === 'threads' ? 'hidden lg:flex' : 'flex'
        }`}
      >
        {/* Chat header */}
        <div className="flex items-center gap-3 px-3 py-2.5 border-b border-proji-border bg-proji-bg shrink-0">
          <button
            type="button"
            onClick={() => setMobilePane('threads')}
            className="lg:hidden p-2 -ml-1 rounded-full hover:bg-white text-proji-dark"
            aria-label={t('messages.back')}
          >
            <ChevronLeft size={22} />
          </button>
          <div className="w-9 h-9 rounded-full bg-proji-primary/15 text-proji-primary flex items-center justify-center text-xs font-black shrink-0">
            {activeThread.taskId ? initials(activeThread.title) : <Users size={16} />}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-black text-proji-dark truncate">{activeThread.title}</p>
            <p className="text-[11px] text-proji-secondary truncate">
              {stream === 'clients'
                ? t('messages.threads.wazzupSoon')
                : t('messages.threads.subtitle')}
            </p>
          </div>
        </div>

        {stream === 'clients' ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <MessageCircle size={40} className="text-slate-200 mb-3" />
            <p className="text-sm font-bold text-proji-dark mb-1">{t('messages.wazzup.title')}</p>
            <p className="text-xs text-proji-secondary max-w-xs">{t('messages.wazzup.desc')}</p>
          </div>
        ) : (
          <TeamChat
            workspaceId={wsId}
            taskId={activeThread.taskId}
            taskTitle={activeThread.taskId ? activeThread.title : undefined}
            currentUserEmail={currentUserEmail}
            variant="telegram"
            className="flex-1 min-h-0 border-0 rounded-none"
          />
        )}
      </section>
    </div>
  );
}
