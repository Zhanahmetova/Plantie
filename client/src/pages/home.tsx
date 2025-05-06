import React, { useState } from "react";
import MainLayout from "@/components/layouts/main-layout";
import DatePicker from "@/components/ui/date-picker";
import DailySummary from "@/components/daily-summary";
import WeatherCard from "@/components/weather-card";
import PlantCategories from "@/components/plant-categories";
import { BellIcon, LeafIcon } from "@/lib/icons";
import { format } from "date-fns";

const Home: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  // Function to load tasks for the selected date
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    // Additional tasks can be loaded here based on the selected date
  };
  
  return (
    <MainLayout>
      <div className="nature-bg min-h-screen relative">
        {/* Decorative leaf elements */}
        <div className="absolute top-28 right-2 opacity-10 rotate-45 pointer-events-none">
          <LeafIcon size={60} className="text-primary" />
        </div>
        <div className="absolute bottom-20 left-2 opacity-10 -rotate-12 pointer-events-none">
          <LeafIcon size={50} className="text-primary" />
        </div>
        
        <header className="px-1 pt-7 pb-3">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="font-bold text-2xl text-foreground">Plant Care Assistant</h1>
              <p className="text-sm text-muted-foreground">
                {format(selectedDate, "EEEE, MMM dd, yyyy")}
              </p>
            </div>
            <div className="w-11 h-11 bg-white rounded-full flex items-center justify-center shadow-sm">
              <BellIcon className="text-muted-foreground" />
            </div>
          </div>
        </header>
        
        <DatePicker 
          selectedDate={selectedDate}
          onDateSelect={handleDateSelect}
          className="px-1 pb-1"
        />
        
        <DailySummary className="mb-5" selectedDate={selectedDate} />
        
        <WeatherCard className="mb-7" />
        
        <PlantCategories />
      </div>
    </MainLayout>
  );
};

export default Home;
