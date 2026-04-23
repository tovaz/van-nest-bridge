import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { LoggerConfigEntity } from './logger-config.entity';

/**
 * ConfigStoreService
 *
 * Handles persistent storage of logger configuration in SQLite.
 * On application start, if the DB is empty, it populates it with values from .env
 * ensuring a safe fallback.
 */
@Injectable()
export class ConfigStoreService {
  constructor(
    @InjectRepository(LoggerConfigEntity)
    private readonly configRepo: Repository<LoggerConfigEntity>,
    private readonly envConfig: ConfigService,
  ) { }


  /**
   * Reads the current configuration from SQLite.
   */
  async getConfig(): Promise<LoggerConfigEntity> {
    const config = await this.configRepo.findOne({ where: { id: 1 } });
    if (!config) {
      // Fallback safety net (though onModuleInit should guarantee it exists)
      return this.ensureConfigExists();
    }
    return config;
  }

  /**
   * Updates the configuration and saves it to the SQLite file.
   */
  async updateConfig(
    updates: Partial<Omit<LoggerConfigEntity, 'id'>>,
  ): Promise<LoggerConfigEntity> {
    let config = await this.configRepo.findOne({ where: { id: 1 } });
    if (!config) {
      config = await this.ensureConfigExists();
    }

    Object.assign(config, updates);
    return this.configRepo.save(config);
  }

  /**
   * Ensures row ID 1 exists. If not, reads from .env and inserts.
   */
  private async ensureConfigExists(): Promise<LoggerConfigEntity> {
    const existing = await this.configRepo.findOne({ where: { id: 1 } });
    if (existing) return existing;

    const newConfig = this.configRepo.create({
      id: 1,
      logDir: this.envConfig.get<string>('LOG_DIR', 'C:\\VAN_RUN\\logsangular'),
      logFilePattern: this.envConfig.get<string>('LOG_FILE_PATTERN', 'van-front-%DATE%.log'),
      logDatePattern: this.envConfig.get<string>('LOG_DATE_PATTERN', 'MM-DD-YYYY'),
      logLevel: this.envConfig.get<string>('LOG_LEVEL', 'info'),
      logMaxSize: this.envConfig.get<string>('LOG_MAX_SIZE', '10m'),
      logMaxFiles: this.envConfig.get<string>('LOG_MAX_FILES', '30d'),
      logZippedArchive: this.envConfig.get<boolean>('LOG_ZIPPED_ARCHIVE', true),
      logArchiveDirPattern: this.envConfig.get<string>('LOG_ARCHIVE_DIR_PATTERN', 'YYYY-MM'),
    });

    try {
      return await this.configRepo.save(newConfig);
    } catch (e: any) {
      if (e.code === 'SQLITE_CONSTRAINT') {
        const existingNow = await this.configRepo.findOne({ where: { id: 1 } });
        if (existingNow) return existingNow;
      }
      throw e;
    }
  }
}
