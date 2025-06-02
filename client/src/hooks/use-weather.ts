import { useQuery, useMutation } from "@tanstack/react-query";
import { WeatherPreference, InsertWeatherPreference } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState, useEffect } from "react";

interface WeatherData {
  location: string;
  temperature: number;
  condition: string;
  high: number;
  low: number;
  humidity: number;
  unit: string;
}

interface LocationCoords {
  lat: number;
  lon: number;
}

export function useWeatherPreferences() {
  return useQuery<WeatherPreference>({
    queryKey: ["/api/weather-preferences"],
  });
}

export function useCreateWeatherPreference() {
  return useMutation({
    mutationFn: async (data: InsertWeatherPreference) => {
      const res = await apiRequest("POST", "/api/weather-preferences", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/weather-preferences"] });
    },
  });
}

export function useUpdateWeatherPreference() {
  return useMutation({
    mutationFn: async (data: Partial<WeatherPreference>) => {
      const res = await apiRequest("PUT", "/api/weather-preferences", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/weather-preferences"] });
    },
  });
}

export function useLocationPermission() {
  const [locationStatus, setLocationStatus] = useState<'requesting' | 'granted' | 'denied' | 'not-requested'>('not-requested');
  const [coordinates, setCoordinates] = useState<LocationCoords | null>(null);

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('denied');
      return;
    }

    setLocationStatus('requesting');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoordinates({
          lat: position.coords.latitude,
          lon: position.coords.longitude
        });
        setLocationStatus('granted');
      },
      (error) => {
        console.error('Location permission denied:', error);
        setLocationStatus('denied');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  };

  return {
    locationStatus,
    coordinates,
    requestLocation
  };
}

export function useWeather() {
  const { data: preferences, isLoading: preferencesLoading } = useWeatherPreferences();
  
  const weatherQuery = useQuery<WeatherData>({
    queryKey: ["/api/weather", preferences?.location, preferences?.unit],
    enabled: !!preferences?.location,
  });

  return {
    ...weatherQuery,
    isLoading: preferencesLoading || weatherQuery.isLoading
  };
}
