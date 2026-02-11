import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsStrongPassword } from 'class-validator';

export class ResetPassword {
  @ApiProperty({ example: 'test@gmail.com' })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({ example: 'Test123*' })
  @IsNotEmpty()
  @IsStrongPassword()
  newPassword: string;
}
