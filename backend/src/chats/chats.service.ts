import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ChatKind } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateChatCollectionDto } from './dto/create-chat-collection.dto';
import { CreateChatDto } from './dto/create-chat.dto';

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48) || 'chat';
}

async function uniqueSlug(
  prisma: PrismaService,
  userId: string,
  base: string,
  table: 'chat' | 'collection',
): Promise<string> {
  let slug = slugify(base);
  let suffix = 0;

  while (true) {
    const candidate = suffix === 0 ? slug : `${slug}-${suffix}`;
    const exists =
      table === 'chat'
        ? await prisma.chat.findUnique({
            where: { userId_slug: { userId, slug: candidate } },
          })
        : await prisma.chatCollection.findUnique({
            where: { userId_slug: { userId, slug: candidate } },
          });

    if (!exists) return candidate;
    suffix += 1;
  }
}

@Injectable()
export class ChatsService {
  constructor(private readonly prisma: PrismaService) {}

  async seedForUser(userId: string) {
    const existing = await this.prisma.chat.findFirst({
      where: { userId, kind: ChatKind.GENERAL },
    });
    if (existing) return existing;

    return this.prisma.chat.create({
      data: {
        name: 'general',
        slug: 'general',
        kind: ChatKind.GENERAL,
        userId,
        sortOrder: 0,
      },
    });
  }

  async listForUser(userId: string) {
    const [collections, chats] = await Promise.all([
      this.prisma.chatCollection.findMany({
        where: { userId },
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
        include: {
          chats: {
            orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
          },
        },
      }),
      this.prisma.chat.findMany({
        where: { userId },
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
        include: { collection: true },
      }),
    ]);

    const general = chats.find((chat) => chat.kind === ChatKind.GENERAL) ?? null;
    const standalone = chats.filter(
      (chat) => chat.kind !== ChatKind.GENERAL && !chat.collectionId,
    );

    return { general, collections, standalone, chats };
  }

  async getGeneralChat(userId: string) {
    const chat = await this.prisma.chat.findFirst({
      where: { userId, kind: ChatKind.GENERAL },
    });
    if (!chat) {
      return this.seedForUser(userId);
    }
    return chat;
  }

  async findOwnedChat(userId: string, chatId: string) {
    const chat = await this.prisma.chat.findFirst({
      where: { id: chatId, userId },
    });
    if (!chat) {
      throw new NotFoundException('Чат не найден');
    }
    return chat;
  }

  async createCollection(userId: string, dto: CreateChatCollectionDto) {
    const slug = await uniqueSlug(this.prisma, userId, dto.name, 'collection');
    const count = await this.prisma.chatCollection.count({ where: { userId } });

    return this.prisma.chatCollection.create({
      data: {
        name: dto.name.trim(),
        slug,
        userId,
        sortOrder: count,
      },
    });
  }

  async createChat(userId: string, dto: CreateChatDto) {
    const name = dto.name.trim();
    if (name.toLowerCase() === 'general') {
      throw new BadRequestException('Имя general зарезервировано');
    }

    if (dto.collectionId) {
      const collection = await this.prisma.chatCollection.findFirst({
        where: { id: dto.collectionId, userId },
      });
      if (!collection) {
        throw new NotFoundException('Группа чатов не найдена');
      }
    }

    const slug = await uniqueSlug(this.prisma, userId, name, 'chat');
    const count = await this.prisma.chat.count({
      where: { userId, collectionId: dto.collectionId ?? null },
    });

    return this.prisma.chat.create({
      data: {
        name,
        slug,
        kind: ChatKind.REGULAR,
        userId,
        collectionId: dto.collectionId ?? null,
        sortOrder: count,
      },
      include: { collection: true },
    });
  }
}
