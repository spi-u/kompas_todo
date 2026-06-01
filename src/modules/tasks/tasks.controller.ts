import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { TransactionManager } from '../../common/decorators/transaction-manager.decorator';
import { Transactional } from '../../common/decorators/transactional.decorator';
import { PaginatedResult } from '../../common/interfaces/paginated-result.interface';
import { Auth } from '../auth/decorators/auth.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/interfaces/jwt-payload.interface';
import { CreateTaskDto } from './dto/create-task.dto';
import { QueryTasksDto } from './dto/query-tasks.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task } from './entities/task.entity';
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

  @Get(':id')
  findOne(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<Task> {
    return this.tasksService.findOne(user.userId, id);
  }

  @Patch(':id')
  @Transactional()
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTaskDto,
    @TransactionManager() manager: EntityManager,
  ): Promise<Task> {
    return this.tasksService.update(user.userId, id, dto, manager);
  }

  @Delete(':id')
  @Transactional()
  remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
    @TransactionManager() manager: EntityManager,
  ): Promise<void> {
    return this.tasksService.remove(user.userId, id, manager);
  }
}
