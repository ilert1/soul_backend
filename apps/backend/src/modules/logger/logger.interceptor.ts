import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { AppLoggerService, LogMessage } from './logger.service';
import * as onFinished from 'on-finished';

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
  private readonly logger: AppLoggerService;
  constructor(logger: AppLoggerService) {
    this.logger = logger;
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const { method, url, query, body, headers } = request;

    onFinished(response, () => {
      try {
        const statusCode: number = Number(response.statusCode);
        const logMessage: LogMessage = {
          statusCode,
          method: method.toString(),
          url: url.toString(),
          query: query ? JSON.stringify(query) : '{}',
          body: body ? JSON.stringify(body) : '{}',
          headers: headers ? JSON.stringify(headers) : '{}',
        };
        this.logger.apiLog(logMessage);
      } catch (error) {
        this.logger.error('Error during API logging processing', error);
      }
    });

    return next.handle();
  }
}
