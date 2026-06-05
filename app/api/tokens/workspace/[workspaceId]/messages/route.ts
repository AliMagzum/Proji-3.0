import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '../../../../../../src/lib/auth';
import { isTokensApiServerConfigured } from '../../../../../../src/lib/tokens-api/config';
import { tokensFetch, TokensApiError } from '../../../../../../src/lib/tokens-api/server';
import type { TokensChatMessage } from '../../../../../../src/lib/tokens-api/types';
import type { TaskChatMessage } from '../../../../../../src/types/workspace';
import {
  addMessage,
  listMessages,
} from '../../../../../../src/lib/task-chat-server';

type Ctx = { params: Promise<{ workspaceId: string }> };

function toClient(
  m: TokensChatMessage,
  session: { name?: string | null; email?: string | null },
): TaskChatMessage {
  return {
    id: String(m.id),
    workspace_id: String(m.workspace_id),
    task_id: m.card_id != null ? String(m.card_id) : null,
    user_email: m.user_email ?? session.email ?? '',
    user_name: m.user_name ?? session.name ?? 'User',
    text: m.text,
    created_at: m.created_at,
  };
}

export async function GET(req: Request, ctx: Ctx) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { workspaceId } = await ctx.params;
  const { searchParams } = new URL(req.url);
  const taskId = searchParams.get('task_id');

  if (isTokensApiServerConfigured()) {
    try {
      const q = new URLSearchParams();
      if (taskId) q.set('card_id', taskId);
      const path = `workspaces/${workspaceId}/messages${q.toString() ? `?${q}` : ''}`;
      const list = await tokensFetch<TokensChatMessage[]>(path);
      return NextResponse.json({
        messages: list.map((m) => toClient(m, session.user)),
      });
    } catch (e) {
      if (!(e instanceof TokensApiError) || (e.status !== 404 && e.status !== 501)) {
        const status = e instanceof TokensApiError ? e.status : 500;
        return NextResponse.json({ error: e.message }, { status });
      }
    }
  }

  const messages = listMessages(workspaceId, taskId);
  return NextResponse.json({ messages });
}

export async function POST(req: Request, ctx: Ctx) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { workspaceId } = await ctx.params;
  const body = await req.json();
  const text = (body.text as string | undefined)?.trim();
  const taskId = body.task_id as string | null | undefined;

  if (!text) {
    return NextResponse.json({ error: 'text required' }, { status: 400 });
  }

  if (isTokensApiServerConfigured()) {
    try {
      const created = await tokensFetch<TokensChatMessage>(
        `workspaces/${workspaceId}/messages`,
        {
          method: 'POST',
          body: JSON.stringify({
            text,
            card_id: taskId ? Number(taskId) : null,
          }),
        },
      );
      return NextResponse.json({ message: toClient(created, session.user) });
    } catch (e) {
      if (!(e instanceof TokensApiError) || (e.status !== 404 && e.status !== 501)) {
        const status = e instanceof TokensApiError ? e.status : 500;
        return NextResponse.json({ error: e.message }, { status });
      }
    }
  }

  const message: TaskChatMessage = {
    id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    workspace_id: workspaceId,
    task_id: taskId ?? null,
    user_email: session.user.email,
    user_name: session.user.name ?? session.user.email.split('@')[0] ?? 'User',
    text,
    created_at: new Date().toISOString(),
  };
  addMessage(message);
  return NextResponse.json({ message });
}
