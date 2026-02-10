import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsPhoneNumber,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateOrderDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  fullName: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  street: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  state: string;

  @IsNotEmpty()
  @Type(() => Number)
  zipCode: number;

  @IsString()
  @IsNotEmpty()
  country: string;

  @IsNotEmpty()
  @IsPhoneNumber('EG')
  phone: number;
}
