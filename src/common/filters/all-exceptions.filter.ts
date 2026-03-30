import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger
} from '@nestjs/common';

/**
 * AllExceptionsFilter
 *
 * Catches all unhandled exceptions thrown during HTTP requests.
 * Provides a highly resilient failover to prevent the server from crashing due
 * to runtime exceptions inside request handlers.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  // Use standard NestJS console logger, avoiding Winston entirely
  private readonly logger = new Logger('AllExceptionsFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.message
        : 'Internal server error';

    // Log the exception using standard console, WITHOUT polluting Winston disk files
    this.logger.error(`Exception on ${request.url}: ${message}`, exception instanceof Error ? exception.stack : undefined);

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    });
  }
}
