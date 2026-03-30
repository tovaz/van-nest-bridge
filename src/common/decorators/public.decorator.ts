import { SetMetadata } from '@nestjs/common';

/**
 * Public decorator
 *
 * Marks a route handler as publicly accessible, allowing guards that
 * check for this metadata to skip their checks.
 *
 * Usage:
 *   @Public()
 *   @Get('/health')
 *   healthCheck() { ... }
 *
 * Guards should check:
 *   const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
 *     context.getHandler(),
 *     context.getClass(),
 *   ]);
 *   if (isPublic) return true;
 */
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
