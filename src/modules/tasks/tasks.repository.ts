import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, FindOptionsWhere, Repository } from 'typeorm';
import { Task } from './entities/task.entity';
import { TaskStatus } from './enums/task-status.enum';

@Injectable()
export class TasksRepository {
  constructor(
    @InjectRepository(Task)
    private readonly repository: Repository<Task>,
  ) {}

  findAndCountByOwner(
    ownerId: string,
    options: { status?: TaskStatus; skip: number; take: number },
    manager?: EntityManager,
  ) {
    const where: FindOptionsWhere<Task> = { ownerId };
    if (options.status) {
      where.status = options.status;
    }

    return this.scope(manager).findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: options.skip,
      take: options.take,
    });
  }

  findById(id: string, manager?: EntityManager) {
    return this.scope(manager).findOne({ where: { id } });
  }

  create(
    data: Pick<Task, 'title' | 'description' | 'status' | 'ownerId'>,
    manager?: EntityManager,
  ) {
    const repository = this.scope(manager);
    const task = repository.create(data);
    return repository.save(task);
  }

  save(task: Task, manager?: EntityManager) {
    return this.scope(manager).save(task);
  }

  remove(task: Task, manager?: EntityManager) {
    return this.scope(manager).remove(task);
  }

  private scope(manager?: EntityManager): Repository<Task> {
    return manager ? manager.getRepository(Task) : this.repository;
  }
}
