import { Test, TestingModule } from '@nestjs/testing';

import { PrismaService } from '@/prisma/prisma.service';
import { MovementType } from '@prisma-client';

import { StockMovementsRepository } from '@/stock-movements/stock-movements.repository';

describe('StockMovementsRepository', () => {
  let repository: StockMovementsRepository;
  let prisma: { stockMovement: { create: jest.Mock } };

  beforeEach(async () => {
    prisma = { stockMovement: { create: jest.fn() } };

    const module: TestingModule = await Test.createTestingModule({
      providers: [StockMovementsRepository, { provide: PrismaService, useValue: prisma }],
    }).compile();

    repository = module.get<StockMovementsRepository>(StockMovementsRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('create', () => {
    it('delegates to prisma.stockMovement.create with the movement data', async () => {
      const data = {
        productId: 'product-1',
        type: MovementType.ENTRADA,
        quantity: 10,
        reason: 'Reposición de mercadería',
      };
      const movement = { id: 'mov-1', ...data, createdAt: new Date() };
      prisma.stockMovement.create.mockResolvedValue(movement);

      const result = await repository.create(data);

      expect(prisma.stockMovement.create).toHaveBeenCalledWith({ data });
      expect(result).toBe(movement);
    });

    it('uses the provided transaction client instead of the default prisma instance', async () => {
      const tx = { stockMovement: { create: jest.fn().mockResolvedValue({}) } };
      const data = {
        productId: 'product-1',
        type: MovementType.SALIDA,
        quantity: 5,
        reason: 'Venta',
      };

      await repository.create(data, tx as never);

      expect(tx.stockMovement.create).toHaveBeenCalledWith({ data });
      expect(prisma.stockMovement.create).not.toHaveBeenCalled();
    });
  });
});
