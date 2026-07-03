import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CUSTOM_TAG_COLORS,
  DEFAULT_TAGS,
  slugifyTag,
} from './default-tags';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';

@Injectable()
export class TagsService {
  constructor(private readonly prisma: PrismaService) {}

  async seedDefaultTags(userId: string) {
    await this.prisma.tag.createMany({
      data: DEFAULT_TAGS.map((tag) => ({
        ...tag,
        isDefault: true,
        userId,
      })),
      skipDuplicates: true,
    });
  }

  async getStats(userId: string, topLimit = 12, recentLimit = 20) {
    const [tags, entryGroups, recentEntries, recentMessages, totalMessages] =
      await Promise.all([
        this.prisma.tag.findMany({ where: { userId } }),
        this.prisma.entry.groupBy({
          by: ['tagId'],
          where: { userId },
          _count: { id: true },
          _max: { createdAt: true },
        }),
        this.prisma.entry.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          take: recentLimit,
          include: {
            tag: true,
            message: {
              select: {
                id: true,
                chatId: true,
                chat: { select: { id: true, name: true, slug: true, kind: true } },
              },
            },
          },
        }),
        this.prisma.message.findMany({
          where: { userId, entries: { some: {} } },
          orderBy: { createdAt: 'desc' },
          take: recentLimit,
          include: {
            chat: { select: { id: true, name: true, slug: true, kind: true } },
            entries: {
              orderBy: { createdAt: 'asc' },
              include: { tag: true },
            },
          },
        }),
        this.prisma.message.count({
          where: { userId, entries: { some: {} } },
        }),
      ]);

    const tagMap = new Map(tags.map((tag) => [tag.id, tag]));
    const mentionedTagIds = entryGroups.map((group) => group.tagId);

    const messageCountRows = mentionedTagIds.length
      ? await this.prisma.entry.findMany({
          where: {
            userId,
            tagId: { in: mentionedTagIds },
            messageId: { not: null },
          },
          select: { tagId: true, messageId: true },
          distinct: ['tagId', 'messageId'],
        })
      : [];

    const messageCountByTag = new Map<string, number>();
    for (const row of messageCountRows) {
      messageCountByTag.set(
        row.tagId,
        (messageCountByTag.get(row.tagId) ?? 0) + 1,
      );
    }

    const topTags = entryGroups
      .map((group) => {
        const tag = tagMap.get(group.tagId);
        if (!tag) return null;
        return {
          tag,
          entryCount: group._count.id,
          messageCount: messageCountByTag.get(group.tagId) ?? 0,
          lastMentionedAt: group._max.createdAt?.toISOString() ?? null,
        };
      })
      .filter((item): item is NonNullable<typeof item> => Boolean(item))
      .sort((a, b) => b.entryCount - a.entryCount)
      .slice(0, topLimit);

    const totalMentions = entryGroups.reduce(
      (sum, group) => sum + group._count.id,
      0,
    );

    return {
      summary: {
        mentionedTags: entryGroups.length,
        totalMentions,
        totalMessages,
      },
      topTags,
      recentMentions: recentEntries.map((entry) => ({
        id: entry.id,
        content: entry.content,
        createdAt: entry.createdAt.toISOString(),
        tag: entry.tag,
        messageId: entry.messageId,
        chat: entry.message?.chat ?? null,
      })),
      recentMessages: recentMessages.map((message) => ({
        id: message.id,
        rawText: message.rawText,
        createdAt: message.createdAt.toISOString(),
        chat: message.chat,
        entries: message.entries.map((entry) => ({
          id: entry.id,
          content: entry.content,
          createdAt: entry.createdAt.toISOString(),
          tag: entry.tag,
        })),
        tags: Array.from(
          new Map(message.entries.map((entry) => [entry.tag.id, entry.tag])).values(),
        ),
      })),
    };
  }

  async list(userId: string) {
    const tags = await this.prisma.tag.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
      include: {
        _count: { select: { entries: true } },
      },
    });

    return tags.map(({ _count, ...tag }) => ({
      ...tag,
      entryCount: _count.entries,
    }));
  }

  async create(userId: string, dto: CreateTagDto) {
    const slug = slugifyTag(dto.name);
    if (!slug) {
      throw new BadRequestException('Некорректное название тега');
    }

    const existing = await this.prisma.tag.findUnique({
      where: { userId_slug: { userId, slug } },
    });
    if (existing) {
      throw new BadRequestException('Такой тег уже существует');
    }

    const color =
      dto.color ?? (await this.pickColorForUser(userId));

    return this.prisma.tag.create({
      data: {
        userId,
        name: dto.name.trim(),
        slug,
        color,
      },
    });
  }

  async update(userId: string, id: string, dto: UpdateTagDto) {
    const tag = await this.findOwnedTag(userId, id);
    const slug = dto.name ? slugifyTag(dto.name) : undefined;

    if (slug === '') {
      throw new BadRequestException('Некорректное название тега');
    }

    if (slug && slug !== tag.slug) {
      const conflict = await this.prisma.tag.findUnique({
        where: { userId_slug: { userId, slug } },
      });
      if (conflict) {
        throw new BadRequestException('Тег с таким названием уже есть');
      }
    }

    return this.prisma.tag.update({
      where: { id },
      data: {
        name: dto.name?.trim(),
        slug,
        color: dto.color,
      },
    });
  }

  async remove(userId: string, id: string) {
    const tag = await this.findOwnedTag(userId, id);
    const entryCount = await this.prisma.entry.count({ where: { tagId: id } });

    if (entryCount > 0) {
      throw new BadRequestException(
        'Нельзя удалить тег с записями. Сначала переназначьте записи.',
      );
    }

    if (tag.isDefault) {
      throw new BadRequestException('Базовые теги нельзя удалить');
    }

    await this.prisma.tag.delete({ where: { id } });
    return { ok: true };
  }

  async findOrCreateByHeader(userId: string, headerName: string) {
    const name = headerName.trim();
    const slug = slugifyTag(name);

    if (!slug) {
      return null;
    }

    const existing = await this.prisma.tag.findFirst({
      where: {
        userId,
        OR: [{ slug }, { name: { equals: name, mode: 'insensitive' } }],
      },
    });

    if (existing) {
      return existing;
    }

    return this.prisma.tag.create({
      data: {
        userId,
        name,
        slug,
        color: await this.pickColorForUser(userId),
      },
    });
  }

  private async findOwnedTag(userId: string, id: string) {
    const tag = await this.prisma.tag.findFirst({ where: { id, userId } });
    if (!tag) {
      throw new NotFoundException('Тег не найден');
    }
    return tag;
  }

  private async pickColorForUser(userId: string) {
    const count = await this.prisma.tag.count({ where: { userId } });
    return CUSTOM_TAG_COLORS[count % CUSTOM_TAG_COLORS.length];
  }
}
