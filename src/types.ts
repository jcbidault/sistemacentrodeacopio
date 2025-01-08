export interface Product {
  id: string;
  name: string;
  category: string;
  barcode: string;
  quantity: number;
  minQuantity: number;
  description?: string;
  location?: string;
  createdAt: string;
  updatedAt: string;
}

export enum MovementType {
  ALTA = 'ALTA',
  BAJA = 'BAJA',
  ENTRADA = 'ENTRADA',
  SALIDA = 'SALIDA'
}

export interface ProductMovement {
  id: string;
  productId: string;
  type: MovementType;
  quantity: number;
  date: string;
  notes?: string;
}
