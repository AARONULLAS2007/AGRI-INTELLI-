

import React, { useMemo } from 'react';
import Panel from './Panel';
import type { FarmSectorData, Alert, Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { WarningIcon } from './Icons';

interface AlertsPanelProps {
  sectors: FarmSectorData[];
  language: Language;
}

const AlertsPanel: React.FC<AlertsPanelProps> = ({ sectors, language }) => {
  const t = TRANSLATIONS[language];
  
  const alerts: Alert[] = useMemo(() => {
      const newAlerts: Alert[] = [];
      sectors.forEach(sector => {
          if (sector.pestRisk > 75) {
              newAlerts.push({
                  id: `pest-${sector.id}`,
                  type: 'critical',
                  message: t.pestRiskMessage.replace('{pestType}', sector.pestType),
                  sector: sector.id,
                  action: t.pestRiskAction.replace('{sector}', sector.id.toString()),
              });
          }
          if (sector.soilMoisture < 30) {
              newAlerts.push({
                  id: `moisture-${sector.id}`,
                  type: 'warning',
                  message: t.lowSoilMoisture,
                  sector: sector.id,
                  action: t.lowSoilMoistureAction.replace('{sector}', sector.id.toString()),
              })
          }
      });
      return newAlerts;
  }, [sectors, t]);

  return (
    <Panel title={t.activeAlerts}>
      <div className="space-y-3 h-full overflow-y-auto">
        {alerts.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-light dark:text-muted-dark">
            <p>{t.noActiveAlerts}</p>
          </div>
        ) : (
          alerts.map(alert => (
            <div key={alert.id} className={`p-3 rounded-lg ${
                alert.type === 'critical' 
                ? 'bg-red-500/20 text-red-400' 
                : 'bg-yellow-500/20 text-yellow-400'
              }`}
            >
              <div className="flex items-start">
                <WarningIcon className="flex-shrink-0 h-5 w-5 mr-3 mt-0.5" />
                <div>
                  <p className="font-bold">{alert.message}
                    <span className="font-normal"> (Sector {alert.sector})</span>
                  </p>
                  <p className="text-sm mt-1">{alert.action}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </Panel>
  );
};

export default AlertsPanel;