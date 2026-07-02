/**
 * Códigos de error conocidos de Prisma (https://www.prisma.io/docs/orm/reference/error-reference)
 * usados para traducir errores de bajo nivel a excepciones HTTP de dominio
 * en las capas de repository/service.
 */
export enum PrismaErrorCode {
  UNIQUE_CONSTRAINT_VIOLATION = 'P2002',
  RECORD_NOT_FOUND = 'P2025',
  FOREIGN_KEY_CONSTRAINT_VIOLATION = 'P2003',
}
