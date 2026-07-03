import type { ContentBlock, ContentTypeId, MessageDocument } from './types.js';

export type { ContentTypeId };

const CONTENT_TYPE_ORDER: ContentTypeId[] = ['design', 'lofi', 'music', 'video'];

function walkBlocks(
  blocks: ContentBlock[],
  found: Set<ContentTypeId>,
) {
  for (const block of blocks) {
    if (block.type === 'youtube') {
      found.add('video');
    }
    if (block.type === 'music') {
      found.add('music');
      if (block.contentTypeId === 'lofi') {
        found.add('lofi');
      }
    }
    if (block.type === 'link' && block.contentTypeId === 'design') {
      found.add('design');
    }
    if (block.type === 'section') {
      walkBlocks(block.children, found);
    }
  }
}

export function detectContentTypeIds(
  document: MessageDocument,
  rawText = '',
): ContentTypeId[] {
  const found = new Set<ContentTypeId>();
  walkBlocks(document.blocks, found);

  if (/(youtube\.com|youtu\.be)/i.test(rawText)) {
    found.add('video');
  }

  return CONTENT_TYPE_ORDER.filter((id) => found.has(id));
}
