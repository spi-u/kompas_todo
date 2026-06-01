import {
  ExecutionContext,
  InternalServerErrorException,
  createParamDecorator,
} from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { EntityManager } from 'typeorm';
import { TRANSACTION_MANAGER } from '../constants/transaction.constant';

export const TransactionManager = createParamDecorator(
  (_data: unknown, context: ExecutionContext): EntityManager => {
    const request = context
      .switchToHttp()
      .getRequest<FastifyRequest & { [TRANSACTION_MANAGER]?: EntityManager }>();

    const manager = request[TRANSACTION_MANAGER];
    if (!manager) {
      throw new InternalServerErrorException('transaction_manager_missing');
    }

    return manager;
  },
);
