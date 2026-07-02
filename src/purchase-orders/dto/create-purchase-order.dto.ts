import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsPositive, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { VALIDATION_MESSAGES } from '@/common/constants/messages.constants';

const { PURCHASE_ORDER } = VALIDATION_MESSAGES;

/**
 * RF-04: crea una orden de compra manualmente o a partir de una alerta
 * STOCK_BAJO activa (`alertId` opcional).
 */
export class CreatePurchaseOrderDto {
  @ApiProperty({
    description: 'ID del producto para ordenar.',
    example: 'clx9j4u1q0000abc123def456',
  })
  @IsString()
  @IsNotEmpty({ message: PURCHASE_ORDER.PRODUCT_ID_REQUIRED })
  productId: string;

  @ApiProperty({
    description: 'Cantidad solicitada en la orden.',
    example: 30,
    minimum: 1,
  })
  @IsInt({ message: PURCHASE_ORDER.QUANTITY_REQUIRED })
  @IsPositive({ message: PURCHASE_ORDER.QUANTITY_POSITIVE })
  @Type(() => Number)
  quantity: number;

  @ApiPropertyOptional({
    description: 'ID de alerta asociada (opcional).',
    example: 'clx9j4u1q0000abc123def456',
  })
  @IsOptional()
  @IsString()
  alertId?: string;
}
