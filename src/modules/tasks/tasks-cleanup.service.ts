import { Injectable, Logger } from '@nestjs/common';
import { Transactional } from '@nestjs-cls/transactional';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ARCHIVE_RETENTION_DAYS } from './tasks.constants';
import { TasksRepository } from './tasks.repository';
import { TasksService } from './tasks.service';

@Injectable()
export class TasksCleanupService {
  private readonly logger = new Logger(TasksCleanupService.name);

  constructor(
    private readonly tasksRepository: TasksRepository,
    private readonly tasksService: TasksService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  @Transactional()
  async purgeExpired(): Promise<number> {
    const affected = await this.tasksRepository.deleteExpired(
      this.tasksService.retentionCutoff(),
    );

    if (affected > 0) {
      this.logger.log(
        `Purged ${affected} archived task(s) older than ${ARCHIVE_RETENTION_DAYS} days`,
      );
    }

    return affected;
  }
}
