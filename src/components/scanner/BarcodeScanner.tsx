import React, { useState, useEffect, useCallback } from 'react';
import { useZxing } from 'react-zxing';
import { BarcodeFormat } from '@zxing/library';
import { useHapticFeedback } from '../../hooks/useHapticFeedback';
import { LightBulbIcon } from '@heroicons/react/24/outline';
import { walmartApi } from '../../services/walmartApi';

interface BarcodeScannerProps {
  onResult: (result: { text: string; format: BarcodeFormat }) => void;
  onError?: (error: Error) => void;
}

export const BarcodeScanner: React.FC<BarcodeScannerProps> = ({
  onResult,
  onError,
}) => {
  const [isCameraPermissionGranted, setIsCameraPermissionGranted] = useState<boolean | null>(null);
  const [videoTrack, setVideoTrack] = useState<MediaStreamTrack | null>(null);
  const haptics = useHapticFeedback();
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [scanning, setScanning] = useState(true);
  const [lastScannedCode, setLastScannedCode] = useState<string | null>(null);
  const [productInfo, setProductInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleResult = useCallback((result: { getText: () => string; getBarcodeFormat: () => BarcodeFormat }) => {
    haptics.success();
    onResult({
      text: result.getText(),
      format: result.getBarcodeFormat()
    });
    setLastScannedCode(result.getText());
    searchProduct(result.getText());
  }, [haptics, onResult]);

  const handleError = useCallback((error: Error) => {
    console.error('Camera error:', error);
    if (onError) onError(error);
  }, [onError]);

  const searchProduct = async (barcode: string) => {
    try {
      setLoading(true);
      setError(null);
      const product = await walmartApi.getProductByUPC(barcode);
      if (product) {
        setProductInfo(product);
        setScanning(false); // Detener el escaneo cuando se encuentra un producto
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

  const {
    ref,
    torch: { isOn: isTorchOn, isAvailable: isTorchAvailable, on: turnTorchOn, off: turnTorchOff },
  } = useZxing({
    constraints: {
      video: {
        facingMode: { exact: "environment" },
        width: { min: 640, ideal: 1920, max: 2560 },
        height: { min: 480, ideal: 1080, max: 1440 },
        aspectRatio: { ideal: 16/9 },
        focusMode: "continuous",
        zoom: 1.0,
        brightness: { ideal: 1.0 },
        contrast: { ideal: 1.0 },
        exposureMode: "continuous"
      }
    },
    timeBetweenDecodingAttempts: 100,
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
    onResult: handleResult,
    onError: handleError,
  });

  useEffect(() => {
    const requestCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setIsCameraPermissionGranted(true);
        stream.getTracks().forEach(track => track.stop());
      } catch (err) {
        setIsCameraPermissionGranted(false);
        console.error("Error accessing camera:", err);
      }
    };

    requestCameraPermission();
  }, []);

  const handleRequestPermission = () => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then((stream) => {
        setIsCameraPermissionGranted(true);
        stream.getTracks().forEach(track => track.stop());
      })
      .catch((err) => {
        setIsCameraPermissionGranted(false);
        console.error("Error requesting camera permission:", err);
      });
  };

  const configureVideoTrack = async () => {
    if (ref.current?.srcObject instanceof MediaStream) {
      const track = ref.current.srcObject.getVideoTracks()[0];
      if (track) {
        setVideoTrack(track);
        
        try {
          const capabilities = track.getCapabilities();
          const settings: MediaTrackConstraints = {};

          if (capabilities.focusMode?.includes('continuous')) {
            settings.focusMode = 'continuous';
          }

          if (capabilities.whiteBalanceMode?.includes('continuous')) {
            settings.whiteBalanceMode = 'continuous';
          }

          if (capabilities.exposureMode?.includes('continuous')) {
            settings.exposureMode = 'continuous';
          }

          if (Object.keys(settings).length > 0) {
            await track.applyConstraints(settings);
          }
        } catch (err) {
          console.warn('Camera settings could not be applied:', err);
        }
      }
    }
  };

  useEffect(() => {
    configureVideoTrack();

    return () => {
      if (videoTrack) {
        videoTrack.stop();
        setVideoTrack(null);
      }
    };
  }, [ref]);

  const toggleTorch = useCallback(() => {
    if (isTorchOn) {
      turnTorchOff();
      setTorchEnabled(false);
    } else {
      turnTorchOn();
      setTorchEnabled(true);
    }
  }, [isTorchOn, turnTorchOff, turnTorchOn]);

  useEffect(() => {
    const requestCameraAccess = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: {
            facingMode: "environment",
            width: { min: 1280, ideal: 1920, max: 2560 },
            height: { min: 720, ideal: 1080, max: 1440 },
          } 
        });
        
        if (ref.current) {
          ref.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        // Si falla, intentar nuevamente después de 1 segundo
        setTimeout(requestCameraAccess, 1000);
      }
    };

    requestCameraAccess();

    const checkInterval = setInterval(() => {
      navigator.permissions.query({ name: 'camera' as PermissionName })
        .then(result => {
          if (result.state === 'denied' || result.state === 'prompt') {
            requestCameraAccess();
          }
        });
    }, 2000);

    return () => {
      clearInterval(checkInterval);
      if (ref.current?.srcObject) {
        const stream = ref.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [ref]);

  const requestCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { min: 640, ideal: 1280, max: 1920 },
          height: { min: 480, ideal: 720, max: 1080 },
        },
        audio: false
      });
      
      // Detener el stream inmediatamente después de obtener permisos
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (error) {
      console.error('Error al solicitar permisos de cámara:', error);
      return false;
    }
  };

  useEffect(() => {
    // Solicitar permisos inmediatamente al montar el componente
    const initializeCamera = async () => {
      const hasPermission = await requestCameraPermission();
      if (hasPermission) {
        // No hacer nada
      }
    };

    initializeCamera();

    // Configurar un intervalo para verificar y solicitar permisos periódicamente
    const permissionInterval = setInterval(async () => {
      try {
        const result = await navigator.permissions.query({ name: 'camera' as PermissionName });
        if (result.state === 'denied' || result.state === 'prompt') {
          requestCameraPermission();
        }
      } catch (error) {
        console.error('Error al verificar permisos:', error);
      }
    }, 2000);

    return () => {
      clearInterval(permissionInterval);
    };
  }, []);

  const handleReset = () => {
    setScanning(true);
    setLastScannedCode(null);
    setProductInfo(null);
    setError(null);
  };

  if (isCameraPermissionGranted === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-gray-100 rounded-lg p-4">
        <p className="text-gray-600 mb-4">Verificando permisos de cámara...</p>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isCameraPermissionGranted === false) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-red-50 rounded-lg p-4">
        <p className="text-red-600 text-center mb-4">
          Se requiere acceso a la cámara para escanear códigos de barras.
          <br />
          Por favor, permite el acceso a la cámara en la configuración de tu navegador.
        </p>
        <button
          onClick={handleRequestPermission}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          Solicitar Permiso
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-black">
      {/* Camera View */}
      <video
        ref={ref}
        className="w-full h-full object-cover"
      />

      {/* Scanning Overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-64 h-64">
          {/* Scanner Frame */}
          <div className="absolute inset-0 border-2 border-white/50 rounded-lg">
            {/* Corner Markers */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary-500 rounded-tl" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary-500 rounded-tr" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary-500 rounded-bl" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary-500 rounded-br" />
          </div>

          {/* Scanning Line Animation */}
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary-500 animate-scan" />
        </div>
      </div>

      {/* Controls */}
      <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/50 to-transparent">
        <div className="flex justify-center">
          {isTorchAvailable && (
            <button
              onClick={toggleTorch}
              className={`
                p-3 rounded-full transition-all duration-200
                ${isTorchOn 
                  ? 'bg-white text-gray-900' 
                  : 'bg-gray-800 text-white'
                }
                hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
              `}
              aria-label={isTorchOn ? "Apagar linterna" : "Encender linterna"}
            >
              <LightBulbIcon className="w-6 h-6" />
            </button>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute top-4 left-0 right-0 text-center">
        <p className="text-white text-sm font-medium px-4 py-2 bg-black/50 rounded-lg inline-block">
          Coloca el código de barras dentro del marco
        </p>
      </div>

      {/* Product Info */}
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
