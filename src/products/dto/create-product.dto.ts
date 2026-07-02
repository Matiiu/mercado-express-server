import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  Length,
  Matches,
  Min,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

import { VALIDATION_MESSAGES } from '@/common/constants/messages.constants';

const { PRODUCT } = VALIDATION_MESSAGES;

export class CreateProductDto {
  @ApiProperty({
    description: 'Nombre del producto.',
    example: 'Arroz integral 1kg',
    minLength: 3,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty({ message: PRODUCT.NAME_REQUIRED })
  @Length(3, 100, { message: PRODUCT.NAME_LENGTH })
  @Transform(({ value }: { value: string }) => value?.trim() ?? null)
  name: string;

  @ApiProperty({
    description: 'Codigo SKU unico del producto.',
    example: 'ARROZ123',
    minLength: 6,
    maxLength: 20,
  })
  @IsString()
  @IsNotEmpty({ message: PRODUCT.SKU_REQUIRED })
  @Length(6, 20, { message: PRODUCT.SKU_LENGTH })
  @Matches(/^[A-Za-z0-9]+$/, { message: PRODUCT.SKU_FORMAT })
  @Transform(({ value }: { value: string }) => value?.trim() ?? null)
  sku: string;

  @ApiProperty({
    description: 'Categoria comercial del producto.',
    example: 'Despensa',
  })
  @IsString()
  @IsNotEmpty({ message: PRODUCT.CATEGORY_REQUIRED })
  @Transform(({ value }: { value: string }) => value?.trim() ?? null)
  category: string;

  @ApiProperty({
    description: 'Precio unitario del producto.',
    example: 12.5,
  })
  @IsNumber({}, { message: PRODUCT.PRICE_REQUIRED })
  @IsPositive({ message: PRODUCT.PRICE_POSITIVE })
  @Type(() => Number)
  price: number;

  @ApiProperty({
    description: 'Stock minimo para disparar alerta de bajo inventario.',
    example: 10,
    minimum: 1,
  })
  @IsInt({ message: PRODUCT.MIN_STOCK_REQUIRED })
  @Min(1, { message: PRODUCT.MIN_STOCK_POSITIVE })
  @Type(() => Number)
  minStock: number;

  @ApiProperty({
    description: 'Proveedor principal del producto.',
    example: 'Distribuidora Andina',
  })
  @IsString()
  @IsNotEmpty({ message: PRODUCT.SUPPLIER_REQUIRED })
  @Transform(({ value }: { value: string }) => value?.trim() ?? null)
  supplier: string;
}
