import { buildUrlEntities } from './entities.js';
import { parseGalleryMarker } from './gallery.js';
import { parseMusicMarker } from './music.js';
import type { ContentBlock, MessageDocument, TextBlock } from './types.js';
import { isYoutubeUrl, parseYoutubeMarker } from './youtube.js';

const URL_RE = /^https?:\/\/\S+$/i;
const IMAGE_RE = /^!\[([^\]]*)\]\(([^)]+)\)$/;
const BULLET_RE = /^[-•*]\s+(.+)$/;

function textBlock(text: string): TextBlock {
  const entities = buildUrlEntities(text);
  return {
    type: 'text',
    text,
    entities: entities.length > 0 ? entities : undefined,
  };
}

export function parseInlineBlocks(content: string): ContentBlock[] {
  const trimmed = content.trim();
  if (!trimmed) return [];

  const music = parseMusicMarker(trimmed);
  if (music) {
    return [
      {
        type: 'music',
        url: music.url,
        videoId: music.videoId,
        title: music.title,
        display: music.display,
      },
    ];
  }

  const gallery = parseGalleryMarker(trimmed);
  if (gallery) {
    return [{ type: 'gallery', images: gallery }];
  }

  const youtube = parseYoutubeMarker(trimmed);
  if (youtube) {
    return [
      {
        type: 'youtube',
        url: youtube.url,
        videoId: youtube.videoId,
        title: youtube.title,
      },
    ];
  }

  const imageMatch = trimmed.match(IMAGE_RE);
  if (imageMatch) {
    return [{ type: 'image', url: imageMatch[2], alt: imageMatch[1] || undefined }];
  }

  if (URL_RE.test(trimmed) && !isYoutubeUrl(trimmed)) {
    return [{ type: 'link', url: trimmed, label: trimmed }];
  }

  const urlInText = trimmed.match(/(https?:\/\/\S+)/i);
  if (urlInText && urlInText.index !== undefined) {
    const before = trimmed.slice(0, urlInText.index).trim();
    const url = urlInText[1];
    if (isYoutubeUrl(url)) {
      const parsed = parseYoutubeMarker(url);
      if (parsed) {
        const blocks: ContentBlock[] = [];
        if (before) blocks.push(textBlock(before));
        blocks.push({
          type: 'youtube',
          url: parsed.url,
          videoId: parsed.videoId,
          title: parsed.title,
        });
        return blocks;
      }
    }
    const after = trimmed.slice(urlInText.index + url.length).trim();
    const blocks: ContentBlock[] = [];
    if (before) blocks.push(textBlock(before));
    blocks.push({ type: 'link', url, label: url });
    if (after) blocks.push(textBlock(after));
    return blocks;
  }

  return [textBlock(content)];
}

/** Плоский разбор raw-текста: строки → текст или inline-блоки (music, youtube, …). */
export function parseRawTextToDocument(rawText: string): MessageDocument {
  const blocks: ContentBlock[] = [];

  for (const line of rawText.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (/^tags:\s*.+/i.test(trimmed)) continue;

    const bulletMatch = trimmed.match(BULLET_RE);
    const content = bulletMatch ? bulletMatch[1].trim() : trimmed;
    blocks.push(...parseInlineBlocks(content));
  }

  return { version: 1, blocks };
}

export function documentFromStored(
  content: MessageDocument | null | undefined,
  rawText: string,
): MessageDocument {
  if (content?.version === 1 && Array.isArray(content.blocks)) {
    return content;
  }
  return parseRawTextToDocument(rawText);
}
