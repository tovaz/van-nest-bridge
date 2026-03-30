import { IsString, IsNotEmpty } from 'class-validator';

/**
 * UpdateConfigDto
 *
 * Validates the data sent from the Admin configuration panel.
 * Class-validator ensures empty strings or malicious payloads do not 
 * corrupt the SQLite database and logger instance.
 */
export class UpdateConfigDto {
  @IsString()
  @IsNotEmpty({ message: 'Log Directory is required' })
  logDir: string;

  @IsString()
  @IsNotEmpty({ message: 'Log File Pattern is required' })
  logFilePattern: string;

  @IsString()
  @IsNotEmpty({ message: 'Log Date Pattern is required' })
  logDatePattern: string;

  @IsString()
  @IsNotEmpty({ message: 'Log Level is required' })
  logLevel: string;

  @IsString()
  @IsNotEmpty({ message: 'Max Size is required' })
  logMaxSize: string;

  @IsString()
  @IsNotEmpty({ message: 'Max Files retention is required' })
  logMaxFiles: string;
}
