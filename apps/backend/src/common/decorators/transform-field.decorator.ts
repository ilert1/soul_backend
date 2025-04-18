import { SetMetadata } from '@nestjs/common';

export const TRANSFORM_FIELD_KEY = 'transformField';
export const TransformField = (fieldToDtoMap: Record<string, any>) =>
  SetMetadata(TRANSFORM_FIELD_KEY, fieldToDtoMap);
