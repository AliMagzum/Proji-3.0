import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '../../../../../../../src/lib/auth';
import { isTokensApiServerConfigured } from '../../../../../../../src/lib/tokens-api/config';
import {
  createCard,
  listWorkspaceColumns,
  TokensApiError,
} from '../../../../../../../src/lib/tokens-api/server';
import { cardToWorkspaceTask, columnByStatus } from '../../../../../../../src/lib/tokens-api/mappers';
import type { KanbanStatus } from '../../../../../../../src/types/workspace';

type Ctx = { params: Promise<{ workspaceId: string }> };

export async function POST(req: Request, ctx: Ctx) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!isTokensApiServerConfigured()) {
    return NextResponse.json({ error: 'API not configured' }, { status: 503 });
  }

  try {
    const { workspaceId } = await ctx.params;
    const wsId = Number(workspaceId);
    const body = await req.json();
    const status = body.status as KanbanStatus;
    const columns = await listWorkspaceColumns(wsId);
    const column = columnByStatus(columns, status);
    if (!column) {
      return NextResponse.json({ error: `Column not found: ${status}` }, { status: 400 });
    }

    const card = await createCard(wsId, column.id, {
      title: body.title ?? 'Новая задача',
      assignee_name: body.assigneeName ?? session.user.name ?? undefined,
      assignee_email: body.assigneeEmail ?? session.user.email,
      priority: body.priority === 'High' ? 'high' : body.priority === 'Low' ? 'low' : 'medium',
      story_points: body.sp ?? 3,
      category: body.category ?? 'Общее',
    });

    const task = cardToWorkspaceTask(card, status, {
      name: session.user.name ?? 'User',
      email: session.user.email,
    });
    return NextResponse.json({ task });
  } catch (e) {
    const status = e instanceof TokensApiError ? e.status : 500;
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Error' },
      { status },
    );
  }
}
