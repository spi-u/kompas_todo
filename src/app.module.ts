import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { getDataSourceToken } from '@nestjs/typeorm';
import { ClsPluginTransactional } from '@nestjs-cls/transactional';
import { TransactionalAdapterTypeOrm } from '@nestjs-cls/transactional-adapter-typeorm';
import { ClsModule } from 'nestjs-cls';
import { AppController } from './app.controller';
import { AppConfigModule } from './config/app-config.module';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    AppConfigModule,
    DatabaseModule,
    ClsModule.forRoot({
      global: true,
      guard: { mount: true },
      plugins: [
        new ClsPluginTransactional({
          imports: [DatabaseModule],
          adapter: new TransactionalAdapterTypeOrm({
            dataSourceToken: getDataSourceToken(),
          }),
        }),
      ],
    }),
    ScheduleModule.forRoot(),
    UsersModule,
    AuthModule,
    TasksModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
