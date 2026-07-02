import { Test, TestingModule } from '@nestjs/testing';

import { PrismaService } from '@/prisma/prisma.service';
import { AlertStatus } from '@prisma-client';

import { CreateProductDto } from '@/products/dto/create-product.dto';
import { ProductsRepository } from '@/products/products.repository';

const page = 1;
const limit = 10;

describe('ProductsRepository', () => {
  let repository: ProductsRepository;
  let prisma: {
    product: {
      create: jest.Mock;
      findMany: jest.Mock;
      count: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      product: {
        create: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [ProductsRepository, { provide: PrismaService, useValue: prisma }],
    }).compile();

    repository = module.get<ProductsRepository>(ProductsRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('create', () => {
    it('delegates to prisma.product.create with the dto as data', async () => {
      const dto: CreateProductDto = {
        name: 'Agua Mineral 500ml',
        sku: 'BEB001',
        category: 'Bebidas',
        price: 1500,
        minStock: 50,
        supplier: 'Distribuidora Andina',
      };
      prisma.product.create.mockResolvedValue({ id: '1', ...dto });

      const result = await repository.create(dto);

      expect(prisma.product.create).toHaveBeenCalledWith({ data: dto });
      expect(result).toEqual({ id: '1', ...dto });
    });
  });

  describe('findMany', () => {
    it('builds an empty where clause when no filters are provided', async () => {
      prisma.product.findMany.mockResolvedValue([]);

      await repository.findMany({}, page, limit);

      expect(prisma.product.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      });
    });

    it('filters by category and supplier', async () => {
      prisma.product.findMany.mockResolvedValue([]);

      await repository.findMany(
        {
          category: 'Bebidas',
          supplier: 'Lácteos del Valle',
        },
        page,
        limit,
      );

      expect(prisma.product.findMany).toHaveBeenCalledWith({
        where: {
          category: { equals: 'Bebidas', mode: 'insensitive' },
          supplier: { equals: 'Lácteos del Valle', mode: 'insensitive' },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      });
    });

    it('filters by active alert', async () => {
      prisma.product.findMany.mockResolvedValue([]);

      await repository.findMany({ activeAlert: true }, page, limit);

      expect(prisma.product.findMany).toHaveBeenCalledWith({
        where: { alerts: { some: { status: AlertStatus.ACTIVA } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      });
    });

    it('does not apply the alert filter when activeAlert is false', async () => {
      prisma.product.findMany.mockResolvedValue([]);

      await repository.findMany({ activeAlert: false }, page, limit);

      expect(prisma.product.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      });
    });

    it('filters by stock range (min and max)', async () => {
      prisma.product.findMany.mockResolvedValue([]);

      await repository.findMany({ stockMin: 10, stockMax: 100 }, page, limit);

      expect(prisma.product.findMany).toHaveBeenCalledWith({
        where: { currentStock: { gte: 10, lte: 100 } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      });
    });

    it('filters by stock range with only stockMin', async () => {
      prisma.product.findMany.mockResolvedValue([]);

      await repository.findMany({ stockMin: 10 }, page, limit);

      expect(prisma.product.findMany).toHaveBeenCalledWith({
        where: { currentStock: { gte: 10 } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      });
    });

    it('filters by stock range with only stockMax', async () => {
      prisma.product.findMany.mockResolvedValue([]);

      await repository.findMany({ stockMax: 100 }, page, limit);

      expect(prisma.product.findMany).toHaveBeenCalledWith({
        where: { currentStock: { lte: 100 } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      });
    });
  });

  describe('count', () => {
    it('delegates to prisma.product.count with the correct where clause', async () => {
      prisma.product.count.mockResolvedValue(5);

      const filter = { category: 'Bebidas', supplier: 'Lácteos del Valle' };
      const result = await repository.count(filter);

      expect(prisma.product.count).toHaveBeenCalledWith({
        where: {
          category: { equals: 'Bebidas', mode: 'insensitive' },
          supplier: { equals: 'Lácteos del Valle', mode: 'insensitive' },
        },
      });
      expect(result).toBe(5);
    });
  });

  describe('findById', () => {
    it('delegates to prisma.product.findUnique with the given id', async () => {
      const product = { id: '1' };
      prisma.product.findUnique.mockResolvedValue(product);

      const result = await repository.findById('1');

      expect(prisma.product.findUnique).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(result).toBe(product);
    });

    it('uses the provided transaction client instead of the default prisma instance', async () => {
      const tx = { product: { findUnique: jest.fn().mockResolvedValue(null) } };

      await repository.findById('1', tx as never);

      expect(tx.product.findUnique).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(prisma.product.findUnique).not.toHaveBeenCalled();
    });
  });

  describe('updateStock', () => {
    it('delegates to prisma.product.update with the new currentStock', async () => {
      const product = { id: '1', currentStock: 70 };
      prisma.product.update.mockResolvedValue(product);

      const result = await repository.updateStock('1', 70);

      expect(prisma.product.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { currentStock: 70 },
      });
      expect(result).toBe(product);
    });

    it('uses the provided transaction client instead of the default prisma instance', async () => {
      const tx = { product: { update: jest.fn().mockResolvedValue({}) } };

      await repository.updateStock('1', 70, tx as never);

      expect(tx.product.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { currentStock: 70 },
      });
      expect(prisma.product.update).not.toHaveBeenCalled();
    });
  });
});
