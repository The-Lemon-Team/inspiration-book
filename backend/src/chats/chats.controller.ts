import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import type { AuthUser } from '../auth/auth-user.interface';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ChatsService } from './chats.service';
import { CreateChatCollectionDto } from './dto/create-chat-collection.dto';
import { CreateChatDto } from './dto/create-chat.dto';
import { CreateUpwardGrantDto } from './dto/create-upward-grant.dto';
import { ReorderChatsDto } from './dto/reorder-chats.dto';
import {
  CreateReplayScheduleDto,
  UpdateReplayScheduleDto,
} from './dto/replay-schedule.dto';
import { SetChatPinDto } from './dto/set-chat-pin.dto';
import { SetChatParentDto } from './dto/set-chat-parent.dto';
import { ReplayScheduleService } from './replay-schedule.service';

@Controller('chats')
@UseGuards(JwtAuthGuard)
export class ChatsController {
  constructor(
    private readonly chatsService: ChatsService,
    private readonly replayScheduleService: ReplayScheduleService,
  ) {}

  @Get()
  list(@CurrentUser() user: AuthUser | null) {
    return this.chatsService.listForUser(user!.id);
  }

  @Post('collections')
  createCollection(
    @CurrentUser() user: AuthUser | null,
    @Body() dto: CreateChatCollectionDto,
  ) {
    return this.chatsService.createCollection(user!.id, dto);
  }

  @Post()
  createChat(
    @CurrentUser() user: AuthUser | null,
    @Body() dto: CreateChatDto,
  ) {
    return this.chatsService.createChat(user!.id, dto);
  }

  @Patch(':id/parent')
  setParent(
    @CurrentUser() user: AuthUser | null,
    @Param('id') id: string,
    @Body() dto: SetChatParentDto,
  ) {
    return this.chatsService.setParent(user!.id, id, dto.parentChatId);
  }

  @Patch(':id/pin')
  setPin(
    @CurrentUser() user: AuthUser | null,
    @Param('id') id: string,
    @Body() dto: SetChatPinDto,
  ) {
    return this.chatsService.setPin(user!.id, id, dto.pinned);
  }

  @Post('reorder')
  reorder(@CurrentUser() user: AuthUser | null, @Body() dto: ReorderChatsDto) {
    return this.chatsService.reorder(user!.id, dto.chatIds);
  }

  @Get(':id/upward-targets')
  getUpwardTargets(
    @CurrentUser() user: AuthUser | null,
    @Param('id') id: string,
  ) {
    return this.chatsService.getUpwardTargets(user!.id, id);
  }

  @Get(':id/children')
  getChildren(
    @CurrentUser() user: AuthUser | null,
    @Param('id') id: string,
  ) {
    return this.chatsService.getChildChats(user!.id, id);
  }

  @Get(':id/channel-activity')
  getChannelActivity(
    @CurrentUser() user: AuthUser | null,
    @Param('id') id: string,
    @Query('limit') limit?: string,
  ) {
    const parsedLimit = limit ? Number.parseInt(limit, 10) : 30;
    return this.chatsService.getChannelActivity(
      user!.id,
      id,
      Number.isFinite(parsedLimit) ? parsedLimit : 30,
    );
  }

  @Post('upward-grants')
  createUpwardGrant(
    @CurrentUser() user: AuthUser | null,
    @Body() dto: CreateUpwardGrantDto,
  ) {
    return this.chatsService.createUpwardGrant(user!.id, dto);
  }

  @Get('upward-grants')
  listUpwardGrants(@CurrentUser() user: AuthUser | null) {
    return this.chatsService.listUpwardGrants(user!.id);
  }

  @Delete('upward-grants/:grantId')
  deleteUpwardGrant(
    @CurrentUser() user: AuthUser | null,
    @Param('grantId') grantId: string,
  ) {
    return this.chatsService.deleteUpwardGrant(user!.id, grantId);
  }

  @Get(':id/replay-schedules')
  listReplaySchedules(
    @CurrentUser() user: AuthUser | null,
    @Param('id') id: string,
  ) {
    return this.replayScheduleService.listForChannel(user!.id, id);
  }

  @Post(':id/replay-schedules')
  createReplaySchedule(
    @CurrentUser() user: AuthUser | null,
    @Param('id') id: string,
    @Body() dto: CreateReplayScheduleDto,
  ) {
    return this.replayScheduleService.create(user!.id, id, dto);
  }

  @Patch('replay-schedules/:scheduleId')
  updateReplaySchedule(
    @CurrentUser() user: AuthUser | null,
    @Param('scheduleId') scheduleId: string,
    @Body() dto: UpdateReplayScheduleDto,
  ) {
    return this.replayScheduleService.update(user!.id, scheduleId, dto);
  }

  @Delete('replay-schedules/:scheduleId')
  deleteReplaySchedule(
    @CurrentUser() user: AuthUser | null,
    @Param('scheduleId') scheduleId: string,
  ) {
    return this.replayScheduleService.delete(user!.id, scheduleId);
  }

  @Post('replay-schedules/:scheduleId/run')
  runReplaySchedule(
    @CurrentUser() user: AuthUser | null,
    @Param('scheduleId') scheduleId: string,
  ) {
    return this.replayScheduleService.runNow(user!.id, scheduleId);
  }
}
