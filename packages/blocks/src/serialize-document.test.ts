import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { parseRawTextToDocument } from './parse-document.js';
import { documentToRawText } from './serialize-document.js';
import {
  messageDocumentToTiptap,
  tiptapToMessageDocument,
} from './tiptap-document.js';
import type { MessageDocument } from './types.js';

describe('documentToRawText round-trip', () => {
  it('parses plain text as text blocks', () => {
    const doc = parseRawTextToDocument(`Привет, мир
Ещё строка`);
    assert.equal(doc.blocks.length, 2);
    assert.equal(doc.blocks[0]?.type, 'text');
    assert.match(doc.blocks[0]?.type === 'text' ? doc.blocks[0].text : '', /Привет/);
  });

  it('serializes music markers without section header', () => {
    const doc: MessageDocument = {
      version: 1,
      blocks: [
        {
          type: 'music',
          url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          videoId: 'dQw4w9WgXcQ',
          title: 'Jazz-hop',
          display: 'tray',
          contentTypeId: 'music',
          extraTags: ['vibe', 'lofi'],
        },
      ],
    };
    const raw = documentToRawText(doc);
    assert.match(raw, /\[music:tray\]/);
    assert.match(raw, /Jazz-hop/);
    assert.match(raw, /tags: #vibe/);
    assert.doesNotMatch(raw, /^музыка:/m);
  });

  it('round-trips music through tiptap json', () => {
    const source: MessageDocument = {
      version: 1,
      blocks: [
        {
          type: 'music',
          url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          videoId: 'dQw4w9WgXcQ',
          title: 'Lo-fi',
          display: 'card',
          contentTypeId: 'lofi',
        },
      ],
    };
    const tiptap = messageDocumentToTiptap(source);
    const restored = tiptapToMessageDocument(tiptap);
    assert.equal(restored.blocks[0]?.type, 'music');
  });
});
