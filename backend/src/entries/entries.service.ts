import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { QueryEntriesDto } from './dto/query-entries.dto';
import { EntryParserService } from './entry-parser.service';

const publicUserSelect = {
  id: true,
  name: true,
  email: true,
} as const;

const entryInclude = {
  tag: true,
  message: true,
  user: { select: publicUserSelect },
} as const;

@Injectable()
export class EntriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly parser: EntryParserService,
  ) {}

  async createMessage(userId: string, dto: CreateMessageDto) {
    const parsed = await this.parser.parseForUser(userId, dto.rawText);
    if (parsed.length === 0) {
      throw new BadRequestException(
        'Не удалось распознать записи. Используйте формат: "Узнал:" или "lo-fi:" и строки с "- пункт".',
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
          tagId: entry.tagId,
          messageId: message.id,
          userId,
          isPublic,
        })),
      });

      return tx.message.findUniqueOrThrow({
        where: { id: message.id },
        include: {
          entries: {
            orderBy: { createdAt: 'asc' },
            include: { tag: true },
          },
        },
      });
    });
  }

  async findEntries(userId: string, query: QueryEntriesDto) {
    const where: Prisma.EntryWhereInput = { userId };

    if (query.tagId) {
      where.tagId = query.tagId;
    }

    if (query.visibility === 'public') {
      where.isPublic = true;
    } else if (query.visibility === 'private') {
      where.isPublic = false;
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
      include: entryInclude,
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
      include: { tag: true },
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
      include: entryInclude,
    });
  }

  async getTop(userId: string, limit = 10) {
    return this.prisma.entry.findMany({
      where: { userId },
      orderBy: [{ usefulVotes: 'desc' }, { createdAt: 'desc' }],
      take: limit,
      include: { tag: true },
    });
  }

  async getPublicBoard(limit = 50, tagId?: string) {
    return this.prisma.entry.findMany({
      where: {
        isPublic: true,
        ...(tagId ? { tagId } : {}),
      },
      orderBy: [{ usefulVotes: 'desc' }, { createdAt: 'desc' }],
      take: limit,
      include: entryInclude,
    });
  }

  async getMessages(userId: string) {
    return this.prisma.message.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        entries: {
          orderBy: { createdAt: 'asc' },
          include: { tag: true },
        },
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
      include: { tag: true },
    });
  }
}
