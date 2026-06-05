import type { TaskChatMessage } from '../types/workspace';

type Store = Map<string, TaskChatMessage[]>;

const globalStore = globalThis as typeof globalThis & { __projiTaskChat?: Store };

function store(): Store {
  if (!globalStore.__projiTaskChat) globalStore.__projiTaskChat = new Map();
  return globalStore.__projiTaskChat;
}

export function chatKey(workspaceId: string, taskId: string | null | undefined) {
  return `${workspaceId}::${taskId ?? '__general__'}`;
}

export function listMessages(
  workspaceId: string,
  taskId?: string | null,
): TaskChatMessage[] {
  const key = chatKey(workspaceId, taskId);
  const list = store().get(key) ?? [];
  return [...list].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );
}

export function addMessage(msg: TaskChatMessage): TaskChatMessage {
  const key = chatKey(msg.workspace_id, msg.task_id);
  const list = store().get(key) ?? [];
  const next = [...list, msg];
  store().set(key, next);
  return msg;
}
