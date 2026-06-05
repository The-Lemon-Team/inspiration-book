import { Module } from '@nestjs/common';
import { EntriesController } from './entries.controller';
import { EntriesService } from './entries.service';
import { EntryParserService } from './entry-parser.service';

@Module({
  controllers: [EntriesController],
  providers: [EntriesService, EntryParserService],
})
export class EntriesModule {}
