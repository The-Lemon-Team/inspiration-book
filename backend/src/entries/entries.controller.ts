import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import type { AuthUser } from '../auth/auth-user.interface';
import { CurrentUser } from '../auth/current-user.decorator';
import {
  JwtAuthGuard,
  OptionalJwtAuthGuard,
} from '../auth/jwt-auth.guard';
import { CreateMessageDto } from './dto/create-message.dto';
import { QueryEntriesDto } from './dto/query-entries.dto';
import { SetPublicDto } from './dto/set-public.dto';
import { EntriesService } from './entries.service';

@Controller('entries')
export class EntriesController {
  constructor(private readonly entriesService: EntriesService) {}

  @Get('public')
  getPublicBoard(
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
    @Query('tagId') tagId?: string,
  ) {
    return this.entriesService.getPublicBoard(limit, tagId);
  }

  @Post('messages')
  @UseGuards(JwtAuthGuard)
  createMessage(
    @CurrentUser() user: AuthUser | null,
    @Body() dto: CreateMessageDto,
  ) {
    return this.entriesService.createMessage(user!.id, dto);
  }

  @Get('messages')
  @UseGuards(JwtAuthGuard)
  getMessages(@CurrentUser() user: AuthUser | null) {
    return this.entriesService.getMessages(user!.id);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@CurrentUser() user: AuthUser | null, @Query() query: QueryEntriesDto) {
    return this.entriesService.findEntries(user!.id, query);
  }

  @Get('timeline')
  @UseGuards(JwtAuthGuard)
  getTimeline(@CurrentUser() user: AuthUser | null, @Query() query: QueryEntriesDto) {
    return this.entriesService.getTimeline(user!.id, query);
  }

  @Get('calendar')
  @UseGuards(JwtAuthGuard)
  getCalendar(
    @CurrentUser() user: AuthUser | null,
    @Query('month', ParseIntPipe) month: number,
    @Query('year', ParseIntPipe) year: number,
  ) {
    return this.entriesService.getCalendar(user!.id, month, year);
  }

  @Get('top')
  @UseGuards(JwtAuthGuard)
  getTop(
    @CurrentUser() user: AuthUser | null,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.entriesService.getTop(user!.id, limit);
  }

  @Post(':id/vote')
  @UseGuards(OptionalJwtAuthGuard)
  vote(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser | null,
  ) {
    return this.entriesService.vote(id, user?.id);
  }

  @Patch(':id/public')
  @UseGuards(JwtAuthGuard)
  setPublic(
    @CurrentUser() user: AuthUser | null,
    @Param('id') id: string,
    @Body() dto: SetPublicDto,
  ) {
    return this.entriesService.setPublic(user!.id, id, dto.isPublic);
  }
}
