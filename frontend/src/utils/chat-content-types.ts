import type { Message } from '@/types';

export type ContentTypeId = 'design' | 'lofi' | 'music' | 'video';

export type ContentTypeDefinition = {
  id: ContentTypeId;
  label: string;
  icon: string;
  aliases: string[];
};

export const CONTENT_TYPES: ContentTypeDefinition[] = [
  {
    id: 'design',
    label: 'Дизайн',
    icon: 'palette',
    aliases: ['design', 'дизайн', 'ui', 'ux'],
  },
  {
    id: 'lofi',
    label: 'Lo-fi',
    icon: 'headphones',
    aliases: ['lofi', 'lo-fi', 'лофи'],
  },
  {
    id: 'music',
    label: 'Музыка',
    icon: 'music_note',
    aliases: ['music', 'музыка', 'трек', 'song'],
  },
  {
    id: 'video',
    label: 'Видео',
    icon: 'play_circle',
    aliases: ['video', 'видео', 'youtube', 'ютуб'],
  },
];

const TYPE_BY_ID = new Map(CONTENT_TYPES.map((item) => [item.id, item]));

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function detectFromTagName(tagName: string, types: Set<ContentTypeId>) {
  const name = normalize(tagName);
  for (const type of CONTENT_TYPES) {
    if (type.aliases.some((alias) => name.includes(alias))) {
      types.add(type.id);
    }
  }
}

function detectFromRawText(rawText: string, types: Set<ContentTypeId>) {
  const value = rawText.toLowerCase();
  if (/(youtube\.com|youtu\.be)/i.test(value)) {
    types.add('video');
  }
}

function detectFromDocumentBlocks(blocks: unknown, types: Set<ContentTypeId>) {
  if (!Array.isArray(blocks)) return;

  for (const block of blocks) {
    if (!block || typeof block !== 'object') continue;
    const record = block as {
      type?: unknown;
      tag?: unknown;
      children?: unknown;
    };
    const blockType = String(record.type ?? '').toLowerCase();
    if (blockType === 'youtube') {
      types.add('video');
    }
    if (blockType === 'music') {
      types.add('music');
      const tag = String(record.tag ?? '').toLowerCase();
      if (tag.includes('lofi') || tag.includes('lo-fi') || tag.includes('лофи')) {
        types.add('lofi');
      }
      if (tag.includes('design') || tag.includes('дизайн')) {
        types.add('design');
      }
    }
    if (blockType === 'section') {
      detectFromDocumentBlocks(record.children, types);
    }
  }
}

export function detectMessageContentTypeIds(message: Message): ContentTypeId[] {
  const types = new Set<ContentTypeId>();
  for (const entry of message.entries) {
    detectFromTagName(entry.tag.name, types);
    detectFromTagName(entry.tag.slug, types);
  }

  detectFromDocumentBlocks(message.content?.blocks, types);

  detectFromRawText(message.rawText, types);
  return CONTENT_TYPES.map((type) => type.id).filter((id) => types.has(id));
}

export function detectMessageContentTypes(message: Message): ContentTypeDefinition[] {
  return detectMessageContentTypeIds(message)
    .map((id) => TYPE_BY_ID.get(id))
    .filter((item): item is ContentTypeDefinition => Boolean(item));
}

export function computeContentTypeCounts(messages: Message[]) {
  const counts: Record<ContentTypeId, number> = {
    design: 0,
    lofi: 0,
    music: 0,
    video: 0,
  };

  for (const message of messages) {
    for (const typeId of detectMessageContentTypeIds(message)) {
      counts[typeId] += 1;
    }
  }

  return counts;
}
