import { useState, useEffect } from 'react';
import { Product } from '../../types';
import { productService } from '../../services/productService';
import { ProductRegistrationForm } from '../products/ProductRegistrationForm';

interface ProductProcessorProps {
  barcode: string;
  onComplete: () => void;
}

export const ProductProcessor = ({ barcode, onComplete }: ProductProcessorProps) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [movementType, setMovementType] = useState<'entrada' | 'salida'>('entrada');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [productNotFound, setProductNotFound] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const foundProduct = await productService.findByBarcode(barcode);
        if (foundProduct) {
          setProduct(foundProduct);
          setProductNotFound(false);
        } else {
          setProductNotFound(true);
        }
      } catch (err) {
        console.error('Error buscando producto:', err);
        setError('Error al buscar el producto');
        setProductNotFound(true);
      }
    };
    fetchProduct();
  }, [barcode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await productService.registerMovement({
        productId: barcode,
        type: movementType,
        quantity,
        date: new Date(),
        operator: 'Usuario Actual',
        notes: ''
      });

      setSuccess(true);
      if (navigator.vibrate) {
        navigator.vibrate(200);
      }

      setTimeout(() => {
        onComplete();
      }, 1500);
    } catch (err) {
      setError('Error al registrar el movimiento');
    } finally {
      setLoading(false);
    }
  };

  const handleRegistrationSuccess = () => {
    setShowRegistrationForm(false);
    // Recargar el producto después del registro
    const fetchProduct = async () => {
      try {
        const foundProduct = await productService.findByBarcode(barcode);
        setProduct(foundProduct);
        setProductNotFound(false);
      } catch (err) {
        setError('Error al buscar el producto');
      }
    };
    fetchProduct();
  };

  if (showRegistrationForm) {
    return (
      <ProductRegistrationForm
        barcode={barcode}
        onSuccess={handleRegistrationSuccess}
        onCancel={() => {
          setShowRegistrationForm(false);
          onComplete();
        }}
      />
    );
  }

  if (productNotFound) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto">
        <h2 className="text-xl font-semibold mb-4">Producto No Encontrado</h2>
        <p className="text-gray-600 mb-6">
          El producto con código de barras <strong>{barcode}</strong> no está registrado en el sistema.
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onComplete}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={() => setShowRegistrationForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Registrar Producto
          </button>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-4 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-2 text-gray-600">Buscando producto...</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="bg-green-50 p-4 rounded-lg text-center">
        <div className="text-green-600 text-xl mb-2">✓</div>
        <p className="text-green-700">Movimiento registrado con éxito</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4">{product.name}</h2>
      <div className="mb-4 text-sm text-gray-600">
        <p>Categoría: {product.category}</p>
        <p>Unidad: {product.unit}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de Movimiento
          </label>
          <div className="flex space-x-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                value="entrada"
                checked={movementType === 'entrada'}
                onChange={(e) => setMovementType(e.target.value as 'entrada' | 'salida')}
                className="form-radio text-blue-600"
              />
              <span className="ml-2">Entrada</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                value="salida"
                checked={movementType === 'salida'}
                onChange={(e) => setMovementType(e.target.value as 'entrada' | 'salida')}
                className="form-radio text-blue-600"
              />
              <span className="ml-2">Salida</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cantidad
          </label>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onComplete}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Procesando...' : 'Registrar Movimiento'}
          </button>
        </div>
      </form>
    </div>
  );
};
