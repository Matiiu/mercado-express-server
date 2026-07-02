import { Test, TestingModule } from '@nestjs/testing';

import {
  DEFAULT_PAGINATION_LIMIT,
  DEFAULT_PAGINATION_PAGE,
} from '@/common/constants/pagination.contants';
import { AlertStatus } from '@prisma-client';

import { AlertsRepository } from '@/alerts/alerts.repository';
import { AlertsService } from '@/alerts/alerts.service';
import { FindAlertsDto } from '@/alerts/dto/find-alerts.dto';

const meta = {
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 0,
  hasNextPage: false,
  hasPreviousPage: false,
};

describe('AlertsService', () => {
  let service: AlertsService;
  let repository: {
    findActiveByProduct: jest.Mock;
    create: jest.Mock;
    resolve: jest.Mock;
    findMany: jest.Mock;
    count: jest.Mock;
  };

  beforeEach(async () => {
    repository = {
      findActiveByProduct: jest.fn(),
      create: jest.fn(),
      resolve: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [AlertsService, { provide: AlertsRepository, useValue: repository }],
    }).compile();

    service = module.get<AlertsService>(AlertsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('syncForProduct', () => {
    it('creates an alert when stock drops to or below minStock and none is active', async () => {
      repository.findActiveByProduct.mockResolvedValue(null);

      await service.syncForProduct({ id: 'product-1', currentStock: 5, minStock: 10 });

      expect(repository.create).toHaveBeenCalledWith('product-1', undefined);
      expect(repository.resolve).not.toHaveBeenCalled();
    });

    it('does not duplicate an alert when one is already active', async () => {
      repository.findActiveByProduct.mockResolvedValue({ id: 'alert-1' });

      await service.syncForProduct({ id: 'product-1', currentStock: 5, minStock: 10 });

      expect(repository.create).not.toHaveBeenCalled();
    });

    it('resolves the active alert when stock recovers above minStock', async () => {
      repository.findActiveByProduct.mockResolvedValue({ id: 'alert-1' });

      await service.syncForProduct({ id: 'product-1', currentStock: 20, minStock: 10 });

      expect(repository.resolve).toHaveBeenCalledWith('alert-1', undefined);
      expect(repository.create).not.toHaveBeenCalled();
    });

    it('does nothing when stock is above minStock and there is no active alert', async () => {
      repository.findActiveByProduct.mockResolvedValue(null);

      await service.syncForProduct({ id: 'product-1', currentStock: 20, minStock: 10 });

      expect(repository.create).not.toHaveBeenCalled();
      expect(repository.resolve).not.toHaveBeenCalled();
    });

    it('forwards the transaction client to the repository', async () => {
      const tx = {} as never;
      repository.findActiveByProduct.mockResolvedValue(null);

      await service.syncForProduct({ id: 'product-1', currentStock: 5, minStock: 10 }, tx);

      expect(repository.findActiveByProduct).toHaveBeenCalledWith('product-1', tx);
      expect(repository.create).toHaveBeenCalledWith('product-1', tx);
    });
  });

  describe('findMany', () => {
    it('returns the mapped list of alerts', async () => {
      const alert = { id: 'alert-1', status: AlertStatus.ACTIVA };
      repository.findMany.mockResolvedValue([alert]);
      repository.count.mockResolvedValue(1);
      const filter: FindAlertsDto = { status: AlertStatus.ACTIVA, page: 1, limit: 10 };

      const result = await service.findMany(filter);

      expect(repository.findMany).toHaveBeenCalledWith({ status: AlertStatus.ACTIVA }, 1, 10);
      expect(repository.count).toHaveBeenCalledWith({ status: AlertStatus.ACTIVA });
      expect(result).toEqual({ alerts: [alert], meta: { ...meta, total: 1, totalPages: 1 } });
    });

    it('returns an empty list of alerts with meta when there are no matches', async () => {
      repository.findMany.mockResolvedValue([]);
      repository.count.mockResolvedValue(0);

      const result = await service.findMany({});

      expect(result).toEqual({ alerts: [], meta });
    });

    it('applies the default pagination when no pagination is provided', async () => {
      repository.findMany.mockResolvedValue([]);
      repository.count.mockResolvedValue(0);

      await service.findMany({});

      expect(repository.findMany).toHaveBeenCalledWith(
        { status: undefined },
        DEFAULT_PAGINATION_PAGE,
        DEFAULT_PAGINATION_LIMIT,
      );
    });
  });
});
