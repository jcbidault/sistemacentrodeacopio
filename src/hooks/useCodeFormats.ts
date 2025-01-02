import { useState, useCallback } from 'react';
import { BarcodeFormat } from '@zxing/library';

// Formatos soportados agrupados por tipo
export const SUPPORTED_FORMATS = {
  BARCODE: [
    {
      format: BarcodeFormat.EAN_13,
      label: 'EAN-13',
      description: 'Código de barras estándar de 13 dígitos',
    },
    {
      format: BarcodeFormat.EAN_8,
      label: 'EAN-8',
      description: 'Código de barras compacto de 8 dígitos',
    },
    {
      format: BarcodeFormat.CODE_128,
      label: 'CODE 128',
      description: 'Código de barras de alta densidad',
    },
    {
      format: BarcodeFormat.CODE_39,
      label: 'CODE 39',
      description: 'Código de barras alfanumérico',
    },
    {
      format: BarcodeFormat.UPC_A,
      label: 'UPC-A',
      description: 'Código universal de producto',
    },
    {
      format: BarcodeFormat.UPC_E,
      label: 'UPC-E',
      description: 'Código universal de producto compacto',
    },
  ],
  QR: [
    {
      format: BarcodeFormat.QR_CODE,
      label: 'QR Code',
      description: 'Código QR estándar',
    },
  ],
  MATRIX: [
    {
      format: BarcodeFormat.DATA_MATRIX,
      label: 'Data Matrix',
      description: 'Código matricial de alta densidad',
    },
  ],
};

export type CodeType = 'BARCODE' | 'QR' | 'MATRIX' | 'ALL';

interface UseCodeFormatsProps {
  defaultType?: CodeType;
}

export const useCodeFormats = ({ defaultType = 'ALL' }: UseCodeFormatsProps = {}) => {
  const [activeType, setActiveType] = useState<CodeType>(defaultType);
  const [lastDetectedFormat, setLastDetectedFormat] = useState<BarcodeFormat | null>(null);

  // Obtener los formatos activos basados en el tipo seleccionado
  const getActiveFormats = useCallback(() => {
    if (activeType === 'ALL') {
      return [
        ...SUPPORTED_FORMATS.BARCODE,
        ...SUPPORTED_FORMATS.QR,
        ...SUPPORTED_FORMATS.MATRIX,
      ].map(f => f.format);
    }
    return SUPPORTED_FORMATS[activeType].map(f => f.format);
  }, [activeType]);

  // Identificar el tipo de código basado en el formato
  const identifyCodeType = useCallback((format: BarcodeFormat): CodeType => {
    if (SUPPORTED_FORMATS.BARCODE.some(f => f.format === format)) return 'BARCODE';
    if (SUPPORTED_FORMATS.QR.some(f => f.format === format)) return 'QR';
    if (SUPPORTED_FORMATS.MATRIX.some(f => f.format === format)) return 'MATRIX';
    return 'ALL';
  }, []);

  // Obtener la descripción del formato
  const getFormatDescription = useCallback((format: BarcodeFormat) => {
    for (const type of Object.values(SUPPORTED_FORMATS)) {
      const found = type.find(f => f.format === format);
      if (found) return found.description;
    }
    return 'Formato desconocido';
  }, []);

  return {
    activeType,
    setActiveType,
    getActiveFormats,
    lastDetectedFormat,
    setLastDetectedFormat,
    identifyCodeType,
    getFormatDescription,
    supportedFormats: SUPPORTED_FORMATS,
  };
};
