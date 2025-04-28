import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { CameraIcon, BackIcon, QuestionIcon } from "@/lib/icons";
import { useLocation } from "wouter";

interface PlantIdentificationProps {
  className?: string;
}

const PlantIdentification: React.FC<PlantIdentificationProps> = ({
  className
}) => {
  const [, navigate] = useLocation();
  const [isTaking, setIsTaking] = useState(false);
  
  const handleTakePicture = () => {
    setIsTaking(true);
    
    // Simulate taking a picture
    setTimeout(() => {
      setIsTaking(false);
      // Show result, in a real app we would process the image
      // with an actual plant identification API
      navigate("/plants/1");
    }, 1500);
  };
  
  return (
    <div className={cn(
      "relative h-screen bg-mint-dark flex items-center justify-center",
      className
    )}>
      <div className="absolute top-6 left-4 z-10">
        <button 
          className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm"
          onClick={() => navigate("/")}
        >
          <BackIcon className="text-foreground" />
        </button>
      </div>
      
      <div className="absolute top-6 right-4 z-10">
        <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
          <QuestionIcon className="text-foreground" />
        </button>
      </div>
      
      <h2 className="absolute top-16 text-center w-full text-white font-semibold text-lg">
        Plant Identification
      </h2>
      
      <div className="h-[300px] w-[300px] relative flex items-center justify-center">
        <div className="absolute h-full w-full border-4 border-white rounded-3xl"></div>
        <div className="absolute top-0 left-0 h-16 w-16 border-t-4 border-l-4 border-primary rounded-tl-3xl"></div>
        <div className="absolute top-0 right-0 h-16 w-16 border-t-4 border-r-4 border-primary rounded-tr-3xl"></div>
        <div className="absolute bottom-0 left-0 h-16 w-16 border-b-4 border-l-4 border-primary rounded-bl-3xl"></div>
        <div className="absolute bottom-0 right-0 h-16 w-16 border-b-4 border-r-4 border-primary rounded-br-3xl"></div>
        <p className="text-white text-center">Center plant in frame</p>
      </div>
      
      <div className="absolute bottom-24 w-full flex justify-center">
        <button 
          className={cn(
            "w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg transition-all",
            isTaking && "scale-95"
          )}
          onClick={handleTakePicture}
          disabled={isTaking}
        >
          <div className={cn(
            "w-12 h-12 bg-primary rounded-full flex items-center justify-center",
            isTaking && "animate-pulse"
          )}>
            {isTaking && (
              <CameraIcon className="text-white" />
            )}
          </div>
        </button>
      </div>
      
      <div className="absolute bottom-8 w-full flex justify-center">
        <p className="text-white text-sm">
          {isTaking ? "Identifying..." : "Tap to identify"}
        </p>
      </div>
    </div>
  );
};

export default PlantIdentification;
