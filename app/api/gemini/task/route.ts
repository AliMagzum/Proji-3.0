import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function POST(req: NextRequest) {
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 });
  }

  try {
    const { action, title, description, framework } = await req.json();
    const desc = (description as string | undefined)?.trim() ?? '';
    const ttl = (title as string | undefined)?.trim() ?? 'Задача';

    let prompt = '';
    if (action === 'checklist') {
      prompt = `Задача: "${ttl}"
Описание: ${desc || '(пусто)'}

Сгенерируй чек-лист из 5–10 конкретных шагов. Только список, по одному пункту на строку, без нумерации и markdown. На русском.`;
    } else if (action === 'smart') {
      prompt = `Перепиши описание задачи по SMART (Specific, Measurable, Achievable, Relevant, Time-bound).
Заголовок: ${ttl}
Текущее описание: ${desc || '(пусто)'}
Верни только улучшенное описание в Markdown на русском.`;
    } else if (action === '5whys') {
      prompt = `Примени метод «5 почему» к задаче и сформулируй уточнённое описание с корневой причиной.
Заголовок: ${ttl}
Описание: ${desc || '(пусто)'}
Верни только текст описания в Markdown на русском.`;
    } else {
      return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }

    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL ?? 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: { temperature: 0.5 },
    });

    const text = response.text ?? '';
    const label =
      action === 'checklist'
        ? 'AI чек-лист'
        : framework === '5whys' || action === '5whys'
          ? '5 Whys'
          : 'SMART';

    return NextResponse.json({ text, label });
  } catch (err) {
    console.error('[gemini/task]', err);
    return NextResponse.json({ error: 'AI request failed' }, { status: 500 });
  }
}
