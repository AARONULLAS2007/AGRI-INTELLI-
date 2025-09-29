// MOCKED API SERVICE
// This file simulates responses from the Google Gemini API to prevent API rate-limiting errors
// and to allow the application to run without a valid API key.

import type { FarmData, Language, PestIDResponse, PlantRecommendationResponse, PlantHealthAnalysisResponse, FarmConditions, SoilHealthScoreResponse } from '../types';

/**
 * Simulates a network delay.
 * @param ms - The number of milliseconds to wait.
 */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));


export const getAIPlantRecommendation = async (farmData: FarmData, lang: Language): Promise<PlantRecommendationResponse> => {
  console.log("MOCK: Fetching AI Plant Recommendation with data:", farmData);
  await sleep(1200);

  // Simple logic to recommend different plants based on pH
  let plantName = "Tomato";
  let justification = "Tomatoes thrive in loamy soil with a balanced pH and temperate climates. The current conditions are ideal.";

  if (farmData.conditions.ph < 6.0) {
      plantName = "Blueberry";
      justification = "Blueberries prefer acidic soil. The current low pH level is highly suitable for their growth.";
  } else if (farmData.conditions.ph > 7.5) {
      plantName = "Asparagus";
      justification = "Asparagus is tolerant of alkaline soils. The current high pH level makes it a good candidate for this field.";
  }

  return { plantName, justification };
};


export const identifyPest = async (imageFile: File, lang: Language): Promise<PestIDResponse> => {
    console.log("MOCK: Identifying pest from image:", imageFile.name);
    await sleep(1500);
    
    // Simulate finding a pest sometimes
    if (Math.random() > 0.4) {
        return {
            pestName: 'Aphid',
            recommendation: 'Introduce ladybugs as natural predators or apply a mild insecticidal soap solution.',
        };
    } else {
        return {
            pestName: 'N/A',
            recommendation: 'No pest was detected in the provided image.',
        };
    }
};

export const getPlantHealthAnalysis = async (imageFile: File, farmData: FarmData, lang: Language): Promise<PlantHealthAnalysisResponse> => {
    console.log("MOCK: Analyzing plant health from image and data:", imageFile.name, farmData);
    await sleep(2000);

    return {
        plant_health_status: "Healthy",
        growth_stage: "Vegetative",
        stress_factors: ["None detected at this time."],
        recommendations: [
            "Maintain current watering and nutrient schedule.", 
            "Ensure good air circulation to prevent fungal issues.",
            "Continue monitoring for pests weekly."
        ],
        growth_trends: "The plant is exhibiting a steady growth rate consistent with its vegetative stage."
    };
};

export const getSoilHealthScore = async (
      conditions: FarmConditions,
      soilMoisture: number,
      lang: Language
    ): Promise<SoilHealthScoreResponse> => {
      console.log("MOCK: Calculating soil health score with conditions:", conditions, "moisture:", soilMoisture);
      await sleep(1000);
      
      // A simple mock calculation based on input data to make it dynamic
      let score = 10;
      
      // pH score (ideal 6.0-7.0)
      const phScore = 1 - (Math.abs(6.5 - conditions.ph) / 2.0); // 0-1 scale
      score += Math.max(0, phScore) * 35;

      // Moisture score (ideal 40-60)
      const moistureScore = 1 - (Math.abs(50 - soilMoisture) / 30.0); // 0-1 scale
      score += Math.max(0, moistureScore) * 30;

      // Nutrient score (simple check)
      const { nitrogen, phosphorus, potassium } = conditions.nutrients;
      if (nitrogen > 100 && nitrogen < 150) score += 10;
      if (phosphorus > 40 && phosphorus < 60) score += 5;
      if (potassium > 70 && potassium < 100) score += 10;
      
      score = Math.min(100, Math.max(0, score));

      let rating: 'Poor' | 'Fair' | 'Good' | 'Excellent' = 'Poor';
      if (score >= 85) rating = 'Excellent';
      else if (score >= 70) rating = 'Good';
      else if (score >= 50) rating = 'Fair';

      return {
        score: Math.round(score),
        rating: rating,
      };
    };
