import { Controller, Get, Param, Query } from '@nestjs/common';
import { FiltersProductsDto } from './DTO/Query-filters.interface';
import { ProductsService } from './products.service';
import { SkipAuth } from 'src/auth/Decorator/skip-auth.decorator';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  /**
   * get product categories
   */
  @SkipAuth(true)
  @Get('/categories')
  getAllProductsCategories() {
    return this.productsService.getCategories();
  }
  /**
   * get a specific product information
   */
  @SkipAuth(true)
  @Get('/:id')
  getOneProduct(@Param('id') id: string) {
    console.log(id);

    return this.productsService.getOneProductInfo(id);
  }

  /**
   * get products using filters
   */
  @SkipAuth(true)
  @Get()
  getProductsWithFilters(@Query() filters: FiltersProductsDto) {
    // get product and filter are run perfectlly
    return this.productsService.getProducts(filters);
  }
}
