import { Node, mergeAttributes } from '@tiptap/core';
import { VueNodeViewRenderer } from '@tiptap/vue-3';
import EditorMusicBlock from '../node-views/EditorMusicBlock.vue';

export const MusicBlockExtension = Node.create({
  name: 'musicBlock',
  group: 'block',
  atom: true,
  draggable: true,
  selectable: true,
  addAttributes() {
    return {
      url: { default: '' },
      videoId: { default: '' },
      title: { default: null },
      heading: { default: null },
      description: { default: null },
      tag: { default: 'Музыка' },
      extraTags: { default: [] },
      display: { default: 'card' },
    };
  },
  parseHTML() {
    return [{ tag: 'div[data-type="music-block"]' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'music-block' })];
  },
  addNodeView() {
    return VueNodeViewRenderer(EditorMusicBlock);
  },
});
