/** Server: TOKENS_API_URL + TOKENS_API_BEARER_TOKEN. Client: NEXT_PUBLIC_USE_TOKENS_API */

export const TOKENS_API_BASE =
  process.env.TOKENS_API_URL ?? 'https://api.tokens.kz/api/v1';

const PLACEHOLDER_TOKENS = new Set([
  'токен_от_бэкендера',
  'token_from_backend',
  'secret-from-backend-dev',
  'your-token-here',
  'changeme',
]);

/** Bearer must be ASCII — Node fetch rejects Cyrillic in Authorization header */
export function isValidTokensBearerToken(token: string | undefined): boolean {
  const t = token?.trim();
  if (!t) return false;
  if (!/^[\x20-\x7E]+$/.test(t)) return false;
  if (PLACEHOLDER_TOKENS.has(t.toLowerCase())) return false;
  return true;
}

export function isTokensApiServerConfigured(): boolean {
  return isValidTokensBearerToken(process.env.TOKENS_API_BEARER_TOKEN);
}

/** Client BFF only when flag is on AND server has a real token */
export function isTokensApiEnabled(): boolean {
  return isTokensApiClientEnabled() && isTokensApiServerConfigured();
}

export function isTokensApiClientEnabled(): boolean {
  return process.env.NEXT_PUBLIC_USE_TOKENS_API === 'true';
}

export function tokensApiSetupHint(): string {
  if (!isTokensApiClientEnabled()) {
    return 'Локальный режим: NEXT_PUBLIC_USE_TOKENS_API не включён.';
  }
  const raw = process.env.TOKENS_API_BEARER_TOKEN?.trim();
  if (!raw) {
    return 'Укажите TOKENS_API_BEARER_TOKEN в .env.local (латиница, токен от бэкенда).';
  }
  if (!/^[\x20-\x7E]+$/.test(raw)) {
    return 'TOKENS_API_BEARER_TOKEN должен быть на латинице (кириллица в Bearer ломает запросы).';
  }
  return 'TOKENS_API_BEARER_TOKEN — заглушка. Получите реальный токен у бэкенда или отключите NEXT_PUBLIC_USE_TOKENS_API.';
}

/** Until /auth/google exists — default user id on tokens API */
export function tokensApiUserId(): number {
  const n = Number(process.env.TOKENS_API_USER_ID ?? '1');
  return Number.isFinite(n) && n > 0 ? n : 1;
}
