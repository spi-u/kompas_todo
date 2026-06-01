import { ConflictException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { registerMockTransactionHost } from '../../test/mock-transaction-host';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';

jest.mock('bcrypt');

describe('UsersService', () => {
  let service: UsersService;
  const repository = { findByEmail: jest.fn(), create: jest.fn() };

  beforeAll(() => registerMockTransactionHost());

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: UsersRepository, useValue: repository },
      ],
    }).compile();
    service = module.get(UsersService);
  });

  it('rejects an already registered email', async () => {
    repository.findByEmail.mockResolvedValue({ id: '1' });
    await expect(
      service.register({ email: 'a@a.com', password: 'password123' }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(repository.create).not.toHaveBeenCalled();
  });

  it('hashes the password and creates the user', async () => {
    repository.findByEmail.mockResolvedValue(null);
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
    repository.create.mockResolvedValue({ id: '1', email: 'a@a.com' });

    const user = await service.register({
      email: 'a@a.com',
      password: 'password123',
    });

    expect(repository.create).toHaveBeenCalledWith({
      email: 'a@a.com',
      passwordHash: 'hashed',
    });
    expect(user).toEqual({ id: '1', email: 'a@a.com' });
  });
});
