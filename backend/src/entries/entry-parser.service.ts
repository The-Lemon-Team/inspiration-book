import { Injectable } from '@nestjs/common';
import { EntryCategory } from '@prisma/client';

export interface ParsedEntry {
  content: string;
  category: EntryCategory;
}

const CATEGORY_MAP: Record<string, EntryCategory> = {
  узнал: EntryCategory.LEARNED,
  learned: EntryCategory.LEARNED,
  вспомнил: EntryCategory.REMEMBERED,
  remembered: EntryCategory.REMEMBERED,
  сделать: EntryCategory.TODO,
  todo: EntryCategory.TODO,
};

@Injectable()
export class EntryParserService {
  parse(rawText: string): ParsedEntry[] {
    const lines = rawText.split(/\r?\n/);
    let currentCategory: EntryCategory | null = null;
    const entries: ParsedEntry[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) {
        continue;
      }

      const categoryMatch = trimmed.match(/^([^:]+):\s*$/);
      if (categoryMatch) {
        const key = categoryMatch[1].trim().toLowerCase();
        currentCategory = CATEGORY_MAP[key] ?? null;
        continue;
      }

      const bulletMatch = trimmed.match(/^[-•*]\s+(.+)$/);
      if (bulletMatch && currentCategory) {
        entries.push({
          content: bulletMatch[1].trim(),
          category: currentCategory,
        });
        continue;
      }

      if (currentCategory) {
        entries.push({
          content: trimmed,
          category: currentCategory,
        });
      }
    }

    return entries;
  }
}
