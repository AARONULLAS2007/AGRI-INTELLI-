
import React, { useState, useRef, useCallback } from 'react';
import Panel from './Panel';
import type { Language, PestIDResponse } from '../types';
import { TRANSLATIONS } from '../constants';
import { identifyPest } from '../services/geminiService';

interface PestIdentifierPanelProps {
  language: Language;
}

const PestIdentifierPanel: React.FC<PestIdentifierPanelProps> = ({ language }) => {
  const t = TRANSLATIONS[language];
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [result, setResult] = useState<PestIDResponse | null>(null);
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
      const response = await identifyPest(image, language);
      if (response.pestName.toLowerCase() === 'n/a' || response.pestName.toLowerCase() === 'not applicable') {
          response.recommendation = t.noPestDetected;
      }
      setResult(response);
    } catch (err) {
      setError(t.errorPestId);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Panel title={t.aiPestIdentifier} className="row-span-2">
      <div className="flex flex-col h-full">
        <div className="border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-lg flex-grow flex items-center justify-center bg-background-light dark:bg-background-dark overflow-hidden">
          {previewUrl && <img src={previewUrl} alt="Pest preview" className="max-h-full max-w-full object-contain" />}
          {isCameraOn && <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />}
          {!previewUrl && !isCameraOn && <p className="text-muted-light dark:text-muted-dark">{t.uploadImage} or {t.useCamera}</p>}
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
        {image && <button onClick={handleAnalyze} disabled={isLoading} className="w-full mt-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50">{isLoading ? t.analyzing : t.analyzeImage}</button>}

        {isLoading && <div className="mt-4 text-center">{t.analyzing}</div>}
        {error && <div className="mt-4 text-red-400 p-2 bg-red-500/10 rounded-lg">{error}</div>}
        {result && (
          <div className="mt-4 p-4 bg-background-light dark:bg-background-dark rounded-lg">
            <h4 className="font-bold text-lg mb-2">{t.pestIdentificationResult}</h4>
            <div className="text-sm">
                <p><span className="font-semibold">{t.pestName}:</span> {result.pestName}</p>
                <p className="mt-2"><span className="font-semibold">{t.treatmentRecommendation}:</span> {result.recommendation}</p>
            </div>
          </div>
        )}
      </div>
    </Panel>
  );
};

export default PestIdentifierPanel;
