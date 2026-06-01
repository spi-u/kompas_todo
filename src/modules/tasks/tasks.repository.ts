import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import {
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
    private readonly txHost: TransactionHost<TransactionalAdapterTypeOrm>,
  ) {}

  findAndCountActive(ownerId: string, options: ListOptions) {
    return this.repository.findAndCount({
      where: this.ownerWhere(ownerId, options.status, IsNull()),
      order: { createdAt: 'DESC' },
      skip: options.skip,
      take: options.take,
    });
  }

  findAndCountArchived(ownerId: string, options: ListOptions & { cutoff: Date }) {
    return this.repository.findAndCount({
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

  findById(id: string) {
    return this.repository.findOne({ where: { id } });
  }

  create(data: Pick<Task, 'title' | 'description' | 'status' | 'ownerId'>) {
    const task = this.repository.create(data);
    return this.repository.save(task);
  }

  save(task: Task) {
    return this.repository.save(task);
  }

  async deleteExpired(cutoff: Date): Promise<number> {
    const result = await this.repository.delete({
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

  private get repository(): Repository<Task> {
    return this.txHost.tx.getRepository(Task);
  }
}
