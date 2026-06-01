import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { isUUID } from 'class-validator';
import { FastifyRequest } from 'fastify';
import { AuthenticatedUser } from '../../auth/interfaces/jwt-payload.interface';
import { Task } from '../entities/task.entity';
import { TasksRepository } from '../tasks.repository';

@Injectable()
export class OwnershipGuard implements CanActivate {
  constructor(private readonly tasksRepository: TasksRepository) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<
      FastifyRequest & {
        params: { id: string };
        user: AuthenticatedUser;
        task?: Task;
      }
    >();

    const { id } = request.params;
    if (!isUUID(id)) {
      throw new BadRequestException('Validation failed (uuid is expected)');
    }

    const task = await this.tasksRepository.findById(id);
    if (!task) {
      throw new NotFoundException('task_not_found');
    }
    if (task.ownerId !== request.user.userId) {
      throw new ForbiddenException('task_forbidden');
    }

    request.task = task;
    return true;
  }
}
