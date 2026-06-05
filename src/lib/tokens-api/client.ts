/** Browser calls our Next.js BFF (not api.tokens.kz directly). */

import { isTokensApiClientEnabled } from './config';

async function bff<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((err as { error?: string }).error ?? 'API error');
  }
  return res.json() as Promise<T>;
}

export function useTokensBff(): boolean {
  return isTokensApiClientEnabled();
}

export const tokensBff = {
  createOrg: (name: string) =>
    bff<{
      organizationId: number;
      workspaceId: number;
      name: string;
      inviteCode: string;
    }>('/api/tokens/onboarding/create', {
      method: 'POST',
      body: JSON.stringify({ name }),
    }),

  joinOrg: (inviteCode: string) =>
    bff<{
      organizationId: number;
      workspaceId: number;
      name: string;
    }>('/api/tokens/onboarding/join', {
      method: 'POST',
      body: JSON.stringify({ inviteCode }),
    }),

  getKanban: (workspaceId: number) =>
    bff<{ tasks: import('../../types/workspace').WorkspaceTask[] }>(
      `/api/tokens/workspace/${workspaceId}/kanban`,
    ),

  createCard: (
    workspaceId: number,
    body: {
      status: import('../../types/workspace').KanbanStatus;
      title: string;
      assigneeName?: string;
      assigneeEmail?: string;
      priority?: string;
      sp?: number;
      category?: string;
    },
  ) =>
    bff<{ task: import('../../types/workspace').WorkspaceTask }>(
      `/api/tokens/workspace/${workspaceId}/kanban/cards`,
      { method: 'POST', body: JSON.stringify(body) },
    ),

  updateCard: (
    workspaceId: number,
    cardId: string,
    patch: Partial<import('../../types/workspace').WorkspaceTask>,
  ) =>
    bff<{ task: import('../../types/workspace').WorkspaceTask }>(
      `/api/tokens/workspace/${workspaceId}/kanban/cards/${cardId}`,
      { method: 'PATCH', body: JSON.stringify(patch) },
    ),

  moveCard: (
    workspaceId: number,
    cardId: string,
    status: import('../../types/workspace').KanbanStatus,
  ) =>
    bff<{ task: import('../../types/workspace').WorkspaceTask }>(
      `/api/tokens/workspace/${workspaceId}/kanban/cards/${cardId}/move`,
      { method: 'PATCH', body: JSON.stringify({ status }) },
    ),

  getMessages: (workspaceId: number, taskId?: string | null) => {
    const q = new URLSearchParams();
    if (taskId) q.set('task_id', taskId);
    const qs = q.toString();
    return bff<{ messages: import('../../types/workspace').TaskChatMessage[] }>(
      `/api/tokens/workspace/${workspaceId}/messages${qs ? `?${qs}` : ''}`,
    );
  },

  postMessage: (workspaceId: number, text: string, taskId?: string | null) =>
    bff<{ message: import('../../types/workspace').TaskChatMessage }>(
      `/api/tokens/workspace/${workspaceId}/messages`,
      { method: 'POST', body: JSON.stringify({ text, task_id: taskId ?? null }) },
    ),
};
