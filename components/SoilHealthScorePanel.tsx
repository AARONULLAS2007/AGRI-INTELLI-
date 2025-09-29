import React, { useState, useCallback, useEffect, useRef } from 'react';
import Panel from './Panel';
import type { FarmData, Language, SoilHealthScoreResponse } from '../types';
import { TRANSLATIONS } from '../constants';
import { getSoilHealthScore } from '../services/geminiService';
import { RefreshIcon, SproutIcon } from './Icons';

interface SoilHealthScorePanelProps {
  farmData: FarmData;
  language: Language;
}

const ScoreGauge: React.FC<{ score: number; rating: string }> = ({ score, rating }) => {
    const size = 120;
    const strokeWidth = 12;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;

    const ratingColorHex = {
        'Poor': '#ef4444', // red-500
        'Fair': '#f97316', // orange-500
        'Good': '#eab308', // yellow-500
        'Excellent': '#22c55e', // green-500
    };

    const colorKey = rating === 'Pobre' ? 'Poor'
        : rating === 'Regular' ? 'Fair'
        : rating === 'Mäßig' ? 'Fair'
        : rating === 'Bueno' ? 'Good'
        : rating === 'Gut' ? 'Good'
        : rating === 'Excelente' ? 'Excellent'
        : rating === 'Ausgezeichnet' ? 'Excellent'
        : rating === '悪い' ? 'Poor'
        : rating === '普通' ? 'Fair'
        : rating === '良い' ? 'Good'
        : rating === '非常に良い' ? 'Excellent'
        : rating;


    const color = ratingColorHex[colorKey as keyof typeof ratingColorHex] || '#22c55e';

    return (
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                <circle
                    className="text-gray-200 dark:text-slate-600"
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                />
                <circle
                    stroke={color}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    fill="transparent"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                    style={{
                        strokeDasharray: circumference,
                        strokeDashoffset: offset,
                        transform: 'rotate(-90deg)',
                        transformOrigin: '50% 50%',
                        transition: 'stroke-dashoffset 0.5s ease-in-out'
                    }}
                />
            </svg>
            <div className="absolute flex flex-col items-center">
                <span className="text-3xl font-bold" style={{ color: color }}>{score}</span>
                <span className="text-xs font-semibold text-muted-light dark:text-muted-dark">{rating}</span>
            </div>
        </div>
    );
};


const SoilHealthScorePanel: React.FC<SoilHealthScorePanelProps> = ({ farmData, language }) => {
    const t = TRANSLATIONS[language];
    const [scoreData, setScoreData] = useState<SoilHealthScoreResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isAutoScoreEnabled, setIsAutoScoreEnabled] = useState(false);

    const fetchScore = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await getSoilHealthScore(farmData.conditions, farmData.keyMetrics.soilMoisture.value, language);
            setScoreData(result);
        } catch (err) {
            setError(t.errorScore);
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [farmData, language, t]);

    const savedFetchFn = useRef(fetchScore);
    useEffect(() => {
        savedFetchFn.current = fetchScore;
    }, [fetchScore]);

    useEffect(() => {
        if (isAutoScoreEnabled) {
            const tick = () => savedFetchFn.current();
            tick();
            const intervalId = window.setInterval(tick, 65000);
            return () => window.clearInterval(intervalId);
        }
    }, [isAutoScoreEnabled]);

    const RefreshButton = (
      <button
          onClick={fetchScore}
          disabled={isLoading || isAutoScoreEnabled}
          className="p-2 rounded-full bg-primary/20 text-primary hover:bg-primary/30 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label={t.getScore}
      >
          <RefreshIcon />
      </button>
    );

    return (
        <Panel title={t.soilHealthScore} actions={RefreshButton}>
            <div className="h-full flex flex-col items-center justify-between text-center">
                <div className="flex-grow flex items-center justify-center">
                    {isLoading && (
                        <>
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            <p className="ml-3">{t.generatingScore}</p>
                        </>
                    )}
                    {error && <div className="text-red-400 p-4 bg-red-500/10 rounded-lg">{error}</div>}
                    {!isLoading && !error && scoreData && (
                        <ScoreGauge score={scoreData.score} rating={t[scoreData.rating.toLowerCase() as keyof typeof t] || scoreData.rating} />
                    )}
                    {!isLoading && !error && !scoreData && (
                        <>
                            <div className="flex flex-col items-center">
                                <SproutIcon className="w-12 h-12 text-muted-light dark:text-muted-dark mb-4"/>
                                <p className="text-muted-light dark:text-muted-dark">{t.clickToGetScore}</p>
                            </div>
                        </>
                    )}
                </div>
                 <div className="mt-4 flex items-center justify-end flex-shrink-0 w-full">
                    <label htmlFor="auto-score-toggle" className="flex items-center cursor-pointer">
                        <span className="mr-3 text-sm font-medium text-text-light dark:text-text-dark">{t.automatedScore}</span>
                        <div className="relative">
                            <input
                                type="checkbox"
                                id="auto-score-toggle"
                                className="sr-only peer"
                                checked={isAutoScoreEnabled}
                                onChange={() => setIsAutoScoreEnabled(prev => !prev)}
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

export default SoilHealthScorePanel;