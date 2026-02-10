import { Module } from '@nestjs/common';
import { CartItemController } from './cart-item.controller';
import { CartItemService } from './cart-item.service';
import { MongooseModule } from '@nestjs/mongoose';
import { CartItemProp, CartItemSchema } from './Schema/cart-item.schema';
import { ProductsModule } from 'src/products/products.module';

@Module({
  imports: [
    ProductsModule,
    MongooseModule.forFeature([
      { name: CartItemProp.name, schema: CartItemSchema },
    ]),
  ],
  controllers: [CartItemController],
  providers: [CartItemService],
  exports: [MongooseModule],
})
export class CartItemModule {}
