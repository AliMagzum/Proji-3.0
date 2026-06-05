import type { TaskExtrasPayload } from './task-extras-server';
import type { WorkspaceTask } from '../types/workspace';

const key = (workspaceId: string) => `proji_task_extras_${workspaceId}`;

export function loadLocalExtras(workspaceId: string): Record<string, TaskExtrasPayload> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(key(workspaceId));
    return raw ? (JSON.parse(raw) as Record<string, TaskExtrasPayload>) : {};
  } catch {
    return {};
  }
}

export function saveLocalExtras(
  workspaceId: string,
  map: Record<string, TaskExtrasPayload>,
) {
  localStorage.setItem(key(workspaceId), JSON.stringify(map));
}

export function mergeLocalExtras(
  workspaceId: string,
  taskId: string,
  patch: TaskExtrasPayload,
): TaskExtrasPayload {
  const map = loadLocalExtras(workspaceId);
  const prev = map[taskId] ?? {};
  const next = { ...prev, ...patch };
  map[taskId] = next;
  saveLocalExtras(workspaceId, map);
  return next;
}

export function mergeTasksWithExtras(
  tasks: WorkspaceTask[],
  extrasMap: Record<string, TaskExtrasPayload>,
): WorkspaceTask[] {
  return tasks
    .filter((t) => !extrasMap[t.id]?.deleted)
    .map((t) => {
      const ex = extrasMap[t.id];
      if (!ex) return t;
      return {
        ...t,
        checklist: ex.checklist ?? t.checklist,
        attachments: ex.attachments ?? t.attachments,
        history: ex.history ?? t.history,
        appliedFrameworks: ex.appliedFrameworks ?? t.appliedFrameworks,
      };
    });
}
