import React from "react";
import { cn, formatDate, addDays } from "@/lib/utils";
import { Plant, PlantRecord } from "@shared/schema";
import { 
  WateringCanIcon, 
  SunIcon, 
  TemperatureIcon,
  HumidityIcon, 
  LeafIcon,
  BellIcon,
  BackIcon,
  CameraIcon,
  PlusIcon,
  BookIcon
} from "@/lib/icons";
import { useLocation } from "wouter";
import { usePlantRecords } from "@/hooks/use-records";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface PlantDetailProps {
  plant: Plant;
  className?: string;
}

const PlantDetail: React.FC<PlantDetailProps> = ({
  plant,
  className
}) => {
  const [, navigate] = useLocation();
  
  // Check if plant is an array and get the first item
  const plantData = Array.isArray(plant) ? plant[0] : plant;
  
  // Make sure plantData.id is valid and numeric
  const plantId = plantData && plantData.id ? Number(plantData.id) : null;
  
  console.log("PlantDetail component - plantId:", plantId);
  console.log("PlantDetail component - plant:", plant);
  console.log("PlantDetail component - plantData:", plantData);
  
  // Only fetch plant records if we have a valid plantId
  const { data: rawRecords = [], isLoading: isLoadingRecords } = usePlantRecords(plantId);
  
  // Log records for debugging
  React.useEffect(() => {
    console.log('Plant ID for records:', plantId);
    console.log('Raw Plant Records:', rawRecords);
    console.log('Plant object:', plant);
  }, [plantId, rawRecords, plant]);
  
  // Sort records by date (newest first)
  const records = React.useMemo(() => {
    return [...rawRecords].sort((a, b) => {
      const dateA = new Date(a.recordDate).getTime();
      const dateB = new Date(b.recordDate).getTime();
      return dateB - dateA; // Descending order (newest first)
    });
  }, [rawRecords]);
  
  // Safely handle dates
  const getNextWateringDate = () => {
    try {
      // Check if lastWatered is valid
      if (plant.lastWatered) {
        // Convert to date object if it's a string
        const lastWateredDate = typeof plant.lastWatered === 'string' 
          ? new Date(plant.lastWatered) 
          : plant.lastWatered;
        
        // Check if the conversion resulted in a valid date
        if (lastWateredDate instanceof Date && !isNaN(lastWateredDate.getTime())) {
          return addDays(lastWateredDate, plant.wateringFrequency || 7);
        }
      }
      
      // If lastWatered is null, undefined, or invalid date, use current date
      return addDays(new Date(), plant.wateringFrequency || 7);
    } catch (error) {
      console.error("Error calculating next watering date:", error);
      // Fallback to current date + default 7 days watering frequency
      return addDays(new Date(), 7);
    }
  };
  
  const nextWateringDate = getNextWateringDate();
  
  const handleAddRecord = () => {
    // Make sure plant.id is valid before adding it to the URL
    if (plant && plant.id) {
      navigate(`/add-record?plantId=${plant.id}`);
    } else {
      navigate('/add-record');
    }
  };
  
  return (
    <div className={cn("pb-20", className)}>
      {/* Top Section with Image and Plant Name */}
      <div className="relative">
        <div className="absolute top-6 left-4 z-10">
          <button 
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm"
            onClick={() => navigate("/")}
          >
            <BackIcon className="text-foreground" />
          </button>
        </div>
        
        {/* Plant Image */}
        <div className="h-[300px] bg-mint-light flex items-center justify-center">
          {plant.image ? (
            <img 
              src={plant.image} 
              alt={plant.name} 
              className="h-full w-full object-cover"
            />
          ) : (
            <svg 
              viewBox="0 0 100 100" 
              className="h-64 w-auto" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M30,80 C30,50 50,20 50,20 C50,20 70,50 70,80 C70,90 60,95 50,95 C40,95 30,90 30,80 Z" fill="#4CAF50" />
            </svg>
          )}
        </div>
      </div>

      {/* Plant Information Section */}
      <div className="bg-white p-5 rounded-t-2xl -mt-6 relative z-10">
        <h1 className="text-2xl font-bold mb-4">{plant.name}</h1>
        
        {/* Care Information */}
        <Card className="mb-6">
          <div className="p-4">
            <h2 className="text-lg font-medium mb-3">Care Information</h2>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-mint-light flex items-center justify-center mr-3">
                    <WateringCanIcon className="text-accent" size={16} />
                  </div>
                  <span className="text-sm">Last Watered</span>
                </div>
                <span className="text-sm font-medium">
                  {formatDate(plant.lastWatered || new Date())}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-mint-light flex items-center justify-center mr-3">
                    <WateringCanIcon className="text-accent" size={16} />
                  </div>
                  <span className="text-sm">Next Watering</span>
                </div>
                <span className="text-sm font-medium">
                  {formatDate(nextWateringDate)}
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="bg-muted rounded-xl p-3">
                <div className="flex flex-col items-center">
                  <SunIcon className="text-yellow-500 mb-1" size={20} />
                  <span className="text-xs text-center">
                    {plant.light || 'Light not set'}
                  </span>
                </div>
              </div>
              
              <div className="bg-muted rounded-xl p-3">
                <div className="flex flex-col items-center">
                  <HumidityIcon className="text-blue-500 mb-1" size={20} />
                  <span className="text-xs text-center">
                    {plant.humidity || 'Humidity not set'}
                  </span>
                </div>
              </div>
              
              <div className="bg-muted rounded-xl p-3">
                <div className="flex flex-col items-center">
                  <TemperatureIcon className="text-red-500 mb-1" size={20} />
                  <span className="text-xs text-center">
                    {plant.temperature && typeof plant.temperature === 'object' 
                      ? `${plant.temperature.min}-${plant.temperature.max}°C`
                      : 'Temperature not set'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>
        
        {/* Add Record Button */}
        <Button 
          onClick={handleAddRecord}
          className="w-full mb-6 bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-500 hover:to-teal-600"
        >
          <CameraIcon className="mr-2" size={18} />
          Add Record
        </Button>
        
        {/* Growth Timeline */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-medium flex items-center gap-2">
              <BookIcon size={20} />
              Growth History
            </h2>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleAddRecord}
              className="text-accent hover:text-accent/90 p-1 h-8"
            >
              <PlusIcon className="mr-1" size={16} />
              Add
            </Button>
          </div>
          
          {isLoadingRecords ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <Card key={i} className="overflow-hidden animate-pulse border border-border/50">
                  <div className="flex">
                    <div className="w-24 h-24 bg-muted"></div>
                    <div className="flex-1 p-3">
                      <div className="space-y-2">
                        <div className="h-4 bg-muted rounded-md w-3/4"></div>
                        <div className="h-4 bg-muted rounded-md w-1/2"></div>
                        <div className="h-4 bg-muted rounded-md w-1/4 ml-auto"></div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : records.length === 0 ? (
            <Card className="p-6 text-center border border-dashed">
              <div className="flex flex-col items-center justify-center py-8">
                <CameraIcon className="w-12 h-12 text-muted-foreground mb-3" />
                <p className="text-muted-foreground mb-3">No growth records yet</p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleAddRecord}
                  className="text-accent border-accent hover:bg-accent/10"
                >
                  <PlusIcon className="mr-1" size={16} />
                  Add First Record
                </Button>
              </div>
            </Card>
          ) : (
            <div className="space-y-4">
              {/* Timeline dots */}
              <div className="relative">
                <div className="absolute left-12 top-0 bottom-0 w-0.5 bg-gradient-to-b from-emerald-400 to-teal-500 z-0"></div>
                <div className="space-y-6 relative z-10">
                  {records.map((record: PlantRecord) => (
                    <div key={record.id} className="flex">
                      <div className="w-24 h-24 rounded-lg overflow-hidden border-4 border-white shadow-md relative">
                        {/* Timeline dot */}
                        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 z-20 shadow"></div>
                        <img 
                          src={record.image} 
                          alt="Plant record" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 pl-4">
                        <Card className="p-3 bg-card/80 backdrop-blur-sm shadow-sm border border-border/50">
                          <div className="flex flex-col">
                            <p className="text-xs font-medium text-accent mb-1">
                              {formatDate(record.recordDate)}
                            </p>
                            <p className="text-sm">{record.note || "No notes"}</p>
                          </div>
                        </Card>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Notes Section */}
        {plant.notes && (
          <Card className="p-4">
            <h3 className="font-medium text-foreground mb-2">Notes</h3>
            <p className="text-sm text-muted-foreground">{plant.notes}</p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PlantDetail;
