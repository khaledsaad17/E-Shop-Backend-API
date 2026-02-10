import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Model } from 'mongoose';
import { CartItemProp } from './Schema/cart-item.schema';
import { InjectModel } from '@nestjs/mongoose';
import { ProductProp } from 'src/products/Schema/Product.shema';

@Injectable()
export class CartItemService {
  constructor(
    /**
     * identitfy cart database
     */
    @InjectModel(CartItemProp.name)
    private readonly cartItemModel: Model<CartItemProp>,

    /**
     * identifiy products database
     */
    @InjectModel(ProductProp.name)
    private readonly productModel: Model<ProductProp>,
  ) {}

  /**
   * get cart item goods
   */
  async getCartItemGoods(user_id: string) {
    // here i do not need to make a validation in user_id because i get it from jwt token
    const cartItem = await this.cartItemModel
      .find({ user_id })
      .populate('product_id');
    return cartItem;
  }

  /**
   * add goods to cart item
   */
  async addGoodsItem(product_id: string, quantity: number, user_id: string) {
    // check product stock availability
    const isProductAvailable = await this.productModel
      .findOne({
        _id: product_id,
      })
      .select('stock -_id');
    if (!isProductAvailable || isProductAvailable.stock < quantity) {
      console.log(`product with this id ${product_id} is out of stock`);
      throw new BadRequestException('Not enough stock available');
    }

    //check if product is aleardy in cart then update quantity
    const cartItem = await this.cartItemModel
      .findOneAndUpdate(
        { product_id, user_id },
        { $inc: { quantity } },
        {
          new: true,
          upsert: true, // ينشئ لو مش موجود
          runValidators: true,
        },
      )
      .populate('product_id');
    return cartItem;
  }

  /**
   * update quantity
   */
  async updateQuantity(itemId: string, quantity: number, user_id: string) {
    // first check if this is real item or not
    const isItem = await this.cartItemModel
      .findOneAndUpdate({ _id: itemId, user_id }, { quantity }, { new: true })
      .populate('product_id');
    if (!isItem) {
      console.log('this item id invalid');
      throw new NotFoundException('this item id invalid');
    }
    console.log(isItem);
    return isItem;
  }

  /**
   * remove item from cart item database
   */
  async removeItem(itemId: string, user_id: string) {
    // check if item is exist in cart or not
    const isItem = await this.cartItemModel.findOneAndDelete(
      {
        _id: itemId,
        user_id,
      },
      { new: true },
    );
    if (!isItem) {
      console.log('this item id invalid');
      throw new NotFoundException('this item id invalid');
    }
    return [];
  }

  /**
   * remove all item from user cart
   */
  async removeAllItemFormUserCart(user_id: string) {
    // check if userhave item or not
    const isUserHaveItem = await this.cartItemModel.deleteMany({ user_id });
    if (!isUserHaveItem) {
      console.log('this user cart aleardy empty');
      throw new NotFoundException('this user cart aleardy empty');
    }
    return [];
  }
}
