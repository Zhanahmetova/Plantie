import React, { useState } from "react";
import MainLayout from "@/components/layouts/main-layout";
import DatePicker from "@/components/ui/date-picker";
import DailySummary from "@/components/daily-summary";
import WeatherCard from "@/components/weather-card";
import PlantCategories from "@/components/plant-categories";
import { BellIcon, LeafIcon } from "@/lib/icons";
import { format } from "date-fns";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Scan, ChevronRight } from "lucide-react";

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
        <div className="absolute top-5 right-2 opacity-10 rotate-45 pointer-events-none">
          <LeafIcon size={60} className="text-primary" />
        </div>
        <div className="absolute bottom-[33%] left-5 opacity-10 -rotate-12 pointer-events-none">
          <LeafIcon size={50} className="text-primary" />
        </div>

        <header className="px-1 pt-7 pb-3">
          <div className="flex justify-between items-center ml-[16px] mr-[16px]">
            <div>
              <h1 className="font-bold text-2xl text-foreground">
                Plant Care Assistant
              </h1>
              <p className="text-sm text-muted-foreground">
                {format(selectedDate, "EEEE, MMM dd, yyyy")}
              </p>
            </div>
          </div>
        </header>

        <DatePicker
          selectedDate={selectedDate}
          onDateSelect={handleDateSelect}
          className="pb-1"
        />

        <div className="px-4">
          <DailySummary className="mb-5" selectedDate={selectedDate} />

          <WeatherCard className="mb-5" />

          {/* AR Plant Scanner Card */}
          <div className="mb-7">
            <Link href="/ar-scan">
              <Card className="bg-gradient-to-r from-green-500 to-green-600 border-0 text-white hover:from-green-600 hover:to-green-700 transition-all duration-200 cursor-pointer transform hover:scale-[1.02]">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-white/20 rounded-full">
                        <Scan className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-white">
                          AR Plant Scanner
                        </h3>
                        <p className="text-green-100 text-sm">
                          Scan plants for instant health diagnosis
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-white/80" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>

          <PlantCategories />
        </div>
      </div>
    </MainLayout>
  );
};

export default Home;
