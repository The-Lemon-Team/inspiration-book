const YOUTUBE_HOSTS = /(?:youtube\.com|youtu\.be|music\.youtube\.com)/i;

export function isYoutubeUrl(url: string): boolean {
  try {
    return YOUTUBE_HOSTS.test(new URL(url).hostname);
  } catch {
    return false;
  }
}

export function extractYoutubeVideoId(input: string): string | null {
  const trimmed = input.trim();
  if (/^[\w-]{11}$/.test(trimmed)) return trimmed;

  try {
    const url = new URL(trimmed);
    if (url.hostname.includes('youtu.be')) {
      return url.pathname.slice(1).split('/')[0] || null;
    }
    if (url.searchParams.has('v')) {
      return url.searchParams.get('v');
    }
    const embedMatch = url.pathname.match(/\/embed\/([\w-]{11})/);
    if (embedMatch) return embedMatch[1];
    const shortsMatch = url.pathname.match(/\/shorts\/([\w-]{11})/);
    if (shortsMatch) return shortsMatch[1];
  } catch {
    return null;
  }
  return null;
}

export function youtubeWatchUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

export function youtubeThumbnailUrl(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

const YOUTUBE_BLOCK_RE = /^\[youtube\]([^|\]]+)(?:\|(.+))?\[\/youtube\]$/i;

export function parseYoutubeMarker(content: string): {
  url: string;
  videoId: string;
  title?: string;
} | null {
  const blockMatch = content.trim().match(YOUTUBE_BLOCK_RE);
  if (blockMatch) {
    const payload = blockMatch[1].trim();
    const title = blockMatch[2]?.trim() || undefined;
    const videoId = extractYoutubeVideoId(payload);
    if (!videoId) return null;
    return {
      url: isYoutubeUrl(payload) ? payload : youtubeWatchUrl(videoId),
      videoId,
      title,
    };
  }

  if (isYoutubeUrl(content.trim())) {
    const videoId = extractYoutubeVideoId(content.trim());
    if (!videoId) return null;
    return { url: content.trim(), videoId };
  }

  return null;
}

export function serializeYoutubeMarker(url: string, title?: string): string {
  const videoId = extractYoutubeVideoId(url);
  if (!videoId) {
    throw new Error('Некорректная ссылка YouTube');
  }
  const canonical = youtubeWatchUrl(videoId);
  return title?.trim()
    ? `[youtube]${canonical}|${title.trim()}[/youtube]`
    : `[youtube]${canonical}[/youtube]`;
}
