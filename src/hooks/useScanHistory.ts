import { useState, useCallback, useEffect } from 'react';
import { BarcodeFormat } from '@zxing/library';

export interface ScanResult {
  id: string;
  text: string;
  format: BarcodeFormat;
  timestamp: number;
  type: 'BARCODE' | 'QR' | 'MATRIX';
}

const MAX_HISTORY_SIZE = 50; // Máximo número de escaneos a guardar
const STORAGE_KEY = 'scan_history';

export const useScanHistory = () => {
  const [history, setHistory] = useState<ScanResult[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  // Guardar en localStorage cuando cambie el historial
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  }, [history]);

  // Agregar nuevo escaneo
  const addScan = useCallback((result: Omit<ScanResult, 'id' | 'timestamp'>) => {
    setHistory(prev => {
      const newScan: ScanResult = {
        ...result,
        id: Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
      };
      
      const newHistory = [newScan, ...prev].slice(0, MAX_HISTORY_SIZE);
      return newHistory;
    });
  }, []);

  // Eliminar un escaneo
  const removeScan = useCallback((id: string) => {
    setHistory(prev => prev.filter(scan => scan.id !== id));
  }, []);

  // Limpiar historial
  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  // Copiar al portapapeles
  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      console.error('Error al copiar:', error);
      return false;
    }
  }, []);

  // Exportar historial
  const exportHistory = useCallback(() => {
    const exportData = history.map(scan => ({
      codigo: scan.text,
      tipo: scan.type,
      formato: scan.format,
      fecha: new Date(scan.timestamp).toLocaleString(),
    }));

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scan-history-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [history]);

  // Agrupar por fecha
  const groupedHistory = history.reduce<Record<string, ScanResult[]>>((groups, scan) => {
    const date = new Date(scan.timestamp).toLocaleDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(scan);
    return groups;
  }, {});

  return {
    history,
    groupedHistory,
    addScan,
    removeScan,
    clearHistory,
    copyToClipboard,
    exportHistory,
  };
};
