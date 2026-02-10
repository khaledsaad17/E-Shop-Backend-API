import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { roleUser } from 'src/Role/role.enum';

@Schema({ timestamps: true })
export class UserProp extends Document {
  @Prop({
    type: String,
    required: true,
  })
  username: string;

  @Prop({
    type: String,
    required: true,
    unique: true,
  })
  email: string;

  @Prop({
    type: String,
    required: true,
  })
  password_hash: string;

  @Prop({
    type: String,
    required: true,
    enum: [roleUser.user, roleUser.admin],
    default: roleUser.user,
  })
  role: string;

  @Prop({
    type: String,
    required: true,
  })
  avatar: string;
}

export const UserShema = SchemaFactory.createForClass(UserProp);
