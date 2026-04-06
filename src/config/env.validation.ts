import * as Joi from 'joi';

/**
 * Joi validation schema for all required environment variables.
 *
 * This schema is consumed by ConfigModule in app.module.ts.
 * If the app starts with a missing or invalid env var, it will throw
 * immediately with a descriptive message — preventing silent misconfig.
 */
export const envValidationSchema = Joi.object({
  // Server binding
  PORT: Joi.number().integer().min(1).max(65535).default(3000),
  HOST: Joi.string().default('0.0.0.0'),

  // Log file configuration
  LOG_DIR: Joi.string().default('./logs'),
  LOG_FILE_PATTERN: Joi.string().default('app-%DATE%.log'),
  LOG_DATE_PATTERN: Joi.string().default('YYYY-MM-DD'),
  LOG_LEVEL: Joi.string()
    .valid('error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly')
    .default('info'),
  LOG_MAX_SIZE: Joi.string().default('20m'),
  LOG_MAX_FILES: Joi.string().default('30d'),

  // Admin Basic Auth credentials
  ADMIN_USER: Joi.string().min(1).required(),
  ADMIN_PASS: Joi.string().min(1).required(),
});
