import React, { useState } from "react";
import { cn } from "@/lib/utils";
import PlantCard from "@/components/ui/plant-card";
import { usePlants } from "@/hooks/use-plants";
import { AllPlantsIcon, IndoorIcon, SunIcon } from "@/lib/icons";
import { Link } from "wouter";

interface PlantCategoriesProps {
  className?: string;
}

const PlantCategories: React.FC<PlantCategoriesProps> = ({ className }) => {
  const { data: plants, isLoading } = usePlants();
  const [activeCategory, setActiveCategory] = useState<
    "all" | "indoor" | "outdoor"
  >("all");

  const filteredPlants = plants?.filter((plant) => {
    if (activeCategory === "all") return true;
    return plant.category === activeCategory;
  });

  if (isLoading) {
    return (
      <div className={cn("animate-pulse", className)}>
        <div className="flex justify-between items-center mb-3">
          <div className="h-5 bg-muted rounded w-24"></div>
          <div className="h-4 bg-muted rounded w-16"></div>
        </div>

        <div className="flex space-x-3 mb-4 overflow-x-auto">
          <div className="h-10 bg-muted rounded-full w-24"></div>
          <div className="h-10 bg-muted rounded-full w-32"></div>
          <div className="h-10 bg-muted rounded-full w-24"></div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="h-40 bg-muted rounded-xl"></div>
          <div className="h-40 bg-muted rounded-xl"></div>
          <div className="h-40 bg-muted rounded-xl"></div>
          <div className="h-40 bg-muted rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="flex justify-between items-center mb-3 ml-[0px] mr-[0px]">
        <h2 className="font-semibold text-lg text-foreground">My Garden</h2>
        <Link href="/plants" className="text-primary text-sm">
          View All
        </Link>
      </div>
      <div className="flex space-x-3 mb-4 overflow-x-auto pb-2 pl-[0px] pr-[0px]">
        <button
          className={cn(
            "whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium flex items-center",
            activeCategory === "all"
              ? "bg-primary text-white"
              : "bg-white text-foreground",
          )}
          onClick={() => setActiveCategory("all")}
        >
          <AllPlantsIcon size={16} className="mr-2" />
          All Plants
        </button>
        <button
          className={cn(
            "whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium flex items-center",
            activeCategory === "indoor"
              ? "bg-primary text-white"
              : "bg-white text-foreground",
          )}
          onClick={() => setActiveCategory("indoor")}
        >
          <IndoorIcon size={16} className="mr-2" />
          Indoor Plant
        </button>
        <button
          className={cn(
            "whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium flex items-center",
            activeCategory === "outdoor"
              ? "bg-primary text-white"
              : "bg-white text-foreground",
          )}
          onClick={() => setActiveCategory("outdoor")}
        >
          <SunIcon size={16} className="mr-2" />
          Outdoor
        </button>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-4 ml-[16px] mr-[16px]">
        {filteredPlants?.map((plant) => (
          <PlantCard key={plant.id} plant={plant} />
        ))}

        {filteredPlants?.length === 0 && (
          <div className="col-span-2 text-center py-8 text-muted-foreground">
            No plants found in this category
          </div>
        )}
      </div>
    </div>
  );
};

export default PlantCategories;
