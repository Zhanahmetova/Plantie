import React from "react";
import { cn } from "@/lib/utils";
import ProgressBar from "./progress-bar";
import { Task } from "@shared/schema";
import { WateringCanIcon, MistingIcon, FertilizingIcon } from "@/lib/icons";

interface TaskCardProps {
  title: string;
  description: string;
  progress: number;
  type: "watering" | "misting" | "fertilizing" | "other";
  active?: boolean;
  className?: string;
  onClick?: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({
  title,
  description,
  progress,
  type,
  active = false,
  className,
  onClick
}) => {
  // Get the appropriate icon based on task type
  const getIcon = () => {
    switch (type) {
      case "watering":
        return (
          <div className="relative">
            <WateringCanIcon className="text-primary" />
            {/* Animated water drop for watering tasks */}
            <div className="absolute -bottom-1 -right-1 text-sky-blue water-drop">
              <svg width="6" height="8" viewBox="0 0 6 8" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 0C3 0 0 4 0 6C0 7.1 1.3 8 3 8C4.7 8 6 7.1 6 6C6 4 3 0 3 0Z" />
              </svg>
            </div>
          </div>
        );
      case "misting":
        return <MistingIcon className="text-primary" />;
      case "fertilizing":
        return <FertilizingIcon className="text-primary" />;
      default:
        return null;
    }
  };
  
  // Get background color based on active state and task type
  const getColorClass = () => {
    if (active) {
      switch (type) {
        case "watering":
          return "bg-[#E3F2FD]"; // Light blue for watering
        case "misting":
          return "bg-[#E8F5E9]"; // Light green for misting
        case "fertilizing":
          return "bg-[#FFF8E1]"; // Light orange for fertilizing
        default:
          return "bg-white";
      }
    }
    return "bg-white";
  };
  
  return (
    <div 
      className={cn(
        "task-card p-4 rounded-2xl relative cursor-pointer transition-all hover:shadow-md",
        getColorClass(),
        className
      )}
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium text-foreground text-base">{title}</h3>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        </div>
        <div className="flex items-center">
          <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm">
            {getIcon()}
          </div>
        </div>
      </div>
      <div className="mt-3">
        <ProgressBar 
          value={progress} 
          color={type === "watering" ? "primary" : type === "misting" ? "green" : "accent"}
          showPercentage={true}
        />
      </div>
    </div>
  );
};

export default TaskCard;
