# Inspiration Book

Личный дневник-чат для записей «Узнал», «Вспомнил» и «Сделать» с регистрацией и публичным бордом.

## Стек

- **Frontend:** Vue 3, Vue Router, Pinia, Vite
- **Backend:** NestJS, JWT, Prisma
- **База:** PostgreSQL

## Быстрый старт

### 1. PostgreSQL

PostgreSQL слушает порт **5433** (если 5432 уже занят локальным Postgres).

```bash
docker compose up -d
```

### 2. Backend

```bash
cd backend
npm install
npx prisma migrate dev
npm run start:dev
```

API: `http://localhost:3000`

В `.env` задайте `JWT_SECRET` для production.

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

UI: `http://localhost:5173`

## Возможности

- **Регистрация и вход** — личный дневник привязан к аккаунту
- **Чат** (`/chat`) — приватные записи
- **Публичный борд** (`/`) — записи, отмеченные как публичные
- **Лента, календарь, топ** — личная аналитика (требует входа)

При создании сообщения можно включить «Опубликовать на общем борде». В ленте можно переключать видимость каждой записи.

## Формат сообщения

```
Узнал:
 - Как варить суп
 - Как писать vibe code

Вспомнил:
 - Сходить к стоматологу

Сделать:
 - Поесть
 - Начать рабочий день
```

## API

| Метод | Путь | Auth | Описание |
|-------|------|------|----------|
| POST | `/auth/register` | — | Регистрация |
| POST | `/auth/login` | — | Вход |
| GET | `/auth/me` | JWT | Текущий пользователь |
| GET | `/entries/public` | — | Публичный борд |
| POST | `/entries/messages` | JWT | Отправить сообщение |
| GET | `/entries/messages` | JWT | История сообщений |
| GET | `/entries/timeline` | JWT | Лента по дням |
| GET | `/entries/calendar?month=&year=` | JWT | Календарь |
| GET | `/entries/top?limit=10` | JWT | Топ личных записей |
| PATCH | `/entries/:id/public` | JWT | Переключить публичность |
| POST | `/entries/:id/vote` | опц. | Голос «полезно» |

## Структура

```
inspiration-book/
├── backend/          # NestJS API
├── frontend/         # Vue UI
└── docker-compose.yml
```
