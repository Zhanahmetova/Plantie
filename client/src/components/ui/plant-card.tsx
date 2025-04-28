import React from "react";
import { cn, getRandomColor } from "@/lib/utils";
import { Link } from "wouter";
import { Plant } from "@shared/schema";

interface PlantCardProps {
  plant: Plant;
  className?: string;
}

// Pastel background colors for plant cards
const pastelBackgrounds = [
  'bg-[#E8F5E9]', // Mint pastel
  'bg-[#FFF8E1]', // Soft orange pastel
  'bg-[#E3F2FD]', // Sky blue pastel
  'bg-[#F3E5F5]', // Lavender pastel
  'bg-[#E0F7FA]', // Aqua pastel
];

const PlantCard: React.FC<PlantCardProps> = ({
  plant,
  className
}) => {
  // Get a consistent background color based on plant id
  const bgColor = pastelBackgrounds[plant.id % pastelBackgrounds.length];
  
  return (
    <Link href={`/plants/${plant.id}`}>
      <div 
        className={cn(
          "plant-card bg-white rounded-2xl overflow-hidden shadow-sm cursor-pointer transition-all hover:scale-[1.02] hover:shadow-md active:scale-[0.98]",
          className
        )}
      >
        <div className="p-4">
          <div className="text-foreground mb-1 font-medium">{plant.name}</div>
          <div className="text-muted-foreground text-xs">{plant.family || "Vascular"} Plant</div>
        </div>
        <div className={cn(
          "h-28 flex items-center justify-center plant-grow", 
          bgColor
        )}>
          <svg 
            viewBox="0 0 100 100" 
            className="h-20 w-auto" 
            xmlns="http://www.w3.org/2000/svg"
          >
            {plant.name.toLowerCase().includes("monstera") && (
              <path d="M50,10 C30,10 15,25 15,45 C15,65 30,85 50,85 C70,85 85,65 85,45 C85,25 70,10 50,10 Z M60,35 C55,30 45,30 40,35 C35,40 35,50 40,55 C45,60 55,60 60,55 C65,50 65,40 60,35 Z" fill="#4CAF50" />
            )}
            
            {plant.name.toLowerCase().includes("fern") && (
              <path d="M50,10 C40,30 40,50 40,70 C40,75 45,80 50,80 C55,80 60,75 60,70 C60,50 60,30 50,10 Z M50,10 C60,30 60,50 60,70 M50,10 C40,30 40,50 40,70 M50,40 C40,45 30,55 20,70 M50,40 C60,45 70,55 80,70" stroke="#4CAF50" strokeWidth="3" fill="none" />
            )}
            
            {plant.name.toLowerCase().includes("snake") && (
              <path d="M50,10 C45,20 45,30 45,80 M55,10 C60,20 60,30 60,80 M40,10 C35,20 35,30 35,80 M65,10 C70,20 70,30 70,80" stroke="#4CAF50" strokeWidth="6" strokeLinecap="round" fill="none" />
            )}
            
            {plant.name.toLowerCase().includes("coin") && (
              <>
                <circle cx="50" cy="50" r="30" fill="#8BC34A" />
                <circle cx="50" cy="50" r="25" fill="#4CAF50" />
              </>
            )}
            
            {!plant.name.toLowerCase().includes("monstera") && 
             !plant.name.toLowerCase().includes("fern") && 
             !plant.name.toLowerCase().includes("snake") && 
             !plant.name.toLowerCase().includes("coin") && (
              <path d="M30,80 C30,50 50,20 50,20 C50,20 70,50 70,80 C70,90 60,95 50,95 C40,95 30,90 30,80 Z" fill="#4CAF50" />
            )}
          </svg>
        </div>
      </div>
    </Link>
  );
};

export default PlantCard;
