import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../src/lib/auth';
import {
  getDomainCreds, updateDomainField,
  generateKey, getDomainPrefix,
} from '../../../src/lib/credentials';

function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return unauthorized();
  return NextResponse.json({ domains: getDomainCreds() });
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return unauthorized();
  if ((session.user as any)?.role !== 'manager') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { domain, field, value } = await req.json() as {
    domain: string;
    field: 'key' | 'password';
    value?: string;
  };

  const newValue = value ?? (field === 'key'
    ? generateKey(getDomainPrefix(domain))
    : undefined);

  if (!newValue) {
    return NextResponse.json({ error: 'Value required' }, { status: 400 });
  }

  const updated = updateDomainField(domain, field, newValue);
  return NextResponse.json({ domain: updated });
}
