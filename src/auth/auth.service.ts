/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserProp } from 'src/users/Schema/user.schema';
import { Payload } from './DTO/jwt-payload.interface';
import { ConfigService } from '@nestjs/config';
import bcrypt from 'bcrypt';
import { RefreshTokenProp } from './schema/refresh-token.schema';
import { PasswordResetProp } from './schema/password-reset-token.schema';
import { MailService } from './mail.service';

@Injectable()
export class AuthService {
  constructor(
    /**
     * identify password reset database collection
     */
    @InjectModel(PasswordResetProp.name)
    private readonly passwordResetModel: Model<PasswordResetProp>,
    /**
     * identify refresh token collection to be used
     */
    @InjectModel(RefreshTokenProp.name)
    private readonly refreshTokenModel: Model<RefreshTokenProp>,

    /**
     * here we identify our mongoose database
     */
    @InjectModel(UserProp.name) private readonly userModel: Model<UserProp>,

    /**
     * this for identify jwtService for create salt and token
     */
    private readonly jwtService: JwtService,

    /**
     * this for config evnironment variable
     */
    private readonly configService: ConfigService,

    /**
     *confirm mail service
     */
    private readonly mailService: MailService,
  ) {}

  /**
   * this function controle user registeration and getrate jwt& refresh token and hashing password
   * and also the unique process of emails
   */
  async createUser(
    email: string,
    password: string,
    username: string,
    picture: string = 'test',
  ) {
    try {
      // hasing password
      const password_hash: string = await bcrypt.hash(password, 10);

      //  create function automatic make save to database
      const newUser = await this.userModel.create({
        email,
        password_hash,
        username,
        avatar: picture,
      });
      const id: string = newUser._id.toString();
      console.log(newUser);

      const payload: Payload = { username, email, id, role: newUser.role };
      console.log(payload);

      //call generate jwt token
      const { accessToken, refreshToken } = await this.jwtGenToken(payload);

      /**
       * store refresh token in token database collection
       */
      await this.refreshTokenModel.create({
        user_id: newUser._id,
        token: refreshToken,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      return {
        accessToken,
        refreshToken,
        user: {
          id: payload.id,
          email: payload.email,
          avatar:
            'https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=800&q=80',
          name: payload.username,
        },
      };
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('this email is already exist');
      } else {
        console.log(error);
        throw new InternalServerErrorException();
      }
    }
  }

  async login(email: string, password: string) {
    /**
     * first check if email exitst or not
     */
    const isExistUser = await this.userModel.findOne({ email });
    console.log(isExistUser);

    if (!isExistUser) {
      console.log(isExistUser);

      throw new UnauthorizedException('Invalid credentials');
    }
    /**
     * now check if password is correct or not
     */

    const value: boolean = await bcrypt.compare(
      password,
      isExistUser.password_hash,
    );
    if (!value) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: Payload = {
      username: isExistUser.username,
      email,
      role: isExistUser.role,
      id: isExistUser._id.toString(),
    };
    /**
     * generate jwt tokens
     */
    const { accessToken, refreshToken } = await this.jwtGenToken(payload);

    /**
     * check if user inforation in system or not then
     * store refresh token in token database collection
     */
    const isHaveRefreshToken = await this.refreshTokenModel.findOne({
      user_id: isExistUser._id,
    });
    if (isHaveRefreshToken) {
      await this.refreshTokenModel.updateOne(
        { user_id: isExistUser._id },
        {
          token: refreshToken,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      );
    } else {
      await this.refreshTokenModel.create({
        user_id: isExistUser._id.toString(),
        token: refreshToken,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });
    }

    return {
      accessToken,
      refreshToken,
      user: payload,
    };
  }

  async jwtGenToken(payload: Payload) {
    /**
     * below will generate access token jwt
     */

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('SECERET_KEY'),
      expiresIn: '1h',
    });
    console.log('this is access token ', accessToken);

    // here generate refresh token
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('RefreshTokenSecret'),
      expiresIn: '30d',
    });
    console.log('this is refresh token ', refreshToken);

    return { accessToken, refreshToken };
  }

  /**
   * handle google auth login and register
   */
  async handleGoogleLogin(email: string, username: string, picture: string) {
    // check if email exist in database
    const userExist = await this.userModel.findOne({ email });

    // if not exist we are going to create one for him using create method that i build
    if (!userExist) {
      return await this.createUser(email, 'defaultPass', username, picture);
    }

    const id: string = userExist._id.toString();
    const payload: Payload = { username, email, id, role: userExist.role };
    const { accessToken, refreshToken } = await this.jwtGenToken(payload);

    return {
      accessToken,
      refreshToken,
      user: payload,
    };
  }

  /**
   * generate the access token using refresh token
   */
  async generateAccessToken(refreshToken: string) {
    // first check if token is valid or not
    const refToken = await this.refreshTokenModel.findOne({
      token: refreshToken,
    });
    if (!refToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (refToken.expires_at < new Date()) {
      console.log('Invalid refresh token');
      throw new UnauthorizedException('Invalid refresh token');
    }
    // get payload data from token itself by using decode method
    const { email, id, username } = await this.jwtService.decode(refreshToken);
    // genereate access token
    const newAccessToken = await this.jwtService.signAsync(
      { email, id, username },
      {
        secret: this.configService.get<string>('SECERET_KEY'),
        expiresIn: '1h',
      },
    );

    return { accessToken: newAccessToken };
  }

  async sendEmailWithToken(email: string) {
    // check if the email is exist or not
    const isUser = await this.userModel.findOne({ email });
    if (!isUser) {
      throw new ConflictException(
        'this email is not registered yet please try to sign up',
      );
    }
    // check the user is have an reset token before or not
    const isHaveResetToken = await this.passwordResetModel.findOne({
      user_id: isUser._id,
    });
    // generate token to use it in reset password
    const resetToken = await this.jwtService.signAsync(
      { email },
      {
        secret: this.configService.get<string>('RESET_PASSWORD_SECRET'),
        expiresIn: '1h',
      },
    );

    if (!isHaveResetToken) {
      await this.passwordResetModel.create({
        user_id: isUser._id,
        token: resetToken,
        expires_at: new Date(Date.now() + 60 * 60 * 1000),
      });
    } else {
      await this.passwordResetModel.updateOne(
        {
          user_id: isUser._id,
        },
        {
          used: false,
          token: resetToken,
          expires_at: new Date(Date.now() + 60 * 60 * 1000),
        },
      );
    }
    console.log('this is token collection vlaue = ', resetToken);
    // send mail to user with link to reset password
    const fronEndUrl = this.configService.get<string>('FRONTEND_URL')!;
    const resetLink = `${fronEndUrl}/reset-password?token=${resetToken}`;
    const sendMail = await this.mailService.sendResetMail(email, resetLink);
    console.log('this is send mail vlaue = ', sendMail);
    if (sendMail) {
      return {
        message: 'Password reset email sent',
      };
    }
  }

  /**
   * reset password method
   */
  async resetPassword(token: string, newPassword: string) {
    // verify if token valid or not
    const isExist = await this.passwordResetModel.findOne({ token });
    if (!isExist || isExist.expires_at < new Date()) {
      throw new BadRequestException('Invalid or expired token');
    }

    // check if token is used befor or not
    if (isExist?.used === true) {
      throw new BadRequestException(' token are used before ');
    }

    // hashing new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    await this.userModel.findByIdAndUpdate(isExist.user_id, {
      password_hash: newPasswordHash,
    });

    // update database that this token is used
    await this.passwordResetModel.updateOne(
      {
        _id: isExist._id,
      },
      { used: true },
    );

    return {
      message: 'Password reset successful',
    };
  }

  /**
   * logout user
   */
  async reomoveUserRefreshToken(id: string) {
    // check if id have token or not
    const isExistToken = await this.refreshTokenModel.findOne({ user_id: id });
    console.log(
      'this is value of searching for token in database = ',
      isExistToken,
    );

    if (!isExistToken) {
      throw new BadRequestException('Invalid token');
    }
    const removeToken = await this.refreshTokenModel.deleteOne({
      _id: isExistToken._id,
    });
    console.log('this value removed', removeToken);
    return {
      message: 'Logged out successfully',
    };
  }
}
