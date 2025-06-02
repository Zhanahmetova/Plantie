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
        <div className="h-28 overflow-hidden">
          <img 
            src={plant.image} 
            alt={plant.name}
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </Link>
  );
};

export default PlantCard;
