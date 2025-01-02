import { useState, useEffect, useCallback } from 'react';

interface Resolution {
  width: number;
  height: number;
  label: string;
}

interface CameraCapabilities {
  resolutions: Resolution[];
  currentResolution: Resolution;
  maxFrameRate: number;
}

const COMMON_RESOLUTIONS: Resolution[] = [
  { width: 3840, height: 2160, label: '4K' },
  { width: 1920, height: 1080, label: 'Full HD' },
  { width: 1280, height: 720, label: 'HD' },
  { width: 960, height: 540, label: 'qHD' },
  { width: 640, height: 480, label: 'VGA' },
  { width: 320, height: 240, label: 'QVGA' },
];

export const useCameraResolution = (videoTrack: MediaStreamTrack | null) => {
  const [capabilities, setCapabilities] = useState<CameraCapabilities | null>(null);
  const [selectedResolution, setSelectedResolution] = useState<Resolution>(
    COMMON_RESOLUTIONS[2] // HD por defecto
  );
  const [isLoading, setIsLoading] = useState(true);

  // Detectar las capacidades de la cámara
  useEffect(() => {
    if (!videoTrack) {
      setIsLoading(false);
      return;
    }

    const trackCapabilities = videoTrack.getCapabilities();
    if (!trackCapabilities.width || !trackCapabilities.height) {
      setIsLoading(false);
      return;
    }

    // Filtrar resoluciones soportadas
    const supportedResolutions = COMMON_RESOLUTIONS.filter(resolution => {
      return (
        resolution.width <= trackCapabilities.width!.max &&
        resolution.height <= trackCapabilities.height!.max &&
        resolution.width >= trackCapabilities.width!.min &&
        resolution.height >= trackCapabilities.height!.min
      );
    });

    setCapabilities({
      resolutions: supportedResolutions,
      currentResolution: selectedResolution,
      maxFrameRate: trackCapabilities.frameRate?.max || 30,
    });
    setIsLoading(false);
  }, [videoTrack]);

  // Cambiar la resolución
  const setResolution = useCallback(
    async (resolution: Resolution) => {
      if (!videoTrack) return false;

      try {
        await videoTrack.applyConstraints({
          width: { ideal: resolution.width },
          height: { ideal: resolution.height },
        });

        setSelectedResolution(resolution);
        return true;
      } catch (error) {
        console.error('Error al cambiar la resolución:', error);
        return false;
      }
    },
    [videoTrack]
  );

  // Obtener la mejor resolución basada en el rendimiento
  const getOptimalResolution = useCallback(
    (performance: 'high' | 'medium' | 'low') => {
      if (!capabilities?.resolutions.length) return selectedResolution;

      const resolutions = [...capabilities.resolutions].sort(
        (a, b) => a.width * a.height - b.width * b.height
      );

      switch (performance) {
        case 'high':
          return resolutions[resolutions.length - 1];
        case 'medium':
          return resolutions[Math.floor(resolutions.length / 2)];
        case 'low':
          return resolutions[0];
        default:
          return selectedResolution;
      }
    },
    [capabilities, selectedResolution]
  );

  // Estimar el rendimiento basado en la resolución actual
  const estimatePerformanceImpact = useCallback(() => {
    if (!capabilities?.resolutions.length) return 0;

    const maxPixels =
      capabilities.resolutions[capabilities.resolutions.length - 1].width *
      capabilities.resolutions[capabilities.resolutions.length - 1].height;
    const currentPixels = selectedResolution.width * selectedResolution.height;

    return Math.round((currentPixels / maxPixels) * 100);
  }, [capabilities, selectedResolution]);

  return {
    isLoading,
    capabilities,
    selectedResolution,
    setResolution,
    getOptimalResolution,
    estimatePerformanceImpact,
    isSupported: !!capabilities?.resolutions.length,
  };
};
