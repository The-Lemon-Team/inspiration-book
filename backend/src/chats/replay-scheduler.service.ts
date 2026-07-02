import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ReplayScheduleService } from './replay-schedule.service';

@Injectable()
export class ReplaySchedulerService {
  private readonly logger = new Logger(ReplaySchedulerService.name);

  constructor(private readonly replayScheduleService: ReplayScheduleService) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleScheduledReplays() {
    try {
      await this.replayScheduleService.tick();
    } catch (error) {
      this.logger.error(
        'Scheduled replay tick failed',
        error instanceof Error ? error.stack : String(error),
      );
    }
  }
}
