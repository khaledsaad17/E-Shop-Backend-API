import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsMongoId, IsNotEmpty } from 'class-validator';

export class ItemCarDto {
  @ApiProperty({ example: '6986515a2486e7a0075ef5aa' })
  @IsNotEmpty()
  @IsMongoId()
  productId: string;

  @ApiProperty({ example: '2' })
  @IsNotEmpty()
  @Type(() => Number)
  quantity: number;
}
