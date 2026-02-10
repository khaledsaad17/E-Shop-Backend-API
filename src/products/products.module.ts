import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductProp, ProductSchema } from './Schema/Product.shema';
import { AddProductGuard } from './add-product.guard';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: ProductProp.name,
        schema: ProductSchema,
      },
    ]),
  ],
  controllers: [ProductsController],
  providers: [ProductsService, AddProductGuard],
  exports: [ProductsService, AddProductGuard, MongooseModule],
})
export class ProductsModule {}
