import { useState, useEffect, useCallback, useRef } from 'react';

interface ZoomCapabilities {
  min: number;
  max: number;
  step: number;
}

export const useCameraZoom = (videoTrack: MediaStreamTrack | null) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [capabilities, setCapabilities] = useState<ZoomCapabilities | null>(null);
  const initialTouchDistance = useRef<number | null>(null);
  const initialZoomLevel = useRef<number>(1);

  useEffect(() => {
    if (videoTrack) {
      const capabilities = videoTrack.getCapabilities();
      if ('zoom' in capabilities) {
        setCapabilities({
          min: capabilities.zoom!.min,
          max: capabilities.zoom!.max,
          step: capabilities.zoom!.step || 0.1,
        });
      }
    }
  }, [videoTrack]);

  const setZoom = useCallback((newZoom: number) => {
    if (!videoTrack || !capabilities) return;

    const clampedZoom = Math.min(
      Math.max(newZoom, capabilities.min),
      capabilities.max
    );

    if (videoTrack.getSettings().zoom !== clampedZoom) {
      videoTrack.applyConstraints({
        advanced: [{ zoom: clampedZoom }],
      }).then(() => {
        setZoomLevel(clampedZoom);
      }).catch((error) => {
        console.warn('Error al ajustar el zoom:', error);
      });
    }
  }, [videoTrack, capabilities]);

  const handleTouchStart = useCallback((event: TouchEvent) => {
    if (event.touches.length === 2) {
      const touch1 = event.touches[0];
      const touch2 = event.touches[1];
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      initialTouchDistance.current = distance;
      initialZoomLevel.current = zoomLevel;
    }
  }, [zoomLevel]);

  const handleTouchMove = useCallback((event: TouchEvent) => {
    if (event.touches.length === 2 && initialTouchDistance.current !== null) {
      const touch1 = event.touches[0];
      const touch2 = event.touches[1];
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );

      const scale = distance / initialTouchDistance.current;
      const newZoom = initialZoomLevel.current * scale;
      setZoom(newZoom);
    }
  }, [setZoom]);

  const handleTouchEnd = useCallback(() => {
    initialTouchDistance.current = null;
  }, []);

  useEffect(() => {
    if (videoTrack) {
      document.addEventListener('touchstart', handleTouchStart);
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleTouchEnd);

      return () => {
        document.removeEventListener('touchstart', handleTouchStart);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [videoTrack, handleTouchStart, handleTouchMove, handleTouchEnd]);

  return {
    zoomLevel,
    setZoom,
    capabilities,
    isZoomSupported: !!capabilities,
  };
};
