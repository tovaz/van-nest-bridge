/**
 * Supported log levels — mirrors Winston's built-in npm levels.
 * Restricting the union type ensures the DTO validates against known values.
 */
export type LogLevel = 'error' | 'warn' | 'info' | 'http' | 'verbose' | 'debug';

/**
 * Shape of a structured log entry as stored/processed internally.
 * The DTO (CreateLogDto) maps to this interface, with additional
 * fields added at write time (e.g., timestamp).
 */
export interface LogEntry {
  level: LogLevel;
  message: string;
  context?: string;
  meta?: Record<string, unknown>;
  timestamp?: string;
}
