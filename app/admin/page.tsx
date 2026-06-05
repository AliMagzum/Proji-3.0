'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Send, Plus, Trash2, Users, CheckCircle2, Clock, AlertTriangle,
  ChevronDown, X, Megaphone, Folder,
} from 'lucide-react';
import { PageWrapper } from '../../src/components/PageWrapper';
import { adminTasksApi, projectsApi, type AdminTask, type Priority } from '../../src/lib/api';

const DOMAINS = ['all', 'Общий', 'Финансы', 'Маркетинг', 'Стратегия', 'Операции', 'Юридический', 'Управление', 'Производство', 'Оборудование'] as const;
const DOMAIN_LABELS: Record<string, string> = {
  all: 'Всем сотрудникам',
  'Общий': 'Общий отдел',
  'Финансы': 'Финансы',
  'Маркетинг': 'Маркетинг',
  'Стратегия': 'Стратегия',
  'Операции': 'Операции',
  'Юридический': 'Юридический',
  'Управление': 'Управление',
  'Производство': 'Производство',
  'Оборудование': 'Оборудование',
};
const PRIORITY_COLORS: Record<Priority, string> = {
  low:    'bg-slate-100 text-slate-500',
  medium: 'bg-yellow-100 text-yellow-700',
  high:   'bg-red-100 text-red-600',
};
const PRIORITY_LABELS: Record<Priority, string> = { low: 'Низкий', medium: 'Средний', high: 'Высокий' };

export default function AdminPage() {
  const [tasks, setTasks] = useState<AdminTask[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);

  // form
  const [title, setTitle]             = useState('');
  const [description, setDescription] = useState('');
  const [targetDomain, setTarget]     = useState<string>('all');
  const [priority, setPriority]       = useState<Priority>('medium');
  const [deadline, setDeadline]       = useState('');
  const [showDomainDrop, setDomainDrop] = useState(false);
  const [showPriorityDrop, setPriorityDrop] = useState(false);

  useEffect(() => {
    setTasks(adminTasksApi.getAll());
    setProjects(projectsApi.getAll());
  }, []);

  const refresh = () => setTasks(adminTasksApi.getAll());

  const handleSend = () => {
    if (!title.trim()) return;
    const task: AdminTask = {
      id:           Date.now().toString(),
      title:        title.trim(),
      description:  description.trim(),
      priority,
      deadline,
      targetDomain,
      assignedBy:   'admin',
      createdAt:    new Date().toISOString(),
      status:       'active',
    };
    adminTasksApi.create(task);
    refresh();
    setTitle(''); setDescription(''); setTarget('all');
    setPriority('medium'); setDeadline('');
    setShowForm(false);
  };

  const archive = (id: string) => { adminTasksApi.update(id, { status: 'archived' }); refresh(); };
  const remove  = (id: string) => { adminTasksApi.remove(id); refresh(); };

  const active   = tasks.filter((t) => t.status === 'active');
  const archived = tasks.filter((t) => t.status === 'archived');

  const stats = {
    total:    active.length,
    high:     active.filter((t) => t.priority === 'high').length,
    domains:  [...new Set(active.map((t) => t.targetDomain))].length,
    projects: projects.length,
  };

  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto w-full px-4 md:px-10 pb-16">

        {/* Header */}
        <div className="flex items-center justify-between mb-2 pt-1">
          <div className="flex items-center gap-2">
            <Megaphone size={20} className="text-proji-primary" />
            <h1 className="text-xl font-black text-slate-900">Панель администратора</h1>
          </div>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="flex items-center gap-2 px-4 py-2 bg-proji-primary text-white text-sm font-bold rounded-xl hover:bg-proji-primary/90 transition-colors"
          >
            <Plus size={14} /> Новая задача
          </button>
        </div>
        <p className="text-sm text-slate-400 mb-8">Рассылка задач сотрудникам по отделам</p>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Активных задач',  value: stats.total,    icon: CheckCircle2, color: 'text-proji-primary' },
            { label: 'Срочных задач',   value: stats.high,     icon: AlertTriangle, color: 'text-red-500' },
            { label: 'Охвачено отделов', value: stats.domains, icon: Users,         color: 'text-blue-500' },
            { label: 'Проектов',         value: stats.projects, icon: Folder,       color: 'text-green-500' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white rounded-2xl border border-slate-100 p-4">
              <Icon size={16} className={`${color} mb-2`} />
              <p className="text-2xl font-black text-slate-900">{value}</p>
              <p className="text-xs text-slate-400 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Compose form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden mb-6"
            >
              <div className="bg-white rounded-3xl border border-slate-200 p-6 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">Составить задачу</p>
                  <button onClick={() => setShowForm(false)}><X size={14} className="text-slate-400" /></button>
                </div>

                {/* Title */}
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Название задачи..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-800 placeholder:text-slate-300 outline-none focus:border-proji-primary/40 transition-colors"
                />

                {/* Description */}
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Подробное описание задачи..."
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-800 placeholder:text-slate-300 outline-none resize-none leading-relaxed focus:border-proji-primary/40 transition-colors"
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Target domain */}
                  <div className="relative">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Получатель</p>
                    <button
                      onClick={() => { setDomainDrop((v) => !v); setPriorityDrop(false); }}
                      className="w-full flex items-center justify-between gap-2 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 hover:border-proji-primary/40 transition-colors"
                    >
                      <span className="truncate">{DOMAIN_LABELS[targetDomain]}</span>
                      <ChevronDown size={13} className="text-slate-400 shrink-0" />
                    </button>
                    <AnimatePresence>
                      {showDomainDrop && (
                        <motion.div
                          initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                          className="absolute z-20 top-full mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden"
                        >
                          {DOMAINS.map((d) => (
                            <button key={d} onClick={() => { setTarget(d); setDomainDrop(false); }}
                              className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-50 transition-colors ${targetDomain === d ? 'text-proji-primary font-bold' : 'text-slate-700'}`}
                            >
                              {DOMAIN_LABELS[d]}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Priority */}
                  <div className="relative">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Приоритет</p>
                    <button
                      onClick={() => { setPriorityDrop((v) => !v); setDomainDrop(false); }}
                      className="w-full flex items-center justify-between gap-2 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 hover:border-proji-primary/40 transition-colors"
                    >
                      <span>{PRIORITY_LABELS[priority]}</span>
                      <ChevronDown size={13} className="text-slate-400 shrink-0" />
                    </button>
                    <AnimatePresence>
                      {showPriorityDrop && (
                        <motion.div
                          initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                          className="absolute z-20 top-full mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden"
                        >
                          {(['low', 'medium', 'high'] as Priority[]).map((p) => (
                            <button key={p} onClick={() => { setPriority(p); setPriorityDrop(false); }}
                              className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-50 transition-colors ${priority === p ? 'text-proji-primary font-bold' : 'text-slate-700'}`}
                            >
                              {PRIORITY_LABELS[p]}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Deadline */}
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Срок</p>
                    <input
                      type="date"
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 outline-none focus:border-proji-primary/40 transition-colors"
                    />
                  </div>
                </div>

                <button
                  onClick={handleSend}
                  disabled={!title.trim()}
                  className={`flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-black transition-all ${
                    title.trim() ? 'bg-proji-primary text-white hover:bg-proji-primary/90' : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <Send size={14} /> Разослать задачу
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active tasks */}
        {active.length > 0 && (
          <>
            <div className="flex items-center gap-3 mb-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Активные задачи</p>
              <div className="flex-1 h-px bg-slate-100" />
            </div>
            <div className="flex flex-col gap-3 mb-8">
              {active.map((task) => (
                <div key={task.id} className="bg-white rounded-2xl border border-slate-100 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <p className="text-sm font-bold text-slate-800">{task.title}</p>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${PRIORITY_COLORS[task.priority]}`}>
                          {PRIORITY_LABELS[task.priority]}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">
                          {DOMAIN_LABELS[task.targetDomain]}
                        </span>
                      </div>
                      {task.description && (
                        <p className="text-xs text-slate-500 leading-relaxed mb-2">{task.description}</p>
                      )}
                      <div className="flex items-center gap-3 text-[10px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <Clock size={10} />
                          {new Date(task.createdAt).toLocaleDateString('ru')}
                        </span>
                        {task.deadline && (
                          <span className="flex items-center gap-1 text-orange-500">
                            <Clock size={10} /> до {task.deadline}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => archive(task.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-green-500 hover:bg-green-50 transition-all"
                        title="Архивировать"
                      >
                        <CheckCircle2 size={15} />
                      </button>
                      <button
                        onClick={() => remove(task.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                        title="Удалить"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {active.length === 0 && !showForm && (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-100 mb-8">
            <Megaphone size={28} className="text-slate-200 mx-auto mb-3" />
            <p className="text-sm text-slate-400">Нет активных задач</p>
            <p className="text-xs text-slate-300 mt-1">Нажмите «Новая задача» чтобы разослать задание сотрудникам</p>
          </div>
        )}

        {/* Archived */}
        {archived.length > 0 && (
          <>
            <div className="flex items-center gap-3 mb-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Архив</p>
              <div className="flex-1 h-px bg-slate-100" />
            </div>
            <div className="flex flex-col gap-2">
              {archived.map((task) => (
                <div key={task.id} className="bg-slate-50 rounded-xl border border-slate-100 px-5 py-3 flex items-center justify-between gap-3 opacity-60">
                  <div>
                    <p className="text-sm font-semibold text-slate-500 line-through">{task.title}</p>
                    <p className="text-[10px] text-slate-400">{DOMAIN_LABELS[task.targetDomain]}</p>
                  </div>
                  <button onClick={() => remove(task.id)} className="p-1.5 rounded-lg text-slate-300 hover:text-red-400 hover:bg-red-50 transition-all">
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

      </div>
    </PageWrapper>
  );
}
