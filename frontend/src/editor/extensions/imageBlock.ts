import { Node, mergeAttributes } from '@tiptap/core';
import { VueNodeViewRenderer } from '@tiptap/vue-3';
import EditorImageBlock from '../node-views/EditorImageBlock.vue';

export const ImageBlockExtension = Node.create({
  name: 'imageBlock',
  group: 'block',
  atom: true,
  draggable: true,
  selectable: true,
  addAttributes() {
    return {
      url: { default: '' },
      alt: { default: null },
    };
  },
  parseHTML() {
    return [{ tag: 'div[data-type="image-block"]' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'image-block' })];
  },
  addNodeView() {
    return VueNodeViewRenderer(EditorImageBlock);
  },
});
