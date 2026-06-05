'use client';
import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronLeft, CheckCircle2, Send, Play, Pause, Timer,
  Square, CheckSquare, RotateCcw,
} from 'lucide-react';
import { PageWrapper } from '../../../../src/components/PageWrapper';
import { useAppStore } from '../../../../src/store/useAppStore';

const TIMER_KEY = (id: string) => `proji_timer_${id}`;
const REPORTS_KEY = (id: string) => `proji_reports_${id}`;

interface SentReport {
  id: string;
  date: string;
  description: string;
  tasks: string[];
  duration: string;
}

function formatDuration(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function todayLabel() {
  return new Date().toLocaleDateString('ru', { weekday: 'long', day: 'numeric', month: 'long' });
}

export default function ProjectReportsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { projects } = useAppStore();
  const project = projects.find((p) => p.id === id);

  // Timer state
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Report state
  const [doneTasks, setDoneTasks] = useState<{ title: string }[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [description, setDescription] = useState('');
  const [sent, setSent] = useState(false);
  const [reports, setReports] = useState<SentReport[]>([]);

  // Load persisted timer + reports + completed tasks from localStorage
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(TIMER_KEY(id)) || '{}');
      if (saved.elapsed) setElapsed(saved.elapsed);
      if (saved.running && saved.startedAt) {
        const extra = Math.floor((Date.now() - saved.startedAt) / 1000);
        setElapsed((saved.elapsed ?? 0) + extra);
        setRunning(true);
      }
      setReports(JSON.parse(localStorage.getItem(REPORTS_KEY(id)) || '[]'));

      const tasks: { title: string; status: string }[] = JSON.parse(
        localStorage.getItem(`proji_ptasks_${id}`) || '[]'
      );
      setDoneTasks(tasks.filter((t) => t.status === 'completed'));
    } catch {}
  }, [id]);

  // Tick
  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running]);

  // Persist timer
  useEffect(() => {
    localStorage.setItem(TIMER_KEY(id), JSON.stringify({
      elapsed,
      running,
      startedAt: running ? Date.now() : null,
    }));
  }, [elapsed, running, id]);

  const resetTimer = () => { setRunning(false); setElapsed(0); };

  const toggleTask = (title: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(title) ? next.delete(title) : next.add(title);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === doneTasks.length) setSelected(new Set());
    else setSelected(new Set(doneTasks.map((t) => t.title)));
  };

  const handleSend = () => {
    if (selected.size === 0 && !description.trim()) return;
    const report: SentReport = {
      id: Date.now().toString(),
      date: todayLabel(),
      description: description.trim(),
      tasks: [...selected],
      duration: formatDuration(elapsed),
    };
    const updated = [report, ...reports];
    setReports(updated);
    localStorage.setItem(REPORTS_KEY(id), JSON.stringify(updated));
    setSent(true);
    setTimeout(() => { setSent(false); setDescription(''); setSelected(new Set()); }, 2000);
  };

  const allSelected = doneTasks.length > 0 && selected.size === doneTasks.length;
  const canSend = selected.size > 0 || description.trim().length > 0;

  if (!project) return null;

  return (
    <PageWrapper>
      <div className="max-w-2xl mx-auto w-full px-4 md:px-10 pb-16">

        {/* Back */}
        <button
          onClick={() => router.push(`/projects/${id}`)}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-700 transition-colors mb-6 mt-1"
        >
          <ChevronLeft size={14} /> Назад к проекту
        </button>

        {/* Title */}
        <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
          <div>
            <h2 className="text-xl font-black text-slate-900">Отчёт за день</h2>
            <p className="text-sm text-slate-400 mt-0.5 capitalize">{todayLabel()}</p>
          </div>

          {/* Work day timer */}
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-2xl px-4 py-3">
            <Timer size={15} className={running ? 'text-proji-primary' : 'text-slate-300'} />
            <span className={`text-lg font-black tabular-nums ${running ? 'text-slate-900' : 'text-slate-400'}`}>
              {formatDuration(elapsed)}
            </span>
            <div className="flex items-center gap-1 ml-1">
              <button
                onClick={() => setRunning((v) => !v)}
                className={`p-1.5 rounded-lg transition-all ${running ? 'bg-orange-50 text-orange-500 hover:bg-orange-100' : 'bg-proji-primary/10 text-proji-primary hover:bg-proji-primary/20'}`}
                title={running ? 'Пауза' : 'Начать рабочий день'}
              >
                {running ? <Pause size={13} /> : <Play size={13} />}
              </button>
              {elapsed > 0 && (
                <button
                  onClick={resetTimer}
                  className="p-1.5 rounded-lg text-slate-300 hover:text-slate-500 hover:bg-slate-100 transition-all"
                  title="Сбросить"
                >
                  <RotateCcw size={13} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Report form */}
        <div className="flex flex-col gap-5">

          {/* Completed tasks selector */}
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
              <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                Выполненные задачи
                {doneTasks.length > 0 && (
                  <span className="ml-2 bg-green-100 text-green-600 px-1.5 py-0.5 rounded-full text-[10px]">
                    {doneTasks.length}
                  </span>
                )}
              </p>
              {doneTasks.length > 0 && (
                <button
                  onClick={toggleAll}
                  className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-700 transition-colors"
                >
                  {allSelected
                    ? <><CheckSquare size={13} className="text-proji-primary" /> Снять все</>
                    : <><Square size={13} /> Выбрать все</>}
                </button>
              )}
            </div>

            {doneTasks.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <CheckCircle2 size={24} className="text-slate-200 mx-auto mb-2" />
                <p className="text-sm text-slate-400">Нет выполненных задач</p>
                <p className="text-xs text-slate-300 mt-1">Отметьте задачи как выполненные во вкладке «Задачи»</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {doneTasks.map((task) => (
                  <button
                    key={task.title}
                    onClick={() => toggleTask(task.title)}
                    className={`w-full flex items-center gap-3 px-5 py-3.5 text-left transition-colors ${
                      selected.has(task.title) ? 'bg-proji-primary/5' : 'hover:bg-slate-50'
                    }`}
                  >
                    {selected.has(task.title)
                      ? <CheckSquare size={15} className="text-proji-primary shrink-0" />
                      : <Square size={15} className="text-slate-300 shrink-0" />}
                    <CheckCircle2 size={14} className="text-green-400 shrink-0" />
                    <span className="text-sm font-medium text-slate-700">{task.title}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Description */}
          <div className="bg-white rounded-3xl border border-slate-200 px-5 py-4">
            <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-3">
              Комментарий к отчёту
            </p>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Опишите итоги дня, сложности, что планируете завтра..."
              rows={4}
              className="w-full text-sm text-slate-800 placeholder:text-slate-300 outline-none resize-none leading-relaxed"
            />
          </div>

          {/* Send button */}
          <button
            onClick={handleSend}
            disabled={!canSend || sent}
            className={`w-full py-4 rounded-2xl text-sm font-black transition-all flex items-center justify-center gap-2 ${
              sent
                ? 'bg-green-500 text-white'
                : canSend
                  ? 'bg-proji-primary text-white hover:bg-proji-primary/90 shadow-sm'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            {sent
              ? <><CheckCircle2 size={16} /> Отчёт отправлен администратору</>
              : <><Send size={15} /> Отправить отчёт администратору</>}
          </button>

          {/* Summary preview */}
          <AnimatePresence>
            {(selected.size > 0 || description.trim()) && !sent && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="bg-slate-50 rounded-2xl border border-slate-200 px-5 py-4 text-xs text-slate-500"
              >
                <p className="font-bold text-slate-700 mb-2">Предпросмотр отчёта</p>
                {selected.size > 0 && (
                  <p className="mb-1">✓ Задач выполнено: <span className="font-bold text-green-600">{selected.size}</span></p>
                )}
                {elapsed > 0 && (
                  <p className="mb-1">⏱ Время работы: <span className="font-bold text-slate-700">{formatDuration(elapsed)}</span></p>
                )}
                {description.trim() && (
                  <p className="mt-2 text-slate-500 italic">«{description.slice(0, 120)}{description.length > 120 ? '...' : ''}»</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* History */}
        {reports.length > 0 && (
          <div className="mt-12 flex flex-col gap-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">История отчётов</p>
            {reports.map((r) => (
              <div key={r.id} className="bg-white rounded-2xl border border-slate-100 p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[11px] font-bold text-slate-400 capitalize">{r.date}</p>
                  {r.duration !== '00:00:00' && (
                    <span className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                      <Timer size={11} /> {r.duration}
                    </span>
                  )}
                </div>
                {r.tasks.length > 0 && (
                  <div className="flex flex-col gap-1.5 mb-3">
                    {r.tasks.map((t, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <CheckCircle2 size={12} className="text-green-400 shrink-0" />
                        <span className="text-xs text-slate-600">{t}</span>
                      </div>
                    ))}
                  </div>
                )}
                {r.description && (
                  <p className="text-xs text-slate-500 italic border-t border-slate-50 pt-3">«{r.description}»</p>
                )}
              </div>
            ))}
          </div>
        )}

      </div>
    </PageWrapper>
  );
}
