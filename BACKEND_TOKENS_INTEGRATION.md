# Интеграция Proji ↔ API tokens.kz

> Swagger: [https://api.tokens.kz/swagger/index.html](https://api.tokens.kz/swagger/index.html)  
> OpenAPI JSON: `https://api.tokens.kz/swagger/doc.json`  
> Base URL: **`https://api.tokens.kz/api/v1`**

Сейчас фронт `proji-main` хранит данные в **localStorage** (`src/lib/api.ts`, `organization.ts`, `workspace-tasks.ts`).  
Бэкенд tokens.kz уже отдаёт **организации → воркспейсы → колонки → карточки**, но **не покрывает** весь Proji (проекты, отчёты, чат, Google-auth и т.д.).

---

## 1. Что уже есть в API (можно подключать первым)

| Swagger | Назначение в Proji |
|---------|-------------------|
| `POST /organizations` | Онбординг «Создать компанию» |
| `GET /organizations/{id}` | Текущая организация |
| `GET/POST /organizations/{id}/members` | Команда, роли owner/admin/member |
| `POST /workspaces` | Воркспейс компании (1 на org для MVP) |
| `GET /workspaces/{id}/columns` | Колонки канбана |
| `POST /workspaces/{id}/columns` | Создать 5 колонок при онбординге |
| `GET/POST .../columns/{id}/cards` | Задачи на `/tasks` (канбан) |
| `GET/POST /workspaces/{id}/members` | Участники воркспейса |
| `agents`, `data` | Пока не используем на фронте |

### Маппинг сущностей

```
Proji (сейчас)          →  tokens.kz API
─────────────────────────────────────────
Organization (local)  →  organizations + organization_members
org.id как workspace  →  workspaces (отдельная сущность!)
WorkspaceTask (канбан)→  cards (в columns)
KanbanStatus (5 имён) →  columns.name (5 записей)
TaskChat              →  ❌ нет в API
projects / tasks      →  ❌ нет в API (другая модель)
reports / docs        →  ❌ нет в API
admin broadcast       →  ❌ нет в API
```

**Важно:** у вас в чате `workspace_id` = id организации из localStorage. В API **workspace_id — это число**, отдельная таблица `workspaces`, привязанная к `organization_id`. После интеграции хранить на фронте:

- `organization_id` (number)
- `workspace_id` (number) — основной канбан

---

## 2. Чего нет в Swagger (нужно добавить бэкенду)

### 2.1 Критично для работы сайта

| Нужно фронту | Статус в API |
|--------------|--------------|
| **Auth** (Google / JWT, `GET /me`) | ❌ нет |
| **Users** (email, name, avatar) | ❌ нет CRUD (только `user_id` в запросах) |
| **PATCH карточки** (смена колонки, title, priority) | ❌ нет |
| **PATCH колонки** | ❌ нет |
| **Invite-код** (как в онбординге Proji) | ❌ нет |
| **Чат** (`/messages`, чат по задаче) | ❌ нет |

### 2.2 MVP Proji (страницы уже в UI)

| Модуль | Статус |
|--------|--------|
| Канбан `/tasks` | ⚠️ частично через `cards` + `columns` |
| Сообщения `/messages` | ❌ |
| Проекты `/projects` | ❌ |
| Задачи проекта (lifecycle new→accepted→…) | ❌ |
| Отчёты | ❌ |
| Документы проекта | ❌ |
| Admin `/admin` | ❌ |
| Юридический дашборд | ❌ |
| Журнал management | ❌ |

---

## 3. Таблицы API — что есть и чего не хватает в колонках

Ниже: **✅ есть в Swagger** | **➕ добавить** для Proji.

### 3.1 `users` — **новая таблица** (в Swagger нет)

Нужна для `created_by`, `assigned_to`, Google OAuth, профиля.

```sql
users (
  id            BIGSERIAL PRIMARY KEY,        -- API везде integer
  email         TEXT UNIQUE NOT NULL,
  name          TEXT NOT NULL,
  avatar_url    TEXT,
  google_sub    TEXT UNIQUE,                  -- Google OAuth subject
  locale        TEXT DEFAULT 'ru',          -- ru | en | kz
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
)
```

**Эндпоинты (добавить):**

- `POST /auth/google` — обмен Google token → JWT + user
- `POST /auth/refresh`
- `GET /me`
- `PATCH /me`

---

### 3.2 `organizations` — ✅ есть

| Колонка (API) | Тип | Proji |
|---------------|-----|-------|
| id | integer | ✅ |
| name | string | ✅ название компании |
| created_by | integer | ✅ FK → users |
| created_at | string | ✅ |
| updated_at | string | ✅ |

**➕ Рекомендуемые колонки:**

```sql
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS
  slug           TEXT UNIQUE,              -- опционально
  invite_code    TEXT UNIQUE,              -- PROJI-XXXXXXXX для онбординга
  invite_expires_at TIMESTAMPTZ,
  settings       JSONB DEFAULT '{}';       -- лимиты, тариф
```

**Эндпоинты (добавить):**

- `POST /organizations/{id}/invites` — сгенерировать invite
- `POST /organizations/join` — body: `{ invite_code }` → member

---

### 3.3 `organization_members` — ✅ есть

| Колонка | Тип | Proji |
|---------|-----|-------|
| organization_id | integer | ✅ |
| user_id | integer | ✅ |
| role | string | ✅ `owner` / `admin` / `member` |
| created_at | string | ✅ |

**➕ Опционально:**

```sql
allowed_domains  TEXT[] DEFAULT '{all}',   -- 'Финансы','Маркетинг' или all
joined_at        TIMESTAMPTZ DEFAULT NOW()
```

---

### 3.4 `workspaces` — ✅ есть

| Колонка | Тип | Proji |
|---------|-----|-------|
| id | integer | ✅ вместо org id в чате/канбане |
| organization_id | integer | ✅ |
| name | string | ✅ |
| created_by | integer | ✅ |
| created_at / updated_at | string | ✅ |

**➕ Рекомендуемые:**

```sql
is_default       BOOLEAN DEFAULT TRUE,      -- главный воркспейс org
business_domain  TEXT DEFAULT 'Общий',     -- Общий|Финансы|... (домен Proji)
```

**Эндпоинты (добавить):**

- `DELETE /workspaces/{id}` — soft delete

---

### 3.5 `workspace_members` — ✅ есть

Как `organization_members`, роли `owner` / `admin` / `member`.

---

### 3.6 `columns` — ✅ есть

| Колонка | Тип | Proji канбан |
|---------|-----|----------------|
| id | integer | ✅ |
| workspace_id | integer | ✅ |
| name | string | ✅ = статус: Бэклог, К выполнению, … |
| position | integer | ✅ порядок колонок |
| created_by | integer | ✅ |

**➕ Рекомендуемые:**

```sql
slug           TEXT,                         -- backlog | todo | in_progress | done | archive
is_done        BOOLEAN DEFAULT FALSE,        -- для колонки «Готово»
is_archive     BOOLEAN DEFAULT FALSE         -- для «Архив»
```

При онбординге создать 5 колонок с `name` + `slug` (см. `KANBAN_STATUS_IDS` во фронте).

**Эндпоинты (добавить):**

- `PATCH /workspaces/{ws}/columns/{id}` — переименование, position
- `DELETE /workspaces/{ws}/columns/{id}`

---

### 3.7 `cards` — ✅ есть, **не хватает полей**

| Колонка (API) | Тип | Есть на фронте `/tasks` |
|---------------|-----|-------------------------|
| id | integer | ✅ id |
| workspace_id | integer | ✅ |
| column_id | integer | ✅ status → колонка |
| title | string | ✅ |
| description | string | ✅ |
| assigned_to | integer | ⚠️ только user_id (нет email/name в API) |
| due_at | string | ✅ dueDate |
| position | integer | ✅ порядок в колонке |
| is_archived | boolean | ⚠️ частично «Архив» |
| created_by | integer | ✅ |
| created_at / updated_at | string | ✅ |

**➕ Обязательные для Proji:**

```sql
ALTER TABLE cards ADD COLUMN IF NOT EXISTS
  priority         TEXT DEFAULT 'medium',    -- low | medium | high  (фронт: High/Medium/Low)
  story_points     INT DEFAULT 0,            -- sp на карточке
  tag              TEXT,                     -- общее, Проект
  category         TEXT DEFAULT 'Общее',
  completed_at     TIMESTAMPTZ,              -- когда попала в «Готово»
  assignee_name    TEXT,                     -- кэш имени (или JOIN users)
  assignee_email   TEXT;                     -- для фильтра без JOIN
```

**Эндпоинты (добавить — без них канбан не работает):**

```
GET    /workspaces/{ws}/cards/{card_id}
PATCH  /workspaces/{ws}/cards/{card_id}     -- title, description, priority, due_at, assigned_to, ...
PATCH  /workspaces/{ws}/cards/{card_id}/move  -- body: { column_id, position }
DELETE /workspaces/{ws}/cards/{card_id}
GET    /workspaces/{ws}/cards               -- все карточки воркспейса (не только по колонке)
```

---

### 3.8 `task_chat_messages` — **новая таблица**

Фронт: `TeamChat`, `app/api/task-chat`.

```sql
task_chat_messages (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id  BIGINT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  task_id       BIGINT REFERENCES cards(id) ON DELETE CASCADE,  -- NULL = общий чат
  user_id       BIGINT NOT NULL REFERENCES users(id),
  text          TEXT NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW()
)
CREATE INDEX idx_chat_ws_task ON task_chat_messages(workspace_id, task_id, created_at);
```

**Эндпоинты:**

```
GET  /workspaces/{ws}/messages?task_id=
POST /workspaces/{ws}/messages   -- { task_id?, text }
```

---

### 3.9 Модули Proji **вне** Kanban API — отдельные таблицы

Если tokens.kz — только канбан, остальное — второй сервис или расширение БД. Схема из `BACKEND_TASKS.md` (актуально для фронта):

#### `projects`

```sql
projects (
  id, name, description, status, framework, deadline, start_date,
  progress, budget, spent, risk_level, priority,
  organization_id BIGINT REFERENCES organizations(id),  -- ➕ связь с org
  owner_id BIGINT REFERENCES users(id),
  created_at, updated_at, deleted_at
)
```

#### `project_tasks` (не путать с `cards`!)

```sql
project_tasks (
  id, project_id, title, description,
  status TEXT,  -- new|accepted|review|declined|completed
  priority, deadline, urgent, assigned_by, decline_reason, report_text,
  created_at, updated_at
)
-- + task_checklist, task_attachments
```

#### `reports`, `project_docs`, `admin_tasks`, `contracts`, `legal_cases`, `journal_entries`

См. полные DDL в `BACKEND_TASKS.md` (разделы 4–8).

---

## 4. План подключения фронта (порядок)

### Этап A — env и клиент

```env
NEXT_PUBLIC_API_URL=https://api.tokens.kz/api/v1
```

Использовать `src/lib/http.ts` (JWT в `localStorage`: `access_token`, `refresh_token`).

### Этап B — онбординг

1. Google login → `users` + JWT (когда появится auth).
2. `POST /organizations` → сохранить `organization_id`.
3. `POST /workspaces` → сохранить `workspace_id`.
4. `POST` × 5 колонок канбана.
5. Invite: `invite_code` на org или `POST .../invites`.

Заменить `src/lib/organization.ts` на вызовы API.

### Этап C — канбан `/tasks`

Заменить `workspace-tasks.ts`:

- загрузка: `GET columns` + `GET cards` (или один `GET /workspaces/{id}/cards`)
- создание: `POST .../columns/{col}/cards`
- DnD / смена статуса: `PATCH .../cards/{id}/move`
- обновление полей: `PATCH .../cards/{id}`

Маппер `card → WorkspaceTask` в `src/lib/tokens-mappers.ts` (создать при интеграции).

### Этап D — чат

Перенести `app/api/task-chat` на бэкенд или BFF Next.js → tokens API messages.

### Этап E — проекты, отчёты, admin

После появления таблиц из §3.9 — переключить `src/lib/api.ts` с localStorage на `http.get/post`.

---

## 5. Сводка: что попросить у бэкенд-разработчика

### Минимум для замены localStorage на MVP-страницах

1. **Auth + `users`**
2. **`cards`**: колонки `priority`, `story_points`, `tag`, `category`, `completed_at`, `assignee_email`
3. **Эндпоинты** `PATCH/DELETE` card, `PATCH move`, `GET all cards by workspace`
4. **`task_chat_messages`** + GET/POST messages
5. **`organizations.invite_code`** + join by code
6. **Связь** `workspaces.organization_id` — при создании org автоматически default workspace + 5 columns

### Позже (остальной Proji)

7. `projects`, `project_tasks`, `reports`, `project_docs`, `admin_tasks`, legal, journal — по `BACKEND_TASKS.md`

---

## 6. Пример маппинга Card → WorkspaceTask

```ts
// column.name должно совпадать с KanbanStatus или использовать column.slug
{
  id: String(card.id),
  title: card.title,
  description: card.description,
  status: columnName as KanbanStatus,  // из columns[].name
  priority: card.priority ?? 'Medium',
  sp: card.story_points ?? 0,
  assigneeName: card.assignee_name ?? user.name,
  assigneeEmail: card.assignee_email ?? user.email,
  assignee: String(card.assigned_to ?? ''),
  dueDate: card.due_at,
  completedAt: card.completed_at,
  createdAt: card.created_at,
  updatedAt: card.updated_at,
  category: card.category,
  tag: card.tag,
}
```

---

## 7. Контакты / проверка

- Swagger UI: [api.tokens.kz/swagger/index.html](https://api.tokens.kz/swagger/index.html)
- Spec: `GET https://api.tokens.kz/swagger/doc.json`
- В spec указан `host: localhost:8080` — на проде использовать **`https://api.tokens.kz/api/v1`**

Фронт готов к переключению через `NEXT_PUBLIC_API_URL` + замена тел в `organization.ts`, `workspace-tasks.ts`, `api.ts` (комментарии с путями уже есть).
