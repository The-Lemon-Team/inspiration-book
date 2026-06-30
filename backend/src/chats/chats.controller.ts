import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import type { AuthUser } from '../auth/auth-user.interface';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ChatsService } from './chats.service';
import { CreateChatCollectionDto } from './dto/create-chat-collection.dto';
import { CreateChatDto } from './dto/create-chat.dto';

@Controller('chats')
@UseGuards(JwtAuthGuard)
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

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
}
