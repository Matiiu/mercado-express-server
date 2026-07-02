import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AlertsModule } from '@/alerts/alerts.module';
import { PrismaModule } from '@/prisma/prisma.module';
import { ProductsModule } from '@/products/products.module';
import { PurchaseOrdersModule } from '@/purchase-orders/purchase-orders.module';
import { StockMovementsModule } from '@/stock-movements/stock-movements.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
    }),
    PrismaModule,
    ProductsModule,
    AlertsModule,
    StockMovementsModule,
    PurchaseOrdersModule,
  ],
})
export class AppModule {}
