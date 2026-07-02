import { Module } from '@nestjs/common';

import { AlertsModule } from '@/alerts/alerts.module';
import { ProductsModule } from '@/products/products.module';
import { PurchaseOrdersController } from '@/purchase-orders/purchase-orders.controller';
import { PurchaseOrdersRepository } from '@/purchase-orders/purchase-orders.repository';
import { PurchaseOrdersService } from '@/purchase-orders/purchase-orders.service';

@Module({
  imports: [ProductsModule, AlertsModule],
  controllers: [PurchaseOrdersController],
  providers: [PurchaseOrdersService, PurchaseOrdersRepository],
})
export class PurchaseOrdersModule {}
