import { Node, mergeAttributes } from '@tiptap/core';
import { VueNodeViewRenderer } from '@tiptap/vue-3';
import EditorGalleryBlock from '../node-views/EditorGalleryBlock.vue';

export const GalleryBlockExtension = Node.create({
  name: 'galleryBlock',
  group: 'block',
  atom: true,
  draggable: true,
  selectable: true,
  addAttributes() {
    return {
      images: { default: [] },
    };
  },
  parseHTML() {
    return [{ tag: 'div[data-type="gallery-block"]' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'gallery-block' })];
  },
  addNodeView() {
    return VueNodeViewRenderer(EditorGalleryBlock);
  },
});
