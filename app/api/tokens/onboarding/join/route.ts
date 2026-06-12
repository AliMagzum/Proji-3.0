import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '../../../../../src/lib/auth';
import { isTokensApiServerConfigured, tokensApiSetupHint } from '../../../../../src/lib/tokens-api/config';
import { tokensFetch, TokensApiError } from '../../../../../src/lib/tokens-api/server';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!isTokensApiServerConfigured()) {
    return NextResponse.json({ error: tokensApiSetupHint(), fallback: 'local' }, { status: 503 });
  }

  try {
    const { inviteCode } = await req.json();
    if (!inviteCode?.trim()) {
      return NextResponse.json({ error: 'inviteCode required' }, { status: 400 });
    }

    // When backend adds POST /organizations/join — switch to that
    try {
      const result = await tokensFetch<{
        organization_id: number;
        workspace_id: number;
        name: string;
      }>('organizations/join', {
        method: 'POST',
        body: JSON.stringify({ invite_code: inviteCode.trim() }),
      });
      return NextResponse.json({
        organizationId: result.organization_id,
        workspaceId: result.workspace_id,
        name: result.name,
      });
    } catch (joinErr) {
      if (!(joinErr instanceof TokensApiError) || ![404, 405, 501].includes(joinErr.status)) {
        throw joinErr;
      }
    }

    return NextResponse.json(
      { error: 'Join by invite is not available on API yet. Use local invite or ask backend for POST /organizations/join' },
      { status: 501 },
    );
  } catch (e) {
    const status = e instanceof TokensApiError ? e.status : 500;
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status });
  }
}
