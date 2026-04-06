import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsIn,
  IsObject,
} from 'class-validator';

/**
 * CreateLogDto
 *
 * Validates the body of POST /log.
 *
 * Fields:
 *   - level:    Log severity. Defaults to 'info' when omitted.
 *   - message:  Human-readable log message. Required.
 *   - context:  Identifies the module/service that generated the log.
 *   - meta:     Arbitrary key-value pairs for structured context (e.g., userId).
 *
 * class-validator decorators enforce shape at the controller boundary.
 * class-transformer (via ValidationPipe) converts the plain JSON body into
 * a proper class instance before reaching the service.
 */
export class CreateLogDto {
  @IsOptional()
  @IsIn(['error', 'warn', 'info', 'http', 'verbose', 'debug'], {
    message: 'level must be one of: error, warn, info, http, verbose, debug',
  })
  level?: string = 'info';

  @IsString()
  @IsNotEmpty({ message: 'message must not be empty' })
  message: string;

  @IsOptional()
  @IsString()
  context?: string;

  @IsOptional()
  @IsObject({ message: 'meta must be a plain object' })
  meta?: Record<string, unknown>;
}
