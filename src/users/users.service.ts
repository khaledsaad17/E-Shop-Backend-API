import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Model } from 'mongoose';
import { UserProp } from './Schema/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(UserProp.name) private readonly userModel: Model<UserProp>,
  ) {}

  //   get user porfile information
  async getUserProfile(user_id: string) {
    const user = await this.userModel.findOne({ _id: user_id });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user?.username;
  }

  //update user profile information
  async updateUserInfo(name: string, user_id: string) {
    // update user from mongoose database
    const userUpdated = await this.userModel.findOneAndUpdate(
      { _id: user_id },
      { username: name },
      { new: true },
    );
    return {
      id: userUpdated?._id,
      email: userUpdated?.email,
      name,
    };
  }
  async updateUserPassword(currPass: string, newPass: string, user_id: string) {
    // first check that the current password is correct
    const isUser = await this.userModel.findOne({ _id: user_id });
    if (!isUser) throw new BadRequestException('User not found');

    /**
     * now check if password is correct or not
     */
    const value: boolean = await bcrypt.compare(currPass, isUser.password_hash);
    if (!value) {
      throw new BadRequestException('Current password is incorrect');
    }
    // now hash the new pass and update it in database
    const password_hash = await bcrypt.hash(newPass, 10);
    const updatedUser = await this.userModel.updateOne(
      { _id: user_id },
      { password_hash },
    );
    console.log(updatedUser);

    if (updatedUser.modifiedCount === 1) {
      return { message: 'Password changed successfully' };
    }
    throw new InternalServerErrorException();
  }
}
