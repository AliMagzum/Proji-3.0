import { DEFAULT_KANBAN_COLUMNS } from './constants';
import { TOKENS_API_BASE, tokensApiUserId } from './config';
import type { TokensCard, TokensColumn, TokensOrganization, TokensWorkspace } from './types';

export class TokensApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = 'TokensApiError';
  }
}

function bearer(): string {
  const token = process.env.TOKENS_API_BEARER_TOKEN?.trim();
  if (!token) throw new TokensApiError('TOKENS_API_BEARER_TOKEN is not set', 500);
  return token;
}

export async function tokensFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const url = `${TOKENS_API_BASE.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${bearer()}`,
      ...init?.headers,
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    const text = await res.text();
    throw new TokensApiError(text || res.statusText, res.status);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export async function createOrganizationWithWorkspace(name: string): Promise<{
  organization: TokensOrganization;
  workspace: TokensWorkspace;
  columns: TokensColumn[];
  inviteCode: string;
}> {
  const createdBy = tokensApiUserId();
  const organization = await tokensFetch<TokensOrganization>('organizations', {
    method: 'POST',
    body: JSON.stringify({ name: name.trim(), created_by: createdBy }),
  });

  const workspace = await tokensFetch<TokensWorkspace>('workspaces', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Основной',
      organization_id: organization.id,
      created_by: createdBy,
    }),
  });

  const columns: TokensColumn[] = [];
  for (const col of DEFAULT_KANBAN_COLUMNS) {
    const created = await tokensFetch<TokensColumn>(
      `workspaces/${workspace.id}/columns`,
      {
        method: 'POST',
        body: JSON.stringify({
          name: col.name,
          created_by: createdBy,
        }),
      },
    );
    columns.push({ ...created, position: col.position });
  }

  const inviteCode =
    organization.invite_code ??
    `PROJI-${organization.id}-${workspace.id}`;

  return { organization, workspace, columns, inviteCode };
}

export async function listWorkspaceColumns(workspaceId: number): Promise<TokensColumn[]> {
  const cols = await tokensFetch<TokensColumn[]>(`workspaces/${workspaceId}/columns`);
  return [...cols].sort((a, b) => a.position - b.position);
}

export async function listAllCards(
  workspaceId: number,
  columns: TokensColumn[],
): Promise<TokensCard[]> {
  const all: TokensCard[] = [];
  for (const col of columns) {
    try {
      const cards = await tokensFetch<TokensCard[]>(
        `workspaces/${workspaceId}/columns/${col.id}/cards`,
      );
      all.push(...cards);
    } catch {
      /* column empty or error */
    }
  }
  return all;
}

export async function createCard(
  workspaceId: number,
  columnId: number,
  body: {
    title: string;
    description?: string;
    created_by?: number;
    priority?: string;
    story_points?: number;
    assignee_email?: string;
    assignee_name?: string;
    due_at?: string;
    category?: string;
    tag?: string;
  },
): Promise<TokensCard> {
  const createdBy = body.created_by ?? tokensApiUserId();
  return tokensFetch<TokensCard>(
    `workspaces/${workspaceId}/columns/${columnId}/cards`,
    {
      method: 'POST',
      body: JSON.stringify({
        title: body.title,
        description: body.description ?? '',
        created_by: createdBy,
        priority: body.priority ?? 'medium',
        story_points: body.story_points ?? 0,
        assignee_email: body.assignee_email,
        assignee_name: body.assignee_name,
        due_at: body.due_at,
        category: body.category ?? 'Общее',
        tag: body.tag,
      }),
    },
  );
}

export async function patchCard(
  workspaceId: number,
  cardId: number,
  body: Record<string, unknown>,
): Promise<TokensCard> {
  return tokensFetch<TokensCard>(`workspaces/${workspaceId}/cards/${cardId}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export async function moveCard(
  workspaceId: number,
  cardId: number,
  columnId: number,
  position = 0,
): Promise<TokensCard> {
  return tokensFetch<TokensCard>(`workspaces/${workspaceId}/cards/${cardId}/move`, {
    method: 'PATCH',
    body: JSON.stringify({ column_id: columnId, position }),
  });
}
