import { Injectable } from '@nestjs/common';
import { ConfigStoreService } from '../../../infrastructure/logger/config-store.service';
import { AppLoggerService } from '../../../infrastructure/logger/logger.service';
import { UpdateConfigDto } from '../dto/update-config.dto';

/**
 * AdminService
 *
 * Reads config safely from SQLite and triggers hot-reloads on AppLoggerService
 * without downtime.
 */
@Injectable()
export class AdminService {
  constructor(
    private readonly configStore: ConfigStoreService,
    private readonly loggerManager: AppLoggerService,
  ) {}

  /**
   * Returns current config from SQLite
   */
  async getConfig() {
    return this.configStore.getConfig();
  }

  /**
   * Updates configuration in SQLite, then forces the logger to seamlessly swap its instances
   * to respect the updated config without killing Node. 
   */
  async updateConfig(dto: UpdateConfigDto) {
    const updatedEntity = await this.configStore.updateConfig(dto);

    // Trigger Hot Reload securely dropping old buffers to disk without dropping pending logs
    this.loggerManager.reloadConfig({
      logDir: updatedEntity.logDir,
      logFilePattern: updatedEntity.logFilePattern,
      logDatePattern: updatedEntity.logDatePattern,
      logLevel: updatedEntity.logLevel,
      logMaxSize: updatedEntity.logMaxSize,
      logMaxFiles: updatedEntity.logMaxFiles,
      logZippedArchive: updatedEntity.logZippedArchive,
      logArchiveDirPattern: updatedEntity.logArchiveDirPattern,
    });

    return updatedEntity;
  }
}
