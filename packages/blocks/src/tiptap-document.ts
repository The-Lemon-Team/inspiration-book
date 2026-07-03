import type {
  ContentBlock,
  GalleryBlock,
  ImageBlock,
  LinkBlock,
  MessageDocument,
  MusicBlock,
  SectionBlock,
  TextBlock,
} from './types.js';

/** Framework-agnostic Tiptap JSON shape */
export interface TiptapJSONContent {
  type: string;
  attrs?: Record<string, unknown>;
  content?: TiptapJSONContent[];
  text?: string;
  marks?: { type: string; attrs?: Record<string, unknown> }[];
}

function textBlock(text: string): TextBlock {
  return { type: 'text', text };
}

function paragraph(text: string): TiptapJSONContent {
  if (!text) {
    return { type: 'paragraph' };
  }
  return {
    type: 'paragraph',
    content: [{ type: 'text', text }],
  };
}

function listItemFromText(text: string): TiptapJSONContent {
  return {
    type: 'listItem',
    content: [paragraph(text)],
  };
}

function blockToTiptapNodes(block: ContentBlock): TiptapJSONContent[] {
  switch (block.type) {
    case 'text':
      return [paragraph(block.text)];
    case 'link':
      return [
        {
          type: 'linkBlock',
          attrs: {
            url: block.url,
            label: block.label ?? null,
            contentTypeId: block.contentTypeId ?? null,
          },
        },
      ];
    case 'image':
      return [
        {
          type: 'imageBlock',
          attrs: { url: block.url, alt: block.alt ?? null },
        },
      ];
    case 'youtube':
      return [
        {
          type: 'youtubeBlock',
          attrs: {
            url: block.url,
            videoId: block.videoId,
            title: block.title ?? null,
          },
        },
      ];
    case 'music':
      return [
        {
          type: 'musicBlock',
          attrs: {
            url: block.url,
            videoId: block.videoId,
            title: block.title ?? null,
            heading: block.heading ?? null,
            description: block.description ?? null,
            tag: block.tag ?? null,
            contentTypeId: block.contentTypeId ?? null,
            extraTags: block.extraTags?.length ? block.extraTags : null,
            display: block.display,
          },
        },
      ];
    case 'gallery':
      return [
        {
          type: 'galleryBlock',
          attrs: { images: block.images },
        },
      ];
    case 'section':
      return [{ type: 'sectionBlock', attrs: sectionAttrs(block), content: sectionChildrenToTiptap(block) }];
    default:
      return [];
  }
}

function sectionAttrs(block: SectionBlock): Record<string, unknown> {
  return {
    tag: block.tag,
    tagColor: block.tagColor ?? null,
  };
}

function sectionChildrenToTiptap(block: SectionBlock): TiptapJSONContent[] {
  const nodes: TiptapJSONContent[] = [];
  let pendingTexts: string[] = [];

  function flushBullets() {
    if (pendingTexts.length === 0) return;
    nodes.push({
      type: 'bulletList',
      content: pendingTexts.map((text) => listItemFromText(text)),
    });
    pendingTexts = [];
  }

  for (const child of block.children) {
    if (child.type === 'text') {
      pendingTexts.push(child.text);
      continue;
    }
    flushBullets();
    nodes.push(...blockToTiptapNodes(child));
  }

  flushBullets();
  return nodes;
}

export function messageDocumentToTiptap(document: MessageDocument): TiptapJSONContent {
  return {
    type: 'doc',
    content: document.blocks.flatMap((block) => blockToTiptapNodes(block)),
  };
}

function tiptapText(node: TiptapJSONContent | undefined): string {
  if (!node) return '';
  if (node.type === 'text') return node.text ?? '';
  return (node.content ?? []).map((child) => tiptapText(child)).join('');
}

function tiptapParagraphToBlock(node: TiptapJSONContent): TextBlock | null {
  const text = tiptapText(node);
  if (!text.trim()) return null;
  return textBlock(text);
}

function tiptapNodesToBlocks(nodes: TiptapJSONContent[]): ContentBlock[] {
  const blocks: ContentBlock[] = [];

  for (const node of nodes) {
    switch (node.type) {
      case 'paragraph': {
        const block = tiptapParagraphToBlock(node);
        if (block) blocks.push(block);
        break;
      }
      case 'bulletList': {
        for (const item of node.content ?? []) {
          if (item.type !== 'listItem') continue;
          const paragraphNode = item.content?.find((child) => child.type === 'paragraph');
          const block = paragraphNode ? tiptapParagraphToBlock(paragraphNode) : null;
          if (block) blocks.push(block);
        }
        break;
      }
      case 'linkBlock':
        blocks.push({
          type: 'link',
          url: String(node.attrs?.url ?? ''),
          label: node.attrs?.label ? String(node.attrs.label) : undefined,
          contentTypeId: node.attrs?.contentTypeId
            ? (String(node.attrs.contentTypeId) as LinkBlock['contentTypeId'])
            : undefined,
        });
        break;
      case 'imageBlock':
        blocks.push({
          type: 'image',
          url: String(node.attrs?.url ?? ''),
          alt: node.attrs?.alt ? String(node.attrs.alt) : undefined,
        } satisfies ImageBlock);
        break;
      case 'youtubeBlock':
        blocks.push({
          type: 'youtube',
          url: String(node.attrs?.url ?? ''),
          videoId: String(node.attrs?.videoId ?? ''),
          title: node.attrs?.title ? String(node.attrs.title) : undefined,
        });
        break;
      case 'musicBlock':
        blocks.push({
          type: 'music',
          url: String(node.attrs?.url ?? ''),
          videoId: String(node.attrs?.videoId ?? ''),
          title: node.attrs?.title ? String(node.attrs.title) : undefined,
          heading: node.attrs?.heading ? String(node.attrs.heading) : undefined,
          description: node.attrs?.description ? String(node.attrs.description) : undefined,
          tag: node.attrs?.tag ? String(node.attrs.tag) : undefined,
          contentTypeId: node.attrs?.contentTypeId
            ? (String(node.attrs.contentTypeId) as MusicBlock['contentTypeId'])
            : undefined,
          extraTags: Array.isArray(node.attrs?.extraTags)
            ? (node.attrs.extraTags as string[]).map(String).filter(Boolean)
            : undefined,
          display: node.attrs?.display === 'tray' ? 'tray' : 'card',
        } satisfies MusicBlock);
        break;
      case 'galleryBlock': {
        const images = Array.isArray(node.attrs?.images)
          ? (node.attrs.images as GalleryBlock['images'])
          : [];
        if (images.length > 0) {
          blocks.push({ type: 'gallery', images });
        }
        break;
      }
      case 'sectionBlock': {
        const children = tiptapNodesToBlocks(node.content ?? []);
        if (children.length > 0) {
          blocks.push({
            type: 'section',
            tag: String(node.attrs?.tag ?? 'Заметка'),
            tagColor: node.attrs?.tagColor ? String(node.attrs.tagColor) : undefined,
            children,
          } satisfies SectionBlock);
        }
        break;
      }
      default:
        break;
    }
  }

  return blocks;
}

export function tiptapToMessageDocument(json: TiptapJSONContent): MessageDocument {
  const blocks = tiptapNodesToBlocks(json.content ?? []);
  return { version: 1, blocks };
}

export function createSectionDocument(
  tag: string,
  children: ContentBlock[],
  tagColor?: string,
): MessageDocument {
  return {
    version: 1,
    blocks: [{ type: 'section', tag, tagColor, children }],
  };
}

export function appendToDocument(
  document: MessageDocument,
  blocks: ContentBlock[],
): MessageDocument {
  return {
    version: 1,
    blocks: [...document.blocks, ...blocks],
  };
}
