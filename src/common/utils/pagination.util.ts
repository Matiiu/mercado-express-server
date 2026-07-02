import { PaginationMeta } from '@/common/interfaces/pagination.interface';

export function paginationMeta(total: number, page: number, limit: number): PaginationMeta {
  const totalPages = Math.ceil(total / limit);
  return {
    total,
    page,
    limit,
    totalPages: totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}
