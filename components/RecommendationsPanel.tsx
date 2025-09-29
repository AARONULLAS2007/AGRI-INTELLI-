import React, { useState, useCallback, useEffect, useRef } from 'react';
import Panel from './Panel';
import type { FarmData, Language, PlantRecommendationResponse } from '../types';
import { TRANSLATIONS } from '../constants';
import { getAIPlantRecommendation } from '../services/geminiService';
import { RefreshIcon } from './Icons';

interface RecommendationsPanelProps {
  farmData: FarmData;
  language: Language;
}

const RecommendationsPanel: React.FC<RecommendationsPanelProps> = ({ farmData, language }) => {
  const t = TRANSLATIONS[language];
  const [recommendation, setRecommendation] = useState<PlantRecommendationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAutoSuggestEnabled, setIsAutoSuggestEnabled] = useState(false);

  const fetchPlantRecommendation = useCallback(async () => {
    if (isLoading) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await getAIPlantRecommendation(farmData, language);
      setRecommendation(result);
    } catch (err) {
      setError(t.errorRecommendations);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [farmData, language, t.errorRecommendations, isLoading]);
  
  const handleRefresh = () => {
      fetchPlantRecommendation();
  };

  const savedFetchFn = useRef(fetchPlantRecommendation);
  useEffect(() => {
    savedFetchFn.current = fetchPlantRecommendation;
  }, [fetchPlantRecommendation]);

  useEffect(() => {
    if (isAutoSuggestEnabled) {
      const tick = () => savedFetchFn.current();
      tick();
      const intervalId = window.setInterval(tick, 65000);
      return () => window.clearInterval(intervalId);
    }
  }, [isAutoSuggestEnabled]);

  const RefreshButton = (
      <button 
          onClick={handleRefresh}
          disabled={isLoading || isAutoSuggestEnabled}
          className="p-2 rounded-full bg-primary/20 text-primary hover:bg-primary/30 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label={t.refresh}
      >
          <RefreshIcon />
      </button>
  );

  return (
    <Panel title={t.aiCropSuggestion} actions={RefreshButton}>
      <div className="h-full flex flex-col justify-between">
        <div className="flex-grow">
            {isLoading ? (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="ml-3">{t.loadingRecommendations}</p>
            </div>
            ) : error ? (
            <div className="text-red-400 p-4 bg-red-500/10 rounded-lg">{error}</div>
            ) : recommendation ? (
                <div className="space-y-3 text-sm">
                <div>
                    <h4 className="font-semibold text-muted-light dark:text-muted-dark">{t.recommendedCrop}</h4>
                    <p className="text-2xl font-bold text-primary">{recommendation.plantName}</p>
                </div>
                <div>
                    <h4 className="font-semibold text-muted-light dark:text-muted-dark">{t.justification}</h4>
                    <p>{recommendation.justification}</p>
                </div>
                </div>
            ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-light dark:text-muted-dark">
                <p>{t.clickRefreshSuggestion}</p>
            </div>
            )}
        </div>
        <div className="mt-4 flex items-center justify-end flex-shrink-0">
            <label htmlFor="auto-suggest-toggle" className="flex items-center cursor-pointer">
                <span className="mr-3 text-sm font-medium text-text-light dark:text-text-dark">{t.automatedSuggestion}</span>
                <div className="relative">
                    <input
                        type="checkbox"
                        id="auto-suggest-toggle"
                        className="sr-only peer"
                        checked={isAutoSuggestEnabled}
                        onChange={() => setIsAutoSuggestEnabled(prev => !prev)}
                        disabled={isLoading}
                    />
                    <div className="w-11 h-6 bg-gray-200 rounded-full dark:bg-gray-700 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </div>
            </label>
        </div>
      </div>
    </Panel>
  );
};

export default RecommendationsPanel;