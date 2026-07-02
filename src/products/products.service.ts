import { ConflictException, Injectable, BadRequestException, Logger } from '@nestjs/common';

import { PRODUCT_MESSAGES } from '@/common/constants/messages.constants';
import { PrismaErrorCode } from '@/common/enums/prisma-error-code.enum';
import { toNumber } from '@/common/utils/decimal.util';
import { Prisma, type Product as PrismaProduct } from '@prisma-client';
import { CreateProductDto } from '@/products/dto/create-product.dto';
import { Product } from '@/products/entities/product.entity';
import { ProductsRepository } from '@/products/products.repository';
import { ProductWithPagination } from '@/products/interfaces/products.interface';
import {
  DEFAULT_PAGINATION_LIMIT,
  DEFAULT_PAGINATION_PAGE,
} from '@/common/constants/pagination.contants';
import { paginationMeta } from '@/common/utils/pagination.util';
import { FindProductsDto } from '@/products/dto/find-products.dto';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(private readonly productsRepository: ProductsRepository) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    try {
      const product = await this.productsRepository.create(createProductDto);
      return this.toEntity(product);
    } catch (error) {
      if (this.isSkuConflict(error)) {
        throw new ConflictException(PRODUCT_MESSAGES.SKU_CONFLICT(createProductDto.sku));
      }
      const message =
        process.env.NODE_ENV === 'production' ? 'Error creating product' : error.message;
      this.logger.error(message, error);
      throw error;
    }
  }

  async findMany(filter: FindProductsDto): Promise<ProductWithPagination> {
    const {
      page = DEFAULT_PAGINATION_PAGE,
      limit = DEFAULT_PAGINATION_LIMIT,
      stockMin,
      stockMax,
    } = filter;

    if (stockMin !== undefined && stockMax !== undefined && stockMin > stockMax) {
      throw new BadRequestException(PRODUCT_MESSAGES.STOCK_MIN_GREATER_THAN_MAX);
    }

    const [products, total] = await Promise.all([
      this.productsRepository.findMany(filter, page, limit),
      this.productsRepository.count(filter),
    ]);

    return {
      products: products.map((product) => this.toEntity(product)),
      meta: paginationMeta(total, page, limit),
    };
  }

  private isSkuConflict(error: unknown): boolean {
    return (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === (PrismaErrorCode.UNIQUE_CONSTRAINT_VIOLATION as string)
    );
  }

  private toEntity(product: PrismaProduct): Product {
    return { ...product, price: toNumber(product.price) };
  }
}
