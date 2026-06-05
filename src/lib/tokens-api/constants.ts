import type { KanbanStatus } from '../../types/workspace';

export const DEFAULT_KANBAN_COLUMNS: {
  name: KanbanStatus;
  slug: string;
  position: number;
  is_done?: boolean;
  is_archive?: boolean;
}[] = [
  { name: 'Бэклог', slug: 'backlog', position: 0 },
  { name: 'К выполнению', slug: 'todo', position: 1 },
  { name: 'В работе', slug: 'in_progress', position: 2 },
  { name: 'Готово', slug: 'done', position: 3, is_done: true },
  { name: 'Архив', slug: 'archive', position: 4, is_archive: true },
];
