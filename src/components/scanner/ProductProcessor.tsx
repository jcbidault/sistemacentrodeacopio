import { useState, useEffect } from 'react';
import { Product } from '../../types';
import { productService } from '../../services/productService';

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

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const foundProduct = await productService.findByBarcode(barcode);
        setProduct(foundProduct);
      } catch (err) {
        setError('Error al buscar el producto');
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
      // Vibrar el dispositivo si está disponible
      if (navigator.vibrate) {
        navigator.vibrate(200);
      }

      // Mostrar mensaje de éxito por 1.5 segundos antes de cerrar
      setTimeout(() => {
        onComplete();
      }, 1500);
    } catch (err) {
      setError('Error al procesar el movimiento');
      if (navigator.vibrate) {
        navigator.vibrate([100, 100, 100]);
      }
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-6 w-full max-w-sm">
          <div className="text-red-600 mb-4">
            <svg className="w-12 h-12 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-center font-medium">{error}</p>
          </div>
          <button
            onClick={onComplete}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Intentar de nuevo
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-6 w-full max-w-sm">
          <div className="text-green-600 mb-4">
            <svg className="w-12 h-12 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <p className="text-center font-medium">¡Movimiento registrado con éxito!</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-sm">
        <h2 className="text-xl font-semibold mb-4 text-center">
          {product ? product.name : 'Producto no encontrado'}
        </h2>

        {product ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de movimiento
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setMovementType('entrada')}
                  className={`p-4 rounded-lg flex flex-col items-center ${
                    movementType === 'entrada'
                      ? 'bg-blue-100 border-2 border-blue-500'
                      : 'bg-gray-100 border-2 border-transparent'
                  }`}
                >
                  <svg className="w-6 h-6 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Entrada</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMovementType('salida')}
                  className={`p-4 rounded-lg flex flex-col items-center ${
                    movementType === 'salida'
                      ? 'bg-blue-100 border-2 border-blue-500'
                      : 'bg-gray-100 border-2 border-transparent'
                  }`}
                >
                  <svg className="w-6 h-6 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                  <span>Salida</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cantidad
              </label>
              <div className="flex items-center justify-center space-x-4">
                <button
                  type="button"
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </button>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="w-20 h-12 text-center text-xl font-semibold rounded-lg border-2 border-gray-300"
                />
                <button
                  type="button"
                  onClick={() => setQuantity(q => q + 1)}
                  className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={onComplete}
                className="py-3 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Procesando...' : 'Confirmar'}
              </button>
            </div>
          </form>
        ) : (
          <div className="text-center">
            <p className="text-gray-500 mb-4">
              No se encontró ningún producto con el código {barcode}
            </p>
            <button
              onClick={onComplete}
              className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Volver a escanear
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
