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

  constructor(private readonly configStore: ConfigStoreService) {}

  async onModuleInit() {
    const config = await this.configStore.getConfig();
    this.reloadConfig(config);
  }

  /**
   * Gracefully swaps the current Winston logger with a new one based on new config.
   * Prevents losing pending logs by closing the old one after binding the new one.
   */
  reloadConfig(newConfig: WinstonConfigPayload): void {
    const oldLogger = this.logger;
    this.logger = createWinstonLogger(newConfig);

    // If it's not the initial fallback shell, we safely flush and close the old transports
    if (oldLogger.transports.length > 1) {
      oldLogger.close();
      console.log('[AppLoggerService] Dynamically reloaded logging configuration.');
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
