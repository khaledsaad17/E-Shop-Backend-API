import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

/**
 * here i do not use @ApiProperty() because this used in add product only by admin and i remove admin panle
 */
export class ProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @Type(() => Number)
  @IsNotEmpty()
  price: number;

  @IsString()
  @IsNotEmpty()
  category: string;

  @Type(() => Number)
  @IsNotEmpty()
  @Min(0)
  stock: number;

  @IsString()
  @IsNotEmpty()
  image: string;

  @IsOptional()
  @Type(() => Number)
  rating?: number = 0;

  @IsOptional()
  @Type(() => Number)
  reviews?: number = 0;
}
export class ManyProductsDto {
  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => ProductDto)
  products: ProductDto[];
}
