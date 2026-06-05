// AI calls are handled server-side via /api/ai route.
// This file is kept for type compatibility.

export async function processBusinessCommand(
  message: string,
  history: { role: 'user' | 'model'; text: string }[],
  domain?: string
): Promise<string> {
  const res = await fetch('/api/ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history, domain: domain ?? 'Общий' }),
  });
  const data = await res.json();
  return data.text ?? data.error ?? 'Ошибка';
}
