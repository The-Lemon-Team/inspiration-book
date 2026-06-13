# Промпты для v0.app и Google Stitch — Inspiration Book

Документ для генерации UI первой версии приложения **Inspiration Book** — личного дневника-чата с публичным бордом.

---

## О проекте (контекст для обоих инструментов)

**Inspiration Book** — веб-приложение, похожее на личный чат / дневник. Пользователь пишет сообщения в особом структурированном формате, а система разбивает их на отдельные записи по категориям.

### Категории записей

| Категория | Метка в UI | Цвет (референс) |
|-----------|------------|-----------------|
| Узнал | LEARNED | синий `#2563eb` |
| Вспомнил | REMEMBERED | фиолетовый `#7c3aed` |
| Сделать | TODO | зелёный `#059669` |

### Формат сообщения в чате

Пользователь вводит текст как в мессенджере, но с заголовками категорий и пунктами списка:

```
Узнал:
 - Как варить суп
 - Как писать vibe code

Вспомнил:
 - Сходить к стоматологу
 - Посадить смородину

Сделать:
 - Поесть
 - Сходить в душ
 - Начать рабочий день
```

Каждый пункт `- ...` становится отдельной записью с категорией и датой.

### Экраны v1

1. **Публичный борд** (главная `/`) — список всех публичных записей сообщества
2. **Чат** (`/chat`) — личный дневник, история сообщений + поле ввода
3. **Список публикаций / Лента** (`/timeline`) — все личные записи, сгруппированные по дням
4. **Вход / Регистрация**
5. *(опционально v1)* Календарь, Топ — можно не рисовать в первой итерации

### Фильтры v1 (обязательно на экранах со списками)

- **Категория:** все / Узнал / Вспомнил / Сделать
- **Период:** сегодня / неделя / месяц / всё время *(или date range picker)*
- **Видимость** *(только в личной ленте):* все / публичные / приватные
- **Сортировка** *(публичный борд):* по дате (новые) / по полезности (голоса)

### Общие элементы карточки записи

- Бейдж категории (цветной)
- Текст записи
- Дата и время
- Кнопка «👍 Полезно · N» (голосование)
- Для публичного борда: имя автора
- Для личной ленты: переключатель 🔒 Приватно / 🌐 Публично

### Стиль

- Минималистичный, спокойный, «дневниковый»
- Светлая тема, много воздуха, скруглённые углы
- Ощущение личного чата, не корпоративной CRM
- Mobile-first, но хорошо смотрится на desktop
- Язык интерфейса: **русский**

---

## Промпт для v0.app

> Скопируй целиком в v0. Проси генерировать React + Tailwind + shadcn/ui компоненты.

```
Design a mobile-first web app called "Inspiration Book" — a personal diary chat with a public community board. UI language: Russian.

Brand: minimal, calm, diary-like. Light theme, soft grays, rounded corners, generous whitespace. Accent colors: blue #2563eb (Learned), purple #7c3aed (Remembered), green #059669 (Todo).

App shell:
- Top header with logo "📔 Inspiration Book"
- Nav links: Борд, Чат, Лента, Вход/Регистрация (or user name + Выйти when logged in)
- Max width ~960px centered layout

Screen 1 — Public Board (homepage, no auth required):
- Page title: "Публичный борд"
- Subtitle: "Полезные записи от сообщества Inspiration Book"
- CTA buttons for guests: "Войти", "Регистрация"; for logged-in: "Мой дневник"
- Filter bar (horizontal, wraps on mobile):
  - Category select: Все категории | Узнал | Вспомнил | Сделать
  - Sort select: По полезности | По дате
  - Period select: Всё время | Сегодня | Неделя | Месяц
- Scrollable list of entry cards. Each card shows:
  - Colored category badge
  - Author name (e.g. "Алексей")
  - Entry text
  - Timestamp
  - "👍 Полезно · 12" vote button
- Empty state: "Пока публичных записей нет"
- Left colored border on card matching category

Screen 2 — Personal Chat (/chat, auth required):
- Chat feed (scrollable, message bubbles):
  - Each bubble shows raw message text in structured format:
    """
    Узнал:
     - Как варить суп
     - Как писать vibe code

    Вспомнил:
     - Сходить к стоматологу
    """
  - Below bubble: parsed items as small chips with category labels
  - Timestamp on each bubble
- Bottom composer (sticky):
  - Large textarea with placeholder showing the structured format example
  - Checkbox: "Опубликовать записи на общем борде"
  - Primary button: "Записать"
- Feels like Telegram/WhatsApp diary, not a form wizard

Screen 3 — Personal Timeline / All Publications (/timeline, auth required):
- Page title: "Лента по дням"
- Filter bar:
  - Category: Все | Узнал | Вспомнил | Сделать
  - Period: Всё время | Сегодня | Неделя | Месяц
  - Visibility: Все | Публичные | Приватные
- Entries grouped by day headers: "понедельник, 29 июня"
- Entry cards with category badge, text, timestamp, vote button, and toggle "🔒 Приватно" / "🌐 Публично"
- Empty state: "Записей пока нет"

Screen 4 — Login & Register (simple centered forms):
- Login: email, password, "Войти", link to register
- Register: name (optional), email, password, "Создать аккаунт", link to login

Use shadcn/ui: Button, Input, Textarea, Select, Badge, Card, Checkbox, Separator.
Show all 4 screens as separate sections or a tab switcher for preview.
Do NOT use dark mode. Keep typography clean (Inter or system-ui).
```

### Дополнительные промпты для v0 (по экранам)

**Только публичный борд с фильтрами:**

```
Public board page for "Inspiration Book" diary app. Russian UI. Filter bar with category, sort by votes/date, period filter. List of public entry cards with author, category badge (blue/purple/green), vote button. Light minimal design, shadcn/ui, mobile-first.
```

**Только чат в особом формате:**

```
Personal diary chat screen. User writes structured messages with sections "Узнал:", "Вспомнил:", "Сделать:" and bullet points. Chat bubble history + bottom textarea composer with placeholder example and "Publish to public board" checkbox. Russian labels. Calm diary aesthetic, shadcn/ui.
```

**Только лента публикаций:**

```
Timeline page showing all user diary entries grouped by day. Filters: category, date period, public/private visibility. Entry cards with category badges and public/private toggle. Russian UI, light theme, shadcn/ui.
```

---

## Промпт для Google Stitch

> Stitch лучше работает с описанием экранов и user flow. Можно генерировать по одному экрану или весь flow.

### Master prompt (весь проект)

```
Project: Inspiration Book
Type: Web app, mobile-first
Language: Russian
Style: Minimal personal diary / chat app. Light background #f3f4f6, white cards, soft borders, rounded corners 12-16px. Calm and intimate, not corporate.

Color system:
- Learned (Узнал): blue #2563eb
- Remembered (Вспомнил): purple #7c3aed  
- Todo (Сделать): green #059669
- Text: #1f2937, muted #6b7280

User flow:
1. Guest lands on Public Board — sees community entries, can filter and vote
2. Guest taps Login/Register
3. Authenticated user opens Chat — writes structured diary messages
4. User opens Timeline — sees all personal entries with filters

Generate a cohesive design system and 4 key screens.
```

### Экран 1 — Публичный борд (главная)

```
Screen: Public Board (Homepage)
App: Inspiration Book — personal diary with community sharing

Layout:
- Header: app name with notebook emoji, navigation (Борд, Вход, Регистрация)
- Hero area: title "Публичный борд", subtitle about community useful notes
- Horizontal filter panel (stack on mobile):
  • Dropdown "Категория": Все категории / Узнал / Вспомнил / Сделать
  • Dropdown "Сортировка": По полезности / По дате  
  • Dropdown "Период": Всё время / Сегодня / Неделя / Месяц
- Vertical feed of entry cards

Entry card design:
- White card, left border 4px in category color
- Top row: colored pill badge (category) + timestamp right-aligned
- Author name in gray below badge
- Entry text body
- Bottom: pill button "👍 Полезно · 5"

Empty state illustration area with text "Пока публичных записей нет"

Style: light, airy, readable. Russian text throughout. iPhone 14 Pro frame.
```

### Экран 2 — Чат (особый формат)

```
Screen: Personal Diary Chat
App: Inspiration Book

This is NOT a regular chat. Users write one message containing multiple structured sections.

Message format example shown in textarea placeholder:
---
Узнал:
 - Как варить суп
 - Как писать vibe code

Вспомнил:
 - Сходить к стоматологу

Сделать:
 - Поесть
 - Начать рабочий день
---

Layout:
- Header with nav: Борд | Чат (active) | Лента | user menu
- Scrollable chat history (55% height):
  • Message bubbles, light gray background
  • Show full raw text with line breaks preserved (pre-formatted)
  • Below each bubble: compact list of parsed items with small category tags
  • Timestamp under bubble header
- Fixed bottom composer:
  • Multi-line textarea (min 8 rows)
  • Checkbox row: "Опубликовать записи на общем борде"
  • Black primary button "Записать"

Feeling: writing in a personal Telegram channel to yourself. Warm, private, simple.
Russian UI. Light theme.
```

### Экран 3 — Список всех публикаций (Лента)

```
Screen: Personal Timeline — All Publications
App: Inspiration Book

Purpose: browse ALL of the user's diary entries (parsed items, not raw messages), grouped by date.

Layout:
- Page title: "Лента по дням"
- Filter bar (3 controls in a row, wrap on mobile):
  1. Category filter: Все категории | Узнал | Вспомнил | Сделать
  2. Period filter: Всё время | Сегодня | Неделя | Месяц
  3. Visibility filter: Все | Публичные | Приватные
- Timeline sections separated by date headers (e.g. "понедельник, 29 июня")
- Entry cards stacked under each date

Entry card:
- Category badge (colored pill)
- Entry text
- Timestamp
- Action row: "👍 Полезно · N" button + visibility toggle showing "🔒 Приватно" or "🌐 Публично" as toggle pill

Show 2 day groups with 2-3 cards each as sample content.
Russian labels. Clean diary aesthetic. Mobile-first.
```

### Экран 4 — Вход и регистрация

```
Screen: Authentication
App: Inspiration Book

Two states (or two screens):

Login:
- Centered card, max-width 400px
- Title: "Вход"
- Fields: Email, Пароль
- Button: "Войти"
- Link: "Нет аккаунта? Зарегистрироваться"

Register:
- Title: "Регистрация"  
- Fields: Имя (необязательно), Email, Пароль (мин. 6 символов)
- Button: "Создать аккаунт"
- Link: "Уже есть аккаунт? Войти"

Minimal, same visual language as the rest of the app. Light card on gray background.
```

### Stitch — Design system prompt

```
Design system for "Inspiration Book" web app:

Typography: system-ui / SF Pro / Inter. H1 22px, H2 18px, body 15px, captions 13px gray.

Components needed:
- Category badge (3 color variants)
- Entry card with left accent border
- Chat message bubble
- Structured textarea composer
- Filter dropdown row
- Vote button (outline pill)
- Public/private toggle pill
- Day section header for timeline
- Primary button (dark #111827)
- Ghost/secondary button (white with border)

Spacing: 8px grid. Card padding 16px. Section gaps 24px.
Border radius: cards 12px, buttons 8-10px, badges full pill.

Generate component sheet + color tokens.
```

---

## Чеклист для дизайнера / генератора

При проверке макета v1 убедиться, что есть:

- [ ] Чат с textarea и примером структурированного формата в placeholder
- [ ] История сообщений показывает сырой текст + разобранные пункты
- [ ] Публичный борд на главной со списком карточек
- [ ] Фильтр по категории на борде и в ленте
- [ ] Фильтр по периоду на борде и в ленте
- [ ] Сортировка по полезности на борде
- [ ] Фильтр публичные/приватные в личной ленте
- [ ] Голосование «Полезно» на карточках
- [ ] Переключатель публичности в личной ленте
- [ ] Чекбокс «Опубликовать на борде» в чате
- [ ] Экраны входа и регистрации
- [ ] Русский язык во всех подписях
- [ ] Mobile-first layout

---

## Примеры контента для моков

Используй в промптах или как sample data:

**Сообщение в чате:**
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

**Карточки на публичном борде:**

| Автор | Категория | Текст | Голоса |
|-------|-----------|-------|--------|
| Мария | Узнал | Как писать vibe code | 24 |
| Иван | Сделать | Начать рабочий день до 9:00 | 18 |
| Алекс | Вспомнил | Раз в полгода чистить клавиатуру | 11 |
