import { Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { PaginatedResult } from '../../common/interfaces/paginated-result.interface';
import { CreateTaskDto } from './dto/create-task.dto';
import { QueryTasksDto } from './dto/query-tasks.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task } from './entities/task.entity';
import { TaskStatus } from './enums/task-status.enum';
import { TasksRepository } from './tasks.repository';

@Injectable()
export class TasksService {
  constructor(private readonly tasksRepository: TasksRepository) {}

  create(
    ownerId: string,
    dto: CreateTaskDto,
    manager?: EntityManager,
  ): Promise<Task> {
    return this.tasksRepository.create(
      {
        title: dto.title,
        description: dto.description ?? null,
        status: dto.status ?? TaskStatus.Todo,
        ownerId,
      },
      manager,
    );
  }

  async findAll(
    ownerId: string,
    query: QueryTasksDto,
  ): Promise<PaginatedResult<Task>> {
    const { page, limit, status } = query;

    const [items, total] = await this.tasksRepository.findAndCountByOwner(
      ownerId,
      { status, skip: (page - 1) * limit, take: limit },
    );

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, manager?: EntityManager): Promise<Task> {
    const task = await this.tasksRepository.findById(id, manager);
    if (!task) {
      throw new NotFoundException('task_not_found');
    }
    return task;
  }

  async update(
    id: string,
    dto: UpdateTaskDto,
    manager?: EntityManager,
  ): Promise<Task> {
    const task = await this.findOne(id, manager);
    Object.assign(task, dto);
    await this.tasksRepository.save(task, manager);
    return this.findOne(id, manager);
  }

  async remove(id: string, manager?: EntityManager): Promise<void> {
    const task = await this.findOne(id, manager);
    await this.tasksRepository.remove(task, manager);
  }
}
