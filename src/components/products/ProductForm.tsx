import React, { useState, useEffect } from 'react';
import type { Product } from '../../hooks/useProductDatabase';

interface ProductFormProps {
  barcode: string;
  initialData?: Partial<Product>;
  onSubmit: (data: Omit<Product, 'lastUpdated'>) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  barcode,
  initialData,
  onSubmit,
  onCancel,
  isLoading,
}) => {
  const [formData, setFormData] = useState<Partial<Product>>({
    barcode,
    quantity: 0,
    status: 'active',
    ...initialData,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      ...initialData,
    }));
  }, [initialData]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    if (formData.quantity === undefined || formData.quantity < 0) {
      newErrors.quantity = 'La cantidad debe ser un número positivo';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      await onSubmit(formData as Omit<Product, 'lastUpdated'>);
    } catch (error) {
      console.error('Error al guardar:', error);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'quantity' ? Number(value) : value,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4">
      <div>
        <label className="block text-sm font-medium text-white mb-1">
          Código de Barras
        </label>
        <input
          type="text"
          value={barcode}
          disabled
          className="w-full px-3 py-2 bg-white/10 rounded-md text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-white mb-1">
          Nombre del Producto*
        </label>
        <input
          type="text"
          name="name"
          value={formData.name || ''}
          onChange={handleChange}
          className={`w-full px-3 py-2 bg-white/10 rounded-md text-white border ${
            errors.name ? 'border-red-500' : 'border-transparent'
          }`}
          placeholder="Ej: Leche Entera 1L"
        />
        {errors.name && (
          <p className="text-red-500 text-xs mt-1">{errors.name}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-white mb-1">
          Descripción
        </label>
        <textarea
          name="description"
          value={formData.description || ''}
          onChange={handleChange}
          className="w-full px-3 py-2 bg-white/10 rounded-md text-white border border-transparent"
          rows={3}
          placeholder="Descripción detallada del producto..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-white mb-1">
          Categoría
        </label>
        <select
          name="category"
          value={formData.category || ''}
          onChange={handleChange}
          className="w-full px-3 py-2 bg-white/10 rounded-md text-white border border-transparent"
        >
          <option value="">Seleccionar categoría...</option>
          <option value="alimentos">Alimentos</option>
          <option value="bebidas">Bebidas</option>
          <option value="higiene">Higiene</option>
          <option value="limpieza">Limpieza</option>
          <option value="otros">Otros</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-white mb-1">
          Cantidad*
        </label>
        <input
          type="number"
          name="quantity"
          value={formData.quantity || 0}
          onChange={handleChange}
          min="0"
          className={`w-full px-3 py-2 bg-white/10 rounded-md text-white border ${
            errors.quantity ? 'border-red-500' : 'border-transparent'
          }`}
        />
        {errors.quantity && (
          <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <label className="block text-sm font-medium text-white mb-1">
          Metadata
        </label>
        <div>
          <input
            type="text"
            name="metadata.brand"
            value={formData.metadata?.brand || ''}
            onChange={handleChange}
            placeholder="Marca"
            className="w-full px-3 py-2 bg-white/10 rounded-md text-white mb-2"
          />
          <input
            type="text"
            name="metadata.size"
            value={formData.metadata?.size || ''}
            onChange={handleChange}
            placeholder="Tamaño"
            className="w-full px-3 py-2 bg-white/10 rounded-md text-white mb-2"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              name="metadata.weight"
              value={formData.metadata?.weight || ''}
              onChange={handleChange}
              placeholder="Peso"
              className="w-full px-3 py-2 bg-white/10 rounded-md text-white"
            />
            <input
              type="text"
              name="metadata.unit"
              value={formData.metadata?.unit || ''}
              onChange={handleChange}
              placeholder="Unidad"
              className="w-full px-3 py-2 bg-white/10 rounded-md text-white"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-white bg-white/10 rounded-md"
          disabled={isLoading}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-white bg-blue-500 rounded-md disabled:opacity-50"
          disabled={isLoading}
        >
          {isLoading ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </form>
  );
};
