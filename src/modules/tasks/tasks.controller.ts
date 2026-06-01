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
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateTaskDto,
  ): Promise<Task> {
    return this.tasksService.create(user.userId, dto);
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
  update(
    @Param('id') id: string,
    @Body() dto: UpdateTaskDto,
  ): Promise<Task> {
    return this.tasksService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(OwnershipGuard)
  remove(@Param('id') id: string): Promise<void> {
    return this.tasksService.archive(id);
  }
}
