/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types } from 'mongoose';

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    versionKey: false,
    transform: (_: any, ret: any) => {
      ret.id = ret._id.toString();
      delete ret._id;
      return ret;
    },
  },
})
export class CartItemProp extends Document {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserProp',
    required: true,
  })
  user_id: Types.ObjectId;

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
}

export const CartItemSchema = SchemaFactory.createForClass(CartItemProp);

/**
 * this for make the user_id and product_id not doublecated in database
 */
CartItemSchema.index(
  { user_id: 1, product_id: 1 },
  { unique: true, name: 'unique_user_product' },
);
