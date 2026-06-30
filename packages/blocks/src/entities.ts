import type { TextEntity } from './types.js';

const URL_ENTITY_RE = /https?:\/\/[^\s]+/g;

export function buildUrlEntities(text: string): TextEntity[] {
  const entities: TextEntity[] = [];
  for (const match of text.matchAll(URL_ENTITY_RE)) {
    if (match.index === undefined) continue;
    entities.push({
      type: 'url',
      offset: match.index,
      length: match[0].length,
      url: match[0],
    });
  }
  return entities;
}

export interface TextSegment {
  text: string;
  entity?: TextEntity;
}

/** Split plain text into renderable segments using Telegram-style entities */
export function splitByEntities(
  text: string,
  entities?: TextEntity[],
): TextSegment[] {
  if (!entities?.length) {
    return [{ text }];
  }

  const sorted = [...entities].sort((a, b) => a.offset - b.offset);
  const segments: TextSegment[] = [];
  let cursor = 0;

  for (const entity of sorted) {
    if (entity.offset < cursor) continue;
    if (entity.offset > cursor) {
      segments.push({ text: text.slice(cursor, entity.offset) });
    }
    segments.push({
      text: text.slice(entity.offset, entity.offset + entity.length),
      entity,
    });
    cursor = entity.offset + entity.length;
  }

  if (cursor < text.length) {
    segments.push({ text: text.slice(cursor) });
  }

  return segments.length ? segments : [{ text }];
}
