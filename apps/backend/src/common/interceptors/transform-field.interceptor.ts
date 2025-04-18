import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { plainToInstance } from 'class-transformer';
import { Reflector } from '@nestjs/core';
import { TRANSFORM_FIELD_KEY } from '../decorators/transform-field.decorator';

interface FieldToDtoMap {
  [key: string]: new () => Record<string, unknown>;
}

@Injectable()
export class TransformFieldInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const fieldToDtoMap = this.reflector.get<FieldToDtoMap>(
      TRANSFORM_FIELD_KEY,
      context.getHandler(),
    );

    if (!fieldToDtoMap) return next.handle();

    return next.handle().pipe(
      map((data) => {
        let transformedData;

        if (this.isPaginatedResponse(data)) {
          // Если ответ с пагинацией
          transformedData = {
            ...data,
            items: data.items.map((item: object) =>
              this.transformItem(item, fieldToDtoMap['']),
            ),
          };
        } else if (Array.isArray(data)) {
          // Если ответ — массив
          transformedData = data.map((item) =>
            this.transformItem(item as object, fieldToDtoMap['']),
          );
        } else {
          // Если ответ — объект
          transformedData = this.transformItem(
            data as object,
            fieldToDtoMap[''],
          );
        }

        return transformedData;
      }),
    );
  }

  private transformItem(item: object, dto: new () => object): object {
    if (!item || typeof item !== 'object') {
      return item;
    }

    if (Array.isArray(item)) {
      return item.map((nestedItem) =>
        this.transformItem(nestedItem as object, dto),
      );
    }

    const transformedItem = plainToInstance(dto, item, {
      excludeExtraneousValues: true,
    });

    Object.keys(transformedItem).forEach((key) => {
      if (transformedItem[key] && typeof transformedItem[key] === 'object') {
        transformedItem[key] = this.transformItem(
          transformedItem[key] as object,
          dto[key] as new () => object,
        );
      }
    });

    return transformedItem;
  }

  private isPaginatedResponse(data: any): boolean {
    return (
      data &&
      typeof data === 'object' &&
      Array.isArray(data.items) &&
      'total' in data &&
      'page' in data &&
      'size' in data &&
      'pages' in data
    );
  }
}
