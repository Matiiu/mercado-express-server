import { PaginationMeta } from '@/common/interfaces/pagination.interface';
import { Alert } from '@/alerts/entities/alert.entity';

export interface AlertsWithPagination {
  alerts: Alert[];
  meta: PaginationMeta;
}
