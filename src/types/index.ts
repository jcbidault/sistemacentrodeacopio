export interface Product {
  id: string;
  barcode: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  location?: string;
  expirationDate?: Date;
  lastUpdated: Date;
}

export interface ProductMovement {
  id: string;
  productId: string;
  type: 'entrada' | 'salida';
  quantity: number;
  date: Date;
  notes?: string;
  operator: string;
}

export interface ScanResult {
  barcode: string;
  type: 'QR' | 'EAN-13' | 'CODE-128' | 'unknown';
  timestamp: Date;
}
