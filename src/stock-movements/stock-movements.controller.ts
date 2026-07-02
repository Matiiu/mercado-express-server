import { Body, Controller, Param, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import { CreateStockMovementDto } from './dto/create-stock-movement.dto';
import { StockMovementsService } from './stock-movements.service';
import { StockMovement } from '@/stock-movements/entities/stock-movement.entity';

@Controller('products/:productId/stock-movements')
@ApiTags('Movimientos de stock')
export class StockMovementsController {
  constructor(private readonly stockMovementsService: StockMovementsService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar movimiento de stock para un producto' })
  @ApiParam({ name: 'productId', description: 'ID del producto' })
  @ApiCreatedResponse({
    description: 'Movimiento de stock creado correctamente.',
    type: StockMovement,
  })
  @ApiBadRequestResponse({ description: 'Datos de entrada invalidos.' })
  create(@Param('productId') productId: string, @Body() dto: CreateStockMovementDto) {
    return this.stockMovementsService.create(productId, dto);
  }
}
