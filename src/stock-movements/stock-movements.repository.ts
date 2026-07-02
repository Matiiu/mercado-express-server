import { Injectable } from '@nestjs/common';

import { PrismaClientOrTx } from '@/common/types/prisma-client.type';
import { PrismaService } from '@/prisma/prisma.service';
import { MovementType, StockMovement } from '@prisma-client';

interface CreateStockMovementData {
  productId: string;
  type: MovementType;
  quantity: number;
  reason: string;
}

@Injectable()
export class StockMovementsRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(
    data: CreateStockMovementData,
    client: PrismaClientOrTx = this.prisma,
  ): Promise<StockMovement> {
    return client.stockMovement.create({ data });
  }
}
