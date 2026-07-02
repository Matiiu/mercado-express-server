import { Test, TestingModule } from '@nestjs/testing';

import { AlertStatus } from '@prisma-client';

import { AlertsController } from '@/alerts/alerts.controller';
import { AlertsService } from '@/alerts/alerts.service';
import { FindAlertsDto } from '@/alerts/dto/find-alerts.dto';

describe('AlertsController', () => {
  let controller: AlertsController;
  let service: { findMany: jest.Mock };

  beforeEach(async () => {
    service = { findMany: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AlertsController],
      providers: [{ provide: AlertsService, useValue: service }],
    }).compile();

    controller = module.get<AlertsController>(AlertsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findMany', () => {
    it('delegates to alertsService.findMany with the query filters', async () => {
      const filter: FindAlertsDto = { status: AlertStatus.ACTIVA, page: 1, limit: 10 };
      service.findMany.mockResolvedValue([]);

      const result = await controller.findMany(filter);

      expect(service.findMany).toHaveBeenCalledWith(filter);
      expect(result).toEqual([]);
    });
  });
});
