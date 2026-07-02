import { Prisma } from '@prisma-client';

/**
 * Convierte un campo `Decimal` de Prisma (o un número plano) a `number`
 * para que las respuestas de la API expongan valores numéricos consistentes
 * en lugar del objeto/string interno de Decimal.js.
 */
export function toNumber(value: Prisma.Decimal | number): number {
  return typeof value === 'number' ? value : value.toNumber();
}
