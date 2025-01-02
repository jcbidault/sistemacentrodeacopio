import React, { useState } from 'react';
import type { Product } from '../../hooks/useProductDatabase';

interface DuplicateResolutionProps {
  newProduct: Partial<Product>;
  existingProduct: Product;
  confidence: number;
  onMerge: (mergedProduct: Partial<Product>) => void;
  onKeepBoth: () => void;
  onCancel: () => void;
}

export const DuplicateResolution: React.FC<DuplicateResolutionProps> = ({
  newProduct,
  existingProduct,
  confidence,
  onMerge,
  onKeepBoth,
  onCancel,
}) => {
  const [mergedProduct, setMergedProduct] = useState<Partial<Product>>(() => ({
    ...existingProduct,
    quantity: (existingProduct.quantity || 0) + (newProduct.quantity || 0),
  }));

  const renderField = (
    label: string,
    field: keyof Product,
    value1: any,
    value2: any
  ) => {
    const isSame = value1 === value2;
    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-white mb-2">
          {label}
        </label>
        <div className="space-y-2">
          <div className={`flex items-center space-x-2 ${isSame ? 'opacity-50' : ''}`}>
            <input
              type="radio"
              name={field}
              checked={mergedProduct[field] === value1}
              onChange={() => setMergedProduct(prev => ({ ...prev, [field]: value1 }))}
              className="text-blue-500"
            />
            <span className="text-white">{value1 || '(vacío)'}</span>
            {!isSame && <span className="text-xs text-white/60">Nuevo</span>}
          </div>
          {!isSame && (
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                name={field}
                checked={mergedProduct[field] === value2}
                onChange={() => setMergedProduct(prev => ({ ...prev, [field]: value2 }))}
                className="text-blue-500"
              />
              <span className="text-white">{value2 || '(vacío)'}</span>
              <span className="text-xs text-white/60">Existente</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 bg-black/40 backdrop-blur-sm rounded-lg">
      <div className="mb-4">
        <h3 className="text-lg font-medium text-white">
          Producto Duplicado Detectado
        </h3>
        <p className="text-sm text-white/60">
          {Math.round(confidence * 100)}% de similitud
        </p>
      </div>

      <div className="space-y-4">
        {renderField('Nombre', 'name', newProduct.name, existingProduct.name)}
        {renderField('Descripción', 'description', newProduct.description, existingProduct.description)}
        {renderField('Categoría', 'category', newProduct.category, existingProduct.category)}

        <div className="mb-4">
          <label className="block text-sm font-medium text-white mb-2">
            Cantidad Total
          </label>
          <input
            type="number"
            value={mergedProduct.quantity || 0}
            onChange={(e) => setMergedProduct(prev => ({
              ...prev,
              quantity: parseInt(e.target.value) || 0,
            }))}
            className="w-full px-3 py-2 bg-white/10 rounded-md text-white"
          />
          <p className="text-sm text-white/60 mt-1">
            Nuevo: {newProduct.quantity || 0} + Existente: {existingProduct.quantity || 0}
          </p>
        </div>

        {/* Metadata */}
        <div className="border-t border-white/10 pt-4">
          <h4 className="text-sm font-medium text-white mb-2">Metadata</h4>
          {renderField('Marca', 'metadata.brand', 
            newProduct.metadata?.brand, 
            existingProduct.metadata?.brand
          )}
          {renderField('Tamaño', 'metadata.size',
            newProduct.metadata?.size,
            existingProduct.metadata?.size
          )}
          {renderField('Peso', 'metadata.weight',
            newProduct.metadata?.weight,
            existingProduct.metadata?.weight
          )}
          {renderField('Unidad', 'metadata.unit',
            newProduct.metadata?.unit,
            existingProduct.metadata?.unit
          )}
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-white/10">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-white bg-white/10 rounded-md"
          >
            Cancelar
          </button>
          <button
            onClick={onKeepBoth}
            className="px-4 py-2 text-white bg-yellow-500 rounded-md"
          >
            Mantener Ambos
          </button>
          <button
            onClick={() => onMerge(mergedProduct)}
            className="px-4 py-2 text-white bg-blue-500 rounded-md"
          >
            Fusionar
          </button>
        </div>
      </div>
    </div>
  );
};
