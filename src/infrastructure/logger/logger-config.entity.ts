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

  @Column({ default: './logs' })
  logDir: string;

  @Column({ default: 'app-%DATE%.log' })
  logFilePattern: string;

  @Column({ default: 'YYYY-MM-DD' })
  logDatePattern: string;

  @Column({ default: 'info' })
  logLevel: string;

  @Column({ default: '20m' })
  logMaxSize: string;

  @Column({ default: '30d' })
  logMaxFiles: string;
}
