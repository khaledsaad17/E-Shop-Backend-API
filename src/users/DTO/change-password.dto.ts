import { IsNotEmpty, IsStrongPassword } from 'class-validator';

export class UpdateUserPasswordDto {
  @IsNotEmpty()
  @IsStrongPassword()
  currentPassword: string;

  @IsNotEmpty()
  @IsStrongPassword()
  newPassword: string;
}
