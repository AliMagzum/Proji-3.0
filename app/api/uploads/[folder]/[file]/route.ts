import { readFile } from 'fs/promises';
import path from 'path';
import { NextResponse } from 'next/server';

type Ctx = { params: Promise<{ folder: string; file: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const { folder, file } = await ctx.params;
  if (folder.includes('..') || file.includes('..')) {
    return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
  }

  try {
    const full = path.join(process.cwd(), '.data', folder, file);
    const buffer = await readFile(full);
    const ext = path.extname(file).toLowerCase();
    const mime =
      ext === '.png'
        ? 'image/png'
        : ext === '.jpg' || ext === '.jpeg'
          ? 'image/jpeg'
          : ext === '.pdf'
            ? 'application/pdf'
            : ext === '.docx'
              ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
              : 'application/octet-stream';

    return new NextResponse(buffer, {
      headers: { 'Content-Type': mime, 'Cache-Control': 'private, max-age=3600' },
    });
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}
