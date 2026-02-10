import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class OrderProp extends Document {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserProp',
    required: true,
  })
  user_id: Types.ObjectId;

  @Prop({
    type: Number,
    required: true,
  })
  total: number;

  @Prop({
    type: String,
    required: true,
    default: 'Pending',
  })
  status: string;

  @Prop({
    type: mongoose.Schema.Types.Mixed,
    required: true,
  })
  shipping_address: Record<string, any>;

  createdAt: Date;
  updatedAt: Date;
}

export const OrderSchema = SchemaFactory.createForClass(OrderProp);
