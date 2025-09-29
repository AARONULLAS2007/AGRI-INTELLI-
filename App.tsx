import React, { useState } from 'react';
import type { Language } from './types';
import Header from './components/Header';
import KeyMetricsPanel from './components/KeyMetricsPanel';
import VegetationIndicesChart from './components/VegetationIndicesChart';
import AlertsPanel from './components/AlertsPanel';
import WeatherPanel from './components/WeatherPanel';
import DailyReportPanel from './components/DailyReportPanel';
import RecommendationsPanel from './components/RecommendationsPanel';
import useFarmData from './hooks/useFarmData';
import FarmConditionsPanel from './components/FarmConditionsPanel';
import LivePestMonitorPanel from './components/LivePestMonitorPanel';
import PlantHealthAnalystPanel from './components/PlantHealthAnalystPanel';
import SoilHealthScorePanel from './components/SoilHealthScorePanel';

const App: React.FC = () => {
  const [language, setLanguage] = useState<Language>('en');
  const farmData = useFarmData();

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <Header language={language} setLanguage={setLanguage} />
      <main className="p-4 lg:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {/* Main Column */}
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            <div className="lg:col-span-3">
              <KeyMetricsPanel metrics={farmData.keyMetrics} language={language} />
            </div>
            <div className="lg:col-span-3">
              <FarmConditionsPanel conditions={farmData.conditions} currentWeather={farmData.currentWeather} language={language} />
            </div>
            <div className="lg:col-span-2 md:col-span-2">
               <VegetationIndicesChart data={farmData.chartData} language={language} />
            </div>
            <div className="lg:col-span-1 md:col-span-2">
              <AlertsPanel sectors={farmData.sectors} language={language} />
            </div>
             <div className="lg:col-span-3">
               <WeatherPanel language={language} />
            </div>
            <div className="lg:col-span-1 md:col-span-2">
              <RecommendationsPanel farmData={farmData} language={language} />
            </div>
            <div className="lg:col-span-2 md:col-span-2">
              <DailyReportPanel language={language} />
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4 lg:gap-6">
             <SoilHealthScorePanel farmData={farmData} language={language} />
             <PlantHealthAnalystPanel farmData={farmData} language={language} />
             <LivePestMonitorPanel language={language} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;