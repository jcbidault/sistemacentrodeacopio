import React, { useState } from 'react';
import { useHapticFeedback } from '../../hooks/useHapticFeedback';

interface Resolution {
  width: number;
  height: number;
  label: string;
}

interface ResolutionControlProps {
  resolutions: Resolution[];
  currentResolution: Resolution;
  onResolutionChange: (resolution: Resolution) => void;
  performanceImpact: number;
  isSupported: boolean;
}

export const ResolutionControl: React.FC<ResolutionControlProps> = ({
  resolutions,
  currentResolution,
  onResolutionChange,
  performanceImpact,
  isSupported,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const haptics = useHapticFeedback();

  const handleResolutionChange = (resolution: Resolution) => {
    haptics.light();
    onResolutionChange(resolution);
    setIsOpen(false);
  };

  const toggleMenu = () => {
    haptics.light();
    setIsOpen(!isOpen);
  };

  if (!isSupported) return null;

  return (
    <div className="absolute right-4 bottom-24 z-10">
      <div className="relative">
        <button
          onClick={toggleMenu}
          className="p-3 bg-black/40 backdrop-blur-sm rounded-lg text-white flex items-center space-x-2"
        >
          <span className="text-sm font-medium">{currentResolution.label}</span>
          <svg
            className={`w-4 h-4 transform transition-transform ${
              isOpen ? 'rotate-180' : ''
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute bottom-full right-0 mb-2 bg-black/40 backdrop-blur-sm rounded-lg overflow-hidden">
            <div className="py-1">
              {resolutions.map((resolution) => (
                <button
                  key={resolution.label}
                  onClick={() => handleResolutionChange(resolution)}
                  className={`
                    w-full px-4 py-2 text-sm text-left
                    ${
                      resolution.label === currentResolution.label
                        ? 'bg-blue-500 text-white'
                        : 'text-white hover:bg-white/10'
                    }
                  `}
                >
                  {resolution.label}
                  <span className="text-xs opacity-75 ml-2">
                    ({resolution.width}x{resolution.height})
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {performanceImpact > 70 && (
        <div className="mt-2 p-2 bg-yellow-500/20 backdrop-blur-sm rounded-lg">
          <p className="text-xs text-white text-center">
            Alto impacto en rendimiento
          </p>
        </div>
      )}
    </div>
  );
};
