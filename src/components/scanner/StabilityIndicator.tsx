import React from 'react';
import { useHapticFeedback } from '../../hooks/useHapticFeedback';

interface StabilityIndicatorProps {
  isStable: boolean;
  isSupported: boolean;
}

export const StabilityIndicator: React.FC<StabilityIndicatorProps> = ({
  isStable,
  isSupported,
}) => {
  const haptics = useHapticFeedback();

  React.useEffect(() => {
    if (!isStable) {
      haptics.warning();
    }
  }, [isStable]);

  if (!isSupported) return null;

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
      <div
        className={`
          px-4 py-2 rounded-full backdrop-blur-sm
          transition-all duration-300 ease-in-out
          ${
            isStable
              ? 'bg-green-500/20 text-green-50'
              : 'bg-red-500/20 text-red-50 animate-pulse'
          }
        `}
      >
        <div className="flex items-center space-x-2">
          <span
            className={`
              w-2 h-2 rounded-full
              ${isStable ? 'bg-green-400' : 'bg-red-400'}
            `}
          />
          <span className="text-sm font-medium">
            {isStable ? 'Estable' : 'Dispositivo inestable'}
          </span>
        </div>
      </div>
    </div>
  );
};
