import { useState, useCallback, useEffect } from 'react';
import { useHapticFeedback } from './useHapticFeedback';

type PermissionState = 'prompt' | 'granted' | 'denied';

export const useCameraPermission = () => {
  const [permissionState, setPermissionState] = useState<PermissionState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const haptics = useHapticFeedback();

  const checkPermission = useCallback(async () => {
    try {
      // Verificar si el navegador soporta la API de permisos
      if (!navigator.permissions || !navigator.mediaDevices) {
        setPermissionState('prompt');
        setIsLoading(false);
        return;
      }

      // En iOS/Safari, necesitamos manejar los permisos de manera diferente
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      if (isIOS) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          stream.getTracks().forEach(track => track.stop());
          setPermissionState('granted');
        } catch (error) {
          setPermissionState('prompt');
        }
        setIsLoading(false);
        return;
      }

      // Para otros navegadores, usar la API de permisos
      const result = await navigator.permissions.query({ name: 'camera' as PermissionName });
      setPermissionState(result.state);
      
      // Escuchar cambios en el estado del permiso
      result.addEventListener('change', () => {
        setPermissionState(result.state);
      });
    } catch (error) {
      console.error('Error checking camera permission:', error);
      setPermissionState('prompt');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    try {
      setIsLoading(true);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment'
        } 
      });
      
      // Importante: detener el stream después de obtener el permiso
      stream.getTracks().forEach(track => track.stop());
      
      setPermissionState('granted');
      haptics.success();
      return true;
    } catch (error) {
      console.error('Error requesting camera permission:', error);
      setPermissionState('denied');
      haptics.error();
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkPermission();
  }, [checkPermission]);

  return {
    permissionState,
    isLoading,
    requestPermission,
    isGranted: permissionState === 'granted',
    isDenied: permissionState === 'denied',
    needsPermission: permissionState === 'prompt',
  };
};
