export type BusinessDomain =
  | 'Общий'
  | 'Финансы'
  | 'Маркетинг'
  | 'Стратегия'
  | 'Операции'
  | 'Юридический'
  | 'Управление'
  | 'Производство'
  | 'Оборудование';

export type View =
  | 'Чат'
  | 'Аналитика'
  | 'Прямой эфир'
  | 'Отчеты'
  | 'Дорожная карта'
  | 'OKRs'
  | 'Конкуренты'
  | 'Процессы'
  | 'Ресурсы'
  | 'Логистика'
  | 'Кампании'
  | 'Лиды'
  | 'SEO'
  | 'Сообщения'
  | 'Команда'
  | 'Документы'
  | 'Все сценарии'
  | 'Доска задач'
  | 'Задачи'
  | 'Страницы'
  | 'Обсуждения'
  | 'Просмотр файла'
  | 'TQM Dashboard'
  | 'Непрерывное улучшение'
  | 'Аудиты качества'
  | 'Удовлетворенность клиентов'
  | 'Agile'
  | 'Sprint Review'
  | 'Список болей'
  | 'Карта стейкхолдеров'
  | 'HADI Циклы'
  | 'Стратегия'
  | 'Геймификация'
  | 'TQM DWM Chart'
  | 'Юридический'
  | 'Юридический Дашборд'
  | 'Дневник ИИ'
  | 'Управленческий Журнал'
  | 'Управленческий Отчет'
  | 'Журнал оборудования'
  | 'Доска оборудования'
  | 'Журнал проверок'
  | 'Схемы ТП'
  | 'Регламенты'
  | 'Журнал ремонтов'
  | 'Архив ремонтов'
  | 'Проекты'
  | 'Создать проект'
  | 'Управление проектом'
  | 'DomainInfo'
  | 'DomainLanding'
  | 'Боли'
  | 'Дерево целей'
  | 'Дерево страниц'
  | 'Задачи проекта'
  | 'Профиль сотрудника';

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  mainText?: string;
  comment?: string;
  timestamp: Date;
  domain?: BusinessDomain;
  sourceView?: View;
  consultant?: string;
  reasoning?: string[];
  matchingCriteria?: string[];
  options?: string[];
}

export interface Task {
  id: string;
  title: string;
  status: 'pending' | 'completed' | 'cancelled';
  relatedToType?: 'Оборудование' | 'Проект' | 'Клиент' | 'Юридический' | 'Документ' | 'Общий';
  relatedToName?: string;
  tags?: string[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'In Progress' | 'On Hold' | 'Completed' | 'Planning';
  framework: 'Agile' | 'Waterfall' | 'Lean' | 'Scrum' | 'Hybrid';
  deadline: string;
  startDate: string;
  progress: number;
  team: string[];
  budget: string;
  spent: string;
  taskObjective: string;
  strategicGoal: string;
  originResearch: string;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  priority: 'P0' | 'P1' | 'P2' | 'P3';
  stakeholder: string;
  roi: string;
  milestones: string[];
  tasks: { title: string; status: 'todo' | 'doing' | 'done' }[];
  reports: { name: string; date: string }[];
  complianceStatus: 'Verified' | 'Pending' | 'None';
  resourceUtilization: number;
  qualityMetric: string;
  scalabilityIndex: number;
  createdBy: string;
  lastEditedBy: string;
  frameworks: {
    swot?: {
      strengths: string[];
      weaknesses: string[];
      opportunities: string[];
      threats: string[];
      authors: string[];
    };
    stakeholders?: {
      name: string;
      role: string;
      influence: 'High' | 'Medium' | 'Low';
      interest: 'High' | 'Medium' | 'Low';
    }[];
    painPoints?: {
      point: string;
      impact: 'Critical' | 'Major' | 'Minor';
      status: 'Targeted' | 'In Analysis' | 'Resolved';
    }[];
  };
}

export interface Scenario {
  title: string;
  text: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

export type Theme = 'light' | 'dark' | 'system';

export interface ChatSession {
  id: string;
  date: Date;
  domain: BusinessDomain;
  messages: Message[];
}
