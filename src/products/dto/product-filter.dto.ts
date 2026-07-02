import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

import { VALIDATION_MESSAGES } from '@/common/constants/messages.constants';

const { PRODUCT } = VALIDATION_MESSAGES;

/**
 * Filtros de consulta de inventario (RF-06): por categoría, proveedor,
 * estado de alerta activa y rango de stock.
 */
export class ProductFilterDto {
  @ApiPropertyOptional({
    description: 'Filtra por categoria exacta.',
    example: 'Despensa',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  category?: string;

  @ApiPropertyOptional({
    description: 'Filtra por proveedor exacto.',
    example: 'Distribuidora Andina',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  supplier?: string;

  @ApiPropertyOptional({
    description: 'Filtra productos con alerta activa.',
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: PRODUCT.ACTIVE_ALERT_FILTER_INVALID })
  @Type(() => Boolean)
  activeAlert?: boolean;

  @ApiPropertyOptional({
    description: 'Filtra productos con stock actual mayor o igual a este valor.',
    example: 5,
    minimum: 0,
  })
  @IsOptional()
  @IsInt({ message: PRODUCT.STOCK_MIN_FILTER_INVALID })
  @Min(0, { message: PRODUCT.STOCK_MIN_FILTER_INVALID })
  @Type(() => Number)
  stockMin?: number;

  @ApiPropertyOptional({
    description: 'Filtra productos con stock actual menor o igual a este valor.',
    example: 100,
    minimum: 0,
  })
  @IsOptional()
  @IsInt({ message: PRODUCT.STOCK_MAX_FILTER_INVALID })
  @Min(0, { message: PRODUCT.STOCK_MAX_FILTER_INVALID })
  @Type(() => Number)
  stockMax?: number;
}
