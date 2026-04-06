import { Module } from '@nestjs/common';
import { LogController } from './controllers/log.controller';
import { LogService } from './services/log.service';

/**
 * LogsModule
 *
 * Encapsulates everything related to log ingestion:
 *   - LogController: HTTP surface (POST /log)
 *   - LogService:    Business logic, delegates to AppLoggerService
 *
 * AppLoggerService is injected automatically because LoggerModule is @Global.
 * No need to import LoggerModule here.
 *
 * LocalOnlyGuard is applied at the controller level. Since it has no external
 * dependencies, it does not need to be registered as a provider here; NestJS
 * will instantiate it on demand.
 */
@Module({
  controllers: [LogController],
  providers: [LogService],
})
export class LogsModule {}
