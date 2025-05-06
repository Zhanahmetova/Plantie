import React, { useState } from "react";
import { cn } from "@/lib/utils";
import PlantCard from "@/components/ui/plant-card";
import { usePlants } from "@/hooks/use-plants";
import { AllPlantsIcon, IndoorIcon, SunIcon } from "@/lib/icons";
import MainLayout from "@/components/layouts/main-layout";
import PageHeader from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "@/lib/icons";
import { useLocation } from "wouter";

const PlantsPage: React.FC = () => {
  const [, navigate] = useLocation();
  const { data: plants, isLoading } = usePlants();
  const [activeCategory, setActiveCategory] = useState<"all" | "indoor" | "outdoor">("all");
  
  const filteredPlants = plants?.filter(plant => {
    if (activeCategory === "all") return true;
    return plant.category === activeCategory;
  });
  
  const handleAddPlant = () => {
    navigate("/add-plant");
  };
  
  return (
    <MainLayout>
      <div className="p-4 space-y-4">
        <PageHeader title="My Plants" showBackButton onBackClick={() => navigate("/")} />
        
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-lg text-foreground">All Plants</h2>
          <Button
            onClick={handleAddPlant}
            size="sm"
            className="bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-500 hover:to-teal-600"
          >
            <PlusIcon className="mr-2" size={16} />
            Add Plant
          </Button>
        </div>
        
        <div className="flex space-x-3 mb-4 overflow-x-auto pb-2">
          <button 
            className={cn(
              "whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium flex items-center",
              activeCategory === "all" 
                ? "bg-primary text-white" 
                : "bg-white text-foreground"
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
                : "bg-white text-foreground"
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
                : "bg-white text-foreground"
            )}
            onClick={() => setActiveCategory("outdoor")}
          >
            <SunIcon size={16} className="mr-2" />
            Outdoor
          </button>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-2 gap-3 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-40 bg-muted rounded-xl"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 pb-20">
            {filteredPlants?.map((plant) => (
              <PlantCard key={plant.id} plant={plant} />
            ))}
            
            {filteredPlants?.length === 0 && (
              <div className="col-span-2 text-center py-8 text-muted-foreground">
                No plants found in this category
              </div>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default PlantsPage;