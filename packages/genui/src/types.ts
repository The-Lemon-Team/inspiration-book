export type GenUiNoteBlock = {
  type: 'note';
  text: string;
};

export type GenUiLinkBlock = {
  type: 'link';
  url: string;
  label?: string;
};

export type GenUiImageBlock = {
  type: 'image';
  url: string;
  alt?: string;
};

export type GenUiYoutubeBlock = {
  type: 'youtube';
  url: string;
  videoId: string;
  title?: string;
};

export type GenUiBlock =
  | GenUiNoteBlock
  | GenUiLinkBlock
  | GenUiImageBlock
  | GenUiYoutubeBlock;

export type GenUiTaggedSection = {
  tag: string;
  blocks: GenUiBlock[];
};
