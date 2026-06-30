import type { GenUiBlock, GenUiTaggedSection } from './types';
import { isYoutubeUrl, parseYoutubeMarker } from './youtube';

const URL_RE = /^https?:\/\/\S+$/i;
const IMAGE_RE = /^!\[([^\]]*)\]\(([^)]+)\)$/;
const TAG_HEADER_RE = /^([^:]+):\s*$/;
const BULLET_RE = /^[-•*]\s+(.+)$/;

export function parseInlineContent(content: string): GenUiBlock[] {
  const trimmed = content.trim();
  if (!trimmed) return [];

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
        const blocks: GenUiBlock[] = [];
        if (before) blocks.push({ type: 'note', text: before });
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
    const blocks: GenUiBlock[] = [];
    if (before) blocks.push({ type: 'note', text: before });
    blocks.push({ type: 'link', url, label: url });
    if (after) blocks.push({ type: 'note', text: after });
    return blocks;
  }

  return [{ type: 'note', text: content }];
}

export function parseStructuredMessage(rawText: string): GenUiTaggedSection[] {
  const lines = rawText.split(/\r?\n/);
  let currentTag: string | null = null;
  const sections: GenUiTaggedSection[] = [];
  let currentBlocks: GenUiBlock[] = [];

  function flush() {
    if (currentTag && currentBlocks.length > 0) {
      sections.push({ tag: currentTag, blocks: [...currentBlocks] });
      currentBlocks = [];
    }
  }

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const tagMatch = trimmed.match(TAG_HEADER_RE);
    if (tagMatch) {
      flush();
      currentTag = tagMatch[1].trim();
      continue;
    }

    const bulletMatch = trimmed.match(BULLET_RE);
    const content = bulletMatch ? bulletMatch[1].trim() : trimmed;

    if (!currentTag) {
      currentTag = 'Заметка';
    }

    currentBlocks.push(...parseInlineContent(content));
  }

  flush();
  return sections;
}

export function extractStandaloneImages(rawText: string): GenUiBlock[] {
  const images: GenUiBlock[] = [];
  for (const line of rawText.split(/\r?\n/)) {
    const trimmed = line.trim();
    const match = trimmed.match(IMAGE_RE);
    if (match && !trimmed.match(BULLET_RE)) {
      images.push({ type: 'image', url: match[2], alt: match[1] || undefined });
    }
  }
  return images;
}
