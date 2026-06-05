# Задачи для бэкенд-разработчика — Proji

> Текущее состояние: весь фронтенд работает на `localStorage`. Задача бэкенда — заменить каждую операцию на REST API.  
> Стек: любой (рекомендуется Node.js/NestJS или Go). БД: PostgreSQL. Аутентификация: JWT + Refresh Token.

---

## 1. Аутентификация и пользователи

### Эндпоинты
| Метод | Путь | Описание |
|-------|------|----------|
| POST | `/api/auth/register` | Регистрация пользователя |
| POST | `/api/auth/login` | Вход, возврат JWT + refresh token |
| POST | `/api/auth/refresh` | Обновление access token |
| POST | `/api/auth/logout` | Инвалидация refresh token |
| GET  | `/api/me` | Профиль текущего пользователя |
| PATCH| `/api/me` | Обновление профиля |

### Модель User
```sql
users (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  email      TEXT UNIQUE NOT NULL,
  password   TEXT NOT NULL,  -- bcrypt
  role       TEXT DEFAULT 'employee',   -- 'admin' | 'employee'
  domain     TEXT DEFAULT 'Общий',      -- BusinessDomain
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
)
```

---

## 2. Проекты

### Эндпоинты
| Метод  | Путь | Описание |
|--------|------|----------|
| GET    | `/api/projects` | Список проектов пользователя |
| POST   | `/api/projects` | Создать проект |
| GET    | `/api/projects/:id` | Получить проект |
| PATCH  | `/api/projects/:id` | Обновить проект |
| DELETE | `/api/projects/:id` | Удалить проект |

### Модель Project
```sql
projects (
  id                  UUID PRIMARY KEY,
  name                TEXT NOT NULL,
  description         TEXT,
  status              TEXT DEFAULT 'Planning',
  framework           TEXT,
  deadline            TEXT,
  start_date          TEXT,
  progress            INT DEFAULT 0,
  budget              TEXT,
  spent               TEXT,
  risk_level          TEXT,
  priority            TEXT,
  owner_id            UUID REFERENCES users(id),
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
)
```

---

## 3. Задачи проектов

### Эндпоинты
| Метод  | Путь | Описание |
|--------|------|----------|
| GET    | `/api/projects/:pid/tasks` | Все задачи проекта |
| POST   | `/api/projects/:pid/tasks` | Создать задачу |
| PATCH  | `/api/projects/:pid/tasks/:id` | Обновить (статус, поля) |
| DELETE | `/api/projects/:pid/tasks/:id` | Удалить задачу |

### Статусы задач (lifecycle)
```
new → accepted → completed
new → accepted → review → accepted (итерация)
new → declined
accepted → declined
```

### Модель Task
```sql
project_tasks (
  id             UUID PRIMARY KEY,
  project_id     UUID REFERENCES projects(id) ON DELETE CASCADE,
  title          TEXT NOT NULL,
  description    TEXT,
  status         TEXT DEFAULT 'new',
  priority       TEXT DEFAULT 'medium',
  deadline       TEXT,
  urgent         BOOLEAN DEFAULT FALSE,
  assigned_by    UUID REFERENCES users(id),
  decline_reason TEXT,
  report_text    TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
)

task_attachments (
  id       UUID PRIMARY KEY,
  task_id  UUID REFERENCES project_tasks(id) ON DELETE CASCADE,
  name     TEXT,
  type     TEXT
)

task_checklist (
  id      UUID PRIMARY KEY,
  task_id UUID REFERENCES project_tasks(id) ON DELETE CASCADE,
  text    TEXT,
  done    BOOLEAN DEFAULT FALSE,
  ord     INT
)
```

---

## 4. Отчёты

### Эндпоинты
| Метод | Путь | Описание |
|-------|------|----------|
| GET   | `/api/projects/:pid/reports` | Отчёты по проекту |
| POST  | `/api/reports` | Отправить отчёт (с projectId в body) |
| GET   | `/api/reports` | Все отчёты (для admin / management) |

### Модель Report
```sql
reports (
  id          UUID PRIMARY KEY,
  project_id  UUID REFERENCES projects(id),
  author_id   UUID REFERENCES users(id),
  date_label  TEXT,          -- "понедельник, 15 мая"
  description TEXT,
  task_titles TEXT[],        -- перечень выполненных задач
  duration    TEXT,          -- "02:34:00"
  sent_at     TIMESTAMPTZ DEFAULT NOW()
)
```

---

## 5. Документы проекта

### Эндпоинты
| Метод  | Путь | Описание |
|--------|------|----------|
| GET    | `/api/projects/:pid/docs` | Список документов |
| POST   | `/api/projects/:pid/docs` | Создать документ |
| PATCH  | `/api/projects/:pid/docs/:id` | Редактировать |
| DELETE | `/api/projects/:pid/docs/:id` | Удалить |

### Модель Doc
```sql
project_docs (
  id         UUID PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  title      TEXT NOT NULL,
  content    TEXT,
  author_id  UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
)
```

---

## 6. Рассылка задач от администратора

### Эндпоинты
| Метод  | Путь | Описание |
|--------|------|----------|
| GET    | `/api/admin/tasks` | Все broadcast-задачи |
| GET    | `/api/admin/tasks?domain=Маркетинг` | По домену |
| POST   | `/api/admin/tasks` | Создать broadcast-задачу |
| PATCH  | `/api/admin/tasks/:id` | Обновить (status → archived) |
| DELETE | `/api/admin/tasks/:id` | Удалить |

### Модель AdminTask
```sql
admin_tasks (
  id            UUID PRIMARY KEY,
  title         TEXT NOT NULL,
  description   TEXT,
  priority      TEXT DEFAULT 'medium',
  deadline      DATE,
  target_domain TEXT DEFAULT 'all',  -- 'all' | BusinessDomain
  assigned_by   UUID REFERENCES users(id),
  status        TEXT DEFAULT 'active',
  created_at    TIMESTAMPTZ DEFAULT NOW()
)
```

---

## 7. Юридический модуль

### Эндпоинты
| Метод  | Путь | Описание |
|--------|------|----------|
| GET    | `/api/legal/contracts` | Список договоров |
| POST   | `/api/legal/contracts` | Создать договор |
| PATCH  | `/api/legal/contracts/:id` | Обновить статус/данные |
| DELETE | `/api/legal/contracts/:id` | Удалить |
| GET    | `/api/legal/cases` | Судебные дела |
| POST   | `/api/legal/cases` | Создать дело |
| PATCH  | `/api/legal/cases/:id` | Обновить дело |

### Модели
```sql
contracts (
  id            UUID PRIMARY KEY,
  name          TEXT,
  counterparty  TEXT,
  type          TEXT,
  status        TEXT DEFAULT 'pending',
  sign_date     DATE,
  expire_date   DATE,
  value         TEXT,
  risk          TEXT DEFAULT 'low',
  created_at    TIMESTAMPTZ DEFAULT NOW()
)

legal_cases (
  id      UUID PRIMARY KEY,
  title   TEXT,
  type    TEXT,
  status  TEXT DEFAULT 'open',
  date    DATE,
  court   TEXT,
  result  TEXT
)
```

---

## 8. Управленческий журнал

### Эндпоинты
| Метод  | Путь | Описание |
|--------|------|----------|
| GET    | `/api/journal` | Записи журнала пользователя |
| POST   | `/api/journal` | Создать запись |
| PATCH  | `/api/journal/:id` | Обновить / закрепить |
| DELETE | `/api/journal/:id` | Удалить |

---

## 9. Таймер рабочего дня

> Таймер можно сохранять на бэкенде для синхронизации между вкладками.

### Эндпоинт
| Метод | Путь | Описание |
|-------|------|----------|
| GET   | `/api/timer/:projectId` | Получить состояние таймера |
| PUT   | `/api/timer/:projectId` | Сохранить состояние |

---

## 10. Нефункциональные требования

- **Авторизация**: все эндпоинты (кроме `/auth/*`) защищены JWT Bearer токеном
- **Роли**: `admin` — доступ ко всему; `employee` — только свои данные + admin tasks по своему домену
- **CORS**: разрешить `http://localhost:3000` в dev, production origin в prod
- **Валидация**: входящие данные валидировать (Zod/class-validator)
- **Pagination**: эндпоинты списков поддерживают `?page=1&limit=20`
- **Soft delete**: добавить `deleted_at` вместо физического удаления (projects, tasks, docs)
- **Аудит**: таблица `audit_log (entity, entity_id, action, user_id, meta, created_at)` для критических действий

---

## 11. Порядок выполнения (приоритет)

1. ✅ Auth (register/login/me) — без этого ничего не работает
2. ✅ Projects CRUD
3. ✅ Project Tasks (весь lifecycle статусов)
4. ✅ Reports (submit + list)
5. ✅ Admin broadcast tasks
6. Docs
7. Legal contracts/cases
8. Journal
9. Timer sync
10. Pagination, soft delete, audit log
