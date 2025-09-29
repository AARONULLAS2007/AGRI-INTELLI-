import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Panel from './Panel';
import type { Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { RefreshIcon } from './Icons';
import usePredictiveAnalytics from '../hooks/usePredictiveAnalytics';

interface PestRiskForecastPanelProps {
  analytics: ReturnType<typeof usePredictiveAnalytics>;
  language: Language;
}

const PestRiskForecastPanel: React.FC<PestRiskForecastPanelProps> = ({ analytics, language }) => {
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

    return (
        <div className="w-full h-64">
            <ResponsiveContainer>
                <LineChart data={predictions.pestRiskForecast} margin={{ top: 5, right: 20, left: -15, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                    <XAxis dataKey="day" tick={{ fill: '#94a3b8' }} fontSize={12} />
                    <YAxis tick={{ fill: '#94a3b8' }} fontSize={12} domain={[0, 100]} unit="%"/>
                    <Tooltip
                        contentStyle={{ backgroundColor: '#334155', borderColor: '#475569', borderRadius: '0.5rem' }}
                        labelStyle={{ color: '#f1f5f9' }}
                        formatter={(value: number) => [`${value.toFixed(0)}%`, t.riskLevel]}
                    />
                    <Line type="monotone" dataKey="risk" name={t.riskLevel} stroke="#ef4444" strokeWidth={2} dot={{r: 4}} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
  };
  
  return (
    <Panel title={t.pestRiskForecast} actions={RefreshButton}>
      {renderContent()}
    </Panel>
  );
};

export default PestRiskForecastPanel;