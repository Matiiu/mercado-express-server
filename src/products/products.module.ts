import { Module } from '@nestjs/common';

import { ProductsController } from '@/products/products.controller';
import { ProductsRepository } from '@/products/products.repository';
import { ProductsService } from '@/products/products.service';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService, ProductsRepository],
  exports: [ProductsRepository],
})
export class ProductsModule {}
