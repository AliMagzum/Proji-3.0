'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronLeft, Plus, Download, X, Paperclip,
  Calendar, AlertTriangle, Clock, CheckCircle2,
  MessageSquare, ThumbsDown, Trophy, Send,
  FileText, Sheet, File,
} from 'lucide-react';
import { PageWrapper } from '../../../../src/components/PageWrapper';
import { useModalClose } from '../../../../src/hooks/useModalClose';

// ─── Types ───────────────────────────────────────────────────────────────────

type TaskStatus = 'new' | 'accepted' | 'review' | 'declined' | 'completed';

interface Attachment { name: string; ext: string }

interface ProjectTask {
  id: string;
  title: string;
  description: string;
  deadline: number;   // days remaining; 0 = urgent
  isUrgent: boolean;
  attachments: Attachment[];
  status: TaskStatus;
  source: 'teamlead' | 'self';
  declineReason?: string;
  declineComment?: string;
  createdAt: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STORAGE_KEY = (id: string) => `proji_ptasks_${id}`;

const DECLINE_REASONS = [
  'Нехватка ресурсов',
  'Нереалистичные сроки',
  'Задача вне компетенции',
  'Технические ограничения',
  'Конфликт приоритетов',
  'Задача уже выполнена другим',
  'Другое',
];

const MOCK_TEAMLEAD_TASKS: Omit<ProjectTask, 'id' | 'createdAt'>[] = [
  {
    title: 'Настроить CI/CD пайплайн',
    description: 'Необходимо настроить автоматический деплой через GitHub Actions. Включает настройку env-переменных, Docker-контейнеров и уведомлений в Slack.',
    deadline: 7, isUrgent: false, source: 'teamlead', status: 'new',
    attachments: [{ name: 'CI_CD_ТЗ', ext: 'doc' }, { name: 'Pipeline_схема', ext: 'xlsx' }],
  },
  {
    title: 'Провести code review PR #42',
    description: 'Ревью пул-реквеста с рефакторингом модуля авторизации. Обратить внимание на безопасность и соответствие code style.',
    deadline: 0, isUrgent: true, source: 'teamlead', status: 'new',
    attachments: [{ name: 'CodeReview_чеклист', ext: 'doc' }],
  },
  {
    title: 'Написать документацию API',
    description: 'Задокументировать все публичные эндпоинты в формате OpenAPI 3.0. Примеры запросов и ответов обязательны.',
    deadline: 14, isUrgent: false, source: 'teamlead', status: 'new',
    attachments: [{ name: 'API_endpoints_список', ext: 'xlsx' }],
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const EXT_ICON: Record<string, React.ReactNode> = {
  doc:  <FileText size={13} className="text-blue-500" />,
  docx: <FileText size={13} className="text-blue-500" />,
  xlsx: <Sheet size={13} className="text-green-600" />,
  xls:  <Sheet size={13} className="text-green-600" />,
  pdf:  <File size={13} className="text-red-500" />,
};

const STATUS_STYLE: Record<TaskStatus, string> = {
  new:       'border-l-4 border-l-blue-400',
  accepted:  'border-l-4 border-l-slate-300',
  review:    'border-l-4 border-l-yellow-400 bg-yellow-50/40',
  declined:  'border-l-4 border-l-red-400 bg-red-50/40',
  completed: 'border-l-4 border-l-green-400 bg-green-50/40',
};

const STATUS_BADGE: Record<TaskStatus, { label: string; cls: string }> = {
  new:       { label: 'Новая',             cls: 'bg-blue-100 text-blue-700' },
  accepted:  { label: 'Принята',           cls: 'bg-slate-100 text-slate-600' },
  review:    { label: 'На пересмотре',     cls: 'bg-yellow-100 text-yellow-700' },
  declined:  { label: 'Отклонена',         cls: 'bg-red-100 text-red-600' },
  completed: { label: 'Выполнена',         cls: 'bg-green-100 text-green-700' },
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function ProjectTasksPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [selected, setSelected] = useState<ProjectTask | null>(null);
  const [view, setView] = useState<'detail' | 'decline' | 'report'>('detail');
  const [declineReason, setDeclineReason] = useState('');
  const [declineComment, setDeclineComment] = useState('');
  const [reportMsg, setReportMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newDeadline, setNewDeadline] = useState(3);
  const [newUrgent, setNewUrgent] = useState(false);

  useEffect(() => {
    try { setTasks(JSON.parse(localStorage.getItem(STORAGE_KEY(id)) || '[]')); } catch {}
  }, [id]);

  const persist = (t: ProjectTask[]) => {
    setTasks(t);
    localStorage.setItem(STORAGE_KEY(id), JSON.stringify(t));
  };

  const update = (taskId: string, patch: Partial<ProjectTask>) => {
    const updated = tasks.map((t) => t.id === taskId ? { ...t, ...patch } : t);
    persist(updated);
    setSelected((prev) => prev?.id === taskId ? { ...prev, ...patch } : prev);
  };

  useModalClose(() => { setSelected(null); setView('detail'); }, !!selected);
  useModalClose(() => setShowCreateModal(false), showCreateModal);

  const openTask = (task: ProjectTask) => {
    setSelected(task);
    setView('detail');
    setDeclineReason('');
    setDeclineComment('');
    setReportMsg('');
  };

  const handleAccept = () => update(selected!.id, { status: 'accepted' });

  const handleComplete = () => update(selected!.id, { status: 'completed' });

  const handleReport = () => {
    update(selected!.id, { status: 'review' });
    setView('detail');
    setReportMsg('');
  };

  const handleDecline = () => {
    if (!declineReason) return;
    update(selected!.id, {
      status: 'declined',
      declineReason,
      declineComment: declineComment.trim(),
    });
    setView('detail');
  };

  const getTeamleadTasks = () => {
    setLoading(true);
    setTimeout(() => {
      const existing = new Set(tasks.map((t) => t.title));
      const newTasks: ProjectTask[] = MOCK_TEAMLEAD_TASKS
        .filter((t) => !existing.has(t.title))
        .map((t) => ({ ...t, id: Date.now().toString() + Math.random(), createdAt: new Date().toISOString() }));
      persist([...newTasks, ...tasks]);
      setLoading(false);
    }, 800);
  };

  const createSelfTask = () => {
    if (!newTitle.trim()) return;
    const task: ProjectTask = {
      id: Date.now().toString(), title: newTitle.trim(), description: newDesc.trim(),
      deadline: newUrgent ? 0 : newDeadline, isUrgent: newUrgent,
      attachments: [], status: 'accepted', source: 'self',
      createdAt: new Date().toISOString(),
    };
    persist([task, ...tasks]);
    setShowCreateModal(false);
    setNewTitle(''); setNewDesc(''); setNewDeadline(3); setNewUrgent(false);
  };

  const groups: { label: string; statuses: TaskStatus[] }[] = [
    { label: 'Новые от команды',  statuses: ['new'] },
    { label: 'В работе',          statuses: ['accepted'] },
    { label: 'На пересмотре',     statuses: ['review'] },
    { label: 'Выполнены',         statuses: ['completed'] },
    { label: 'Отклонены',         statuses: ['declined'] },
  ];

  return (
    <PageWrapper>
      <div className="max-w-3xl mx-auto w-full px-4 md:px-10 pb-16">

        {/* Back */}
        <button onClick={() => router.push(`/projects/${id}`)}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-700 transition-colors mb-6 mt-1">
          <ChevronLeft size={14} /> Назад к проекту
        </button>

        <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
          <h2 className="text-xl font-black text-slate-900">Задачи</h2>
          <div className="flex gap-2">
            <button onClick={getTeamleadTasks} disabled={loading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-dashed border-slate-300 text-slate-500 text-sm font-bold hover:border-proji-primary hover:text-proji-primary transition-all disabled:opacity-60">
              <Download size={14} /> {loading ? 'Загрузка...' : '+ Получить задачи'}
            </button>
            <button onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-proji-primary text-white text-sm font-bold hover:bg-proji-primary/90 transition-all">
              <Plus size={14} /> Создать свою задачу
            </button>
          </div>
        </div>

        {/* Task groups */}
        {tasks.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-16">Задач пока нет</p>
        ) : (
          <div className="flex flex-col gap-8">
            {groups.map(({ label, statuses }) => {
              const items = tasks.filter((t) => statuses.includes(t.status));
              if (!items.length) return null;
              return (
                <div key={label}>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">{label}</p>
                  <div className="flex flex-col gap-2">
                    {items.map((task) => (
                      <motion.button key={task.id} onClick={() => openTask(task)} layout
                        whileHover={{ x: 2 }}
                        className={`w-full text-left bg-white rounded-2xl border border-slate-100 px-5 py-4 transition-all hover:shadow-sm ${STATUS_STYLE[task.status]}`}>
                        <div className="flex items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              {task.isUrgent && (
                                <span className="flex items-center gap-1 text-[10px] font-black text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                                  <AlertTriangle size={10} /> СРОЧНО
                                </span>
                              )}
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_BADGE[task.status].cls}`}>
                                {STATUS_BADGE[task.status].label}
                              </span>
                            </div>
                            <p className="text-sm font-bold text-slate-800 truncate">{task.title}</p>
                            {task.description && (
                              <p className="text-xs text-slate-400 mt-0.5 truncate">{task.description}</p>
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-1.5 shrink-0">
                            {!task.isUrgent && task.deadline > 0 && (
                              <span className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                                <Calendar size={11} /> {task.deadline}д
                              </span>
                            )}
                            {task.attachments.length > 0 && (
                              <span className="flex items-center gap-1 text-[11px] text-slate-300">
                                <Paperclip size={11} /> {task.attachments.length}
                              </span>
                            )}
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Task detail modal ── */}
      <AnimatePresence>
        {selected && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => { setSelected(null); setView('detail'); }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden"
              style={{ maxHeight: '85vh' }}
            >
              {/* Modal header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
                <div className="flex items-center gap-2 flex-wrap">
                  {selected.isUrgent && (
                    <span className="flex items-center gap-1 text-[10px] font-black text-red-600 bg-red-50 px-2.5 py-1 rounded-full">
                      <AlertTriangle size={11} /> СРОЧНО
                    </span>
                  )}
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${STATUS_BADGE[selected.status].cls}`}>
                    {STATUS_BADGE[selected.status].label}
                  </span>
                </div>
                <button onClick={() => { setSelected(null); setView('detail'); }}
                  className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors">
                  <X size={15} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-5">

                {/* ── Detail view ── */}
                {view === 'detail' && (
                  <div className="flex flex-col gap-5">
                    <h3 className="text-lg font-black text-slate-900">{selected.title}</h3>

                    {selected.description && (
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">Описание</p>
                        <p className="text-sm text-slate-600 leading-relaxed">{selected.description}</p>
                      </div>
                    )}

                    <div className="flex items-center gap-4">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Срок</p>
                        {selected.isUrgent ? (
                          <span className="flex items-center gap-1.5 text-sm font-bold text-red-600">
                            <AlertTriangle size={14} /> Срочно
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-sm font-bold text-slate-700">
                            <Clock size={14} className="text-slate-400" />
                            {selected.deadline === 1 ? '1 день' : `${selected.deadline} дней`}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Источник</p>
                        <span className="text-sm font-semibold text-slate-600">
                          {selected.source === 'teamlead' ? 'От тимлида' : 'Своя задача'}
                        </span>
                      </div>
                    </div>

                    {selected.attachments.length > 0 && (
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Прикреплённые файлы</p>
                        <div className="flex flex-wrap gap-2">
                          {selected.attachments.map((f, i) => (
                            <div key={i} className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700">
                              {EXT_ICON[f.ext] ?? <File size={13} className="text-slate-400" />}
                              {f.name}.{f.ext}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {selected.status === 'declined' && selected.declineReason && (
                      <div className="bg-red-50 border border-red-100 rounded-2xl px-4 py-3">
                        <p className="text-[10px] font-black uppercase tracking-widest text-red-400 mb-1">Причина отказа</p>
                        <p className="text-sm font-semibold text-red-700">{selected.declineReason}</p>
                        {selected.declineComment && <p className="text-xs text-red-500 mt-1">{selected.declineComment}</p>}
                      </div>
                    )}

                    {selected.status === 'review' && (
                      <div className="bg-yellow-50 border border-yellow-100 rounded-2xl px-4 py-3 flex items-center gap-2">
                        <Clock size={15} className="text-yellow-500 shrink-0" />
                        <p className="text-sm font-semibold text-yellow-700">Ожидается пересмотрение от администратора</p>
                      </div>
                    )}

                    {selected.status === 'completed' && (
                      <div className="bg-green-50 border border-green-100 rounded-2xl px-4 py-3 flex items-center gap-2">
                        <Trophy size={15} className="text-green-500 shrink-0" />
                        <p className="text-sm font-semibold text-green-700">Задача успешно выполнена</p>
                      </div>
                    )}
                  </div>
                )}

                {/* ── Report view ── */}
                {view === 'report' && (
                  <div className="flex flex-col gap-4">
                    <div>
                      <p className="text-base font-black text-slate-900 mb-1">Запрос на пересмотр</p>
                      <p className="text-sm text-slate-400">Опишите причину — администратор получит уведомление</p>
                    </div>
                    <textarea
                      value={reportMsg}
                      onChange={(e) => setReportMsg(e.target.value)}
                      placeholder="Опишите ситуацию или вопрос..."
                      rows={4}
                      className="w-full text-sm text-slate-800 placeholder:text-slate-300 outline-none resize-none border border-slate-200 rounded-2xl px-4 py-3 leading-relaxed focus:border-proji-primary transition-colors"
                    />
                  </div>
                )}

                {/* ── Decline view ── */}
                {view === 'decline' && (
                  <div className="flex flex-col gap-4">
                    <div>
                      <p className="text-base font-black text-slate-900 mb-1">Причина отказа</p>
                      <p className="text-sm text-slate-400">Выберите причину и при необходимости добавьте комментарий</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      {DECLINE_REASONS.map((reason) => (
                        <label key={reason} className={`flex items-center gap-3 px-4 py-3 rounded-2xl border cursor-pointer transition-all ${declineReason === reason ? 'border-red-300 bg-red-50' : 'border-slate-200 hover:border-slate-300'}`}>
                          <input type="radio" name="reason" value={reason}
                            checked={declineReason === reason}
                            onChange={() => setDeclineReason(reason)}
                            className="accent-red-500 shrink-0" />
                          <span className="text-sm font-medium text-slate-700">{reason}</span>
                        </label>
                      ))}
                    </div>
                    <textarea
                      value={declineComment}
                      onChange={(e) => setDeclineComment(e.target.value)}
                      placeholder="Дополнительный комментарий (необязательно)..."
                      rows={3}
                      className="w-full text-sm text-slate-700 placeholder:text-slate-300 outline-none resize-none border border-slate-200 rounded-2xl px-4 py-3 leading-relaxed focus:border-red-300 transition-colors"
                    />
                  </div>
                )}
              </div>

              {/* Modal footer — buttons */}
              <div className="px-6 py-4 border-t border-slate-100 shrink-0 bg-slate-50/50">
                {view === 'detail' && (
                  <div className="flex gap-2 flex-wrap">
                    {/* Report button — always available unless completed/declined */}
                    {!['completed', 'declined', 'review'].includes(selected.status) && (
                      <button onClick={() => setView('report')}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:border-yellow-400 hover:text-yellow-600 hover:bg-yellow-50 transition-all">
                        <MessageSquare size={14} /> Report
                      </button>
                    )}

                    {/* New task: Accept + Decline */}
                    {selected.status === 'new' && (
                      <>
                        <button onClick={() => setView('decline')}
                          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:border-red-300 hover:text-red-600 hover:bg-red-50 transition-all">
                          <ThumbsDown size={14} /> Отказать
                        </button>
                        <button onClick={handleAccept}
                          className="ml-auto flex items-center gap-2 px-5 py-2.5 rounded-xl bg-proji-primary text-white text-sm font-bold hover:bg-proji-primary/90 transition-all">
                          <CheckCircle2 size={14} /> Принять
                        </button>
                      </>
                    )}

                    {/* Accepted task: Decline + Complete */}
                    {selected.status === 'accepted' && (
                      <>
                        <button onClick={() => setView('decline')}
                          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:border-red-300 hover:text-red-600 hover:bg-red-50 transition-all">
                          <ThumbsDown size={14} /> Отказать
                        </button>
                        <button onClick={handleComplete}
                          className="ml-auto flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-500 text-white text-sm font-bold hover:bg-green-600 transition-all">
                          <Trophy size={14} /> Завершить успешно
                        </button>
                      </>
                    )}

                    {/* Review: back button only */}
                    {selected.status === 'review' && (
                      <button onClick={() => setView('decline')}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:border-red-300 hover:text-red-600 hover:bg-red-50 transition-all">
                        <ThumbsDown size={14} /> Отказать
                      </button>
                    )}
                  </div>
                )}

                {view === 'report' && (
                  <div className="flex gap-2">
                    <button onClick={() => setView('detail')}
                      className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-400 hover:text-slate-700 transition-colors">
                      Отмена
                    </button>
                    <button onClick={handleReport}
                      className="ml-auto flex items-center gap-2 px-5 py-2.5 rounded-xl bg-yellow-500 text-white text-sm font-bold hover:bg-yellow-600 transition-all">
                      <Send size={14} /> Отправить на пересмотр
                    </button>
                  </div>
                )}

                {view === 'decline' && (
                  <div className="flex gap-2">
                    <button onClick={() => setView('detail')}
                      className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-400 hover:text-slate-700 transition-colors">
                      Отмена
                    </button>
                    <button onClick={handleDecline} disabled={!declineReason}
                      className="ml-auto flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 disabled:opacity-40 transition-all">
                      <Send size={14} /> Отправить отказ
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Create own task modal ── */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowCreateModal(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 p-6"
            >
              <button onClick={() => setShowCreateModal(false)}
                className="absolute top-4 right-4 p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors">
                <X size={15} />
              </button>
              <h3 className="text-base font-black text-slate-900 mb-5">Новая задача</h3>
              <div className="flex flex-col gap-4">
                <input autoFocus value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Название задачи"
                  className="w-full text-sm font-semibold text-slate-800 placeholder:text-slate-300 outline-none border-b border-slate-200 pb-2 focus:border-proji-primary transition-colors" />
                <textarea value={newDesc} onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Описание..." rows={3}
                  className="w-full text-sm text-slate-600 placeholder:text-slate-300 outline-none resize-none" />
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={newUrgent} onChange={(e) => setNewUrgent(e.target.checked)}
                    className="accent-red-500 w-4 h-4" />
                  <span className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                    <AlertTriangle size={13} className="text-red-500" /> Срочно
                  </span>
                </label>
                {!newUrgent && (
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Срок выполнения</p>
                    <div className="flex items-center gap-3">
                      <input type="range" min={1} max={30} value={newDeadline}
                        onChange={(e) => setNewDeadline(+e.target.value)}
                        className="flex-1 accent-proji-primary" />
                      <span className="text-sm font-bold text-slate-700 w-16 text-right">
                        {newDeadline === 1 ? '1 день' : `${newDeadline} дней`}
                      </span>
                    </div>
                  </div>
                )}
                <button onClick={createSelfTask} disabled={!newTitle.trim()}
                  className="w-full py-3 rounded-2xl bg-proji-primary text-white text-sm font-black hover:bg-proji-primary/90 disabled:opacity-40 transition-all mt-2">
                  Создать задачу
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </PageWrapper>
  );
}
