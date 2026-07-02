import { Test, TestingModule } from '@nestjs/testing';

import { CreateProductDto } from '@/products/dto/create-product.dto';
import { ProductsController } from '@/products/products.controller';
import { ProductsService } from '@/products/products.service';
import { FindProductsDto } from '@/products/dto/find-products.dto';

describe('ProductsController', () => {
  let controller: ProductsController;
  let service: { create: jest.Mock; findMany: jest.Mock };

  beforeEach(async () => {
    service = { create: jest.fn(), findMany: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [{ provide: ProductsService, useValue: service }],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('delegates to productsService.create', async () => {
      const dto: CreateProductDto = {
        name: 'Agua Mineral 500ml',
        sku: 'BEB001',
        category: 'Bebidas',
        price: 1500,
        minStock: 50,
        supplier: 'Distribuidora Andina',
      };
      const created = { id: '1', ...dto, currentStock: 0 };
      service.create.mockResolvedValue(created);

      const result = await controller.create(dto);

      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(created);
    });
  });

  describe('findMany', () => {
    it('delegates to productsService.findMany with the query filters', async () => {
      const filter: FindProductsDto = { category: 'Bebidas', page: 1, limit: 10 };
      service.findMany.mockResolvedValue([]);

      const result = await controller.findMany(filter);

      expect(service.findMany).toHaveBeenCalledWith(filter);
      expect(result).toEqual([]);
    });
  });
});
