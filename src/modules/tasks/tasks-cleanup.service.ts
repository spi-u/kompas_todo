import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ARCHIVE_RETENTION_DAYS } from './tasks.constants';
import { TasksRepository } from './tasks.repository';
import { TasksService } from './tasks.service';

@Injectable()
export class TasksCleanupService {
  private readonly logger = new Logger(TasksCleanupService.name);

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly tasksRepository: TasksRepository,
    private readonly tasksService: TasksService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async purgeExpired(): Promise<number> {
    const cutoff = this.tasksService.retentionCutoff();

    const affected = await this.dataSource.transaction((manager) =>
      this.tasksRepository.deleteExpired(cutoff, manager),
    );

    if (affected > 0) {
      this.logger.log(
        `Purged ${affected} archived task(s) older than ${ARCHIVE_RETENTION_DAYS} days`,
      );
    }

    return affected;
  }
}
