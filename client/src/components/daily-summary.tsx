import React, { useState } from "react";
import { cn } from "@/lib/utils";
import TaskCard from "@/components/ui/task-card";
import { useTasksByType } from "@/hooks/use-tasks";
import { LeafIcon, WateringCanIcon, MistingIcon } from "@/lib/icons";

interface DailySummaryProps {
  className?: string;
  selectedDate?: Date;
}

const DailySummary: React.FC<DailySummaryProps> = ({
  className,
  selectedDate = new Date(),
}) => {
  const { 
    wateringTasks, 
    mistingTasks, 
    totalTasks, 
    completedTasks, 
    forgottenTasks, 
    isToday, 
    isPastDate, 
    isLoading 
  } = useTasksByType(selectedDate);

  const [activeFilter, setActiveFilter] = useState<
    "all" | "watering" | "misting" | "completed" | "forgotten"
  >("all");

  if (isLoading) {
    return (
      <div
        className={cn(
          "bg-white p-5 rounded-2xl shadow-sm animate-pulse",
          className,
        )}
      >
        <div className="h-5 bg-muted rounded w-40 mb-1"></div>
        <div className="h-4 bg-muted rounded w-24 mb-4"></div>
        <div className="h-10 bg-muted rounded-full mb-4"></div>
        <div className="h-20 bg-muted rounded-xl mb-3"></div>
        <div className="h-20 bg-muted rounded-xl"></div>
      </div>
    );
  }

  const getTaskSummaryText = () => {
    if (isPastDate) {
      return `${completedTasks.length} completed, ${forgottenTasks.length} forgotten tasks`;
    } else {
      return `You have ${totalTasks} tasks`;
    }
  };

  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm mb-5 ml-[0px] mr-[0px]">
      <div className="mb-4">
        <h2 className="font-semibold text-lg text-foreground">
          {getTaskSummaryText()}
        </h2>
      </div>
      <div className="flex space-x-2 mb-5 overflow-x-auto">
        <button
          className={cn(
            "px-5 py-2.5 rounded-full text-sm font-medium flex items-center whitespace-nowrap transition-colors",
            activeFilter === "all"
              ? "bg-primary text-white"
              : "bg-muted text-foreground",
          )}
          onClick={() => setActiveFilter("all")}
        >
          <LeafIcon size={16} className="mr-2" />
          All
        </button>
        
        {isPastDate ? (
          <>
            <button
              className={cn(
                "px-5 py-2.5 rounded-full text-sm font-medium flex items-center whitespace-nowrap transition-colors",
                activeFilter === "completed"
                  ? "bg-green-600 text-white"
                  : "bg-muted text-foreground",
              )}
              onClick={() => setActiveFilter("completed")}
            >
              <CheckCircleIcon size={16} className="mr-2" />
              Completed ({completedTasks.length})
            </button>
            <button
              className={cn(
                "px-5 py-2.5 rounded-full text-sm font-medium flex items-center whitespace-nowrap transition-colors",
                activeFilter === "forgotten"
                  ? "bg-red-600 text-white"
                  : "bg-muted text-foreground",
              )}
              onClick={() => setActiveFilter("forgotten")}
            >
              <XCircleIcon size={16} className="mr-2" />
              Forgotten ({forgottenTasks.length})
            </button>
          </>
        ) : (
          <>
            <button
              className={cn(
                "px-5 py-2.5 rounded-full text-sm font-medium flex items-center whitespace-nowrap transition-colors",
                activeFilter === "watering"
                  ? "bg-primary text-white"
                  : "bg-muted text-foreground",
              )}
              onClick={() => setActiveFilter("watering")}
            >
              <WateringCanIcon size={16} className="mr-2" />
              Watering
            </button>
            <button
              className={cn(
                "px-5 py-2.5 rounded-full text-sm font-medium flex items-center whitespace-nowrap transition-colors",
                activeFilter === "misting"
                  ? "bg-primary text-white"
                  : "bg-muted text-foreground",
              )}
              onClick={() => setActiveFilter("misting")}
            >
              <MistingIcon size={16} className="mr-2" />
              Misting
            </button>
          </>
        )}
      </div>
      {/* Task Cards */}
      {(activeFilter === "all" || activeFilter === "watering") &&
        wateringTasks.length > 0 && (
          <TaskCard
            title="Plant Watering"
            description={`${wateringTasks.length} Plants need watering`}
            progress={80}
            type="watering"
            active={true}
            className="mb-3"
          />
        )}
      {(activeFilter === "all" || activeFilter === "misting") &&
        mistingTasks.length > 0 && (
          <TaskCard
            title="Plant Misting"
            description={`${mistingTasks.length} Plants need misting`}
            progress={60}
            type="misting"
          />
        )}
      {activeFilter !== "all" &&
        ((activeFilter === "watering" && wateringTasks.length === 0) ||
          (activeFilter === "misting" && mistingTasks.length === 0)) && (
          <div className="text-center py-6 text-muted-foreground rounded-xl bg-muted/30">
            No {activeFilter} tasks for today
          </div>
        )}
      {activeFilter === "all" && totalTasks === 0 && (
        <div className="text-center py-6 text-muted-foreground rounded-xl bg-muted/30">
          No tasks for today
        </div>
      )}
    </div>
  );
};

export default DailySummary;
