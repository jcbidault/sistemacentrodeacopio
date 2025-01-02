import { useState, useEffect, useCallback } from 'react';
import { useBatteryStatus } from './useBatteryStatus';

interface PowerSavingOptions {
  lowBatteryThreshold?: number;
  criticalBatteryThreshold?: number;
  enableAutoMode?: boolean;
}

export const usePowerSaving = ({
  lowBatteryThreshold = 20,
  criticalBatteryThreshold = 10,
  enableAutoMode = true,
}: PowerSavingOptions = {}) => {
  const [powerSavingMode, setPowerSavingMode] = useState<'off' | 'eco' | 'critical'>('off');
  const [isAutoMode, setIsAutoMode] = useState(enableAutoMode);
  const { batteryState, isSupported: isBatterySupported } = useBatteryStatus();

  // Configuraciones para cada modo
  const powerModes = {
    off: {
      frameRate: 30,
      resolution: { width: 1280, height: 720 },
      torch: true, // Permite el uso de la linterna
    },
    eco: {
      frameRate: 20,
      resolution: { width: 960, height: 540 },
      torch: true,
    },
    critical: {
      frameRate: 15,
      resolution: { width: 640, height: 480 },
      torch: false, // Deshabilita la linterna para ahorrar batería
    },
  };

  // Actualizar modo basado en nivel de batería
  useEffect(() => {
    if (!isAutoMode || !isBatterySupported || !batteryState) return;

    const batteryLevel = batteryState.level;
    const isCharging = batteryState.charging;

    if (isCharging) {
      setPowerSavingMode('off');
    } else if (batteryLevel <= criticalBatteryThreshold) {
      setPowerSavingMode('critical');
    } else if (batteryLevel <= lowBatteryThreshold) {
      setPowerSavingMode('eco');
    } else {
      setPowerSavingMode('off');
    }
  }, [
    batteryState,
    isBatterySupported,
    isAutoMode,
    lowBatteryThreshold,
    criticalBatteryThreshold,
  ]);

  // Función para cambiar manualmente el modo
  const setMode = useCallback((mode: 'off' | 'eco' | 'critical') => {
    setPowerSavingMode(mode);
    setIsAutoMode(false);
  }, []);

  // Función para activar/desactivar el modo automático
  const toggleAutoMode = useCallback(() => {
    setIsAutoMode(prev => !prev);
  }, []);

  // Obtener las configuraciones actuales
  const getCurrentConfig = useCallback(() => {
    return powerModes[powerSavingMode];
  }, [powerSavingMode]);

  // Estimar el ahorro de batería
  const estimateBatterySavings = useCallback(() => {
    const baseConsumption = 100; // Consumo base estimado en modo normal
    const savings = {
      off: 0,
      eco: 30, // 30% de ahorro estimado
      critical: 50, // 50% de ahorro estimado
    };

    return savings[powerSavingMode];
  }, [powerSavingMode]);

  return {
    powerSavingMode,
    setMode,
    isAutoMode,
    toggleAutoMode,
    currentConfig: getCurrentConfig(),
    estimatedSavings: estimateBatterySavings(),
    isBatterySupported,
  };
};
