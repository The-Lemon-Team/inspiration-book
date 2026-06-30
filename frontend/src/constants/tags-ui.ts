import type { Tag } from '@/types';

/** Узнал, Вспомнил, Сделать — основные на бэкенде, временно скрыты в UI */
export const HIDE_DEFAULT_TAGS_IN_UI = true;

export function uiVisibleTags(tags: Tag[]): Tag[] {
  if (!HIDE_DEFAULT_TAGS_IN_UI) return tags;
  return tags.filter((tag) => !tag.isDefault);
}
