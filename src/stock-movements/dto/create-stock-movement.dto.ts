import { IsEnum, IsInt, IsNotEmpty, IsPositive, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { VALIDATION_MESSAGES } from '@/common/constants/messages.constants';
import { MovementType } from '@prisma-client';

const { STOCK_MOVEMENT } = VALIDATION_MESSAGES;

export class CreateStockMovementDto {
  @ApiProperty({
    description: 'Tipo de movimiento de inventario.',
    enum: MovementType,
    example: 'IN',
  })
  @IsEnum(MovementType, { message: STOCK_MOVEMENT.TYPE_INVALID })
  type: MovementType;

  @ApiProperty({
    description: 'Cantidad del movimiento.',
    example: 20,
    minimum: 1,
  })
  @IsInt({ message: STOCK_MOVEMENT.QUANTITY_REQUIRED })
  @IsPositive({ message: STOCK_MOVEMENT.QUANTITY_POSITIVE })
  quantity: number;

  @ApiProperty({
    description: 'Motivo del movimiento.',
    example: 'Ingreso por compra a proveedor',
  })
  @IsString()
  @IsNotEmpty({ message: STOCK_MOVEMENT.REASON_REQUIRED })
  reason: string;
}
