import React, { useState, useCallback } from 'react';
import { useProductDatabase, type Product } from '../../hooks/useProductDatabase';
import { useProductDuplication } from '../../hooks/useProductDuplication';
import { ProductForm } from './ProductForm';
import { DuplicateResolution } from './DuplicateResolution';

interface ProductRegistrationProps {
  barcode: string;
  onComplete: () => void;
  onCancel: () => void;
}

type RegistrationStep = 'searching' | 'form' | 'alternatives' | 'duplicate-resolution';

export const ProductRegistration: React.FC<ProductRegistrationProps> = ({
  barcode,
  onComplete,
  onCancel,
}) => {
  const [step, setStep] = useState<RegistrationStep>('searching');
  const [productData, setProductData] = useState<Partial<Product>>();
  const [alternatives, setAlternatives] = useState<Product[]>([]);
  const [duplicateCheck, setDuplicateCheck] = useState<{
    existingProduct: Product;
    confidence: number;
  } | null>(null);

  const {
    isLoading,
    error,
    lookupProduct,
    registerProduct,
    updateProduct,
    getAllProducts,
  } = useProductDatabase();

  const { checkDuplicate, suggestMerge } = useProductDuplication();

  const handleInitialSearch = useCallback(async () => {
    const result = await lookupProduct(barcode);

    if (result.found && result.product) {
      // Producto encontrado - mostrar formulario pre-llenado
      setProductData(result.product);
      setStep('form');
    } else if (result.alternatives?.length) {
      // Productos similares encontrados
      setAlternatives(result.alternatives);
      setStep('alternatives');
    } else {
      // Ningún producto encontrado - mostrar formulario vacío
      setStep('form');
    }
  }, [barcode, lookupProduct]);

  const handleFormSubmit = async (data: Omit<Product, 'lastUpdated'>) => {
    try {
      // Verificar duplicados antes de guardar
      const existingProducts = await getAllProducts();
      const duplicateResult = await checkDuplicate(data, existingProducts);

      if (duplicateResult.isDuplicate && duplicateResult.existingProduct) {
        // Mostrar resolución de duplicados
        setDuplicateCheck({
          existingProduct: duplicateResult.existingProduct,
          confidence: duplicateResult.confidence,
        });
        setProductData(data);
        setStep('duplicate-resolution');
        return;
      }

      // No hay duplicados, proceder con el registro
      if (productData?.barcode) {
        await updateProduct(productData.barcode, data);
      } else {
        await registerProduct(data);
      }
      onComplete();
    } catch (error) {
      console.error('Error al guardar el producto:', error);
    }
  };

  const handleMergeProducts = async (mergedData: Partial<Product>) => {
    try {
      if (duplicateCheck?.existingProduct) {
        await updateProduct(duplicateCheck.existingProduct.barcode, mergedData);
        onComplete();
      }
    } catch (error) {
      console.error('Error al fusionar productos:', error);
    }
  };

  const handleKeepBoth = async () => {
    try {
      if (productData) {
        await registerProduct(productData as Omit<Product, 'lastUpdated'>);
        onComplete();
      }
    } catch (error) {
      console.error('Error al registrar producto:', error);
    }
  };

  const handleSelectAlternative = (product: Product) => {
    setProductData(product);
    setStep('form');
  };

  // Renderizar pantalla de búsqueda
  if (step === 'searching') {
    return (
      <div className="p-4 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto" />
        <p className="text-white mt-2">Buscando producto...</p>
        {error && (
          <p className="text-red-500 mt-2">{error}</p>
        )}
      </div>
    );
  }

  // Renderizar resolución de duplicados
  if (step === 'duplicate-resolution' && duplicateCheck && productData) {
    return (
      <DuplicateResolution
        newProduct={productData}
        existingProduct={duplicateCheck.existingProduct}
        confidence={duplicateCheck.confidence}
        onMerge={handleMergeProducts}
        onKeepBoth={handleKeepBoth}
        onCancel={() => setStep('form')}
      />
    );
  }

  // Renderizar lista de alternativas
  if (step === 'alternatives') {
    return (
      <div className="p-4">
        <h3 className="text-white font-medium mb-4">
          Productos Similares Encontrados
        </h3>
        <div className="space-y-2">
          {alternatives.map((product) => (
            <button
              key={product.barcode}
              onClick={() => handleSelectAlternative(product)}
              className="w-full p-3 bg-white/10 rounded-lg text-left text-white hover:bg-white/20"
            >
              <p className="font-medium">{product.name}</p>
              <p className="text-sm text-white/60">{product.description}</p>
              {product.metadata?.brand && (
                <p className="text-sm text-white/60">
                  Marca: {product.metadata.brand}
                </p>
              )}
            </button>
          ))}
          <button
            onClick={() => setStep('form')}
            className="w-full p-3 bg-blue-500 rounded-lg text-white font-medium mt-4"
          >
            Registrar Nuevo Producto
          </button>
        </div>
      </div>
    );
  }

  // Renderizar formulario
  return (
    <ProductForm
      barcode={barcode}
      initialData={productData}
      onSubmit={handleFormSubmit}
      onCancel={onCancel}
      isLoading={isLoading}
    />
  );
};
