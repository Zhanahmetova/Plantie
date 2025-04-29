import React, { useState } from "react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAddPlant } from "@/hooks/use-plants";
import CameraCapture from "@/components/camera-capture";
import MainLayout from "@/components/layouts/main-layout";
import PageHeader from "@/components/ui/page-header";
import { Slider } from "@/components/ui/slider";
import { PlusCircleIcon, XCircleIcon } from "@/lib/icons";

const AddPlantPage: React.FC = () => {
  const [, navigate] = useLocation();
  const addPlant = useAddPlant();
  
  const [isCapturingPhoto, setIsCapturingPhoto] = useState(false);
  const [plantImage, setPlantImage] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [wateringFrequency, setWateringFrequency] = useState(7);
  const [light, setLight] = useState("Bright Indirect");
  const [humidity, setHumidity] = useState("Medium");
  const [tempMin, setTempMin] = useState(18);
  const [tempMax, setTempMax] = useState(24);
  const [species, setSpecies] = useState("");
  const [family, setFamily] = useState("");
  const [category, setCategory] = useState("Indoor");
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleStartCapture = () => {
    setIsCapturingPhoto(true);
  };

  const handleImageCapture = (imageData: string) => {
    setPlantImage(imageData);
    setIsCapturingPhoto(false);
  };

  const handleCancelCapture = () => {
    setIsCapturingPhoto(false);
  };

  const handleCancelAddPlant = () => {
    navigate("/plants");
  };

  const handleRemoveImage = () => {
    setPlantImage(null);
  };

  const handleSavePlant = async () => {
    if (!name.trim() || !plantImage) {
      return;
    }
    
    setIsSaving(true);
    try {
      await addPlant.mutateAsync({
        name: name.trim(),
        image: plantImage,
        species: species.trim() || "Unknown",
        family: family.trim() || "Unknown",
        category,
        wateringFrequency,
        light,
        temperature: { min: tempMin, max: tempMax },
        humidity,
        notes: notes.trim() || null
      });
      
      // Navigate back to plants page after success
      navigate("/plants");
    } catch (error) {
      console.error("Failed to save plant:", error);
      setIsSaving(false);
    }
  };

  return (
    <MainLayout hideNavigation>
      <div className="p-4 space-y-4 pb-20">
        <PageHeader 
          title="Add New Plant" 
          showBackButton 
          onBackClick={handleCancelAddPlant}
        />
        
        {isCapturingPhoto ? (
          <Card className="p-4 bg-card/60 backdrop-blur-sm rounded-3xl overflow-hidden">
            <CameraCapture 
              onCapture={handleImageCapture} 
              onCancel={handleCancelCapture}
            />
          </Card>
        ) : (
          <Card className="p-6 bg-card/60 backdrop-blur-sm rounded-3xl overflow-hidden">
            <div className="space-y-6">
              {/* Plant Image */}
              <div className="space-y-2">
                <Label>Plant Photo</Label>
                {plantImage ? (
                  <div className="relative">
                    <div className="aspect-square w-full max-w-[200px] mx-auto rounded-xl overflow-hidden bg-muted">
                      <img 
                        src={plantImage} 
                        alt="Plant" 
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 bg-background/80 rounded-full"
                      onClick={handleRemoveImage}
                    >
                      <XCircleIcon className="h-5 w-5" />
                    </Button>
                  </div>
                ) : (
                  <Button 
                    onClick={handleStartCapture} 
                    variant="outline"
                    className="w-full h-24 flex flex-col gap-1 items-center justify-center border-dashed"
                  >
                    <PlusCircleIcon className="h-8 w-8 opacity-50" />
                    <span>Take a photo</span>
                  </Button>
                )}
              </div>
              
              {/* Required Fields */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Plant Name *</Label>
                  <Input
                    id="name"
                    placeholder="Enter plant name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="watering">Watering Frequency (Every {wateringFrequency} days)</Label>
                  <Slider
                    id="watering"
                    min={1}
                    max={30}
                    step={1}
                    value={[wateringFrequency]}
                    onValueChange={(value) => setWateringFrequency(value[0])}
                    className="py-4"
                  />
                </div>
              </div>
              
              {/* Optional Fields */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground">Optional Details</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="light">Light Preference</Label>
                  <Select value={light} onValueChange={setLight}>
                    <SelectTrigger id="light">
                      <SelectValue placeholder="Select light requirements" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low Light">Low Light</SelectItem>
                      <SelectItem value="Medium Indirect">Medium Indirect</SelectItem>
                      <SelectItem value="Bright Indirect">Bright Indirect</SelectItem>
                      <SelectItem value="Direct Sunlight">Direct Sunlight</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="humidity">Humidity Preference</Label>
                  <Select value={humidity} onValueChange={setHumidity}>
                    <SelectTrigger id="humidity">
                      <SelectValue placeholder="Select humidity requirements" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Temperature Range ({tempMin}°C - {tempMax}°C)</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="temp-min" className="text-xs">Minimum (°C)</Label>
                      <Slider
                        id="temp-min"
                        min={0}
                        max={30}
                        step={1}
                        value={[tempMin]}
                        onValueChange={(value) => setTempMin(Math.min(value[0], tempMax - 1))}
                        className="py-4"
                      />
                    </div>
                    <div>
                      <Label htmlFor="temp-max" className="text-xs">Maximum (°C)</Label>
                      <Slider
                        id="temp-max"
                        min={0}
                        max={40}
                        step={1}
                        value={[tempMax]}
                        onValueChange={(value) => setTempMax(Math.max(value[0], tempMin + 1))}
                        className="py-4"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Indoor">Indoor</SelectItem>
                      <SelectItem value="Outdoor">Outdoor</SelectItem>
                      <SelectItem value="Succulent">Succulent</SelectItem>
                      <SelectItem value="Herb">Herb</SelectItem>
                      <SelectItem value="Flower">Flower</SelectItem>
                      <SelectItem value="Vegetable">Vegetable</SelectItem>
                      <SelectItem value="Fruit">Fruit</SelectItem>
                      <SelectItem value="Tree">Tree</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="species">Species</Label>
                  <Input
                    id="species"
                    placeholder="E.g., Monstera deliciosa"
                    value={species}
                    onChange={(e) => setSpecies(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="family">Family</Label>
                  <Input
                    id="family"
                    placeholder="E.g., Araceae"
                    value={family}
                    onChange={(e) => setFamily(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Add any notes about your plant..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>
              </div>
              
              {/* Save Button */}
              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={handleCancelAddPlant}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSavePlant}
                  disabled={!name.trim() || !plantImage || isSaving}
                  className="flex-1 bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-500 hover:to-teal-600"
                >
                  {isSaving ? "Saving..." : "Save Plant"}
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </MainLayout>
  );
};

export default AddPlantPage;