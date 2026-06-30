import { DEFAULT_CHAT_TAGS } from '@/constants/chat-tags';
import type { Tag } from '@/types';

const FALLBACK_TAG_COLOR = '#64748b';

export function resolveTagColor(name: string, userTags: Tag[] = []): string {
  const key = name.trim().toLowerCase();
  const userTag = userTags.find((tag) => tag.name.toLowerCase() === key);
  if (userTag) return userTag.color;

  const defaultTag = DEFAULT_CHAT_TAGS.find((tag) => tag.name.toLowerCase() === key);
  if (defaultTag) return defaultTag.color;

  return FALLBACK_TAG_COLOR;
}

export function normalizeExtraTags(primaryTag: string, extraTags: string[]): string[] {
  const primaryKey = primaryTag.trim().toLowerCase();
  const seen = new Set<string>();
  const result: string[] = [];

  for (const tag of extraTags) {
    const trimmed = tag.trim();
    const key = trimmed.toLowerCase();
    if (!trimmed || key === primaryKey || seen.has(key)) continue;
    seen.add(key);
    result.push(trimmed);
  }

  return result;
}

/** Разбирает строку вида «#lofi, #todo #vibe» в массив имён тегов без # */
export function parseHashtagInput(input: string, primaryTag = ''): string[] {
  const primaryKey = primaryTag.trim().toLowerCase();
  const seen = new Set<string>();
  const result: string[] = [];

  for (const raw of input.split(/[,\s]+/)) {
    const trimmed = raw.replace(/^#+/, '').trim();
    const key = trimmed.toLowerCase();
    if (!trimmed || (primaryKey && key === primaryKey) || seen.has(key)) continue;
    seen.add(key);
    result.push(trimmed);
  }

  return result;
}

/** Форматирует теги для текстового поля: «#lofi, #todo» */
export function formatHashtagTags(tags: string[]): string {
  return tags.map((tag) => (tag.startsWith('#') ? tag : `#${tag}`)).join(', ');
}
