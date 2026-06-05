import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function POST(req: NextRequest) {
  try {
    const { message, history, domain } = await req.json();

    const contents = [
      ...(history ?? []).map((h: { role: string; text: string }) => ({
        role: h.role === 'assistant' || h.role === 'model' ? 'model' : 'user',
        parts: [{ text: h.text }],
      })),
      { role: 'user', parts: [{ text: message }] },
    ];

    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL ?? 'gemini-2.5-flash',
      contents,
      config: {
        systemInstruction: `Ты Proji — AI-платформа для управления бизнесом. Текущий домен: ${domain}.
Отвечай профессионально и лаконично. Используй Markdown для форматирования.
Если запрос создать документ/план/регламент — формируй полноценный структурированный документ.
Если запрос неоднозначный — задавай уточняющие вопросы в формате [Вариант 1] [Вариант 2].
Отвечай на языке пользователя (по умолчанию русский).`,
        temperature: 0.7,
      },
    });

    return NextResponse.json({ text: response.text });
  } catch (err) {
    console.error('[AI Route]', err);
    return NextResponse.json({ error: 'AI request failed' }, { status: 500 });
  }
}
