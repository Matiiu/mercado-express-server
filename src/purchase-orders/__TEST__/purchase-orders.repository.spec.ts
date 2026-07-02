import { Test, TestingModule } from '@nestjs/testing';

import { PrismaService } from '@/prisma/prisma.service';
import { OrderStatus } from '@prisma-client';
import { PurchaseOrdersRepository } from '@/purchase-orders/purchase-orders.repository';

describe('PurchaseOrdersRepository', () => {
  let repository: PurchaseOrdersRepository;
  let prisma: {
    purchaseOrder: { create: jest.Mock; findUnique: jest.Mock; update: jest.Mock };
  };

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
    prisma = {
      purchaseOrder: { create: jest.fn(), findUnique: jest.fn(), update: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [PurchaseOrdersRepository, { provide: PrismaService, useValue: prisma }],
    }).compile();

    repository = module.get<PurchaseOrdersRepository>(PurchaseOrdersRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('create', () => {
    it('delegates to prisma.purchaseOrder.create with the order data', async () => {
      const data = {
        productId: 'product-1',
        alertId: null,
        supplier: 'Distribuidora Andina',
        quantity: 100,
      };
      prisma.purchaseOrder.create.mockResolvedValue(order);

      const result = await repository.create(data);

      expect(prisma.purchaseOrder.create).toHaveBeenCalledWith({ data });
      expect(result).toBe(order);
    });

    it('uses the provided transaction client instead of the default prisma instance', async () => {
      const tx = { purchaseOrder: { create: jest.fn().mockResolvedValue(order) } };
      const data = {
        productId: 'product-1',
        alertId: null,
        supplier: 'Distribuidora Andina',
        quantity: 100,
      };

      await repository.create(data, tx as never);

      expect(tx.purchaseOrder.create).toHaveBeenCalledWith({ data });
      expect(prisma.purchaseOrder.create).not.toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('delegates to prisma.purchaseOrder.findUnique with the given id', async () => {
      prisma.purchaseOrder.findUnique.mockResolvedValue(order);

      const result = await repository.findById('order-1');

      expect(prisma.purchaseOrder.findUnique).toHaveBeenCalledWith({ where: { id: 'order-1' } });
      expect(result).toBe(order);
    });

    it('uses the provided transaction client instead of the default prisma instance', async () => {
      const tx = { purchaseOrder: { findUnique: jest.fn().mockResolvedValue(null) } };

      await repository.findById('order-1', tx as never);

      expect(tx.purchaseOrder.findUnique).toHaveBeenCalledWith({ where: { id: 'order-1' } });
      expect(prisma.purchaseOrder.findUnique).not.toHaveBeenCalled();
    });
  });

  describe('updateStatus', () => {
    it('delegates to prisma.purchaseOrder.update with the new status', async () => {
      const updated = { ...order, status: OrderStatus.APROBADA };
      prisma.purchaseOrder.update.mockResolvedValue(updated);

      const result = await repository.updateStatus('order-1', OrderStatus.APROBADA);

      expect(prisma.purchaseOrder.update).toHaveBeenCalledWith({
        where: { id: 'order-1' },
        data: { status: OrderStatus.APROBADA },
      });
      expect(result).toBe(updated);
    });

    it('uses the provided transaction client instead of the default prisma instance', async () => {
      const tx = { purchaseOrder: { update: jest.fn().mockResolvedValue(order) } };

      await repository.updateStatus('order-1', OrderStatus.RECIBIDA, tx as never);

      expect(tx.purchaseOrder.update).toHaveBeenCalledWith({
        where: { id: 'order-1' },
        data: { status: OrderStatus.RECIBIDA },
      });
      expect(prisma.purchaseOrder.update).not.toHaveBeenCalled();
    });
  });

  describe('reject', () => {
    it('delegates to prisma.purchaseOrder.update setting status and rejectionReason', async () => {
      const rejected = {
        ...order,
        status: OrderStatus.RECHAZADA,
        rejectionReason: 'Proveedor sin stock disponible',
      };
      prisma.purchaseOrder.update.mockResolvedValue(rejected);

      const result = await repository.reject('order-1', 'Proveedor sin stock disponible');

      expect(prisma.purchaseOrder.update).toHaveBeenCalledWith({
        where: { id: 'order-1' },
        data: { status: OrderStatus.RECHAZADA, rejectionReason: 'Proveedor sin stock disponible' },
      });
      expect(result).toBe(rejected);
    });

    it('uses the provided transaction client instead of the default prisma instance', async () => {
      const tx = { purchaseOrder: { update: jest.fn().mockResolvedValue(order) } };

      await repository.reject('order-1', 'Motivo de rechazo', tx as never);

      expect(tx.purchaseOrder.update).toHaveBeenCalledWith({
        where: { id: 'order-1' },
        data: { status: OrderStatus.RECHAZADA, rejectionReason: 'Motivo de rechazo' },
      });
      expect(prisma.purchaseOrder.update).not.toHaveBeenCalled();
    });
  });
});
