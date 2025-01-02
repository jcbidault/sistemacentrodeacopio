import { useState, useEffect } from 'react';

interface BatteryState {
  charging: boolean;
  level: number;
  chargingTime: number;
  dischargingTime: number;
}

export const useBatteryStatus = () => {
  const [batteryState, setBatteryState] = useState<BatteryState | null>(null);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    const getBattery = async () => {
      if ('getBattery' in navigator) {
        try {
          const battery: any = await (navigator as any).getBattery();
          setIsSupported(true);

          const updateBatteryState = () => {
            setBatteryState({
              charging: battery.charging,
              level: battery.level * 100,
              chargingTime: battery.chargingTime,
              dischargingTime: battery.dischargingTime,
            });
          };

          // Actualizar estado inicial
          updateBatteryState();

          // Escuchar cambios
          battery.addEventListener('chargingchange', updateBatteryState);
          battery.addEventListener('levelchange', updateBatteryState);
          battery.addEventListener('chargingtimechange', updateBatteryState);
          battery.addEventListener('dischargingtimechange', updateBatteryState);

          return () => {
            battery.removeEventListener('chargingchange', updateBatteryState);
            battery.removeEventListener('levelchange', updateBatteryState);
            battery.removeEventListener('chargingtimechange', updateBatteryState);
            battery.removeEventListener('dischargingtimechange', updateBatteryState);
          };
        } catch (error) {
          console.warn('Error al acceder al estado de la batería:', error);
          setIsSupported(false);
        }
      } else {
        setIsSupported(false);
      }
    };

    getBattery();
  }, []);

  return {
    isSupported,
    batteryState,
    isLowBattery: batteryState ? batteryState.level <= 15 : false,
    isCriticalBattery: batteryState ? batteryState.level <= 5 : false,
  };
};
