import * as winston from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Configuration payload for creating a Winston logger instance.
 */
export interface WinstonConfigPayload {
  logDir: string;
  logFilePattern: string;
  logDatePattern: string;
  logLevel: string;
  logMaxSize: string;
  logMaxFiles: string;
}

/**
 * Builds and returns a fully configured Winston logger instance
 * using the provided payload.
 *
 * This no longer depends directly on ConfigService, meaning it can
 * cleanly recreate loggers dynamically when the SQLite config is updated.
 */
export function createWinstonLogger(
  config: WinstonConfigPayload,
): winston.Logger {
  // Resolve the log directory relative to the process working directory
  const resolvedLogDir = path.resolve(process.cwd(), config.logDir);

  // Ensure the directory exists; create it (and parents) if not
  if (!fs.existsSync(resolvedLogDir)) {
    fs.mkdirSync(resolvedLogDir, { recursive: true });
  }

  // --- Formatters ---
  const timestampFormat = winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss',
  });

  const jsonFormat = winston.format.combine(
    timestampFormat,
    winston.format.errors({ stack: true }),
    winston.format.printf(({ timestamp, level, context, message, ...meta }) => {
      // Compact header with core info
      const header = `{\n timestamp: '${timestamp}', context: '${context || ''}', level: '${level}', `;
      // Body with real line breaks for readability
      const body = `\n message: '${message}' \n`;
      // Optional metadata if present
      const extras =
        Object.keys(meta).length > 0
          ? `\n\nextras: ${JSON.stringify(meta, null, 2)}`
          : '';

      return `${header}${body}${extras}}\n\n`; // Double newline for clear block separation
    }),
  );

  const consoleFormat = winston.format.combine(
    timestampFormat,
    winston.format.colorize(),
    winston.format.printf(({ timestamp, level, message, context, ...meta }) => {
      const ctx = context ? `[${context}]` : '';
      const metaStr =
        Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
      return `${timestamp} ${level} ${ctx} ${message}${metaStr}`;
    }),
  );

  // --- Daily Rotate File Transport ---
  const fileTransport = new DailyRotateFile({
    dirname: resolvedLogDir,
    filename: config.logFilePattern,
    datePattern: config.logDatePattern,
    zippedArchive: false, // set to true to GZIP old files
    maxSize: config.logMaxSize,
    maxFiles: config.logMaxFiles,
    format: jsonFormat,
    level: config.logLevel,
  });

  fileTransport.on('rotate', (oldFilename: string, newFilename: string) => {
    // Hook for post-rotation tasks (e.g., ship to S3, notify, etc.)
    console.log(`[Logger] Rotated: ${oldFilename} → ${newFilename}`);
  });

  // --- Console Transport (always on, useful during development) ---
  const consoleTransport = new winston.transports.Console({
    format: consoleFormat,
    level: config.logLevel,
  });

  return winston.createLogger({
    level: config.logLevel,
    transports: [fileTransport, consoleTransport],
  });
}
