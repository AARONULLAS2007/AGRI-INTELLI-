import React from 'react';
import Panel from './Panel';
import type { FarmConditions, Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { WarningIcon } from './Icons';

interface SuggestionsPanelProps {
  conditions: FarmConditions;
  language: Language;
}

const LOW_NITROGEN_THRESHOLD = 100;
const LOW_PHOSPHORUS_THRESHOLD = 40;
const LOW_POTASSIUM_THRESHOLD = 70;

const SuggestionsPanel: React.FC<SuggestionsPanelProps> = ({ conditions, language }) => {
  const t = TRANSLATIONS[language];
  const { nutrients } = conditions;

  const lowNutrients: string[] = [];
  if (nutrients.nitrogen < LOW_NITROGEN_THRESHOLD) lowNutrients.push('Nitrogen');
  if (nutrients.phosphorus < LOW_PHOSPHORUS_THRESHOLD) lowNutrients.push('Phosphorus');
  if (nutrients.potassium < LOW_POTASSIUM_THRESHOLD) lowNutrients.push('Potassium');

  if (lowNutrients.length === 0) {
    return null;
  }

  return (
    <div className="lg:col-span-3">
      <Panel title={t.suggestions}>
        <div className="flex items-start gap-3 p-3 rounded-lg bg-red-500/20 text-red-400">
            <WarningIcon className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-500" />
            <div>
                <p className="font-bold">{t.lowNutrientWarningTitle}</p>
                <p className="text-sm">{t.lowNutrientWarningMessage.replace('{nutrients}', lowNutrients.map(n => t[n as keyof typeof t]).join(', '))}</p>
            </div>
        </div>
      </Panel>
    </div>
  );
};

export default SuggestionsPanel;
