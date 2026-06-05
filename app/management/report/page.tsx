'use client';
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  BarChart3, TrendingUp, TrendingDown, Users, Target,
  CheckCircle2, AlertTriangle, Clock, Megaphone,
} from 'lucide-react';
import { PageWrapper } from '../../../src/components/PageWrapper';
import { adminTasksApi, reportsApi, projectsApi, type AdminTask } from '../../../src/lib/api';

interface KPI {
  label:    string;
  value:    string;
  target:   string;
  progress: number;
  trend:    'up' | 'down' | 'flat';
  delta:    string;
}

const KPIS: KPI[] = [
  { label: 'Выручка',          value: '₽ 12.4M',  target: '₽ 15M',  progress: 83, trend: 'up',   delta: '+8%' },
  { label: 'Чистая прибыль',   value: '₽ 3.1M',   target: '₽ 4M',   progress: 78, trend: 'up',   delta: '+5%' },
  { label: 'NPS клиентов',     value: '72',        target: '80',      progress: 90, trend: 'up',   delta: '+12' },
  { label: 'Загрузка команды', value: '74%',       target: '85%',     progress: 87, trend: 'flat', delta: '0%' },
  { label: 'Дебиторка',        value: '₽ 1.8M',   target: '< ₽ 1M', progress: 44, trend: 'down', delta: '+20%' },
  { label: 'OKR выполнение',   value: '11 / 15',   target: '15 / 15', progress: 73, trend: 'up',   delta: '+2' },
];

const DEPT_STATS = [
  { dept: 'Финансы',      done: 12, pending: 3,  risk: 'low' },
  { dept: 'Маркетинг',    done: 8,  pending: 5,  risk: 'medium' },
  { dept: 'Юридический',  done: 6,  pending: 2,  risk: 'low' },
  { dept: 'Операции',     done: 15, pending: 8,  risk: 'high' },
  { dept: 'Производство', done: 20, pending: 4,  risk: 'low' },
];

const RISK_COLOR: Record<string, string> = {
  low:    'bg-green-100 text-green-600',
  medium: 'bg-yellow-100 text-yellow-700',
  high:   'bg-red-100 text-red-600',
};

export default function ManagementReportPage() {
  const [adminTasks, setAdminTasks] = useState<AdminTask[]>([]);
  const [sentReports, setSentReports] = useState<any[]>([]);
  const [projects, setProjects]     = useState<any[]>([]);

  useEffect(() => {
    const p = projectsApi.getAll();
    setProjects(p);
    setAdminTasks(adminTasksApi.getAll());
    setSentReports(reportsApi.getAll(p));
  }, []);

  const activeAdminTasks = adminTasks.filter((t) => t.status === 'active');

  return (
    <PageWrapper>
      <div className="max-w-5xl mx-auto w-full px-4 md:px-10 pb-16">

        <div className="flex items-center gap-3 mb-2 pt-1">
          <BarChart3 size={20} className="text-proji-primary" />
          <h1 className="text-xl font-black text-slate-900">Управленческий отчёт</h1>
        </div>
        <p className="text-sm text-slate-400 mb-8">
          {new Date().toLocaleDateString('ru', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>

        {/* KPI Grid */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Ключевые показатели</p>
            <div className="flex-1 h-px bg-slate-100" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {KPIS.map((kpi) => (
              <div key={kpi.label} className="bg-white rounded-2xl border border-slate-100 p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-bold text-slate-500">{kpi.label}</p>
                  {kpi.trend === 'up'   && <TrendingUp   size={14} className="text-green-500" />}
                  {kpi.trend === 'down' && <TrendingDown  size={14} className="text-red-500" />}
                  {kpi.trend === 'flat' && <BarChart3     size={14} className="text-slate-400" />}
                </div>
                <div className="flex items-end justify-between mb-3">
                  <p className="text-2xl font-black text-slate-900">{kpi.value}</p>
                  <p className={`text-xs font-bold ${kpi.trend === 'up' ? 'text-green-500' : kpi.trend === 'down' ? 'text-red-500' : 'text-slate-400'}`}>
                    {kpi.delta}
                  </p>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${kpi.progress >= 80 ? 'bg-green-400' : kpi.progress >= 60 ? 'bg-yellow-400' : 'bg-red-400'}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${kpi.progress}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1.5">Цель: {kpi.target} · {kpi.progress}%</p>
              </div>
            ))}
          </div>
        </div>

        {/* Department overview */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">По отделам</p>
            <div className="flex-1 h-px bg-slate-100" />
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <div className="grid grid-cols-4 gap-4 px-5 py-3 border-b border-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <span>Отдел</span><span>Выполнено</span><span>В работе</span><span>Риск</span>
            </div>
            {DEPT_STATS.map((d) => (
              <div key={d.dept} className="grid grid-cols-4 gap-4 px-5 py-3.5 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                <p className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                  <Users size={13} className="text-proji-primary" />{d.dept}
                </p>
                <p className="text-sm text-green-600 font-bold self-center">{d.done}</p>
                <p className="text-sm text-slate-500 self-center">{d.pending}</p>
                <span className={`self-center text-[10px] font-bold px-2 py-0.5 rounded-full w-fit ${RISK_COLOR[d.risk]}`}>
                  {d.risk === 'low' ? 'Низкий' : d.risk === 'medium' ? 'Средний' : 'Высокий'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Active broadcast tasks */}
        {activeAdminTasks.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Активные задачи рассылки</p>
              <div className="flex-1 h-px bg-slate-100" />
            </div>
            <div className="flex flex-col gap-3">
              {activeAdminTasks.map((task) => (
                <div key={task.id} className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Megaphone size={14} className="text-proji-primary shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-slate-800">{task.title}</p>
                      <p className="text-xs text-slate-400">{task.targetDomain === 'all' ? 'Всем' : task.targetDomain}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    task.priority === 'high' ? 'bg-red-100 text-red-600' :
                    task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {task.priority === 'high' ? 'Срочно' : task.priority === 'medium' ? 'Средний' : 'Низкий'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent employee reports */}
        {sentReports.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Последние отчёты сотрудников</p>
              <div className="flex-1 h-px bg-slate-100" />
            </div>
            <div className="flex flex-col gap-3">
              {sentReports.slice(0, 5).map((r: any) => (
                <div key={r.id} className="bg-white rounded-2xl border border-slate-100 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold text-slate-700 capitalize">{r.date}</p>
                    <p className="text-xs text-proji-primary font-semibold">{r.projectName}</p>
                  </div>
                  {r.tasks?.length > 0 && (
                    <div className="flex flex-col gap-1 mb-2">
                      {r.tasks.slice(0, 3).map((t: string, i: number) => (
                        <div key={i} className="flex items-center gap-2">
                          <CheckCircle2 size={11} className="text-green-400 shrink-0" />
                          <span className="text-xs text-slate-600">{t}</span>
                        </div>
                      ))}
                      {r.tasks.length > 3 && <p className="text-[10px] text-slate-400">+{r.tasks.length - 3} задач</p>}
                    </div>
                  )}
                  {r.description && (
                    <p className="text-xs text-slate-400 italic">«{r.description.slice(0, 100)}{r.description.length > 100 ? '...' : ''}»</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {sentReports.length === 0 && activeAdminTasks.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-100">
            <Target size={28} className="text-slate-200 mx-auto mb-3" />
            <p className="text-sm text-slate-400">Нет данных для отчёта</p>
            <p className="text-xs text-slate-300 mt-1">Сотрудники ещё не отправляли отчёты и не получали задачи</p>
          </div>
        )}

      </div>
    </PageWrapper>
  );
}
