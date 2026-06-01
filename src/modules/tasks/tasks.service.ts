import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Transactional } from '@nestjs-cls/transactional';
import { PaginatedResult } from '../../common/interfaces/paginated-result.interface';
import { CreateTaskDto } from './dto/create-task.dto';
import { QueryTasksDto } from './dto/query-tasks.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task } from './entities/task.entity';
import { TaskStatus } from './enums/task-status.enum';
import { ARCHIVE_RETENTION_DAYS } from './tasks.constants';
import { TasksGateway } from './tasks.gateway';
import { TasksRepository } from './tasks.repository';

@Injectable()
export class TasksService {
  constructor(
    private readonly tasksRepository: TasksRepository,
    private readonly tasksGateway: TasksGateway,
  ) {}

  @Transactional()
  create(ownerId: string, dto: CreateTaskDto): Promise<Task> {
    return this.tasksRepository.create({
      title: dto.title,
      description: dto.description ?? null,
      status: dto.status ?? TaskStatus.Todo,
      ownerId,
    });
  }

  async findAll(
    ownerId: string,
    query: QueryTasksDto,
  ): Promise<PaginatedResult<Task>> {
    const { page, limit, status } = query;
    const [items, total] = await this.tasksRepository.findAndCountActive(
      ownerId,
      { status, skip: (page - 1) * limit, take: limit },
    );
    return this.paginate(items, total, page, limit);
  }

  async findArchived(
    ownerId: string,
    query: QueryTasksDto,
  ): Promise<PaginatedResult<Task>> {
    const { page, limit, status } = query;
    const [items, total] = await this.tasksRepository.findAndCountArchived(
      ownerId,
      {
        status,
        skip: (page - 1) * limit,
        take: limit,
        cutoff: this.retentionCutoff(),
      },
    );
    return this.paginate(items, total, page, limit);
  }

  async findOne(id: string): Promise<Task> {
    const task = await this.tasksRepository.findById(id);
    if (!task) {
      throw new NotFoundException('task_not_found');
    }
    return task;
  }

  @Transactional()
  async update(id: string, dto: UpdateTaskDto): Promise<Task> {
    const task = await this.findOne(id);
    if (task.archivedAt) {
      throw new ConflictException('task_archived');
    }
    const previousStatus = task.status;
    Object.assign(task, dto);
    await this.tasksRepository.save(task);
    const updated = await this.findOne(id);
    if (updated.status !== previousStatus) {
      this.tasksGateway.emitTaskStatus(updated.ownerId, updated);
    }
    return updated;
  }

  @Transactional()
  async archive(id: string): Promise<void> {
    const task = await this.findOne(id);
    if (task.archivedAt) {
      throw new ConflictException('task_already_archived');
    }
    task.archivedAt = new Date();
    await this.tasksRepository.save(task);
  }

  retentionCutoff(): Date {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - ARCHIVE_RETENTION_DAYS);
    return cutoff;
  }

  isExpired(task: Task): boolean {
    return task.archivedAt !== null && task.archivedAt < this.retentionCutoff();
  }

  private paginate(
    items: Task[],
    total: number,
    page: number,
    limit: number,
  ): PaginatedResult<Task> {
    return {
      items,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }
}
