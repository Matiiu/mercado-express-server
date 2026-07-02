import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import { PRODUCT_MESSAGES, STOCK_MOVEMENT_MESSAGES } from '@/common/constants/messages.constants';
import { PrismaService } from '@/prisma/prisma.service';
import { MovementType } from '@prisma-client';

import { AlertsService } from '@/alerts/alerts.service';
import { ProductsRepository } from '@/products/products.repository';
import { CreateStockMovementDto } from '@/stock-movements/dto/create-stock-movement.dto';
import { StockMovement } from '@/stock-movements/entities/stock-movement.entity';
import { StockMovementsRepository } from '@/stock-movements/stock-movements.repository';

@Injectable()
export class StockMovementsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly stockMovementsRepository: StockMovementsRepository,
    private readonly productsRepository: ProductsRepository,
    private readonly alertsService: AlertsService,
  ) {}

  create(productId: string, dto: CreateStockMovementDto): Promise<StockMovement> {
    return this.prisma.$transaction(async (tx) => {
      const product = await this.productsRepository.findById(productId, tx);
      if (!product) {
        throw new NotFoundException(PRODUCT_MESSAGES.NOT_FOUND(productId));
      }

      const newStock =
        dto.type === MovementType.ENTRADA
          ? product.currentStock + dto.quantity
          : product.currentStock - dto.quantity;

      if (newStock < 0) {
        throw new BadRequestException(STOCK_MOVEMENT_MESSAGES.INSUFFICIENT_STOCK(-newStock));
      }

      const movement = await this.stockMovementsRepository.create(
        { productId, type: dto.type, quantity: dto.quantity, reason: dto.reason },
        tx,
      );

      await this.productsRepository.updateStock(productId, newStock, tx);
      await this.alertsService.syncForProduct(
        { id: productId, currentStock: newStock, minStock: product.minStock },
        tx,
      );

      return movement;
    });
  }
}
