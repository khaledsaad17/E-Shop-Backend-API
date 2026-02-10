import { Reflector } from '@nestjs/core';
import { roleUser } from 'src/Role/role.enum';

export const Role = Reflector.createDecorator<roleUser>();
