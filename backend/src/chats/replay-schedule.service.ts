import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { FlowEventKind, Prisma } from '@prisma/client';
import {
  getLocalDateKey,
  isSameLocalDay,
  matchesScheduleSlot,
} from '../common/timezone.util';
import { EntryParserService } from '../entries/entry-parser.service';
import { buildMessageDocument } from '../entries/message-document.builder';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateReplayScheduleDto,
  UpdateReplayScheduleDto,
} from './dto/replay-schedule.dto';
import { ChatsService } from './chats.service';

type DigestSection = {
  chatId: string;
  chatName: string;
  entries: { content: string; tagName: string }[];
};

const scheduleInclude = {
  signalTag: true,
  channelChat: true,
} as const;

@Injectable()
export class ReplayScheduleService {
  private readonly logger = new Logger(ReplayScheduleService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly chatsService: ChatsService,
    private readonly parser: EntryParserService,
  ) {}

  async listForChannel(userId: string, channelChatId: string) {
    await this.chatsService.findOwnedChat(userId, channelChatId);

    return this.prisma.replaySchedule.findMany({
      where: { userId, channelChatId },
      orderBy: [{ scheduleTime: 'asc' }, { createdAt: 'asc' }],
      include: scheduleInclude,
    });
  }

  async create(userId: string, channelChatId: string, dto: CreateReplayScheduleDto) {
    await this.chatsService.findOwnedChat(userId, channelChatId);

    const tag = await this.prisma.tag.findFirst({
      where: { id: dto.signalTagId, userId },
    });
    if (!tag) {
      throw new NotFoundException('Тег не найден');
    }

    return this.prisma.replaySchedule.create({
      data: {
        userId,
        channelChatId,
        signalTagId: dto.signalTagId,
        scheduleTime: dto.scheduleTime,
        timezone: dto.timezone ?? 'Europe/Moscow',
        skipIfEmpty: dto.skipIfEmpty ?? true,
      },
      include: scheduleInclude,
    });
  }

  async update(
    userId: string,
    scheduleId: string,
    dto: UpdateReplayScheduleDto,
  ) {
    const schedule = await this.findOwnedSchedule(userId, scheduleId);

    if (dto.signalTagId) {
      const tag = await this.prisma.tag.findFirst({
        where: { id: dto.signalTagId, userId },
      });
      if (!tag) {
        throw new NotFoundException('Тег не найден');
      }
    }

    return this.prisma.replaySchedule.update({
      where: { id: schedule.id },
      data: {
        signalTagId: dto.signalTagId,
        scheduleTime: dto.scheduleTime,
        timezone: dto.timezone,
        enabled: dto.enabled,
        skipIfEmpty: dto.skipIfEmpty,
      },
      include: scheduleInclude,
    });
  }

  async delete(userId: string, scheduleId: string) {
    await this.findOwnedSchedule(userId, scheduleId);
    await this.prisma.replaySchedule.delete({ where: { id: scheduleId } });
    return { ok: true };
  }

  async runNow(userId: string, scheduleId: string) {
    const schedule = await this.findOwnedSchedule(userId, scheduleId);
    return this.executeSchedule(schedule, { force: true });
  }

  async tick(now = new Date()) {
    const schedules = await this.prisma.replaySchedule.findMany({
      where: { enabled: true },
      include: scheduleInclude,
    });

    for (const schedule of schedules) {
      if (!matchesScheduleSlot(schedule.scheduleTime, schedule.timezone, now)) {
        continue;
      }

      const localDate = getLocalDateKey(schedule.timezone, now);
      if (schedule.lastRunLocalDate === localDate) {
        continue;
      }

      try {
        await this.executeSchedule(schedule, { force: false, now });
      } catch (error) {
        this.logger.error(
          `Replay schedule ${schedule.id} failed`,
          error instanceof Error ? error.stack : String(error),
        );
      }
    }
  }

  private async findOwnedSchedule(userId: string, scheduleId: string) {
    const schedule = await this.prisma.replaySchedule.findFirst({
      where: { id: scheduleId, userId },
      include: scheduleInclude,
    });
    if (!schedule) {
      throw new NotFoundException('Расписание не найдено');
    }
    return schedule;
  }

  private async executeSchedule(
    schedule: Prisma.ReplayScheduleGetPayload<{ include: typeof scheduleInclude }>,
    options: { force: boolean; now?: Date },
  ) {
    const now = options.now ?? new Date();
    const localDate = getLocalDateKey(schedule.timezone, now);

    if (
      !options.force &&
      schedule.lastRunLocalDate === localDate
    ) {
      return { skipped: true, reason: 'already_ran_today' as const };
    }

    const children = await this.prisma.chat.findMany({
      where: { userId: schedule.userId, parentChatId: schedule.channelChatId },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });

    if (children.length === 0) {
      if (schedule.skipIfEmpty) {
        return { skipped: true, reason: 'no_children' as const };
      }
    }

    const sections = await this.collectSections(
      schedule.userId,
      children,
      schedule.signalTagId,
      schedule.timezone,
      now,
    );

    if (sections.length === 0 && schedule.skipIfEmpty) {
      await this.prisma.replaySchedule.update({
        where: { id: schedule.id },
        data: { lastRunAt: now, lastRunLocalDate: localDate },
      });
      return { skipped: true, reason: 'empty' as const };
    }

    const rawText = this.buildDigestText(
      schedule.channelChat.name,
      schedule.signalTag.name,
      localDate,
      sections,
    );

    const parsed = await this.parser.parseForUser(schedule.userId, rawText);
    if (parsed.length === 0) {
      throw new BadRequestException('Не удалось собрать сводку');
    }

    const content = buildMessageDocument(rawText);
    const totalEntries = sections.reduce(
      (sum, section) => sum + section.entries.length,
      0,
    );

    const flowMeta = {
      kind: 'SCHEDULED_DIGEST',
      scheduleId: schedule.id,
      signalTagName: schedule.signalTag.name,
      localDate,
      sections: sections.map((section) => ({
        chatId: section.chatId,
        chatName: section.chatName,
        entryCount: section.entries.length,
      })),
    };

    const message = await this.prisma.$transaction(async (tx) => {
      const created = await tx.message.create({
        data: {
          rawText,
          content: content as unknown as Prisma.InputJsonValue,
          userId: schedule.userId,
          chatId: schedule.channelChatId,
          flowMeta: flowMeta as unknown as Prisma.InputJsonValue,
        },
      });

      await tx.entry.createMany({
        data: parsed.map((entry) => ({
          content: entry.content,
          tagId: entry.tagId,
          messageId: created.id,
          userId: schedule.userId,
          isPublic: false,
        })),
      });

      for (const section of sections) {
        await tx.flowEvent.create({
          data: {
            userId: schedule.userId,
            kind: FlowEventKind.REPLAY_UP,
            sourceChatId: section.chatId,
            targetChatId: schedule.channelChatId,
            targetMessageId: created.id,
            entryCount: section.entries.length,
          },
        });
      }

      await tx.replaySchedule.update({
        where: { id: schedule.id },
        data: { lastRunAt: now, lastRunLocalDate: localDate },
      });

      return created;
    });

    return {
      skipped: false,
      messageId: message.id,
      sectionCount: sections.length,
      entryCount: totalEntries,
    };
  }

  private async collectSections(
    userId: string,
    children: { id: string; name: string }[],
    signalTagId: string,
    timeZone: string,
    reference: Date,
  ): Promise<DigestSection[]> {
    const since = new Date(reference.getTime() - 48 * 60 * 60 * 1000);

    const sections: DigestSection[] = [];

    for (const child of children) {
      const entries = await this.prisma.entry.findMany({
        where: {
          userId,
          tagId: signalTagId,
          message: { chatId: child.id },
          createdAt: { gte: since },
        },
        include: { tag: true },
        orderBy: { createdAt: 'asc' },
      });

      const todaysEntries = entries.filter((entry) =>
        isSameLocalDay(entry.createdAt, timeZone, reference),
      );

      if (todaysEntries.length === 0) {
        continue;
      }

      sections.push({
        chatId: child.id,
        chatName: child.name,
        entries: todaysEntries.map((entry) => ({
          content: entry.content,
          tagName: entry.tag.name,
        })),
      });
    }

    return sections;
  }

  private buildDigestText(
    channelName: string,
    signalTagName: string,
    localDate: string,
    sections: DigestSection[],
  ) {
    const lines = [
      `📋 Сводка · ${channelName} · ${localDate} · #${signalTagName}`,
      '',
    ];

    for (const section of sections) {
      lines.push(`${section.chatName}:`);
      lines.push(`${signalTagName}:`);
      for (const entry of section.entries) {
        lines.push(` - ${entry.content}`);
      }
      lines.push('');
    }

    return lines.join('\n').trim();
  }
}
