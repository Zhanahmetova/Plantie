import React, { useState, useRef, useCallback, useEffect } from "react";
import { Camera, X, Scan, Loader2, AlertTriangle, CheckCircle, Info, Upload, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useLocation } from "wouter";
import { PlantIdentificationCard } from "./plant-identification-card";

interface PlantHealthResult {
  scanId?: number;
  overallHealth: "excellent" | "good" | "fair" | "poor" | "critical";
  healthScore: number;
  issues: {
    type: "disease" | "pest" | "nutrient" | "watering" | "light";
    severity: "low" | "medium" | "high";
    name: string;
    description: string;
    treatment: string;
    confidence: number;
  }[];
  recommendations: string[];
  identifiedPlant?: {
    name: string;
    species: string;
    confidence: number;
  };
}

interface ARPlantScannerProps {
  onClose: () => void;
  onScanComplete: (result: PlantHealthResult) => void;
  className?: string;
}

export function ARPlantScanner({ onClose, onScanComplete, className }: ARPlantScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [scanResult, setScanResult] = useState<PlantHealthResult | null>(null);
  const [fullScanData, setFullScanData] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [, navigate] = useLocation();

  // Initialize camera
  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: "environment", // Use back camera for mobile
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setError("Camera access denied. Please enable camera permissions.");
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageData = e.target?.result as string;
      if (imageData) {
        performScan(imageData);
      }
    };
    reader.readAsDataURL(file);
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const performScan = async (imageData: string) => {
    setIsScanning(true);
    setScanProgress(0);
    setError(null);
    
    try {
      const result = await analyzePlantHealth(imageData);
      setScanResult(result);
      onScanComplete(result);
      
      // Stop camera before navigation
      stopCamera();
      
      // Navigate to results page after successful scan
      if (result.scanId) {
        navigate(`/scan-results/${result.scanId}`);
      }
    } catch (err) {
      setError("Failed to analyze plant. Please try again.");
    } finally {
      setIsScanning(false);
      setScanProgress(0);
    }
  };

  const captureFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return null;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    if (!context) return null;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);
    
    return canvas.toDataURL('image/jpeg', 0.8);
  }, []);

  const analyzePlantHealth = async (imageData: string): Promise<PlantHealthResult> => {
    setScanProgress(25);
    
    try {
      // Send image to backend for Plant.ID analysis
      const response = await fetch("/api/plant-health-scans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageData }),
      });
      
      setScanProgress(75);
      
      if (!response.ok) {
        const errorData = await response.json();
        // Handle "this is not a plant" error specifically
        if (errorData.message === "this is not a plant") {
          const detectedObject = errorData.detectedObject || "unknown object";
          throw new Error(`This is not a plant. Detected: ${detectedObject}. Please scan a plant to continue.`);
        }
        throw new Error(errorData.message || "Failed to analyze plant");
      }
      
      const result = await response.json();
      setScanProgress(100);
      
      // Store full scan data for the identification card
      setFullScanData(result);
      
      // Transform backend response to match frontend interface
      return {
        scanId: result.id,
        overallHealth: result.overallHealth,
        healthScore: result.healthScore,
        issues: result.issues,
        recommendations: result.recommendations,
        identifiedPlant: result.identifiedName ? {
          name: result.identifiedName,
          species: result.identifiedSpecies || "",
          confidence: (result.identificationConfidence || 0) / 100
        } : undefined
      };
    } catch (error) {
      console.error("Plant analysis failed:", error);
      throw error;
    }
  };

  const handleScan = async () => {
    if (!videoRef.current) return;
    
    const imageData = captureFrame();
    if (!imageData) {
      setError("Failed to capture image");
      return;
    }
    
    performScan(imageData);
  };



  if (scanResult && fullScanData) {
    return (
      <PlantIdentificationCard
        scan={fullScanData}
        onClose={() => {
          stopCamera();
          onClose();
        }}
        onSaveAsPlant={() => {
          // TODO: Implement save as plant functionality
          stopCamera();
          onClose();
        }}
      />
    );
  }

  return (
    <div className={cn("fixed inset-0 bg-black z-50 flex flex-col", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black text-white">
        <h2 className="text-lg font-semibold">AR Plant Scanner</h2>
        <Button variant="ghost" size="sm" onClick={() => { stopCamera(); onClose(); }} className="text-white hover:bg-gray-800">
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Camera View */}
      <div className="flex-1 relative overflow-hidden">
        {error ? (
          <div className="flex items-center justify-center h-full bg-gray-900 text-white">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p>{error}</p>
              <Button onClick={startCamera} className="mt-4" variant="outline">
                Retry Camera Access
              </Button>
            </div>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            
            {/* Scanning Overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                {/* Scanning Frame */}
                <div className="w-64 h-64 border-2 border-white border-dashed rounded-lg relative">
                  <div className="absolute top-0 left-0 w-8 h-8 border-l-4 border-t-4 border-green-500"></div>
                  <div className="absolute top-0 right-0 w-8 h-8 border-r-4 border-t-4 border-green-500"></div>
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-l-4 border-b-4 border-green-500"></div>
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-r-4 border-b-4 border-green-500"></div>
                  
                  {isScanning && (
                    <div className="absolute inset-0 bg-green-500 bg-opacity-20 rounded-lg animate-pulse">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 className="h-8 w-8 text-white animate-spin" />
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Instructions */}
                <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 text-center text-white">
                  <p className="text-sm">
                    {isScanning ? "Analyzing plant health..." : "Position plant within the frame"}
                  </p>
                  {isScanning && (
                    <div className="mt-2">
                      <Progress value={scanProgress} className="w-64" />
                      <p className="text-xs mt-1">{scanProgress}% complete</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Controls */}
      <div className="p-6 bg-black text-white">
        <div className="flex justify-center gap-4">
          <Button
            onClick={handleScan}
            disabled={isScanning || !!error}
            size="lg"
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-full"
          >
            {isScanning ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Scanning...
              </>
            ) : (
              <>
                <Scan className="h-5 w-5 mr-2" />
                Scan Plant
              </>
            )}
          </Button>
          
          <Button
            onClick={triggerFileUpload}
            disabled={isScanning}
            size="lg"
            variant="outline"
            className="border-green-600 text-green-400 hover:bg-green-600 hover:text-white px-6 py-3 rounded-full"
          >
            <Upload className="h-5 w-5 mr-2" />
            Upload Photo
          </Button>
        </div>
        
        <p className="text-center text-sm text-gray-400 mt-4">
          Point your camera at a plant and tap scan, or upload a photo for instant health diagnosis
        </p>
        
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>

      {/* Hidden canvas for image capture */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}

export default ARPlantScanner;