import { Type } from 'class-transformer';
import { IsMongoId, IsNotEmpty } from 'class-validator';

export class ItemCarDto {
  @IsNotEmpty()
  @IsMongoId()
  productId: string;

  @IsNotEmpty()
  @Type(() => Number)
  quantity: number;
}
