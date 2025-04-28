import React from "react";
import { useParams } from "wouter";
import MainLayout from "@/components/layouts/main-layout";
import PlantDetail from "@/components/plant-detail";
import { usePlant } from "@/hooks/use-plants";

const PlantDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const plantId = id ? parseInt(id) : null;
  const { data: plant, isLoading } = usePlant(plantId);
  
  if (isLoading || !plant) {
    return (
      <MainLayout hideNavigation>
        <div className="relative h-[440px] bg-mint-light flex items-center justify-center animate-pulse">
          <div className="w-64 h-64 bg-white opacity-20 rounded-full"></div>
        </div>
        <div className="bg-white p-5 rounded-t-2xl -mt-6 relative z-10 animate-pulse">
          <div className="h-16 bg-muted rounded-xl mb-4"></div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="h-20 bg-muted rounded-xl"></div>
            <div className="h-20 bg-muted rounded-xl"></div>
            <div className="h-20 bg-muted rounded-xl"></div>
            <div className="h-20 bg-muted rounded-xl"></div>
          </div>
          <div className="h-32 bg-muted rounded-xl mb-4"></div>
          <div className="h-12 bg-muted rounded-xl"></div>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout hideNavigation>
      <PlantDetail plant={plant} />
    </MainLayout>
  );
};

export default PlantDetailPage;
