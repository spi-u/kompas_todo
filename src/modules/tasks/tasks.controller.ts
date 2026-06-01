import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { TransactionManager } from '../../common/decorators/transaction-manager.decorator';
import { Transactional } from '../../common/decorators/transactional.decorator';
import { PaginatedResult } from '../../common/interfaces/paginated-result.interface';
import { Auth } from '../auth/decorators/auth.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/interfaces/jwt-payload.interface';
import { CurrentTask } from './decorators/current-task.decorator';
import { CreateTaskDto } from './dto/create-task.dto';
import { QueryTasksDto } from './dto/query-tasks.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task } from './entities/task.entity';
import { OwnershipGuard } from './guards/ownership.guard';
import { TasksService } from './tasks.service';

@Controller('tasks')
@Auth()
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @Transactional()
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateTaskDto,
    @TransactionManager() manager: EntityManager,
  ): Promise<Task> {
    return this.tasksService.create(user.userId, dto, manager);
  }

  @Get()
  findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: QueryTasksDto,
  ): Promise<PaginatedResult<Task>> {
    return this.tasksService.findAll(user.userId, query);
  }

  @Get('archived')
  findArchived(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: QueryTasksDto,
  ): Promise<PaginatedResult<Task>> {
    return this.tasksService.findArchived(user.userId, query);
  }

  @Get(':id')
  @UseGuards(OwnershipGuard)
  findOne(@CurrentTask() task: Task): Task {
    return task;
  }

  @Patch(':id')
  @UseGuards(OwnershipGuard)
  @Transactional()
  update(
    @Param('id') id: string,
    @Body() dto: UpdateTaskDto,
    @TransactionManager() manager: EntityManager,
  ): Promise<Task> {
    return this.tasksService.update(id, dto, manager);
  }

  @Delete(':id')
  @UseGuards(OwnershipGuard)
  @Transactional()
  remove(
    @Param('id') id: string,
    @TransactionManager() manager: EntityManager,
  ): Promise<void> {
    return this.tasksService.archive(id, manager);
  }
}
