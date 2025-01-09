import React, { useState, useEffect, useCallback } from 'react';
import { useZxing } from 'react-zxing';
import { BarcodeFormat } from '@zxing/library';
import { useHapticFeedback } from '../../hooks/useHapticFeedback';
import toast from 'react-hot-toast';
import { walmartApi } from '../../services/walmartApi';
import { LightBulbIcon } from '@heroicons/react/24/outline';

interface BarcodeScannerProps {
  onResult: (result: { text: string; format: BarcodeFormat }) => void;
  onError?: (error: Error) => void;
}

export const BarcodeScanner: React.FC<BarcodeScannerProps> = ({
  onResult,
  onError,
}) => {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [scanAttempts, setScanAttempts] = useState(0);
  const [lastScannedCode, setLastScannedCode] = useState<string | null>(null);
  const [productInfo, setProductInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const haptics = useHapticFeedback();

  const {
    ref,
    torch,
    start,
    stop,
    pause,
    resume
  } = useZxing({
    constraints: {
      video: {
        facingMode: "environment",
        width: { ideal: 1280 },
        height: { ideal: 720 }
      }
    },
    timeBetweenDecodingAttempts: 150,
    formats: [
      BarcodeFormat.QR_CODE,
      BarcodeFormat.EAN_13,
      BarcodeFormat.EAN_8,
      BarcodeFormat.CODE_128,
      BarcodeFormat.CODE_39,
      BarcodeFormat.UPC_A,
      BarcodeFormat.UPC_E,
      BarcodeFormat.DATA_MATRIX,
      BarcodeFormat.PDF_417,
      BarcodeFormat.AZTEC
    ],
    onResult: (result) => {
      haptics.success();
      setScanAttempts(0);
      onResult({
        text: result.getText(),
        format: result.getBarcodeFormat()
      });
      setLastScannedCode(result.getText());
      searchProduct(result.getText());
    },
    onError: (error) => {
      setScanAttempts(prev => prev + 1);
      if (onError) onError(error);
    },
  });

  const searchProduct = async (barcode: string) => {
    try {
      setLoading(true);
      setError(null);
      const product = await walmartApi.getProductByUPC(barcode);
      if (product) {
        setProductInfo(product);
      } else {
        setError('Producto no encontrado');
      }
    } catch (err) {
      setError('Error al buscar el producto');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initCamera = async () => {
      try {
        await start();
        setIsCameraActive(true);
      } catch (error) {
        console.error('Error al iniciar la cámara:', error);
        toast.error('Error al acceder a la cámara. Por favor, verifica los permisos.');
      }
    };

    initCamera();

    return () => {
      stop();
    };
  }, [start, stop]);

  useEffect(() => {
    const checkCameraActive = () => {
      const video = ref.current;
      if (video) {
        const isPlaying = video.currentTime > 0 && !video.paused && !video.ended && video.readyState > 2;
        if (!isPlaying && isCameraActive) {
          resume();
        }
      }
    };

    const interval = setInterval(checkCameraActive, 1000);
    return () => clearInterval(interval);
  }, [ref, resume, isCameraActive]);

  const getScanningTip = () => {
    if (!isCameraActive) {
      return "Activando cámara...";
    }
    if (scanAttempts < 10) {
      return "Centra el código de barras en el recuadro";
    }
    if (scanAttempts < 20) {
      return "Acerca un poco más el código";
    }
    if (scanAttempts < 30) {
      return "Aleja un poco el código";
    }
    return "Asegúrate de que haya buena iluminación";
  };

  const handleReset = () => {
    setLastScannedCode(null);
    setProductInfo(null);
    setError(null);
  };

  return (
    <div className="relative w-full max-w-lg mx-auto">
      <div className="relative">
        <video
          ref={ref}
          className="w-full h-64 object-cover rounded-lg bg-black"
          playsInline
          autoPlay
          muted
        />
        
        {/* Guía de escaneo */}
        <div className="absolute inset-0 border-2 border-dashed border-blue-500 m-8 rounded pointer-events-none">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-48 h-1 bg-blue-500/50 animate-pulse" />
          </div>
        </div>

        {/* Indicador de estado y consejos */}
        <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-4 rounded-b-lg">
          <p className="text-center text-sm font-medium">
            {getScanningTip()}
          </p>
        </div>

        {/* Botón de linterna */}
        {torch?.isAvailable && (
          <button
            onClick={() => torch.toggle()}
            className="absolute top-4 right-4 p-2 bg-black/50 rounded-full text-white"
            aria-label={torch.isOn ? 'Apagar linterna' : 'Encender linterna'}
          >
            <LightBulbIcon className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Información del producto */}
      {productInfo && (
        <div className="absolute top-0 left-0 right-0 p-4 bg-white rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold">{productInfo.name}</h3>
          {productInfo.thumbnailImage && (
            <img 
              src={productInfo.thumbnailImage} 
              alt={productInfo.name}
              className="w-full h-48 object-contain"
            />
          )}
          <div className="space-y-2">
            <p className="text-gray-600">Precio: ${productInfo.salePrice}</p>
            <p className="text-gray-600">UPC: {productInfo.upc}</p>
            <p className="text-gray-600">Categoría: {productInfo.categoryPath}</p>
            {productInfo.shortDescription && (
              <p className="text-sm text-gray-500">{productInfo.shortDescription}</p>
            )}
          </div>
          <button
            onClick={handleReset}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Escanear otro código
          </button>
        </div>
      )}
    </div>
  );
};
