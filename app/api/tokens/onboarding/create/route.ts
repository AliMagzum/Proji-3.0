import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '../../../../../src/lib/auth';
import { isTokensApiServerConfigured } from '../../../../../src/lib/tokens-api/config';
import { createOrganizationWithWorkspace, TokensApiError } from '../../../../../src/lib/tokens-api/server';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!isTokensApiServerConfigured()) {
    return NextResponse.json(
      { error: 'TOKENS_API_BEARER_TOKEN is not configured on server' },
      { status: 503 },
    );
  }

  try {
    const { name } = await req.json();
    if (!name?.trim()) {
      return NextResponse.json({ error: 'name required' }, { status: 400 });
    }

    const { organization, workspace, inviteCode } =
      await createOrganizationWithWorkspace(name);

    return NextResponse.json({
      organizationId: organization.id,
      workspaceId: workspace.id,
      name: organization.name,
      inviteCode,
    });
  } catch (e) {
    const status = e instanceof TokensApiError ? e.status : 500;
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status });
  }
}
