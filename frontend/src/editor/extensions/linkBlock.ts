import { Node, mergeAttributes } from '@tiptap/core';

export const LinkBlockExtension = Node.create({
  name: 'linkBlock',
  group: 'block',
  atom: true,
  draggable: true,
  addAttributes() {
    return {
      url: { default: '' },
      label: { default: null },
    };
  },
  parseHTML() {
    return [{ tag: 'div[data-type="link-block"]' }];
  },
  renderHTML({ node, HTMLAttributes }) {
    const label = node.attrs.label || node.attrs.url;
    return [
      'a',
      mergeAttributes(HTMLAttributes, {
        'data-type': 'link-block',
        href: node.attrs.url,
        target: '_blank',
        rel: 'noopener noreferrer',
        class: 'block-link editor-atom-block',
      }),
      String(label),
    ];
  },
});
