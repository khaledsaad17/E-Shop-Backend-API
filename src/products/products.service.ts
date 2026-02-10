/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ProductProp } from './Schema/Product.shema';
import { FiltersProductsDto } from './DTO/Query-filters.interface';
import { ProductDto } from './DTO/product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(ProductProp.name)
    private readonly productsModel: Model<ProductProp>,
  ) {}

  /**
   * this for make filteration in products
   */
  async getProducts(filters: FiltersProductsDto) {
    const { category, search, minPrice, maxPrice, page, limit } = filters;

    const query: any = {};

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } }, // the character < i > here for make search for case-insensitive
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = minPrice;
      if (maxPrice) query.price.$lte = maxPrice;
    }

    const skip = (page - 1) * limit;
    console.log(query);

    // 👇 الاتنين مع بعض (أحسن performance)
    const [products, total] = await Promise.all([
      this.productsModel.find(query).skip(skip).limit(limit).exec(),
      this.productsModel.countDocuments(query),
    ]);

    return { products, total, page, totalPages: Math.ceil(total / limit) };
  }

  /**
   * get one specific product
   */
  async getOneProductInfo(id: string) {
    // check database
    try {
      const product = await this.productsModel.findOne({ _id: id });
      if (!product) {
        throw new Error('invalid id');
      }
      return product;
    } catch (error) {
      console.log(error);
      throw new NotFoundException('Product not found');
    }
  }

  /**
   * get all categories
   */
  async getCategories() {
    const allCategories = await this.productsModel.distinct('category');
    return allCategories;
  }

  /**
   * insert one porduct to databse using admin panal
   */
  async addOneProduct(product: ProductDto) {
    const {
      name,
      description,
      price,
      category,
      stock,
      image,
      rating,
      reviews,
    } = product;
    try {
      const insertedProduct = await this.productsModel.create({
        name,
        description,
        price,
        category,
        stock,
        image,
        rating,
        reviews,
      });
      return insertedProduct;
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('this product is already exist');
      } else {
        console.log(error);
        throw new InternalServerErrorException();
      }
    }
  }

  /**
   * this for add many products at once in database
   */
  async addManyProducts(products: ProductDto[]) {
    try {
      const insertProduct = await this.productsModel.insertMany(products, {
        ordered: true,
        throwOnValidationError: true,
      });
      return { products: insertProduct };
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('this product is already exist');
      } else {
        console.log(error);
        throw new InternalServerErrorException();
      }
    }
  }
}
