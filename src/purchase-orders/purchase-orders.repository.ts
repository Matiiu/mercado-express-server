import { Injectable } from '@nestjs/common';

import { PrismaClientOrTx } from '@/common/types/prisma-client.type';
import { PrismaService } from '@/prisma/prisma.service';
import { OrderStatus, PurchaseOrder } from '@prisma-client';

interface CreatePurchaseOrderData {
  productId: string;
  alertId: string | null;
  supplier: string;
  quantity: number;
}

@Injectable()
export class PurchaseOrdersRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(
    data: CreatePurchaseOrderData,
    client: PrismaClientOrTx = this.prisma,
  ): Promise<PurchaseOrder> {
    return client.purchaseOrder.create({ data });
  }

  findById(id: string, client: PrismaClientOrTx = this.prisma): Promise<PurchaseOrder | null> {
    return client.purchaseOrder.findUnique({ where: { id } });
  }

  updateStatus(
    id: string,
    status: OrderStatus,
    client: PrismaClientOrTx = this.prisma,
  ): Promise<PurchaseOrder> {
    return client.purchaseOrder.update({ where: { id }, data: { status } });
  }

  reject(
    id: string,
    rejectionReason: string,
    client: PrismaClientOrTx = this.prisma,
  ): Promise<PurchaseOrder> {
    return client.purchaseOrder.update({
      where: { id },
      data: { status: OrderStatus.RECHAZADA, rejectionReason },
    });
  }
}
