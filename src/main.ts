import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { join } from 'path';

/**
 * Bootstrap the NestJS application.
 *
 * Includes global failover listeners to prevent node from exiting on Uncaught Exceptions
 * and Unhandled Rejections, making the local service virtually unstoppable.
 */
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // === CORS ===
  app.enableCors({
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['*'],
    credentials: true,
  });

  // === MVC Handlebars Setup ===
  app.setBaseViewsDir(join(process.cwd(), 'src', 'views'));
  app.setViewEngine('hbs');
  app.set('view options', { layout: 'layouts/main' });

  // --- Resilience (Failover) Hooks ---
  // Ensure that no random unhandled Promise or Exception kills the Node process.
  // We attach them early so we catch everything. They will log to stdout initially,
  // but if Winston is available, we could pipe them (actually Winston is capturing exceptions
  // globally as configured in winston.config.ts, but these ensure process.exit(1) is avoided).
  process.on('uncaughtException', (err) => {
    console.error('[Failover] Caught global unhandled exception:', err);
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error('[Failover] Caught global unhandled rejection at:', promise, 'reason:', reason);
  });

  // --- Global Validation Pipe ---
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const configService = app.get(ConfigService);
  const host = configService.get<string>('HOST', '127.0.0.1');
  const port = configService.get<number>('PORT', 3000);

  await app.listen(port, host);
  console.log(`[van-nest-bridge] Server running on http://${host}:${port}`);
}

bootstrap();
