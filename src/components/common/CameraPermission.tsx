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
  }, [isGranted, isDenied]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (isGranted) {
    return <>{children}</>;
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow-lg max-w-md mx-auto">
      <div className="text-center">
        <div className="mb-4">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {isDenied
            ? 'Acceso a la cámara denegado'
            : 'Se requiere acceso a la cámara'}
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          {isDenied
            ? 'Por favor, habilite el acceso a la cámara en la configuración de su navegador para continuar.'
            : 'Para escanear códigos de barras, necesitamos acceder a la cámara de su dispositivo.'}
        </p>
        {!isDenied && (
          <button
            onClick={requestPermission}
            className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Permitir acceso
          </button>
        )}
        {isDenied && (
          <button
            onClick={() => window.location.reload()}
            className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Reintentar
          </button>
        )}
      </div>
    </div>
  );
};
