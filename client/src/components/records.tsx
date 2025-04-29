import React from "react";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useRecords } from "@/hooks/use-records";
import { PlusIcon, CameraIcon, BookIcon } from "@/lib/icons";
import RecordItem from "@/components/record-item";
import type { PlantRecord } from "@shared/schema";

interface RecordsProps {
  className?: string;
}

const Records: React.FC<RecordsProps> = ({ className }) => {
  const [, navigate] = useLocation();
  const { data: records = [] } = useRecords();
  
  const navigateToAddRecord = () => {
    navigate('/add-record');
  };

  return (
    <div className={cn("space-y-6 pb-20", className)}>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <BookIcon />
          Records
        </h1>
        <Button 
          onClick={navigateToAddRecord} 
          className="bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-500 hover:to-teal-600"
        >
          <PlusIcon className="mr-2" />
          Add Record
        </Button>
      </div>
      
      {Array.isArray(records) && records.length === 0 ? (
        <Card className="p-8 text-center bg-card/60 backdrop-blur-sm rounded-3xl">
          <div className="flex flex-col items-center gap-2">
            <BookIcon size={48} className="text-muted-foreground mb-2" />
            <h3 className="text-xl font-medium">No Records Yet</h3>
            <p className="text-muted-foreground max-w-xs mx-auto mb-4">
              Track your plants' growth and changes by taking photos and adding notes
            </p>
            <Button
              onClick={navigateToAddRecord}
              className="bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-500 hover:to-teal-600"
            >
              <CameraIcon className="mr-2" />
              Take Your First Photo
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.isArray(records) && records.map((record: PlantRecord) => (
            <RecordItem key={record.id} record={record} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Records;