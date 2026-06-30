export interface TagChip {
  name: string;
  color: string;
}

/** Основные теги — на бэкенде при регистрации, в UI временно скрыты */
export const DEFAULT_CHAT_TAGS: TagChip[] = [
  { name: 'Узнал', color: '#2563eb' },
  { name: 'Вспомнил', color: '#7c3aed' },
  { name: 'Сделать', color: '#059669' },
];

/** Подсказки для селектора чата (селектор временно отключён) */
export const SUGGESTED_CHAT_TAGS: TagChip[] = [];
