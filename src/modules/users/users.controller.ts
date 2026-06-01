import { Body, Controller, Post } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { TransactionManager } from '../../common/decorators/transaction-manager.decorator';
import { Transactional } from '../../common/decorators/transactional.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Transactional()
  register(
    @Body() dto: CreateUserDto,
    @TransactionManager() manager: EntityManager,
  ): Promise<User> {
    return this.usersService.register(dto, manager);
  }
}
