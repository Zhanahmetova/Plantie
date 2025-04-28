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
  const getIcon = () => {
    switch (type) {
      case "watering":
        return <WateringCanIcon className="text-accent-foreground" />;
      case "misting":
        return <MistingIcon className="text-accent-foreground" />;
      case "fertilizing":
        return <FertilizingIcon className="text-accent-foreground" />;
      default:
        return null;
    }
  };
  
  const getColorClass = () => {
    if (active) {
      return "bg-mint-light";
    }
    return "bg-white";
  };
  
  return (
    <div 
      className={cn(
        "task-card p-3 rounded-xl relative cursor-pointer transition-all",
        getColorClass(),
        className
      )}
      onClick={onClick}
    >
      <div className="flex justify-between">
        <div>
          <h3 className="font-medium text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="flex items-center h-full">
          <div className="w-12 h-12 flex items-center justify-center">
            {getIcon()}
          </div>
        </div>
      </div>
      <div className="mt-2">
        <ProgressBar 
          value={progress} 
          color={type === "watering" ? "coral" : type === "misting" ? "green" : "accent"}
        />
      </div>
    </div>
  );
};

export default TaskCard;
