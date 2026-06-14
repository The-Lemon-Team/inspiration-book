import { Module } from '@nestjs/common';
import { EntriesController } from './entries.controller';
import { EntriesService } from './entries.service';
import { EntryParserService } from './entry-parser.service';
import { TagsModule } from '../tags/tags.module';

@Module({
  imports: [TagsModule],
  controllers: [EntriesController],
  providers: [EntriesService, EntryParserService],
})
export class EntriesModule {}
