import { Document } from '@tiptap/extension-document';

export const ChatDocument = Document.extend({
  content:
    '(paragraph | bulletList | sectionBlock | musicBlock | galleryBlock | imageBlock | linkBlock | youtubeBlock)+',
});
