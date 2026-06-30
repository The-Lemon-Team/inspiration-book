import { Node, mergeAttributes } from '@tiptap/core';
import { VueNodeViewRenderer } from '@tiptap/vue-3';
import EditorSectionBlock from '../node-views/EditorSectionBlock.vue';

export const SectionBlockExtension = Node.create({
  name: 'sectionBlock',
  group: 'block',
  content:
    '(paragraph | bulletList | musicBlock | galleryBlock | imageBlock | linkBlock | youtubeBlock)+',
  defining: true,
  addAttributes() {
    return {
      tag: { default: 'Заметка' },
      tagColor: { default: null },
    };
  },
  parseHTML() {
    return [{ tag: 'div[data-type="section-block"]' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'section-block' })];
  },
  addNodeView() {
    return VueNodeViewRenderer(EditorSectionBlock);
  },
});
