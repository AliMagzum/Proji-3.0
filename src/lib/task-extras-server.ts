import type { TaskAttachment, TaskCheckItem, TaskHistoryEntry } from '../types/workspace';

export interface TaskExtrasPayload {
  checklist?: TaskCheckItem[];
  attachments?: TaskAttachment[];
  history?: TaskHistoryEntry[];
  appliedFrameworks?: string[];
  deleted?: boolean;
}

type Store = Map<string, TaskExtrasPayload>;

const globalStore = globalThis as typeof globalThis & { __projiTaskExtras?: Store };

function store(): Store {
  if (!globalStore.__projiTaskExtras) globalStore.__projiTaskExtras = new Map();
  return globalStore.__projiTaskExtras;
}

export function extrasKey(workspaceId: string, taskId: string) {
  return `${workspaceId}::${taskId}`;
}

export function getTaskExtras(workspaceId: string, taskId: string): TaskExtrasPayload {
  return store().get(extrasKey(workspaceId, taskId)) ?? {};
}

export function listWorkspaceExtras(workspaceId: string): Record<string, TaskExtrasPayload> {
  const out: Record<string, TaskExtrasPayload> = {};
  const prefix = `${workspaceId}::`;
  for (const [key, value] of store().entries()) {
    if (key.startsWith(prefix)) {
      out[key.slice(prefix.length)] = value;
    }
  }
  return out;
}

export function mergeTaskExtras(
  workspaceId: string,
  taskId: string,
  patch: TaskExtrasPayload,
): TaskExtrasPayload {
  const key = extrasKey(workspaceId, taskId);
  const prev = store().get(key) ?? {};
  const next = { ...prev, ...patch };
  store().set(key, next);
  return next;
}

export function deleteTaskExtras(workspaceId: string, taskId: string) {
  store().delete(extrasKey(workspaceId, taskId));
}
