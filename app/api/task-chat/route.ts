import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '../../../src/lib/auth';
import { addMessage, listMessages } from '../../../src/lib/task-chat-server';
import type { TaskChatMessage } from '../../../src/types/workspace';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const workspace_id = searchParams.get('workspace_id');
  if (!workspace_id) {
    return NextResponse.json({ error: 'workspace_id required' }, { status: 400 });
  }

  const task_id = searchParams.get('task_id');
  const messages = listMessages(workspace_id, task_id || null);
  return NextResponse.json({ messages });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const workspace_id = body.workspace_id as string | undefined;
  const text = (body.text as string | undefined)?.trim();
  const task_id = (body.task_id as string | null | undefined) ?? null;

  if (!workspace_id || !text) {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  const message: TaskChatMessage = {
    id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    workspace_id,
    task_id: task_id || null,
    user_email: session.user.email,
    user_name: session.user.name ?? session.user.email.split('@')[0] ?? 'User',
    text,
    created_at: new Date().toISOString(),
  };

  addMessage(message);
  return NextResponse.json({ message });
}
