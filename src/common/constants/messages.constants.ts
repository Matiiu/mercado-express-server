/**
 * Mensajes centralizados de validación (class-validator) y de errores de
 * negocio, agrupados por dominio. Evita strings sueltos repetidos en el
 * código y facilita mantener consistencia en las respuestas de la API.
 */
import { MIN_QUANTITY_MULTIPLIER } from '@/purchase-orders/constants';

export const VALIDATION_MESSAGES = {
  PRODUCT: {
    NAME_REQUIRED: 'El nombre es obligatorio',
    NAME_LENGTH: 'El nombre debe tener entre 3 y 100 caracteres',
    SKU_REQUIRED: 'El código SKU es obligatorio',
    SKU_LENGTH: 'El código SKU debe tener entre 6 y 20 caracteres',
    SKU_FORMAT: 'El código SKU debe ser alfanumérico',
    CATEGORY_REQUIRED: 'La categoría es obligatoria',
    PRICE_REQUIRED: 'El precio es obligatorio',
    PRICE_POSITIVE: 'El precio debe ser mayor a 0',
    CURRENT_STOCK_MIN: 'El stock actual no puede ser negativo',
    MIN_STOCK_REQUIRED: 'El stock mínimo es obligatorio',
    MIN_STOCK_POSITIVE: 'El stock mínimo debe ser mayor a 0',
    SUPPLIER_REQUIRED: 'El proveedor es obligatorio',
    STOCK_MIN_FILTER_INVALID: 'El stock mínimo del filtro debe ser un número mayor o igual a 0',
    STOCK_MAX_FILTER_INVALID: 'El stock máximo del filtro debe ser un número mayor o igual a 0',
    ACTIVE_ALERT_FILTER_INVALID: 'El filtro de alerta activa debe ser un valor booleano',
  },
  STOCK_MOVEMENT: {
    TYPE_INVALID: 'El tipo de movimiento es obligatorio y debe ser ENTRADA o SALIDA',
    QUANTITY_REQUIRED: 'La cantidad es obligatoria',
    QUANTITY_POSITIVE: 'La cantidad debe ser mayor a 0',
    REASON_REQUIRED: 'El motivo del movimiento es obligatorio',
  },
  PURCHASE_ORDER: {
    PRODUCT_ID_REQUIRED: 'El producto es obligatorio',
    QUANTITY_REQUIRED: 'La cantidad es obligatoria',
    QUANTITY_POSITIVE: 'La cantidad debe ser mayor a 0',
    REJECTION_REASON_REQUIRED: 'El motivo de rechazo es obligatorio',
    REJECTION_REASON_LENGTH: 'El motivo de rechazo debe tener al menos 10 caracteres',
  },
  ALERT: {
    STATUS_INVALID: 'El estado del filtro debe ser ACTIVA o RESUELTA',
  },
} as const;

export const PRODUCT_MESSAGES = {
  SKU_CONFLICT: (sku: string) => `Ya existe un producto con el SKU "${sku}"`,
  NOT_FOUND: (id: string) => `Producto con id "${id}" no fue encontrado`,
  STOCK_MIN_GREATER_THAN_MAX: 'El stock mínimo no puede ser mayor al stock máximo',
} as const;

export const STOCK_MOVEMENT_MESSAGES = {
  INSUFFICIENT_STOCK: (missing: number) =>
    `No se puede realizar la salida: el stock quedaría negativo, faltan ${missing} unidad(es)`,
} as const;

export const PURCHASE_ORDER_MESSAGES = {
  NOT_FOUND: (id: string) => `Orden de compra con id "${id}" no fue encontrada`,
  MIN_QUANTITY: (min: number) =>
    `La cantidad de la orden debe ser de al menos ${min} unidad(es) (${MIN_QUANTITY_MULTIPLIER}x el stock mínimo del producto)`,
  INVALID_ALERT: 'La alerta indicada no existe, no pertenece al producto o no está activa',
  NOT_PENDING: 'Solo se pueden aprobar o rechazar órdenes en estado PENDIENTE',
  NOT_APPROVED: 'Solo se pueden recibir órdenes en estado APROBADA',
} as const;
