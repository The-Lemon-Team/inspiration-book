import type { GalleryImage } from './types.js';

const GALLERY_BLOCK_RE = /^\[gallery\](.+)\[\/gallery\]$/i;

export function parseGalleryMarker(content: string): GalleryImage[] | null {
  const match = content.trim().match(GALLERY_BLOCK_RE);
  if (!match) return null;

  const images: GalleryImage[] = match[1]
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const altSplit = part.split('|');
      const url = altSplit[0]?.trim();
      if (!url) return null;
      const alt = altSplit[1]?.trim();
      return { url, ...(alt ? { alt } : {}) };
    })
    .filter((item): item is GalleryImage => item !== null);

  return images.length > 0 ? images : null;
}

export function serializeGalleryMarker(images: GalleryImage[]): string {
  if (images.length === 0) {
    throw new Error('Галерея должна содержать хотя бы одно изображение');
  }
  const payload = images
    .map((image) => (image.alt ? `${image.url}|${image.alt}` : image.url))
    .join(',');
  return `[gallery]${payload}[/gallery]`;
}
