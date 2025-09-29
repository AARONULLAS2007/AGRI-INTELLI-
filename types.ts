
export type Language = 'en' | 'es' | 'de' | 'ja';

export interface ChartDataPoint {
  day: string;
  NDVI: number;
  NDWI: number;
  SAVI: number;
}

export interface KeyMetric {
  value: number;
  unit: string;
  change: number;
}

export interface KeyMetrics {
  soilMoisture: KeyMetric;
  ndvi: KeyMetric;
  canopyCover: KeyMetric;
  cropGrowthStage: {
    value: string;
    change: number; // Represents days ahead/behind schedule
  };
  plantHeight: KeyMetric;
  leafCount: KeyMetric;
  soilTemperature: KeyMetric;
}

export interface FarmSectorData {
  id: number;
  pestRisk: number; // 0-100
  soilMoisture: number; // 0-100
}

export interface Nutrients {
  nitrogen: number; // ppm
  phosphorus: number; // ppm
  potassium: number; // ppm
}

export interface FarmConditions {
  ph: number;
  nutrients: Nutrients;
  soilType: string;
  climate: string;
}

export interface CurrentWeather {
    temperature: number; // Celsius
    humidity: number; // %
    windSpeed: number; // km/h
    condition: WeatherCondition;
}

export interface FarmData {
  keyMetrics: KeyMetrics;
  chartData: ChartDataPoint[];
  sectors: FarmSectorData[];
  conditions: FarmConditions;
  currentWeather: CurrentWeather;
}

export interface Alert {
  id: string;
  type: 'warning' | 'critical';
  message: string;
  sector: number;
}

export enum WeatherCondition {
  Sunny = 'Sunny',
  Cloudy = 'Cloudy',
  Rainy = 'Rainy',
  Stormy = 'Stormy',
}

export interface WeatherForecast {
  day: string;
  condition: WeatherCondition;
  temp: number;
}

export interface ActivityLog {
  id: number;
  time: string;
  type: string;
  location: string;
  details: string;
}

export enum MapOverlay {
  None = 'None',
  NDVI = 'NDVI',
  NDWI = 'NDWI',
  SoilMoisture = 'SoilMoisture',
  SoilAnalysis = 'SoilAnalysis',
  PestRisk = 'PestRisk',
}

export interface PestIDResponse {
  pestName: string;
  recommendation: string;
}

export interface PlantRecommendationResponse {
  plantName: string;
  justification: string;
}

export interface PestLogEntry {
  id: string;
  details: string;
}

export interface PlantHealthAnalysisResponse {
  plant_health_status: 'Healthy' | 'Stressed' | 'Needs Attention';
  growth_stage: 'Seedling' | 'Vegetative' | 'Flowering' | 'Fruiting' | 'Mature';
  stress_factors: string[];
  recommendations: string[];
  growth_trends?: string;
}

export interface SoilHealthScoreResponse {
  score: number;
  rating: 'Poor' | 'Fair' | 'Good' | 'Excellent';
}
