import type { KanbanStatus, WorkspaceTask } from '../../types/workspace';
import type { TokensCard, TokensColumn } from './types';

const PRIORITY_MAP: Record<string, WorkspaceTask['priority']> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

const PRIORITY_TO_API: Record<string, string> = {
  Low: 'low',
  High: 'high',
  Medium: 'medium',
  Высокий: 'high',
  Средний: 'medium',
  Низкий: 'low',
};

export function cardToWorkspaceTask(
  card: TokensCard,
  columnName: KanbanStatus,
  fallbackAssignee?: { name: string; email: string },
): WorkspaceTask {
  const pr = card.priority ?? 'medium';
  return {
    id: String(card.id),
    title: card.title,
    description: card.description,
    status: columnName,
    priority: PRIORITY_MAP[pr] ?? 'Medium',
    sp: card.story_points ?? 0,
    assigneeName: card.assignee_name ?? fallbackAssignee?.name ?? '—',
    assigneeEmail: card.assignee_email ?? fallbackAssignee?.email,
    assignee: card.assigned_to ? String(card.assigned_to) : '',
    dueDate: card.due_at,
    completedAt: card.completed_at,
    createdAt: card.created_at ?? new Date().toISOString(),
    updatedAt: card.updated_at,
    tag: card.tag,
    category: card.category,
  };
}

export function workspaceTaskToCardPatch(
  patch: Partial<WorkspaceTask>,
): Partial<TokensCard> {
  const out: Partial<TokensCard> = {};
  if (patch.title !== undefined) out.title = patch.title;
  if (patch.description !== undefined) out.description = patch.description;
  if (patch.dueDate !== undefined) out.due_at = patch.dueDate;
  if (patch.tag !== undefined) out.tag = patch.tag;
  if (patch.category !== undefined) out.category = patch.category;
  if (patch.sp !== undefined) out.story_points = patch.sp;
  if (patch.assigneeEmail !== undefined) out.assignee_email = patch.assigneeEmail;
  if (patch.assigneeName !== undefined) out.assignee_name = patch.assigneeName;
  if (patch.priority !== undefined) {
    out.priority = PRIORITY_TO_API[patch.priority] ?? 'medium';
  }
  if (patch.completedAt !== undefined) out.completed_at = patch.completedAt;
  return out;
}

export function columnByStatus(
  columns: TokensColumn[],
  status: KanbanStatus,
): TokensColumn | undefined {
  return columns.find((c) => c.name === status);
}

export function buildColumnMap(columns: TokensColumn[]): Map<number, KanbanStatus> {
  const m = new Map<number, KanbanStatus>();
  for (const c of columns) {
    m.set(c.id, c.name as KanbanStatus);
  }
  return m;
}
