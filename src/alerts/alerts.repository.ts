import { Injectable } from '@nestjs/common';

import { PrismaClientOrTx } from '@/common/types/prisma-client.type';
import { PrismaService } from '@/prisma/prisma.service';
import { Alert, AlertStatus, Prisma } from '@prisma-client';

import { AlertFilterDto } from '@/alerts/dto/alert-filter.dto';

@Injectable()
export class AlertsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findActiveByProduct(
    productId: string,
    client: PrismaClientOrTx = this.prisma,
  ): Promise<Alert | null> {
    return client.alert.findFirst({ where: { productId, status: AlertStatus.ACTIVA } });
  }

  findById(id: string, client: PrismaClientOrTx = this.prisma): Promise<Alert | null> {
    return client.alert.findUnique({ where: { id } });
  }

  findMany(filter: AlertFilterDto, page: number, limit: number): Promise<Alert[]> {
    return this.prisma.alert.findMany({
      where: this.buildWhere(filter),
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  count(filter: AlertFilterDto): Promise<number> {
    return this.prisma.alert.count({ where: this.buildWhere(filter) });
  }

  create(productId: string, client: PrismaClientOrTx = this.prisma): Promise<Alert> {
    return client.alert.create({ data: { productId } });
  }

  resolve(id: string, client: PrismaClientOrTx = this.prisma): Promise<Alert> {
    return client.alert.update({
      where: { id },
      data: { status: AlertStatus.RESUELTA, resolvedAt: new Date() },
    });
  }

  private buildWhere(filter: AlertFilterDto): Prisma.AlertWhereInput {
    return filter.status ? { status: filter.status } : {};
  }
}
