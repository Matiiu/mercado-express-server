import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  DEFAULT_PAGINATION_LIMIT,
  DEFAULT_PAGINATION_PAGE,
} from '@/common/constants/pagination.contants';

export class PaginationDto {
  @ApiPropertyOptional({
    description: 'Numero de pagina (comienza en 1).',
    example: 1,
    minimum: 1,
    default: DEFAULT_PAGINATION_PAGE,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = DEFAULT_PAGINATION_PAGE;

  @ApiPropertyOptional({
    description: 'Cantidad de elementos por pagina.',
    example: 20,
    minimum: 1,
    default: DEFAULT_PAGINATION_LIMIT,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = DEFAULT_PAGINATION_LIMIT;
}
