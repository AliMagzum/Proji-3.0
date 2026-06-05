export type KanbanStatus =
  | 'Бэклог'
  | 'К выполнению'
  | 'В работе'
  | 'Готово'
  | 'Архив';

export type TaskPriority = 'High' | 'Medium' | 'Low' | 'Высокий' | 'Средний' | 'Низкий';

export interface TaskCheckItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface TaskAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
}

export interface TaskHistoryEntry {
  id: string;
  label: string;
  description: string;
  createdAt: string;
  framework?: string;
}

export interface WorkspaceTask {
  id: string;
  title: string;
  description?: string;
  status: KanbanStatus;
  priority: TaskPriority;
  sp: number;
  assignee: string;
  assigneeName: string;
  assigneeEmail?: string;
  dueDate?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt?: string;
  tag?: string;
  category?: string;
  authorName?: string;
  authorEmail?: string;
  checklist?: TaskCheckItem[];
  attachments?: TaskAttachment[];
  history?: TaskHistoryEntry[];
  appliedFrameworks?: string[];
}

export interface TaskChatMessage {
  id: string;
  workspace_id: string;
  task_id: string | null;
  user_email: string;
  user_name: string;
  text: string;
  created_at: string;
}

export const KANBAN_STATUS_IDS: KanbanStatus[] = [
  'Бэклог',
  'К выполнению',
  'В работе',
  'Готово',
  'Архив',
];
