export const useHapticFeedback = () => {
  const isVibrationAvailable = 'vibrate' in navigator;

  const vibrate = (pattern: number | number[]) => {
    if (isVibrationAvailable) {
      navigator.vibrate(pattern);
    }
  };

  const success = () => {
    vibrate(200); // Un pulso largo para éxito
  };

  const error = () => {
    vibrate([100, 100, 100]); // Tres pulsos cortos para error
  };

  const light = () => {
    vibrate(50); // Un pulso muy corto para feedback ligero
  };

  const warning = () => {
    vibrate([100, 50, 100]); // Dos pulsos para advertencia
  };

  return {
    isAvailable: isVibrationAvailable,
    vibrate,
    success,
    error,
    light,
    warning
  };
};
