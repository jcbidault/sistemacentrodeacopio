import React from 'react';
import { useHapticFeedback } from '../../hooks/useHapticFeedback';
import { CodeType } from '../../hooks/useCodeFormats';

interface CodeFormatControlProps {
  activeType: CodeType;
  onTypeChange: (type: CodeType) => void;
  lastDetectedFormat: string | null;
  formatDescription: string;
}

export const CodeFormatControl: React.FC<CodeFormatControlProps> = ({
  activeType,
  onTypeChange,
  lastDetectedFormat,
  formatDescription,
}) => {
  const haptics = useHapticFeedback();

  const handleTypeChange = (type: CodeType) => {
    haptics.light();
    onTypeChange(type);
  };

  return (
    <div className="absolute left-4 bottom-24 z-10">
      <div className="bg-black/40 backdrop-blur-sm rounded-lg p-2">
        <div className="flex flex-col space-y-2">
          <button
            onClick={() => handleTypeChange('ALL')}
            className={`
              px-3 py-2 rounded-md text-sm font-medium
              ${activeType === 'ALL' ? 'bg-blue-500 text-white' : 'text-white/80 hover:bg-white/10'}
            `}
            title="Todos los formatos"
          >
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <span>Todos</span>
            </div>
          </button>

          <button
            onClick={() => handleTypeChange('BARCODE')}
            className={`
              px-3 py-2 rounded-md text-sm font-medium
              ${activeType === 'BARCODE' ? 'bg-blue-500 text-white' : 'text-white/80 hover:bg-white/10'}
            `}
            title="Solo códigos de barras"
          >
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0 0h12m-12 0h-2m2 0v-4m6 4v-4m0 4h2m-6 0h-2m2 0v-4m6 4v-4" />
              </svg>
              <span>Barras</span>
            </div>
          </button>

          <button
            onClick={() => handleTypeChange('QR')}
            className={`
              px-3 py-2 rounded-md text-sm font-medium
              ${activeType === 'QR' ? 'bg-blue-500 text-white' : 'text-white/80 hover:bg-white/10'}
            `}
            title="Solo códigos QR"
          >
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0 0h12m-12 0h-2m2 0v-4m6 4v-4m0 4h2m-6 0h-2m2 0v-4m6 4v-4" />
              </svg>
              <span>QR</span>
            </div>
          </button>
        </div>
      </div>

      {lastDetectedFormat && (
        <div className="mt-2 p-2 bg-green-500/20 backdrop-blur-sm rounded-lg">
          <p className="text-xs text-white">
            <span className="font-medium">Último detectado:</span>
            <br />
            {formatDescription}
          </p>
        </div>
      )}
    </div>
  );
};
