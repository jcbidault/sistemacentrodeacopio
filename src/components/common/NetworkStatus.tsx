import { useState, useEffect } from 'react';
import { useHapticFeedback } from '../../hooks/useHapticFeedback';

export const NetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const haptics = useHapticFeedback();

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      haptics.success();
    };

    const handleOffline = () => {
      setIsOnline(false);
      haptics.error();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 pb-safe">
      <div className="bg-red-500 text-white px-4 py-3 text-center">
        <p className="text-sm font-medium">
          Sin conexión - Los cambios se guardarán cuando vuelvas a estar en línea
        </p>
      </div>
    </div>
  );
};
