import mammoth from 'mammoth';
import { NextRequest, NextResponse } from 'next/server';
import { isDocxFile, isTextAttachment } from '../../../src/lib/attachment-text';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const blob = file as Blob;
    const fileName = file instanceof File ? file.name : 'file';
    const fileType = file instanceof File ? file.type : '';
    const fileLike = new File([blob], fileName, { type: fileType });

    if (isDocxFile(fileLike)) {
      const buffer = Buffer.from(await blob.arrayBuffer());
      const result = await mammoth.extractRawText({ buffer });
      return NextResponse.json({ text: result.value });
    }

    if (isTextAttachment(fileLike)) {
      const text = await blob.text();
      return NextResponse.json({ text });
    }

    return NextResponse.json({ error: 'Unsupported file type' }, { status: 415 });
  } catch (err) {
    console.error('[file-text]', err);
    return NextResponse.json({ error: 'Failed to read file' }, { status: 500 });
  }
}
