import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '../../../../src/lib/auth';
import { isTokensApiServerConfigured } from '../../../../src/lib/tokens-api/config';
import {
  listWorkspaceColumns,
  moveCard,
  patchCard,
  TokensApiError,
} from '../../../../src/lib/tokens-api/server';
import {
  cardToWorkspaceTask,
  columnByStatus,
  workspaceTaskToCardPatch,
} from '../../../../src/lib/tokens-api/mappers';
import {
  deleteTaskExtras,
  getTaskExtras,
  mergeTaskExtras,
} from '../../../../src/lib/task-extras-server';
import type { KanbanStatus, WorkspaceTask } from '../../../../src/types/workspace';

type Ctx = { params: Promise<{ id: string }> };

function pickExtras(body: Record<string, unknown>) {
  const extras: Record<string, unknown> = {};
  if (body.checklist !== undefined) extras.checklist = body.checklist;
  if (body.attachments !== undefined) extras.attachments = body.attachments;
  if (body.history !== undefined) extras.history = body.history;
  if (body.appliedFrameworks !== undefined) extras.appliedFrameworks = body.appliedFrameworks;
  return extras;
}

export async function PUT(req: Request, ctx: Ctx) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: taskId } = await ctx.params;
  const body = (await req.json()) as Partial<WorkspaceTask> & { workspace_id?: string };
  const workspaceId = body.workspace_id;
  if (!workspaceId) {
    return NextResponse.json({ error: 'workspace_id required' }, { status: 400 });
  }

  const extrasPatch = pickExtras(body as Record<string, unknown>);
  if (Object.keys(extrasPatch).length > 0) {
    mergeTaskExtras(workspaceId, taskId, extrasPatch);
  }

  let task: WorkspaceTask | null = null;
  const extras = getTaskExtras(workspaceId, taskId);

  if (isTokensApiServerConfigured()) {
    try {
      const wsId = Number(workspaceId);
      const cardId = Number(taskId);
      const columns = await listWorkspaceColumns(wsId);
      const cardPatch = workspaceTaskToCardPatch(body);

      if (body.status) {
        const column = columnByStatus(columns, body.status as KanbanStatus);
        if (column) {
          let card = await moveCard(wsId, cardId, column.id, 0);
          if (body.status === 'Готово') {
            try {
              card = await patchCard(wsId, cardId, {
                completed_at: new Date().toISOString(),
              });
            } catch {
              /* optional */
            }
          }
          task = {
            ...cardToWorkspaceTask(card, body.status as KanbanStatus, {
              name: session.user.name ?? 'User',
              email: session.user.email,
            }),
            ...extras,
            checklist: extras.checklist,
            attachments: extras.attachments,
            history: extras.history,
            appliedFrameworks: extras.appliedFrameworks,
          };
        }
      }

      if (Object.keys(cardPatch).length > 0) {
        const card = await patchCard(wsId, cardId, cardPatch);
        const col = columns.find((c) => c.id === card.column_id);
        const status = (col?.name ?? body.status ?? 'Бэклог') as KanbanStatus;
        task = {
          ...cardToWorkspaceTask(card, status, {
            name: session.user.name ?? 'User',
            email: session.user.email,
          }),
          ...extras,
          checklist: extras.checklist,
          attachments: extras.attachments,
          history: extras.history,
          appliedFrameworks: extras.appliedFrameworks,
        };
      }
    } catch (e) {
      const status = e instanceof TokensApiError ? e.status : 500;
      return NextResponse.json(
        { error: e instanceof Error ? e.message : 'Update failed' },
        { status },
      );
    }
  }

  if (!task) {
    task = {
      id: taskId,
      title: body.title ?? '',
      description: body.description,
      status: (body.status ?? 'Бэклог') as KanbanStatus,
      priority: body.priority ?? 'Medium',
      sp: body.sp ?? 0,
      assignee: '',
      assigneeName: body.assigneeName ?? session.user.name ?? 'User',
      assigneeEmail: body.assigneeEmail ?? session.user.email,
      dueDate: body.dueDate,
      completedAt: body.completedAt,
      category: body.category,
      tag: body.tag,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...extras,
      checklist: extras.checklist ?? body.checklist,
      attachments: extras.attachments ?? body.attachments,
      history: extras.history ?? body.history,
      appliedFrameworks: extras.appliedFrameworks ?? body.appliedFrameworks,
    };
  }

  return NextResponse.json({ task });
}

export async function DELETE(req: Request, ctx: Ctx) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: taskId } = await ctx.params;
  const workspace_id = new URL(req.url).searchParams.get('workspace_id');
  if (!workspace_id) {
    return NextResponse.json({ error: 'workspace_id required' }, { status: 400 });
  }

  mergeTaskExtras(workspace_id, taskId, { deleted: true });

  if (isTokensApiServerConfigured()) {
    try {
      const wsId = Number(workspace_id);
      const columns = await listWorkspaceColumns(wsId);
      const archive = columnByStatus(columns, 'Архив');
      if (archive) {
        await moveCard(wsId, Number(taskId), archive.id, 0);
      }
    } catch {
      /* archive optional */
    }
  }

  return NextResponse.json({ ok: true });
}
