import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsPhoneNumber,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateOrderDto {
  @ApiProperty({ example: 'test user' })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  fullName: string;

  @ApiProperty({ example: 'share3 elmatab' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  street: string;

  @ApiProperty({ example: '6th of October' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ example: 'Giza' })
  @IsString()
  @IsNotEmpty()
  state: string;

  @ApiProperty({ example: '12566' })
  @IsNotEmpty()
  @Type(() => Number)
  zipCode: number;

  @ApiProperty({ example: 'Egypt' })
  @IsString()
  @IsNotEmpty()
  country: string;

  @ApiProperty({ example: '+201128994380' })
  @IsNotEmpty()
  @IsPhoneNumber('EG')
  phone: number;
}
