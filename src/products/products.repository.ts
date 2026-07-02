import { Injectable } from '@nestjs/common';

import { PrismaClientOrTx } from '@/common/types/prisma-client.type';
import { PrismaService } from '@/prisma/prisma.service';
import { Prisma, AlertStatus, Product } from '@prisma-client';

import { CreateProductDto } from './dto/create-product.dto';
import { ProductFilterDto } from './dto/product-filter.dto';

@Injectable()
export class ProductsRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateProductDto): Promise<Product> {
    return this.prisma.product.create({ data });
  }

  findMany(filter: ProductFilterDto, page: number, limit: number): Promise<Product[]> {
    return this.prisma.product.findMany({
      where: this.buildWhere(filter),
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  count(filter: ProductFilterDto): Promise<number> {
    return this.prisma.product.count({
      where: this.buildWhere(filter),
    });
  }

  findById(id: string, client: PrismaClientOrTx = this.prisma): Promise<Product | null> {
    return client.product.findUnique({ where: { id } });
  }

  updateStock(
    id: string,
    currentStock: number,
    client: PrismaClientOrTx = this.prisma,
  ): Promise<Product> {
    return client.product.update({ where: { id }, data: { currentStock } });
  }

  private buildWhere(filter: ProductFilterDto): Prisma.ProductWhereInput {
    const { category, supplier, activeAlert, stockMin, stockMax } = filter;

    const where: Prisma.ProductWhereInput = {};

    if (category) where.category = { equals: category, mode: 'insensitive' };
    if (supplier) where.supplier = { equals: supplier, mode: 'insensitive' };

    if (activeAlert) {
      where.alerts = { some: { status: AlertStatus.ACTIVA } };
    }

    if (stockMin !== undefined || stockMax !== undefined) {
      where.currentStock = {
        ...(stockMin !== undefined ? { gte: stockMin } : {}),
        ...(stockMax !== undefined ? { lte: stockMax } : {}),
      };
    }

    return where;
  }
}
