import React from 'react';
import Panel from './Panel';
import type { Language } from '../types';
import { TRANSLATIONS } from '../constants';
import useMarketData from '../hooks/useMarketData';
import { RefreshIcon, ArrowUpIcon, ArrowDownIcon } from './Icons';

interface MarketPricePanelProps {
  language: Language;
}

const MarketPricePanel: React.FC<MarketPricePanelProps> = ({ language }) => {
    const t = TRANSLATIONS[language];
    const { marketData, isLoading, refetch } = useMarketData();

    const RefreshButton = (
        <button
            onClick={refetch}
            disabled={isLoading}
            className="p-2 rounded-full bg-primary/20 text-primary hover:bg-primary/30 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label={t.refresh}
        >
            <RefreshIcon />
        </button>
    );

    return (
        <Panel title={t.liveMarketPrices} actions={RefreshButton}>
            <div className="h-full flex flex-col">
                {isLoading ? (
                     <div className="flex items-center justify-center h-full min-h-[200px]">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                ) : (
                    <div className="space-y-3 overflow-y-auto pr-2">
                        {marketData.map(item => (
                            <div key={item.id} className="flex justify-between items-center bg-background-light dark:bg-background-dark p-3 rounded-lg">
                                <div>
                                    <p className="font-bold capitalize">{t[item.name] || item.name}</p>
                                    <p className="text-xs text-muted-light dark:text-muted-dark">{t.perQuintal}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-lg">₹{item.price.toLocaleString('en-IN')}</p>
                                    <div className={`flex items-center justify-end text-xs ${item.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                        {item.change >= 0 ? <ArrowUpIcon /> : <ArrowDownIcon />}
                                        <span className="ml-1">₹{Math.abs(item.change).toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Panel>
    );
};

export default MarketPricePanel;
