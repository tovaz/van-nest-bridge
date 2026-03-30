import { Controller, Get, Render, UseGuards } from '@nestjs/common';
import { LocalOnlyGuard } from '../../../common/guards/local-only.guard';

/**
 * AuthController
 *
 * Exclusively responsible for rendering the Login view.
 * The endpoint is public locally, allowing the browser to load the login HTML.
 */
@Controller('admin/login')
@UseGuards(LocalOnlyGuard)
export class AuthController {
  @Get()
  @Render('auth/login')
  getLoginPage() {
    // No context required. The login view just shows a form.
    return {};
  }
}
