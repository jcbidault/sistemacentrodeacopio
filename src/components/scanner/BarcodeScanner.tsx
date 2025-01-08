import React, { useState, useEffect, useCallback } from 'react';
import { useZxing } from 'react-zxing';
import { BarcodeFormat } from '@zxing/library';
import { useHapticFeedback } from '../../hooks/useHapticFeedback';
import { LightBulbIcon } from '@heroicons/react/24/outline';

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

  const handleResult = useCallback((result: { getText: () => string; getBarcodeFormat: () => BarcodeFormat }) => {
    haptics.success();
    onResult({
      text: result.getText(),
      format: result.getBarcodeFormat()
    });
  }, [haptics, onResult]);

  const handleError = useCallback((error: Error) => {
    console.error('Camera error:', error);
    if (onError) onError(error);
  }, [onError]);

  const {
    ref,
    torch: { isOn: isTorchOn, isAvailable: isTorchAvailable, on: turnTorchOn, off: turnTorchOff },
  } = useZxing({
    constraints: {
      video: {
        facingMode: { exact: "environment" },
        width: { min: 1280, ideal: 1920, max: 2560 },
        height: { min: 720, ideal: 1080, max: 1440 },
        aspectRatio: { ideal: 16/9 },
        focusMode: "continuous"
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
    } else {
      turnTorchOn();
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
    </div>
  );
};
