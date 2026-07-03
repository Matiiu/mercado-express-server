import { AlertStatus, AlertType } from '@prisma-client';
import { ApiProperty } from '@nestjs/swagger';

export class Alert {
  @ApiProperty({ description: 'ID unico de la alerta.', example: 'clx9j4u1q0000abc123def456' })
  id: string;

  @ApiProperty({
    description: 'ID del producto relacionado.',
    example: 'clx9j4u1q0000abc123def456',
  })
  productId: string;

  @ApiProperty({ description: 'Tipo de alerta.', enum: AlertType, example: 'LOW_STOCK' })
  type: AlertType;

  @ApiProperty({ description: 'Estado de la alerta.', enum: AlertStatus, example: 'ACTIVE' })
  status: AlertStatus;

  @ApiProperty({ description: 'Fecha de creacion.', example: '2026-07-02T14:30:00.000Z' })
  createdAt: Date;

  @ApiProperty({
    description: 'Fecha de resolucion. Null cuando sigue activa.',
    nullable: true,
    example: null,
  })
  resolvedAt: Date | null;
}
