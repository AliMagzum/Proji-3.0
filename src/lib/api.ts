/**
 * API Service Layer
 *
 * All data operations go through this file.
 * Currently backed by localStorage — swap each function body
 * for a fetch() call when the backend is ready.
 *
 * Endpoint comments show the expected REST contract.
 */

// ─── Storage keys ────────────────────────────────────────────────────────────
const KEYS = {
  projects:    'proji_projects',
  tasks:       (pid: string) => `proji_ptasks_${pid}`,
  reports:     (pid: string) => `proji_reports_${pid}`,
  docs:        (pid: string) => `proji_docs_${pid}`,
  timer:       (pid: string) => `proji_timer_${pid}`,
  adminTasks:  'proji_admin_tasks',
  users:       'proji_users',
  profile:     'proji_profile',
};

// ─── Shared helpers ───────────────────────────────────────────────────────────
function ls<T>(key: string, fallback: T): T {
  try { return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback; }
  catch { return fallback; }
}
function lsSet(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type TaskStatus = 'new' | 'accepted' | 'review' | 'declined' | 'completed';
export type Priority   = 'low' | 'medium' | 'high';

export interface ProjectTask {
  id:          string;
  title:       string;
  description: string;
  status:      TaskStatus;
  priority:    Priority;
  deadline?:   string;
  urgent:      boolean;
  checklist:   { text: string; done: boolean }[];
  attachments: { name: string; type: string }[];
  assignedBy?: string;   // 'admin' | user id
  declineReason?: string;
  reportText?: string;
  createdAt:   string;
}

export interface Report {
  id:          string;
  date:        string;
  description: string;
  tasks:       string[];
  duration:    string;
  projectId?:  string;
  authorId?:   string;
  sentAt:      string;
}

export interface Doc {
  id:        string;
  title:     string;
  content:   string;
  createdAt: string;
  updatedAt: string;
  authorId?: string;
}

export interface AdminTask {
  id:           string;
  title:        string;
  description:  string;
  priority:     Priority;
  deadline?:    string;
  targetDomain: string;   // 'all' | BusinessDomain
  assignedBy:   string;
  createdAt:    string;
  status:       'active' | 'archived';
}

export interface UserProfile {
  id:     string;
  name:   string;
  role:   string;
  domain: string;
  email:  string;
  avatar: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// PROJECTS API
// ═══════════════════════════════════════════════════════════════════════════════
export const projectsApi = {
  /** GET /api/projects */
  getAll: () => ls<any[]>(KEYS.projects, []),

  /** GET /api/projects/:id */
  getById: (id: string) => {
    const list = ls<any[]>(KEYS.projects, []);
    return list.find((p) => p.id === id) ?? null;
  },

  /** POST /api/projects */
  create: (project: any) => {
    const list = ls<any[]>(KEYS.projects, []);
    const next = [...list, project];
    lsSet(KEYS.projects, next);
    return project;
  },

  /** PATCH /api/projects/:id */
  update: (id: string, patch: Partial<any>) => {
    const list = ls<any[]>(KEYS.projects, []);
    const next = list.map((p) => p.id === id ? { ...p, ...patch } : p);
    lsSet(KEYS.projects, next);
    return next.find((p) => p.id === id);
  },

  /** DELETE /api/projects/:id */
  remove: (id: string) => {
    const list = ls<any[]>(KEYS.projects, []);
    lsSet(KEYS.projects, list.filter((p) => p.id !== id));
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// PROJECT TASKS API
// ═══════════════════════════════════════════════════════════════════════════════
export const tasksApi = {
  /** GET /api/projects/:pid/tasks */
  getAll: (projectId: string): ProjectTask[] =>
    ls<ProjectTask[]>(KEYS.tasks(projectId), []),

  /** POST /api/projects/:pid/tasks */
  create: (projectId: string, task: ProjectTask) => {
    const list = tasksApi.getAll(projectId);
    lsSet(KEYS.tasks(projectId), [...list, task]);
    return task;
  },

  /** PATCH /api/projects/:pid/tasks/:id */
  update: (projectId: string, taskId: string, patch: Partial<ProjectTask>) => {
    const list = tasksApi.getAll(projectId);
    const next = list.map((t) => t.id === taskId ? { ...t, ...patch } : t);
    lsSet(KEYS.tasks(projectId), next);
    return next.find((t) => t.id === taskId);
  },

  /** DELETE /api/projects/:pid/tasks/:id */
  remove: (projectId: string, taskId: string) => {
    const list = tasksApi.getAll(projectId);
    lsSet(KEYS.tasks(projectId), list.filter((t) => t.id !== taskId));
  },

  /** Bulk update status */
  setStatus: (projectId: string, taskId: string, status: TaskStatus) =>
    tasksApi.update(projectId, taskId, { status }),

  /** All completed tasks across all projects (for reports page) */
  getAllCompleted: (projects: any[]): { projectId: string; projectName: string; task: ProjectTask }[] => {
    const result: { projectId: string; projectName: string; task: ProjectTask }[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key?.startsWith('proji_ptasks_')) continue;
      const pid = key.replace('proji_ptasks_', '');
      const tasks = ls<ProjectTask[]>(key, []);
      const proj = projects.find((p) => p.id === pid);
      tasks
        .filter((t) => t.status === 'completed')
        .forEach((t) => result.push({
          projectId: pid,
          projectName: proj?.name ?? `Проект …${pid.slice(-5)}`,
          task: t,
        }));
    }
    return result;
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// REPORTS API
// ═══════════════════════════════════════════════════════════════════════════════
export const reportsApi = {
  /** GET /api/projects/:pid/reports */
  getByProject: (projectId: string): Report[] =>
    ls<Report[]>(KEYS.reports(projectId), []),

  /** GET /api/reports  (all projects) */
  getAll: (projects: any[]): (Report & { projectName: string })[] => {
    const all: (Report & { projectName: string })[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key?.startsWith('proji_reports_')) continue;
      const pid = key.replace('proji_reports_', '');
      const proj = projects.find((p) => p.id === pid);
      const reps = ls<Report[]>(key, []);
      reps.forEach((r) => all.push({
        ...r,
        projectId: pid,
        projectName: proj?.name ?? `Проект …${pid.slice(-5)}`,
      }));
    }
    return all.sort((a, b) => b.sentAt?.localeCompare(a.sentAt ?? '') ?? 0);
  },

  /** POST /api/reports */
  create: (projectId: string, report: Report) => {
    const list = reportsApi.getByProject(projectId);
    lsSet(KEYS.reports(projectId), [report, ...list]);
    return report;
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// DOCS API
// ═══════════════════════════════════════════════════════════════════════════════
export const docsApi = {
  /** GET /api/projects/:pid/docs */
  getAll: (projectId: string): Doc[] =>
    ls<Doc[]>(KEYS.docs(projectId), []),

  /** POST /api/projects/:pid/docs */
  create: (projectId: string, doc: Doc) => {
    const list = docsApi.getAll(projectId);
    lsSet(KEYS.docs(projectId), [doc, ...list]);
    return doc;
  },

  /** PATCH /api/projects/:pid/docs/:id */
  update: (projectId: string, docId: string, patch: Partial<Doc>) => {
    const list = docsApi.getAll(projectId);
    const next = list.map((d) => d.id === docId ? { ...d, ...patch, updatedAt: new Date().toISOString() } : d);
    lsSet(KEYS.docs(projectId), next);
    return next.find((d) => d.id === docId);
  },

  /** DELETE /api/projects/:pid/docs/:id */
  remove: (projectId: string, docId: string) => {
    const list = docsApi.getAll(projectId);
    lsSet(KEYS.docs(projectId), list.filter((d) => d.id !== docId));
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN TASKS API  (broadcast from admin to roles/domains)
// ═══════════════════════════════════════════════════════════════════════════════
export const adminTasksApi = {
  /** GET /api/admin/tasks */
  getAll: (): AdminTask[] =>
    ls<AdminTask[]>(KEYS.adminTasks, []),

  /** GET /api/admin/tasks?domain=Маркетинг */
  getByDomain: (domain: string): AdminTask[] => {
    const all = adminTasksApi.getAll();
    return all.filter((t) => t.targetDomain === 'all' || t.targetDomain === domain);
  },

  /** POST /api/admin/tasks */
  create: (task: AdminTask) => {
    const list = adminTasksApi.getAll();
    lsSet(KEYS.adminTasks, [task, ...list]);
    return task;
  },

  /** PATCH /api/admin/tasks/:id */
  update: (id: string, patch: Partial<AdminTask>) => {
    const list = adminTasksApi.getAll();
    const next = list.map((t) => t.id === id ? { ...t, ...patch } : t);
    lsSet(KEYS.adminTasks, next);
  },

  /** DELETE /api/admin/tasks/:id */
  remove: (id: string) => {
    const list = adminTasksApi.getAll();
    lsSet(KEYS.adminTasks, list.filter((t) => t.id !== id));
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// PROFILE / AUTH API
// ═══════════════════════════════════════════════════════════════════════════════
export const profileApi = {
  /** GET /api/me */
  get: (): UserProfile => ls<UserProfile>(KEYS.profile, {
    id:     'user-1',
    name:   'Пользователь',
    role:   'Сотрудник',
    domain: 'Общий',
    email:  '',
    avatar: '',
  }),

  /** PATCH /api/me */
  update: (patch: Partial<UserProfile>) => {
    const current = profileApi.get();
    const next = { ...current, ...patch };
    lsSet(KEYS.profile, next);
    return next;
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// TIMER API
// ═══════════════════════════════════════════════════════════════════════════════
export const timerApi = {
  /** GET /api/timer/:pid */
  get: (projectId: string) =>
    ls<{ elapsed: number; running: boolean; startedAt: number | null }>(
      KEYS.timer(projectId), { elapsed: 0, running: false, startedAt: null }
    ),

  /** PUT /api/timer/:pid */
  save: (projectId: string, state: { elapsed: number; running: boolean; startedAt: number | null }) =>
    lsSet(KEYS.timer(projectId), state),
};
