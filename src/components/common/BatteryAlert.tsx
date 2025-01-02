import { useEffect } from 'react';
import { useBatteryStatus } from '../../hooks/useBatteryStatus';
import { useHapticFeedback } from '../../hooks/useHapticFeedback';

export const BatteryAlert = () => {
  const { isSupported, batteryState, isLowBattery, isCriticalBattery } = useBatteryStatus();
  const haptics = useHapticFeedback();

  useEffect(() => {
    if (isCriticalBattery) {
      haptics.warning();
    }
  }, [isCriticalBattery]);

  if (!isSupported || !batteryState || (!isLowBattery && !isCriticalBattery)) {
    return null;
  }

  return (
    <div
      className={`fixed bottom-0 inset-x-0 pb-safe z-50 ${
        isCriticalBattery ? 'animate-pulse' : ''
      }`}
    >
      <div
        className={`px-4 py-3 text-center ${
          isCriticalBattery
            ? 'bg-red-500 text-white'
            : 'bg-yellow-400 text-yellow-900'
        }`}
      >
        <div className="flex items-center justify-center space-x-2">
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
          <p className="text-sm font-medium">
            {isCriticalBattery
              ? 'Batería crítica. Por favor, conecte el dispositivo.'
              : 'Batería baja. Considere conectar el dispositivo.'}
          </p>
        </div>
        <p className="text-xs mt-1">
          {batteryState.charging
            ? `Cargando: ${batteryState.level.toFixed(0)}%`
            : `Batería: ${batteryState.level.toFixed(0)}%`}
        </p>
      </div>
    </div>
  );
};
