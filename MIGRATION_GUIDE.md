# Инструкция по миграции: localStorage → Backend API

## Обзор

Сейчас все данные хранятся в `localStorage` браузера. Это означает:
- Данные живут только в одном браузере на одном устройстве
- При очистке кэша данные теряются
- Нет многопользовательского доступа
- Нет реальной авторизации

После миграции данные будут в PostgreSQL, а фронтенд будет общаться с бэкендом через REST API.

---

## Архитектура после миграции

```
[Браузер] ←→ [Next.js фронт :3000] ←→ [REST API :4000] ←→ [PostgreSQL]
                                              ↕
                                        [Redis (sessions)]
```

---

## Шаг 1: Настроить переменные окружения

Создать `.env.local` в корне фронтенда:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_APP_NAME=Proji
```

---

## Шаг 2: Создать HTTP-клиент

Создать файл `src/lib/http.ts`:

```typescript
const BASE = process.env.NEXT_PUBLIC_API_URL ?? '/api';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = localStorage.getItem('access_token');
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...init,
  });

  if (res.status === 401) {
    // токен истёк → попытаться обновить
    const refreshed = await refreshToken();
    if (!refreshed) {
      window.location.href = '/login';
      throw new Error('Unauthorized');
    }
    return request(path, init); // повторить запрос
  }

  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function refreshToken(): Promise<boolean> {
  const refresh = localStorage.getItem('refresh_token');
  if (!refresh) return false;
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
  } catch { return false; }
}

export const http = {
  get:    <T>(path: string) => request<T>(path),
  post:   <T>(path: string, body: unknown) => request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  patch:  <T>(path: string, body: unknown) => request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};
```

---

## Шаг 3: Заменить функции в src/lib/api.ts

Каждая функция в `api.ts` помечена комментарием с эндпоинтом. Замена по образцу:

### До (localStorage):
```typescript
export const projectsApi = {
  getAll: () => ls<any[]>(KEYS.projects, []),
  create: (project: any) => {
    const list = ls<any[]>(KEYS.projects, []);
    lsSet(KEYS.projects, [...list, project]);
    return project;
  },
};
```

### После (REST API):
```typescript
import { http } from './http';

export const projectsApi = {
  getAll:   () => http.get<any[]>('/projects'),
  getById:  (id: string) => http.get<any>(`/projects/${id}`),
  create:   (project: any) => http.post<any>('/projects', project),
  update:   (id: string, patch: any) => http.patch<any>(`/projects/${id}`, patch),
  remove:   (id: string) => http.delete(`/projects/${id}`),
};
```

Делать **по одной группе за раз**, тестировать каждую перед следующей.

---

## Шаг 4: Добавить авторизацию

Создать `app/login/page.tsx` (уже существует) с реальной формой:

```typescript
const handleLogin = async (email: string, password: string) => {
  const { access_token, refresh_token } = await http.post('/auth/login', { email, password });
  localStorage.setItem('access_token', access_token);
  localStorage.setItem('refresh_token', refresh_token);
  router.push('/');
};
```

Добавить middleware `middleware.ts` для защиты роутов:
```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('access_token');
  if (!token && !request.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
}
export const config = { matcher: ['/((?!_next|login|api).*)'] };
```

---

## Шаг 5: Убрать AppShell initProjects

Удалить вызов `initProjects()` из `AppShell.tsx` — проекты теперь придут с бэкенда.

Вместо этого в `AppShell.tsx`:
```typescript
useEffect(() => {
  projectsApi.getAll().then(setProjects);
}, []);
```

---

## Шаг 6: Миграция данных из localStorage

Для пользователей, у которых уже есть данные в `localStorage`, написать скрипт экспорта:

```typescript
// Запустить один раз в консоли браузера
function exportLocalData() {
  const data: Record<string, any> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)!;
    if (key.startsWith('proji_')) {
      try { data[key] = JSON.parse(localStorage.getItem(key)!); }
      catch { data[key] = localStorage.getItem(key); }
    }
  }
  console.log(JSON.stringify(data, null, 2));
}
exportLocalData();
```

Скопировать вывод и через admin-эндпоинт залить в базу.

---

## Шаг 7: Удалить localStorage fallback

После подтверждения что бэкенд работает:
1. Удалить функции `ls()` и `lsSet()` из `api.ts`
2. Удалить константу `KEYS`
3. Удалить `initProjects` из store
4. Очистить все `localStorage.getItem/setItem` из компонентов

---

## Порядок миграции (минимальный простой)

| Неделя | Что мигрировать |
|--------|-----------------|
| 1 | Auth + Me + Projects |
| 2 | Tasks + Reports |
| 3 | Admin tasks + Docs |
| 4 | Legal + Journal + Timer |

---

## Контрольный список перед релизом

- [ ] Все `localStorage.getItem/setItem` убраны из компонентов
- [ ] JWT refresh работает без ошибок
- [ ] 401 → редирект на `/login`
- [ ] Роли `admin` и `employee` проверяются на бэкенде
- [ ] CORS настроен для production домена
- [ ] Переменная `NEXT_PUBLIC_API_URL` указывает на prod сервер
- [ ] Soft delete работает (данные не удаляются физически)
