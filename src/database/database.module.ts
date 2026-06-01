import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.getOrThrow<string>('database.url'),
        autoLoadEntities: true,
        synchronize: false,
        migrationsRun: false,
        migrations: [join(__dirname, 'migrations', '*.js')],
      }),
    }),
  ],
})
export class DatabaseModule {}
