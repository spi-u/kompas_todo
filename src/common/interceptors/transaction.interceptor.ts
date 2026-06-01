import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { FastifyRequest } from 'fastify';
import { Observable, from, throwError } from 'rxjs';
import { catchError, concatMap, finalize, map } from 'rxjs/operators';
import { DataSource, EntityManager } from 'typeorm';
import { TRANSACTION_MANAGER } from '../constants/transaction.constant';

@Injectable()
export class TransactionInterceptor implements NestInterceptor {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context
      .switchToHttp()
      .getRequest<FastifyRequest & { [TRANSACTION_MANAGER]?: EntityManager }>();
    const queryRunner = this.dataSource.createQueryRunner();

    return from(queryRunner.connect()).pipe(
      concatMap(() => from(queryRunner.startTransaction())),
      concatMap(() => {
        request[TRANSACTION_MANAGER] = queryRunner.manager;
        return next.handle();
      }),
      concatMap((result) =>
        from(queryRunner.commitTransaction()).pipe(map(() => result)),
      ),
      catchError((error) =>
        from(queryRunner.rollbackTransaction()).pipe(
          concatMap(() => throwError(() => error)),
        ),
      ),
      finalize(() => {
        void queryRunner.release();
      }),
    );
  }
}
