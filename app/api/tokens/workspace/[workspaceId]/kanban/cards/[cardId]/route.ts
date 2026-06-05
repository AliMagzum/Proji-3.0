import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '../../../../../../../../src/lib/auth';
import { isTokensApiServerConfigured } from '../../../../../../../../src/lib/tokens-api/config';
import { patchCard, TokensApiError } from '../../../../../../../../src/lib/tokens-api/server';
import { workspaceTaskToCardPatch } from '../../../../../../../../src/lib/tokens-api/mappers';
import type { WorkspaceTask } from '../../../../../../../../src/types/workspace';

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
    const patch = (await req.json()) as Partial<WorkspaceTask>;
    const card = await patchCard(
      Number(workspaceId),
      Number(cardId),
      workspaceTaskToCardPatch(patch),
    );
    return NextResponse.json({ card });
  } catch (e) {
    const status = e instanceof TokensApiError ? e.status : 500;
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Error' },
      { status },
    );
  }
}
