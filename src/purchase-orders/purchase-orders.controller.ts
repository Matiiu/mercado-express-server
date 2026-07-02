import { Body, Controller, Param, Patch, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { RejectPurchaseOrderDto } from './dto/reject-purchase-order.dto';
import { PurchaseOrdersService } from './purchase-orders.service';
import { PurchaseOrder } from '@/purchase-orders/entities/purchase-order.entity';

@Controller('purchase-orders')
@ApiTags('Ordenes de compra')
export class PurchaseOrdersController {
  constructor(private readonly purchaseOrdersService: PurchaseOrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Crear orden de compra' })
  @ApiCreatedResponse({ description: 'Orden de compra creada correctamente.', type: PurchaseOrder })
  @ApiBadRequestResponse({ description: 'Datos de entrada invalidos.' })
  create(@Body() dto: CreatePurchaseOrderDto) {
    return this.purchaseOrdersService.create(dto);
  }

  @Patch(':id/approve')
  @ApiOperation({ summary: 'Aprobar orden de compra' })
  @ApiParam({ name: 'id', description: 'ID de la orden de compra' })
  @ApiOkResponse({ description: 'Orden de compra aprobada.', type: PurchaseOrder })
  @ApiBadRequestResponse({ description: 'No se pudo aprobar la orden.' })
  approve(@Param('id') id: string) {
    return this.purchaseOrdersService.approve(id);
  }

  @Patch(':id/reject')
  @ApiOperation({ summary: 'Rechazar orden de compra' })
  @ApiParam({ name: 'id', description: 'ID de la orden de compra' })
  @ApiOkResponse({ description: 'Orden de compra rechazada.', type: PurchaseOrder })
  @ApiBadRequestResponse({ description: 'No se pudo rechazar la orden.' })
  reject(@Param('id') id: string, @Body() dto: RejectPurchaseOrderDto) {
    return this.purchaseOrdersService.reject(id, dto);
  }

  @Patch(':id/receive')
  @ApiOperation({ summary: 'Marcar orden de compra como recibida' })
  @ApiParam({ name: 'id', description: 'ID de la orden de compra' })
  @ApiOkResponse({ description: 'Orden de compra recibida.', type: PurchaseOrder })
  @ApiBadRequestResponse({ description: 'No se pudo registrar la recepcion.' })
  receive(@Param('id') id: string) {
    return this.purchaseOrdersService.receive(id);
  }
}
