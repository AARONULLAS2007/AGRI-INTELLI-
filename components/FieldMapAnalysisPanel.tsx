
import React, { useState } from 'react';
import Panel from './Panel';
import type { Language } from '../types';
import { MapOverlay } from '../types';
import { TRANSLATIONS } from '../constants';

interface FieldMapAnalysisPanelProps {
  language: Language;
}

const OVERLAY_COLORS: Record<MapOverlay, string> = {
    [MapOverlay.None]: '',
    [MapOverlay.NDVI]: 'from-red-500/50 via-yellow-500/50 to-green-500/50',
    [MapOverlay.NDWI]: 'from-yellow-500/50 via-cyan-500/50 to-blue-500/50',
    [MapOverlay.SoilMoisture]: 'from-orange-700/50 via-blue-500/50 to-blue-900/50',
    [MapOverlay.SoilAnalysis]: 'from-stone-500/50 via-lime-500/50 to-emerald-500/50',
    [MapOverlay.PestRisk]: 'from-green-500/50 via-yellow-500/50 to-red-600/50',
}

const FieldMapAnalysisPanel: React.FC<FieldMapAnalysisPanelProps> = ({ language }) => {
  const t = TRANSLATIONS[language];
  const [activeOverlay, setActiveOverlay] = useState<MapOverlay>(MapOverlay.NDVI);

  return (
    <Panel title={t.fieldMapAnalysis} className="row-span-2">
      <div className="flex flex-col h-full">
        <div className="mb-4">
          <label htmlFor="map-layer" className="text-sm font-medium mr-2">{t.mapLayer}:</label>
          <select 
            id="map-layer"
            value={activeOverlay}
            onChange={(e) => setActiveOverlay(e.target.value as MapOverlay)}
            className="bg-background-light dark:bg-background-dark p-2 rounded-lg border border-gray-300 dark:border-slate-600"
          >
            <option value={MapOverlay.NDVI}>NDVI</option>
            <option value={MapOverlay.NDWI}>NDWI</option>
            <option value={MapOverlay.SoilMoisture}>{t.soilMoisture}</option>
            <option value={MapOverlay.SoilAnalysis}>{t.soilAnalysis}</option>
            <option value={MapOverlay.PestRisk}>{t.pestRisk}</option>
          </select>
        </div>
        <div className="relative flex-grow rounded-lg overflow-hidden">
          <img 
            src="https://picsum.photos/seed/farm/800/600" 
            alt="Farm Field" 
            className="w-full h-full object-cover"
          />
          <div className={`absolute inset-0 bg-gradient-to-br ${OVERLAY_COLORS[activeOverlay]}`}></div>
          <div className="absolute bottom-2 right-2 bg-card-light/80 dark:bg-card-dark/80 p-2 rounded-md text-xs">
            <div className="flex items-center gap-2">
              <span>{t.legendLow}</span>
              <div className={`w-16 h-2 rounded-full bg-gradient-to-r ${OVERLAY_COLORS[activeOverlay]}`}></div>
              <span>{t.legendHigh}</span>
            </div>
          </div>
        </div>
      </div>
    </Panel>
  );
};

export default FieldMapAnalysisPanel;
