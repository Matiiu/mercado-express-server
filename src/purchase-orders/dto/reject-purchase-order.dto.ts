import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

import { VALIDATION_MESSAGES } from '@/common/constants/messages.constants';

const { PURCHASE_ORDER } = VALIDATION_MESSAGES;

export class RejectPurchaseOrderDto {
  @ApiProperty({
    description: 'Motivo del rechazo de la orden.',
    example: 'Proveedor sin disponibilidad para la fecha requerida',
    minLength: 10,
  })
  @IsString()
  @IsNotEmpty({ message: PURCHASE_ORDER.REJECTION_REASON_REQUIRED })
  @MinLength(10, { message: PURCHASE_ORDER.REJECTION_REASON_LENGTH })
  @Transform(({ value }: { value: string }) => value?.trim() ?? null)
  rejectionReason: string;
}
