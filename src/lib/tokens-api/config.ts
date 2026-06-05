/** Server: TOKENS_API_URL + TOKENS_API_BEARER_TOKEN. Client: NEXT_PUBLIC_USE_TOKENS_API */

export const TOKENS_API_BASE =
  process.env.TOKENS_API_URL ?? 'https://api.tokens.kz/api/v1';

export function isTokensApiServerConfigured(): boolean {
  return Boolean(process.env.TOKENS_API_BEARER_TOKEN?.trim());
}

export function isTokensApiClientEnabled(): boolean {
  return process.env.NEXT_PUBLIC_USE_TOKENS_API === 'true';
}

/** Until /auth/google exists — default user id on tokens API */
export function tokensApiUserId(): number {
  const n = Number(process.env.TOKENS_API_USER_ID ?? '1');
  return Number.isFinite(n) && n > 0 ? n : 1;
}
