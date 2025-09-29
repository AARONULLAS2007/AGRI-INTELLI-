import React from 'react';
import Panel from './Panel';
import type { Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { WeatherCondition } from '../types';
import { SunIcon, CloudIcon, RainIcon, RefreshIcon } from './Icons';
import usePredictiveAnalytics from '../hooks/usePredictiveAnalytics';

interface AIWeatherForecastPanelProps {
  analytics: ReturnType<typeof usePredictiveAnalytics>;
  language: Language;
}

const WeatherIcon: React.FC<{ condition: WeatherCondition, className?: string }> = ({ condition, className="h-8 w-8" }) => {
  switch (condition) {
    case WeatherCondition.Sunny: return <SunIcon className={`${className} text-yellow-400`}/>;
    case WeatherCondition.Cloudy: return <CloudIcon className={`${className} text-gray-400`}/>;
    case WeatherCondition.Rainy: return <RainIcon className={`${className} text-blue-400`}/>;
    default: return <CloudIcon className={`${className} text-gray-400`}/>;
  }
};

const AIWeatherForecastPanel: React.FC<AIWeatherForecastPanelProps> = ({ analytics, language }) => {
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
            <div className="flex items-center justify-center h-full min-h-[80px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }
    if (error || !predictions) {
        return <div className="text-red-400 text-center">{error || 'No data available.'}</div>;
    }

    return (
        <div className="flex justify-between items-center h-full gap-2">
            {predictions.weatherForecast.slice(0, 7).map(day => (
                <div key={day.day} className="flex flex-col items-center gap-2 flex-1 text-center">
                    <span className="font-semibold text-sm text-muted-light dark:text-muted-dark">{day.day}</span>
                    <WeatherIcon condition={day.condition} />
                    <span className="font-bold text-lg">{day.temp}°C</span>
                </div>
            ))}
        </div>
    );
  };
  
  return (
    <Panel title={t.aiWeatherForecast} actions={RefreshButton}>
      {renderContent()}
    </Panel>
  );
};

export default AIWeatherForecastPanel;