import { Node, mergeAttributes } from '@tiptap/core';

export const YoutubeBlockExtension = Node.create({
  name: 'youtubeBlock',
  group: 'block',
  atom: true,
  draggable: true,
  addAttributes() {
    return {
      url: { default: '' },
      videoId: { default: '' },
      title: { default: null },
    };
  },
  parseHTML() {
    return [{ tag: 'div[data-type="youtube-block"]' }];
  },
  renderHTML({ node, HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-type': 'youtube-block',
        class: 'editor-atom-block editor-youtube-block',
      }),
      node.attrs.title || 'YouTube',
    ];
  },
});
