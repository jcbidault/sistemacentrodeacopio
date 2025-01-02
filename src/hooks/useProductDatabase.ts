import { useState, useCallback } from 'react';

export interface Product {
  barcode: string;
  name: string;
  description?: string;
  category?: string;
  quantity: number;
  lastUpdated: number;
  status: 'active' | 'inactive';
  metadata?: {
    brand?: string;
    size?: string;
    weight?: string;
    unit?: string;
  };
}

interface ProductLookupResult {
  found: boolean;
  product?: Product;
  alternatives?: Product[];
}

export const useProductDatabase = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Buscar producto por código de barras
  const lookupProduct = useCallback(async (barcode: string): Promise<ProductLookupResult> => {
    setIsLoading(true);
    setError(null);

    try {
      // 1. Buscar en base de datos local
      const response = await fetch(`/api/products/${barcode}`);
      if (response.ok) {
        const product = await response.json();
        return { found: true, product };
      }

      // 2. Buscar en APIs externas (ejemplo: Open Food Facts)
      const externalResponse = await fetch(
        `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`
      );
      
      if (externalResponse.ok) {
        const data = await externalResponse.json();
        if (data.status === 1) {
          const product: Product = {
            barcode,
            name: data.product.product_name,
            description: data.product.generic_name,
            category: data.product.categories_tags?.[0],
            quantity: 0,
            lastUpdated: Date.now(),
            status: 'active',
            metadata: {
              brand: data.product.brands,
              size: data.product.quantity,
              weight: data.product.serving_size,
              unit: data.product.serving_quantity_unit,
            },
          };
          return { found: true, product };
        }
      }

      // 3. Si no se encuentra, buscar productos similares
      const similarResponse = await fetch(`/api/products/similar/${barcode}`);
      if (similarResponse.ok) {
        const alternatives = await similarResponse.json();
        return { found: false, alternatives };
      }

      return { found: false };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      return { found: false };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Registrar nuevo producto
  const registerProduct = useCallback(async (product: Omit<Product, 'lastUpdated'>) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...product,
          lastUpdated: Date.now(),
        }),
      });

      if (!response.ok) {
        throw new Error('Error al registrar el producto');
      }

      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Actualizar producto existente
  const updateProduct = useCallback(async (barcode: string, updates: Partial<Product>) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/products/${barcode}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...updates,
          lastUpdated: Date.now(),
        }),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar el producto');
      }

      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Actualizar cantidad
  const updateQuantity = useCallback(async (barcode: string, change: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/products/${barcode}/quantity`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          change,
          timestamp: Date.now(),
        }),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar la cantidad');
      }

      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    lookupProduct,
    registerProduct,
    updateProduct,
    updateQuantity,
  };
};
