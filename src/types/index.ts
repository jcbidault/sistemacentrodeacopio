/** Representa un producto en el sistema de inventario */
export interface Product {
  /** Identificador único del producto */
  id: string;
  /** Código de barras del producto */
  barcode: string;
  /** Nombre del producto */
  name: string;
  /** Categoría del producto */
  category: string;
  /** Cantidad actual en inventario */
  quantity: number;
  /** Unidad de medida */
  unit: 'pieza' | 'kg' | 'litro' | 'paquete';
  /** Ubicación en el almacén (opcional) */
  location?: string;
  /** Fecha de caducidad (opcional) */
  expirationDate?: Date;
  /** Última actualización del producto */
  lastUpdated: Date;
  /** Estado del producto */
  status: 'active' | 'inactive' | 'discontinued';
  /** Descripción del producto (opcional) */
  description?: string;
  /** Cantidad mínima antes de alertar */
  minQuantity?: number;
}

/** Tipo de movimiento en inventario */
export type MovementType = 'entrada' | 'salida' | 'ajuste' | 'merma';

/** Representa un movimiento de inventario */
export interface ProductMovement {
  /** Identificador único del movimiento */
  id: string;
  /** ID del producto asociado */
  productId: string;
  /** Tipo de movimiento */
  type: MovementType;
  /** Cantidad del movimiento */
  quantity: number;
  /** Fecha del movimiento */
  date: Date;
  /** Notas adicionales */
  notes?: string;
  /** Operador que realizó el movimiento */
  operator: string;
  /** Razón del movimiento */
  reason?: string;
}

/** Resultado de un escaneo de código */
export interface ScanResult {
  /** Código escaneado */
  barcode: string;
  /** Tipo de código */
  type: 'QR' | 'EAN-13' | 'CODE-128' | 'unknown';
  /** Momento del escaneo */
  timestamp: Date;
  /** Indica si el escaneo fue exitoso */
  success: boolean;
  /** Mensaje de error si el escaneo falló */
  error?: string;
}
