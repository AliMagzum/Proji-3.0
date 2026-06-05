'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus, X, GripVertical, ChevronRight, CheckCircle2,
  Clock, AlertCircle, BarChart3, List, Columns3, Calendar,
  Grid2x2, User, Tag,
} from 'lucide-react';
import { PageWrapper } from '../../src/components/PageWrapper';

type Priority = 'high' | 'medium' | 'low';
type ColId = 'todo' | 'inprogress' | 'done';

interface BoardTask {
  id: string;
  title: string;
  okr: string;
  kpi: string;
  sprint: string;
  assignee: string;
  col: ColId;
  priority: Priority;
}

const INITIAL_TASKS: BoardTask[] = [
  { id: '1', title: 'Разработка лендинга', okr: 'Увеличение конверсии', kpi: 'CTR +5%', sprint: 'SPRINT 2', assignee: 'Мария С.', col: 'todo', priority: 'high' },
  { id: '2', title: 'Написание тестов', okr: 'Quality Assurance', kpi: 'Покрытие 80%', sprint: 'SPRINT 2', assignee: 'System', col: 'todo', priority: 'medium' },
  { id: '3', title: 'Дизайн архитектуры', okr: 'Безопасность', kpi: 'Uptime 99.9%', sprint: 'SPRINT 1', assignee: 'Алексей Иванов', col: 'inprogress', priority: 'high' },
  { id: '4', title: 'Интеграция API', okr: 'Производительность', kpi: 'Latency <200ms', sprint: 'SPRINT 1', assignee: 'Дима К.', col: 'inprogress', priority: 'medium' },
  { id: '5', title: 'Аналитика требований', okr: 'Запуск MVP', kpi: '100% готовность макетов', sprint: 'SPRINT 1', assignee: 'Алексей Иванов', col: 'done', priority: 'low' },
  { id: '6', title: 'Настройка CI/CD', okr: 'DevOps зрелость', kpi: 'Deploy time <5m', sprint: 'SPRINT 1', assignee: 'System', col: 'done', priority: 'medium' },
];

const COLUMNS: { id: ColId; label: string }[] = [
  { id: 'todo', label: 'К ВЫПОЛНЕНИЮ' },
  { id: 'inprogress', label: 'В РАБОТЕ' },
  { id: 'done', label: 'ГОТОВО' },
];

const PRIORITY_COLORS: Record<Priority, string> = {
  high: 'bg-red-50 text-red-500 border-red-100',
  medium: 'bg-amber-50 text-amber-500 border-amber-100',
  low: 'bg-slate-50 text-slate-400 border-slate-200',
};

type View = 'list' | 'kanban' | 'gantt' | 'eisenhower';
const VIEWS: { id: View; label: string; icon: React.ComponentType<any> }[] = [
  { id: 'list', label: 'СПИСОК', icon: List },
  { id: 'kanban', label: 'КАНБАН', icon: Columns3 },
  { id: 'gantt', label: 'ГАНТ', icon: Calendar },
  { id: 'eisenhower', label: 'ИЗЕНХАУЭР', icon: Grid2x2 },
];

const SPRINTS = ['SPRINT 1', 'SPRINT 2', 'SPRINT 3'];
const ASSIGNEES = ['Мария С.', 'Алексей Иванов', 'Дима К.', 'System'];

export default function BoardPage() {
  const [tasks, setTasks] = useState<BoardTask[]>(INITIAL_TASKS);
  const [view, setView] = useState<View>('kanban');
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [adding, setAdding] = useState<ColId | null>(null);
  const [newTitle, setNewTitle] = useState('');

  const colTasks = (col: ColId) => tasks.filter((t) => t.col === col);

  const moveTask = (id: string, col: ColId) => {
    setTasks((p) => p.map((t) => t.id === id ? { ...t, col } : t));
    setDraggedId(null);
  };

  const addTask = (col: ColId) => {
    if (!newTitle.trim()) { setAdding(null); return; }
    setTasks((p) => [...p, {
      id: Date.now().toString(),
      title: newTitle.trim(),
      okr: 'Новый OKR',
      kpi: 'KPI TBD',
      sprint: 'SPRINT 1',
      assignee: 'Мария С.',
      col,
      priority: 'medium',
    }]);
    setNewTitle('');
    setAdding(null);
  };

  const deleteTask = (id: string) => setTasks((p) => p.filter((t) => t.id !== id));

  return (
    <PageWrapper>
      <div className="flex flex-col h-full overflow-hidden">
        {/* Header bar */}
        <div className="flex items-center justify-between px-6 py-3 shrink-0">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            Выбранный проект
          </p>
          <div className="flex items-center bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            {VIEWS.map((v) => (
              <button
                key={v.id}
                onClick={() => setView(v.id)}
                className={`flex items-center gap-1.5 px-4 py-2 text-[10px] font-black uppercase tracking-wider transition-all ${
                  view === v.id
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>

        {/* Views */}
        <div className="flex-1 overflow-auto px-6 pb-6">
          <AnimatePresence mode="wait">
            {/* KANBAN */}
            {view === 'kanban' && (
              <motion.div
                key="kanban"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="h-full"
              >
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 h-full min-h-[500px]">
                  <div className="grid grid-cols-3 gap-5 h-full">
                    {COLUMNS.map((col) => (
                      <div
                        key={col.id}
                        className="flex flex-col gap-3"
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => draggedId && moveTask(draggedId, col.id)}
                      >
                        <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 pb-1">
                          {col.label}
                          <span className="ml-2 text-slate-300">{colTasks(col.id).length}</span>
                        </p>

                        {colTasks(col.id).map((task) => (
                          <motion.div
                            key={task.id}
                            layout
                            draggable
                            onDragStart={() => setDraggedId(task.id)}
                            onDragEnd={() => setDraggedId(null)}
                            className={`bg-white rounded-xl border border-slate-200 p-4 shadow-sm cursor-grab active:cursor-grabbing group transition-shadow hover:shadow-md ${
                              draggedId === task.id ? 'opacity-40' : ''
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2 mb-3">
                              <p className="text-sm font-bold text-slate-800 leading-snug flex-1">{task.title}</p>
                              <button
                                onClick={() => deleteTask(task.id)}
                                className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-slate-300 hover:text-red-400 transition-all shrink-0"
                              >
                                <X size={12} />
                              </button>
                            </div>

                            {/* OKR / KPI */}
                            <div className="bg-slate-50 rounded-lg px-3 py-2 mb-3 space-y-1">
                              <p className="text-[11px] text-blue-500 font-semibold">OKR: {task.okr}</p>
                              <p className="text-[11px] text-orange-400 font-semibold">KPI: {task.kpi}</p>
                            </div>

                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                                {task.sprint}
                              </span>
                              <span className="text-[11px] text-slate-500 font-medium">{task.assignee}</span>
                            </div>
                          </motion.div>
                        ))}

                        {/* Add card */}
                        {adding === col.id ? (
                          <div className="bg-white rounded-xl border border-proji-primary/40 p-3">
                            <input
                              autoFocus
                              value={newTitle}
                              onChange={(e) => setNewTitle(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') addTask(col.id);
                                if (e.key === 'Escape') { setAdding(null); setNewTitle(''); }
                              }}
                              placeholder="Название задачи..."
                              className="w-full text-sm text-slate-800 placeholder:text-slate-400 outline-none"
                            />
                            <div className="flex gap-2 mt-2">
                              <button onClick={() => addTask(col.id)} className="text-[11px] font-bold text-white bg-proji-primary px-3 py-1.5 rounded-lg hover:bg-proji-primary/90 transition-colors">
                                Добавить
                              </button>
                              <button onClick={() => { setAdding(null); setNewTitle(''); }} className="text-[11px] font-bold text-slate-400 hover:text-slate-700 px-2 py-1.5 transition-colors">
                                Отмена
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => setAdding(col.id)}
                            className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 hover:text-proji-primary transition-colors py-1"
                          >
                            <Plus size={13} /> Добавить задачу
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* LIST */}
            {view === 'list' && (
              <motion.div
                key="list"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex flex-col gap-2"
              >
                {COLUMNS.map((col) => (
                  <div key={col.id} className="mb-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 px-1">
                      {col.label} · {colTasks(col.id).length}
                    </p>
                    {colTasks(col.id).map((task) => (
                      <div key={task.id} className="flex items-center gap-4 bg-white border border-slate-200 rounded-xl px-4 py-3 mb-2 group hover:border-slate-300 transition-colors">
                        <div className={`w-2 h-2 rounded-full shrink-0 ${col.id === 'done' ? 'bg-green-400' : col.id === 'inprogress' ? 'bg-amber-400' : 'bg-slate-300'}`} />
                        <p className="flex-1 text-sm font-semibold text-slate-800">{task.title}</p>
                        <span className="text-[11px] text-blue-500 hidden sm:block">OKR: {task.okr}</span>
                        <span className="text-[11px] text-orange-400 hidden md:block">KPI: {task.kpi}</span>
                        <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md hidden sm:block">{task.sprint}</span>
                        <span className="text-[11px] text-slate-500 hidden md:block">{task.assignee}</span>
                        <button onClick={() => deleteTask(task.id)} className="opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-red-400 transition-all">
                          <X size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                ))}
              </motion.div>
            )}

            {/* GANTT */}
            {view === 'gantt' && (
              <motion.div
                key="gantt"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              >
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                  {/* Gantt header */}
                  <div className="grid border-b border-slate-100" style={{ gridTemplateColumns: '200px repeat(8, 1fr)' }}>
                    <div className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 border-r border-slate-100">Задача</div>
                    {['Нед 1', 'Нед 2', 'Нед 3', 'Нед 4', 'Нед 5', 'Нед 6', 'Нед 7', 'Нед 8'].map((w) => (
                      <div key={w} className="px-2 py-3 text-[10px] font-bold text-slate-400 text-center border-r border-slate-100 last:border-0">{w}</div>
                    ))}
                  </div>
                  {tasks.map((task, i) => {
                    const start = i % 4;
                    const duration = 2 + (i % 3);
                    return (
                      <div key={task.id} className="grid border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors" style={{ gridTemplateColumns: '200px repeat(8, 1fr)' }}>
                        <div className="px-4 py-3 border-r border-slate-100">
                          <p className="text-xs font-semibold text-slate-800 truncate">{task.title}</p>
                          <p className="text-[10px] text-slate-400">{task.assignee}</p>
                        </div>
                        {Array.from({ length: 8 }).map((_, w) => (
                          <div key={w} className="py-3 px-1 border-r border-slate-50 last:border-0 flex items-center">
                            {w >= start && w < start + duration && (
                              <div className={`h-5 w-full rounded-full text-[9px] font-bold text-white flex items-center justify-center ${
                                task.col === 'done' ? 'bg-green-400' : task.col === 'inprogress' ? 'bg-proji-primary' : 'bg-slate-300'
                              }`}>
                                {w === start ? task.sprint : ''}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* EISENHOWER */}
            {view === 'eisenhower' && (
              <motion.div
                key="eisenhower"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="h-full min-h-[500px]"
              >
                <div className="grid grid-cols-2 gap-4 h-full">
                  {[
                    { label: 'Важно + Срочно', sub: 'Сделать немедленно', color: 'border-red-200 bg-red-50/40', dot: 'bg-red-400', keys: ['high'] as Priority[] },
                    { label: 'Важно + Не срочно', sub: 'Запланировать', color: 'border-blue-200 bg-blue-50/40', dot: 'bg-blue-400', keys: ['medium'] as Priority[] },
                    { label: 'Не важно + Срочно', sub: 'Делегировать', color: 'border-amber-200 bg-amber-50/40', dot: 'bg-amber-400', keys: [] as Priority[] },
                    { label: 'Не важно + Не срочно', sub: 'Исключить', color: 'border-slate-200 bg-slate-50', dot: 'bg-slate-300', keys: ['low'] as Priority[] },
                  ].map((quad) => {
                    const qtasks = tasks.filter((t) => quad.keys.includes(t.priority));
                    return (
                      <div key={quad.label} className={`rounded-2xl border-2 ${quad.color} p-4 flex flex-col gap-3`}>
                        <div className="flex items-center gap-2">
                          <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${quad.dot}`} />
                          <div>
                            <p className="text-xs font-black text-slate-700">{quad.label}</p>
                            <p className="text-[10px] text-slate-400">{quad.sub}</p>
                          </div>
                        </div>
                        {qtasks.map((task) => (
                          <div key={task.id} className="bg-white rounded-xl border border-slate-100 px-3 py-2.5 group">
                            <p className="text-xs font-semibold text-slate-800">{task.title}</p>
                            <div className="flex items-center justify-between mt-1.5">
                              <span className="text-[10px] text-slate-400">{task.assignee}</span>
                              <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">{task.sprint}</span>
                            </div>
                          </div>
                        ))}
                        {qtasks.length === 0 && (
                          <p className="text-[11px] text-slate-400 text-center py-4">Пусто</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PageWrapper>
  );
}
