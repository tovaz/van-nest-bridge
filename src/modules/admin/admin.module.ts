import { Module } from '@nestjs/common';
import { AdminController } from './controllers/admin.controller';
import { AuthController } from './controllers/auth.controller';
import { AdminService } from './services/admin.service';

/**
 * AdminModule
 *
 * Encapsulates all administrative features, such as the GET /admin/config
 * endpoint.
 *
 * Guards used by AdminController (LocalOnlyGuard, BasicAuthGuard) do not
 * need to be registered here because they are purely functional classes
 * instantiated by NestJS when the @UseGuards() decorator is evaluated.
 * BasicAuthGuard does depend on ConfigService, but ConfigModule is global
 * so it resolves automatically.
 */
@Module({
  controllers: [AdminController, AuthController],
  providers: [AdminService],
})
export class AdminModule {}
