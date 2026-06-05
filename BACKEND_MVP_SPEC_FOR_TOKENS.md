# ТЗ для бэкенда tokens.kz — только MVP Proji

**Swagger (текущий):** [https://api.tokens.kz/swagger/index.html](https://api.tokens.kz/swagger/index.html)  
**Base URL:** `https://api.tokens.kz/api/v1`  
**OpenAPI:** `https://api.tokens.kz/swagger/doc.json`

Фронт: `proji-main`. Сейчас данные в **localStorage**. Нужно подключить API только для страниц ниже.  
**Проекты, admin, legal, отчёты, маркетинг и прочие заглушки — не делаем.**

---

## 1. Какие страницы входят в MVP (только их)

| Страница | Путь | Нужны данные с API? |
|----------|------|---------------------|
| Лендинг | `/` | Нет |
| Вход / регистрация | `/login`, `/register` | **Да** — Google + JWT |
| Онбординг | `/onboarding` | **Да** — org + invite |
| AI-чат | `/chat` | Нет* (ответы через Gemini на фронте) |
| Домены | `/domains` | Частично (роли/доступ к доменам) |
| Задачи, канбан | `/tasks` | **Да** — columns + cards |
| Командный чат | `/messages` + вкладка «Чат» в `/tasks` | **Да** — messages |

\* История AI-чата пока в браузере; таблицу для AI можно не делать в первой итерации.

---

## 2. Что уже есть в Swagger (оставить, доработать колонки)

### 2.1 `organizations` — есть

| Колонка | Сейчас | Нужно для Proji |
|---------|--------|-----------------|
| id | ✅ | ✅ |
| name | ✅ | ✅ |
| created_by | ✅ | ✅ |
| created_at, updated_at | ✅ | ✅ |
| **invite_code** | ❌ | **➕ TEXT UNIQUE** — код `PROJI-XXXXXXXX` |
| **invite_expires_at** | ❌ | **➕ TIMESTAMPTZ** (опционально) |

---

### 2.2 `organization_members` — есть

| Колонка | Сейчас | Нужно для Proji |
|---------|--------|-----------------|
| organization_id | ✅ | ✅ |
| user_id | ✅ | ✅ |
| role | ✅ | `owner` \| `admin` \| `member` |
| created_at | ✅ | ✅ |
| **allowed_domains** | ❌ | **➕ TEXT[]** — `{'all'}` или `{'Финансы','Маркетинг'}` для `/domains` |

---

### 2.3 `workspaces` — есть

| Колонка | Сейчас | Нужно для Proji |
|---------|--------|-----------------|
| id | ✅ | ✅ главный id для канбана и чата |
| organization_id | ✅ | ✅ |
| name | ✅ | ✅ например «Основной» |
| created_by | ✅ | ✅ |
| created_at, updated_at | ✅ | ✅ |
| **is_default** | ❌ | **➕ BOOLEAN DEFAULT true** |

> При создании организации автоматически создавать 1 default workspace.

---

### 2.4 `workspace_members` — есть

Без новых колонок. Роли: `owner`, `admin`, `member`.

---

### 2.5 `columns` — есть

| Колонка | Сейчас | Нужно для Proji |
|---------|--------|-----------------|
| id | ✅ | ✅ |
| workspace_id | ✅ | ✅ |
| name | ✅ | ✅ русские имена колонок (см. §5) |
| position | ✅ | ✅ 0..4 |
| created_by | ✅ | ✅ |
| **slug** | ❌ | **➕ TEXT** — `backlog`, `todo`, `in_progress`, `done`, `archive` |
| **is_done** | ❌ | **➕ BOOLEAN** — true для «Готово» |
| **is_archive** | ❌ | **➕ BOOLEAN** — true для «Архив» |

---

### 2.6 `cards` — есть, **много полей не хватает**

| Колонка | Сейчас | Нужно для Proji |
|---------|--------|-----------------|
| id | ✅ | ✅ |
| workspace_id | ✅ | ✅ |
| column_id | ✅ | ✅ = статус канбана |
| title | ✅ | ✅ |
| description | ✅ | ✅ |
| assigned_to | ✅ | user_id |
| due_at | ✅ | ✅ дедлайн |
| position | ✅ | ✅ порядок в колонке |
| is_archived | ✅ | ✅ |
| created_by, created_at, updated_at | ✅ | ✅ |
| **priority** | ❌ | **➕ TEXT** — `low` \| `medium` \| `high` |
| **story_points** | ❌ | **➕ INT** — число на карточке (sp) |
| **tag** | ❌ | **➕ TEXT** — например `общее`, `Проект` |
| **category** | ❌ | **➕ TEXT DEFAULT 'Общее'** |
| **completed_at** | ❌ | **➕ TIMESTAMPTZ** — при переходе в «Готово» |
| **assignee_email** | ❌ | **➕ TEXT** — для фильтра на UI |
| **assignee_name** | ❌ | **➕ TEXT** — отображение без лишнего JOIN |

---

## 3. Какие таблицы полностью отсутствуют (создать)

### 3.1 `users` — **новая**

Без неё нельзя Google-вход и `created_by` / `assigned_to`.

```sql
CREATE TABLE users (
  id            BIGSERIAL PRIMARY KEY,
  email         TEXT NOT NULL UNIQUE,
  name          TEXT NOT NULL,
  avatar_url    TEXT,
  google_sub    TEXT UNIQUE,              -- subject из Google OAuth
  locale        TEXT DEFAULT 'ru',        -- ru | en | kz
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

### 3.2 `organization_invites` — **новая** (альтернатива: только `organizations.invite_code`)

Если один код на организацию — достаточно колонки `invite_code` в `organizations`.  
Если много кодов:

```sql
CREATE TABLE organization_invites (
  id              BIGSERIAL PRIMARY KEY,
  organization_id BIGINT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  code            TEXT NOT NULL UNIQUE,
  created_by      BIGINT NOT NULL REFERENCES users(id),
  expires_at      TIMESTAMPTZ,
  max_uses        INT,
  uses_count      INT DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

### 3.3 `task_chat_messages` — **новая**

Командный чат `/messages` и чат по задаче в `/tasks`.

```sql
CREATE TABLE task_chat_messages (
  id            BIGSERIAL PRIMARY KEY,
  workspace_id  BIGINT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  card_id       BIGINT REFERENCES cards(id) ON DELETE CASCADE,  -- NULL = общий чат команды
  user_id       BIGINT NOT NULL REFERENCES users(id),
  text          TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_chat_ws_card ON task_chat_messages(workspace_id, card_id, created_at);
```

Ответ API (для фронта):

```json
{
  "id": 1,
  "workspace_id": 10,
  "card_id": null,
  "user_id": 5,
  "user_name": "Али",
  "user_email": "ali@company.kz",
  "text": "Привет",
  "created_at": "2026-05-26T12:00:00Z"
}
```

---

### 3.4 `refresh_tokens` — **новая** (для JWT)

```sql
CREATE TABLE refresh_tokens (
  id         BIGSERIAL PRIMARY KEY,
  user_id    BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

### 3.5 `domain_access_keys` — **опционально** (экран домена с ключом)

Если нужен вход в домен по ключу (не только manager):

```sql
CREATE TABLE domain_access_keys (
  id              BIGSERIAL PRIMARY KEY,
  organization_id BIGINT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  domain          TEXT NOT NULL,           -- 'Маркетинг', 'Юридический', ...
  key_hash        TEXT NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (organization_id, domain)
);
```

---

## 4. Какие ручки (эндпоинты) должны быть

### 4.1 Auth — **сейчас нет в Swagger, сделать обязательно**

| Метод | Путь | Описание |
|-------|------|----------|
| POST | `/auth/google` | Body: `{ "id_token": "..." }` → `{ access_token, refresh_token, user }` |
| POST | `/auth/refresh` | Body: `{ "refresh_token": "..." }` → `{ access_token }` |
| POST | `/auth/logout` | Инвалидация refresh |
| GET | `/me` | Текущий пользователь (JWT) |
| PATCH | `/me` | `{ name, locale, avatar_url }` |

Все остальные ручки — **Authorization: Bearer &lt;access_token&gt;**.

---

### 4.2 Organizations + онбординг

| Метод | Путь | Статус | Действие |
|-------|------|--------|----------|
| POST | `/organizations` | есть | Body: `{ "name" }` — **без** `created_by` в body, брать из JWT |
| GET | `/organizations/{id}` | есть | |
| GET | `/organizations` | есть | Список org текущего user |
| GET | `/organizations/{id}/members` | есть | |
| POST | `/organizations/{id}/members` | есть | Добавить участника |
| PATCH | `/organizations/{id}/members/{user_id}` | есть | Роль + **allowed_domains** |
| DELETE | `/organizations/{id}/members/{user_id}` | есть | |
| **POST** | **`/organizations/join`** | **нет** | Body: `{ "invite_code": "PROJI-..." }` → org + member |
| **GET** | **`/organizations/{id}/invite`** | **нет** | Сгенерировать/получить invite_code (admin) |

**После POST `/organizations` автоматически:**

1. `organization_members` — creator = `owner`
2. `workspaces` — 1 запись `is_default=true`, name=`Основной`
3. `workspace_members` — creator = `owner`
4. `columns` — 5 штук (см. §5)

---

### 4.3 Workspaces

| Метод | Путь | Статус | Действие |
|-------|------|--------|----------|
| POST | `/workspaces` | есть | Body: `{ "organization_id", "name" }` |
| GET | `/workspaces/{id}` | есть | |
| GET | `/organizations/{org_id}/workspaces` | есть | |
| **GET** | **`/organizations/{org_id}/workspaces/default`** | **нет** | Вернуть default workspace |

---

### 4.4 Columns (канбан)

| Метод | Путь | Статус | Действие |
|-------|------|--------|----------|
| GET | `/workspaces/{ws_id}/columns` | есть | Сортировка по `position` |
| POST | `/workspaces/{ws_id}/columns` | есть | |
| **PATCH** | **`/workspaces/{ws_id}/columns/{id}`** | **нет** | `{ name, position, slug }` |
| **DELETE** | **`/workspaces/{ws_id}/columns/{id}`** | **нет** | |

---

### 4.5 Cards (задачи канбана) — **критично**

| Метод | Путь | Статус | Действие |
|-------|------|--------|----------|
| GET | `/workspaces/{ws_id}/columns/{col_id}/cards` | есть | Список в колонке |
| POST | `/workspaces/{ws_id}/columns/{col_id}/cards` | есть | Создать карточку |
| **GET** | **`/workspaces/{ws_id}/cards`** | **нет** | Все карточки воркспейса (для загрузки канбана одним запросом) |
| **GET** | **`/workspaces/{ws_id}/cards/{card_id}`** | **нет** | Одна карточка |
| **PATCH** | **`/workspaces/{ws_id}/cards/{card_id}`** | **нет** | Обновить поля (title, description, priority, due_at, assigned_to, tag, category, story_points…) |
| **PATCH** | **`/workspaces/{ws_id}/cards/{card_id}/move`** | **нет** | Body: `{ "column_id": 3, "position": 0 }` — **DnD между колонками** |
| **DELETE** | **`/workspaces/{ws_id}/cards/{card_id}`** | **нет** | |

При `move` в колонку с `is_done=true` — проставлять `completed_at=NOW()`.

---

### 4.6 Командный чат — **сейчас нет**

| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/workspaces/{ws_id}/messages` | Query: `card_id` (optional). Сортировка `created_at ASC`. Пагинация `?after_id=` |
| POST | `/workspaces/{ws_id}/messages` | Body: `{ "text": "...", "card_id": null \| 123 }` |

---

### 4.7 Domain keys — **опционально**

| Метод | Путь | Описание |
|-------|------|----------|
| POST | `/organizations/{org_id}/domains/verify` | Body: `{ "domain": "Маркетинг", "key": "MKT-..." }` → `{ "valid": true }` |

---

## 5. Сиды при создании организации (5 колонок)

Создать автоматически в default workspace:

| position | name | slug | is_done | is_archive |
|----------|------|------|---------|------------|
| 0 | Бэклог | backlog | false | false |
| 1 | К выполнению | todo | false | false |
| 2 | В работе | in_progress | false | false |
| 3 | Готово | done | true | false |
| 4 | Архив | archive | false | true |

---

## 6. Что НЕ нужно делать (вне MVP)

Не добавлять таблицы и ручки для:

- `/projects`, задачи проекта (new/accepted/review…)
- `/admin` — рассылка задач
- `/legal/dashboard`, `/campaigns`, `/leads`, `/seo`
- `/management/report`, `/management/journal`
- `/reports`, `/documents` (проектные)
- `/scenarios` (библиотека — статика/UI)
- AI Gemini — остаётся на Next.js (`/api/ai`), не в tokens API

---

## 7. Чеклист для программиста (кратко)

- [ ] Таблица `users` + Google auth + JWT
- [ ] `organizations.invite_code` + `POST /organizations/join`
- [ ] Автосоздание workspace + 5 columns при создании org
- [ ] Доп. колонки в `cards` (priority, story_points, tag, category, completed_at, assignee_*)
- [ ] **PATCH card** + **PATCH card/move** + GET all cards
- [ ] Таблица `task_chat_messages` + GET/POST messages
- [ ] `organization_members.allowed_domains` (для `/domains`)
- [ ] CORS: `http://localhost:3000`, production `https://progpt.kz`
- [ ] Все POST/PATCH: `created_by` из JWT, не из body клиента

---

## 8. Переменная для фронта после готовности

```env
NEXT_PUBLIC_API_URL=https://api.tokens.kz/api/v1
```

Фронт подключит: онбординг → канбан → командный чат.
