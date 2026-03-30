import { Request } from 'express';

/**
 * Extended Express Request that includes an authenticated user payload.
 *
 * Populated by BasicAuthGuard (or any future auth strategy) so downstream
 * handlers can access the identity without re-parsing the auth header.
 */
export interface RequestWithUser extends Request {
  user?: {
    username: string;
  };
}
