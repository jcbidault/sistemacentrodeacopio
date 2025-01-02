import { useEffect, useState } from 'react';

export const useDeviceOrientation = () => {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');

  useEffect(() => {
    const handleOrientationChange = () => {
      if (window.screen.orientation) {
        setOrientation(
          window.screen.orientation.type.includes('portrait') ? 'portrait' : 'landscape'
        );
      } else if (window.orientation !== undefined) {
        // Fallback para navegadores más antiguos
        setOrientation(Math.abs(window.orientation as number) === 90 ? 'landscape' : 'portrait');
      }
    };

    // Intentar bloquear la orientación en portrait mode
    const lockOrientation = async () => {
      try {
        if (screen.orientation && screen.orientation.lock) {
          await screen.orientation.lock('portrait');
        }
      } catch (error) {
        console.warn('No se pudo bloquear la orientación:', error);
      }
    };

    // Configurar listeners de orientación
    if (window.screen.orientation) {
      window.screen.orientation.addEventListener('change', handleOrientationChange);
    } else {
      window.addEventListener('orientationchange', handleOrientationChange);
    }

    // Intentar bloquear la orientación al montar
    lockOrientation();
    handleOrientationChange();

    return () => {
      // Limpiar listeners
      if (window.screen.orientation) {
        window.screen.orientation.removeEventListener('change', handleOrientationChange);
      } else {
        window.removeEventListener('orientationchange', handleOrientationChange);
      }
    };
  }, []);

  return orientation;
};
