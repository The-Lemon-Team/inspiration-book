import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { ChatDocument } from './chatDocument';
import { GalleryBlockExtension } from './galleryBlock';
import { ImageBlockExtension } from './imageBlock';
import { LinkBlockExtension } from './linkBlock';
import { MusicBlockExtension } from './musicBlock';
import { SectionBlockExtension } from './sectionBlock';
import { YoutubeBlockExtension } from './youtubeBlock';

export function createChatEditorExtensions(placeholder = 'Введите сообщение или выберите тег…') {
  return [
    ChatDocument,
    StarterKit.configure({
      document: false,
      heading: false,
      codeBlock: false,
      blockquote: false,
      horizontalRule: false,
      orderedList: false,
    }),
    Placeholder.configure({ placeholder }),
    SectionBlockExtension,
    MusicBlockExtension,
    GalleryBlockExtension,
    ImageBlockExtension,
    LinkBlockExtension,
    YoutubeBlockExtension,
  ];
}
