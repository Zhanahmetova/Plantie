import { useQuery } from "@tanstack/react-query";
import { WeatherPreference } from "@shared/schema";

interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
  high: number;
  low: number;
  humidity: number;
  unit: string;
}

export function useWeatherPreferences() {
  return useQuery<WeatherPreference>({
    queryKey: ["/api/weather-preferences"],
  });
}

export function useWeather() {
  const { data: preferences, isLoading: preferencesLoading } = useWeatherPreferences();
  
  // We're not actually calling OpenWeatherMap API here
  // In a real application, we would fetch weather data from the API
  // based on the user's preferences
  const weatherQuery = useQuery<WeatherData>({
    queryKey: ["/api/weather", preferences?.location, preferences?.unit],
    enabled: !!preferences,
    placeholderData: {
      location: preferences?.location || "London",
      temperature: 20,
      condition: "Sunny",
      high: 24,
      low: 10,
      humidity: 45,
      unit: preferences?.unit || "metric"
    }
  });

  return {
    ...weatherQuery,
    isLoading: preferencesLoading || weatherQuery.isLoading
  };
}
