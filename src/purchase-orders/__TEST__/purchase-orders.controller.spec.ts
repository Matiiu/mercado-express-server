import { Test, TestingModule } from '@nestjs/testing';

import { OrderStatus } from '@prisma-client';
import { CreatePurchaseOrderDto } from '@/purchase-orders/dto/create-purchase-order.dto';
import { RejectPurchaseOrderDto } from '@/purchase-orders/dto/reject-purchase-order.dto';
import { PurchaseOrdersController } from '@/purchase-orders/purchase-orders.controller';
import { PurchaseOrdersService } from '@/purchase-orders/purchase-orders.service';

describe('PurchaseOrdersController', () => {
  let controller: PurchaseOrdersController;
  let service: { create: jest.Mock; approve: jest.Mock; reject: jest.Mock; receive: jest.Mock };

  const order = {
    id: 'order-1',
    productId: 'product-1',
    alertId: null,
    supplier: 'Distribuidora Andina',
    quantity: 100,
    status: OrderStatus.PENDIENTE,
    rejectionReason: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    service = {
      create: jest.fn(),
      approve: jest.fn(),
      reject: jest.fn(),
      receive: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PurchaseOrdersController],
      providers: [{ provide: PurchaseOrdersService, useValue: service }],
    }).compile();

    controller = module.get<PurchaseOrdersController>(PurchaseOrdersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('delegates to purchaseOrdersService.create with the dto', async () => {
      const dto: CreatePurchaseOrderDto = { productId: 'product-1', quantity: 100 };
      service.create.mockResolvedValue(order);

      const result = await controller.create(dto);

      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(order);
    });
  });

  describe('approve', () => {
    it('delegates to purchaseOrdersService.approve with the id', async () => {
      const approved = { ...order, status: OrderStatus.APROBADA };
      service.approve.mockResolvedValue(approved);

      const result = await controller.approve('order-1');

      expect(service.approve).toHaveBeenCalledWith('order-1');
      expect(result).toEqual(approved);
    });
  });

  describe('reject', () => {
    it('delegates to purchaseOrdersService.reject with the id and dto', async () => {
      const dto: RejectPurchaseOrderDto = { rejectionReason: 'Proveedor sin stock disponible' };
      const rejected = {
        ...order,
        status: OrderStatus.RECHAZADA,
        rejectionReason: dto.rejectionReason,
      };
      service.reject.mockResolvedValue(rejected);

      const result = await controller.reject('order-1', dto);

      expect(service.reject).toHaveBeenCalledWith('order-1', dto);
      expect(result).toEqual(rejected);
    });
  });

  describe('receive', () => {
    it('delegates to purchaseOrdersService.receive with the id', async () => {
      const received = { ...order, status: OrderStatus.RECIBIDA };
      service.receive.mockResolvedValue(received);

      const result = await controller.receive('order-1');

      expect(service.receive).toHaveBeenCalledWith('order-1');
      expect(result).toEqual(received);
    });
  });
});
