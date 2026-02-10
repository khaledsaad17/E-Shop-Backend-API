import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import { SkipAuth } from './Decorator/skip-auth.decorator';

@Injectable()
export class JwtTokenAuthGuard extends AuthGuard('jwtVerify') {
  /**
   *عنا انت بتكتب بتتحقق من ال routes اذا كانت Public ولا لا وبعدها بتندع على super.canactive(context) علشان يشغل ال passport
   * ويعمل ال verify , decode ويبعت الداتا ل validate method علشان يحطها ف الريكوست
   */
  constructor(private readonly reflector: Reflector) {
    super();
  }
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const skipAuth = this.reflector.getAllAndOverride<boolean>(SkipAuth, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (skipAuth) {
      console.log('this route is public');
      return true;
    }

    // this for make passport work and pass payload of jwt token after decode it
    return super.canActivate(context);
  }
}
