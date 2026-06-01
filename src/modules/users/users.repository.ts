import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) {}

  findByEmail(email: string, manager?: EntityManager) {
    return this.scope(manager).findOne({ where: { email } });
  }

  findById(id: string, manager?: EntityManager) {
    return this.scope(manager).findOne({ where: { id } });
  }

  create(data: Pick<User, 'email' | 'passwordHash'>, manager?: EntityManager) {
    const repository = this.scope(manager);
    const user = repository.create(data);
    return repository.save(user);
  }

  private scope(manager?: EntityManager): Repository<User> {
    return manager ? manager.getRepository(User) : this.repository;
  }
}
