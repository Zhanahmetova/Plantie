import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { useWeather, useWeatherPreferences, useLocationPermission, useCreateWeatherPreference, useUpdateWeatherPreference } from "@/hooks/use-weather";
import { PlusCircleIcon, SunIcon } from "@/lib/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";

interface WeatherCardProps {
  className?: string;
}

const WeatherCard: React.FC<WeatherCardProps> = ({
  className
}) => {
  const { data: weather, isLoading: weatherLoading } = useWeather();
  const { data: preferences, isLoading: preferencesLoading } = useWeatherPreferences();
  const { locationStatus, coordinates, requestLocation } = useLocationPermission();
  const createPreferences = useCreateWeatherPreference();
  const updatePreferences = useUpdateWeatherPreference();
  
  const [showLocationSetup, setShowLocationSetup] = useState(false);
  const [manualLocation, setManualLocation] = useState("");
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");

  const handleLocationRequest = async () => {
    if (coordinates) {
      try {
        await apiRequest("/api/weather/coordinates", {
          method: "POST",
          body: { lat: coordinates.lat, lon: coordinates.lon, unit }
        });
        setShowLocationSetup(false);
      } catch (error) {
        console.error("Failed to save location:", error);
      }
    } else {
      requestLocation();
    }
  };

  const handleManualLocation = async () => {
    if (!manualLocation.trim()) return;
    
    try {
      await createPreferences.mutateAsync({
        userId: 0, // This will be set by the server
        location: manualLocation.trim(),
        unit
      });
      setShowLocationSetup(false);
      setManualLocation("");
    } catch (error) {
      console.error("Failed to save manual location:", error);
    }
  };

  // Show location setup if no preferences exist
  if (!preferences && !preferencesLoading && !showLocationSetup) {
    setShowLocationSetup(true);
  }

  if (preferencesLoading || weatherLoading) {
    return (
      <div className={cn(
        "bg-white p-5 rounded-2xl shadow-sm relative overflow-hidden h-36 animate-pulse",
        className
      )}>
        <div className="h-4 w-24 bg-muted rounded mb-2"></div>
        <div className="h-8 w-16 bg-muted rounded mb-2"></div>
        <div className="h-3 w-20 bg-muted rounded"></div>
      </div>
    );
  }

  // Show location setup modal
  if (showLocationSetup || !preferences) {
    return (
      <div className={cn(
        "bg-white p-5 rounded-2xl shadow-sm relative overflow-hidden",
        className
      )}>
        <div className="text-center">
          <h3 className="font-semibold text-lg mb-3">Weather Setup</h3>
          <p className="text-muted-foreground text-sm mb-4">
            Choose how to get your weather information
          </p>
          
          {locationStatus === 'not-requested' && (
            <Button onClick={handleLocationRequest} className="w-full mb-3">
              Use My Location
            </Button>
          )}
          
          {locationStatus === 'requesting' && (
            <div className="mb-3">
              <p className="text-sm text-muted-foreground">Requesting location...</p>
            </div>
          )}
          
          {locationStatus === 'granted' && coordinates && (
            <Button onClick={handleLocationRequest} className="w-full mb-3">
              Save Location
            </Button>
          )}
          
          {(locationStatus === 'denied' || locationStatus === 'not-requested') && (
            <div className="space-y-3">
              <div className="text-sm text-muted-foreground">Or enter manually:</div>
              <Input
                placeholder="City, Country (e.g., London, UK)"
                value={manualLocation}
                onChange={(e) => setManualLocation(e.target.value)}
                className="w-full"
              />
              <div className="flex gap-2">
                <Select value={unit} onValueChange={(value) => setUnit(value as "metric" | "imperial")}>
                  <SelectTrigger className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="metric">Celsius</SelectItem>
                    <SelectItem value="imperial">Fahrenheit</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  onClick={handleManualLocation} 
                  disabled={!manualLocation.trim() || createPreferences.isPending}
                  className="flex-1"
                >
                  Save
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm relative overflow-hidden mb-7 ml-[16px] mr-[16px]">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-muted-foreground text-sm mb-1">
            It's {weather?.condition || "Sunny"} Out
          </p>
          <div className="flex items-end">
            <h2 className="font-bold text-5xl text-foreground">
              {weather?.temperature || 20}
            </h2>
            <span className="text-muted-foreground text-xl font-light mb-1">
              °{weather?.unit === "metric" ? "C" : "F"}
            </span>
          </div>
          <div className="flex text-xs text-muted-foreground mt-1">
            <span className="mr-2">↑{weather?.high || 24}°</span>
            <span>↓{weather?.low || 10}°</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {weather?.location}
          </p>
        </div>
      </div>
      {/* Decorative Background */}
      <div className="absolute bottom-0 right-0 opacity-40 pointer-events-none">
        <svg 
          width="120" 
          height="80" 
          viewBox="0 0 120 80" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            d="M100,40 C115,40 115,20 100,20 C85,20 85,0 70,0 C55,0 55,20 40,20 C25,20 25,40 10,40 C-5,40 -5,60 10,60 C25,60 25,80 40,80 C55,80 55,60 70,60 C85,60 85,80 100,80 C115,80 115,60 130,60 C145,60 145,40 130,40 C115,40 115,40 100,40" 
            fill="#F9A76C" 
            opacity="0.2"
          />
          <path 
            d="M80,50 C90,50 90,40 80,40 C70,40 70,30 60,30 C50,30 50,40 40,40 C30,40 30,50 20,50 C10,50 10,60 20,60 C30,60 30,70 40,70 C50,70 50,60 60,60 C70,60 70,70 80,70 C90,70 90,60 100,60 C110,60 110,50 100,50 C90,50 90,50 80,50" 
            fill="#F9A76C" 
            opacity="0.3"
          />
        </svg>
      </div>
      {/* Animated Sun Icon */}
      <div className="absolute top-4 right-16 opacity-20 pointer-events-none animate-pulse">
        <SunIcon size={40} className="text-yellow-500" />
      </div>
    </div>
  );
};

export default WeatherCard;
