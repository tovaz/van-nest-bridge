/**
 * ConfigResponseDto
 *
 * Shape of the response returned by GET /admin/config.
 * Exposes only the relevant log configuration — never exposes credentials
 * or internal implementation details.
 *
 * Using a dedicated DTO (instead of returning the raw ConfigService values)
 * keeps the contract explicit and makes future changes easy to reason about.
 */
export class ConfigResponseDto {
  port: number;
  host: string;
  logDir: string;
  logFilePattern: string;
  logDatePattern: string;
  logLevel: string;
  logMaxSize: string;
  logMaxFiles: string;
}
