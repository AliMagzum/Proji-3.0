import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../src/lib/auth';
import { verifyDomainKey } from '../../../../src/lib/credentials';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { domain, key } = await req.json();
  const valid = verifyDomainKey(domain, key);
  return NextResponse.json({ valid });
}
