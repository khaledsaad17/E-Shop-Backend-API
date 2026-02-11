import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class UpdateUserInfoDto {
  @ApiProperty({ example: 'test user1' })
  @IsString()
  @MinLength(6)
  name: string;
}
