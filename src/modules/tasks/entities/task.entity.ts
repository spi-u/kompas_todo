import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { TaskStatus } from '../enums/task-status.enum';

@Entity('tasks')
export class Task {
  @ApiProperty({ format: 'uuid', example: '2288508a-6b6b-4450-b9a6-33a33f61c97f' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'Buy milk' })
  @Column()
  title: string;

  @ApiProperty({ nullable: true, example: '2 liters', type: String })
  @Column({ type: 'text', nullable: true })
  description: string | null;

  @ApiProperty({ enum: TaskStatus, example: TaskStatus.Todo })
  @Column({ type: 'enum', enum: TaskStatus, default: TaskStatus.Todo })
  status: TaskStatus;

  @ManyToOne(() => User, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'ownerId' })
  owner: User;

  @ApiProperty({ format: 'uuid' })
  @Column()
  ownerId: string;

  @ApiProperty({ nullable: true, type: String, example: null })
  @Column({ type: 'timestamp', nullable: true })
  archivedAt: Date | null;

  @ApiProperty({ example: '2026-06-01T10:00:00.000Z' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ example: '2026-06-01T10:00:00.000Z' })
  @UpdateDateColumn()
  updatedAt: Date;
}
