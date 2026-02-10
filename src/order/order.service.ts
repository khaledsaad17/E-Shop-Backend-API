/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Connection, Model } from 'mongoose';
import { OrderProp } from './Schema/order.schema';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { OrderFilterDto } from './DTO/order-filter.dto';
import { OrderItemProp } from './Schema/order-item.schema';
import { CartItemProp } from 'src/cart-item/Schema/cart-item.schema';
import { CreateOrderDto } from './DTO/create-order.dto';
import { ProductProp } from 'src/products/Schema/Product.shema';
import { MailConfirmationService } from './mail-order-confirm.service';

@Injectable()
export class OrderService {
  constructor(
    // here i will use transaction to avoid race condtion
    @InjectConnection() private readonly connection: Connection,

    @InjectModel(OrderProp.name) private readonly orderModel: Model<OrderProp>,

    @InjectModel(OrderItemProp.name)
    private readonly orderItemModel: Model<OrderItemProp>,

    /**
     * mail confirmation form
     */
    private readonly mailConfirmationOrder: MailConfirmationService,

    /**
     * declear product database
     */
    @InjectModel(ProductProp.name)
    private readonly productModel: Model<ProductProp>,

    /**
     * declear cart database for make order
     */
    @InjectModel(CartItemProp.name)
    private readonly cartItemModel: Model<CartItemProp>,
  ) {}

  /**
   * make an order
   */
  async makeOrder(
    shippingAddress: CreateOrderDto,
    user_id: string,
    userEmail: string,
  ) {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      // check if user`s cart empty or have items
      const userCartItem = await this.cartItemModel
        .find({ user_id })
        .populate('product_id')
        .session(session);

      if (userCartItem.length === 0) {
        throw new NotFoundException('Cart is empty');
      }

      let total = 0;

      // calculate the total price for every item
      for (const item of userCartItem) {
        const product = item.product_id as any;

        if (item.quantity > product.stock) {
          throw new ConflictException(
            `this product ${product.name} is out of stock`,
          );
        }

        total += product.price * item.quantity;
      }

      const newOrder = await this.orderModel.create(
        [
          {
            user_id,
            total,
            status: 'pending',
            shipping_address: shippingAddress,
          },
        ],
        { session },
      );

      const orderItems = userCartItem.map((item) => {
        const product = item.product_id as any;
        return {
          order_id: newOrder[0]._id,
          product_id: product._id,
          quantity: item.quantity,
          price: product.price,
        };
      });

      const mailItems = userCartItem.map((item) => {
        const product = item.product_id as any;
        return {
          name: product.name,
          price: product.price,
          quantity: item.quantity,
        };
      });
      console.log('this is mailitem info =', mailItems);

      await this.orderItemModel.insertMany(orderItems, { session });

      // خصم stock بطريقة آمنة
      for (const item of userCartItem) {
        const product = item.product_id as any;

        const updateStockValue = await this.productModel.updateOne(
          {
            _id: product._id,
            stock: { $gte: item.quantity },
          },
          {
            $inc: { stock: -item.quantity },
          },
          { session },
        );

        if (updateStockValue.modifiedCount === 0) {
          throw new ConflictException(
            `Product ${product.name} just went out of stock`,
          );
        }
      }

      await this.cartItemModel.deleteMany({ user_id }).session(session);

      await session.commitTransaction();
      await session.endSession();

      // ✉️ send confirmation mail
      try {
        await this.mailConfirmationOrder.sendOrderCreatedMail(
          userEmail,
          shippingAddress.fullName,
          newOrder[0]._id.toString(),
          total,
          mailItems,
        );
      } catch (err) {
        console.error('Failed to send order email', err);
      }

      // return {newOrder[0]};
      return {
        id: newOrder[0]._id,
        userId: newOrder[0].user_id,
        items: userCartItem.map((item) => {
          const product = item.product_id as any;
          return {
            id: item._id,
            product_id: product._id,
            quantity: item.quantity,
            price: product.price,
          };
        }),
        total: newOrder[0].total,
        status: newOrder[0].status,
        shippingAddress: newOrder[0].shipping_address,
        createdAt: newOrder[0].createdAt,
      };
    } catch (error) {
      await session.abortTransaction();
      await session.endSession();
      throw error;
    }
  }

  /**
   * get all auth user orders
   */
  async getAllUserOrders(filters: OrderFilterDto, user_id: string) {
    const { status, page, limit } = filters;
    const query: any = { user_id };

    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;
    console.log(`this is query value = ${JSON.stringify(query)}`);

    const orders = await this.orderModel
      .find(query)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit)
      .lean()
      .exec();

    //   get all order id from orders
    const orderIds = orders.map((o) => o._id);

    // return all item in list of order ids
    const items = await this.orderItemModel
      .find({ order_id: { $in: orderIds } })
      .populate('product_id')
      .lean();

    // collect item with it`s order
    const itemsByOrder = new Map<string, any[]>();

    for (const item of items) {
      const key = item.order_id.toString();
      const arr = itemsByOrder.get(key) ?? [];
      arr.push({
        id: item._id,
        productId: item.product_id?._id ?? item.product_id,
        quantity: item.quantity,
        price: item.price,
        product: item.product_id, // populated product
      });
      itemsByOrder.set(key, arr);
    }

    return orders.map((o) => ({
      id: o._id,
      userId: o.user_id,
      items: itemsByOrder.get(o._id.toString()) ?? [],
      total: o.total,
      status: o.status,
      shippingAddress: o.shipping_address,
      createdAt: o.createdAt,
    }));
  }

  /**
   * Get detailed information about a specific order
   */
  async getOneOrderInfo(orderId: string, user_id: string) {
    const [order, items] = await Promise.all([
      this.orderModel.findOne({ _id: orderId, user_id }).lean(),
      this.orderItemModel
        .find({ order_id: orderId })
        .populate('product_id')
        .lean(),
    ]);
    if (!order) {
      console.log(`order with this id = ${orderId} not found`);
      throw new NotFoundException('Order not found');
    }
    return {
      id: order._id,
      userId: order.user_id,
      items: items.map((item) => ({
        id: item._id,
        productId: item.product_id?._id ?? item.product_id,
        quantity: item.quantity,
        price: item.price,
        product_id: item.product_id,
      })),
      total: order.total,
      status: order.status,
      shippingAddress: order.shipping_address,
      createdAt: order.createdAt,
    };
  }
}
