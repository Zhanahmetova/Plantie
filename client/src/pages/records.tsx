import React from "react";
import MainLayout from "@/components/layouts/main-layout";
import RecordComponent from "@/components/records";

const RecordsPage: React.FC = () => {
  return (
    <MainLayout>
      <RecordComponent />
    </MainLayout>
  );
};

export default RecordsPage;