import { serializeGalleryMarker } from './gallery.js';
import { serializeMusicMarker } from './music.js';
import type { ContentBlock, MessageDocument, MusicBlock } from './types.js';
import { serializeYoutubeMarker } from './youtube.js';

function musicBlockToRawLines(block: MusicBlock): string[] {
  const tag = block.tag || 'музыка';
  const lines = [`${tag}:`];
  if (block.heading?.trim()) {
    lines.push(` - ${block.heading.trim()}`);
  }
  lines.push(` - ${serializeMusicMarker(block.url, block.display, block.title)}`);
  if (block.description?.trim()) {
    lines.push(` - ${block.description.trim()}`);
  }
  if (block.extraTags?.length) {
    lines.push(` - tags: ${block.extraTags.join(', ')}`);
  }
  return lines;
}

export function inlineBlockToRaw(block: ContentBlock): string {
  switch (block.type) {
    case 'text':
      return block.text;
    case 'link':
      return block.label?.trim() || block.url;
    case 'image':
      return `![${block.alt ?? ''}](${block.url})`;
    case 'youtube':
      return serializeYoutubeMarker(block.url, block.title);
    case 'music':
      return serializeMusicMarker(block.url, block.display, block.title);
    case 'gallery':
      return serializeGalleryMarker(block.images);
    case 'section':
      return blockToRawLines(block).join('\n');
    default:
      return '';
  }
}

export function blockToRawLines(block: ContentBlock): string[] {
  switch (block.type) {
    case 'music':
      return musicBlockToRawLines(block);
    case 'section': {
      const lines = [`${block.tag}:`];
      for (const child of block.children) {
        const raw = inlineBlockToRaw(child);
        if (raw.includes('\n')) {
          for (const line of raw.split('\n')) {
            lines.push(` - ${line}`);
          }
        } else {
          lines.push(` - ${raw}`);
        }
      }
      return lines;
    }
    default:
      return [inlineBlockToRaw(block)];
  }
}

export function documentToRawText(document: MessageDocument): string {
  const lines: string[] = [];

  for (const block of document.blocks) {
    if (block.type === 'section') {
      lines.push(...blockToRawLines(block));
      continue;
    }
    lines.push(...blockToRawLines(block));
  }

  return lines.join('\n').trim();
}

export function emptyDocument(): MessageDocument {
  return { version: 1, blocks: [] };
}

export function isDocumentEmpty(document: MessageDocument): boolean {
  if (document.blocks.length === 0) return true;
  return document.blocks.every((block) => {
    if (block.type === 'text') return !block.text.trim();
    if (block.type === 'section') {
      return block.children.length === 0;
    }
    return false;
  });
}
