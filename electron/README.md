# Inspiration Book Desktop

Electron-клиент с Telegram-подобным сайдбаром и акцентом на чат.

## Запуск

1. Запустите backend и frontend:

```bash
cd backend && npm run start:dev
cd frontend && npm run dev
```

2. В другом терминале:

```bash
cd electron
npm install
npm run dev
```

Приложение откроет `http://localhost:5173/chat` в окне Electron с десктопным shell.

## Переменные

- `FRONTEND_URL` — URL фронтенда (по умолчанию `http://localhost:5173`)
