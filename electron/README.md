# Inspiration Book Desktop

Electron-клиент с Telegram-подобным сайдбаром и акцентом на чат.

## Быстрый запуск (всё сразу)

Из корня репозитория:

```bash
npm install
npm run desktop
```

Поднимает backend, frontend и Electron. Окно откроется на `/chat`.

## Запуск по частям

1. Backend и frontend:

```bash
cd backend && npm run start:dev
cd frontend && npm run dev
```

2. Electron:

```bash
cd electron
npm install
npm run dev
```

## Preview shell без Electron

Проверить desktop UI в браузере:

```bash
cd frontend
npm run dev:desktop
```

Или из корня: `npm run desktop:shell` (frontend + electron, без backend).

## Переменные

| Переменная | Описание |
|------------|----------|
| `FRONTEND_URL` | URL dev-сервера (по умолчанию `http://localhost:5173`) |
| `VITE_SHELL=desktop` | Включить Telegram-shell в браузере |
| `VITE_API_BASE` | URL backend без `/api` (для production-сборки, напр. `http://localhost:3000`) |

## Production-сборка

Backend должен быть запущен отдельно (`http://localhost:3000` по умолчанию).

```bash
cd electron
npm install
npm run dist
```

Установщик появится в `electron/release/`.

Перед сборкой создайте `build/icon.png` (512×512) из `build/icon.svg`, если иконка не сгенерирована:

```bash
# при наличии ImageMagick:
magick build/icon.svg -resize 512x512 build/icon.png
```

## Структура shell

- **Сайдбар 240px** — навигация, папки контента (теги), профиль, выход
- **Главная область** — чат на весь экран; остальные экраны — прокручиваемая колонка
