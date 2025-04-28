import React from "react";
import { cn, formatDate } from "@/lib/utils";
import { Plant } from "@shared/schema";
import { 
  WateringCanIcon, 
  SunIcon, 
  TemperatureIcon,
  HumidityIcon, 
  LeafIcon,
  BellIcon,
  BackIcon
} from "@/lib/icons";
import { useLocation } from "wouter";

interface PlantDetailProps {
  plant: Plant;
  className?: string;
}

const PlantDetail: React.FC<PlantDetailProps> = ({
  plant,
  className
}) => {
  const [, navigate] = useLocation();
  
  return (
    <div className={className}>
      <div className="relative h-[440px] bg-mint-light flex items-center justify-center">
        <div className="absolute top-6 left-4 z-10">
          <button 
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm"
            onClick={() => navigate("/")}
          >
            <BackIcon className="text-foreground" />
          </button>
        </div>
        
        <div className="flex items-center justify-center h-full">
          <svg 
            viewBox="0 0 100 100" 
            className="h-64 w-auto" 
            xmlns="http://www.w3.org/2000/svg"
          >
            {plant.name && plant.name.toLowerCase().includes("monstera") && (
              <path d="M50,10 C30,10 15,25 15,45 C15,65 30,85 50,85 C70,85 85,65 85,45 C85,25 70,10 50,10 Z M60,35 C55,30 45,30 40,35 C35,40 35,50 40,55 C45,60 55,60 60,55 C65,50 65,40 60,35 Z" fill="#4CAF50" />
            )}
            
            {plant.name && plant.name.toLowerCase().includes("fern") && (
              <path d="M50,10 C40,30 40,50 40,70 C40,75 45,80 50,80 C55,80 60,75 60,70 C60,50 60,30 50,10 Z M50,10 C60,30 60,50 60,70 M50,10 C40,30 40,50 40,70 M50,40 C40,45 30,55 20,70 M50,40 C60,45 70,55 80,70" stroke="#4CAF50" strokeWidth="3" fill="none" />
            )}
            
            {plant.name && plant.name.toLowerCase().includes("snake") && (
              <path d="M50,10 C45,20 45,30 45,80 M55,10 C60,20 60,30 60,80 M40,10 C35,20 35,30 35,80 M65,10 C70,20 70,30 70,80" stroke="#4CAF50" strokeWidth="6" strokeLinecap="round" fill="none" />
            )}
            
            {plant.name && plant.name.toLowerCase().includes("coin") && (
              <>
                <circle cx="50" cy="50" r="30" fill="#8BC34A" />
                <circle cx="50" cy="50" r="25" fill="#4CAF50" />
              </>
            )}
            
            {plant.name && !plant.name.toLowerCase().includes("monstera") && 
             !plant.name.toLowerCase().includes("fern") && 
             !plant.name.toLowerCase().includes("snake") && 
             !plant.name.toLowerCase().includes("coin") && (
              <path d="M30,80 C30,50 50,20 50,20 C50,20 70,50 70,80 C70,90 60,95 50,95 C40,95 30,90 30,80 Z" fill="#4CAF50" />
            )}
            
            {!plant.name && (
              <path d="M30,80 C30,50 50,20 50,20 C50,20 70,50 70,80 C70,90 60,95 50,95 C40,95 30,90 30,80 Z" fill="#4CAF50" />
            )}
          </svg>
        </div>
        
        <div className="absolute h-32 w-32 top-1/4 right-4 flex">
          <div className="absolute top-0 left-0 h-12 w-12 border-t-2 border-l-2 border-foreground"></div>
          <div className="absolute bottom-0 right-0 h-12 w-12 border-b-2 border-r-2 border-foreground"></div>
        </div>
      </div>

      <div className="bg-white p-5 rounded-t-2xl -mt-6 relative z-10">
        <div className="bg-white rounded-xl mb-4 shadow-sm py-3 px-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-mint-light rounded-full flex items-center justify-center mr-3">
              <LeafIcon className="text-accent" size={18} />
            </div>
            <div>
              <h2 className="font-medium text-foreground">{plant.name}</h2>
              <p className="text-xs text-muted-foreground">Tap for details</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-muted rounded-xl p-3">
            <div className="flex items-center mb-2">
              <div className="w-8 h-8 rounded-full bg-mint-light flex items-center justify-center mr-2">
                <WateringCanIcon className="text-accent" size={16} />
              </div>
              <span className="text-foreground font-medium">Water</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Every {plant.wateringFrequency} days
            </p>
          </div>
          
          <div className="bg-muted rounded-xl p-3">
            <div className="flex items-center mb-2">
              <div className="w-8 h-8 rounded-full bg-mint-light flex items-center justify-center mr-2">
                <SunIcon className="text-yellow-500" size={16} />
              </div>
              <span className="text-foreground font-medium">Light</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {plant.light.charAt(0).toUpperCase() + plant.light.slice(1)} light
            </p>
          </div>
          
          <div className="bg-muted rounded-xl p-3">
            <div className="flex items-center mb-2">
              <div className="w-8 h-8 rounded-full bg-mint-light flex items-center justify-center mr-2">
                <TemperatureIcon className="text-primary" size={16} />
              </div>
              <span className="text-foreground font-medium">Temperature</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {plant.temperature.min}-{plant.temperature.max}°C
            </p>
          </div>
          
          <div className="bg-muted rounded-xl p-3">
            <div className="flex items-center mb-2">
              <div className="w-8 h-8 rounded-full bg-mint-light flex items-center justify-center mr-2">
                <HumidityIcon className="text-muted-foreground" size={16} />
              </div>
              <span className="text-foreground font-medium">Humidity</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {plant.humidity.charAt(0).toUpperCase() + plant.humidity.slice(1)}
            </p>
          </div>
        </div>

        <div className="bg-muted rounded-xl p-4 mb-4">
          <h3 className="font-medium text-foreground mb-2">Care Schedule</h3>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-mint-light flex items-center justify-center mr-2">
                <WateringCanIcon className="text-accent" size={16} />
              </div>
              <span className="text-sm text-foreground">Last watered</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {formatDate(plant.lastWatered || new Date())}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-mint-light flex items-center justify-center mr-2">
                <LeafIcon className="text-accent" size={16} />
              </div>
              <span className="text-sm text-foreground">Last fertilized</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {formatDate(plant.lastFertilized || new Date())}
            </span>
          </div>
        </div>

        <button className="w-full py-3 bg-primary text-white rounded-xl font-medium shadow-sm flex items-center justify-center">
          <BellIcon className="mr-2" size={16} />
          Set Care Reminder
        </button>
        
        {plant.notes && (
          <div className="mt-4 p-4 bg-muted rounded-xl">
            <h3 className="font-medium text-foreground mb-2">Notes</h3>
            <p className="text-sm text-muted-foreground">{plant.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlantDetail;
