import { useState, useEffect } from 'react';
import { BarcodeScanner } from './BarcodeScanner';
import { ProductProcessor } from './ProductProcessor';
import { BarcodeFormat } from '@zxing/library';

interface ScanResult {
  text: string;
  format: BarcodeFormat;
}

export const ScannerPage = () => {
  const [scannedBarcode, setScannedBarcode] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);

  useEffect(() => {
    const requestCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: {
            facingMode: { exact: "environment" }
          }
        });
        setHasCameraPermission(true);
        stream.getTracks().forEach(track => track.stop());
      } catch (err) {
        console.error('Camera permission error:', err);
        setHasCameraPermission(false);
        setError('Se requiere permiso para acceder a la cámara');
      }
    };

    requestCameraPermission();
  }, []);

  const handleScan = (result: ScanResult) => {
    console.log('Scanned barcode:', result);
    if (result.text) {
      setScannedBarcode(result.text);
      setIsProcessing(true);
      setError('');
    }
  };

  const handleError = (error: Error) => {
    console.error('Scanner error:', error);
    setError(error.message);
  };

  const handleProcessingComplete = () => {
    setScannedBarcode('');
    setIsProcessing(false);
  };

  if (hasCameraPermission === false) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>Se requiere acceso a la cámara para escanear códigos de barras.</p>
          <p>Por favor, permite el acceso a la cámara en la configuración de tu navegador.</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Escáner de Productos</h1>
      
      {!isProcessing && hasCameraPermission && (
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
