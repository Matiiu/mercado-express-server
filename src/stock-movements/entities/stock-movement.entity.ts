import { MovementType } from '@prisma-client';
import { ApiProperty } from '@nestjs/swagger';

/** RF-02: forma de respuesta pública de un movimiento de inventario. */
export class StockMovement {
  @ApiProperty({ description: 'ID unico del movimiento.', example: 'clx9j4u1q0000abc123def456' })
  id: string;

  @ApiProperty({ description: 'ID del producto afectado.', example: 'clx9j4u1q0000abc123def456' })
  productId: string;

  @ApiProperty({ description: 'Tipo de movimiento.', enum: MovementType, example: 'OUT' })
  type: MovementType;

  @ApiProperty({ description: 'Cantidad del movimiento.', example: 5 })
  quantity: number;

  @ApiProperty({ description: 'Motivo registrado.', example: 'Venta mostrador' })
  reason: string;

  @ApiProperty({
    description: 'Fecha de creacion del movimiento.',
    example: '2026-07-02T14:30:00.000Z',
  })
  createdAt: Date;
}
