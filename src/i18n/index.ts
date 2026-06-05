import type { Locale } from './types';
import { ru } from './dictionaries/ru';
import { en } from './dictionaries/en';
import { kz } from './dictionaries/kz';

export const dictionaries = { ru, en, kz } as const;

export const LOCALE_STORAGE_KEY = 'proji_locale';

export const DEFAULT_LOCALE: Locale = 'ru';

export function getDictionary(locale: Locale) {
  return dictionaries[locale] ?? dictionaries.ru;
}

type DictValue = string | { [key: string]: DictValue };

function resolve(obj: DictValue, path: string): string | undefined {
  const parts = path.split('.');
  let cur: DictValue = obj;
  for (const p of parts) {
    if (typeof cur !== 'object' || cur === null || !(p in cur)) return undefined;
    cur = (cur as Record<string, DictValue>)[p];
  }
  return typeof cur === 'string' ? cur : undefined;
}

export function translate(locale: Locale, key: string): string {
  const dict = getDictionary(locale);
  return resolve(dict as DictValue, key) ?? key;
}

export function isLocale(value: string): value is Locale {
  return value === 'ru' || value === 'en' || value === 'kz';
}

export {
  DOMAIN_SLUG,
  DOMAIN_ORDER,
  DOMAIN_BY_SLUG,
  KANBAN_SLUG,
  tDomain,
  tKanbanStatus,
  tDomainConsultant,
  tDomainNavItem,
  tDomainNavCategory,
} from './helpers';
