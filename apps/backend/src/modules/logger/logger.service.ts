import { Injectable, LoggerService } from '@nestjs/common';
import * as winston from 'winston';
import { loggerConfig } from './logger.config';

export type LogMessage = {
  statusCode: number;
  method: string;
  url: string;
  query?: string;
  body?: string;
  headers?: string;
};

@Injectable()
export class AppLoggerService implements LoggerService {
  private logger: winston.Logger;
  constructor() {
    this.logger = winston.createLogger(loggerConfig);
  }

  log(message: string, optionalParam?: unknown): void {
    this.logger.info(message, optionalParam);
  }

  error(message: string, optionalParam?: unknown): void {
    const formattedParam = optionalParam
      ? JSON.stringify(optionalParam, null, 2)
      : '';
    this.logger.error(`${message} ${formattedParam}`);
  }

  warn(message: string, optionalParam?: unknown): void {
    this.logger.warn(message, optionalParam);
  }

  apiLog(logMessage: LogMessage): void {
    const levelLog: string =
      logMessage.statusCode < 400
        ? 'info'
        : logMessage.statusCode < 500
          ? 'warn'
          : 'error';
    const messageLog = `[${levelLog}] ${logMessage.statusCode} - [${logMessage.method}] ${logMessage.url} - Query: ${logMessage.query}, Body: ${logMessage.body}, Headers: ${logMessage.headers}`;
    this.logger[levelLog](messageLog);
  }

  onModuleDestroy() {
    this.logger.close();
  }
}
