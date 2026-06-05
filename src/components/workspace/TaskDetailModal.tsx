'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  X,
  Pencil,
  Check,
  Trash2,
  Sparkles,
  Plus,
  Loader2,
  Download,
  Paperclip,
} from 'lucide-react';
import {
  KANBAN_STATUS_IDS,
  type KanbanStatus,
  type TaskAttachment,
  type TaskCheckItem,
  type TaskHistoryEntry,
  type WorkspaceTask,
} from '../../types/workspace';
import { TeamChat } from './TeamChat';
import { useI18n } from '../../context/I18nContext';
import { tKanbanStatus } from '../../i18n/helpers';
import {
  formatDueDateOnly,
  isCrmLeadTask,
  parseChecklistFromAi,
  toDateInputValue,
} from '../../lib/task-detail-utils';

type TabId = 'properties' | 'chat';

type Props = {
  task: WorkspaceTask;
  onClose: () => void;
  onUpdateTask: (id: string, patch: Partial<WorkspaceTask>) => void | Promise<void>;
  onDeleteTask: (id: string) => void | Promise<void>;
  workspaceId: string;
  currentUserEmail: string;
  currentUserName: string;
  workspaceMembers: { name: string; email: string }[];
  workspaceOptions?: { id: string; name: string }[];
  openToChatTab?: boolean;
};

const PRIORITIES = ['Low', 'Medium', 'High'] as const;

export function TaskDetailModal({
  task,
  onClose,
  onUpdateTask,
  onDeleteTask,
  workspaceId,
  currentUserEmail,
  currentUserName,
  workspaceMembers,
  workspaceOptions = [{ id: 'general', name: 'Общее' }],
  openToChatTab = false,
}: Props) {
  const { t } = useI18n();
  const crmLead = isCrmLeadTask(task.description);

  const [activeTab, setActiveTab] = useState<TabId>(openToChatTab && !crmLead ? 'chat' : 'properties');
  const [isEditingTask, setIsEditingTask] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description ?? '');
  const [editDueDate, setEditDueDate] = useState(toDateInputValue(task.dueDate));
  const [editPriority, setEditPriority] = useState(task.priority);
  const [editAssigneeEmails, setEditAssigneeEmails] = useState<string[]>(
    task.assigneeEmail ? [task.assigneeEmail] : [],
  );
  const [editCategory, setEditCategory] = useState(task.category ?? 'Общее');
  const [viewingVersionId, setViewingVersionId] = useState<string>('current');
  const [showFrameworks, setShowFrameworks] = useState(false);
  const [isEnriching, setIsEnriching] = useState(false);
  const [editingChecklistId, setEditingChecklistId] = useState<string | null>(null);
  const [isGeneratingChecklist, setIsGeneratingChecklist] = useState(false);
  const [checklistError, setChecklistError] = useState<string | null>(null);
  const [newCheckItem, setNewCheckItem] = useState('');
  const [isUploadingAttachment, setIsUploadingAttachment] = useState(false);
  const [previewAttachment, setPreviewAttachment] = useState<TaskAttachment | null>(null);
  const [previewText, setPreviewText] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  useEffect(() => {
    setViewingVersionId('current');
    setShowFrameworks(false);
    setIsEditingTask(false);
    setEditingChecklistId(null);
    setEditTitle(task.title);
    setEditDescription(task.description ?? '');
    setEditDueDate(toDateInputValue(task.dueDate));
    setEditPriority(task.priority);
    setEditAssigneeEmails(task.assigneeEmail ? [task.assigneeEmail] : []);
    setEditCategory(task.category ?? 'Общее');
    if (openToChatTab && !crmLead) setActiveTab('chat');
  }, [task.id, openToChatTab, crmLead, task]);

  const history = task.history ?? [];
  const appliedFrameworks = task.appliedFrameworks ?? [];
  const checklist = task.checklist ?? [];

  const versionTabs = useMemo(
    () => [
      { id: 'current', label: t('tasksDetail.currentVersion') },
      ...appliedFrameworks.map((fw) => ({ id: fw, label: fw })),
      ...history.map((h) => ({ id: h.id, label: h.label })),
    ],
    [appliedFrameworks, history, t],
  );

  const displayedDescription = useMemo(() => {
    if (viewingVersionId === 'current') return task.description ?? '';
    const h = history.find((v) => v.id === viewingVersionId);
    if (h) return h.description;
    return task.description ?? '';
  }, [viewingVersionId, task.description, history]);

  const update = useCallback(
    (patch: Partial<WorkspaceTask>) => {
      void onUpdateTask(task.id, { ...patch, updatedAt: new Date().toISOString() });
    },
    [onUpdateTask, task.id],
  );

  const updateChecklist = (next: TaskCheckItem[]) => {
    update({ checklist: next });
  };

  const handleStatusChange = (status: KanbanStatus) => {
    const patch: Partial<WorkspaceTask> = { status };
    if (status === 'Готово') patch.completedAt = new Date().toISOString();
    update(patch);
  };

  const startEditingTask = () => {
    setEditTitle(task.title);
    setEditDescription(task.description ?? '');
    setEditDueDate(toDateInputValue(task.dueDate));
    setEditPriority(task.priority);
    setEditAssigneeEmails(task.assigneeEmail ? [task.assigneeEmail] : []);
    setEditCategory(task.category ?? 'Общее');
    setIsEditingTask(true);
  };

  const cancelEditingTask = () => setIsEditingTask(false);

  const saveEditingTask = () => {
    const email = editAssigneeEmails[0];
    const member = workspaceMembers.find((m) => m.email === email);
    update({
      title: editTitle.trim() || task.title,
      description: editDescription,
      dueDate: editDueDate ? new Date(editDueDate).toISOString() : undefined,
      priority: editPriority,
      assigneeEmail: email,
      assigneeName: member?.name ?? task.assigneeName,
      category: editCategory,
    });
    setIsEditingTask(false);
  };

  const handleDelete = () => {
    if (!confirm(t('tasksDetail.deleteConfirm'))) return;
    void onDeleteTask(task.id);
    onClose();
  };

  const toggleCheckItem = (id: string) => {
    updateChecklist(
      checklist.map((c) => (c.id === id ? { ...c, completed: !c.completed } : c)),
    );
  };

  const updateCheckItemText = (id: string, text: string) => {
    updateChecklist(checklist.map((c) => (c.id === id ? { ...c, text } : c)));
  };

  const deleteCheckItem = (id: string) => {
    updateChecklist(checklist.filter((c) => c.id !== id));
  };

  const addCheckItem = () => {
    const text = newCheckItem.trim();
    if (!text) return;
    updateChecklist([
      ...checklist,
      { id: `chk-${Date.now()}`, text, completed: false },
    ]);
    setNewCheckItem('');
  };

  const generateChecklistWithAI = async () => {
    setChecklistError(null);
    setIsGeneratingChecklist(true);
    try {
      const res = await fetch('/api/gemini/task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'checklist',
          title: task.title,
          description: task.description,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'AI failed');
      updateChecklist(parseChecklistFromAi(data.text ?? ''));
    } catch (e) {
      setChecklistError(e instanceof Error ? e.message : 'Ошибка AI');
    } finally {
      setIsGeneratingChecklist(false);
    }
  };

  const applyFramework = async (framework: 'SMART' | '5whys') => {
    setIsEnriching(true);
    try {
      const res = await fetch('/api/gemini/task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: framework === 'SMART' ? 'smart' : '5whys',
          title: task.title,
          description: task.description,
          framework,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'AI failed');
      const entry: TaskHistoryEntry = {
        id: `hist-${Date.now()}`,
        label: framework === 'SMART' ? t('tasksDetail.smart') : t('tasksDetail.fiveWhys'),
        description: data.text ?? '',
        createdAt: new Date().toISOString(),
        framework,
      };
      const prevDesc = task.description ?? '';
      const hist: TaskHistoryEntry[] = prevDesc
        ? [
            ...(task.history ?? []),
            {
              id: `hist-prev-${Date.now()}`,
              label: t('tasksDetail.beforeEnhance'),
              description: prevDesc,
              createdAt: new Date().toISOString(),
            },
          ]
        : [...(task.history ?? [])];
      update({
        description: data.text ?? prevDesc,
        history: [...hist, entry],
        appliedFrameworks: [...new Set([...(task.appliedFrameworks ?? []), entry.label])],
      });
      setViewingVersionId('current');
      setShowFrameworks(false);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Ошибка AI');
    } finally {
      setIsEnriching(false);
    }
  };

  const restoreVersion = () => {
    const h = history.find((v) => v.id === viewingVersionId);
    if (!h) return;
    const snapshot: TaskHistoryEntry = {
      id: `hist-${Date.now()}`,
      label: t('tasksDetail.beforeEnhance'),
      description: task.description ?? '',
      createdAt: new Date().toISOString(),
    };
    update({
      description: h.description,
      history: [...history, snapshot],
    });
    setViewingVersionId('current');
  };

  const handleAttachmentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingAttachment(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('folder', 'task-attachments');
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Upload failed');
      const att: TaskAttachment = {
        id: data.id,
        name: data.name,
        type: data.type,
        size: data.size,
        url: data.url,
      };
      update({ attachments: [...(task.attachments ?? []), att] });
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Ошибка загрузки');
    } finally {
      setIsUploadingAttachment(false);
      e.target.value = '';
    }
  };

  const removeAttachment = (id: string) => {
    update({ attachments: (task.attachments ?? []).filter((a) => a.id !== id) });
  };

  const openPreview = async (att: TaskAttachment) => {
    setPreviewAttachment(att);
    setPreviewText(null);
    setPreviewLoading(true);
    try {
      if (att.type.startsWith('image/')) {
        setPreviewLoading(false);
        return;
      }
      const res = await fetch(att.url);
      if (att.name.endsWith('.docx')) {
        const fd = new FormData();
        const blob = await res.blob();
        fd.append('file', blob, att.name);
        const tr = await fetch('/api/file-text', { method: 'POST', body: fd });
        const data = await tr.json();
        setPreviewText(data.text ?? '');
      } else {
        setPreviewText(await res.text());
      }
    } catch {
      setPreviewText(t('tasksDetail.previewFailed'));
    } finally {
      setPreviewLoading(false);
    }
  };

  const toggleAssignee = (email: string) => {
    setEditAssigneeEmails((prev) =>
      prev.includes(email) ? prev.filter((e) => e !== email) : [email],
    );
  };

  return (
    <>
      <div
        className="fixed inset-0 z-[80] bg-black/40 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start gap-3 px-5 py-4 border-b border-slate-200 shrink-0">
            <div className="flex-1 min-w-0">
              {task.tag && (
                <span className="inline-block mb-1 px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-slate-100 text-slate-600">
                  {task.tag}
                </span>
              )}
              {isEditingTask ? (
                <input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full text-xl font-bold text-slate-800 border border-slate-200 rounded-lg px-3 py-1.5"
                />
              ) : (
                <h2 className="text-xl font-bold text-slate-800 truncate">{task.title}</h2>
              )}
            </div>

            <select
              value={task.status}
              onChange={(e) => handleStatusChange(e.target.value as KanbanStatus)}
              className="text-sm font-semibold border border-slate-200 rounded-lg px-2 py-1.5 bg-white"
            >
              {KANBAN_STATUS_IDS.map((s) => (
                <option key={s} value={s}>
                  {tKanbanStatus(t, s)}
                </option>
              ))}
            </select>

            <div className="flex items-center gap-1 shrink-0">
              {isEditingTask ? (
                <>
                  <button type="button" onClick={saveEditingTask} className="p-2 rounded-lg hover:bg-green-50 text-green-600" title={t('tasksDetail.save')}>
                    <Check size={18} />
                  </button>
                  <button type="button" onClick={cancelEditingTask} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 text-xs font-bold">
                    {t('tasksDetail.cancel')}
                  </button>
                </>
              ) : (
                <button type="button" onClick={startEditingTask} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500">
                  <Pencil size={18} />
                </button>
              )}
              <button type="button" onClick={handleDelete} className="p-2 rounded-lg hover:bg-red-50 text-red-500">
                <Trash2 size={18} />
              </button>
              <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500">
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="flex flex-1 min-h-0 overflow-hidden">
            {/* Left */}
            <div className="flex-1 overflow-y-auto p-5 border-r border-slate-100 space-y-6">
              {!crmLead && (
                <>
                  <div>
                    <div className="flex gap-1 flex-wrap mb-2">
                      {versionTabs.map((tab) => (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setViewingVersionId(tab.id)}
                          className={`px-2.5 py-1 text-xs font-semibold rounded-lg ${
                            viewingVersionId === tab.id
                              ? 'bg-proji-primary/10 text-proji-primary'
                              : 'text-slate-500 hover:bg-slate-100'
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>
                    {viewingVersionId !== 'current' && (
                      <div className="mb-2 p-2 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between gap-2">
                        <span className="text-xs text-amber-800">{t('tasksDetail.viewingVersion')}</span>
                        <button
                          type="button"
                          onClick={restoreVersion}
                          className="text-xs font-bold text-amber-700 hover:underline"
                        >
                          {t('tasksDetail.restoreVersion')}
                        </button>
                      </div>
                    )}
                    {isEditingTask ? (
                      <textarea
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        rows={8}
                        className="w-full text-sm border border-slate-200 rounded-xl p-3 font-mono"
                      />
                    ) : (
                      <div className="prose prose-sm max-w-none text-slate-700">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {displayedDescription || t('tasksDetail.noDescription')}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="text-xs font-bold uppercase text-slate-500 mb-2">{t('tasksDetail.checklist')}</h3>
                    {checklistError && <p className="text-xs text-red-500 mb-2">{checklistError}</p>}
                    <ul className="space-y-1.5 mb-2">
                      {checklist.map((item) => (
                        <li key={item.id} className="flex items-center gap-2 group">
                          <input
                            type="checkbox"
                            checked={item.completed}
                            onChange={() => toggleCheckItem(item.id)}
                            className="rounded border-slate-300"
                          />
                          {editingChecklistId === item.id ? (
                            <input
                              autoFocus
                              defaultValue={item.text}
                              onBlur={(e) => {
                                updateCheckItemText(item.id, e.target.value);
                                setEditingChecklistId(null);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  updateCheckItemText(item.id, e.currentTarget.value);
                                  setEditingChecklistId(null);
                                }
                              }}
                              className="flex-1 text-sm border border-slate-200 rounded px-2 py-0.5"
                            />
                          ) : (
                            <button
                              type="button"
                              onClick={() => setEditingChecklistId(item.id)}
                              className={`flex-1 text-left text-sm ${item.completed ? 'line-through text-slate-400' : 'text-slate-700'}`}
                            >
                              {item.text}
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => deleteCheckItem(item.id)}
                            className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500"
                          >
                            <Trash2 size={14} />
                          </button>
                        </li>
                      ))}
                    </ul>
                    <div className="flex gap-2">
                      <input
                        value={newCheckItem}
                        onChange={(e) => setNewCheckItem(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addCheckItem()}
                        placeholder={t('tasksDetail.newItem')}
                        className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-1.5"
                      />
                      <button type="button" onClick={addCheckItem} className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200">
                        <Plus size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => void generateChecklistWithAI()}
                        disabled={isGeneratingChecklist}
                        className="p-2 rounded-lg bg-blue-50 text-proji-primary hover:bg-blue-100 disabled:opacity-50"
                      >
                        {isGeneratingChecklist ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold uppercase text-slate-500 mb-2">{t('tasksDetail.attachments')}</h3>
                    <div className="flex flex-wrap gap-2">
                      {(task.attachments ?? []).map((att) => (
                        <div
                          key={att.id}
                          className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                        >
                          <Paperclip size={14} className="text-slate-400" />
                          <span className="truncate max-w-[120px]">{att.name}</span>
                          <button type="button" onClick={() => void openPreview(att)} className="text-proji-primary">
                            <Download size={14} />
                          </button>
                          <button type="button" onClick={() => removeAttachment(att.id)} className="text-slate-400 hover:text-red-500">
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                      <label className="flex items-center justify-center w-24 h-16 border-2 border-dashed border-slate-200 rounded-lg cursor-pointer hover:border-proji-primary/40">
                        {isUploadingAttachment ? (
                          <Loader2 size={20} className="animate-spin text-slate-400" />
                        ) : (
                          <Plus size={20} className="text-slate-400" />
                        )}
                        <input
                          type="file"
                          className="hidden"
                          accept=".pdf,.doc,.docx,.txt,.xls,.xlsx,.png,.jpg,.jpeg"
                          onChange={(e) => void handleAttachmentUpload(e)}
                        />
                      </label>
                    </div>
                  </div>
                </>
              )}

              {crmLead && (
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{task.description ?? ''}</ReactMarkdown>
                </div>
              )}
            </div>

            {/* Right */}
            <div className="w-[320px] shrink-0 flex flex-col bg-slate-50/50">
              {!crmLead && (
                <div className="flex border-b border-slate-200">
                  <button
                    type="button"
                    onClick={() => setActiveTab('properties')}
                    className={`flex-1 py-2.5 text-xs font-bold uppercase ${
                      activeTab === 'properties' ? 'text-proji-primary border-b-2 border-proji-primary bg-white' : 'text-slate-500'
                    }`}
                  >
                    {t('tasksDetail.properties')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('chat')}
                    className={`flex-1 py-2.5 text-xs font-bold uppercase ${
                      activeTab === 'chat' ? 'text-proji-primary border-b-2 border-proji-primary bg-white' : 'text-slate-500'
                    }`}
                  >
                    {t('tasksDetail.chat')}
                  </button>
                </div>
              )}

              <div className="flex-1 overflow-y-auto p-4">
                {activeTab === 'properties' || crmLead ? (
                  <div className="space-y-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase text-slate-500 mb-2">{t('tasksDetail.aiTools')}</p>
                      {!showFrameworks ? (
                        <button
                          type="button"
                          onClick={() => setShowFrameworks(true)}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold hover:border-proji-primary/30"
                        >
                          <Sparkles size={14} className="text-proji-primary" />
                          {t('tasksDetail.enhanceTask')}
                        </button>
                      ) : (
                        <div className="space-y-2">
                          <button
                            type="button"
                            disabled={isEnriching}
                            onClick={() => void applyFramework('SMART')}
                            className="w-full px-3 py-2 rounded-lg bg-white border text-sm font-semibold hover:bg-blue-50"
                          >
                            SMART
                          </button>
                          <button
                            type="button"
                            disabled={isEnriching}
                            onClick={() => void applyFramework('5whys')}
                            className="w-full px-3 py-2 rounded-lg bg-white border text-sm font-semibold hover:bg-blue-50"
                          >
                            5 Whys
                          </button>
                          {isEnriching && (
                            <p className="text-xs text-slate-500 flex items-center gap-1">
                              <Loader2 size={12} className="animate-spin" /> {t('tasksDetail.processing')}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    <div>
                      <p className="text-[10px] font-bold uppercase text-slate-500 mb-1">{t('tasksDetail.priority')}</p>
                      {isEditingTask ? (
                        <div className="flex gap-1">
                          {PRIORITIES.map((p) => (
                            <button
                              key={p}
                              type="button"
                              onClick={() => setEditPriority(p)}
                              className={`flex-1 py-1.5 text-xs font-bold rounded-lg border ${
                                editPriority === p ? 'bg-proji-primary text-white border-proji-primary' : 'bg-white border-slate-200'
                              }`}
                            >
                              {p}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm font-semibold text-slate-700">{task.priority}</p>
                      )}
                    </div>

                    <div>
                      <p className="text-[10px] font-bold uppercase text-slate-500 mb-1">{t('tasksDetail.assignee')}</p>
                      {isEditingTask ? (
                        <div className="space-y-2">
                          <select
                            className="w-full text-sm border border-slate-200 rounded-lg px-2 py-1.5"
                            value=""
                            onChange={(e) => e.target.value && toggleAssignee(e.target.value)}
                          >
                            <option value="">{t('tasksDetail.addAssignee')}</option>
                            {workspaceMembers.map((m) => (
                              <option key={m.email} value={m.email}>
                                {m.name}
                              </option>
                            ))}
                          </select>
                          <div className="flex flex-wrap gap-1">
                            {editAssigneeEmails.map((em) => {
                              const m = workspaceMembers.find((x) => x.email === em);
                              return (
                                <span key={em} className="inline-flex items-center gap-1 px-2 py-0.5 bg-white border rounded-full text-xs">
                                  {m?.name ?? em}
                                  <button type="button" onClick={() => toggleAssignee(em)}>
                                    <X size={10} />
                                  </button>
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm font-semibold text-slate-700">{task.assigneeName}</p>
                      )}
                    </div>

                    {isEditingTask && (
                      <div>
                        <p className="text-[10px] font-bold uppercase text-slate-500 mb-1">{t('tasksDetail.section')}</p>
                        <select
                          value={editCategory}
                          onChange={(e) => setEditCategory(e.target.value)}
                          className="w-full text-sm border border-slate-200 rounded-lg px-2 py-1.5"
                        >
                          {workspaceOptions.map((o) => (
                            <option key={o.id} value={o.name}>
                              {o.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div>
                      <p className="text-[10px] font-bold uppercase text-slate-500 mb-1">{t('tasksDetail.dueDate')}</p>
                      {isEditingTask ? (
                        <input
                          type="date"
                          value={editDueDate}
                          onChange={(e) => setEditDueDate(e.target.value)}
                          className="w-full text-sm border border-slate-200 rounded-lg px-2 py-1.5"
                        />
                      ) : (
                        <p className="text-sm text-slate-700">{formatDueDateOnly(task.dueDate)}</p>
                      )}
                    </div>

                    <div className="text-xs text-slate-500 space-y-1 pt-2 border-t border-slate-200">
                      <p>{t('tasksDetail.created')}: {formatDueDateOnly(task.createdAt)}</p>
                      <p>{t('tasksDetail.author')}: {task.authorName ?? currentUserName}</p>
                    </div>
                  </div>
                ) : (
                  <TeamChat
                    workspaceId={workspaceId}
                    taskId={task.id}
                    taskTitle={task.title}
                    currentUserEmail={currentUserEmail}
                    className="h-[min(400px,50vh)]"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {previewAttachment && (
        <div
          className="fixed inset-0 z-[90] bg-black/50 flex items-center justify-center p-6"
          onClick={() => setPreviewAttachment(null)}
        >
          <div
            className="bg-white rounded-xl max-w-2xl max-h-[80vh] overflow-auto p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between mb-3">
              <h4 className="font-bold text-sm">{previewAttachment.name}</h4>
              <button type="button" onClick={() => setPreviewAttachment(null)}>
                <X size={18} />
              </button>
            </div>
            {previewLoading && <Loader2 className="animate-spin mx-auto" />}
            {!previewLoading && previewAttachment.type.startsWith('image/') && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={previewAttachment.url} alt="" className="max-w-full" />
            )}
            {!previewLoading && previewText && (
              <pre className="text-xs whitespace-pre-wrap text-slate-700">{previewText}</pre>
            )}
          </div>
        </div>
      )}
    </>
  );
}
