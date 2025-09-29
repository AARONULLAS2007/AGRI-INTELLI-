import React from 'react';
import { LineChart, Line, Tooltip, ResponsiveContainer } from 'recharts';
import Panel from './Panel';
import type { Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { RefreshIcon, TrendingUpIcon } from './Icons';
import usePredictiveAnalytics from '../hooks/usePredictiveAnalytics';


interface YieldPredictionPanelProps {
  analytics: ReturnType<typeof usePredictiveAnalytics>;
  language: Language;
}

const YieldPredictionPanel: React.FC<YieldPredictionPanelProps> = ({ analytics, language }) => {
  const t = TRANSLATIONS[language];
  const { predictions, isLoading, error, refetch } = analytics;

  const RefreshButton = (
      <button
          onClick={refetch}
          disabled={isLoading}
          className="p-2 rounded-full bg-primary/20 text-primary hover:bg-primary/30 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label={t.refresh}
      >
          <RefreshIcon />
      </button>
  );

  const renderContent = () => {
    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full min-h-[200px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }
    if (error || !predictions) {
        return <div className="text-red-400 text-center">{error || 'No data available.'}</div>;
    }

    const { yieldPrediction, historicalYield } = predictions;

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-start gap-3">
                <TrendingUpIcon className="w-8 h-8 text-primary mt-1 flex-shrink-0"/>
                <div>
                    <p className="text-2xl font-bold">{yieldPrediction.value.toFixed(2)}</p>
                    <p className="text-sm text-muted-light dark:text-muted-dark -mt-1">{t[yieldPrediction.unit]}</p>
                </div>
            </div>

            <div className="flex-grow w-full h-24 -ml-4 mt-2">
                 <ResponsiveContainer>
                    <LineChart data={historicalYield} margin={{ top: 5, right: 5, left: 5, bottom: 0 }}>
                        <Tooltip
                            contentStyle={{ backgroundColor: '#334155', borderColor: '#475569', borderRadius: '0.5rem' }}
                            labelStyle={{ color: '#f1f5f9' }}
                            formatter={(value: number) => [value.toFixed(2), t.estimatedYield]}
                        />
                        <Line type="monotone" dataKey="value" stroke="#22c55e" strokeWidth={2} dot={false} />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            <div className="mt-auto pt-2">
                 <h4 className="text-xs font-semibold text-muted-light dark:text-muted-dark">{t.predictionFactors}</h4>
                 <ul className="list-disc list-inside text-xs space-y-1 mt-1">
                    {yieldPrediction.factors.map(factor => <li key={factor}>{t[factor]}</li>)}
                 </ul>
            </div>
        </div>
    );
  };
  
  return (
    <Panel title={t.yieldPrediction} actions={RefreshButton}>
      {renderContent()}
    </Panel>
  );
};

export default YieldPredictionPanel;