import {
  Body,
  ConflictException,
  Controller,
  Get,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { ManyProductsDto, ProductDto } from 'src/products/DTO/product.dto';
import { SkipAuth } from 'src/auth/Decorator/skip-auth.decorator';
import { ProductsService } from 'src/products/products.service';
import { Role } from 'src/auth/Decorator/role.decorator';
import { roleUser } from 'src/Role/role.enum';
import { GetUser } from 'src/auth/Decorator/get-user-info.decorator';
import * as jwtPayloadInterface from '../auth/DTO/jwt-payload.interface';
import { UpdateUserInfoDto } from './DTO/update-profile.dto';
import { UpdateUserPasswordDto } from './DTO/change-password.dto';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly productsService: ProductsService,
  ) {}

  /**
   * admin endpoints
   *
   */
  // insert one porduct
  //   @UseGuards(AddProductGuard)
  @SkipAuth(true)
  @Role(roleUser.admin)
  @Post('/admin/Products')
  addProducts(@Body() body: ProductDto) {
    console.log(body);
    // return body;

    return this.productsService.addOneProduct(body);
  }

  // for insert many products at once
  @SkipAuth(true)
  @Post('/admin/many/Products')
  addManyProducts(@Body() body: ManyProductsDto) {
    return this.productsService.addManyProducts(body.products);
  }

  /**
   * normal user endpoints
   */
  @Get('/profile')
  async returnProfileInfo(@GetUser() user: jwtPayloadInterface.Payload) {
    const name = await this.usersService.getUserProfile(user.id);
    return { name, id: user.id, email: user.email, role: user.role };
  }

  //update user profile information
  @Put('/profile')
  updateUserProfileInfo(
    @Body() body: UpdateUserInfoDto,
    @GetUser() user: jwtPayloadInterface.Payload,
  ) {
    return this.usersService.updateUserInfo(body.name, user.id);
  }

  // change password
  @Put('/password')
  changeUserPasswrd(
    @Body() body: UpdateUserPasswordDto,
    @GetUser() user: jwtPayloadInterface.Payload,
  ) {
    // here check first that not passwords are equal
    if (body.currentPassword === body.newPassword)
      throw new ConflictException(
        'can not accept that new password equal to old one',
      );
    return this.usersService.updateUserPassword(
      body.currentPassword,
      body.newPassword,
      user.id,
    );
  }
}
