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
  logZippedArchive: boolean;
  logArchiveDirPattern: string;
}

/**
 * Replaces YYYY, MM, DD tokens in a pattern string with the current date values.
 */
function formatDatePattern(pattern: string): string {
  const now = new Date();
  const yyyy = now.getFullYear().toString();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return pattern.replace('YYYY', yyyy).replace('MM', mm).replace('DD', dd);
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
  // Split extension so the size-rotation counter appears before it (e.g. van-front-2026-04-21.1.log)
  const fileExt = path.extname(config.logFilePattern);                        // e.g. '.log'
  const fileBasename = fileExt
    ? config.logFilePattern.slice(0, -fileExt.length)   // strip extension
    : config.logFilePattern;

  // Use a fixed auditFile path (not hash-based) so state is consistent across reloads
  const auditFile = path.join(resolvedLogDir, '.rotate-audit.json');

  const fileTransport = new DailyRotateFile({
    dirname: resolvedLogDir,
    filename: fileBasename,
    extension: fileExt || undefined,
    datePattern: config.logDatePattern,
    zippedArchive: config.logZippedArchive,
    maxSize: config.logMaxSize,
    maxFiles: config.logMaxFiles,
    auditFile,
    format: jsonFormat,
    level: config.logLevel,
    options: { flags: 'a' },  // append to existing file instead of truncating on restart
  });

  fileTransport.on('rotate', (oldFilename: string, newFilename: string) => {
    console.log(`[Logger] Rotated: ${oldFilename} → ${newFilename}`);

    if (!config.logArchiveDirPattern) return;

    const moveToArchive = () => {
      const archiveDir = path.resolve(
        resolvedLogDir,
        formatDatePattern(config.logArchiveDirPattern),
      );
      if (!fs.existsSync(archiveDir)) {
        fs.mkdirSync(archiveDir, { recursive: true });
      }

      const gzFilename = oldFilename + '.gz';
      let srcFile: string | null = null;
      if (config.logZippedArchive && fs.existsSync(gzFilename)) {
        srcFile = gzFilename;
      } else if (fs.existsSync(oldFilename)) {
        srcFile = oldFilename;
      }

      if (srcFile) {
        const destFile = path.join(archiveDir, path.basename(srcFile));
        try {
          fs.renameSync(srcFile, destFile);
          console.log(`[Logger] Archived: ${srcFile} → ${destFile}`);
        } catch (err) {
          console.error(`[Logger] Archive move failed: ${err}`);
        }
      }
    };

    // Wait briefly for winston-daily-rotate-file to finish writing the .gz file
    if (config.logZippedArchive) {
      setTimeout(moveToArchive, 2000);
    } else {
      moveToArchive();
    }
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
