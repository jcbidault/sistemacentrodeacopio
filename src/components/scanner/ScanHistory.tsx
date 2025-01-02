import React, { useState } from 'react';
import { useHapticFeedback } from '../../hooks/useHapticFeedback';
import type { ScanResult } from '../../hooks/useScanHistory';

interface ScanHistoryProps {
  groupedHistory: Record<string, ScanResult[]>;
  onCopy: (text: string) => Promise<boolean>;
  onRemove: (id: string) => void;
  onClear: () => void;
  onExport: () => void;
}

export const ScanHistory: React.FC<ScanHistoryProps> = ({
  groupedHistory,
  onCopy,
  onRemove,
  onClear,
  onExport,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const haptics = useHapticFeedback();

  const handleCopy = async (scan: ScanResult) => {
    haptics.light();
    const success = await onCopy(scan.text);
    if (success) {
      setCopiedId(scan.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleRemove = (id: string) => {
    haptics.light();
    onRemove(id);
  };

  const handleClear = () => {
    haptics.warning();
    if (window.confirm('¿Estás seguro de que quieres borrar todo el historial?')) {
      onClear();
    }
  };

  const handleExport = () => {
    haptics.light();
    onExport();
  };

  if (Object.keys(groupedHistory).length === 0) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-20">
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 px-4 py-2 bg-black/40 backdrop-blur-sm rounded-full text-white text-sm font-medium flex items-center space-x-2"
        >
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
          <span>Historial</span>
        </button>

        {isOpen && (
          <div className="bg-black/40 backdrop-blur-sm">
            <div className="max-h-[50vh] overflow-y-auto">
              <div className="p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-white font-medium">Historial de Escaneos</h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={handleExport}
                      className="px-3 py-1 bg-blue-500 text-white text-sm rounded-md"
                    >
                      Exportar
                    </button>
                    <button
                      onClick={handleClear}
                      className="px-3 py-1 bg-red-500 text-white text-sm rounded-md"
                    >
                      Limpiar
                    </button>
                  </div>
                </div>

                {Object.entries(groupedHistory).map(([date, scans]) => (
                  <div key={date} className="space-y-2">
                    <h4 className="text-white/60 text-sm">{date}</h4>
                    <div className="space-y-2">
                      {scans.map(scan => (
                        <div
                          key={scan.id}
                          className="bg-white/10 rounded-lg p-3 space-y-2"
                        >
                          <div className="flex justify-between items-start">
                            <div className="space-y-1">
                              <p className="text-white font-medium break-all">
                                {scan.text}
                              </p>
                              <div className="flex items-center space-x-2">
                                <span className="text-xs text-white/60">
                                  {new Date(scan.timestamp).toLocaleTimeString()}
                                </span>
                                <span className="text-xs px-2 py-0.5 bg-white/20 rounded-full text-white/80">
                                  {scan.type}
                                </span>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleCopy(scan)}
                                className="p-2 hover:bg-white/10 rounded-md transition-colors"
                                title="Copiar"
                              >
                                {copiedId === scan.id ? (
                                  <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                ) : (
                                  <svg className="w-5 h-5 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                  </svg>
                                )}
                              </button>
                              <button
                                onClick={() => handleRemove(scan.id)}
                                className="p-2 hover:bg-white/10 rounded-md transition-colors"
                                title="Eliminar"
                              >
                                <svg className="w-5 h-5 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
