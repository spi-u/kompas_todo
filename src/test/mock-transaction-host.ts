import { TransactionHost } from '@nestjs-cls/transactional';

export function registerMockTransactionHost(): void {
  const host = new TransactionHost({ connectionName: undefined } as never);
  host.withTransaction = ((...args: unknown[]) => {
    const run = args[args.length - 1] as () => unknown;
    return run();
  }) as typeof host.withTransaction;
}
