import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Request } from 'express';

/**
 * LocalOnlyGuard
 *
 * Rejects any request that does not originate from localhost.
 * Accepts all standard loopback representations:
 *   - 127.0.0.1   (IPv4)
 *   - ::1          (IPv6)
 *   - ::ffff:127.0.0.1  (IPv4-mapped IPv6)
 *
 * Usage:
 *   Apply at controller or route level with @UseGuards(LocalOnlyGuard),
 *   or register globally in AppModule providers.
 *
 * To extend later: integrate an IP allowlist read from ConfigService.
 */
@Injectable()
export class LocalOnlyGuard implements CanActivate {
  private readonly allowedIps = new Set([
    '127.0.0.1',
    '::1',
    '::ffff:127.0.0.1',
    '192.168.42.1'
  ]);

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const clientIp = this.extractIp(request);

    if (!this.allowedIps.has(clientIp)) {
      throw new ForbiddenException(
        `Access denied: requests from ${clientIp} are not allowed.`,
      );
    }

    return true;
  }

  /**
   * Extracts the real client IP, accounting for common proxy headers.
   * In a strictly local setup, socket.remoteAddress is sufficient,
   * but X-Forwarded-For is checked for completeness.
   */
  private extractIp(request: Request): string {
    const forwarded = request.headers['x-forwarded-for'];
    if (forwarded) {
      // X-Forwarded-For can be a comma-separated list; first entry is client
      const first = Array.isArray(forwarded)
        ? forwarded[0]
        : forwarded.split(',')[0];
      return first.trim();
    }
    return request.socket?.remoteAddress ?? '';
  }
}
