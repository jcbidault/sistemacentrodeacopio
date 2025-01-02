import React from 'react';
import { useHapticFeedback } from '../../hooks/useHapticFeedback';

interface ZoomControlProps {
  zoomLevel: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  isZoomSupported: boolean;
}

export const ZoomControl: React.FC<ZoomControlProps> = ({
  zoomLevel,
  onZoomIn,
  onZoomOut,
  isZoomSupported,
}) => {
  const haptics = useHapticFeedback();

  const handleZoomIn = () => {
    haptics.light();
    onZoomIn();
  };

  const handleZoomOut = () => {
    haptics.light();
    onZoomOut();
  };

  if (!isZoomSupported) return null;

  return (
    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col space-y-2">
      <button
        onClick={handleZoomIn}
        className="p-3 bg-white/10 rounded-full backdrop-blur-sm active:bg-white/20 touch-feedback"
        aria-label="Aumentar zoom"
      >
        <svg
          className="w-6 h-6 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
          />
        </svg>
      </button>

      <div className="text-center text-white text-sm font-medium bg-black/40 px-2 py-1 rounded">
        {(zoomLevel).toFixed(1)}x
      </div>

      <button
        onClick={handleZoomOut}
        className="p-3 bg-white/10 rounded-full backdrop-blur-sm active:bg-white/20 touch-feedback"
        aria-label="Reducir zoom"
      >
        <svg
          className="w-6 h-6 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20 12H4"
          />
        </svg>
      </button>
    </div>
  );
};
