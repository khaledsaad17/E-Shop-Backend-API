import { IsNotEmpty, IsString, IsStrongPassword } from 'class-validator';

export class ResetPassword {
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsNotEmpty()
  @IsStrongPassword()
  newPassword: string;
}
