import type { MusicDisplay } from './types.js';
import {
  extractYoutubeVideoId,
  isYoutubeUrl,
  youtubeWatchUrl,
} from './youtube.js';

const MUSIC_BLOCK_RE =
  /^\[music:(card|tray)\]([^|\]]+)(?:\|(.+))?\[\/music\]$/i;

export interface ParsedMusicMarker {
  url: string;
  videoId: string;
  title?: string;
  display: MusicDisplay;
}

export function parseMusicMarker(content: string): ParsedMusicMarker | null {
  const blockMatch = content.trim().match(MUSIC_BLOCK_RE);
  if (!blockMatch) return null;

  const display = blockMatch[1].toLowerCase() as MusicDisplay;
  const payload = blockMatch[2].trim();
  const title = blockMatch[3]?.trim() || undefined;
  const videoId = extractYoutubeVideoId(payload);
  if (!videoId) return null;

  return {
    url: isYoutubeUrl(payload) ? payload : youtubeWatchUrl(videoId),
    videoId,
    title,
    display,
  };
}

export function serializeMusicMarker(
  url: string,
  display: MusicDisplay,
  title?: string,
): string {
  const videoId = extractYoutubeVideoId(url);
  if (!videoId) {
    throw new Error('Некорректная ссылка YouTube');
  }
  const canonical = youtubeWatchUrl(videoId);
  return title?.trim()
    ? `[music:${display}]${canonical}|${title.trim()}[/music]`
    : `[music:${display}]${canonical}[/music]`;
}
