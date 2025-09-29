import type { FarmData, PredictiveAnalyticsData, WeatherForecast, PestRiskPrediction, Language, HistoricalDataPoint } from '../types';
import { WeatherCondition } from '../types';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const getDayName = (lang: Language, dayOffset: number): string => {
    const date = new Date();
    date.setDate(date.getDate() + dayOffset);
    // Simple day name generation, not fully localized for brevity
    const daysEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const daysEs = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const daysDe = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
    const daysJa = ['日', '月', '火', '水', '木', '金', '土'];
    
    switch(lang) {
        case 'es': return daysEs[date.getDay()];
        case 'de': return daysDe[date.getDay()];
        case 'ja': return daysJa[date.getDay()];
        default: return daysEn[date.getDay()];
    }
};

export const getPredictiveAnalytics = async (farmData: FarmData, lang: Language): Promise<PredictiveAnalyticsData> => {
    await sleep(1500);
    
    // 1. Generate Weather Forecast
    const weatherForecast: WeatherForecast[] = [];
    const baseTemp = 25;
    let lastCondition = farmData.currentWeather.condition;

    for (let i = 0; i < 7; i++) {
        const temp = baseTemp + Math.sin(i) * 3 + (Math.random() - 0.5) * 4;
        let condition = WeatherCondition.Sunny;
        const rand = Math.random();
        if (lastCondition === WeatherCondition.Sunny || lastCondition === WeatherCondition.Cloudy) {
            if (rand < 0.6) condition = WeatherCondition.Sunny;
            else if (rand < 0.9) condition = WeatherCondition.Cloudy;
            else condition = WeatherCondition.Rainy;
        } else { // Rainy or Stormy
             if (rand < 0.4) condition = WeatherCondition.Rainy;
             else if (rand < 0.8) condition = WeatherCondition.Cloudy;
             else condition = WeatherCondition.Sunny;
        }
        lastCondition = condition;
        weatherForecast.push({
            day: getDayName(lang, i),
            condition,
            temp: parseFloat(temp.toFixed(1)),
        });
    }

    // 2. Generate Pest Risk Forecast
    const pestRiskForecast: PestRiskPrediction[] = [];
    const baseRisk = farmData.sectors.reduce((acc, s) => acc + s.pestRisk, 0) / farmData.sectors.length;
    for (let i = 0; i < 7; i++) {
        let risk = baseRisk + Math.sin(i) * 15 + (Math.random() - 0.5) * 20;
        // Increase risk if weather is warm and not rainy
        if (weatherForecast[i].temp > 26 && weatherForecast[i].condition !== WeatherCondition.Rainy) {
            risk += 15;
        }
        pestRiskForecast.push({
            day: getDayName(lang, i),
            risk: Math.max(0, Math.min(100, parseFloat(risk.toFixed(1)))),
        });
    }

    // 3. Generate Yield Prediction
    const { ndvi, soilMoisture } = farmData.keyMetrics;
    let baseYield = 4.5; // tons/acre
    baseYield += (ndvi.value - 0.7) * 5; // NDVI bonus/penalty
    baseYield += -(Math.abs(soilMoisture.value - 55) / 20); // Soil moisture penalty

    const rainyDays = weatherForecast.filter(d => d.condition === WeatherCondition.Rainy).length;
    if (rainyDays > 3) {
        baseYield -= 0.3; // Too much rain is bad
    } else if (rainyDays > 0) {
        baseYield += 0.2; // Some rain is good
    }
    
    const factors = [
        'yieldFactorGoodNDVI',
        'yieldFactorGoodWeather',
        'yieldFactorLowPest',
    ];

    const yieldPrediction = {
        value: parseFloat(baseYield.toFixed(2)),
        unit: 'tonsPerAcre',
        factors: factors,
    };
    
    // 4. Generate Historical Yield Data
    const historicalYield: HistoricalDataPoint[] = [];
    let lastYield = yieldPrediction.value - (Math.random() - 0.5) * 0.5; // Start from something around the current yield
    for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        lastYield += (Math.random() - 0.48) * 0.05; // Gentle upward trend
        historicalYield.push({
            day: `${date.getMonth() + 1}/${date.getDate()}`,
            value: parseFloat(Math.max(3.0, Math.min(6.0, lastYield)).toFixed(2)),
        });
    }

    return { weatherForecast, pestRiskForecast, yieldPrediction, historicalYield };
};