import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppLoggerService } from './logger.service';
import { ConfigStoreService } from './config-store.service';
import { LoggerConfigEntity } from './logger-config.entity';

/**
 * LoggerModule
 *
 * @Global — decorated so that AppLoggerService is available everywhere.
 * Now it also exposes ConfigStoreService so the Admin module can update the config.
 */
@Global()
@Module({
  imports: [TypeOrmModule.forFeature([LoggerConfigEntity])],
  providers: [AppLoggerService, ConfigStoreService],
  exports: [AppLoggerService, ConfigStoreService],
})
export class LoggerModule {}
