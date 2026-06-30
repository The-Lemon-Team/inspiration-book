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
  it('serializes sections with bullets', () => {
    const doc = parseRawTextToDocument(`Узнал:
 - Как варить суп
 - Ссылка https://example.com`);
    const raw = documentToRawText(doc);
    assert.match(raw, /Узнал:/);
    assert.match(raw, /Как варить суп/);
  });

  it('serializes music markers', () => {
    const doc: MessageDocument = {
      version: 1,
      blocks: [
        {
          type: 'section',
          tag: 'музыка',
          children: [
            {
              type: 'music',
              url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
              videoId: 'dQw4w9WgXcQ',
              title: 'Jazz-hop',
              display: 'tray',
            },
          ],
        },
      ],
    };
    const raw = documentToRawText(doc);
    assert.match(raw, /\[music:tray\]/);
    assert.match(raw, /Jazz-hop/);
  });

  it('round-trips through tiptap json', () => {
    const source = parseRawTextToDocument(`lo-fi:
 - Фон для работы
 - [music:card]https://www.youtube.com/watch?v=dQw4w9WgXcQ|Lo-fi[/music]`);
    const tiptap = messageDocumentToTiptap(source);
    const restored = tiptapToMessageDocument(tiptap);
    assert.equal(restored.blocks.length, 1);
    assert.equal(restored.blocks[0]?.type, 'section');
  });
});
