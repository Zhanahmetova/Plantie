import React, { useState } from "react";
import { cn } from "@/lib/utils";
import TaskCard from "@/components/ui/task-card";
import { useTasksByType } from "@/hooks/use-tasks";
import { LeafIcon, WateringCanIcon, MistingIcon } from "@/lib/icons";

interface DailySummaryProps {
  className?: string;
}

const DailySummary: React.FC<DailySummaryProps> = ({
  className
}) => {
  const { 
    wateringTasks, 
    mistingTasks,
    totalTasks,
    isLoading
  } = useTasksByType();
  
  const [activeFilter, setActiveFilter] = useState<"all" | "watering" | "misting">("all");
  
  if (isLoading) {
    return (
      <div className={cn(
        "bg-white p-4 rounded-2xl shadow-sm animate-pulse",
        className
      )}>
        <div className="h-5 bg-muted rounded w-40 mb-1"></div>
        <div className="h-4 bg-muted rounded w-24 mb-4"></div>
        <div className="h-10 bg-muted rounded-full mb-4"></div>
        <div className="h-20 bg-muted rounded-xl mb-3"></div>
        <div className="h-20 bg-muted rounded-xl"></div>
      </div>
    );
  }
  
  return (
    <div className={cn(
      "bg-white p-4 rounded-2xl shadow-sm",
      className
    )}>
      <div className="mb-3">
        <h2 className="font-semibold text-lg text-foreground">
          You have {totalTasks} tasks
        </h2>
        <p className="text-sm text-muted-foreground">Today's Reminders</p>
      </div>
      
      <div className="flex space-x-2 mb-4 overflow-x-auto">
        <button 
          className={cn(
            "px-4 py-2 rounded-full text-sm font-medium flex items-center whitespace-nowrap",
            activeFilter === "all" 
              ? "bg-primary text-white" 
              : "bg-muted text-foreground"
          )}
          onClick={() => setActiveFilter("all")}
        >
          <LeafIcon size={16} className="mr-2" />
          All
        </button>
        <button 
          className={cn(
            "px-4 py-2 rounded-full text-sm font-medium flex items-center whitespace-nowrap",
            activeFilter === "watering" 
              ? "bg-primary text-white" 
              : "bg-muted text-foreground"
          )}
          onClick={() => setActiveFilter("watering")}
        >
          <WateringCanIcon size={16} className="mr-2" />
          Watering
        </button>
        <button 
          className={cn(
            "px-4 py-2 rounded-full text-sm font-medium flex items-center whitespace-nowrap",
            activeFilter === "misting" 
              ? "bg-primary text-white" 
              : "bg-muted text-foreground"
          )}
          onClick={() => setActiveFilter("misting")}
        >
          <MistingIcon size={16} className="mr-2" />
          Misting
        </button>
      </div>
      
      {/* Task Cards */}
      {(activeFilter === "all" || activeFilter === "watering") && wateringTasks.length > 0 && (
        <TaskCard
          title="Plant Watering"
          description={`${wateringTasks.length} Plants need watering`}
          progress={80}
          type="watering"
          active={true}
          className="mb-3"
        />
      )}
      
      {(activeFilter === "all" || activeFilter === "misting") && mistingTasks.length > 0 && (
        <TaskCard
          title="Plant Misting"
          description={`${mistingTasks.length} Plants need misting`}
          progress={60}
          type="misting"
        />
      )}
      
      {activeFilter !== "all" && (
        (activeFilter === "watering" && wateringTasks.length === 0) || 
        (activeFilter === "misting" && mistingTasks.length === 0)
      ) && (
        <div className="text-center py-4 text-muted-foreground">
          No {activeFilter} tasks for today
        </div>
      )}
      
      {activeFilter === "all" && totalTasks === 0 && (
        <div className="text-center py-4 text-muted-foreground">
          No tasks for today
        </div>
      )}
    </div>
  );
};

export default DailySummary;
