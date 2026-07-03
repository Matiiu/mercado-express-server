import { IsEnum, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

import { VALIDATION_MESSAGES } from '@/common/constants/messages.constants';
import { AlertStatus } from '@prisma-client';

const { ALERT } = VALIDATION_MESSAGES;

export class AlertFilterDto {
  @ApiPropertyOptional({
    description: 'Estado de la alerta.',
    enum: AlertStatus,
    example: 'ACTIVE',
  })
  @IsOptional()
  @IsEnum(AlertStatus, { message: ALERT.STATUS_INVALID })
  status?: AlertStatus;
}
