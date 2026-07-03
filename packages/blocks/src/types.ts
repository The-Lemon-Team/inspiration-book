/** Telegram-style inline entity */
export type EntityType = 'url' | 'bold' | 'italic' | 'code';

export interface TextEntity {
  type: EntityType;
  offset: number;
  length: number;
  url?: string;
}

export interface TextBlock {
  type: 'text';
  text: string;
  entities?: TextEntity[];
}

export type ContentTypeId = 'design' | 'lofi' | 'music' | 'video';

export interface LinkBlock {
  type: 'link';
  url: string;
  label?: string;
  /** Тип контента, напр. «дизайн» — не хештег */
  contentTypeId?: ContentTypeId;
}

export interface ImageBlock {
  type: 'image';
  url: string;
  alt?: string;
}

export interface YoutubeBlock {
  type: 'youtube';
  url: string;
  videoId: string;
  title?: string;
}

export type MusicDisplay = 'card' | 'tray';

export interface MusicBlock {
  type: 'music';
  url: string;
  videoId: string;
  /** Название трека с YouTube */
  title?: string;
  /** Заголовок карточки от пользователя */
  heading?: string;
  /** Описание под карточкой */
  description?: string;
  /** Подпись типа контента на карточке, напр. «Музыка» — не хештег */
  tag?: string;
  /** Тип контента: music, lofi и т.д. */
  contentTypeId?: ContentTypeId;
  /** Хештеги (#vibe, #resume) */
  extraTags?: string[];
  display: MusicDisplay;
}

export interface GalleryImage {
  url: string;
  alt?: string;
}

export interface GalleryBlock {
  type: 'gallery';
  images: GalleryImage[];
}

export interface SectionBlock {
  type: 'section';
  tag: string;
  tagColor?: string;
  children: ContentBlock[];
}

export type ContentBlock =
  | TextBlock
  | LinkBlock
  | ImageBlock
  | YoutubeBlock
  | MusicBlock
  | GalleryBlock
  | SectionBlock;

/** Notion/Telegram-style message document stored as JSON */
export interface MessageDocument {
  version: 1;
  blocks: ContentBlock[];
}
