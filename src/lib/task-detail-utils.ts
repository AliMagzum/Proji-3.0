import type { TaskCheckItem } from '../types/workspace';

export function parseChecklistFromAi(text: string): TaskCheckItem[] {
  const base = Date.now();
  return text
    .split('\n')
    .map((line) => line.replace(/^[-*•\d.)]+\s*/, '').trim())
    .filter(Boolean)
    .map((line, i) => ({
      id: `chk-${base}-${i}`,
      text: line,
      completed: false,
    }));
}

export function isCrmLeadTask(description?: string): boolean {
  if (!description) return false;
  return /ManyChat\s*ID|Wazzup\s*Chat\s*ID/i.test(description);
}

export function formatDueDateOnly(iso?: string): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return '—';
  }
}

export function toDateInputValue(iso?: string): string {
  if (!iso) return '';
  try {
    return new Date(iso).toISOString().slice(0, 10);
  } catch {
    return '';
  }
}
