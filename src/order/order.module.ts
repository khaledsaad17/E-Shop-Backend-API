import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { MongooseModule } from '@nestjs/mongoose';
import { OrderProp, OrderSchema } from './Schema/order.schema';
import { OrderItemProp, OrderItemSchema } from './Schema/order-item.schema';
import { CartItemModule } from 'src/cart-item/cart-item.module';
import { ProductsModule } from 'src/products/products.module';
import { MailConfirmationService } from './mail-order-confirm.service';

@Module({
  imports: [
    ProductsModule,
    CartItemModule,
    MongooseModule.forFeature([
      {
        name: OrderProp.name,
        schema: OrderSchema,
      },
      {
        name: OrderItemProp.name,
        schema: OrderItemSchema,
      },
    ]),
  ],
  controllers: [OrderController],
  providers: [OrderService, MailConfirmationService],
})
export class OrderModule {}
