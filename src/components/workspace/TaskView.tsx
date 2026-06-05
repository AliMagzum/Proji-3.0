'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import {
  LayoutDashboard,
  Table,
  Calendar as CalendarIcon,
  History,
  MessageSquare,
  Filter,
} from 'lucide-react';
import { getOrganization, getWorkspaceId, isApiOrganization } from '../../lib/organization';
import {
  loadWorkspaceTasks,
  saveWorkspaceTasks,
  persistWorkspaceTaskMove,
  persistNewWorkspaceTask,
  persistWorkspaceTaskUpdate,
} from '../../lib/workspace-tasks';
import type { KanbanStatus, WorkspaceTask } from '../../types/workspace';
import { mergeLocalExtras } from '../../lib/task-extras-client';
import { persistWorkspaceTaskDelete } from '../../lib/workspace-tasks';
import { KanbanBoard } from './KanbanBoard';
import { TeamChat } from './TeamChat';
import { TaskDetailModal } from './TaskDetailModal';
import { useI18n } from '../../context/I18nContext';

type ViewId = 'kanban' | 'list' | 'calendar' | 'history' | 'chat';

export function TaskView() {
  const { t } = useI18n();
  const { data: session } = useSession();
  const org = getOrganization();
  const workspaceId = getWorkspaceId(org);
  const email = session?.user?.email ?? '';
  const apiMode = isApiOrganization(org);

  const VIEWS: { id: ViewId; labelKey: string; icon: React.ComponentType<{ size?: number }> }[] = [
    { id: 'kanban', labelKey: 'tasks.views.kanban', icon: LayoutDashboard },
    { id: 'list', labelKey: 'tasks.views.list', icon: Table },
    { id: 'calendar', labelKey: 'tasks.views.calendar', icon: CalendarIcon },
    { id: 'history', labelKey: 'tasks.views.history', icon: History },
    { id: 'chat', labelKey: 'tasks.views.chat', icon: MessageSquare },
  ];

  const [tasks, setTasks] = useState<WorkspaceTask[]>([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [tasksError, setTasksError] = useState('');
  const [view, setView] = useState<ViewId>('kanban');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');
  const [showFilter, setShowFilter] = useState(false);
  const [chatTaskId, setChatTaskId] = useState<string>('');
  const [selectedTask, setSelectedTask] = useState<WorkspaceTask | null>(null);
  const [openToChatTab, setOpenToChatTab] = useState(false);

  useEffect(() => {
    if (!workspaceId) return;
    let cancelled = false;
    setTasksLoading(true);
    setTasksError('');
    loadWorkspaceTasks(workspaceId)
      .then((list) => {
        if (!cancelled) setTasks(list);
      })
      .catch((e) => {
        if (!cancelled) setTasksError(e instanceof Error ? e.message : t('common.error'));
      })
      .finally(() => {
        if (!cancelled) setTasksLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [workspaceId, t]);

  const persist = (next: WorkspaceTask[]) => {
    setTasks(next);
    if (workspaceId && !apiMode) saveWorkspaceTasks(workspaceId, next);
  };

  const members = useMemo(() => {
    const map = new Map<string, string>();
    for (const task of tasks) {
      if (task.assigneeEmail) map.set(task.assigneeEmail, task.assigneeName);
    }
    return Array.from(map.entries()).map(([memberEmail, name]) => ({ email: memberEmail, name }));
  }, [tasks]);

  const filtered = useMemo(() => {
    return tasks.filter((task) => {
      if (assigneeFilter !== 'all' && task.assigneeEmail !== assigneeFilter) return false;
      return true;
    });
  }, [tasks, assigneeFilter]);

  const syncSelected = (next: WorkspaceTask) => {
    if (selectedTask?.id === next.id) setSelectedTask(next);
  };

  const updateTask = async (id: string, patch: Partial<WorkspaceTask>) => {
    const optimistic = tasks.map((task) =>
      task.id === id ? { ...task, ...patch, updatedAt: new Date().toISOString() } : task,
    );
    persist(optimistic);
    const updatedLocal = optimistic.find((t) => t.id === id);
    if (updatedLocal) syncSelected(updatedLocal);

    if (workspaceId) {
      const extras: Parameters<typeof mergeLocalExtras>[2] = {};
      if (patch.checklist !== undefined) extras.checklist = patch.checklist;
      if (patch.attachments !== undefined) extras.attachments = patch.attachments;
      if (patch.history !== undefined) extras.history = patch.history;
      if (patch.appliedFrameworks !== undefined) extras.appliedFrameworks = patch.appliedFrameworks;
      if (Object.keys(extras).length > 0) mergeLocalExtras(workspaceId, id, extras);
    }

    if (apiMode && patch.status) {
      try {
        const moved = await persistWorkspaceTaskMove(id, patch.status);
        const merged = {
          ...moved,
          ...updatedLocal,
          ...patch,
          checklist: updatedLocal?.checklist ?? moved.checklist,
          attachments: updatedLocal?.attachments ?? moved.attachments,
          history: updatedLocal?.history ?? moved.history,
          appliedFrameworks: updatedLocal?.appliedFrameworks ?? moved.appliedFrameworks,
        };
        setTasks((prev) => prev.map((t) => (t.id === id ? merged : t)));
        syncSelected(merged);
      } catch (e) {
        setTasksError(e instanceof Error ? e.message : t('common.error'));
      }
      return;
    }
    if (apiMode) {
      try {
        const updated = await persistWorkspaceTaskUpdate(id, patch, workspaceId);
        if (updated) {
          const merged = { ...updated, checklist: patch.checklist ?? updated.checklist, attachments: patch.attachments ?? updated.attachments, history: patch.history ?? updated.history, appliedFrameworks: patch.appliedFrameworks ?? updated.appliedFrameworks };
          setTasks((prev) => prev.map((t) => (t.id === id ? merged : t)));
          syncSelected(merged);
        }
      } catch (e) {
        setTasksError(e instanceof Error ? e.message : t('common.error'));
      }
    }
  };

  const deleteTask = async (id: string) => {
    try {
      if (workspaceId) await persistWorkspaceTaskDelete(id, workspaceId);
      setTasks((prev) => prev.filter((t) => t.id !== id));
      setSelectedTask(null);
    } catch (e) {
      setTasksError(e instanceof Error ? e.message : t('common.error'));
    }
  };

  const addInColumn = async (status: KanbanStatus) => {
    if (apiMode) {
      try {
        const task = await persistNewWorkspaceTask(status, {
          title: t('tasks.newTask'),
          assigneeName: session?.user?.name ?? t('common.me'),
          assigneeEmail: email,
          priority: 'Medium',
          sp: 3,
          category: t('tasks.categoryGeneral'),
        });
        setTasks((prev) => [task, ...prev]);
      } catch (e) {
        setTasksError(e instanceof Error ? e.message : t('common.error'));
      }
      return;
    }
    const task: WorkspaceTask = {
      id: `task_${Date.now()}`,
      title: t('tasks.newTask'),
      status,
      priority: 'Medium',
      sp: 3,
      assigneeName: session?.user?.name ?? t('common.me'),
      assigneeEmail: email,
      assignee: '',
      createdAt: new Date().toISOString(),
      category: t('tasks.categoryGeneral'),
    };
    persist([task, ...tasks]);
  };

  const chatTask = chatTaskId ? tasks.find((task) => task.id === chatTaskId) : null;

  if (!workspaceId) {
    return (
      <div className="p-8 text-center text-slate-500">
        {t('tasks.needOrg')}
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col px-4 md:px-6 pb-28">
      <div className="flex items-center gap-2 mb-4 shrink-0">
        <div className="flex gap-1 bg-slate-100/50 p-1 rounded-xl flex-1 overflow-x-auto no-scrollbar">
          {VIEWS.map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => setView(v.id)}
              className={`flex items-center gap-2 px-3 md:px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-all ${
                view === v.id
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
              }`}
            >
              <v.icon size={16} />
              {t(v.labelKey)}
            </button>
          ))}
        </div>

        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setShowFilter((s) => !s)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Filter size={16} />
            <span className="hidden sm:inline">
              {assigneeFilter === 'all'
                ? t('tasks.filterAll')
                : members.find((m) => m.email === assigneeFilter)?.name ?? t('common.filter')}
            </span>
          </button>
          {showFilter && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-2 max-h-64 overflow-y-auto">
              <button
                type="button"
                onClick={() => {
                  setAssigneeFilter('all');
                  setShowFilter(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
                  assigneeFilter === 'all' ? 'bg-slate-100 font-bold' : 'hover:bg-slate-50'
                }`}
              >
                {t('tasks.filterAll')}
              </button>
              {members.map((m) => (
                <button
                  key={m.email}
                  type="button"
                  onClick={() => {
                    setAssigneeFilter(m.email);
                    setShowFilter(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
                    assigneeFilter === m.email ? 'bg-slate-100 font-bold' : 'hover:bg-slate-50'
                  }`}
                >
                  <span className="block font-semibold">{m.name}</span>
                  <span className="text-[10px] text-slate-400">{m.email}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {tasksError && (
        <p className="text-sm text-red-600 mb-2 px-1">{tasksError}</p>
      )}

      <div className="flex-1 min-h-0 overflow-hidden">
        {tasksLoading && (
          <div className="flex items-center justify-center h-48 text-slate-400 text-sm">
            {t('common.loading')}
          </div>
        )}
        {!tasksLoading && view === 'kanban' && (
          <KanbanBoard
            tasks={filtered}
            onUpdateTask={updateTask}
            onAddInColumn={addInColumn}
            onOpenTask={(task) => {
              setOpenToChatTab(false);
              setSelectedTask(task);
            }}
            onOpenTaskChat={(task) => {
              setOpenToChatTab(true);
              setSelectedTask(task);
            }}
          />
        )}

        {!tasksLoading && view === 'list' && (
          <div className="max-w-3xl mx-auto space-y-2 overflow-y-auto h-full pb-4">
            {filtered.map((task) => (
              <div
                key={task.id}
                role="button"
                tabIndex={0}
                onClick={() => {
                  setOpenToChatTab(false);
                  setSelectedTask(task);
                }}
                onKeyDown={(e) => e.key === 'Enter' && setSelectedTask(task)}
                className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3 cursor-pointer hover:border-proji-primary/30"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800 truncate">{task.title}</p>
                  <p className="text-xs text-slate-400">{task.status}</p>
                </div>
                <span className="text-xs font-bold text-slate-500">{task.assigneeName}</span>
              </div>
            ))}
          </div>
        )}

        {!tasksLoading && (view === 'calendar' || view === 'history') && (
          <div className="flex items-center justify-center h-48 text-slate-400 text-sm">
            {t('common.comingSoon')}
          </div>
        )}

        {!tasksLoading && view === 'chat' && (
          <div className="max-w-2xl mx-auto w-full h-full flex flex-col gap-3">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">
              {t('tasks.chat.label')}
            </label>
            <select
              value={chatTaskId}
              onChange={(e) => setChatTaskId(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-800 outline-none focus:border-proji-primary"
            >
              <option value="">{t('tasks.chat.teamGeneral')}</option>
              {tasks.map((task) => (
                <option key={task.id} value={task.id}>
                  {task.title}
                </option>
              ))}
            </select>
            <TeamChat
              workspaceId={workspaceId}
              taskId={chatTaskId || null}
              taskTitle={chatTask?.title}
              currentUserEmail={email}
              className="flex-1"
            />
          </div>
        )}
      </div>

      {selectedTask && workspaceId && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => {
            setSelectedTask(null);
            setOpenToChatTab(false);
          }}
          onUpdateTask={updateTask}
          onDeleteTask={deleteTask}
          workspaceId={workspaceId}
          currentUserEmail={email}
          currentUserName={session?.user?.name ?? t('common.me')}
          workspaceMembers={
            members.length > 0
              ? members
              : [{ name: session?.user?.name ?? t('common.me'), email: email || 'me@local' }]
          }
          workspaceOptions={[{ id: 'general', name: t('tasks.categoryGeneral') }]}
          openToChatTab={openToChatTab}
        />
      )}
    </div>
  );
}
