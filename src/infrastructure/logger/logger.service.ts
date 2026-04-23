import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import * as winston from 'winston';
import { createWinstonLogger, WinstonConfigPayload } from './winston.config';
import { ConfigStoreService } from './config-store.service';

/**
 * AppLoggerService
 *
 * Wraps a Winston logger instance.
 * On init, it fetches from SQLite. It exposes a reloadConfig() method to
 * swap out the underlying winston instance gracefully.
 */
@Injectable()
export class AppLoggerService implements OnModuleInit, OnModuleDestroy {
  // We initialize a fallback console logger until SQLite config bounds
  private logger: winston.Logger = winston.createLogger({
    transports: [new winston.transports.Console()],
  });

  // Tracks the last applied config to detect which fields actually changed
  private currentConfig: WinstonConfigPayload | null = null;

  constructor(private readonly configStore: ConfigStoreService) {}

  async onModuleInit() {
    const config = await this.configStore.getConfig();
    this.reloadConfig(config);
  }

  /**
   * Gracefully reloads the logger config.
   *
   * If only non-structural fields changed (logLevel, logMaxFiles), the existing
   * file transport is kept alive so the in-day rotation counter is preserved.
   * The underlying file-stream-rotator counter is in-memory only (known upstream
   * bug: github.com/rogerc/file-stream-rotator/issues/101), so recreating the
   * transport always resets it to 1.
   *
   * A full transport recreation is triggered only when file-structural config
   * changes (dir, filename pattern, date pattern, size limit, compression, archive dir).
   */
  reloadConfig(newConfig: WinstonConfigPayload): void {
    const isStructuralChange = !this.currentConfig || (
      newConfig.logDir !== this.currentConfig.logDir ||
      newConfig.logFilePattern !== this.currentConfig.logFilePattern ||
      newConfig.logDatePattern !== this.currentConfig.logDatePattern ||
      newConfig.logMaxSize !== this.currentConfig.logMaxSize ||
      newConfig.logZippedArchive !== this.currentConfig.logZippedArchive ||
      newConfig.logArchiveDirPattern !== this.currentConfig.logArchiveDirPattern
    );

    this.currentConfig = newConfig;

    if (isStructuralChange) {
      const oldLogger = this.logger;
      this.logger = createWinstonLogger(newConfig);
      if (oldLogger.transports.length > 1) {
        oldLogger.close();
      }
      console.log('[AppLoggerService] File transport recreated (structural config change).');
    } else {
      // Only level or maxFiles changed — update in-place, no counter reset
      this.logger.level = newConfig.logLevel;
      this.logger.transports.forEach(t => { t.level = newConfig.logLevel; });
      console.log('[AppLoggerService] Log level updated in-place (no transport restart).');
    }
  }

  // ---- Public logging API ----

  error(message: string, context?: string, meta?: Record<string, unknown>): void {
    this.logger.error(message, { context, ...meta });
  }

  warn(message: string, context?: string, meta?: Record<string, unknown>): void {
    this.logger.warn(message, { context, ...meta });
  }

  info(message: string, context?: string, meta?: Record<string, unknown>): void {
    this.logger.info(message, { context, ...meta });
  }

  http(message: string, context?: string, meta?: Record<string, unknown>): void {
    this.logger.http(message, { context, ...meta });
  }

  debug(message: string, context?: string, meta?: Record<string, unknown>): void {
    this.logger.debug(message, { context, ...meta });
  }

  verbose(message: string, context?: string, meta?: Record<string, unknown>): void {
    this.logger.verbose(message, { context, ...meta });
  }

  log(
    level: string,
    message: string,
    context?: string,
    meta?: Record<string, unknown>,
  ): void {
    this.logger.log(level, message, { context, ...meta });
  }

  // ---- Lifecycle ----

  onModuleDestroy(): void {
    this.logger.close();
  }
}
