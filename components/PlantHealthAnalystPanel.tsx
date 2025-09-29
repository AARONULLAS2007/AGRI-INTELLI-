
import React, { useState, useRef, useCallback } from 'react';
import Panel from './Panel';
import type { Language, PlantHealthAnalysisResponse, FarmData } from '../types';
import { TRANSLATIONS } from '../constants';
import { getPlantHealthAnalysis } from '../services/geminiService';

interface PlantHealthAnalystPanelProps {
  language: Language;
  farmData: FarmData;
}

const PlantHealthAnalystPanel: React.FC<PlantHealthAnalystPanelProps> = ({ language, farmData }) => {
  const t = TRANSLATIONS[language];
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [result, setResult] = useState<PlantHealthAnalysisResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
      setError(null);
    }
  };

  const startCamera = async () => {
    stopCamera();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCameraOn(true);
        setImage(null);
        setPreviewUrl(null);
        setResult(null);
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Could not access camera. Please check permissions.");
    }
  };

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      setIsCameraOn(false);
    }
  }, []);

  const captureImage = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
      canvas.toBlob(blob => {
        if (blob) {
          const file = new File([blob], "capture.jpg", { type: "image/jpeg" });
          setImage(file);
          setPreviewUrl(URL.createObjectURL(file));
          stopCamera();
        }
      }, 'image/jpeg');
    }
  };

  const handleAnalyze = async () => {
    if (!image) return;
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const response = await getPlantHealthAnalysis(image, farmData, language);
      setResult(response);
    } catch (err) {
      setError(t.errorAnalysis);
    } finally {
      setIsLoading(false);
    }
  };
  
  const ResultDisplay = ({ data }: { data: PlantHealthAnalysisResponse }) => (
    <div className="space-y-3">
        <div>
            <h5 className="text-sm font-semibold text-muted-light dark:text-muted-dark">{t.plantHealthStatus}</h5>
            <p className="font-bold text-lg text-primary">{data.plant_health_status}</p>
        </div>
        <div>
            <h5 className="text-sm font-semibold text-muted-light dark:text-muted-dark">{t.growthStage}</h5>
            <p>{data.growth_stage}</p>
        </div>
        <div>
            <h5 className="text-sm font-semibold text-muted-light dark:text-muted-dark">{t.stressFactors}</h5>
            <ul className="list-disc list-inside text-sm space-y-1">
                {data.stress_factors.map((factor, i) => <li key={i}>{factor}</li>)}
            </ul>
        </div>
        <div>
            <h5 className="text-sm font-semibold text-muted-light dark:text-muted-dark">{t.recommendations}</h5>
            <ul className="list-disc list-inside text-sm space-y-1">
                {data.recommendations.map((rec, i) => <li key={i}>{rec}</li>)}
            </ul>
        </div>
        {data.growth_trends && (
             <div>
                <h5 className="text-sm font-semibold text-muted-light dark:text-muted-dark">{t.growthTrends}</h5>
                <p className="text-sm">{data.growth_trends}</p>
            </div>
        )}
    </div>
  );

  return (
    <Panel title={t.plantHealthAnalyst} className="row-span-2">
      <div className="flex flex-col h-full">
        <div className="border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-lg flex-grow flex items-center justify-center bg-background-light dark:bg-background-dark overflow-hidden min-h-[150px]">
          {previewUrl && <img src={previewUrl} alt="Plant preview" className="max-h-full max-w-full object-contain" />}
          {isCameraOn && <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />}
          {!previewUrl && !isCameraOn && <p className="text-muted-light dark:text-muted-dark text-center p-4">{t.uploadOrCaptureImage}</p>}
        </div>
        
        <div className="flex flex-wrap gap-2 mt-4">
          <button onClick={() => fileInputRef.current?.click()} className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">{t.uploadImage}</button>
          <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
          {!isCameraOn ? (
            <button onClick={startCamera} className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">{t.useCamera}</button>
          ) : (
            <>
              <button onClick={captureImage} className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">{t.capture}</button>
              <button onClick={stopCamera} className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">{t.stopCamera}</button>
            </>
          )}
        </div>

        {image && <button onClick={handleAnalyze} disabled={isLoading} className="w-full mt-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50">{isLoading ? t.analyzing : t.analyzePlant}</button>}
        
        <div className="mt-4 flex-grow overflow-y-auto pr-2">
            {isLoading && (
                <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <p className="ml-3">{t.analyzing}</p>
                </div>
            )}
            {error && <div className="text-red-400 p-2 bg-red-500/10 rounded-lg text-sm">{error}</div>}
            {result && (
            <div className="p-4 bg-background-light dark:bg-background-dark rounded-lg">
                <h4 className="font-bold text-lg mb-2">{t.analysisResults}</h4>
                <ResultDisplay data={result} />
            </div>
            )}
        </div>

      </div>
    </Panel>
  );
};

export default PlantHealthAnalystPanel;
