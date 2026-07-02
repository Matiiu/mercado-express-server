import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import { PRODUCT_MESSAGES, PURCHASE_ORDER_MESSAGES } from '@/common/constants/messages.constants';
import { PrismaService } from '@/prisma/prisma.service';
import { AlertStatus, OrderStatus, PurchaseOrder as PrismaPurchaseOrder } from '@prisma-client';
import { AlertsRepository } from '@/alerts/alerts.repository';
import { AlertsService } from '@/alerts/alerts.service';
import { ProductsRepository } from '@/products/products.repository';
import { CreatePurchaseOrderDto } from '@/purchase-orders/dto/create-purchase-order.dto';
import { RejectPurchaseOrderDto } from '@/purchase-orders/dto/reject-purchase-order.dto';
import { PurchaseOrdersRepository } from '@/purchase-orders/purchase-orders.repository';
import { MIN_QUANTITY_MULTIPLIER } from '@/purchase-orders/constants';

@Injectable()
export class PurchaseOrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly purchaseOrdersRepository: PurchaseOrdersRepository,
    private readonly productsRepository: ProductsRepository,
    private readonly alertsRepository: AlertsRepository,
    private readonly alertsService: AlertsService,
  ) {}

  async create(dto: CreatePurchaseOrderDto): Promise<PrismaPurchaseOrder> {
    const product = await this.productsRepository.findById(dto.productId);
    if (!product) {
      throw new NotFoundException(PRODUCT_MESSAGES.NOT_FOUND(dto.productId));
    }

    const minQuantity = product.minStock * MIN_QUANTITY_MULTIPLIER;
    if (dto.quantity < minQuantity) {
      throw new BadRequestException(PURCHASE_ORDER_MESSAGES.MIN_QUANTITY(minQuantity));
    }

    if (dto.alertId) {
      const alert = await this.alertsRepository.findById(dto.alertId);
      const isValidAlert =
        alert && alert.productId === dto.productId && alert.status === AlertStatus.ACTIVA;
      if (!isValidAlert) {
        throw new BadRequestException(PURCHASE_ORDER_MESSAGES.INVALID_ALERT);
      }
    }

    return this.purchaseOrdersRepository.create({
      productId: dto.productId,
      alertId: dto.alertId ?? null,
      supplier: product.supplier,
      quantity: dto.quantity,
    });
  }

  async approve(id: string): Promise<PrismaPurchaseOrder> {
    await this.findPendingOrThrow(id);
    return this.purchaseOrdersRepository.updateStatus(id, OrderStatus.APROBADA);
  }

  async reject(id: string, dto: RejectPurchaseOrderDto): Promise<PrismaPurchaseOrder> {
    await this.findPendingOrThrow(id);
    return this.purchaseOrdersRepository.reject(id, dto.rejectionReason);
  }

  receive(id: string): Promise<PrismaPurchaseOrder> {
    return this.prisma.$transaction(async (tx) => {
      // 1. La orden debe existir y estar APROBADA; solo se puede recibir
      //    stock de órdenes que ya pasaron por el paso de aprobación.
      const order = await this.purchaseOrdersRepository.findById(id, tx);
      if (!order) {
        throw new NotFoundException(PURCHASE_ORDER_MESSAGES.NOT_FOUND(id));
      }
      if (order.status !== OrderStatus.APROBADA) {
        throw new BadRequestException(PURCHASE_ORDER_MESSAGES.NOT_APPROVED);
      }

      // 2. Se necesita el stock y minStock actuales del producto para
      //    calcular el nuevo stock y para que AlertsService decida si
      //    corresponde abrir/cerrar una alerta.
      const product = await this.productsRepository.findById(order.productId, tx);
      if (!product) {
        throw new NotFoundException(PRODUCT_MESSAGES.NOT_FOUND(order.productId));
      }

      // 3. El stock recibido se suma íntegro al stock actual del producto.
      const newStock = product.currentStock + order.quantity;
      await this.productsRepository.updateStock(order.productId, newStock, tx);

      // 4. Si newStock > minStock, cierra la alerta activa del producto
      await this.alertsService.syncForProduct(
        { id: product.id, currentStock: newStock, minStock: product.minStock },
        tx,
      );

      // 5. Recién al final se marca la orden como RECIBIDA.
      return this.purchaseOrdersRepository.updateStatus(id, OrderStatus.RECIBIDA, tx);
    });
  }

  private async findPendingOrThrow(id: string): Promise<PrismaPurchaseOrder> {
    const order = await this.purchaseOrdersRepository.findById(id);
    if (!order) {
      throw new NotFoundException(PURCHASE_ORDER_MESSAGES.NOT_FOUND(id));
    }
    if (order.status !== OrderStatus.PENDIENTE) {
      throw new BadRequestException(PURCHASE_ORDER_MESSAGES.NOT_PENDING);
    }
    return order;
  }
}
