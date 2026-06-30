# @inspiration-book/genui

Переиспользуемое ядро GenUI — типы и парсер структурированного контента для чатов.

Vue-компоненты рендеринга: `frontend/src/genui/` (можно вынести в отдельный пакет позже).

## Блоки

- `note` — текст
- `link` — URL (автоопределение)
- `image` — `![](url)`

## API

```ts
import { parseStructuredMessage, parseInlineContent } from '@inspiration-book/genui';
```
