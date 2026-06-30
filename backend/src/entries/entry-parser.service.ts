import { Injectable } from '@nestjs/common';
import { TagsService } from '../tags/tags.service';

export interface ParsedEntry {
  content: string;
  tagName: string;
}

@Injectable()
export class EntryParserService {
  constructor(private readonly tagsService: TagsService) {}

  async parseForUser(userId: string, rawText: string) {
    const lines = rawText.split(/\r?\n/);
    let currentTagName: string | null = null;
    const entries: ParsedEntry[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) {
        continue;
      }

      const tagHeaderMatch = trimmed.match(/^([^:]+):\s*$/);
      if (tagHeaderMatch) {
        currentTagName = tagHeaderMatch[1].trim();
        continue;
      }

      const bulletMatch = trimmed.match(/^[-•*]\s+(.+)$/);
      if (bulletMatch && currentTagName) {
        entries.push({
          content: bulletMatch[1].trim(),
          tagName: currentTagName,
        });
        continue;
      }

      const imageMatch = trimmed.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
      if (imageMatch) {
        const tagName: string = currentTagName ?? 'Заметка';
        entries.push({ content: trimmed, tagName });
        currentTagName = tagName;
        continue;
      }

      if (currentTagName) {
        entries.push({
          content: trimmed,
          tagName: currentTagName,
        });
      }
    }

    const resolved = [];
    for (const entry of entries) {
      const tag = await this.tagsService.findOrCreateByHeader(
        userId,
        entry.tagName,
      );
      if (!tag) {
        continue;
      }
      resolved.push({ content: entry.content, tagId: tag.id });
    }

    return resolved;
  }
}
