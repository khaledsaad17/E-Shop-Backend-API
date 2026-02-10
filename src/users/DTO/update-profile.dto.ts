import { IsString, MinLength } from 'class-validator';

export class UpdateUserInfoDto {
  @IsString()
  @MinLength(6)
  name: string;
}
