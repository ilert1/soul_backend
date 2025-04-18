import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ResponseHashDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example:
      'fb4408367a17bb403a4834c6507395bb63f87629dfdc9455b561ce2ec4fcd3929fccb43347cb45784eb1abde0b44d0f3',
    description: 'hash с закодированным id пользователя',
  })
  hash: string;
}
