import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useZxing } from 'react-zxing';
import { BarcodeFormat } from '@zxing/library';
import { useHapticFeedback } from '../../hooks/useHapticFeedback';
import { useCameraZoom } from '../../hooks/useCameraZoom';
import { useMotionDetection } from '../../hooks/useMotionDetection';
import { usePowerSaving } from '../../hooks/usePowerSaving';
import { useCameraResolution } from '../../hooks/useCameraResolution';
import { useCodeFormats } from '../../hooks/useCodeFormats';
import { useScanHistory } from '../../hooks/useScanHistory';
import { CameraPermission } from '../common/CameraPermission';
import { BatteryAlert } from '../common/BatteryAlert';
import { ZoomControl } from './ZoomControl';
import { StabilityIndicator } from './StabilityIndicator';
import { PowerSavingControl } from './PowerSavingControl';
import { ResolutionControl } from './ResolutionControl';
import { CodeFormatControl } from './CodeFormatControl';
import { ScanHistory } from './ScanHistory';

interface BarcodeScannerProps {
  onResult: (result: { text: string; format: BarcodeFormat }) => void;
  onError?: (error: Error) => void;
}

export const BarcodeScanner: React.FC<BarcodeScannerProps> = ({
  onResult,
  onError,
}) => {
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [isScanning, setIsScanning] = useState(true);
  const haptics = useHapticFeedback();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [videoTrack, setVideoTrack] = useState<MediaStreamTrack | null>(null);
  const stabilityTimeout = useRef<NodeJS.Timeout>();

  const { isSupported: isMotionSupported, isStable } = useMotionDetection();
  const {
    powerSavingMode,
    setMode,
    isAutoMode,
    toggleAutoMode,
    currentConfig,
    estimatedSavings,
    isBatterySupported,
  } = usePowerSaving();

  const {
    capabilities,
    selectedResolution,
    setResolution,
    estimatePerformanceImpact,
    isSupported: isResolutionSupported,
  } = useCameraResolution(videoTrack);

  const {
    activeType,
    setActiveType,
    getActiveFormats,
    lastDetectedFormat,
    setLastDetectedFormat,
    getFormatDescription,
    identifyCodeType,
  } = useCodeFormats();

  const {
    groupedHistory,
    addScan,
    removeScan,
    clearHistory,
    copyToClipboard,
    exportHistory,
  } = useScanHistory();

  useEffect(() => {
    if (!capabilities?.resolutions.length) return;

    const optimalResolutions = {
      off: capabilities.resolutions[capabilities.resolutions.length - 1],
      eco: capabilities.resolutions[Math.floor(capabilities.resolutions.length / 2)],
      critical: capabilities.resolutions[0],
    };

    setResolution(optimalResolutions[powerSavingMode]);
  }, [powerSavingMode, capabilities]);

  const handleResult = useCallback((result: { text: string; format: BarcodeFormat }) => {
    if (isStable || !isMotionSupported) {
      haptics.success();
      setLastDetectedFormat(result.format);
      
      // Agregar al historial
      addScan({
        text: result.text,
        format: result.format,
        type: identifyCodeType(result.format),
      });
      
      onResult(result);
    }
  }, [onResult, isStable, isMotionSupported, setLastDetectedFormat, addScan, identifyCodeType]);

  const handleError = useCallback((error: Error) => {
    haptics.error();
    onError?.(error);
  }, [onError]);

  useEffect(() => {
    if (stabilityTimeout.current) {
      clearTimeout(stabilityTimeout.current);
    }

    if (!isStable && isMotionSupported) {
      stabilityTimeout.current = setTimeout(() => {
        setIsScanning(false);
      }, 500);
    } else {
      setIsScanning(true);
    }

    return () => {
      if (stabilityTimeout.current) {
        clearTimeout(stabilityTimeout.current);
      }
    };
  }, [isStable, isMotionSupported]);

  const {
    ref,
    torch,
    isStarted,
    start,
    stop,
    pause,
    resume,
  } = useZxing({
    onDecodeResult: handleResult,
    onError: handleError,
    constraints: {
      facingMode: 'environment',
      width: selectedResolution.width,
      height: selectedResolution.height,
      frameRate: { ideal: currentConfig.frameRate },
    },
    paused: !isScanning,
    formats: getActiveFormats(),
  });

  useEffect(() => {
    if (videoRef.current) {
      ref(videoRef.current);
      const stream = videoRef.current.srcObject as MediaStream;
      if (stream) {
        const track = stream.getVideoTracks()[0];
        setVideoTrack(track);

        track.applyConstraints({
          width: selectedResolution.width,
          height: selectedResolution.height,
          frameRate: currentConfig.frameRate,
        }).catch(console.error);
      }
    }
  }, [ref, isStarted, currentConfig, selectedResolution]);

  const {
    zoomLevel,
    setZoom,
    isZoomSupported,
  } = useCameraZoom(videoTrack);

  const handleZoomIn = useCallback(() => {
    setZoom(zoomLevel + 0.1);
  }, [zoomLevel, setZoom]);

  const handleZoomOut = useCallback(() => {
    setZoom(zoomLevel - 0.1);
  }, [zoomLevel, setZoom]);

  const toggleTorch = useCallback(() => {
    if (currentConfig.torch) {
      setTorchEnabled(!torchEnabled);
      torch.toggle();
      haptics.light();
    }
  }, [torchEnabled, torch, currentConfig.torch]);

  return (
    <CameraPermission
      onGranted={start}
      onDenied={stop}
    >
      <div className="scanner-container relative">
        <video ref={videoRef} className="w-full h-full object-cover" />
        
        <StabilityIndicator
          isStable={isStable}
          isSupported={isMotionSupported}
        />

        <PowerSavingControl
          mode={powerSavingMode}
          isAutoMode={isAutoMode}
          onModeChange={setMode}
          onAutoModeToggle={toggleAutoMode}
          estimatedSavings={estimatedSavings}
          isBatterySupported={isBatterySupported}
        />

        {capabilities && (
          <ResolutionControl
            resolutions={capabilities.resolutions}
            currentResolution={selectedResolution}
            onResolutionChange={setResolution}
            performanceImpact={estimatePerformanceImpact()}
            isSupported={isResolutionSupported}
          />
        )}

        <CodeFormatControl
          activeType={activeType}
          onTypeChange={setActiveType}
          lastDetectedFormat={lastDetectedFormat}
          formatDescription={lastDetectedFormat ? getFormatDescription(lastDetectedFormat) : ''}
        />

        <ScanHistory
          groupedHistory={groupedHistory}
          onCopy={copyToClipboard}
          onRemove={removeScan}
          onClear={clearHistory}
          onExport={exportHistory}
        />

        <div className="scanner-overlay">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`
              w-64 h-64 border-2 border-white rounded-lg relative overflow-hidden
              transition-all duration-300
              ${!isScanning ? 'opacity-50' : 'opacity-100'}
            `}>
              <div className="absolute inset-0 border-[20px] border-white/30" />
              <div className={`
                absolute top-0 left-0 right-0 h-0.5 bg-blue-500
                ${isScanning ? 'animate-scan' : ''}
              `} />
            </div>
          </div>
        </div>

        <ZoomControl
          zoomLevel={zoomLevel}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          isZoomSupported={isZoomSupported}
        />

        <div className="absolute bottom-0 inset-x-0 pb-safe">
          <div className="p-4 flex justify-center space-x-4">
            {currentConfig.torch && (
              <button
                onClick={toggleTorch}
                className="p-3 bg-white/10 rounded-full backdrop-blur-sm active:bg-white/20 touch-feedback"
              >
                <svg
                  className={`w-6 h-6 ${torchEnabled ? 'text-yellow-400' : 'text-white'}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>

        <BatteryAlert />
      </div>
    </CameraPermission>
  );
};
