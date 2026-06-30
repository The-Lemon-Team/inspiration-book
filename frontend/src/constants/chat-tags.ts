export interface TagChip {
  name: string;
  color: string;
}

export const DEFAULT_CHAT_TAGS: TagChip[] = [
  { name: 'Узнал', color: '#2563eb' },
  { name: 'Вспомнил', color: '#7c3aed' },
  { name: 'Сделать', color: '#059669' },
];

export const SUGGESTED_CHAT_TAGS: TagChip[] = [
  { name: 'lo-fi', color: '#2563eb' },
  { name: 'музыка', color: '#7c3aed' },
  { name: 'дизайн', color: '#2563eb' },
  { name: 'кодинг', color: '#059669' },
  { name: 'книги', color: '#7c3aed' },
  { name: 'рецепты', color: '#6b7280' },
];
