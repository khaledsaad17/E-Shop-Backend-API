import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { CartItemService } from './cart-item.service';
import { GetUser } from 'src/auth/Decorator/get-user-info.decorator';
import * as jwtPayloadInterface from '../auth/DTO/jwt-payload.interface';
import { ItemCarDto } from './DTO/item-card.dto';
import { MongoIdDto } from './DTO/mongo-id.dto';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('cart')
export class CartItemController {
  constructor(private readonly cartItemService: CartItemService) {}

  /**
   * get shopping cart of exist user
   */
  @Get()
  getCartItem(@GetUser() user: jwtPayloadInterface.Payload) {
    return this.cartItemService.getCartItemGoods(user.id);
  }

  /**
   * add items to cart
   */
  @Post('/items')
  addItemToCart(
    @Body() body: ItemCarDto,
    @GetUser() user: jwtPayloadInterface.Payload,
  ) {
    return this.cartItemService.addGoodsItem(
      body.productId,
      body.quantity,
      user.id,
    );
  }

  /**
   * update quantity of specific cart item
   */
  @Put('/items/:id')
  updateCartItem(
    @Param() id: MongoIdDto,
    @Body('quantity') quantity: number,
    @GetUser() user: jwtPayloadInterface.Payload,
  ) {
    return this.cartItemService.updateQuantity(id.id, quantity, user.id);
  }

  /**
   * remove item from cart item
   */
  @Delete('/items/:id')
  deleteItem(
    @Param() itemId: MongoIdDto,
    @GetUser() user: jwtPayloadInterface.Payload,
  ) {
    return this.cartItemService.removeItem(itemId.id, user.id);
  }

  /**
   * remove all item from specific user cart
   */
  @Delete()
  removeAllItem(@GetUser() user: jwtPayloadInterface.Payload) {
    return this.cartItemService.removeAllItemFormUserCart(user.id);
  }
}
