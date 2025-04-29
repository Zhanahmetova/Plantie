import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { usePlants } from "@/hooks/use-plants";
import { useAddRecord } from "@/hooks/use-records";
import CameraCapture from "@/components/camera-capture";
import MainLayout from "@/components/layouts/main-layout";
import PageHeader from "@/components/ui/page-header";
import { format } from "date-fns";

const AddRecordPage: React.FC = () => {
  const [, navigate] = useLocation();
  const { data: plants = [] } = usePlants();
  const addRecord = useAddRecord();
  
  const [stage, setStage] = useState<"capture" | "form">("capture");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [selectedPlantId, setSelectedPlantId] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const [recordDate, setRecordDate] = useState(new Date());
  const [isSaving, setIsSaving] = useState(false);

  // Start with camera open automatically
  useEffect(() => {
    setStage("capture");
  }, []);

  const handleImageCapture = (imageData: string) => {
    setCapturedImage(imageData);
    setStage("form");
  };

  const handleCancelCapture = () => {
    navigate("/records");
  };

  const handleRetakePhoto = () => {
    setCapturedImage(null);
    setStage("capture");
  };

  const handleSaveRecord = async () => {
    if (!capturedImage) return;
    
    setIsSaving(true);
    try {
      await addRecord.mutateAsync({
        image: capturedImage,
        note: note.trim() ? note.trim() : undefined,
        plantId: selectedPlantId,
        recordDate,
      });
      
      // Navigate back to records page after success
      navigate("/records");
    } catch (error) {
      console.error("Failed to save record:", error);
      setIsSaving(false);
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = new Date(e.target.value);
    if (!isNaN(date.getTime())) {
      setRecordDate(date);
    }
  };

  return (
    <MainLayout hideNavigation>
      <div className="p-4 space-y-4">
        <PageHeader 
          title={stage === "capture" ? "Take a Photo" : "Add New Record"} 
          showBackButton 
          onBackClick={handleCancelCapture}
        />
        {stage === "capture" ? (
          <Card className="p-4 bg-card/60 backdrop-blur-sm rounded-3xl overflow-hidden">
            <CameraCapture 
              onCapture={handleImageCapture} 
              onCancel={handleCancelCapture}
            />
          </Card>
        ) : (
          capturedImage && (
            <Card className="p-4 bg-card/60 backdrop-blur-sm rounded-3xl overflow-hidden">
              <div className="space-y-4">
                <div className="aspect-w-4 aspect-h-3 rounded-xl overflow-hidden bg-muted">
                  <img 
                    src={capturedImage} 
                    alt="Captured" 
                    className="object-cover w-full h-full"
                  />
                </div>
                
                <div className="grid gap-3">
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
                      Notes (optional)
                    </label>
                    <Textarea
                      id="note"
                      placeholder="Write a note..."
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      className="min-h-[100px] resize-none"
                    />
                  </div>

                  <div className="grid gap-2">
                    <label htmlFor="date" className="text-sm font-medium">
                      Date
                    </label>
                    <input
                      id="date"
                      type="date"
                      className="w-full p-2 border rounded-lg bg-background"
                      value={format(recordDate, "yyyy-MM-dd")}
                      onChange={handleDateChange}
                    />
                  </div>
                  
                  <div className="flex gap-2 justify-end mt-4">
                    <Button variant="outline" onClick={handleRetakePhoto}>
                      Retake Photo
                    </Button>
                    <Button 
                      onClick={handleSaveRecord} 
                      disabled={isSaving}
                      className="bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-500 hover:to-teal-600"
                    >
                      {isSaving ? "Saving..." : "Save"}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          )
        )}
      </div>
    </MainLayout>
  );
};

export default AddRecordPage;