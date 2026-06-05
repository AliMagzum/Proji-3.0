import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '../../../../../../src/lib/auth';
import { isTokensApiServerConfigured } from '../../../../../../src/lib/tokens-api/config';
import {
  listAllCards,
  listWorkspaceColumns,
  TokensApiError,
} from '../../../../../../src/lib/tokens-api/server';
import { buildColumnMap, cardToWorkspaceTask } from '../../../../../../src/lib/tokens-api/mappers';

type Ctx = { params: Promise<{ workspaceId: string }> };

export async function GET(_req: Request, ctx: Ctx) {
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
    const columns = await listWorkspaceColumns(wsId);
    const colMap = buildColumnMap(columns);
    const cards = await listAllCards(wsId, columns);
    const fallback = {
      name: session.user.name ?? 'User',
      email: session.user.email,
    };
    const tasks = cards.map((c) =>
      cardToWorkspaceTask(c, colMap.get(c.column_id) ?? 'Бэклог', fallback),
    );
    return NextResponse.json({ tasks, columns });
  } catch (e) {
    const status = e instanceof TokensApiError ? e.status : 500;
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Error' },
      { status },
    );
  }
}
