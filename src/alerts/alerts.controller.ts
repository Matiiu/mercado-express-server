import { Controller, Get, Query } from '@nestjs/common';
import { ApiBadRequestResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { AlertsService } from '@/alerts/alerts.service';
import { FindAlertsDto } from '@/alerts/dto/find-alerts.dto';
import { Alert } from '@/alerts/entities/alert.entity';

/** RF-03: consulta de alertas por estado (ACTIVA o RESUELTA), paginada. */
@Controller('alerts')
@ApiTags('Alertas')
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar alertas con filtros' })
  @ApiOkResponse({ description: 'Listado de alertas.', type: Alert, isArray: true })
  @ApiBadRequestResponse({ description: 'Parametros de consulta invalidos.' })
  findMany(@Query() filter: FindAlertsDto) {
    return this.alertsService.findMany(filter);
  }
}
