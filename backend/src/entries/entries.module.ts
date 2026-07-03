import { Module, forwardRef } from '@nestjs/common';
import { EntriesController } from './entries.controller';
import { EntriesService } from './entries.service';
import { EntryParserService } from './entry-parser.service';
import { TagsModule } from '../tags/tags.module';
import { ChatsModule } from '../chats/chats.module';

@Module({
  imports: [TagsModule, forwardRef(() => ChatsModule)],
  controllers: [EntriesController],
  providers: [EntriesService, EntryParserService],
  exports: [EntriesService, EntryParserService],
})
export class EntriesModule {}
