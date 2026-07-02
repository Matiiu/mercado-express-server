import { Module } from '@nestjs/common';

import { AlertsModule } from '@/alerts/alerts.module';
import { ProductsModule } from '@/products/products.module';
import { StockMovementsController } from '@/stock-movements/stock-movements.controller';
import { StockMovementsRepository } from '@/stock-movements/stock-movements.repository';
import { StockMovementsService } from '@/stock-movements/stock-movements.service';

@Module({
  imports: [ProductsModule, AlertsModule],
  controllers: [StockMovementsController],
  providers: [StockMovementsService, StockMovementsRepository],
})
export class StockMovementsModule {}
