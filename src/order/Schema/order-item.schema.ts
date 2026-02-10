import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class OrderItemProp extends Document {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'OrderProp',
    required: true,
  })
  order_id: Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProductProp',
    required: true,
  })
  product_id: Types.ObjectId;

  @Prop({
    type: Number,
    required: true,
  })
  quantity: number;

  @Prop({
    type: Number,
    required: true,
  })
  price: number;
}

export const OrderItemSchema = SchemaFactory.createForClass(OrderItemProp);
