import { randomUUID } from 'crypto';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '../../../src/lib/auth';

const UPLOAD_DIR = path.join(process.cwd(), '.data', 'task-attachments');

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file');
    const folder = (formData.get('folder') as string | null) ?? 'task-attachments';

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No file' }, { status: 400 });
    }

    const blob = file as Blob;
    const name = file instanceof File ? file.name : 'file';
    const type = file instanceof File ? file.type : 'application/octet-stream';
    const buffer = Buffer.from(await blob.arrayBuffer());

    const dir = path.join(process.cwd(), '.data', folder);
    await mkdir(dir, { recursive: true });

    const id = randomUUID();
    const safeName = name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const stored = `${id}_${safeName}`;
    await writeFile(path.join(dir, stored), buffer);

    return NextResponse.json({
      id,
      name,
      type,
      size: buffer.length,
      url: `/api/uploads/${folder}/${stored}`,
    });
  } catch (err) {
    console.error('[upload]', err);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
