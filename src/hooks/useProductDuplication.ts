import { useCallback } from 'react';
import type { Product } from './useProductDatabase';

interface DuplicateCheck {
  isDuplicate: boolean;
  confidence: number;
  reason: string;
  existingProduct?: Product;
}

interface SimilarityMetrics {
  name: number;
  description: number;
  metadata: number;
}

export const useProductDuplication = () => {
  // Normalizar texto para comparaciones
  const normalizeText = (text: string): string => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, '')
      .trim();
  };

  // Calcular distancia de Levenshtein
  const levenshteinDistance = (a: string, b: string): number => {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;

    const matrix = Array(b.length + 1).fill(null).map(() => 
      Array(a.length + 1).fill(null)
    );

    for (let i = 0; i <= a.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= b.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= b.length; j++) {
      for (let i = 1; i <= a.length; i++) {
        const substitutionCost = a[i - 1] === b[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + substitutionCost
        );
      }
    }

    return matrix[b.length][a.length];
  };

  // Calcular similitud entre textos (0-1)
  const calculateTextSimilarity = (text1: string, text2: string): number => {
    if (!text1 || !text2) return 0;
    
    const normalized1 = normalizeText(text1);
    const normalized2 = normalizeText(text2);
    
    const maxLength = Math.max(normalized1.length, normalized2.length);
    const distance = levenshteinDistance(normalized1, normalized2);
    
    return 1 - (distance / maxLength);
  };

  // Calcular similitud de metadata
  const calculateMetadataSimilarity = (meta1?: Product['metadata'], meta2?: Product['metadata']): number => {
    if (!meta1 || !meta2) return 0;

    let similarities = 0;
    let totalFields = 0;

    // Comparar marca
    if (meta1.brand && meta2.brand) {
      similarities += calculateTextSimilarity(meta1.brand, meta2.brand);
      totalFields++;
    }

    // Comparar tamaño/peso
    if (meta1.size && meta2.size) {
      const size1 = normalizeText(meta1.size);
      const size2 = normalizeText(meta2.size);
      similarities += size1 === size2 ? 1 : 0;
      totalFields++;
    }

    if (meta1.weight && meta2.weight) {
      const weight1 = normalizeText(meta1.weight);
      const weight2 = normalizeText(meta2.weight);
      similarities += weight1 === weight2 ? 1 : 0;
      totalFields++;
    }

    // Comparar unidad
    if (meta1.unit && meta2.unit) {
      const unit1 = normalizeText(meta1.unit);
      const unit2 = normalizeText(meta2.unit);
      similarities += unit1 === unit2 ? 1 : 0;
      totalFields++;
    }

    return totalFields > 0 ? similarities / totalFields : 0;
  };

  // Verificar duplicados
  const checkDuplicate = useCallback(async (
    newProduct: Partial<Product>,
    existingProducts: Product[]
  ): Promise<DuplicateCheck> => {
    // Si el código de barras ya existe
    const exactMatch = existingProducts.find(p => p.barcode === newProduct.barcode);
    if (exactMatch) {
      return {
        isDuplicate: true,
        confidence: 1,
        reason: 'Código de barras duplicado',
        existingProduct: exactMatch,
      };
    }

    // Buscar similitudes en otros productos
    const potentialDuplicates = existingProducts.map(product => {
      const metrics: SimilarityMetrics = {
        name: calculateTextSimilarity(newProduct.name || '', product.name),
        description: calculateTextSimilarity(newProduct.description || '', product.description || ''),
        metadata: calculateMetadataSimilarity(newProduct.metadata, product.metadata),
      };

      // Pesos para diferentes campos
      const weights = {
        name: 0.5,
        description: 0.3,
        metadata: 0.2,
      };

      const confidence = 
        (metrics.name * weights.name) +
        (metrics.description * weights.description) +
        (metrics.metadata * weights.metadata);

      return {
        product,
        confidence,
        metrics,
      };
    });

    // Encontrar el duplicado más probable
    const bestMatch = potentialDuplicates.reduce((best, current) => 
      current.confidence > best.confidence ? current : best
    , { confidence: 0 });

    // Umbral de confianza para considerar duplicado
    const DUPLICATE_THRESHOLD = 0.85;

    if (bestMatch.confidence >= DUPLICATE_THRESHOLD) {
      return {
        isDuplicate: true,
        confidence: bestMatch.confidence,
        reason: `Producto similar encontrado (${Math.round(bestMatch.confidence * 100)}% similar)`,
        existingProduct: bestMatch.product,
      };
    }

    return {
      isDuplicate: false,
      confidence: bestMatch.confidence,
      reason: 'No se encontraron duplicados',
    };
  }, []);

  // Sugerir fusión de productos
  const suggestMerge = useCallback((
    product1: Product,
    product2: Product
  ): Partial<Product> => {
    return {
      barcode: product1.barcode, // Mantener el código original
      name: product1.name.length > product2.name.length ? product1.name : product2.name,
      description: product1.description || product2.description,
      category: product1.category || product2.category,
      quantity: product1.quantity + product2.quantity,
      status: product1.status,
      metadata: {
        brand: product1.metadata?.brand || product2.metadata?.brand,
        size: product1.metadata?.size || product2.metadata?.size,
        weight: product1.metadata?.weight || product2.metadata?.weight,
        unit: product1.metadata?.unit || product2.metadata?.unit,
      },
    };
  }, []);

  return {
    checkDuplicate,
    suggestMerge,
  };
};
