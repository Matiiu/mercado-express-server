import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { PRODUCT_MESSAGES, PURCHASE_ORDER_MESSAGES } from '@/common/constants/messages.constants';
import { PrismaService } from '@/prisma/prisma.service';
import { AlertStatus, OrderStatus } from '@prisma-client';
import { AlertsRepository } from '@/alerts/alerts.repository';
import { AlertsService } from '@/alerts/alerts.service';
import { ProductsRepository } from '@/products/products.repository';
import { CreatePurchaseOrderDto } from '@/purchase-orders/dto/create-purchase-order.dto';
import { RejectPurchaseOrderDto } from '@/purchase-orders/dto/reject-purchase-order.dto';
import { PurchaseOrdersRepository } from '@/purchase-orders/purchase-orders.repository';
import { PurchaseOrdersService } from '@/purchase-orders/purchase-orders.service';

describe('PurchaseOrdersService', () => {
  let service: PurchaseOrdersService;
  let prisma: { $transaction: jest.Mock };
  let purchaseOrdersRepository: {
    create: jest.Mock;
    findById: jest.Mock;
    updateStatus: jest.Mock;
    reject: jest.Mock;
  };
  let productsRepository: { findById: jest.Mock; updateStock: jest.Mock };
  let alertsRepository: { findById: jest.Mock };
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
    prisma = { $transaction: jest.fn((callback: (tx: unknown) => unknown) => callback(tx)) };
    purchaseOrdersRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      updateStatus: jest.fn(),
      reject: jest.fn(),
    };
    productsRepository = { findById: jest.fn(), updateStock: jest.fn() };
    alertsRepository = { findById: jest.fn() };
    alertsService = { syncForProduct: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PurchaseOrdersService,
        { provide: PrismaService, useValue: prisma },
        { provide: PurchaseOrdersRepository, useValue: purchaseOrdersRepository },
        { provide: ProductsRepository, useValue: productsRepository },
        { provide: AlertsRepository, useValue: alertsRepository },
        { provide: AlertsService, useValue: alertsService },
      ],
    }).compile();

    service = module.get<PurchaseOrdersService>(PurchaseOrdersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('throws NotFoundException when the product does not exist', async () => {
      productsRepository.findById.mockResolvedValue(null);
      const dto: CreatePurchaseOrderDto = { productId: 'product-1', quantity: 100 };

      await expect(service.create(dto)).rejects.toThrow(NotFoundException);
      await expect(service.create(dto)).rejects.toThrow(PRODUCT_MESSAGES.NOT_FOUND('product-1'));
      expect(purchaseOrdersRepository.create).not.toHaveBeenCalled();
    });

    it('throws BadRequestException when the quantity is below 2x minStock', async () => {
      productsRepository.findById.mockResolvedValue(product);
      const dto: CreatePurchaseOrderDto = { productId: 'product-1', quantity: 15 };

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
      await expect(service.create(dto)).rejects.toThrow(PURCHASE_ORDER_MESSAGES.MIN_QUANTITY(20));
      expect(purchaseOrdersRepository.create).not.toHaveBeenCalled();
    });

    it('throws BadRequestException when the alert does not exist', async () => {
      productsRepository.findById.mockResolvedValue(product);
      alertsRepository.findById.mockResolvedValue(null);
      const dto: CreatePurchaseOrderDto = {
        productId: 'product-1',
        quantity: 100,
        alertId: 'alert-1',
      };

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
      await expect(service.create(dto)).rejects.toThrow(PURCHASE_ORDER_MESSAGES.INVALID_ALERT);
      expect(purchaseOrdersRepository.create).not.toHaveBeenCalled();
    });

    it('throws BadRequestException when the alert belongs to a different product', async () => {
      productsRepository.findById.mockResolvedValue(product);
      alertsRepository.findById.mockResolvedValue({
        id: 'alert-1',
        productId: 'product-2',
        status: AlertStatus.ACTIVA,
      });
      const dto: CreatePurchaseOrderDto = {
        productId: 'product-1',
        quantity: 100,
        alertId: 'alert-1',
      };

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
      expect(purchaseOrdersRepository.create).not.toHaveBeenCalled();
    });

    it('throws BadRequestException when the alert is not active', async () => {
      productsRepository.findById.mockResolvedValue(product);
      alertsRepository.findById.mockResolvedValue({
        id: 'alert-1',
        productId: 'product-1',
        status: AlertStatus.RESUELTA,
      });
      const dto: CreatePurchaseOrderDto = {
        productId: 'product-1',
        quantity: 100,
        alertId: 'alert-1',
      };

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
      expect(purchaseOrdersRepository.create).not.toHaveBeenCalled();
    });

    it('creates the order without an alertId when none is provided', async () => {
      productsRepository.findById.mockResolvedValue(product);
      purchaseOrdersRepository.create.mockResolvedValue(order);
      const dto: CreatePurchaseOrderDto = { productId: 'product-1', quantity: 100 };

      const result = await service.create(dto);

      expect(purchaseOrdersRepository.create).toHaveBeenCalledWith({
        productId: 'product-1',
        alertId: null,
        supplier: product.supplier,
        quantity: 100,
      });
      expect(alertsRepository.findById).not.toHaveBeenCalled();
      expect(result).toBe(order);
    });

    it('creates the order from a valid active alert', async () => {
      productsRepository.findById.mockResolvedValue(product);
      alertsRepository.findById.mockResolvedValue({
        id: 'alert-1',
        productId: 'product-1',
        status: AlertStatus.ACTIVA,
      });
      const createdOrder = { ...order, alertId: 'alert-1' };
      purchaseOrdersRepository.create.mockResolvedValue(createdOrder);
      const dto: CreatePurchaseOrderDto = {
        productId: 'product-1',
        quantity: 100,
        alertId: 'alert-1',
      };

      const result = await service.create(dto);

      expect(purchaseOrdersRepository.create).toHaveBeenCalledWith({
        productId: 'product-1',
        alertId: 'alert-1',
        supplier: product.supplier,
        quantity: 100,
      });
      expect(result).toBe(createdOrder);
    });
  });

  describe('approve', () => {
    it('throws NotFoundException when the order does not exist', async () => {
      purchaseOrdersRepository.findById.mockResolvedValue(null);

      await expect(service.approve('order-1')).rejects.toThrow(NotFoundException);
      expect(purchaseOrdersRepository.updateStatus).not.toHaveBeenCalled();
    });

    it('throws BadRequestException when the order is not PENDIENTE', async () => {
      purchaseOrdersRepository.findById.mockResolvedValue({
        ...order,
        status: OrderStatus.APROBADA,
      });

      await expect(service.approve('order-1')).rejects.toThrow(BadRequestException);
      await expect(service.approve('order-1')).rejects.toThrow(PURCHASE_ORDER_MESSAGES.NOT_PENDING);
      expect(purchaseOrdersRepository.updateStatus).not.toHaveBeenCalled();
    });

    it('updates the order status to APROBADA when it is PENDIENTE', async () => {
      purchaseOrdersRepository.findById.mockResolvedValue(order);
      const approved = { ...order, status: OrderStatus.APROBADA };
      purchaseOrdersRepository.updateStatus.mockResolvedValue(approved);

      const result = await service.approve('order-1');

      expect(purchaseOrdersRepository.updateStatus).toHaveBeenCalledWith(
        'order-1',
        OrderStatus.APROBADA,
      );
      expect(result).toBe(approved);
    });
  });

  describe('reject', () => {
    const dto: RejectPurchaseOrderDto = { rejectionReason: 'Proveedor sin stock disponible' };

    it('throws NotFoundException when the order does not exist', async () => {
      purchaseOrdersRepository.findById.mockResolvedValue(null);

      await expect(service.reject('order-1', dto)).rejects.toThrow(NotFoundException);
      expect(purchaseOrdersRepository.reject).not.toHaveBeenCalled();
    });

    it('throws BadRequestException when the order is not PENDIENTE', async () => {
      purchaseOrdersRepository.findById.mockResolvedValue({
        ...order,
        status: OrderStatus.RECIBIDA,
      });

      await expect(service.reject('order-1', dto)).rejects.toThrow(BadRequestException);
      expect(purchaseOrdersRepository.reject).not.toHaveBeenCalled();
    });

    it('rejects the order with the given reason when it is PENDIENTE', async () => {
      purchaseOrdersRepository.findById.mockResolvedValue(order);
      const rejected = {
        ...order,
        status: OrderStatus.RECHAZADA,
        rejectionReason: dto.rejectionReason,
      };
      purchaseOrdersRepository.reject.mockResolvedValue(rejected);

      const result = await service.reject('order-1', dto);

      expect(purchaseOrdersRepository.reject).toHaveBeenCalledWith('order-1', dto.rejectionReason);
      expect(result).toBe(rejected);
    });
  });

  describe('receive', () => {
    it('throws NotFoundException when the order does not exist', async () => {
      purchaseOrdersRepository.findById.mockResolvedValue(null);

      await expect(service.receive('order-1')).rejects.toThrow(NotFoundException);
      expect(productsRepository.updateStock).not.toHaveBeenCalled();
    });

    it('throws BadRequestException when the order is not APROBADA', async () => {
      purchaseOrdersRepository.findById.mockResolvedValue({
        ...order,
        status: OrderStatus.PENDIENTE,
      });

      await expect(service.receive('order-1')).rejects.toThrow(BadRequestException);
      await expect(service.receive('order-1')).rejects.toThrow(
        PURCHASE_ORDER_MESSAGES.NOT_APPROVED,
      );
      expect(productsRepository.updateStock).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when the product no longer exists', async () => {
      purchaseOrdersRepository.findById.mockResolvedValue({
        ...order,
        status: OrderStatus.APROBADA,
      });
      productsRepository.findById.mockResolvedValue(null);

      await expect(service.receive('order-1')).rejects.toThrow(NotFoundException);
      await expect(service.receive('order-1')).rejects.toThrow(
        PRODUCT_MESSAGES.NOT_FOUND('product-1'),
      );
      expect(productsRepository.updateStock).not.toHaveBeenCalled();
    });

    it('increases the stock, syncs alerts and marks the order as RECIBIDA', async () => {
      const approvedOrder = { ...order, status: OrderStatus.APROBADA, quantity: 100 };
      purchaseOrdersRepository.findById.mockResolvedValue(approvedOrder);
      productsRepository.findById.mockResolvedValue(product);
      const received = { ...approvedOrder, status: OrderStatus.RECIBIDA };
      purchaseOrdersRepository.updateStatus.mockResolvedValue(received);

      const result = await service.receive('order-1');

      expect(productsRepository.updateStock).toHaveBeenCalledWith('product-1', 150, tx);
      expect(alertsService.syncForProduct).toHaveBeenCalledWith(
        { id: 'product-1', currentStock: 150, minStock: 10 },
        tx,
      );
      expect(purchaseOrdersRepository.updateStatus).toHaveBeenCalledWith(
        'order-1',
        OrderStatus.RECIBIDA,
        tx,
      );
      expect(result).toBe(received);
    });
  });
});
