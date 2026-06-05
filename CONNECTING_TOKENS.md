# Как подключить api.tokens.kz к Proji

## Схема

```
Браузер  →  Next.js (/api/tokens/...)  →  api.tokens.kz/api/v1
              ↑ Google session            ↑ Bearer TOKENS_API_BEARER_TOKEN
```

Фронт **не** ходит на tokens.kz напрямую (нет CORS, токен только на сервере).

---

## Шаг 1. Получить токен у бэкендера

API уже отвечает `401 unauthorized` без токена. Нужен **Bearer token** (сервисный или JWT после `/auth/google`).

---

## Шаг 2. Добавить в `.env.local`

```env
# Включить интеграцию с tokens.kz
NEXT_PUBLIC_USE_TOKENS_API=true

# URL API (не менять, если не сказали иное)
TOKENS_API_URL=https://api.tokens.kz/api/v1

# Секретный токен — ТОЛЬКО на сервере, не коммитить
TOKENS_API_BEARER_TOKEN=вставь_токен_от_бэкенда

# Пока нет /auth/google на API — id пользователя для created_by
TOKENS_API_USER_ID=1
```

Без `NEXT_PUBLIC_USE_TOKENS_API=true` сайт работает как раньше (**localStorage**).

---

## Шаг 3. Перезапустить dev-сервер

```bash
cd proji-main
npm run dev
```

---

## Шаг 4. Проверка

1. Войти через Google → `/onboarding`
2. **Создать компанию** — должен вызваться `POST /api/tokens/onboarding/create`  
   → на бэкенде: organization + workspace + 5 columns
3. Открыть `/tasks` — загрузка `GET /api/tokens/workspace/{id}/kanban`
4. Перетащить карточку — `PATCH .../cards/{id}/move` (когда бэкенд добавит ручку)
5. `/messages` — чат через `/api/tokens/workspace/{id}/messages` (или fallback в память)

В DevTools → Network смотри запросы к `/api/tokens/...`.

---

## Что уже подключено в коде

| MVP | BFF маршрут |
|-----|-------------|
| Создать org | `POST /api/tokens/onboarding/create` |
| Войти по invite | `POST /api/tokens/onboarding/join` (когда есть API join) |
| Канбан | `GET/POST/PATCH /api/tokens/workspace/[id]/kanban/...` |
| Чат | `GET/POST /api/tokens/workspace/[id]/messages` |

---

## Если что-то не работает

| Ошибка | Причина |
|--------|---------|
| `TOKENS_API_BEARER_TOKEN is not configured` | Нет токена в `.env.local` |
| `401` от tokens.kz | Неверный или просроченный Bearer |
| `404` на move/patch card | Бэкенд ещё не добавил ручки — см. `BACKEND_MVP_SPEC_FOR_TOKENS.md` |
| `501` на join | Нет `POST /organizations/join` — пока join только по local invite |
| Данные пустые | Нет колонок при создании org — проверь bootstrap на бэкенде |

---

## Swagger

[https://api.tokens.kz/swagger/index.html](https://api.tokens.kz/swagger/index.html)

ТЗ для бэкенда: `BACKEND_MVP_SPEC_FOR_TOKENS.md`
