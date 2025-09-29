
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Panel from './Panel';
import type { ChartDataPoint, Language } from '../types';
import { TRANSLATIONS } from '../constants';

interface VegetationIndicesChartProps {
  data: ChartDataPoint[];
  language: Language;
}

const VegetationIndicesChart: React.FC<VegetationIndicesChartProps> = ({ data, language }) => {
  const t = TRANSLATIONS[language];

  return (
    <Panel title={t.vegetationIndices}>
      <div className="w-full h-64 md:h-full">
        <ResponsiveContainer>
          <LineChart
            data={data}
            margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
            <XAxis dataKey="day" tick={{ fill: '#94a3b8' }} fontSize={12} />
            <YAxis tick={{ fill: '#94a3b8' }} fontSize={12} domain={[0, 1]} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#334155',
                borderColor: '#475569',
                borderRadius: '0.5rem',
              }}
              labelStyle={{ color: '#f1f5f9' }}
            />
            <Legend />
            <Line type="monotone" dataKey="NDVI" stroke="#22c55e" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="NDWI" stroke="#3b82f6" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="SAVI" stroke="#f97316" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Panel>
  );
};

export default VegetationIndicesChart;
