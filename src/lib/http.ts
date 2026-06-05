/**
 * HTTP client for api.progpt.kz — ready when NEXT_PUBLIC_API_URL is set.
 */

const BASE = process.env.NEXT_PUBLIC_API_URL ?? '';

function hasBackend(): boolean {
  return Boolean(BASE && BASE.length > 0);
}

async function refreshToken(): Promise<boolean> {
  const refresh = localStorage.getItem('refresh_token');
  if (!refresh || !hasBackend()) return false;
  try {
    const res = await fetch(`${BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refresh }),
    });
    if (!res.ok) return false;
    const { access_token } = await res.json();
    localStorage.setItem('access_token', access_token);
    return true;
  } catch {
    return false;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  if (!hasBackend()) {
    throw new Error('NEXT_PUBLIC_API_URL is not configured');
  }

  const token = localStorage.getItem('access_token');
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  });

  if (res.status === 401) {
    const refreshed = await refreshToken();
    if (!refreshed) {
      window.location.href = '/login';
      throw new Error('Unauthorized');
    }
    return request(path, init);
  }

  if (!res.ok) throw new Error(await res.text());
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const http = {
  enabled: hasBackend,
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};
