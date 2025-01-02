import React from 'react';
import { useHapticFeedback } from '../../hooks/useHapticFeedback';

interface PowerSavingControlProps {
  mode: 'off' | 'eco' | 'critical';
  isAutoMode: boolean;
  onModeChange: (mode: 'off' | 'eco' | 'critical') => void;
  onAutoModeToggle: () => void;
  estimatedSavings: number;
  isBatterySupported: boolean;
}

export const PowerSavingControl: React.FC<PowerSavingControlProps> = ({
  mode,
  isAutoMode,
  onModeChange,
  onAutoModeToggle,
  estimatedSavings,
  isBatterySupported,
}) => {
  const haptics = useHapticFeedback();

  const handleModeChange = (newMode: 'off' | 'eco' | 'critical') => {
    haptics.light();
    onModeChange(newMode);
  };

  const handleAutoModeToggle = () => {
    haptics.light();
    onAutoModeToggle();
  };

  if (!isBatterySupported) return null;

  return (
    <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col space-y-2">
      <div className="bg-black/40 backdrop-blur-sm rounded-lg p-2">
        <div className="flex flex-col space-y-2">
          <button
            onClick={() => handleModeChange('off')}
            className={`p-2 rounded-md transition-colors ${
              mode === 'off' && !isAutoMode
                ? 'bg-blue-500 text-white'
                : 'bg-white/10 text-white/80 hover:bg-white/20'
            }`}
            title="Modo Normal"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </button>

          <button
            onClick={() => handleModeChange('eco')}
            className={`p-2 rounded-md transition-colors ${
              mode === 'eco' && !isAutoMode
                ? 'bg-green-500 text-white'
                : 'bg-white/10 text-white/80 hover:bg-white/20'
            }`}
            title="Modo Eco"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
              />
            </svg>
          </button>

          <button
            onClick={() => handleModeChange('critical')}
            className={`p-2 rounded-md transition-colors ${
              mode === 'critical' && !isAutoMode
                ? 'bg-red-500 text-white'
                : 'bg-white/10 text-white/80 hover:bg-white/20'
            }`}
            title="Modo Crítico"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </button>

          <button
            onClick={handleAutoModeToggle}
            className={`p-2 rounded-md transition-colors ${
              isAutoMode
                ? 'bg-purple-500 text-white'
                : 'bg-white/10 text-white/80 hover:bg-white/20'
            }`}
            title="Modo Automático"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </button>
        </div>
      </div>

      {estimatedSavings > 0 && (
        <div className="bg-green-500/20 backdrop-blur-sm rounded-lg p-2 text-center">
          <span className="text-xs text-white font-medium">
            {estimatedSavings}% ahorro
          </span>
        </div>
      )}
    </div>
  );
};
