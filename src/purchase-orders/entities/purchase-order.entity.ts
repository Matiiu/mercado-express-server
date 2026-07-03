import { OrderStatus } from '@prisma-client';
import { ApiProperty } from '@nestjs/swagger';

export class PurchaseOrder {
  @ApiProperty({
    description: 'ID unico de la orden de compra.',
    example: 'clx9j4u1q0000abc123def456',
  })
  id: string;

  @ApiProperty({ description: 'ID del producto asociado.', example: 'clx9j4u1q0000abc123def456' })
  productId: string;

  @ApiProperty({
    description: 'ID de alerta que origino la orden, si aplica.',
    nullable: true,
    example: null,
  })
  alertId: string | null;

  @ApiProperty({
    description: 'Proveedor al que se emite la orden.',
    example: 'Distribuidora Andina',
  })
  supplier: string;

  @ApiProperty({ description: 'Cantidad solicitada.', example: 30 })
  quantity: number;

  @ApiProperty({ description: 'Estado actual de la orden.', enum: OrderStatus, example: 'PENDING' })
  status: OrderStatus;

  @ApiProperty({
    description: 'Motivo de rechazo, solo cuando el estado es rechazado.',
    nullable: true,
    example: null,
  })
  rejectionReason: string | null;

  @ApiProperty({ description: 'Fecha de creacion.', example: '2026-07-02T14:30:00.000Z' })
  createdAt: Date;

  @ApiProperty({
    description: 'Fecha de ultima actualizacion.',
    example: '2026-07-02T14:30:00.000Z',
  })
  updatedAt: Date;
}
