import { PrismaService } from '@/prisma/prisma.service';
import { Prisma } from '@prisma-client';

/**
 * Cliente de Prisma que puede recibir cualquier repository: la instancia
 * global (`PrismaService`) o un cliente de transacción (`prisma.$transaction`).
 * Permite que varios repositories participen en una misma transacción
 * atómica (ej. ajuste de stock + movimiento + alerta) sin acoplarse entre sí.
 */
export type PrismaClientOrTx = PrismaService | Prisma.TransactionClient;
