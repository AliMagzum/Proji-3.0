import { NextRequest, NextResponse } from 'next/server';

function extractTranscript(data: Record<string, unknown>): string {
  const raw = data.text ?? data.transcript ?? data.result ?? data.message;
  return typeof raw === 'string' ? raw.trim() : '';
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'OPENAI_API_KEY is not configured' }, { status: 500 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    const blob = file as Blob;
    const openAiForm = new FormData();
    openAiForm.append('file', blob, 'audio.webm');
    openAiForm.append('model', 'whisper-1');
    openAiForm.append('language', 'ru');

    const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}` },
      body: openAiForm,
    });

    const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;

    if (!res.ok) {
      const message =
        typeof data.error === 'object' &&
        data.error !== null &&
        'message' in data.error &&
        typeof (data.error as { message?: string }).message === 'string'
          ? (data.error as { message: string }).message
          : 'Transcription failed';
      return NextResponse.json({ error: message }, { status: res.status });
    }

    const text = extractTranscript(data);
    return NextResponse.json({ text });
  } catch (err) {
    console.error('[transcribe]', err);
    return NextResponse.json({ error: 'Transcription failed' }, { status: 500 });
  }
}
