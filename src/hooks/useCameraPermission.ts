import { useState, useEffect } from 'react';
import { useHapticFeedback } from './useHapticFeedback';

type PermissionState = 'prompt' | 'granted' | 'denied';

export const useCameraPermission = () => {
  const [permissionState, setPermissionState] = useState<PermissionState>('prompt');
  const [isLoading, setIsLoading] = useState(true);
  const haptics = useHapticFeedback();

  const checkPermission = async () => {
    try {
      if (!navigator.permissions || !navigator.mediaDevices) {
        setPermissionState('denied');
        return;
      }

      const permission = await navigator.permissions.query({ name: 'camera' as PermissionName });
      setPermissionState(permission.state as PermissionState);

      permission.addEventListener('change', () => {
        setPermissionState(permission.state as PermissionState);
      });
    } catch (error) {
      console.warn('Error al verificar permisos de cámara:', error);
      setPermissionState('prompt');
    } finally {
      setIsLoading(false);
    }
  };

  const requestPermission = async () => {
    try {
      setIsLoading(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop());
      setPermissionState('granted');
      haptics.success();
      return true;
    } catch (error) {
      console.error('Error al solicitar permisos de cámara:', error);
      setPermissionState('denied');
      haptics.error();
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkPermission();
  }, []);

  return {
    permissionState,
    isLoading,
    requestPermission,
    isGranted: permissionState === 'granted',
    isDenied: permissionState === 'denied',
    needsPermission: permissionState === 'prompt',
  };
};
