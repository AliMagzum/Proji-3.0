import type { KanbanStatus, WorkspaceTask } from '../types/workspace';
import { isTokensApiClientEnabled } from './tokens-api/config';
import { tokensBff } from './tokens-api/client';
import { getOrganization, getWorkspaceId, isApiOrganization } from './organization';
import {
  loadLocalExtras,
  mergeLocalExtras,
  mergeTasksWithExtras,
  saveLocalExtras,
} from './task-extras-client';

const key = (orgId: string) => `proji_workspace_tasks_${orgId}`;

const DEMO: Omit<WorkspaceTask, 'id' | 'createdAt'>[] = [
  {
    title: 'Задачи по proji 2.0',
    status: 'В работе',
    priority: 'High',
    sp: 3,
    assigneeName: 'Али',
    assigneeEmail: 'ali@demo.local',
    assignee: '',
    dueDate: new Date(Date.now() + 86400000 * 90).toISOString(),
    tag: 'общее',
    category: 'Общее',
  },
  {
    title: 'Отчет по маркетингу',
    status: 'К выполнению',
    priority: 'Medium',
    sp: 3,
    assigneeName: 'Anel S',
    assigneeEmail: 'anel@demo.local',
    assignee: '',
    dueDate: new Date(Date.now() - 86400000 * 5).toISOString(),
    tag: 'Проект',
    category: 'Общее',
  },
  {
    title: 'Встреча: Strategy Sync',
    status: 'Готово',
    priority: 'Low',
    sp: 2,
    assigneeName: 'Серик',
    assigneeEmail: 'serik@demo.local',
    assignee: '',
    completedAt: new Date().toISOString(),
    category: 'Общее',
  },
  {
    title: 'Доработать договор аренды',
    status: 'К выполнению',
    priority: 'High',
    sp: 5,
    assigneeName: 'Мария',
    assigneeEmail: 'maria@demo.local',
    assignee: '',
    category: 'Общее',
  },
  {
    title: 'Подготовить форму отчетности KPI',
    status: 'Бэклог',
    priority: 'Medium',
    sp: 3,
    assigneeName: 'Анна',
    assigneeEmail: 'anna@demo.local',
    assignee: '',
    category: 'Общее',
  },
];

function loadLocal(orgId: string): WorkspaceTask[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(key(orgId));
    if (raw) return JSON.parse(raw) as WorkspaceTask[];
  } catch {
    /* ignore */
  }
  const seeded: WorkspaceTask[] = DEMO.map((t, i) => ({
    ...t,
    id: `task_${i + 1}`,
    createdAt: new Date(Date.now() - i * 3600000).toISOString(),
  }));
  saveWorkspaceTasksLocal(orgId, seeded);
  return seeded;
}

function saveWorkspaceTasksLocal(orgId: string, tasks: WorkspaceTask[]) {
  localStorage.setItem(key(orgId), JSON.stringify(tasks));
}

async function fetchServerExtras(
  workspaceId: string,
): Promise<Record<string, import('./task-extras-server').TaskExtrasPayload>> {
  try {
    const res = await fetch(`/api/ops-tasks/extras?workspace_id=${encodeURIComponent(workspaceId)}`);
    if (!res.ok) return {};
    const data = (await res.json()) as { extras?: Record<string, import('./task-extras-server').TaskExtrasPayload> };
    return data.extras ?? {};
  } catch {
    return {};
  }
}

export async function loadWorkspaceTasks(orgId: string): Promise<WorkspaceTask[]> {
  const org = getOrganization();
  if (isApiOrganization(org) && org?.workspaceId != null) {
    const { tasks } = await tokensBff.getKanban(org.workspaceId);
    const serverExtras = await fetchServerExtras(String(org.workspaceId));
    const localExtras = loadLocalExtras(orgId);
    const mergedExtras = { ...localExtras, ...serverExtras };
    return mergeTasksWithExtras(tasks, mergedExtras);
  }
  const tasks = loadLocal(orgId);
  return mergeTasksWithExtras(tasks, loadLocalExtras(orgId));
}

export function saveWorkspaceTasks(orgId: string, tasks: WorkspaceTask[]) {
  if (isApiOrganization(getOrganization())) return;
  saveWorkspaceTasksLocal(orgId, tasks);
}

export async function persistWorkspaceTaskUpdate(
  taskId: string,
  patch: Partial<WorkspaceTask>,
  orgId?: string,
): Promise<WorkspaceTask | void> {
  const org = getOrganization();
  const wsId = org?.workspaceId != null ? String(org.workspaceId) : orgId;
  if (!wsId) return;

  const extrasPatch: Partial<WorkspaceTask> = {};
  if (patch.checklist !== undefined) extrasPatch.checklist = patch.checklist;
  if (patch.attachments !== undefined) extrasPatch.attachments = patch.attachments;
  if (patch.history !== undefined) extrasPatch.history = patch.history;
  if (patch.appliedFrameworks !== undefined) extrasPatch.appliedFrameworks = patch.appliedFrameworks;

  if (Object.keys(extrasPatch).length > 0) {
    mergeLocalExtras(wsId, taskId, extrasPatch);
  }

  if (isApiOrganization(org) && org?.workspaceId != null) {
    const res = await fetch(`/api/ops-tasks/${taskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workspace_id: wsId, ...patch }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error((err as { error?: string }).error ?? 'Update failed');
    }
    const data = (await res.json()) as { task: WorkspaceTask };
    return data.task;
  }

  return undefined;
}

export async function persistWorkspaceTaskDelete(
  taskId: string,
  orgId: string,
): Promise<void> {
  const org = getOrganization();
  const wsId = org?.workspaceId != null ? String(org.workspaceId) : orgId;

  const map = loadLocalExtras(wsId);
  map[taskId] = { ...map[taskId], deleted: true };
  saveLocalExtras(wsId, map);

  if (isApiOrganization(org) && org?.workspaceId != null) {
    const res = await fetch(
      `/api/ops-tasks/${taskId}?workspace_id=${encodeURIComponent(wsId)}`,
      { method: 'DELETE' },
    );
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error((err as { error?: string }).error ?? 'Delete failed');
    }
  }
}

export async function persistWorkspaceTaskMove(
  taskId: string,
  status: KanbanStatus,
): Promise<WorkspaceTask> {
  const org = getOrganization();
  if (!org?.workspaceId) throw new Error('No workspace');
  const { task } = await tokensBff.moveCard(org.workspaceId, taskId, status);
  return task;
}

export async function persistNewWorkspaceTask(
  status: KanbanStatus,
  partial: {
    title: string;
    assigneeName?: string;
    assigneeEmail?: string;
    priority?: WorkspaceTask['priority'];
    sp?: number;
    category?: string;
  },
): Promise<WorkspaceTask> {
  const org = getOrganization();
  if (!org?.workspaceId) throw new Error('No workspace');
  const { task } = await tokensBff.createCard(org.workspaceId, {
    status,
    title: partial.title,
    assigneeName: partial.assigneeName,
    assigneeEmail: partial.assigneeEmail,
    priority: partial.priority,
    sp: partial.sp,
    category: partial.category,
  });
  return task;
}

export function nextStatus(status: KanbanStatus): KanbanStatus | null {
  const flow: KanbanStatus[] = ['Бэклог', 'К выполнению', 'В работе', 'Готово', 'Архив'];
  const i = flow.indexOf(status);
  return i >= 0 && i < flow.length - 1 ? flow[i + 1]! : null;
}

export function priorityRank(p: WorkspaceTask['priority']): number {
  if (p === 'High' || p === 'Высокий') return 0;
  if (p === 'Medium' || p === 'Средний') return 1;
  return 2;
}

export function isOverdue(task: WorkspaceTask): boolean {
  if (!task.dueDate) return false;
  if (['Готово', 'Архив'].includes(task.status)) return false;
  const d = new Date(task.dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d < today;
}

export function formatDueDate(iso?: string): string | null {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return null;
  }
}

export { getWorkspaceId };
