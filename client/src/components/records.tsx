import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { usePlants } from "@/hooks/use-plants";
import { useRecords, useAddRecord } from "@/hooks/use-records";
import { PlusIcon, CameraIcon, BookIcon } from "@/lib/icons";
import { useIsMobile } from "@/hooks/use-mobile";
import RecordItem from "@/components/record-item";
import CameraCapture from "@/components/camera-capture";

interface RecordsProps {
  className?: string;
}

const Records: React.FC<RecordsProps> = ({ className }) => {
  const isMobile = useIsMobile();
  const { data: plants = [] } = usePlants();
  const { data: records = [] } = useRecords();
  const addRecord = useAddRecord();
  
  const [isCapturingPhoto, setIsCapturingPhoto] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [selectedPlantId, setSelectedPlantId] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const [isAddingRecord, setIsAddingRecord] = useState(false);

  const handleStartCapture = () => {
    setIsCapturingPhoto(true);
    setIsAddingRecord(true);
  };

  const handleImageCapture = (imageData: string) => {
    setCapturedImage(imageData);
    setIsCapturingPhoto(false);
  };

  const handleCancelCapture = () => {
    setIsCapturingPhoto(false);
    setCapturedImage(null);
    setSelectedPlantId(null);
    setNote("");
    setIsAddingRecord(false);
  };

  const handleSaveRecord = async () => {
    if (!capturedImage) return;
    
    try {
      await addRecord.mutateAsync({
        image: capturedImage,
        note,
        plantId: selectedPlantId,
        recordDate: new Date(),
      });
      
      // Reset form after successful submission
      setCapturedImage(null);
      setSelectedPlantId(null);
      setNote("");
      setIsAddingRecord(false);
    } catch (error) {
      console.error("Failed to save record:", error);
    }
  };

  return (
    <div className={cn("space-y-6 pb-20", className)}>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <BookIcon />
          Records
        </h1>
        <Button 
          onClick={handleStartCapture} 
          className="bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-500 hover:to-teal-600"
        >
          <PlusIcon className="mr-2" />
          Add Record
        </Button>
      </div>
      
      {isCapturingPhoto && (
        <Card className="p-4 bg-card/60 backdrop-blur-sm rounded-3xl overflow-hidden">
          <div className="mb-2 text-lg font-medium">Take a Photo</div>
          <CameraCapture 
            onCapture={handleImageCapture} 
            onCancel={handleCancelCapture}
          />
        </Card>
      )}
      
      {capturedImage && !isCapturingPhoto && (
        <Card className="p-4 bg-card/60 backdrop-blur-sm rounded-3xl overflow-hidden">
          <div className="mb-2 text-lg font-medium">Add New Record</div>
          <div className="space-y-4">
            <div className="aspect-w-4 aspect-h-3 rounded-xl overflow-hidden bg-muted">
              <img 
                src={capturedImage} 
                alt="Captured" 
                className="object-cover w-full h-full"
              />
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="plant" className="text-sm font-medium">
                Plant (optional)
              </label>
              <select
                id="plant"
                className="w-full p-2 border rounded-lg bg-background"
                value={selectedPlantId || ""}
                onChange={(e) => setSelectedPlantId(e.target.value ? Number(e.target.value) : null)}
              >
                <option value="">Select a plant</option>
                {plants.map((plant) => (
                  <option key={plant.id} value={plant.id}>
                    {plant.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="note" className="text-sm font-medium">
                Notes
              </label>
              <Textarea
                id="note"
                placeholder="Add notes about this record..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="min-h-[100px] resize-none"
              />
            </div>
            
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={handleCancelCapture}>
                Cancel
              </Button>
              <Button 
                onClick={handleSaveRecord} 
                className="bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-500 hover:to-teal-600"
              >
                Save Record
              </Button>
            </div>
          </div>
        </Card>
      )}
      
      {records.length === 0 && !isAddingRecord ? (
        <Card className="p-8 text-center bg-card/60 backdrop-blur-sm rounded-3xl">
          <div className="flex flex-col items-center gap-2">
            <BookIcon size={48} className="text-muted-foreground mb-2" />
            <h3 className="text-xl font-medium">No Records Yet</h3>
            <p className="text-muted-foreground max-w-xs mx-auto mb-4">
              Track your plants' growth and changes by taking photos and adding notes
            </p>
            <Button
              onClick={handleStartCapture}
              className="bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-500 hover:to-teal-600"
            >
              <CameraIcon className="mr-2" />
              Take Your First Photo
            </Button>
          </div>
        </Card>
      ) : (
        !isAddingRecord && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {records.map((record) => (
              <RecordItem key={record.id} record={record} />
            ))}
          </div>
        )
      )}
    </div>
  );
};

export default Records;