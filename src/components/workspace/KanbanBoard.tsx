'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useDroppable } from '@dnd-kit/core';
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  GripVertical,
  ArrowRight,
  MessageSquare,
  MoreHorizontal,
  Clock,
  AlertCircle,
  Layers,
  Archive,
} from 'lucide-react';
import { KANBAN_STATUS_IDS, type KanbanStatus, type WorkspaceTask } from '../../types/workspace';
import { formatDueDate, isOverdue, nextStatus, priorityRank } from '../../lib/workspace-tasks';
import { useI18n } from '../../context/I18nContext';
import { tKanbanStatus } from '../../i18n/helpers';

const COLUMN_META: Record<
  KanbanStatus,
  { dot: string; canMove: boolean; collapsible: 'left' | 'right' | false }
> = {
  'Бэклог': { dot: 'bg-slate-400', canMove: true, collapsible: 'left' },
  'К выполнению': { dot: 'bg-blue-400', canMove: true, collapsible: false },
  'В работе': { dot: 'bg-indigo-500', canMove: true, collapsible: false },
  'Готово': { dot: 'bg-green-500', canMove: false, collapsible: false },
  'Архив': { dot: 'bg-slate-300', canMove: false, collapsible: 'right' },
};

function priorityPill(p: WorkspaceTask['priority'], t: (key: string) => string) {
  const high = p === 'High' || p === 'Высокий';
  const med = p === 'Medium' || p === 'Средний';
  if (high) {
    return (
      <span className="flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-red-50 text-red-600">
        <AlertCircle size={10} /> {t('tasks.kanban.priority.high')}
      </span>
    );
  }
  if (med) {
    return (
      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-orange-50 text-orange-600">
        {t('tasks.kanban.priority.medium')}
      </span>
    );
  }
  return (
    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600">
      {t('tasks.kanban.priority.low')}
    </span>
  );
}

function TaskCardInner({
  task,
  onOpenChat,
  onMoveNext,
  canMove,
  isDragging,
}: {
  task: WorkspaceTask;
  onOpenChat?: () => void;
  onMoveNext?: () => void;
  canMove: boolean;
  isDragging?: boolean;
}) {
  const { t } = useI18n();
  const overdue = isOverdue(task);
  const due = formatDueDate(task.dueDate);

  return (
    <div
      className={`min-h-[160px] h-[160px] w-full p-4 rounded-xl shadow-sm flex flex-col touch-none ${
        overdue
          ? 'bg-red-700 border border-red-500 text-white'
          : 'bg-white border border-indigo-700 hover:border-indigo-700'
      } ${isDragging ? 'ring-2 ring-blue-300 shadow-xl scale-[1.02] opacity-90' : 'cursor-grab active:cursor-grabbing'}`}
    >
      <div className="flex justify-between mb-2 shrink-0">
        <div>
          {due && (
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${
                overdue ? 'bg-red-600 text-white' : 'text-slate-500 bg-slate-50'
              }`}
            >
              {due}
            </span>
          )}
          {!due && task.tag && task.tag !== 'общее' && (
            <span className="text-[10px] text-slate-400 bg-slate-50 px-2 py-1 rounded-md">
              {task.tag}
            </span>
          )}
        </div>
        <div className="flex gap-1.5 text-slate-400">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenChat?.();
            }}
            className="hover:text-proji-primary p-0.5"
          >
            <MessageSquare size={14} />
          </button>
          <MoreHorizontal size={14} />
        </div>
      </div>

      <h4
        className={`text-sm font-semibold line-clamp-2 pr-2 flex-1 ${
          overdue ? 'text-white' : 'text-slate-800'
        }`}
      >
        {task.title}
      </h4>

      <div
        className={`flex items-center justify-between border-t pt-2 mt-auto shrink-0 ${
          overdue ? 'border-red-500/50' : 'border-slate-50'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold border ${
              overdue ? 'bg-red-600 border-red-400 text-white' : 'bg-slate-200 text-slate-600 border-white'
            }`}
          >
            {task.assigneeName.slice(0, 1).toUpperCase()}
          </div>
          <span
            className={`text-xs truncate max-w-[80px] ${
              overdue ? 'text-red-100' : 'text-slate-600'
            }`}
          >
            {task.assigneeName}
          </span>
          <span className={`flex items-center gap-0.5 text-xs ${overdue ? 'text-red-200' : 'text-slate-400'}`}>
            <Clock size={12} />
            {task.sp} sp
          </span>
        </div>
        {!overdue && priorityPill(task.priority, t)}
      </div>

      {canMove && onMoveNext && (
        <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity right-2 bottom-14 hidden md:block">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onMoveNext();
            }}
            className="w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm hover:bg-slate-50"
          >
            <ArrowRight size={14} className="text-slate-600" />
          </button>
        </div>
      )}
    </div>
  );
}

function SortableTaskCard({
  task,
  onOpen,
  onOpenChat,
  onMoveNext,
  canMove,
}: {
  task: WorkspaceTask;
  onOpen: (t: WorkspaceTask) => void;
  onOpenChat: (t: WorkspaceTask) => void;
  onMoveNext: (t: WorkspaceTask) => void;
  canMove: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group" onClick={() => onOpen(task)}>
      <div {...attributes} {...listeners}>
        <TaskCardInner
          task={task}
          onOpenChat={() => onOpenChat(task)}
          onMoveNext={() => onMoveNext(task)}
          canMove={canMove}
        />
      </div>
      <GripVertical
        size={16}
        className="absolute left-1 top-1/2 -translate-y-1/2 text-slate-300 opacity-0 group-hover:opacity-100 hidden md:block pointer-events-none"
      />
    </div>
  );
}

function DroppableColumn({
  status,
  children,
}: {
  status: KanbanStatus;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  return (
    <div
      ref={setNodeRef}
      className={`flex-1 min-h-[200px] ${isOver ? 'ring-2 ring-blue-200 rounded-xl' : ''}`}
    >
      {children}
    </div>
  );
}

export function KanbanBoard({
  tasks,
  onUpdateTask,
  onAddInColumn,
  onOpenTask,
  onOpenTaskChat,
}: {
  tasks: WorkspaceTask[];
  onUpdateTask: (id: string, patch: Partial<WorkspaceTask>) => void;
  onAddInColumn: (status: KanbanStatus) => void;
  onOpenTask: (task: WorkspaceTask) => void;
  onOpenTaskChat: (task: WorkspaceTask) => void;
}) {
  const { t } = useI18n();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({
    Бэклог: false,
    Архив: false,
  });
  const [activeId, setActiveId] = useState<string | null>(null);
  const [canUseDnd, setCanUseDnd] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const update = () => setCanUseDnd(!mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 2000, tolerance: 8 } }),
  );

  const byColumn = useMemo(() => {
    const map: Record<KanbanStatus, WorkspaceTask[]> = {
      'Бэклог': [],
      'К выполнению': [],
      'В работе': [],
      'Готово': [],
      'Архив': [],
    };
    for (const t of tasks) {
      const col = KANBAN_STATUS_IDS.includes(t.status) ? t.status : 'Бэклог';
      map[col].push(t);
    }
    for (const col of KANBAN_STATUS_IDS) {
      if (col === 'Готово') {
        map[col].sort(
          (a, b) =>
            new Date(b.completedAt ?? b.updatedAt ?? b.createdAt).getTime() -
            new Date(a.completedAt ?? a.updatedAt ?? a.createdAt).getTime(),
        );
      } else {
        map[col].sort((a, b) => {
          const pr = priorityRank(a.priority) - priorityRank(b.priority);
          if (pr !== 0) return pr;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
      }
    }
    return map;
  }, [tasks]);

  const activeTask = activeId ? tasks.find((t) => t.id === activeId) : null;
  const taskById = useMemo(() => new Map(tasks.map((t) => [t.id, t])), [tasks]);

  const resolveDropStatus = (overId: string | number | undefined): KanbanStatus | null => {
    if (!overId) return null;
    const id = String(overId);
    if (KANBAN_STATUS_IDS.includes(id as KanbanStatus)) return id as KanbanStatus;
    const overTask = taskById.get(id);
    return overTask?.status ?? null;
  };

  const moveTaskToNext = (task: WorkspaceTask) => {
    const next = nextStatus(task.status);
    if (!next) return;
    const patch: Partial<WorkspaceTask> = {
      status: next,
      updatedAt: new Date().toISOString(),
    };
    if (next === 'Готово') patch.completedAt = new Date().toISOString();
    onUpdateTask(task.id, patch);
  };

  const handleDragEnd = (e: DragEndEvent) => {
    setActiveId(null);
    if (!canUseDnd || !e.over) return;

    const taskId = String(e.active.id);
    const dragged = taskById.get(taskId);
    if (!dragged) return;

    const newStatus = resolveDropStatus(e.over.id);
    if (!newStatus || newStatus === dragged.status) return;

    const patch: Partial<WorkspaceTask> = {
      status: newStatus,
      updatedAt: new Date().toISOString(),
    };
    if (newStatus === 'Готово') patch.completedAt = new Date().toISOString();
    onUpdateTask(taskId, patch);
  };

  const board = (
    <div className="h-full w-full flex gap-4 overflow-x-auto pb-4 px-1 snap-x snap-mandatory">
      {KANBAN_STATUS_IDS.map((status) => {
        const meta = COLUMN_META[status];
        const isCollapsed = collapsed[status];
        const columnTasks = byColumn[status];

        if (isCollapsed && meta.collapsible) {
          return (
            <div
              key={status}
              className="snap-center w-10 flex-shrink-0 flex flex-col items-center py-4 bg-slate-50/80 rounded-2xl border border-slate-100 cursor-pointer"
              onClick={() => setCollapsed((c) => ({ ...c, [status]: false }))}
            >
              {meta.collapsible === 'left' ? (
                <ChevronRight size={16} className="text-slate-400 mb-2" />
              ) : (
                <ChevronLeft size={16} className="text-slate-400 mb-2" />
              )}
              {status === 'Бэклог' ? (
                <Layers size={14} className="text-slate-400 mb-2" />
              ) : (
                <Archive size={14} className="text-slate-400 mb-2" />
              )}
              <span
                className="text-[10px] font-bold text-slate-600 [writing-mode:vertical-rl] rotate-180 flex-1"
              >
                {tKanbanStatus(t, status)}
              </span>
              <span className="text-[9px] bg-slate-200 rounded-full px-1.5 py-0.5 mt-2">
                {columnTasks.length}
              </span>
            </div>
          );
        }

        return (
          <div
            key={status}
            className="snap-center flex flex-col h-full w-[280px] md:w-[300px] flex-shrink-0 bg-slate-50/50 rounded-2xl p-4 border border-slate-100/50"
          >
            <div className="flex items-center gap-2 mb-3 shrink-0">
              {meta.collapsible === 'left' && (
                <button
                  type="button"
                  onClick={() => setCollapsed((c) => ({ ...c, [status]: true }))}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <ChevronLeft size={16} />
                </button>
              )}
              <span className={`w-3 h-3 rounded-full ${meta.dot}`} />
              <span className="font-bold text-slate-700 text-sm flex-1">{tKanbanStatus(t, status)}</span>
              <span className="task-column-count bg-slate-200 text-slate-600 text-xs px-2 py-0.5 rounded-full">
                {columnTasks.length}
              </span>
              <button
                type="button"
                onClick={() => onAddInColumn(status)}
                className="text-slate-400 hover:text-proji-primary p-1"
              >
                <Plus size={18} />
              </button>
              {meta.collapsible === 'right' && (
                <button
                  type="button"
                  onClick={() => setCollapsed((c) => ({ ...c, [status]: true }))}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <ChevronRight size={16} />
                </button>
              )}
            </div>

            <DroppableColumn status={status}>
              <SortableContext
                items={columnTasks.map((t) => t.id)}
                strategy={verticalListSortingStrategy}
                disabled={!canUseDnd}
              >
                <div className="space-y-3 overflow-y-auto pr-1 flex-1 min-h-[200px] pb-4 custom-scrollbar">
                  {columnTasks.length === 0 ? (
                    <div className="h-32 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-xs text-slate-400">
                      {t('tasksDetail.emptyColumn')}
                    </div>
                  ) : (
                    columnTasks.map((task) => (
                      <SortableTaskCard
                        key={task.id}
                        task={task}
                        onOpen={onOpenTask}
                        onOpenChat={onOpenTaskChat}
                        onMoveNext={moveTaskToNext}
                        canMove={meta.canMove}
                      />
                    ))
                  )}
                </div>
              </SortableContext>
            </DroppableColumn>
          </div>
        );
      })}
    </div>
  );

  if (!canUseDnd) return board;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={(e: DragStartEvent) => setActiveId(String(e.active.id))}
      onDragEnd={handleDragEnd}
    >
      {board}
      <DragOverlay>
        {activeTask ? (
          <div className="rotate-2 w-[280px]">
            <TaskCardInner task={activeTask} canMove={false} isDragging />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
