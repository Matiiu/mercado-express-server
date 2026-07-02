import { ConflictException, BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { PRODUCT_MESSAGES } from '@/common/constants/messages.constants';
import { Prisma } from '@prisma-client';

import { CreateProductDto } from '@/products/dto/create-product.dto';
import { ProductsRepository } from '@/products/products.repository';
import { ProductsService } from '@/products/products.service';
import { FindProductsDto } from '@/products/dto/find-products.dto';
import {
  DEFAULT_PAGINATION_LIMIT,
  DEFAULT_PAGINATION_PAGE,
} from '@/common/constants/pagination.contants';

describe('ProductsService', () => {
  let service: ProductsService;
  let repository: { create: jest.Mock; findMany: jest.Mock; count: jest.Mock };

  const dto: CreateProductDto = {
    name: 'Agua Mineral 500ml',
    sku: 'BEB001',
    category: 'Bebidas',
    price: 1500,
    minStock: 50,
    supplier: 'Distribuidora Andina',
  };

  const prismaProduct = {
    id: '1',
    ...dto,
    price: new Prisma.Decimal(1500),
    currentStock: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const meta = {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  };

  beforeEach(async () => {
    repository = { create: jest.fn(), findMany: jest.fn(), count: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [ProductsService, { provide: ProductsRepository, useValue: repository }],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('creates a product and maps the Decimal price to a number', async () => {
      repository.create.mockResolvedValue(prismaProduct);

      const result = await service.create(dto);

      expect(repository.create).toHaveBeenCalledWith(dto);
      expect(result.price).toBe(1500);
      expect(typeof result.price).toBe('number');
    });

    it('throws ConflictException when the sku already exists (Prisma P2002)', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
        code: 'P2002',
        clientVersion: 'test',
      });
      repository.create.mockRejectedValue(prismaError);

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
      await expect(service.create(dto)).rejects.toThrow(PRODUCT_MESSAGES.SKU_CONFLICT(dto.sku));
    });

    it('rethrows unexpected errors', async () => {
      const unexpectedError = new Error('boom');
      repository.create.mockRejectedValue(unexpectedError);

      await expect(service.create(dto)).rejects.toThrow(unexpectedError);
    });
  });

  describe('findMany', () => {
    it('returns the mapped list of products', async () => {
      repository.findMany.mockResolvedValue([prismaProduct]);
      repository.count.mockResolvedValue(1);
      const filter: FindProductsDto = { category: 'Bebidas', page: 1, limit: 10 };

      const result = await service.findMany(filter);

      expect(repository.findMany).toHaveBeenCalledWith(filter, 1, 10);
      expect(result).toEqual({
        products: [{ ...prismaProduct, price: 1500 }],
        meta: { ...meta, total: 1, totalPages: 1 },
      });
    });

    it('returns an empty list of products with meta when there are no matches', async () => {
      repository.findMany.mockResolvedValue([]);
      repository.count.mockResolvedValue(0);

      const result = await service.findMany({});

      expect(result).toEqual({ products: [], meta });
    });

    it('applies the default pagination when no pagination is provided', async () => {
      repository.findMany.mockResolvedValue([]);
      repository.count.mockResolvedValue(0);

      await service.findMany({});

      expect(repository.findMany).toHaveBeenCalledWith(
        {},
        DEFAULT_PAGINATION_PAGE,
        DEFAULT_PAGINATION_LIMIT,
      );
    });

    it('throws BadRequestException when stockMin is greater than stockMax', async () => {
      const filter: FindProductsDto = { stockMin: 10, stockMax: 5 };

      await expect(service.findMany(filter)).rejects.toThrow(BadRequestException);
      await expect(service.findMany(filter)).rejects.toThrow(
        PRODUCT_MESSAGES.STOCK_MIN_GREATER_THAN_MAX,
      );
    });
  });
});
