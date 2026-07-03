import { Injectable } from '@nestjs/common';

import {
  DEFAULT_PAGINATION_LIMIT,
  DEFAULT_PAGINATION_PAGE,
} from '@/common/constants/pagination.contants';
import { PrismaClientOrTx } from '@/common/types/prisma-client.type';
import { paginationMeta } from '@/common/utils/pagination.util';

import { AlertsRepository } from '@/alerts/alerts.repository';
import { FindAlertsDto } from '@/alerts/dto/find-alerts.dto';
import { AlertsWithPagination } from '@/alerts/interfaces/alerts-with-pagination.interface';
import { ProductStockSnapshot } from '@/alerts/interfaces/product-stock-snapshot.interface';

@Injectable()
export class AlertsService {
  constructor(private readonly alertsRepository: AlertsRepository) {}

  async syncForProduct(product: ProductStockSnapshot, client?: PrismaClientOrTx): Promise<void> {
    const activeAlert = await this.alertsRepository.findActiveByProduct(product.id, client);

    if (product.currentStock <= product.minStock) {
      if (!activeAlert) {
        await this.alertsRepository.create(product.id, client);
      }
      return;
    }

    if (activeAlert) {
      await this.alertsRepository.resolve(activeAlert.id, client);
    }
  }

  async findMany(filter: FindAlertsDto): Promise<AlertsWithPagination> {
    const { page = DEFAULT_PAGINATION_PAGE, limit = DEFAULT_PAGINATION_LIMIT, status } = filter;

    const [alerts, total] = await Promise.all([
      this.alertsRepository.findMany({ status }, page, limit),
      this.alertsRepository.count({ status }),
    ]);

    return { alerts, meta: paginationMeta(total, page, limit) };
  }
}
