import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ChatKind, FlowEventKind, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ChatsService } from '../chats/chats.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { QueryEntriesDto } from './dto/query-entries.dto';
import { ReplayMessageDto } from './dto/replay-message.dto';
import { EntryParserService } from './entry-parser.service';
import { buildMessageDocument, resolveMessageContent } from './message-document.builder';

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

const messageInclude = {
  user: { select: publicUserSelect },
  chat: true,
  entries: {
    orderBy: { createdAt: 'asc' as const },
    include: { tag: true },
  },
} as const;

@Injectable()
export class EntriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly parser: EntryParserService,
    private readonly chatsService: ChatsService,
  ) {}

  async createMessage(userId: string, dto: CreateMessageDto) {
    const parsed = await this.parser.parseForUser(userId, dto.rawText);
    if (parsed.length === 0) {
      throw new BadRequestException(
        'Не удалось распознать записи. Используйте формат: "Узнал:" или "lo-fi:" и строки с "- пункт".',
      );
    }

    const chat = dto.chatId
      ? await this.chatsService.findOwnedChat(userId, dto.chatId)
      : await this.chatsService.getGeneralChat(userId);

    const isPublic = dto.isPublic ?? false;
    const content = resolveMessageContent(dto.rawText, dto.content);

    return this.prisma.$transaction(async (tx) => {
      const message = await tx.message.create({
        data: {
          rawText: dto.rawText,
          content: content as unknown as Prisma.InputJsonValue,
          userId,
          chatId: chat.id,
        },
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
        include: messageInclude,
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

  async getMessages(userId: string, chatId?: string) {
    if (chatId) {
      await this.chatsService.findOwnedChat(userId, chatId);
    }

    return this.prisma.message.findMany({
      where: {
        userId,
        ...(chatId ? { chatId } : {}),
      },
      orderBy: { createdAt: 'asc' },
      include: messageInclude,
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

  async publishMessage(
    userId: string,
    messageId: string,
    tagId: string,
    isPublic = true,
  ) {
    const message = await this.prisma.message.findFirst({
      where: { id: messageId, userId },
      include: { entries: true },
    });
    if (!message) {
      throw new NotFoundException('Сообщение не найдено');
    }
    if (message.entries.length === 0) {
      throw new BadRequestException('В сообщении нет записей для публикации');
    }

    const tag = await this.prisma.tag.findFirst({
      where: { id: tagId, userId },
    });
    if (!tag) {
      throw new NotFoundException('Группа не найдена');
    }

    await this.prisma.entry.updateMany({
      where: { messageId, userId },
      data: { isPublic, tagId },
    });

    return this.prisma.message.findUniqueOrThrow({
      where: { id: messageId },
      include: messageInclude,
    });
  }

  async deleteMessage(userId: string, messageId: string) {
    const message = await this.prisma.message.findFirst({
      where: { id: messageId, userId },
    });
    if (!message) {
      throw new NotFoundException('Сообщение не найдено');
    }

    await this.prisma.$transaction([
      this.prisma.entry.deleteMany({ where: { messageId, userId } }),
      this.prisma.message.delete({ where: { id: messageId } }),
    ]);

    return { ok: true };
  }

  async shareMessageToGeneral(userId: string, messageId: string) {
    const general = await this.chatsService.getGeneralChat(userId);
    return this.replayMessage(userId, messageId, {
      direction: 'UP',
      targetChatId: general.id,
    });
  }

  async replayMessage(userId: string, messageId: string, dto: ReplayMessageDto) {
    const source = await this.prisma.message.findFirst({
      where: { id: messageId, userId },
      include: { chat: true, entries: true },
    });
    if (!source) {
      throw new NotFoundException('Сообщение не найдено');
    }

    if (dto.direction === 'UP') {
      return this.replayUp(userId, source, dto.targetChatId);
    }

    return this.replayDown(userId, source);
  }

  private async replayUp(
    userId: string,
    source: Prisma.MessageGetPayload<{
      include: { chat: true; entries: true };
    }>,
    targetChatId?: string,
  ) {
    if (source.chat.kind === ChatKind.GENERAL) {
      throw new BadRequestException('Из general нельзя отправить replay вверх');
    }

    const targets = await this.chatsService.getUpwardTargets(userId, source.chatId);
    if (targets.length === 0) {
      throw new BadRequestException(
        'Нет доступных каналов вверх. Укажите родительский чат или разрешение.',
      );
    }

    const resolvedTargetId = targetChatId ?? targets[0]?.chatId;
    if (!resolvedTargetId) {
      throw new BadRequestException('Не указан целевой чат');
    }

    const targetChat = await this.chatsService.findOwnedChat(userId, resolvedTargetId);

    if (targetChat.kind !== ChatKind.GENERAL) {
      await this.chatsService.assertUpwardTargetAllowed(
        userId,
        source.chatId,
        resolvedTargetId,
      );
    }

    const parsed = await this.parser.parseForUser(userId, source.rawText);
    if (parsed.length === 0) {
      throw new BadRequestException('Не удалось скопировать сообщение');
    }

    const content = resolveMessageContent(
      source.rawText,
      source.content as Record<string, unknown> | undefined,
    );

    const flowMeta = {
      kind: 'REPLAY_UP',
      sourceChatId: source.chatId,
      sourceChatName: source.chat.name,
    };

    return this.prisma.$transaction(async (tx) => {
      const message = await tx.message.create({
        data: {
          rawText: source.rawText,
          content: content as unknown as Prisma.InputJsonValue,
          userId,
          chatId: targetChat.id,
          originMessageId: source.id,
          flowMeta: flowMeta as unknown as Prisma.InputJsonValue,
        },
      });

      await tx.entry.createMany({
        data: parsed.map((entry) => ({
          content: entry.content,
          tagId: entry.tagId,
          messageId: message.id,
          userId,
          isPublic: false,
        })),
      });

      await tx.flowEvent.create({
        data: {
          userId,
          kind: FlowEventKind.REPLAY_UP,
          sourceChatId: source.chatId,
          targetChatId: targetChat.id,
          sourceMessageId: source.id,
          targetMessageId: message.id,
          entryCount: parsed.length,
        },
      });

      return tx.message.findUniqueOrThrow({
        where: { id: message.id },
        include: messageInclude,
      });
    });
  }

  private async replayDown(
    userId: string,
    source: Prisma.MessageGetPayload<{
      include: { chat: true; entries: true };
    }>,
  ) {
    const children = await this.chatsService.getChildChats(userId, source.chatId);
    if (children.length === 0) {
      throw new BadRequestException('У этого чата нет дочерних чатов для рассылки');
    }

    const parsed = await this.parser.parseForUser(userId, source.rawText);
    if (parsed.length === 0) {
      throw new BadRequestException('Не удалось скопировать сообщение');
    }

    const createdMessages = await this.prisma.$transaction(async (tx) => {
      const results = [];

      for (const child of children) {
        const includePrefix = await this.chatsService.getDownLinkPrefixSetting(
          userId,
          source.chatId,
          child.id,
        );
        const rawText = includePrefix
          ? `📢 ${source.chat.name}\n\n${source.rawText}`
          : source.rawText;

        const childContent = resolveMessageContent(
          rawText,
          includePrefix
            ? undefined
            : (source.content as Record<string, unknown> | undefined),
        );

        const flowMeta = {
          kind: 'REPLAY_DOWN',
          sourceChatId: source.chatId,
          sourceChatName: source.chat.name,
        };

        const message = await tx.message.create({
          data: {
            rawText,
            content: childContent as unknown as Prisma.InputJsonValue,
            userId,
            chatId: child.id,
            originMessageId: source.id,
            flowMeta: flowMeta as unknown as Prisma.InputJsonValue,
          },
        });

        await tx.entry.createMany({
          data: parsed.map((entry) => ({
            content: entry.content,
            tagId: entry.tagId,
            messageId: message.id,
            userId,
            isPublic: false,
          })),
        });

        await tx.flowEvent.create({
          data: {
            userId,
            kind: FlowEventKind.REPLAY_DOWN,
            sourceChatId: source.chatId,
            targetChatId: child.id,
            sourceMessageId: source.id,
            targetMessageId: message.id,
            entryCount: parsed.length,
          },
        });

        results.push(message);
      }

      return results;
    });

    return {
      count: createdMessages.length,
      messages: await this.prisma.message.findMany({
        where: { id: { in: createdMessages.map((message) => message.id) } },
        include: messageInclude,
      }),
    };
  }
}

