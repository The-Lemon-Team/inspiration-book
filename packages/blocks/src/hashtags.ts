import type { ContentBlock, MessageDocument } from './types.js';

export function normalizeHashtagName(raw: string): string | null {
  const trimmed = raw.trim().replace(/^#+/, '');
  if (!trimmed) return null;
  const match = trimmed.match(/^([\w\u0400-\u04FF][\w\u0400-\u04FF_-]*)$/);
  return match ? match[1] : null;
}

export function extractHashtagsFromText(text: string): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  const re = /#([\w\u0400-\u04FF][\w\u0400-\u04FF_-]*)/g;

  for (const match of text.matchAll(re)) {
    const name = match[1];
    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(name);
  }

  return result;
}

/** Разбирает строку вида «#lofi, #todo #vibe» */
export function parseHashtagList(input: string): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const raw of input.split(/[,\s]+/)) {
    const name = normalizeHashtagName(raw);
    if (!name) continue;
    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(name);
  }

  return result;
}

function walkBlocks(
  blocks: ContentBlock[],
  add: (name: string) => void,
) {
  for (const block of blocks) {
    if (block.type === 'text') {
      for (const name of extractHashtagsFromText(block.text)) {
        add(name);
      }
    }
    if (block.type === 'music' && block.extraTags?.length) {
      for (const tag of block.extraTags) {
        const name = normalizeHashtagName(tag);
        if (name) add(name);
      }
    }
    if (block.type === 'section') {
      walkBlocks(block.children, add);
    }
  }
}

export function collectHashtagsFromDocument(document: MessageDocument): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  function add(name: string) {
    const key = name.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    result.push(name);
  }

  walkBlocks(document.blocks, add);
  return result;
}

export function isMessageDocument(value: unknown): value is MessageDocument {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as MessageDocument;
  return candidate.version === 1 && Array.isArray(candidate.blocks);
}
