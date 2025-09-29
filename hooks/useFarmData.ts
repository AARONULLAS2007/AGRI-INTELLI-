

import { useState, useEffect } from 'react';
import type { FarmData, ChartDataPoint, KeyMetrics, FarmSectorData, FarmConditions, CurrentWeather, Nutrients } from '../types';
import { WeatherCondition } from '../types';

const generateInitialChartData = (): ChartDataPoint[] => {
  return Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return {
      day: `${date.getMonth() + 1}/${date.getDate()}`,
      NDVI: Math.random() * 0.2 + 0.6,
      NDWI: Math.random() * 0.2 + 0.3,
      SAVI: Math.random() * 0.2 + 0.4,
    };
  });
};

const generateInitialMetrics = (): KeyMetrics => ({
  soilMoisture: { value: 45, unit: '%', change: 1.2 },
  ndvi: { value: 0.75, unit: '', change: -0.5 },
  canopyCover: { value: 85, unit: '%', change: 2.1 },
  cropGrowthStage: { value: 'Vegetative', change: 2 },
  plantHeight: { value: 30, unit: 'cm', change: 0.5 },
  leafCount: { value: 12, unit: '', change: 1 },
  soilTemperature: { value: 22, unit: '°C', change: -0.2 },
});

const generateInitialSectors = (): FarmSectorData[] => ([
    { id: 1, pestRisk: 25, soilMoisture: 45, pestType: 'Aphids' },
    { id: 2, pestRisk: 80, soilMoisture: 50, pestType: 'Spider Mites' },
    { id: 3, pestRisk: 15, soilMoisture: 25, pestType: 'Thrips' },
    { id: 4, pestRisk: 40, soilMoisture: 60, pestType: 'Whiteflies' },
]);

const generateInitialConditions = (): FarmConditions => ({
    ph: 6.8,
    nutrients: { nitrogen: 120, phosphorus: 50, potassium: 80 },
    soilType: 'Loamy',
    climate: 'Temperate',
});

const generateInitialCurrentWeather = (): CurrentWeather => ({
    temperature: 27.5,
    humidity: 65,
    windSpeed: 10,
    condition: WeatherCondition.Sunny,
});


const useFarmData = () => {
  const [farmData, setFarmData] = useState<FarmData>({
    keyMetrics: generateInitialMetrics(),
    chartData: generateInitialChartData(),
    sectors: generateInitialSectors(),
    conditions: generateInitialConditions(),
    currentWeather: generateInitialCurrentWeather(),
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setFarmData(prevData => {
        // Chart Data update
        const newChartData = [...prevData.chartData];
        const lastDataPoint = newChartData[newChartData.length - 1];
        const newPoint: ChartDataPoint = {
            day: 'Now',
            NDVI: Math.max(0.1, Math.min(0.9, lastDataPoint.NDVI + (Math.random() - 0.5) * 0.05)),
            NDWI: Math.max(0.1, Math.min(0.9, lastDataPoint.NDWI + (Math.random() - 0.5) * 0.05)),
            SAVI: Math.max(0.1, Math.min(0.9, lastDataPoint.SAVI + (Math.random() - 0.5) * 0.05)),
        };
        newChartData.push(newPoint);
        if(newChartData.length > 30) newChartData.shift();

        // Key Metrics update
        const newMetrics: KeyMetrics = {
            ...prevData.keyMetrics,
            soilMoisture: { ...prevData.keyMetrics.soilMoisture, value: prevData.keyMetrics.soilMoisture.value + (Math.random() - 0.5) * 2, change: (Math.random() - 0.5) * 2 },
            ndvi: { ...prevData.keyMetrics.ndvi, value: newPoint.NDVI, change: (newPoint.NDVI - lastDataPoint.NDVI) * 100 },
            plantHeight: { ...prevData.keyMetrics.plantHeight, value: Math.max(0, prevData.keyMetrics.plantHeight.value + Math.random() * 0.2), change: Math.random() * 0.2 },
            leafCount: { ...prevData.keyMetrics.leafCount, value: prevData.keyMetrics.leafCount.value + (Math.random() > 0.9 ? 1 : 0), change: (Math.random() > 0.9 ? 1 : 0) },
            soilTemperature: { ...prevData.keyMetrics.soilTemperature, value: prevData.keyMetrics.soilTemperature.value + (Math.random() - 0.5) * 0.1, change: (Math.random() - 0.5) * 0.1 },

        };

        // Sectors update
        const newSectors = prevData.sectors.map(sector => ({
          ...sector,
          pestRisk: Math.max(0, Math.min(100, sector.pestRisk + (Math.random() - 0.4) * 10)),
          soilMoisture: Math.max(0, Math.min(100, sector.soilMoisture + (Math.random() - 0.5) * 5)),
        }));
        
        const newWeather: CurrentWeather = {
            ...prevData.currentWeather,
            temperature: prevData.currentWeather.temperature + (Math.random() - 0.5) * 0.2,
            humidity: Math.max(20, Math.min(90, prevData.currentWeather.humidity + (Math.random() - 0.5) * 2)),
        };

        // Conditions update (nutrients)
        const newNutrients: Nutrients = {
            nitrogen: Math.max(40, prevData.conditions.nutrients.nitrogen - 0.2), // prevent from going too low too fast
            phosphorus: Math.max(20, prevData.conditions.nutrients.phosphorus - 0.1),
            potassium: Math.max(30, prevData.conditions.nutrients.potassium - 0.15),
        };

        const newConditions: FarmConditions = {
            ...prevData.conditions,
            nutrients: newNutrients,
        };

        return {
            ...prevData,
            keyMetrics: newMetrics,
            chartData: newChartData,
            sectors: newSectors,
            currentWeather: newWeather,
            conditions: newConditions,
        };
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return farmData;
};

export default useFarmData;