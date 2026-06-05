'use client';
import { useState } from 'react';
import { Calendar, User, ChevronDown, Square, CheckSquare } from 'lucide-react';

type Priority = 'low' | 'medium' | 'high';

export interface TaskFormData {
  title: string;
  description: string;
  priority: Priority;
  dueDate: string;
  assignee: string;
  checklist: string[];
}

interface Props {
  onSave: (data: TaskFormData) => void;
  onCancel?: () => void;
  submitLabel?: string;
}

const PRIORITY_LABEL: Record<Priority, string> = { low: 'Низкий', medium: 'Средний', high: 'Высокий' };
const PRIORITY_ACTIVE: Record<Priority, string> = {
  low:    'bg-green-50 border-green-300 text-green-700',
  medium: 'bg-yellow-50 border-yellow-300 text-yellow-700',
  high:   'bg-red-50 border-red-300 text-red-700',
};

function getNextFriday() {
  const d = new Date();
  const daysUntil = (5 - d.getDay() + 7) % 7 || 7;
  d.setDate(d.getDate() + daysUntil);
  return d.toISOString().slice(0, 10);
}

export function TaskCreateForm({ onSave, onCancel, submitLabel = 'Добавить задачу' }: Props) {
  const [title, setTitle]               = useState('');
  const [description, setDescription]   = useState('');
  const [priority, setPriority]         = useState<Priority>('medium');
  const [dueDate, setDueDate]           = useState('');
  const [assignee, setAssignee]         = useState('');
  const [checklist, setChecklist]       = useState<string[]>([]);
  const [checkInput, setCheckInput]     = useState('');
  const [attempted, setAttempted]       = useState(false);

  const addCheckItem = () => {
    if (!checkInput.trim()) return;
    setChecklist([...checklist, checkInput.trim()]);
    setCheckInput('');
  };

  const handleSubmit = () => {
    setAttempted(true);
    if (!title.trim()) return;
    onSave({ title, description, priority, dueDate, assignee, checklist });
  };

  const formatDate = (iso: string) => {
    if (!iso) return 'Срок';
    return new Date(iso).toLocaleDateString('ru', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Title */}
      <input
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Название задачи"
        className="text-xl font-black text-slate-800 placeholder:text-slate-300 outline-none w-full border-none bg-transparent"
      />

      {/* Description */}
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Добавить описание..."
        rows={2}
        className="text-sm text-slate-500 placeholder:text-slate-300 outline-none resize-none w-full bg-transparent leading-relaxed"
      />

      {/* Validation */}
      {attempted && !title.trim() && (
        <p className="text-xs text-red-500 -mt-3">Название обязательно для создания задачи.</p>
      )}

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
        {/* Priority */}
        <div className="flex rounded-xl border border-slate-200 overflow-hidden text-xs font-semibold">
          {(['low', 'medium', 'high'] as Priority[]).map((p) => (
            <button
              key={p}
              onClick={() => setPriority(p)}
              className={`px-3 py-1.5 transition-all border-r border-slate-200 last:border-0 ${
                priority === p ? PRIORITY_ACTIVE[p] : 'text-slate-400 hover:text-slate-600 bg-white'
              }`}
            >
              {PRIORITY_LABEL[p]}
            </button>
          ))}
        </div>

        {/* Due date */}
        <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-500 cursor-pointer hover:border-slate-300 transition-colors">
          <Calendar size={13} className="text-slate-400" />
          {formatDate(dueDate)}
          <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="sr-only" />
        </label>

        {/* Assignee */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-500">
          <User size={13} className="text-slate-400" />
          <span>{assignee || 'Не назначено'}</span>
          <ChevronDown size={11} className="text-slate-300" />
        </div>

        {/* Checklist */}
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Чек-лист</span>
          <input
            value={checkInput}
            onChange={(e) => setCheckInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addCheckItem()}
            placeholder="Добавить элемент"
            className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs outline-none w-32 focus:border-proji-primary transition-colors"
          />
          <button
            onClick={addCheckItem}
            className="px-3 py-1.5 rounded-lg border border-proji-primary/60 text-proji-primary text-xs font-semibold hover:bg-proji-primary/5 transition-colors"
          >
            Добавить элемент
          </button>
        </div>
      </div>

      {/* Checklist items */}
      {checklist.length > 0 && (
        <div className="flex flex-col gap-1.5 pl-1">
          {checklist.map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-slate-600">
              <Square size={12} className="text-slate-300 shrink-0" />
              {item}
            </div>
          ))}
        </div>
      )}

      {/* Quick actions */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => { setDueDate(''); setAttempted(false); /* mark urgent via priority */ setPriority('high'); }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 border border-orange-200 text-orange-600 text-xs font-bold hover:bg-orange-100 transition-colors"
        >
          🔥 Срочно
        </button>
        <button
          onClick={() => setDueDate(getNextFriday())}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 text-xs font-bold hover:bg-blue-100 transition-colors"
        >
          📅 К пятнице
        </button>
        <button
          onClick={() => setAssignee('Я')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 text-xs font-bold hover:bg-blue-100 transition-colors"
        >
          👤 Назначить мне
        </button>
      </div>

      {/* Submit */}
      <div className="flex gap-3 pt-1">
        {onCancel && (
          <button
            onClick={onCancel}
            className="px-4 py-3 rounded-2xl text-sm font-semibold text-slate-400 hover:text-slate-700 transition-colors"
          >
            Отмена
          </button>
        )}
        <button
          onClick={handleSubmit}
          className={`flex-1 py-3 rounded-2xl text-sm font-black transition-all flex items-center justify-center gap-2 ${
            title.trim()
              ? 'bg-proji-primary text-white hover:bg-proji-primary/90'
              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
          }`}
        >
          {submitLabel} →
        </button>
      </div>
    </div>
  );
}
