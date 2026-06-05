import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EntryCategory, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { QueryEntriesDto } from './dto/query-entries.dto';
import { EntryParserService } from './entry-parser.service';

const publicUserSelect = {
  id: true,
  name: true,
  email: true,
} as const;

@Injectable()
export class EntriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly parser: EntryParserService,
  ) {}

  async createMessage(userId: string, dto: CreateMessageDto) {
    const parsed = this.parser.parse(dto.rawText);
    if (parsed.length === 0) {
      throw new BadRequestException(
        'Не удалось распознать записи. Используйте формат: "Узнал:" и строки с "- пункт".',
      );
    }

    const isPublic = dto.isPublic ?? false;

    return this.prisma.$transaction(async (tx) => {
      const message = await tx.message.create({
        data: { rawText: dto.rawText, userId },
      });

      await tx.entry.createMany({
        data: parsed.map((entry) => ({
          content: entry.content,
          category: entry.category,
          messageId: message.id,
          userId,
          isPublic,
        })),
      });

      return tx.message.findUniqueOrThrow({
        where: { id: message.id },
        include: { entries: { orderBy: { createdAt: 'asc' } } },
      });
    });
  }

  async findEntries(userId: string, query: QueryEntriesDto) {
    const where: Prisma.EntryWhereInput = { userId };

    if (query.category) {
      where.category = query.category;
    }

    if (query.from || query.to) {
      where.createdAt = {};
      if (query.from) {
        where.createdAt.gte = new Date(query.from);
      }
      if (query.to) {
        where.createdAt.lte = new Date(query.to);
      }
    }

    return this.prisma.entry.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { message: true },
    });
  }

  async getTimeline(userId: string, query: QueryEntriesDto) {
    const entries = await this.findEntries(userId, query);
    const grouped = new Map<string, typeof entries>();

    for (const entry of entries) {
      const dayKey = entry.createdAt.toISOString().slice(0, 10);
      const bucket = grouped.get(dayKey) ?? [];
      bucket.push(entry);
      grouped.set(dayKey, bucket);
    }

    return Array.from(grouped.entries())
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([date, dayEntries]) => ({
        date,
        entries: dayEntries,
      }));
  }

  async getCalendar(userId: string, month: number, year: number) {
    const from = new Date(Date.UTC(year, month - 1, 1));
    const to = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

    const entries = await this.prisma.entry.findMany({
      where: {
        userId,
        createdAt: { gte: from, lte: to },
      },
      orderBy: { createdAt: 'asc' },
    });

    const days = new Map<string, typeof entries>();
    for (const entry of entries) {
      const dayKey = entry.createdAt.toISOString().slice(0, 10);
      const bucket = days.get(dayKey) ?? [];
      bucket.push(entry);
      days.set(dayKey, bucket);
    }

    return {
      month,
      year,
      days: Array.from(days.entries()).map(([date, dayEntries]) => ({
        date,
        count: dayEntries.length,
        entries: dayEntries,
      })),
    };
  }

  async vote(id: string, userId?: string) {
    const entry = await this.prisma.entry.findUnique({ where: { id } });
    if (!entry) {
      throw new NotFoundException('Запись не найдена');
    }

    if (!entry.isPublic && entry.userId !== userId) {
      throw new ForbiddenException('Нельзя голосовать за приватную запись');
    }

    return this.prisma.entry.update({
      where: { id },
      data: { usefulVotes: { increment: 1 } },
      include: { user: { select: publicUserSelect } },
    });
  }

  async getTop(userId: string, limit = 10) {
    return this.prisma.entry.findMany({
      where: { userId },
      orderBy: [{ usefulVotes: 'desc' }, { createdAt: 'desc' }],
      take: limit,
    });
  }

  async getPublicBoard(limit = 50) {
    return this.prisma.entry.findMany({
      where: { isPublic: true },
      orderBy: [{ usefulVotes: 'desc' }, { createdAt: 'desc' }],
      take: limit,
      include: { user: { select: publicUserSelect } },
    });
  }

  async getMessages(userId: string) {
    return this.prisma.message.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        entries: { orderBy: { createdAt: 'asc' } },
      },
    });
  }

  async setPublic(userId: string, id: string, isPublic: boolean) {
    const entry = await this.prisma.entry.findFirst({
      where: { id, userId },
    });
    if (!entry) {
      throw new NotFoundException('Запись не найдена');
    }

    return this.prisma.entry.update({
      where: { id },
      data: { isPublic },
    });
  }

  getCategories() {
    return [
      { key: EntryCategory.LEARNED, label: 'Узнал' },
      { key: EntryCategory.REMEMBERED, label: 'Вспомнил' },
      { key: EntryCategory.TODO, label: 'Сделать' },
    ];
  }
}
