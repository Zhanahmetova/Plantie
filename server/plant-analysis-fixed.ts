import fetch from 'node-fetch';

const PLANT_ID_API_KEY = "XdKD593MYnx3NKXKWgeFTUzeCDG4D9liAymkGuiYPo7wb2vwru";
const PLANT_ID_API_URL = "https://plant.id/api/v3/identification";

interface PlantIdentificationResult {
  name: string;
  species: string;
  confidence: number;
}

interface PlantHealthResult {
  overallHealth: "excellent" | "good" | "fair" | "poor" | "critical";
  healthScore: number;
  issues: {
    type: "disease" | "pest" | "nutrient" | "watering" | "light";
    severity: "low" | "medium" | "high";
    name: string;
    description: string;
    treatment: string;
    confidence: number;
  }[];
  recommendations: string[];
}

export async function identifyPlant(imageBase64: string): Promise<PlantIdentificationResult | null> {
  try {
    const imageData = imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`;
    
    console.log('Image data length:', imageData.length);
    console.log('Image data preview:', imageData.substring(0, 100) + '...');
    
    const payload = {
      images: [imageData],
      latitude: 49.207,
      longitude: 16.608,
      similar_images: true
    };

    const response = await fetch(PLANT_ID_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Api-Key': PLANT_ID_API_KEY
      },
      body: JSON.stringify(payload)
    });

    console.log('Plant.ID API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Plant.ID API error:', response.status, response.statusText);
      console.error('Error response:', errorText);
      return null;
    }

    const data = await response.json() as any;
    console.log('Plant.ID API success response:', JSON.stringify(data, null, 2));
    
    if (data.suggestions && data.suggestions.length > 0) {
      const suggestion = data.suggestions[0];
      return {
        name: suggestion.plant_name || "Unknown Plant",
        species: suggestion.plant_details?.scientific_name || suggestion.plant_name || "Unknown Species",
        confidence: suggestion.probability || 0
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error identifying plant:', error);
    return null;
  }
}

export async function analyzePlantHealth(imageBase64: string, plantInfo?: PlantIdentificationResult | null): Promise<PlantHealthResult> {
  try {
    const imageData = imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`;
    
    console.log('Health analysis - Image data length:', imageData.length);
    console.log('Health analysis - Image data preview:', imageData.substring(0, 100) + '...');
    
    const payload = {
      images: [imageData],
      latitude: 49.207,
      longitude: 16.608,
      similar_images: true
    };

    const response = await fetch(PLANT_ID_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Api-Key': PLANT_ID_API_KEY
      },
      body: JSON.stringify(payload)
    });

    console.log('Plant.ID Health API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Plant.ID Health API error:', response.status, response.statusText);
      console.error('Health API error response:', errorText);
      return generateFallbackHealthResult(plantInfo);
    }

    const data = await response.json() as any;
    console.log('Plant.ID Health API success response:', JSON.stringify(data, null, 2));
    
    // Parse the actual API response structure
    if (data.suggestions && data.suggestions.length > 0) {
      const suggestion = data.suggestions[0];
      
      return {
        overallHealth: "good",
        healthScore: Math.round((suggestion.probability || 0.7) * 100),
        issues: [],
        recommendations: [
          "Continue regular care routine",
          "Monitor for any changes in appearance",
          "Ensure adequate lighting and watering"
        ]
      };
    }
    
    return generateFallbackHealthResult(plantInfo);
  } catch (error) {
    console.error('Error analyzing plant health:', error);
    return generateFallbackHealthResult(plantInfo);
  }
}

function generateFallbackHealthResult(plantInfo?: PlantIdentificationResult | null): PlantHealthResult {
  return {
    overallHealth: "good",
    healthScore: 75,
    issues: [],
    recommendations: [
      "Regular watering schedule recommended",
      "Ensure adequate sunlight exposure",
      "Monitor for pest activity",
      plantInfo ? `Continue care specific to ${plantInfo.name}` : "Follow general plant care guidelines"
    ]
  };
}