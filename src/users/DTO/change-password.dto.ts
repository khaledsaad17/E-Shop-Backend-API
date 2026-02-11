import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsStrongPassword } from 'class-validator';

export class UpdateUserPasswordDto {
  @ApiProperty({ example: 'Test123***' })
  @IsNotEmpty()
  @IsStrongPassword()
  currentPassword: string;

  @ApiProperty({ example: 'Test456***' })
  @IsNotEmpty()
  @IsStrongPassword()
  newPassword: string;
}
