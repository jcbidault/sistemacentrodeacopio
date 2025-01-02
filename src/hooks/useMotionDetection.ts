import { useState, useEffect, useCallback } from 'react';

interface MotionState {
  isStable: boolean;
  acceleration: {
    x: number;
    y: number;
    z: number;
  };
}

export const useMotionDetection = (threshold = 1.5) => {
  const [motionState, setMotionState] = useState<MotionState>({
    isStable: true,
    acceleration: { x: 0, y: 0, z: 0 },
  });

  const [isSupported, setIsSupported] = useState(false);

  const handleMotion = useCallback(
    (event: DeviceMotionEvent) => {
      if (!event.acceleration) return;

      const { x = 0, y = 0, z = 0 } = event.acceleration;
      
      // Calcular la magnitud total de la aceleración
      const magnitude = Math.sqrt(x * x + y * y + z * z);
      
      // Actualizar el estado de movimiento
      setMotionState({
        isStable: magnitude < threshold,
        acceleration: { x, y, z },
      });
    },
    [threshold]
  );

  useEffect(() => {
    // Verificar soporte para DeviceMotion
    if (typeof DeviceMotionEvent !== 'undefined') {
      setIsSupported(true);

      // En iOS 13+ se requiere solicitar permiso
      if (
        DeviceMotionEvent.requestPermission &&
        typeof DeviceMotionEvent.requestPermission === 'function'
      ) {
        DeviceMotionEvent.requestPermission()
          .then(response => {
            if (response === 'granted') {
              window.addEventListener('devicemotion', handleMotion);
            }
          })
          .catch(console.error);
      } else {
        window.addEventListener('devicemotion', handleMotion);
      }

      return () => {
        window.removeEventListener('devicemotion', handleMotion);
      };
    }
  }, [handleMotion]);

  // Función para calibrar el umbral basado en las condiciones actuales
  const calibrate = useCallback(() => {
    return new Promise<void>((resolve) => {
      let samples: number[] = [];
      let sampleCount = 0;
      
      const collectSamples = (event: DeviceMotionEvent) => {
        if (!event.acceleration) return;
        
        const { x = 0, y = 0, z = 0 } = event.acceleration;
        const magnitude = Math.sqrt(x * x + y * y + z * z);
        
        samples.push(magnitude);
        sampleCount++;
        
        if (sampleCount >= 50) { // Recolectar 50 muestras
          window.removeEventListener('devicemotion', collectSamples);
          
          // Calcular el promedio y la desviación estándar
          const avg = samples.reduce((a, b) => a + b) / samples.length;
          const variance = samples.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / samples.length;
          const stdDev = Math.sqrt(variance);
          
          // Establecer el nuevo umbral como promedio + 2 desviaciones estándar
          threshold = avg + (2 * stdDev);
          
          resolve();
        }
      };
      
      window.addEventListener('devicemotion', collectSamples);
    });
  }, []);

  return {
    isSupported,
    isStable: motionState.isStable,
    acceleration: motionState.acceleration,
    calibrate,
  };
};
