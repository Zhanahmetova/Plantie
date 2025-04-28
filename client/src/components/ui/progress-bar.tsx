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
  showPercentage = true,
  color = "primary"
}) => {
  const percentage = Math.min(Math.max(0, (value / max) * 100), 100);
  
  const getColorClass = () => {
    switch (color) {
      case "primary":
        return "bg-primary";
      case "accent":
        return "bg-accent";
      case "green":
        return "bg-green-400";
      case "coral":
        return "bg-primary";
      default:
        return "bg-primary";
    }
  };
  
  return (
    <div className={cn("w-full", className)}>
      <div className="w-full bg-white rounded-full h-2">
        <div 
          className={cn("h-2 rounded-full progress-bar", getColorClass())}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showPercentage && (
        <p className="text-xs text-muted-foreground mt-1 text-right">{Math.round(percentage)}%</p>
      )}
    </div>
  );
};

export default ProgressBar;
