import { useState, useEffect, useCallback } from 'react';
import type { MarketPrice } from '../types';

const MOCK_CROPS: Omit<MarketPrice, 'price' | 'change'>[] = [
    { id: 'wheat', name: 'wheat', unit: 'perQuintal' },
    { id: 'tomato', name: 'tomato', unit: 'perQuintal' },
    { id: 'cotton', name: 'cotton', unit: 'perQuintal' },
    { id: 'sugarcane', name: 'sugarcane', unit: 'perQuintal' },
];

const generateMarketData = (): MarketPrice[] => {
    return MOCK_CROPS.map(crop => ({
        ...crop,
        price: Math.floor(Math.random() * 2000) + 1500, // Price between 1500-3500
        change: (Math.random() - 0.45) * 50, // Change between ~ -22 to +27
    }));
};

const useMarketData = () => {
    const [marketData, setMarketData] = useState<MarketPrice[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchMarketData = useCallback(() => {
        setIsLoading(true);
        setTimeout(() => { // Simulate network delay
            setMarketData(prevData => {
                // Check if it's the first fetch
                if (prevData.length === 0) {
                    return generateMarketData();
                }
                // Update existing data
                return prevData.map(crop => {
                    const priceChange = (Math.random() - 0.45) * 50;
                    const newPrice = Math.max(500, crop.price + priceChange);
                    return {
                        ...crop,
                        price: Math.round(newPrice),
                        change: priceChange,
                    }
                });
            });
            setIsLoading(false);
        }, 800);
    }, []);

    useEffect(() => {
        // Initial fetch
        fetchMarketData();
    }, [fetchMarketData]);

    return { marketData, isLoading, refetch: fetchMarketData };
};

export default useMarketData;
