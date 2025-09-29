

import React from 'react';
import Panel from './Panel';
import type { FarmConditions, CurrentWeather, Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { BeakerIcon, ThermometerIcon, DropletIcon, WindIcon, WarningIcon } from './Icons';

interface FarmConditionsPanelProps {
  conditions: FarmConditions;
  currentWeather: CurrentWeather;
  language: Language;
}

const LOW_NITROGEN_THRESHOLD = 100;
const LOW_PHOSPHORUS_THRESHOLD = 40;
const LOW_POTASSIUM_THRESHOLD = 70;

const InfoCard: React.FC<{ icon: React.ReactNode; label: string; value: string | React.ReactNode;}> = ({ icon, label, value }) => (
    <div className="flex items-center gap-3 bg-background-light dark:bg-background-dark p-3 rounded-lg">
        <div className="text-primary">{icon}</div>
        <div>
            <div className="text-xs text-muted-light dark:text-muted-dark">{label}</div>
            <div className="font-bold text-sm">{value}</div>
        </div>
    </div>
);


const FarmConditionsPanel: React.FC<FarmConditionsPanelProps> = ({ conditions, currentWeather, language }) => {
  const t = TRANSLATIONS[language];
  const { ph, nutrients, soilType, climate } = conditions;
  const { temperature, humidity, windSpeed } = currentWeather;

  const nutrientValue = (
    <span>
        <span className={nutrients.nitrogen < LOW_NITROGEN_THRESHOLD ? 'font-bold text-red-500' : ''}>{nutrients.nitrogen.toFixed(0)}</span>-
        <span className={nutrients.phosphorus < LOW_PHOSPHORUS_THRESHOLD ? 'font-bold text-red-500' : ''}>{nutrients.phosphorus.toFixed(0)}</span>-
        <span className={nutrients.potassium < LOW_POTASSIUM_THRESHOLD ? 'font-bold text-red-500' : ''}>{nutrients.potassium.toFixed(0)}</span>
    </span>
  );

  return (
    <Panel title={t.farmConditions}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <InfoCard 
                icon={<BeakerIcon className="w-6 h-6" />}
                label={t.phLevel}
                value={ph.toFixed(1)}
            />
            <InfoCard 
                icon={<BeakerIcon className="w-6 h-6" />}
                label={t.nutrients}
                value={nutrientValue}
            />
            <InfoCard 
                icon={<div className="w-6 h-6 flex items-center justify-center font-bold text-lg">S</div>}
                label={t.soilType}
                value={soilType}
            />
            <InfoCard 
                icon={<div className="w-6 h-6 flex items-center justify-center font-bold text-lg">C</div>}
                label={t.climate}
                value={climate}
            />
        </div>

        <div className="mt-4 pt-4 border-t border-white/10">
             <h3 className="text-md font-semibold mb-2">{t.currentWeather}</h3>
             <div className="grid grid-cols-3 gap-3">
                <InfoCard 
                    icon={<ThermometerIcon className="w-6 h-6" />}
                    label={t.temperature}
                    value={`${temperature.toFixed(1)}°C`}
                />
                <InfoCard 
                    icon={<DropletIcon className="w-6 h-6" />}
                    label={t.humidity}
                    value={`${humidity.toFixed(0)}%`}
                />
                <InfoCard 
                    icon={<WindIcon className="w-6 h-6" />}
                    label={t.windSpeed}
                    value={`${windSpeed.toFixed(0)} km/h`}
                />
             </div>
        </div>
    </Panel>
  );
};

export default FarmConditionsPanel;