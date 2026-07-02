import { Test, TestingModule } from '@nestjs/testing';

import { MovementType } from '@prisma-client';

import { CreateStockMovementDto } from '@/stock-movements/dto/create-stock-movement.dto';
import { StockMovementsController } from '@/stock-movements/stock-movements.controller';
import { StockMovementsService } from '@/stock-movements/stock-movements.service';

describe('StockMovementsController', () => {
  let controller: StockMovementsController;
  let service: { create: jest.Mock };

  beforeEach(async () => {
    service = { create: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [StockMovementsController],
      providers: [{ provide: StockMovementsService, useValue: service }],
    }).compile();

    controller = module.get<StockMovementsController>(StockMovementsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('delegates to stockMovementsService.create with the productId and dto', async () => {
      const dto: CreateStockMovementDto = {
        type: MovementType.ENTRADA,
        quantity: 10,
        reason: 'Reposición de mercadería',
      };
      const created = { id: 'mov-1', productId: 'product-1', ...dto, createdAt: new Date() };
      service.create.mockResolvedValue(created);

      const result = await controller.create('product-1', dto);

      expect(service.create).toHaveBeenCalledWith('product-1', dto);
      expect(result).toEqual(created);
    });
  });
});
