import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '../../../../../../../../../src/lib/auth';
import { isTokensApiServerConfigured } from '../../../../../../../../../src/lib/tokens-api/config';
import {
  listWorkspaceColumns,
  moveCard,
  patchCard,
  TokensApiError,
} from '../../../../../../../../../src/lib/tokens-api/server';
import { cardToWorkspaceTask, columnByStatus } from '../../../../../../../../../src/lib/tokens-api/mappers';
import type { KanbanStatus } from '../../../../../../../../../src/types/workspace';

type Ctx = { params: Promise<{ workspaceId: string; cardId: string }> };

export async function PATCH(req: Request, ctx: Ctx) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!isTokensApiServerConfigured()) {
    return NextResponse.json({ error: 'API not configured' }, { status: 503 });
  }

  try {
    const { workspaceId, cardId } = await ctx.params;
    const wsId = Number(workspaceId);
    const { status } = (await req.json()) as { status: KanbanStatus };
    const columns = await listWorkspaceColumns(wsId);
    const column = columnByStatus(columns, status);
    if (!column) {
      return NextResponse.json({ error: `Column not found: ${status}` }, { status: 400 });
    }

    let card;
    try {
      card = await moveCard(wsId, Number(cardId), column.id, 0);
    } catch (moveErr) {
      if (moveErr instanceof TokensApiError && moveErr.status === 404) {
        card = await patchCard(wsId, Number(cardId), { column_id: column.id });
      } else {
        throw moveErr;
      }
    }

    if (status === 'Готово') {
      try {
        card = await patchCard(wsId, Number(cardId), {
          completed_at: new Date().toISOString(),
        });
      } catch {
        /* optional field */
      }
    }

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
