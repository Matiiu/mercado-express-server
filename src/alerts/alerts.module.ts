import { Module } from '@nestjs/common';

import { AlertsController } from '@/alerts/alerts.controller';
import { AlertsRepository } from '@/alerts/alerts.repository';
import { AlertsService } from '@/alerts/alerts.service';

@Module({
  controllers: [AlertsController],
  providers: [AlertsService, AlertsRepository],
  exports: [AlertsService, AlertsRepository],
})
export class AlertsModule {}
