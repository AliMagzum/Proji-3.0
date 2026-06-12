# Proji — структура БД (по PDF-ТЗ)

> Источники (без отклонений от DDL в ТЗ):
> 1. `Claud TZ DB structure.pdf` — **proji-data-layer** (ядро, граф, канбан, auth)
> 2. `proji_backend_detailed_specification.pdf` — классическая REST-модель (12 таблиц)
> 3. `PROJI_Backend_TZ_Extended.pdf` — расширенный CORE (31 сущность)

**СУБД:** PostgreSQL 16 · **PK:** UUID · **Время:** `TIMESTAMPTZ`

---

## Как связаны три PDF

| PDF | Роль | Когда использовать |
|-----|------|-------------------|
| **Claud TZ** | Data Layer + граф знаний + канбан-проекция | Бэкенд FastAPI, ingestion, LLM, Qdrant |
| **Detailed spec** | Классический таск-трекер + BI | NestJS/FastAPI REST, если без графа |
| **Extended TZ** | Enterprise-дорожная карта | V2 → Enterprise поверх CORE |

**Рекомендация для Proji:** база = **Claud TZ (обязательный DDL)** + таблицы из **Extended TZ**, которых нет в Claud, но нужны фронту (conversations/messages для командного чата).

PDF-версия: [`Proji_DATABASE_SCHEMA.pdf`](./Proji_DATABASE_SCHEMA.pdf)  
Пересобрать: `python3 docs/generate_schema_pdf.py`

---

# ЧАСТЬ 1 — Claud TZ (Business Context Engine)

## Архитектура (5 слоёв)

```
Sources → raw_events → facts → Knowledge Graph (nodes + edges) + Qdrant
                                              ↓
                              assessments / recommendations / tasks (проекция)
```

**Принцип:** `raw_events` и `facts` — **append-only**. Нет `UPDATE`/`DELETE`. Закрытие факта/ребра — `valid_to = now()`.

## 1.1. Ядро MVP — 6 таблиц (обязательный DDL)

### `raw_events` — журнал сырых событий

```sql
CREATE TABLE raw_events (
  id            BIGINT GENERATED ALWAYS AS IDENTITY,
  org_id        UUID NOT NULL,
  source        TEXT NOT NULL,          -- 'whatsapp' | 'telegram' | 'log' | 'doc' | ...
  source_external_id TEXT,
  occurred_at   TIMESTAMPTZ NOT NULL,
  ingested_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  actor_external_ref TEXT,
  payload       JSONB NOT NULL,
  content_hash  TEXT NOT NULL,
  PRIMARY KEY (org_id, id)
);
CREATE UNIQUE INDEX uq_raw_events_hash ON raw_events (org_id, content_hash);
CREATE INDEX ix_raw_events_occurred ON raw_events (org_id, occurred_at);
CREATE INDEX ix_raw_events_source ON raw_events (org_id, source, occurred_at);
```

### `outbox` — Outbox Pattern (Celery)

```sql
CREATE TABLE outbox (
  id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  org_id        UUID NOT NULL,
  event_id      BIGINT NOT NULL,
  task_type     TEXT NOT NULL,          -- 'extract_facts' | 'embed_event'
  status        TEXT NOT NULL DEFAULT 'pending',  -- pending | processing | done | failed
  attempts      INT NOT NULL DEFAULT 0,
  last_error    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at  TIMESTAMPTZ
);
CREATE INDEX ix_outbox_pending ON outbox (status, created_at) WHERE status = 'pending';
```

### `facts` — извлечённые LLM факты

```sql
CREATE TABLE facts (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id           UUID NOT NULL,
  fact_type        TEXT NOT NULL,       -- 'task_mentioned' | 'commitment' | 'blocker' | ...
  subject_node_id  UUID,
  predicate        TEXT,
  object_node_id   UUID,
  attributes       JSONB NOT NULL DEFAULT '{}',
  source_event_id  BIGINT NOT NULL,
  extractor_version TEXT NOT NULL,      -- 'extract-v1'
  confidence       NUMERIC(3,2) NOT NULL,
  valid_from       TIMESTAMPTZ NOT NULL DEFAULT now(),
  valid_to         TIMESTAMPTZ          -- NULL = актуален
);
CREATE INDEX ix_facts_subject ON facts (org_id, subject_node_id) WHERE valid_to IS NULL;
CREATE INDEX ix_facts_source ON facts (org_id, source_event_id);
CREATE INDEX ix_facts_type ON facts (org_id, fact_type, valid_from);
```

### `nodes` — узлы графа знаний

```sql
CREATE TABLE nodes (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id     UUID NOT NULL,
  node_type  TEXT NOT NULL,             -- 'direction' | 'project' | 'sprint' | 'task' | 'person' | ...
  title      TEXT NOT NULL,
  props      JSONB NOT NULL DEFAULT '{}',
  status     TEXT,                      -- 'auto_created' | ...
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ix_nodes_type ON nodes (org_id, node_type);
CREATE INDEX ix_nodes_title ON nodes USING gin (to_tsvector('simple', title));
```

### `edges` — связи графа

```sql
CREATE TABLE edges (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID NOT NULL,
  from_node       UUID NOT NULL REFERENCES nodes(id),
  to_node         UUID NOT NULL REFERENCES nodes(id),
  edge_type       TEXT NOT NULL,        -- 'belongs_to' | 'assigned_to' | 'blocks' | ...
  props           JSONB NOT NULL DEFAULT '{}',
  source_fact_id  UUID REFERENCES facts(id),
  valid_from      TIMESTAMPTZ NOT NULL DEFAULT now(),
  valid_to        TIMESTAMPTZ
);
CREATE INDEX ix_edges_from ON edges (org_id, from_node, edge_type) WHERE valid_to IS NULL;
CREATE INDEX ix_edges_to ON edges (org_id, to_node, edge_type) WHERE valid_to IS NULL;
```

### `assessments` + `recommendations` — заготовки аналитики

```sql
CREATE TABLE assessments (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id           UUID NOT NULL,
  target_node_id   UUID NOT NULL REFERENCES nodes(id),
  framework        TEXT NOT NULL,
  result           JSONB NOT NULL,
  inputs_fact_ids  UUID[] NOT NULL DEFAULT '{}',
  computed_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE recommendations (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id           UUID NOT NULL,
  target_node_id   UUID NOT NULL REFERENCES nodes(id),
  rec_type         TEXT NOT NULL,
  rationale        JSONB NOT NULL,
  status           TEXT NOT NULL DEFAULT 'proposed',  -- proposed | accepted | rejected
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at      TIMESTAMPTZ
);
```

**Multi-tenancy:** у каждой таблицы обязателен `org_id`. Фильтр по `org_id` — во всех запросах и в Qdrant.

---

## 1.2. Auth и пользователи (Этап 7, Claud TZ)

### `users`

```sql
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  full_name     TEXT NOT NULL,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### `memberships`

```sql
CREATE TABLE memberships (
  user_id    UUID NOT NULL REFERENCES users(id),
  org_id     UUID NOT NULL,
  role       TEXT NOT NULL,             -- 'owner' | 'admin' | 'member' | 'viewer'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, org_id)
);
```

### `refresh_tokens` (коррекция JWT, раздел 20.1)

```sql
CREATE TABLE refresh_tokens (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id),
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  revoked_at TIMESTAMPTZ
);
```

**RBAC:** `owner` > `admin` > `member` > `viewer`. `org_id` только из membership, не из body запроса.

---

## 1.3. Kanban-проекция (Этап 8, Claud TZ)

Задача в графе = `nodes.node_type = 'task'`. Для доски — типизированная проекция:

```sql
CREATE TABLE tasks (
  node_id          UUID PRIMARY KEY REFERENCES nodes(id),
  org_id           UUID NOT NULL,
  project_node_id  UUID NOT NULL REFERENCES nodes(id),
  column_status    TEXT NOT NULL DEFAULT 'todo',  -- todo | in_progress | review | done | ...
  order_index      NUMERIC(20,10) NOT NULL,
  assignee_node_id UUID REFERENCES nodes(id),
  due_at           TIMESTAMPTZ,
  rice_reach       NUMERIC(10,2),
  rice_impact      NUMERIC(10,2),
  rice_confidence  NUMERIC(5,2),
  rice_effort      NUMERIC(10,2),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ix_tasks_board ON tasks (org_id, project_node_id, column_status, order_index);
```

**RICE:** считается на лету: `(reach × impact × confidence) / effort` — не хранить итоговый score.

**Batch:** `PATCH /v1/tasks/batch` — до 100 элементов, атомарная транзакция.

**Спринты (проекция):**

```sql
CREATE TABLE sprints (
  node_id          UUID PRIMARY KEY REFERENCES nodes(id),
  org_id           UUID NOT NULL,
  project_node_id  UUID NOT NULL REFERENCES nodes(id),
  name             TEXT NOT NULL,
  start_date       TIMESTAMPTZ,
  end_date         TIMESTAMPTZ,
  status           TEXT NOT NULL DEFAULT 'planned'
);
-- tasks.sprint_id → sprints.node_id (добавить колонку при необходимости)
```

---

## 1.4. Продуктовые таблицы (Claud TZ, этапы 9–10)

### `notifications`

```sql
CREATE TABLE notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      UUID NOT NULL,
  user_id     UUID NOT NULL REFERENCES users(id),
  notif_type  TEXT NOT NULL,            -- mention | deadline | assignment
  payload     JSONB NOT NULL,
  is_read     BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### `files` (S3 Presigned)

```sql
CREATE TABLE files (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      UUID NOT NULL,
  node_id     UUID REFERENCES nodes(id),
  s3_key      TEXT NOT NULL,
  filename    TEXT NOT NULL,
  mime_type   TEXT NOT NULL,
  size_bytes  BIGINT,
  status      TEXT NOT NULL DEFAULT 'pending',
  uploaded_by UUID REFERENCES users(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### `documents` (wiki, отчёты)

```sql
CREATE TABLE documents (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      UUID NOT NULL,
  node_id     UUID REFERENCES nodes(id),
  title       TEXT NOT NULL,
  content     TEXT,
  doc_type    TEXT NOT NULL,
  file_id     UUID REFERENCES files(id),
  author_id   UUID REFERENCES users(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### `chat_messages` (AI-чат, SSE)

```sql
CREATE TABLE chat_messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID NOT NULL,
  user_id         UUID REFERENCES users(id),
  context_node_id UUID REFERENCES nodes(id),
  role            TEXT NOT NULL,        -- user | assistant | system
  content         TEXT NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ix_chat_messages_context ON chat_messages (org_id, context_node_id, created_at);
```

---

## 1.5. Qdrant (не PostgreSQL)

Коллекция `proji_chunks`: cosine, dim=768, модель `intfloat/multilingual-e5-base`.

Payload: `org_id`, `source_event_id`, `chunk_index`, `node_ids[]`, `occurred_at`, `source`.

---

## 1.6. API-префиксы (Claud TZ, раздел 20.6)

| Тег | Префикс | Содержимое |
|-----|---------|------------|
| auth | `/v1/auth/` | login, refresh, logout |
| events | `/v1/events` | ingestion |
| graph | `/v1/nodes`, `/v1/edges`, `/v1/graph/` | граф |
| tasks | `/v1/tasks/`, `/v1/projects/` | канбан, batch, RICE |
| ai | `/v1/ai/` | chat SSE |
| search | `/v1/search` | семантика |
| files | `/v1/files/` | presign, confirm |
| documents | `/v1/documents/` | wiki |
| notifications | `/v1/notifications/` | список |
| ws | `/ws` | WebSocket |

---

# ЧАСТЬ 2 — Detailed Specification (12 таблиц)

> Классическая модель без графа. Можно использовать как **альтернативный слой** или мигрировать в `nodes`/`edges`.

| # | Таблица | Назначение |
|---|---------|------------|
| 1 | `users` | Пользователи (`role`: admin, manager, employee, guest) |
| 2 | `business_lines` | Бизнес-направления |
| 3 | `projects` | Проекты |
| 4 | `project_members` | Участники (PK: project_id + user_id) |
| 5 | `sprints` | Спринты |
| 6 | `tasks` | Задачи (status: backlog, todo, doing, in_review, done) |
| 7 | `task_dependencies` | Зависимости задач |
| 8 | `documents` | База знаний |
| 9 | `chat_messages` | ИИ-чат (role: user, ai, system) |
| 10 | `raw_activity_logs` | Внешние логи (≈ `raw_events` в Claud TZ) |
| 11 | `analysis_insights` | ИИ-анализ (JSONB + GIN) |
| 12 | `recommendations` | Рекомендации (target_type: task, project, team, user) |

### Поля ключевых таблиц (как в PDF)

<details>
<summary><code>users</code></summary>

| Поле | Тип |
|------|-----|
| id | UUID PK |
| email | VARCHAR(255) UNIQUE NOT NULL |
| password_hash | VARCHAR(255) NOT NULL |
| full_name | VARCHAR(255) NOT NULL |
| role | ENUM admin, manager, employee, guest |
| avatar_url | VARCHAR(500) |
| created_at | TIMESTAMPTZ |
</details>

<details>
<summary><code>tasks</code> (detailed spec)</summary>

| Поле | Тип |
|------|-----|
| id | UUID PK |
| project_id | UUID FK |
| sprint_id | UUID FK NULL |
| parent_id | UUID FK NULL |
| title | VARCHAR(255) |
| description | TEXT |
| status | ENUM backlog, todo, doing, in_review, done |
| priority | ENUM low, medium, high, critical |
| assignee_id, creator_id | UUID FK |
| order_index | FLOAT DEFAULT 0 |
| rice_reach, rice_impact, rice_confidence, rice_effort | NUMERIC |
| due_date, created_at, updated_at | TIMESTAMPTZ |

```sql
CREATE VIEW view_tasks_with_rice AS
SELECT *, CASE WHEN rice_effort > 0
  THEN (rice_reach * rice_impact * rice_confidence) / rice_effort END AS rice_score
FROM tasks;
```
</details>

<details>
<summary><code>raw_activity_logs</code></summary>

| Поле | Тип |
|------|-----|
| id | UUID PK |
| source | VARCHAR(50) — slack, telegram, github, jira |
| project_id | UUID FK NULL |
| user_id | UUID FK NULL |
| payload | JSONB NOT NULL |
| created_at | TIMESTAMPTZ |

GIN index на `payload`.
</details>

---

# ЧАСТЬ 3 — Extended TZ (31 сущность PROJI CORE)

| # | Таблица | Фаза | Соответствие |
|---|---------|------|--------------|
| 1 | organizations | MVP | `org_id` в Claud TZ (отдельная таблица — добавить) |
| 2 | organization_members | MVP | = `memberships` |
| 3 | business_directions | MVP | = `nodes` type=direction |
| 4 | teams | MVP | узлы + edges |
| 5 | projects | MVP | = `nodes` type=project + проекция |
| 6 | sprints | MVP | `sprints` проекция |
| 7 | tasks | MVP | `tasks` проекция |
| 8 | task_dependencies | V2 | `edges` edge_type=blocks |
| 9 | task_comments | MVP | новая таблица (фронт) |
| 10 | documents | MVP | `documents` |
| 11 | conversations | MVP | **для /messages (Zulip)** |
| 12 | messages | MVP | **командный чат** |
| 13 | meetings | Enterprise | — |
| 14 | decisions | Enterprise | Decision Intelligence |
| 15 | risks | Enterprise | — |
| 16 | insights | V2 | ≈ `assessments` |
| 17 | recommendations | V2 | `recommendations` |
| 18 | data_sources | V2 | коннекторы |
| 19 | source_items | V2 | ≈ `raw_events` |
| 20 | knowledge_chunks | V2 | Qdrant + PG метаданные |
| 21 | embeddings | V2 | Qdrant |
| 22 | frameworks | V2 | SWOT, scrum_health… |
| 23 | framework_analysis | V2 | ≈ `assessments` |
| 24 | entity_relations | Enterprise | = `edges` |
| 25 | metrics | V2 | Velocity, Lead Time… |
| 26 | metric_values | V2 | временные ряды |
| 27 | ai_agents | Enterprise | AI Agent Registry |
| 28 | agent_memory | Enterprise | Decision Memory |
| 29 | event_log | Enterprise | шина событий |
| 30 | notifications | MVP | `notifications` |
| 31 | audit_log | MVP | аудит |

### Дополнение под фронт (Extended п.11–12, нет в Claud DDL)

```sql
CREATE TABLE organizations (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE conversations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID NOT NULL REFERENCES organizations(id),
  stream          TEXT NOT NULL DEFAULT 'general',  -- general | tasks | clients
  type            TEXT NOT NULL,                  -- team_general | task | external
  task_node_id    UUID REFERENCES nodes(id),
  title           TEXT,
  last_message_at TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID NOT NULL,
  conversation_id UUID NOT NULL REFERENCES conversations(id),
  author_id       UUID REFERENCES users(id),
  body            TEXT NOT NULL,
  metadata        JSONB NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ix_messages_conv ON messages (conversation_id, created_at);
```

---

# Итоговый список таблиц PostgreSQL (рекомендуемый набор)

## MVP (запуск фронта + data layer)

1. `organizations`
2. `users`
3. `memberships`
4. `refresh_tokens`
5. `raw_events`
6. `outbox`
7. `facts`
8. `nodes`
9. `edges`
10. `tasks` (проекция канбан)
11. `sprints` (проекция)
12. `conversations`
13. `messages`
14. `chat_messages` (AI)
15. `documents`
16. `files`
17. `notifications`
18. `assessments`
19. `recommendations`

## V2

20. `data_sources` · 21. `task_comments` · 22. `metrics` · 23. `metric_values` · 24. `frameworks` · 25. `audit_log`

## Enterprise

26. `ai_agents` · 27. `agent_skills` · 28. `agent_runs` · 29. `agent_memory` · 30. `meetings` · 31. `decisions` · 32. `decision_outcomes` · 33. `risks` · 34. `event_log` · 35. `feature_flags`

---

# Маппинг фронт → PDF-таблицы

| Фронт | PDF-источник | Таблица |
|-------|--------------|---------|
| Канбан `/tasks` | Claud TZ §12 | `tasks` + `nodes` |
| Сообщения `/messages` | Extended §11–12 | `conversations` + `messages` |
| AI-панель | Claud §20.2 + Detailed §9 | `chat_messages` |
| Команда `/team` | Claud `nodes` person + `tasks.assignee_node_id` | `nodes`, `tasks` |
| Документы | Claud §20.3 | `documents`, `files` |
| Wazzup | Claud `raw_events` source=whatsapp | `raw_events` → `facts` → `nodes` |
| Onboarding org | Extended §1 | `organizations`, `memberships` |

---

# Индексы (из PDF DoD)

```sql
CREATE INDEX ix_raw_events_payload ON raw_events USING GIN (payload);  -- если нужен поиск в payload
CREATE INDEX ix_assessments_result ON assessments USING GIN (result);
-- B-Tree на все FK
-- GIN на JSONB: payload, analysis_data, rationale
```

**DoD:** batch 100 задач < 150ms · ingestion < 200ms · миграции только через Alembic/Prisma.
