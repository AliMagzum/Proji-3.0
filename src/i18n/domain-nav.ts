import type { BusinessDomain } from '../types';
import { SIDEBAR_ROUTES } from './sidebar-keys';

export type DomainNavSection = { categoryKey: string; items: string[] };

/** Key-based nav — labels come from i18n, routes from DOMAIN_NAV_ROUTES */
export const DOMAIN_NAV: Record<BusinessDomain, DomainNavSection[]> = {
  Общий: [
    { categoryKey: 'main', items: ['chat', 'messages', 'tasks'] },
    { categoryKey: 'teamGroup', items: ['wholeTeam'] },
    { categoryKey: 'library', items: ['documents', 'diary'] },
  ],
  Финансы: [
    { categoryKey: 'accounting', items: ['reports', 'documents'] },
    { categoryKey: 'analyticsGroup', items: ['okrs', 'roadmap'] },
  ],
  Маркетинг: [
    { categoryKey: 'promotion', items: ['campaigns', 'seo'] },
    { categoryKey: 'leadsGroup', items: ['leads', 'analytics'] },
  ],
  Стратегия: [
    { categoryKey: 'planning', items: ['strategyOverview', 'okrs'] },
    { categoryKey: 'analysis', items: ['competitors', 'roadmap'] },
  ],
  Операции: [
    { categoryKey: 'processesGroup', items: ['processes', 'resources'] },
    { categoryKey: 'logisticsGroup', items: ['logistics', 'team'] },
  ],
  Юридический: [
    { categoryKey: 'law', items: ['legalOverview', 'documents'] },
    { categoryKey: 'control', items: ['legalDashboard', 'roadmap'] },
  ],
  Управление: [
    { categoryKey: 'teamSection', items: ['team', 'discussions'] },
    { categoryKey: 'hr', items: ['pages', 'gamification'] },
  ],
  Производство: [
    { categoryKey: 'shop', items: ['tqmDashboard', 'continuousImprovement'] },
    { categoryKey: 'quality', items: ['qualityAudits', 'clientSatisfaction'] },
  ],
  Оборудование: [
    { categoryKey: 'machinery', items: ['equipmentJournal', 'equipmentBoard'] },
    { categoryKey: 'service', items: ['inspectionJournal', 'repairArchive'] },
  ],
};

export const DOMAIN_NAV_ROUTES: Record<string, string> = {
  ...SIDEBAR_ROUTES,
  wholeTeam: '/team',
  diary: '/management/journal',
  tasks: '/tasks',
  okrs: '/okrs',
  roadmap: '/roadmap',
  campaigns: '/campaigns',
  seo: '/seo',
  leads: '/leads',
  analytics: '/analytics',
  strategyOverview: '/goals-tree',
  competitors: '/competitors',
  processes: '/processes',
  resources: '/resources',
  logistics: '/logistics',
  gamification: '/gamification',
  legalOverview: '/legal/dashboard',
};
