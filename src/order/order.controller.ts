import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { OrderService } from './order.service';
import { GetUser } from 'src/auth/Decorator/get-user-info.decorator';
import * as jwtPayloadInterface from '../auth/DTO/jwt-payload.interface';
import { OrderFilterDto } from './DTO/order-filter.dto';
import { MongoIdDto } from 'src/cart-item/DTO/mongo-id.dto';
import { CreateOrderDto } from './DTO/create-order.dto';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  /**
   * create a new order from user`s cart
   */
  @Post()
  createOrder(
    @Body('shippingAddress') Body: CreateOrderDto,
    @GetUser() user: jwtPayloadInterface.Payload,
  ) {
    return this.orderService.makeOrder(Body, user.id, user.email);
  }

  /**
   * get one order details item
   */
  @Get(':id')
  getOneOrder(
    @Param() orderId: MongoIdDto,
    @GetUser() user: jwtPayloadInterface.Payload,
  ) {
    return this.orderService.getOneOrderInfo(orderId.id, user.id);
  }

  /**
   * get all orders for authenticated user
   */
  @Get()
  getAllOrders(
    @Param() filters: OrderFilterDto,
    @GetUser() user: jwtPayloadInterface.Payload,
  ) {
    return this.orderService.getAllUserOrders(filters, user.id);
  }
}
