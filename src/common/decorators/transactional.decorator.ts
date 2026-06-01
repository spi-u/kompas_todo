import { UseInterceptors, applyDecorators } from '@nestjs/common';
import { TransactionInterceptor } from '../interceptors/transaction.interceptor';

export function Transactional() {
  return applyDecorators(UseInterceptors(TransactionInterceptor));
}
