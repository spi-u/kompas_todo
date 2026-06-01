import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { Task } from './entities/task.entity';
import { OwnershipGuard } from './guards/ownership.guard';
import { TasksCleanupService } from './tasks-cleanup.service';
import { TasksController } from './tasks.controller';
import { TasksGateway } from './tasks.gateway';
import { TasksRepository } from './tasks.repository';
import { TasksService } from './tasks.service';

@Module({
  imports: [TypeOrmModule.forFeature([Task]), AuthModule],
  controllers: [TasksController],
  providers: [
    TasksService,
    TasksRepository,
    OwnershipGuard,
    TasksCleanupService,
    TasksGateway,
  ],
  exports: [TasksService],
})
export class TasksModule {}
