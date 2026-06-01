import { ConflictException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { EntityManager } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  private readonly saltRounds = 10;

  constructor(private readonly usersRepository: UsersRepository) {}

  async register(dto: CreateUserDto, manager?: EntityManager): Promise<User> {
    const existing = await this.usersRepository.findByEmail(dto.email, manager);
    if (existing) {
      throw new ConflictException('already_registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, this.saltRounds);

    return this.usersRepository.create(
      { email: dto.email, passwordHash },
      manager,
    );
  }

  findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findByEmail(email);
  }

  findById(id: string): Promise<User | null> {
    return this.usersRepository.findById(id);
  }
}
