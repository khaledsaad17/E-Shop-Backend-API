import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserProp, UserShema } from 'src/users/Schema/user.schema';
import {
  RefreshTokenProp,
  RefreshTokenSchema,
} from './schema/refresh-token.schema';
import {
  PasswordResetProp,
  PasswordResetSchema,
} from './schema/password-reset-token.schema';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtTokenAuthGuard } from './jwt-token-auth.guard';
import { APP_GUARD } from '@nestjs/core';
import { JwtTokenAuthStrategy } from './Strategies/jwt-token-auth-strategy';
import { GoogleStrategy } from './Strategies/google-auth.strategy';
import { MailService } from './mail.service';

@Module({
  imports: [
    // mongoose create collections
    MongooseModule.forFeature([
      { name: UserProp.name, schema: UserShema },
      { name: RefreshTokenProp.name, schema: RefreshTokenSchema },
      { name: PasswordResetProp.name, schema: PasswordResetSchema },
    ]),
    // jwt configuration
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        global: true,
        secret: configService.get<string>('SECERET_KEY'),
        signOptions: { expiresIn: '5m' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtService,
    JwtTokenAuthStrategy,
    GoogleStrategy,
    MailService,
    {
      provide: APP_GUARD,
      useClass: JwtTokenAuthGuard,
    },
  ],
  exports: [MongooseModule],
})
export class AuthModule {}
