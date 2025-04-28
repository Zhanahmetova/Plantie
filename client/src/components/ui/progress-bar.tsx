import React from "react";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  showPercentage?: boolean;
  color?: "primary" | "accent" | "green" | "coral";
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  className,
  showPercentage = false,
  color = "primary"
}) => {
  const percentage = Math.min(Math.max(0, (value / max) * 100), 100);
  
  // Get the progress bar color based on the color prop
  const getColorClass = () => {
    switch (color) {
      case "primary":
        return "bg-primary";
      case "accent":
        return "bg-accent";
      case "green":
        return "bg-[#4CAF50]";
      case "coral":
        return "bg-[#FF9800]";
      default:
        return "bg-primary";
    }
  };
  
  // Get the background color for the progress track
  const getTrackColorClass = () => {
    switch (color) {
      case "primary":
        return "bg-[#E8F5E9]";
      case "accent":
        return "bg-[#FFF8E1]";
      case "green":
        return "bg-[#E8F5E9]";
      case "coral":
        return "bg-[#FFF3E0]";
      default:
        return "bg-[#E8F5E9]";
    }
  };
  
  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center">
        <div className={cn("w-full rounded-full h-3", getTrackColorClass())}>
          <div 
            className={cn("h-3 rounded-full progress-bar", getColorClass())}
            style={{ width: `${percentage}%` }}
          />
        </div>
        {showPercentage && (
          <p className="text-xs text-muted-foreground ml-2 font-medium">{Math.round(percentage)}%</p>
        )}
      </div>
    </div>
  );
};

export default ProgressBar;
