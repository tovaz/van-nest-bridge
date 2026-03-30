import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { APP_FILTER } from '@nestjs/core';
import { join } from 'path';

import { envValidationSchema } from './config/env.validation';
import { LogsModule } from './modules/logs/logs.module';
import { AdminModule } from './modules/admin/admin.module';
import { LoggerModule } from './infrastructure/logger/logger.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { LoggerConfigEntity } from './infrastructure/logger/logger-config.entity';

@Module({
  imports: [
    // 1. Static Configuration fallback
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envValidationSchema,
      validationOptions: { abortEarly: true },
    }),

    // 2. Local persistency layer via SQLite
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'database.sqlite',
      entities: [LoggerConfigEntity],
      synchronize: true, // Auto-create schema (adequate for single-table local config)
    }),

    // 3. Serve static CSS/JS for the frontend admin panel
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      serveRoot: '/public',
    }),

    // 4. Feature and Core Modules
    LoggerModule,
    LogsModule,
    AdminModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}
