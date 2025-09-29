import React, { useState, useRef, useCallback, useEffect } from 'react';
import Panel from './Panel';
import type { Language, PestLogEntry } from '../types';
import { TRANSLATIONS } from '../constants';
import { identifyPest } from '../services/geminiService';

interface LivePestMonitorPanelProps {
  language: Language;
}

const LivePestMonitorPanel: React.FC<LivePestMonitorPanelProps> = ({ language }) => {
  const t = TRANSLATIONS[language];
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pestLogs, setPestLogs] = useState<PestLogEntry[]>([]);
  const [lastScanResult, setLastScanResult] = useState<string | null>(null);
  const [isAutoScanEnabled, setIsAutoScanEnabled] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      setIsCameraOn(false);
      setIsAutoScanEnabled(false);
    }
  }, []);

  const startCamera = async () => {
    // This functionality is disabled as per user request to remove camera permissions.
    // To re-enable, add "camera" to metadata.json and remove the disabled prop from the button.
    setError(t.cameraDisabled);
  };

  const handleScan = useCallback(async () => {
    if (!videoRef.current || isLoading) return;
    setIsLoading(true);
    setError(null);
    setLastScanResult(null);

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
    
    const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg'));
    if (!blob) {
        setError(t.errorPestId);
        setIsLoading(false);
        return;
    }
    const file = new File([blob], "pest-scan.jpg", { type: "image/jpeg" });

    try {
      const response = await identifyPest(file, language);
      if (response && response.pestName && response.pestName.toLowerCase() !== 'n/a') {
        const timestamp = new Date().toLocaleTimeString(language, { hour: '2-digit', minute: '2-digit' });
        const newLog: PestLogEntry = {
            id: Date.now().toString(),
            details: `${response.pestName} ${t.pestIdentified}. ${t.actionSprayed} ${timestamp}.`
        };
        setPestLogs(prevLogs => [newLog, ...prevLogs]);
      } else {
        setLastScanResult(t.noPestsFound);
      }
    } catch (err) {
      setError(t.errorPestId);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, language, t]);

  useEffect(() => {
    // Component cleanup
    return () => stopCamera();
  }, [stopCamera]);

  useEffect(() => {
    // Automated scanning interval
    if (isAutoScanEnabled && isCameraOn) {
        const intervalId = window.setInterval(handleScan, 65000);
        return () => clearInterval(intervalId);
    }
  }, [isAutoScanEnabled, isCameraOn, handleScan]);


  return (
    <Panel title={t.livePestMonitor} className="row-span-2">
      <div className="flex flex-col h-full">
        <div className="relative border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-lg flex-grow flex items-center justify-center bg-background-light dark:bg-background-dark overflow-hidden">
          <video ref={videoRef} autoPlay playsInline className={`w-full h-full object-cover ${!isCameraOn && 'hidden'}`} />
          {!isCameraOn && <p className="text-muted-light dark:text-muted-dark px-4 text-center">{t.useCamera} to scan for pests.</p>}
          {isLoading && (
            <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                <p className="text-white mt-3">{t.scanning}</p>
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-2 mt-4">
            {!isCameraOn ? (
                 <button 
                    onClick={startCamera} 
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    disabled={true}
                    title={t.cameraDisabled}
                 >
                    {t.startCamera}
                 </button>
            ): (
                <>
                    <button onClick={handleScan} disabled={isLoading || isAutoScanEnabled} className="flex-1 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed">{t.scanForPests}</button>
                    <button onClick={stopCamera} className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">{t.stopCamera}</button>
                </>
            )}
        </div>
        
        {isCameraOn && (
            <div className="mt-4 flex items-center justify-center">
                <label htmlFor="auto-scan-toggle" className="flex items-center cursor-pointer">
                    <div className="relative">
                        <input
                            type="checkbox"
                            id="auto-scan-toggle"
                            className="sr-only peer"
                            checked={isAutoScanEnabled}
                            onChange={() => !isLoading && setIsAutoScanEnabled(prev => !prev)}
                        />
                        <div className="w-11 h-6 bg-gray-200 rounded-full dark:bg-gray-700 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </div>
                    <span className="ml-3 text-sm font-medium text-text-light dark:text-text-dark">{t.automatedScanning}</span>
                </label>
            </div>
        )}

         {error && <div className="mt-4 text-red-400 p-2 bg-red-500/10 rounded-lg text-sm">{error}</div>}
         {lastScanResult && <div className="mt-4 text-green-400 p-2 bg-green-500/10 rounded-lg text-sm">{lastScanResult}</div>}

        <div className="mt-4 pt-2 border-t border-gray-200 dark:border-slate-600 flex-grow flex flex-col min-h-0">
          <h4 className="font-bold text-md mb-2 flex-shrink-0">{t.activityLog}</h4>
          <div className="space-y-2 overflow-y-auto pr-2 flex-grow">
            {pestLogs.length > 0 ? pestLogs.map(log => (
                <div key={log.id} className="text-xs p-2 bg-background-light dark:bg-background-dark rounded-md">
                    <p>{log.details}</p>
                </div>
            )) : <p className="text-xs text-muted-light dark:text-muted-dark">{t.noActiveAlerts}</p>}
          </div>
        </div>
      </div>
    </Panel>
  );
};

export default LivePestMonitorPanel;