import { PaginationMeta } from '@/common/interfaces/pagination.interface';
import { Product } from '@/products/entities/product.entity';

export interface ProductWithPagination {
  products: Product[];
  meta: PaginationMeta;
}
