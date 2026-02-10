import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Payload } from '../DTO/jwt-payload.interface';

@Injectable()
export class JwtTokenAuthStrategy extends PassportStrategy(
  Strategy,
  'jwtVerify',
) {
  // the ! for make sure that the value is exist
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('SECERET_KEY')!,
    });
  }

  /**
   * here the validate method is called from passport and pass payload argument that contain the value
   * of jwt token after decode it
   */
  validate(payload: Payload) {
    console.log(
      'this user enterd the system using token and all info is = ',
      payload,
    );

    return { currentUser: payload };
  }
}
