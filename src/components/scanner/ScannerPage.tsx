import { useState } from 'react';
import { BarcodeScanner } from './BarcodeScanner';
import { ProductProcessor } from './ProductProcessor';

export const ScannerPage = () => {
  const [scannedBarcode, setScannedBarcode] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleScan = (result: string) => {
    setScannedBarcode(result);
    setIsProcessing(true);
  };

  const handleError = (error: Error) => {
    setError(error.message);
  };

  const handleProcessingComplete = () => {
    setScannedBarcode('');
    setIsProcessing(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Escáner de Productos</h1>
      
      {!isProcessing && (
        <div className="mb-8">
          <BarcodeScanner onResult={handleScan} onError={handleError} />
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {isProcessing && scannedBarcode && (
        <ProductProcessor
          barcode={scannedBarcode}
          onComplete={handleProcessingComplete}
        />
      )}
    </div>
  );
};
