import type { BusinessDomain } from '../types';
import type { KanbanStatus } from '../types/workspace';

/** Slug for i18n keys — internal domain id stays Russian in store/API */
export const DOMAIN_SLUG: Record<BusinessDomain, string> = {
  Общий: 'general',
  Финансы: 'finance',
  Маркетинг: 'marketing',
  Стратегия: 'strategy',
  Операции: 'operations',
  Юридический: 'legal',
  Управление: 'management',
  Производство: 'production',
  Оборудование: 'equipment',
};

export const DOMAIN_ORDER = [
  'general',
  'finance',
  'marketing',
  'strategy',
  'operations',
  'legal',
  'management',
  'production',
  'equipment',
] as const;

export type DomainSlug = (typeof DOMAIN_ORDER)[number];

export const DOMAIN_BY_SLUG: Record<DomainSlug, BusinessDomain> = {
  general: 'Общий',
  finance: 'Финансы',
  marketing: 'Маркетинг',
  strategy: 'Стратегия',
  operations: 'Операции',
  legal: 'Юридический',
  management: 'Управление',
  production: 'Производство',
  equipment: 'Оборудование',
};

export const KANBAN_SLUG: Record<KanbanStatus, string> = {
  Бэклог: 'backlog',
  'К выполнению': 'todo',
  'В работе': 'inProgress',
  Готово: 'done',
  Архив: 'archive',
};

export function tDomain(t: (key: string) => string, domain: string): string {
  const slug = DOMAIN_SLUG[domain as BusinessDomain];
  return slug ? t(`domains.items.${slug}.name`) : domain;
}

export function tKanbanStatus(t: (key: string) => string, status: KanbanStatus): string {
  const slug = KANBAN_SLUG[status];
  return slug ? t(`tasks.kanban.columns.${slug}`) : status;
}

export function tDomainConsultant(t: (key: string) => string, domain: string): string {
  const slug = DOMAIN_SLUG[domain as BusinessDomain];
  return slug ? t(`domains.consultants.${slug}`) : t('domains.landing.defaultConsultant');
}

export function tDomainNavItem(t: (key: string) => string, key: string): string {
  const sidebar = t(`sidebar.details.${key}`);
  if (sidebar !== `sidebar.details.${key}`) return sidebar;
  const navItem = t(`domains.navItems.${key}`);
  if (navItem !== `domains.navItems.${key}`) return navItem;
  return key;
}

export function tDomainNavCategory(t: (key: string) => string, key: string): string {
  const label = t(`domains.categories.${key}`);
  return label !== `domains.categories.${key}` ? label : key;
}
