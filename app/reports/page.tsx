'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import {
  CheckCircle2, RotateCcw, Folder, ChevronDown, ChevronRight,
  Timer, Search, X, Send, Play, Pause, Square, CheckSquare,
} from 'lucide-react';
import { PageWrapper } from '../../src/components/PageWrapper';
import { useAppStore } from '../../src/store/useAppStore';
import { useI18n } from '../../src/context/I18nContext';
import type { Locale } from '../../src/i18n/types';

type DoneProject = { id: string; name: string; doneTasks: { title: string }[] };

function formatDuration(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function todayLabel(locale: Locale) {
  const loc = locale === 'kz' ? 'kk-KZ' : locale === 'en' ? 'en-US' : 'ru-RU';
  return new Date().toLocaleDateString(loc, { weekday: 'long', day: 'numeric', month: 'long' });
}

export default function ReportsPage() {
  const router = useRouter();
  const { t, locale } = useI18n();
  const { projects } = useAppStore();

  // --- history state ---
  const [search, setSearch] = useState('');
  const [expandedProject, setExpandedProject] = useState<string | null>(null);
  const [projectsWithDone, setProjectsWithDone] = useState<DoneProject[]>([]);
  const [sentReports, setSentReports] = useState<any[]>([]);

  // --- compose form state ---
  const [showForm, setShowForm] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [projectTasks, setProjectTasks] = useState<{ title: string }[]>([]);
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
  const [description, setDescription] = useState('');
  const [showProjectDrop, setShowProjectDrop] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  // --- timer ---
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running]);

  // close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setShowProjectDrop(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const readStorage = useCallback(() => {
    const done: DoneProject[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key?.startsWith('proji_ptasks_')) continue;
      const projectId = key.replace('proji_ptasks_', '');
      try {
        const tasks: { title: string; status: string }[] = JSON.parse(localStorage.getItem(key) || '[]');
        const doneTasks = tasks.filter((t) => t.status === 'completed');
        if (!doneTasks.length) continue;
        const project = projects.find((p) => p.id === projectId);
        done.push({
          id: projectId,
          name: project?.name ?? t('reportsPage.projectFallback').replace('{id}', projectId.slice(-5)),
          doneTasks,
        });
      } catch {}
    }
    setProjectsWithDone(done);

    const all: any[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key?.startsWith('proji_reports_')) continue;
      const projectId = key.replace('proji_reports_', '');
      try {
        const reps = JSON.parse(localStorage.getItem(key) || '[]');
        const project = projects.find((p) => p.id === projectId);
        reps.forEach((r: any) => all.push({
          ...r,
          projectName: project?.name ?? t('reportsPage.projectFallback').replace('{id}', projectId.slice(-5)),
          projectId,
        }));
      } catch {}
    }
    setSentReports(all.sort((a, b) => String(b.id).localeCompare(String(a.id))));
  }, [projects, t]);

  useEffect(() => { readStorage(); }, [readStorage]);

  // load tasks for selected project
  useEffect(() => {
    if (!selectedProjectId) { setProjectTasks([]); setSelectedTasks(new Set()); return; }
    try {
      const raw: { title: string; status: string }[] = JSON.parse(
        localStorage.getItem(`proji_ptasks_${selectedProjectId}`) || '[]'
      );
      const done = raw.filter((t) => t.status === 'completed');
      setProjectTasks(done);
      setSelectedTasks(new Set());
    } catch { setProjectTasks([]); }
  }, [selectedProjectId]);

  const patchTasks = (projectId: string, patch: (t: any) => any) => {
    try {
      const key = `proji_ptasks_${projectId}`;
      const tasks = JSON.parse(localStorage.getItem(key) || '[]');
      localStorage.setItem(key, JSON.stringify(tasks.map(patch)));
      readStorage();
    } catch {}
  };

  const restoreTask = (projectId: string, title: string) =>
    patchTasks(projectId, (t) => t.title === title ? { ...t, status: 'accepted' } : t);

  const restoreAll = (projectId: string) =>
    patchTasks(projectId, (t) => t.status === 'completed' ? { ...t, status: 'accepted' } : t);

  const toggleTask = (title: string) => {
    setSelectedTasks((prev) => {
      const next = new Set(prev);
      next.has(title) ? next.delete(title) : next.add(title);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedTasks.size === projectTasks.length) setSelectedTasks(new Set());
    else setSelectedTasks(new Set(projectTasks.map((t) => t.title)));
  };

  const handleSend = () => {
    if (!selectedProjectId) return;
    if (selectedTasks.size === 0 && !description.trim()) return;
    const report = {
      id: Date.now().toString(),
      date: todayLabel(locale),
      description: description.trim(),
      tasks: [...selectedTasks],
      duration: formatDuration(elapsed),
    };
    const key = `proji_reports_${selectedProjectId}`;
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    localStorage.setItem(key, JSON.stringify([report, ...existing]));
    // reset form and hide it
    setShowForm(false);
    setDescription('');
    setSelectedTasks(new Set());
    setSelectedProjectId('');
    setElapsed(0);
    setRunning(false);
    readStorage();
  };

  const selectedProject = projects.find((p) => p.id === selectedProjectId);
  const canSend = !!selectedProjectId && (selectedTasks.size > 0 || description.trim().length > 0);
  const allSelected = projectTasks.length > 0 && selectedTasks.size === projectTasks.length;
  const totalDone = projectsWithDone.reduce((acc, p) => acc + p.doneTasks.length, 0);

  const filtered = search.trim()
    ? projectsWithDone
        .map((p) => ({ ...p, doneTasks: p.doneTasks.filter((t) => t.title.toLowerCase().includes(search.toLowerCase())) }))
        .filter((p) => p.doneTasks.length > 0)
    : projectsWithDone;

  return (
    <PageWrapper>
      <div className="max-w-3xl mx-auto w-full px-4 md:px-10 pb-16">

        <div className="flex items-center justify-between mb-2 pt-1">
          <h1 className="text-xl font-black text-slate-900">{t('reportsPage.title')}</h1>
          <span className="text-[11px] font-bold bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full">
            {t('reportsPage.completedCount').replace('{count}', String(totalDone))}
          </span>
        </div>
        <p className="text-sm text-slate-400 mb-8">{t('reportsPage.subtitle')}</p>

        {/* ── Compose report toggle ── */}
        <button
          onClick={() => setShowForm((v) => !v)}
          className="w-full flex items-center justify-between px-5 py-3.5 bg-white border border-slate-200 rounded-2xl mb-3 hover:border-proji-primary/40 transition-colors group"
        >
          <span className="flex items-center gap-2 text-sm font-bold text-slate-700 group-hover:text-proji-primary transition-colors">
            <Send size={14} /> {t('reportsPage.newReport')}
          </span>
          <ChevronDown
            size={14}
            className={`text-slate-400 transition-transform duration-200 ${showForm ? 'rotate-180' : ''}`}
          />
        </button>

        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden mb-10"
            >
              <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden">
                {/* Timer header */}
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                  <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">{t('reportsPage.composeTitle')}</p>
                  <div className="flex items-center gap-2">
                    <Timer size={13} className={running ? 'text-proji-primary' : 'text-slate-300'} />
                    <span className={`text-sm font-black tabular-nums ${running ? 'text-slate-900' : 'text-slate-400'}`}>
                      {formatDuration(elapsed)}
                    </span>
                    <button
                      onClick={() => setRunning((v) => !v)}
                      className={`p-1.5 rounded-lg transition-all ${running ? 'bg-orange-50 text-orange-500 hover:bg-orange-100' : 'bg-proji-primary/10 text-proji-primary hover:bg-proji-primary/20'}`}
                    >
                      {running ? <Pause size={12} /> : <Play size={12} />}
                    </button>
                    {elapsed > 0 && (
                      <button
                        onClick={() => { setRunning(false); setElapsed(0); }}
                        className="p-1.5 rounded-lg text-slate-300 hover:text-slate-500 hover:bg-slate-100 transition-all"
                      >
                        <RotateCcw size={12} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="p-6 flex flex-col gap-4">
                  {/* Project selector */}
                  <div ref={dropRef} className="relative">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2">{t('reportsPage.project')}</p>
                    <button
                      onClick={() => setShowProjectDrop((v) => !v)}
                      className="w-full flex items-center justify-between gap-2 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-700 hover:border-proji-primary/40 transition-colors"
                    >
                      <span className={selectedProject ? 'font-semibold text-slate-800' : 'text-slate-400'}>
                        {selectedProject ? selectedProject.name : t('reportsPage.selectProject')}
                      </span>
                      <ChevronDown size={14} className="text-slate-400 shrink-0" />
                    </button>
                    <AnimatePresence>
                      {showProjectDrop && (
                        <motion.div
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          className="absolute z-20 top-full mt-1 w-full bg-white border border-slate-200 rounded-2xl shadow-lg overflow-hidden"
                        >
                          {projects.length === 0 ? (
                            <p className="px-4 py-3 text-sm text-slate-400">{t('reportsPage.noProjects')}</p>
                          ) : (
                            projects.map((p) => (
                              <button
                                key={p.id}
                                onClick={() => { setSelectedProjectId(p.id); setShowProjectDrop(false); }}
                                className={`w-full flex items-center gap-2 px-4 py-3 text-sm text-left hover:bg-slate-50 transition-colors ${selectedProjectId === p.id ? 'text-proji-primary font-bold' : 'text-slate-700'}`}
                              >
                                <Folder size={13} className="text-proji-primary shrink-0" />
                                {p.name}
                              </button>
                            ))
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Completed tasks */}
                  {selectedProjectId && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                          {t('reportsPage.completedTasks')}
                          {projectTasks.length > 0 && (
                            <span className="ml-2 bg-green-100 text-green-600 px-1.5 py-0.5 rounded-full text-[10px]">
                              {projectTasks.length}
                            </span>
                          )}
                        </p>
                        {projectTasks.length > 0 && (
                          <button
                            onClick={toggleAll}
                            className="flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-slate-700 transition-colors"
                          >
                            {allSelected
                              ? <><CheckSquare size={12} className="text-proji-primary" /> {t('reportsPage.deselectAll')}</>
                              : <><Square size={12} /> {t('reportsPage.selectAll')}</>}
                          </button>
                        )}
                      </div>
                      {projectTasks.length === 0 ? (
                        <p className="text-sm text-slate-400 py-3">{t('reportsPage.noCompletedInProject')}</p>
                      ) : (
                        <div className="flex flex-col divide-y divide-slate-50 border border-slate-100 rounded-2xl overflow-hidden">
                          {projectTasks.map((task) => (
                            <button
                              key={task.title}
                              onClick={() => toggleTask(task.title)}
                              className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${selectedTasks.has(task.title) ? 'bg-proji-primary/5' : 'hover:bg-slate-50'}`}
                            >
                              {selectedTasks.has(task.title)
                                ? <CheckSquare size={14} className="text-proji-primary shrink-0" />
                                : <Square size={14} className="text-slate-300 shrink-0" />}
                              <CheckCircle2 size={13} className="text-green-400 shrink-0" />
                              <span className="text-sm text-slate-700">{task.title}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Description */}
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2">{t('reportsPage.comment')}</p>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder={t('reportsPage.commentPlaceholder')}
                      rows={3}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-800 placeholder:text-slate-300 outline-none resize-none leading-relaxed focus:border-proji-primary/40 transition-colors"
                    />
                  </div>

                  {/* Send */}
                  <button
                    onClick={handleSend}
                    disabled={!canSend}
                    className={`w-full py-3.5 rounded-2xl text-sm font-black transition-all flex items-center justify-center gap-2 ${
                      canSend
                        ? 'bg-proji-primary text-white hover:bg-proji-primary/90 shadow-sm'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <Send size={14} /> {t('reportsPage.sendReport')}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Completed tasks history ── */}
        <div className="flex items-center gap-3 mb-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('reportsPage.completedTasks')}</p>
          <div className="flex-1 h-px bg-slate-100" />
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-2xl mb-4">
          <Search size={14} className="text-slate-300 shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('reportsPage.searchPlaceholder')}
            className="flex-1 text-sm text-slate-800 placeholder:text-slate-300 outline-none"
          />
          {search && <button onClick={() => setSearch('')}><X size={13} className="text-slate-300" /></button>}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-10">
            <CheckCircle2 size={28} className="text-slate-200 mx-auto mb-3" />
            <p className="text-sm text-slate-400">{search ? t('reportsPage.nothingFound') : t('reportsPage.noCompleted')}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 mb-10">
            {filtered.map((p) => {
              const open = expandedProject === p.id;
              return (
                <div key={p.id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                  <div
                    onClick={() => setExpandedProject(open ? null : p.id)}
                    className="flex items-center gap-3 px-5 py-4 hover:bg-slate-50 transition-colors cursor-pointer select-none"
                  >
                    <Folder size={15} className="text-proji-primary shrink-0" />
                    <span className="text-sm font-bold text-slate-800 flex-1">{p.name}</span>
                    <span className="text-[11px] font-bold bg-green-50 text-green-600 px-2 py-0.5 rounded-full mr-2">
                      {t('reportsPage.tasksCount').replace('{count}', String(p.doneTasks.length))}
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); restoreAll(p.id); }}
                      className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-proji-primary transition-colors mr-2 px-2 py-1 rounded-lg hover:bg-proji-primary/10"
                    >
                      <RotateCcw size={12} /> {t('reportsPage.restoreAll')}
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); router.push(`/projects/${p.id}`); }}
                      className="text-[11px] font-semibold text-slate-400 hover:text-proji-primary transition-colors mr-3"
                    >
                      {t('reportsPage.openProject')}
                    </button>
                    {open ? <ChevronDown size={14} className="text-slate-300" /> : <ChevronRight size={14} className="text-slate-300" />}
                  </div>

                  <AnimatePresence>
                    {open && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden border-t border-slate-50"
                      >
                        {p.doneTasks.map((task, i) => (
                          <div key={i} className="flex items-center gap-3 px-5 py-3 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors group">
                            <CheckCircle2 size={14} className="text-green-400 shrink-0" />
                            <span className="text-sm text-slate-600 flex-1 line-through">{task.title}</span>
                            <motion.button
                              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                              onClick={() => restoreTask(p.id, task.title)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold text-slate-400 border border-slate-200 hover:border-proji-primary hover:text-proji-primary hover:bg-proji-primary/5 transition-all opacity-0 group-hover:opacity-100"
                            >
                              <RotateCcw size={11} /> {t('reportsPage.restore')}
                            </motion.button>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Sent reports history ── */}
        {sentReports.length > 0 && (
          <>
            <div className="flex items-center gap-3 mb-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('reportsPage.sentReports')}</p>
              <div className="flex-1 h-px bg-slate-100" />
            </div>
            <div className="flex flex-col gap-3">
              {sentReports.map((r: any) => (
                <div key={r.id} className="bg-white rounded-2xl border border-slate-100 p-5">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <p className="text-xs font-black text-slate-700 capitalize">{r.date}</p>
                      <button
                        onClick={() => router.push(`/projects/${r.projectId}`)}
                        className="text-[11px] text-proji-primary font-semibold hover:underline flex items-center gap-1 mt-0.5"
                      >
                        <Folder size={10} /> {r.projectName}
                      </button>
                    </div>
                    {r.duration && r.duration !== '00:00:00' && (
                      <span className="flex items-center gap-1 text-[10px] text-slate-400 font-medium shrink-0">
                        <Timer size={11} /> {r.duration}
                      </span>
                    )}
                  </div>
                  {r.tasks?.length > 0 && (
                    <div className="flex flex-col gap-1.5 mb-3">
                      {r.tasks.map((t: string, i: number) => (
                        <div key={i} className="flex items-center gap-2">
                          <CheckCircle2 size={12} className="text-green-400 shrink-0" />
                          <span className="text-xs text-slate-600">{t}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {r.description && (
                    <p className="text-xs text-slate-400 italic border-t border-slate-50 pt-3">«{r.description}»</p>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

      </div>
    </PageWrapper>
  );
}
