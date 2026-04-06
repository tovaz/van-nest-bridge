import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { LogService } from '../services/log.service';
import { CreateLogDto } from '../dto/create-log.dto';
import { LocalOnlyGuard } from '../../../common/guards/local-only.guard';

/**
 * LogController
 *
 * Exposes the public log ingestion endpoint:
 *   POST /api/log
 *
 * Guards applied:
 *   - LocalOnlyGuard: ensures the request originates from localhost.
 *
 * The controller's only job is to receive the validated DTO and hand it
 * to LogService. No business logic lives here.
 *
 * To add Basic Auth protection to this endpoint in the future, simply add
 * BasicAuthGuard to the @UseGuards() decorator list:
 *   @UseGuards(LocalOnlyGuard, BasicAuthGuard)
 *
 * All API endpoints are grouped under the /api prefix.
 *
 * Example request:
 *   POST http://127.0.0.1:3000/api/log
 *   Content-Type: application/json
 *   {
 *     "level": "info",
 *     "message": "User logged in",
 *     "context": "AuthModule",
 *     "meta": { "userId": 1 }
 *   }
 */
@Controller('api/log')
@UseGuards(LocalOnlyGuard)
export class LogController {
  constructor(private readonly logService: LogService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createLogDto: CreateLogDto) {
    return this.logService.writeLog(createLogDto);
  }
}
