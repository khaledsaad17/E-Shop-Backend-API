/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { createParamDecorator } from '@nestjs/common';

export const GetUser = createParamDecorator((data: unknown, context) => {
  // مجبر اعمل any علشان ع حسب كل متصفح ال requset بتاعوا بيبقى عامل ازاى
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const req: any = context.switchToHttp().getRequest();
  return req.user.currentUser;
});
