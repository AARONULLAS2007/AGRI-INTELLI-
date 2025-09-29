import { useState, useEffect, useCallback, useRef } from 'react';
import type { FarmData, Language, PredictiveAnalyticsData } from '../types';
import { getPredictiveAnalytics } from '../services/predictionService';

const usePredictiveAnalytics = (farmData: FarmData, language: Language) => {
  const [predictions, setPredictions] = useState<PredictiveAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const farmDataRef = useRef(farmData);
  useEffect(() => {
    farmDataRef.current = farmData;
  }, [farmData]);

  const fetchPredictions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getPredictiveAnalytics(farmDataRef.current, language);
      setPredictions(result);
    } catch (err) {
      setError('Could not fetch predictions.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [language]);

  useEffect(() => {
    fetchPredictions();
  }, [fetchPredictions]);

  return { predictions, isLoading, error, refetch: fetchPredictions };
};

export default usePredictiveAnalytics;