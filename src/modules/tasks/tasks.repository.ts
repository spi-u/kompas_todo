import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  EntityManager,
  FindOptionsWhere,
  IsNull,
  LessThan,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { Task } from './entities/task.entity';
import { TaskStatus } from './enums/task-status.enum';

interface ListOptions {
  status?: TaskStatus;
  skip: number;
  take: number;
}

@Injectable()
export class TasksRepository {
  constructor(
    @InjectRepository(Task)
    private readonly repository: Repository<Task>,
  ) {}

  findAndCountActive(
    ownerId: string,
    options: ListOptions,
    manager?: EntityManager,
  ) {
    return this.scope(manager).findAndCount({
      where: this.ownerWhere(ownerId, options.status, IsNull()),
      order: { createdAt: 'DESC' },
      skip: options.skip,
      take: options.take,
    });
  }

  findAndCountArchived(
    ownerId: string,
    options: ListOptions & { cutoff: Date },
    manager?: EntityManager,
  ) {
    return this.scope(manager).findAndCount({
      where: this.ownerWhere(
        ownerId,
        options.status,
        MoreThanOrEqual(options.cutoff),
      ),
      order: { archivedAt: 'DESC' },
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

  async deleteExpired(cutoff: Date, manager?: EntityManager): Promise<number> {
    const result = await this.scope(manager).delete({
      archivedAt: LessThan(cutoff),
    });
    return result.affected ?? 0;
  }

  private ownerWhere(
    ownerId: string,
    status: TaskStatus | undefined,
    archivedAt: FindOptionsWhere<Task>['archivedAt'],
  ): FindOptionsWhere<Task> {
    const where: FindOptionsWhere<Task> = { ownerId, archivedAt };
    if (status) {
      where.status = status;
    }
    return where;
  }

  private scope(manager?: EntityManager): Repository<Task> {
    return manager ? manager.getRepository(Task) : this.repository;
  }
}
