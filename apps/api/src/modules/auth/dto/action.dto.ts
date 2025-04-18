import { ApiProperty } from '@nestjs/swagger';
import { ActionType } from '../types/action';
import { IsUUID } from 'class-validator';

export class ActionDto {
  @ApiProperty({
    description: 'Тип действия',
    example: 'REDIRECT_TO_EVENT',
    enum: ActionType,
  })
  actionType?: ActionType;

  @ApiProperty({
    description: 'Уникальный идентификатор события',
    example: '13822722-9cae-477e-ba05-f434d95c63ed',
  })
  @IsUUID()
  eventId?: string;
}
