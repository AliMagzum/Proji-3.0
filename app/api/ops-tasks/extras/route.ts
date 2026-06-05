import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '../../../../src/lib/auth';
import { listWorkspaceExtras } from '../../../../src/lib/task-extras-server';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const workspace_id = new URL(req.url).searchParams.get('workspace_id');
  if (!workspace_id) {
    return NextResponse.json({ error: 'workspace_id required' }, { status: 400 });
  }
  return NextResponse.json({ extras: listWorkspaceExtras(workspace_id) });
}
