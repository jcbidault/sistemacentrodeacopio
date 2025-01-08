import React, { useState } from 'react';
import { ProductForm } from '../components/products/ProductForm';
import { productService } from '../services/productService';
import { Product } from '../types';
import { toast } from 'react-hot-toast';
import { BarcodeScanner } from '../components/scanner/BarcodeScanner';
import { BarcodeFormat } from '@zxing/library';

export const ProductRegistrationPage: React.FC = () => {
  const [scannedBarcode, setScannedBarcode] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

  const handleScanComplete = async ({ text }: { text: string; format: BarcodeFormat }) => {
    setScannedBarcode(text);
    setShowScanner(false);
    
    try {
      const existingProduct = await productService.findByBarcode(text);
      if (existingProduct) {
        toast.error('Ya existe un producto con este código de barras');
      }
    } catch (error) {
      console.error('Error al verificar el código de barras:', error);
      toast.error('Error al verificar el código de barras');
    }
  };

  const handleSubmit = async (productData: Omit<Product, 'id' | 'lastUpdated'>) => {
    setIsLoading(true);
    try {
      await productService.addProduct(productData);
      toast.success('Producto registrado exitosamente');
      setScannedBarcode('');
    } catch (error) {
      console.error('Error al registrar el producto:', error);
      toast.error(error instanceof Error ? error.message : 'Error al registrar el producto');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Registro de Productos</h1>
      
      {showScanner ? (
        <div className="mb-6">
          <BarcodeScanner
            onResult={handleScanComplete}
            onError={(error) => {
              console.error('Error del scanner:', error);
              toast.error('Error al escanear el código');
            }}
          />
          <button
            onClick={() => setShowScanner(false)}
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Cancelar Escaneo
          </button>
        </div>
      ) : (
        <div className="mb-6">
          <button
            onClick={() => setShowScanner(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Escanear Código de Barras
          </button>
        </div>
      )}

      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <ProductForm
          barcode={scannedBarcode}
          onSubmit={handleSubmit}
          onCancel={() => setScannedBarcode('')}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};
