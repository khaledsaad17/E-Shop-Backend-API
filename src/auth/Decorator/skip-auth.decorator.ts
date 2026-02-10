// import { SetMetadata } from '@nestjs/common';
// export const SkipAuth = () => SetMetadata(IS_PUBLIC_ROUTE, true);

import { Reflector } from '@nestjs/core';

export const SkipAuth = Reflector.createDecorator<boolean>();
