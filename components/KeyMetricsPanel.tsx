import React from 'react';
import Panel from './Panel';
import type { KeyMetrics, Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { ArrowUpIcon, ArrowDownIcon, RulerIcon, LeafCountIcon, ThermometerIcon } from './Icons';

interface KeyMetricsPanelProps {
  metrics: KeyMetrics;
  language: Language;
}

interface MetricCardProps {
    title: string;
    value: string;
    change: number;
    changeText: string;
    icon?: React.ReactNode;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, change, changeText, icon }) => {
    const isPositive = change >= 0;
    const changeColor = isPositive ? 'text-green-500' : 'text-red-500';

    return (
        <div className="bg-background-light dark:bg-background-dark p-3 rounded-lg flex-1 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <h4 className="text-sm text-muted-light dark:text-muted-dark">{title}</h4>
              {icon && <div className="text-muted-light dark:text-muted-dark opacity-70">{icon}</div>}
            </div>
            <div>
              <p className="text-2xl font-bold mt-1">{value}</p>
              <div className={`flex items-center text-xs ${changeColor}`}>
                  {isPositive ? <ArrowUpIcon /> : <ArrowDownIcon />}
                  <span className="ml-1">{Math.abs(change).toFixed(1)}{changeText}</span>
              </div>
            </div>
        </div>
    );
}

const KeyMetricsPanel: React.FC<KeyMetricsPanelProps> = ({ metrics, language }) => {
  const t = TRANSLATIONS[language];
  const { soilMoisture, ndvi, canopyCover, cropGrowthStage, plantHeight, leafCount, soilTemperature } = metrics;
  
  const getGrowthStageChangeText = (change: number) => {
    if (change > 0) return ` ${t.daysAhead}`;
    if (change < 0) return ` ${t.daysBehind}`;
    return ` ${t.onSchedule}`;
  };

  return (
    <Panel title={t.keyMetrics}>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 h-full">
        <MetricCard 
            title={t.avgSoilMoisture}
            value={`${soilMoisture.value.toFixed(1)}${soilMoisture.unit}`}
            change={soilMoisture.change}
            changeText="%"
        />
        <MetricCard 
            title={t.avgNDVI}
            value={ndvi.value.toFixed(2)}
            change={ndvi.change}
            changeText="%"
        />
        <MetricCard 
            title={t.canopyCover}
            value={`${canopyCover.value.toFixed(0)}${canopyCover.unit}`}
            change={canopyCover.change}
            changeText="%"
        />
        <MetricCard 
            title={t.cropGrowthStage}
            value={cropGrowthStage.value}
            change={cropGrowthStage.change}
            changeText={getGrowthStageChangeText(cropGrowthStage.change)}
        />
        <MetricCard 
            icon={<RulerIcon className="w-5 h-5" />}
            title={t.plantHeight}
            value={`${plantHeight.value.toFixed(1)}${plantHeight.unit}`}
            change={plantHeight.change}
            changeText={plantHeight.unit}
        />
        <MetricCard 
            icon={<LeafCountIcon className="w-5 h-5" />}
            title={t.leafCount}
            value={`${leafCount.value.toFixed(0)}`}
            change={leafCount.change}
            changeText=""
        />
        <MetricCard 
            icon={<ThermometerIcon className="w-5 h-5" />}
            title={t.soilTemperature}
            value={`${soilTemperature.value.toFixed(1)}${soilTemperature.unit}`}
            change={soilTemperature.change}
            changeText={soilTemperature.unit}
        />
      </div>
    </Panel>
  );
};

export default KeyMetricsPanel;