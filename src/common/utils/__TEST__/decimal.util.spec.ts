import { toNumber } from '@/common/utils/decimal.util';
import { Prisma } from '@prisma-client';

describe('toNumber', () => {
  it('returns the value as-is when it is already a number', () => {
    expect(toNumber(1500)).toBe(1500);
  });

  it('converts a Prisma.Decimal to a number', () => {
    expect(toNumber(new Prisma.Decimal(1500))).toBe(1500);
  });
});
