import { Injectable } from '@nestjs/common';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersRepository {
  constructor(
    private readonly txHost: TransactionHost<TransactionalAdapterTypeOrm>,
  ) {}

  findByEmail(email: string) {
    return this.repository.findOne({ where: { email } });
  }

  findById(id: string) {
    return this.repository.findOne({ where: { id } });
  }

  create(data: Pick<User, 'email' | 'passwordHash'>) {
    const user = this.repository.create(data);
    return this.repository.save(user);
  }

  private get repository(): Repository<User> {
    return this.txHost.tx.getRepository(User);
  }
}
