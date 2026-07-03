import { Module, forwardRef } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { EntriesModule } from '../entries/entries.module';
import { ChatsController } from './chats.controller';
import { ChatsService } from './chats.service';
import { ReplayScheduleService } from './replay-schedule.service';
import { ReplaySchedulerService } from './replay-scheduler.service';

@Module({
  imports: [ScheduleModule.forRoot(), forwardRef(() => EntriesModule)],
  controllers: [ChatsController],
  providers: [ChatsService, ReplayScheduleService, ReplaySchedulerService],
  exports: [ChatsService, ReplayScheduleService],
})
export class ChatsModule {}
