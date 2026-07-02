// find-products.dto.ts
import { IntersectionType } from '@nestjs/swagger';
import { ProductFilterDto } from './product-filter.dto';
import { PaginationDto } from '@/common/dto/pagination.dto';

export class FindProductsDto extends IntersectionType(ProductFilterDto, PaginationDto) {}
