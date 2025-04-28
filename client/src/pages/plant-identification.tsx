import React from "react";
import MainLayout from "@/components/layouts/main-layout";
import PlantIdentification from "@/components/plant-identification";

const PlantIdentificationPage: React.FC = () => {
  return (
    <MainLayout hideNavigation>
      <PlantIdentification />
    </MainLayout>
  );
};

export default PlantIdentificationPage;
