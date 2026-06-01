import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { registerMockTransactionHost } from '../../test/mock-transaction-host';
import { Task } from './entities/task.entity';
import { TaskStatus } from './enums/task-status.enum';
import { TasksRepository } from './tasks.repository';
import { TasksService } from './tasks.service';

describe('TasksService', () => {
  let service: TasksService;
  const repository = {
    create: jest.fn(),
    findById: jest.fn(),
    save: jest.fn(),
    findAndCountActive: jest.fn(),
  };

  beforeAll(() => registerMockTransactionHost());

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: TasksRepository, useValue: repository },
      ],
    }).compile();
    service = module.get(TasksService);
  });

  it('creates a task with defaults and owner', async () => {
    repository.create.mockResolvedValue({ id: '1' });
    await service.create('owner-1', { title: 'T' });
    expect(repository.create).toHaveBeenCalledWith({
      title: 'T',
      description: null,
      status: TaskStatus.Todo,
      ownerId: 'owner-1',
    });
  });

  it('findOne throws when missing', async () => {
    repository.findById.mockResolvedValue(null);
    await expect(service.findOne('x')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('update rejects an archived task with 409', async () => {
    repository.findById.mockResolvedValue({ id: '1', archivedAt: new Date() });
    await expect(
      service.update('1', { status: TaskStatus.Done }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(repository.save).not.toHaveBeenCalled();
  });

  it('archive rejects an already archived task with 409', async () => {
    repository.findById.mockResolvedValue({ id: '1', archivedAt: new Date() });
    await expect(service.archive('1')).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it('findAll builds pagination meta', async () => {
    repository.findAndCountActive.mockResolvedValue([[{ id: '1' }], 3]);
    const result = await service.findAll('owner-1', {
      page: 1,
      limit: 2,
    } as never);
    expect(result.meta).toEqual({
      total: 3,
      page: 1,
      limit: 2,
      totalPages: 2,
    });
  });

  it('isExpired reflects the retention window', () => {
    const old = new Date();
    old.setDate(old.getDate() - 8);
    expect(service.isExpired({ archivedAt: old } as Task)).toBe(true);
    expect(service.isExpired({ archivedAt: null } as Task)).toBe(false);
  });
});
