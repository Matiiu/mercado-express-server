import { Test, TestingModule } from '@nestjs/testing';

import { PrismaService } from '@/prisma/prisma.service';
import { AlertStatus } from '@prisma-client';
import { AlertsRepository } from '@/alerts/alerts.repository';

const page = 1;
const limit = 10;

describe('AlertsRepository', () => {
  let repository: AlertsRepository;
  let prisma: {
    alert: {
      findFirst: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      findUnique: jest.Mock;
      findMany: jest.Mock;
      count: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      alert: {
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [AlertsRepository, { provide: PrismaService, useValue: prisma }],
    }).compile();

    repository = module.get<AlertsRepository>(AlertsRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findActiveByProduct', () => {
    it('delegates to prisma.alert.findFirst with the active status filter', async () => {
      prisma.alert.findFirst.mockResolvedValue(null);

      const result = await repository.findActiveByProduct('product-1');

      expect(prisma.alert.findFirst).toHaveBeenCalledWith({
        where: { productId: 'product-1', status: AlertStatus.ACTIVA },
      });
      expect(result).toBeNull();
    });

    it('uses the provided transaction client instead of the default prisma instance', async () => {
      const tx = { alert: { findFirst: jest.fn().mockResolvedValue(null) } };

      await repository.findActiveByProduct('product-1', tx as never);

      expect(tx.alert.findFirst).toHaveBeenCalled();
      expect(prisma.alert.findFirst).not.toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('delegates to prisma.alert.findUnique with the given id', async () => {
      const alert = { id: 'alert-1' };
      prisma.alert.findUnique.mockResolvedValue(alert);

      const result = await repository.findById('alert-1');

      expect(prisma.alert.findUnique).toHaveBeenCalledWith({ where: { id: 'alert-1' } });
      expect(result).toBe(alert);
    });

    it('uses the provided transaction client instead of the default prisma instance', async () => {
      const tx = { alert: { findUnique: jest.fn().mockResolvedValue(null) } };

      await repository.findById('alert-1', tx as never);

      expect(tx.alert.findUnique).toHaveBeenCalledWith({ where: { id: 'alert-1' } });
      expect(prisma.alert.findUnique).not.toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('delegates to prisma.alert.create with the product id', async () => {
      const alert = { id: 'alert-1', productId: 'product-1' };
      prisma.alert.create.mockResolvedValue(alert);

      const result = await repository.create('product-1');

      expect(prisma.alert.create).toHaveBeenCalledWith({ data: { productId: 'product-1' } });
      expect(result).toBe(alert);
    });
  });

  describe('resolve', () => {
    it('delegates to prisma.alert.update setting status and resolvedAt', async () => {
      const alert = { id: 'alert-1', status: AlertStatus.RESUELTA };
      let receivedArgs:
        { where: { id: string }; data: { status: AlertStatus; resolvedAt: Date } } | undefined;
      prisma.alert.update.mockImplementation(
        (args: { where: { id: string }; data: { status: AlertStatus; resolvedAt: Date } }) => {
          receivedArgs = args;
          return Promise.resolve(alert);
        },
      );

      const result = await repository.resolve('alert-1');

      expect(receivedArgs?.where).toEqual({ id: 'alert-1' });
      expect(receivedArgs?.data.status).toBe(AlertStatus.RESUELTA);
      expect(receivedArgs?.data.resolvedAt).toBeInstanceOf(Date);
      expect(result).toBe(alert);
    });
  });

  describe('findMany', () => {
    it('builds an empty where clause when no status filter is provided', async () => {
      prisma.alert.findMany.mockResolvedValue([]);

      await repository.findMany({}, page, limit);

      expect(prisma.alert.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      });
    });

    it('filters by status when provided', async () => {
      prisma.alert.findMany.mockResolvedValue([]);

      await repository.findMany({ status: AlertStatus.ACTIVA }, page, limit);

      expect(prisma.alert.findMany).toHaveBeenCalledWith({
        where: { status: AlertStatus.ACTIVA },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      });
    });
  });

  describe('count', () => {
    it('delegates to prisma.alert.count with the correct where clause', async () => {
      prisma.alert.count.mockResolvedValue(5);

      const result = await repository.count({ status: AlertStatus.ACTIVA });

      expect(prisma.alert.count).toHaveBeenCalledWith({
        where: { status: AlertStatus.ACTIVA },
      });
      expect(result).toBe(5);
    });
  });
});
