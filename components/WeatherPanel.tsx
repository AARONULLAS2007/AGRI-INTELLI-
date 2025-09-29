
import React from 'react';
import Panel from './Panel';
import type { Language } from '../types';
import { TRANSLATIONS, MOCK_WEATHER_FORECAST } from '../constants';
import { WeatherCondition } from '../types';
import { SunIcon, CloudIcon, RainIcon } from './Icons';

interface WeatherPanelProps {
  language: Language;
}

const WeatherIcon = ({ condition }: { condition: WeatherCondition }) => {
  switch (condition) {
    case WeatherCondition.Sunny:
      return <SunIcon />;
    case WeatherCondition.Cloudy:
      return <CloudIcon />;
    case WeatherCondition.Rainy:
      return <RainIcon />;
    default:
      return <CloudIcon />;
  }
};

const WeatherPanel: React.FC<WeatherPanelProps> = ({ language }) => {
  const t = TRANSLATIONS[language];
  const forecast = MOCK_WEATHER_FORECAST(language);

  return (
    <Panel title={t.weatherForecast}>
      <div className="flex justify-between items-center h-full">
        {forecast.map(day => (
          <div key={day.day} className="flex flex-col items-center gap-2">
            <span className="font-semibold text-muted-light dark:text-muted-dark">{day.day}</span>
            <WeatherIcon condition={day.condition} />
            <span className="font-bold text-lg">{day.temp}°C</span>
          </div>
        ))}
      </div>
    </Panel>
  );
};

export default WeatherPanel;
