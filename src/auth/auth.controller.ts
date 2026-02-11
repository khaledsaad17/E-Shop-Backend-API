/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Body, Controller, Get, Post, Res, UseGuards } from '@nestjs/common';
import { RegisterUserDto } from 'src/users/DTO/user-register.dto';
import { AuthService } from './auth.service';
import { LoginUserDto } from 'src/users/DTO/user-login.dto';
import { ConfigService } from '@nestjs/config';
import { GetUser } from './Decorator/get-user-info.decorator';
import * as jwtPayloadInterface from './DTO/jwt-payload.interface';
import { SkipAuth } from './Decorator/skip-auth.decorator';
import { AuthGuard } from '@nestjs/passport';
import { ResetPassword } from './DTO/reset-password.dto';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authSerivce: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @SkipAuth(true)
  @Post('/register')
  registerUser(@Body() body: RegisterUserDto) {
    console.log(body);

    return this.authSerivce.createUser(body.email, body.password, body.name);
  }

  @SkipAuth(true)
  @Post('login')
  loginUser(@Body() body: LoginUserDto) {
    return this.authSerivce.login(body.email, body.password);
  }

  @SkipAuth(true)
  @Get('/google')
  @UseGuards(AuthGuard('googleAuth'))
  googleAuth() {}

  @SkipAuth(true)
  @UseGuards(AuthGuard('googleAuth'))
  @Get('google/callback')
  async googleAuthRedirect(
    @GetUser() user: jwtPayloadInterface.Payload,
    @Res({ passthrough: true }) res,
  ) {
    const { accessToken, refreshToken } =
      await this.authSerivce.handleGoogleLogin(
        user.email,
        user.username,
        user.picture || 'non',
      );
    const fronEndUrl = this.configService.get<string>('FRONTEND_URL')!;
    const redirectUrl = new URL(fronEndUrl);

    redirectUrl.searchParams.set(
      'accessToken',
      decodeURIComponent(accessToken),
    );
    redirectUrl.searchParams.set(
      'refreshToken',
      decodeURIComponent(refreshToken),
    );

    res.redirect(redirectUrl.toString());
  }

  @SkipAuth(true)
  @Post('/refresh')
  refreshTokenMethod(@Body('refreshToken') body: string) {
    return this.authSerivce.generateAccessToken(body);
  }

  @SkipAuth(true)
  @Post('forgot-password')
  sendResetMail(@Body('email') body: string) {
    return this.authSerivce.sendEmailWithToken(body);
  }

  @SkipAuth(true)
  @Post('/reset-password')
  resetPassword(@Body() body: ResetPassword) {
    return this.authSerivce.resetPassword(body.token, body.newPassword);
  }

  @ApiBearerAuth()
  @Post('/logout')
  logoutUser(@GetUser() user: jwtPayloadInterface.Payload) {
    return this.authSerivce.reomoveUserRefreshToken(user.id);
  }

  @ApiBearerAuth()
  @Get('/me')
  getCurrentUser(@GetUser() user: jwtPayloadInterface.Payload) {
    return user;
  }

  // // @SkipAuth(false)
  // @UseGuards(JwtTokenAuthGuard)
  // @Get('/test')
  // testing(@GetUser() user: jwtPayloadInterface.Payload) {
  //   console.log(user);

  //   return { message: 'this for test protected routes', currentUser: user };
  // }
}
