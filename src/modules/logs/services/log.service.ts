import { Injectable } from '@nestjs/common';
import { AppLoggerService } from '../../../infrastructure/logger/logger.service';
import { CreateLogDto } from '../dto/create-log.dto';

/**
 * LogService
 *
 * Contains the business logic for the logs feature.
 * The controller delegates all work here — it never touches the logger directly.
 *
 * Responsibilities:
 * - Accept a validated CreateLogDto from the controller.
 * - Delegate the actual write to AppLoggerService (Winston).
 * - Return a structured response so the caller knows what was recorded.
 *
 * Future extensions:
 * - Emit events for external subscribers (EventEmitter2).
 * - Queue high-volume logs via Bull/BullMQ.
 * - Filter or redact sensitive fields in meta before writing.
 */
@Injectable()
export class LogService {
  constructor(private readonly appLogger: AppLoggerService) {}

  /**
   * Writes a structured log entry through Winston.
   *
   * @param dto - Validated log entry from the HTTP request body.
   * @returns Acknowledgement object with the recorded level and message.
   */
  writeLog(dto: CreateLogDto): {
    success: boolean;
    recorded: { level: string; message: string };
  } {
    const level = dto.level ?? 'info';

    this.appLogger.log(level, dto.message, dto.context, dto.meta);

    return {
      success: true,
      recorded: {
        level,
        message: dto.message,
      },
    };
  }
}
