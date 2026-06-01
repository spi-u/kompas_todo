import { config } from 'dotenv';
import { join } from 'path';
import { DataSource } from 'typeorm';

config();

const ext = __filename.endsWith('.ts') ? 'ts' : 'js';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DB_URL ?? 'postgres://todo:todo@localhost:5432/todo',
  entities: [join(__dirname, '..', `**/*.entity.${ext}`)],
  migrations: [join(__dirname, '..', `database/migrations/*.${ext}`)],
  synchronize: false,
});
