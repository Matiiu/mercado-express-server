import { IntersectionType } from '@nestjs/swagger';

import { PaginationDto } from '@/common/dto/pagination.dto';
import { AlertFilterDto } from '@/alerts/dto/alert-filter.dto';

export class FindAlertsDto extends IntersectionType(AlertFilterDto, PaginationDto) {}
