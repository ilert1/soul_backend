import * as winston from 'winston';
import 'winston-daily-rotate-file';

export const loggerConfig = {
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.json(),
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize({ all: true }),
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.printf(
          ({ timestamp, message }) => `${String(timestamp)} ${String(message)}`,
        ),
      ),
    }),
    new winston.transports.DailyRotateFile({
      dirname: 'logs',
      filename: 'api-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxFiles: '14',
    }),
  ],
};
