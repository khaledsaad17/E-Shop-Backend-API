import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class RefreshTokenProp extends Document {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserProp',
    required: true,
  })
  user_id: Types.ObjectId;

  @Prop({
    type: String,
    unique: true,
    required: true,
  })
  token: string;

  @Prop({
    type: Date,
    required: true,
  })
  expires_at: Date;
}

export const RefreshTokenSchema =
  SchemaFactory.createForClass(RefreshTokenProp);
