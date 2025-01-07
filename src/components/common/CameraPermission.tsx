import React from 'react';
import { useCameraPermission } from '../../hooks/useCameraPermission';

interface CameraPermissionProps {
  onGranted?: () => void;
  onDenied?: () => void;
  children: React.ReactNode;
}

export const CameraPermission: React.FC<CameraPermissionProps> = ({
  onGranted,
  onDenied,
  children,
}) => {
  const { permissionState, isLoading, requestPermission, isGranted, isDenied } =
    useCameraPermission();

  React.useEffect(() => {
    if (isGranted) {
      onGranted?.();
    } else if (isDenied) {
      onDenied?.();
    }
  }, [isGranted, isDenied, onGranted, onDenied]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (isGranted) {
    return <>{children}</>;
  }

  const handleRequestPermission = async () => {
    // En iOS, necesitamos manejar el clic del usuario
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOS) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: 'environment'
          } 
        });
        stream.getTracks().forEach(track => track.stop());
        onGranted?.();
      } catch (error) {
        console.error('Error requesting camera permission:', error);
        onDenied?.();
      }
    } else {
      await requestPermission();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] px-4 py-8 text-center bg-gray-50">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">
          Escáner de Productos
        </h1>
        
        <div className="mb-8">
          <svg
            className="w-24 h-24 mx-auto mb-6 text-gray-700"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8zm0-12c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 6c-1.105 0-2-.895-2-2s.895-2 2-2 2 .895 2 2-.895 2-2 2z" />
          </svg>
        </div>

        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          {isDenied ? 'Acceso a la cámara denegado' : 'Se requiere acceso a la cámara'}
        </h2>
        
        <p className="mb-6 text-gray-600">
          {isDenied
            ? 'Por favor, habilite el acceso a la cámara en la configuración de su navegador para continuar.'
            : 'Para escanear códigos de barras, necesitamos acceder a la cámara de su dispositivo.'}
        </p>
        
        <button
          onClick={handleRequestPermission}
          className="w-full px-6 py-3 text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors duration-200"
        >
          {isDenied ? 'Reintentar' : 'Permitir acceso a la cámara'}
        </button>
      </div>
    </div>
  );
};
