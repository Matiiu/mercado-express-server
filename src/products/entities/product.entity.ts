/**
 * Forma de respuesta pública de un producto. `price` se expone como
 * `number` (convertido desde `Prisma.Decimal` por el mapper del service).
 */
import { ApiProperty } from '@nestjs/swagger';

export class Product {
  @ApiProperty({ description: 'ID unico del producto.', example: 'clx9j4u1q0000abc123def456' })
  id: string;

  @ApiProperty({ description: 'Nombre del producto.', example: 'Arroz integral 1kg' })
  name: string;

  @ApiProperty({ description: 'Codigo SKU unico.', example: 'ARROZ123' })
  sku: string;

  @ApiProperty({ description: 'Categoria comercial.', example: 'Despensa' })
  category: string;

  @ApiProperty({ description: 'Precio unitario.', example: 12.5 })
  price: number;

  @ApiProperty({ description: 'Stock actual disponible.', example: 48 })
  currentStock: number;

  @ApiProperty({ description: 'Stock minimo de seguridad.', example: 10 })
  minStock: number;

  @ApiProperty({ description: 'Proveedor principal.', example: 'Distribuidora Andina' })
  supplier: string;

  @ApiProperty({ description: 'Fecha de creacion.', example: '2026-07-02T14:30:00.000Z' })
  createdAt: Date;

  @ApiProperty({
    description: 'Fecha de ultima actualizacion.',
    example: '2026-07-02T14:30:00.000Z',
  })
  updatedAt: Date;
}
