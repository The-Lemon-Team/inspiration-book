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

export type GenUiBlock = GenUiNoteBlock | GenUiLinkBlock | GenUiImageBlock;

export type GenUiTaggedSection = {
  tag: string;
  blocks: GenUiBlock[];
};
