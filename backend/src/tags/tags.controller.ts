import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import type { AuthUser } from '../auth/auth-user.interface';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { TagsService } from './tags.service';

@Controller('tags')
@UseGuards(JwtAuthGuard)
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Get()
  list(@CurrentUser() user: AuthUser | null) {
    return this.tagsService.list(user!.id);
  }

  @Get('stats')
  stats(@CurrentUser() user: AuthUser | null) {
    return this.tagsService.getStats(user!.id);
  }

  @Post()
  create(@CurrentUser() user: AuthUser | null, @Body() dto: CreateTagDto) {
    return this.tagsService.create(user!.id, dto);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: AuthUser | null,
    @Param('id') id: string,
    @Body() dto: UpdateTagDto,
  ) {
    return this.tagsService.update(user!.id, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: AuthUser | null, @Param('id') id: string) {
    return this.tagsService.remove(user!.id, id);
  }
}
