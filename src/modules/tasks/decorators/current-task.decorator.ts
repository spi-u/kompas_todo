import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { Task } from '../entities/task.entity';

export const CurrentTask = createParamDecorator(
  (_data: unknown, context: ExecutionContext): Task => {
    const request = context
      .switchToHttp()
      .getRequest<FastifyRequest & { task: Task }>();
    return request.task;
  },
);
