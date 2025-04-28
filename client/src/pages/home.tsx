import React, { useState } from "react";
import MainLayout from "@/components/layouts/main-layout";
import DatePicker from "@/components/ui/date-picker";
import DailySummary from "@/components/daily-summary";
import WeatherCard from "@/components/weather-card";
import PlantCategories from "@/components/plant-categories";
import { BellIcon } from "@/lib/icons";
import { format } from "date-fns";

const Home: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  return (
    <MainLayout>
      <header className="px-1 pt-6 pb-2">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="font-bold text-2xl text-foreground">PlantPal</h1>
            <p className="text-sm text-muted-foreground">
              {format(selectedDate, "EEEE, MMM dd, yyyy")}
            </p>
          </div>
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
            <BellIcon className="text-muted-foreground" />
          </div>
        </div>
      </header>
      
      <DatePicker 
        selectedDate={selectedDate}
        onDateSelect={setSelectedDate}
        className="px-1"
      />
      
      <DailySummary className="mb-4" />
      
      <WeatherCard className="mb-6" />
      
      <PlantCategories />
    </MainLayout>
  );
};

export default Home;
