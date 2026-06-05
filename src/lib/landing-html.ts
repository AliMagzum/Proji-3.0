import { readFileSync } from 'fs';
import path from 'path';

export function getLandingFragments() {
  const filePath = path.join(process.cwd(), 'public', 'landing-full.html');
  const raw = readFileSync(filePath, 'utf8');

  const styleMatch = raw.match(/<style>([\s\S]*?)<\/style>/);
  const bodyMatch = raw.match(/<body[^>]*>([\s\S]*?)<\/body>/i);

  let body = bodyMatch?.[1] ?? '';
  let styles = styleMatch?.[1] ?? '';

  // Route CTAs into the app
  body = body
    .replace(/href="https:\/\/proji\.kz\/"([^>]*)/g, 'href="/login"$1')
    .replace(/href="https:\/\/proji\.kz"/g, 'href="/login"')
    .replace(/class="btn btn-primary"/g, 'class="btn btn-primary" href="/login"')
    .replace(
      /<a href="#" class="logo">/g,
      '<a href="/" class="logo">',
    )
    .replace(
      /<a href="#" class="btn btn-ghost">Войти<\/a>/g,
      '<a href="/login" class="btn btn-ghost">Войти</a>',
    )
    .replace(
      /<a href="#" class="btn btn-blue">Начать<\/a>/g,
      '<a href="/login" class="btn btn-blue">Начать</a>',
    )
    .replace(
      /<a href="#" class="btn btn-primary btn-lg">Начать бесплатно<\/a>/g,
      '<a href="/login" class="btn btn-primary btn-lg">Начать бесплатно</a>',
    );

  // Mobile nav login
  body = body.replace(
    /<a href="#" class="btn btn-blue" onclick="closeMob\(\)">Войти<\/a>/g,
    '<a href="/login" class="btn btn-blue" onclick="closeMob()">Войти</a>',
  );

  return { styles, body };
}
