import { Entity, PrimaryColumn, Column } from 'typeorm';

/**
 * LoggerConfigEntity
 *
 * Stores the active configuration for the Winston logger.
 * Since this is a single-tenant local configuration, we only need one row (id: 1).
 */
@Entity('logger_config')
export class LoggerConfigEntity {
  @PrimaryColumn()
  id: number = 1;

  @Column({ default: 'C:\\VAN_RUN\\logsangular' })
  logDir: string;

  @Column({ default: 'van-front-%DATE%.log' })
  logFilePattern: string;

  @Column({ default: 'MM-DD-YYYY' })
  logDatePattern: string;

  @Column({ default: 'info' })
  logLevel: string;

  @Column({ default: '10m' })
  logMaxSize: string;

  @Column({ default: '30d' })
  logMaxFiles: string;

  @Column({ default: true })
  logZippedArchive: boolean;

  @Column({ default: 'YYYY-MM' })
  logArchiveDirPattern: string;
}
