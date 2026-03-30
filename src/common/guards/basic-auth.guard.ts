import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

/**
 * BasicAuthGuard (common/guards)
 *
 * A reusable Basic Auth guard that reads credentials from environment variables
 * via ConfigService. Intended to protect administrative or internal routes.
 *
 * The guard decodes the Authorization header and compares credentials against
 * ADMIN_USER and ADMIN_PASS from the .env file.
 *
 * Usage:
 *   @UseGuards(BasicAuthGuard)
 *   @Get('/protected-route')
 *   someMethod() { ... }
 *
 * Future extension: swap credential lookup for a database query or external
 * identity provider without changing the guard interface.
 */
@Injectable()
export class BasicAuthGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse();
    const authHeader = request.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Basic ')) {
      response.setHeader('WWW-Authenticate', 'Basic realm="Admin Panel"');
      throw new UnauthorizedException('Missing or invalid Authorization header');
    }

    const base64Credentials = authHeader.slice('Basic '.length);
    const decoded = Buffer.from(base64Credentials, 'base64').toString('utf-8');
    const colonIndex = decoded.indexOf(':');

    if (colonIndex === -1) {
      response.setHeader('WWW-Authenticate', 'Basic realm="Admin Panel"');
      throw new UnauthorizedException('Malformed Basic Auth credentials');
    }

    const username = decoded.slice(0, colonIndex);
    const password = decoded.slice(colonIndex + 1);

    const expectedUser = this.configService.get<string>('ADMIN_USER');
    const expectedPass = this.configService.get<string>('ADMIN_PASS');

    if (username !== expectedUser || password !== expectedPass) {
      response.setHeader('WWW-Authenticate', 'Basic realm="Admin Panel"');
      throw new UnauthorizedException('Invalid credentials');
    }

    return true;
  }
}
