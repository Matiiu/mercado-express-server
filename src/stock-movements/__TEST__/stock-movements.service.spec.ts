import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { PRODUCT_MESSAGES, STOCK_MOVEMENT_MESSAGES } from '@/common/constants/messages.constants';
import { PrismaService } from '@/prisma/prisma.service';
import { MovementType } from '@prisma-client';

import { AlertsService } from '@/alerts/alerts.service';
import { ProductsRepository } from '@/products/products.repository';
import { CreateStockMovementDto } from '@/stock-movements/dto/create-stock-movement.dto';
import { StockMovementsRepository } from '@/stock-movements/stock-movements.repository';
import { StockMovementsService } from '@/stock-movements/stock-movements.service';

describe('StockMovementsService', () => {
  let service: StockMovementsService;
  let prisma: { $transaction: jest.Mock };
  let stockMovementsRepository: { create: jest.Mock };
  let productsRepository: { findById: jest.Mock; updateStock: jest.Mock };
  let alertsService: { syncForProduct: jest.Mock };

  const tx = {} as never;

  const product = {
    id: 'product-1',
    name: 'Agua Mineral 500ml',
    sku: 'BEB001',
    category: 'Bebidas',
    price: 1500,
    currentStock: 50,
    minStock: 10,
    supplier: 'Distribuidora Andina',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    prisma = { $transaction: jest.fn((callback: (tx: unknown) => unknown) => callback(tx)) };
    stockMovementsRepository = { create: jest.fn() };
    productsRepository = { findById: jest.fn(), updateStock: jest.fn() };
    alertsService = { syncForProduct: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StockMovementsService,
        { provide: PrismaService, useValue: prisma },
        { provide: StockMovementsRepository, useValue: stockMovementsRepository },
        { provide: ProductsRepository, useValue: productsRepository },
        { provide: AlertsService, useValue: alertsService },
      ],
    }).compile();

    service = module.get<StockMovementsService>(StockMovementsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('throws NotFoundException when the product does not exist', async () => {
      productsRepository.findById.mockResolvedValue(null);
      const dto: CreateStockMovementDto = {
        type: MovementType.ENTRADA,
        quantity: 10,
        reason: 'Reposición',
      };

      await expect(service.create('product-1', dto)).rejects.toThrow(NotFoundException);
      await expect(service.create('product-1', dto)).rejects.toThrow(
        PRODUCT_MESSAGES.NOT_FOUND('product-1'),
      );
      expect(stockMovementsRepository.create).not.toHaveBeenCalled();
    });

    it('increases the stock and creates the movement on ENTRADA', async () => {
      productsRepository.findById.mockResolvedValue(product);
      const movement = {
        id: 'mov-1',
        productId: 'product-1',
        type: MovementType.ENTRADA,
        quantity: 20,
        reason: 'Reposición',
        createdAt: new Date(),
      };
      stockMovementsRepository.create.mockResolvedValue(movement);
      const dto: CreateStockMovementDto = {
        type: MovementType.ENTRADA,
        quantity: 20,
        reason: 'Reposición',
      };

      const result = await service.create('product-1', dto);

      expect(stockMovementsRepository.create).toHaveBeenCalledWith(
        { productId: 'product-1', type: MovementType.ENTRADA, quantity: 20, reason: 'Reposición' },
        tx,
      );
      expect(productsRepository.updateStock).toHaveBeenCalledWith('product-1', 70, tx);
      expect(alertsService.syncForProduct).toHaveBeenCalledWith(
        { id: 'product-1', currentStock: 70, minStock: 10 },
        tx,
      );
      expect(result).toBe(movement);
    });

    it('decreases the stock on SALIDA when there is enough stock', async () => {
      productsRepository.findById.mockResolvedValue(product);
      stockMovementsRepository.create.mockResolvedValue({});
      const dto: CreateStockMovementDto = {
        type: MovementType.SALIDA,
        quantity: 30,
        reason: 'Venta',
      };

      await service.create('product-1', dto);

      expect(productsRepository.updateStock).toHaveBeenCalledWith('product-1', 20, tx);
      expect(alertsService.syncForProduct).toHaveBeenCalledWith(
        { id: 'product-1', currentStock: 20, minStock: 10 },
        tx,
      );
    });

    it('throws BadRequestException when SALIDA would leave the stock negative', async () => {
      productsRepository.findById.mockResolvedValue(product);
      const dto: CreateStockMovementDto = {
        type: MovementType.SALIDA,
        quantity: 60,
        reason: 'Venta',
      };

      await expect(service.create('product-1', dto)).rejects.toThrow(BadRequestException);
      await expect(service.create('product-1', dto)).rejects.toThrow(
        STOCK_MOVEMENT_MESSAGES.INSUFFICIENT_STOCK(10),
      );
      expect(stockMovementsRepository.create).not.toHaveBeenCalled();
      expect(productsRepository.updateStock).not.toHaveBeenCalled();
    });
  });
});
