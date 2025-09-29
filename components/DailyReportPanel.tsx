
import React from 'react';
import Panel from './Panel';
import type { Language } from '../types';
import { TRANSLATIONS, MOCK_ACTIVITY_LOGS } from '../constants';

interface DailyReportPanelProps {
  language: Language;
}

const DailyReportPanel: React.FC<DailyReportPanelProps> = ({ language }) => {
  const t = TRANSLATIONS[language];

  return (
    <Panel title={t.dailyActivityReport}>
      <div className="space-y-4 h-full overflow-y-auto pr-2">
        {MOCK_ACTIVITY_LOGS.map(log => (
          <div key={log.id} className="flex gap-4 text-sm">
            <div className="w-20 text-muted-light dark:text-muted-dark">{log.time}</div>
            <div className="flex-1">
              <p className="font-semibold">{log.type} - <span className="font-normal">{log.location}</span></p>
              <p className="text-muted-light dark:text-muted-dark text-xs">{log.details}</p>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
};

export default DailyReportPanel;
