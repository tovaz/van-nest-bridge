import { Controller, Get, Post, Body, UseGuards, Res, Render } from '@nestjs/common';
import { AdminService } from '../services/admin.service';
import { LocalOnlyGuard } from '../../../common/guards/local-only.guard';
import { BasicAuthGuard } from '../../../common/guards/basic-auth.guard';
import { UpdateConfigDto } from '../dto/update-config.dto';

/**
 * AdminController
 *
 * Protected Routes:
 *   - GET /admin         : Renders HTML UI (Public to localhost so the SPA login loads).
 *   - GET /admin/config  : Legacy JSON endpoint (Guarded).
 *   - POST /admin/config : Validates and updates DB, triggering a hot reload (Guarded).
 */
@Controller('admin')
@UseGuards(LocalOnlyGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get()
  @Render('admin/dashboard')
  async getDashboard() {
      // Pass the SQLite object to Handlebars directly into specific input tags
      const config = await this.adminService.getConfig();
      return { 
          config, 
          // Raw string stringified for the <script> session variables without custom Hbs helpers
          configJson: JSON.stringify(config) 
      };
  }

  @Get('config')
  @UseGuards(BasicAuthGuard)
  async getRawConfig() {
    return this.adminService.getConfig();
  }

  @Post('config')
  @UseGuards(BasicAuthGuard)
  async saveConfig(@Body() body: UpdateConfigDto) {
    // Global validation pipe ensures `body` meets UpdateConfigDto rules
    return this.adminService.updateConfig(body);
  }
}
