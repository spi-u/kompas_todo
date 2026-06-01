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
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  ApiData,
  ApiPaginated,
} from '../../common/decorators/api-response.decorators';
import { ErrorResponseDto } from '../../common/dto/response-envelope.dto';
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

@ApiTags('tasks')
@ApiUnauthorizedResponse({ type: ErrorResponseDto })
@Controller('tasks')
@Auth()
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @ApiOperation({ summary: 'Create a task' })
  @ApiData(Task, 201)
  @ApiBadRequestResponse({ type: ErrorResponseDto })
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateTaskDto,
  ): Promise<Task> {
    return this.tasksService.create(user.userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List own active tasks' })
  @ApiPaginated(Task)
  findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: QueryTasksDto,
  ): Promise<PaginatedResult<Task>> {
    return this.tasksService.findAll(user.userId, query);
  }

  @Get('archived')
  @ApiOperation({ summary: 'Archived tasks' })
  @ApiPaginated(Task)
  findArchived(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: QueryTasksDto,
  ): Promise<PaginatedResult<Task>> {
    return this.tasksService.findArchived(user.userId, query);
  }

  @Get(':id')
  @UseGuards(OwnershipGuard)
  @ApiOperation({ summary: 'Get a task by id' })
  @ApiData(Task, 200)
  @ApiForbiddenResponse({ type: ErrorResponseDto })
  @ApiNotFoundResponse({ type: ErrorResponseDto })
  findOne(@CurrentTask() task: Task): Task {
    return task;
  }

  @Patch(':id')
  @UseGuards(OwnershipGuard)
  @ApiOperation({ summary: 'Update a task' })
  @ApiData(Task, 200)
  @ApiBadRequestResponse({ type: ErrorResponseDto })
  @ApiForbiddenResponse({ type: ErrorResponseDto })
  @ApiNotFoundResponse({ type: ErrorResponseDto })
  @ApiConflictResponse({ type: ErrorResponseDto })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateTaskDto,
  ): Promise<Task> {
    return this.tasksService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(OwnershipGuard)
  @ApiOperation({ summary: 'Archive a task' })
  @ApiForbiddenResponse({ type: ErrorResponseDto })
  @ApiNotFoundResponse({ type: ErrorResponseDto })
  @ApiConflictResponse({ type: ErrorResponseDto })
  remove(@Param('id') id: string): Promise<void> {
    return this.tasksService.archive(id);
  }
}
