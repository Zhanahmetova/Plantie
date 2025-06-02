import React, { useState, useRef, useCallback, useEffect } from "react";
import { Camera, X, Scan, Loader2, AlertTriangle, CheckCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface PlantHealthResult {
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
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
        throw new Error(errorData.message || "Failed to analyze plant");
      }
      
      const result = await response.json();
      setScanProgress(100);
      
      // Transform backend response to match frontend interface
      return {
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
    
    setIsScanning(true);
    setScanProgress(0);
    setError(null);
    
    try {
      const imageData = captureFrame();
      if (!imageData) {
        throw new Error("Failed to capture image");
      }
      
      const result = await analyzePlantHealth(imageData);
      setScanResult(result);
      onScanComplete(result);
    } catch (err) {
      setError("Failed to analyze plant. Please try again.");
    } finally {
      setIsScanning(false);
      setScanProgress(0);
    }
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case "excellent": return "text-green-600";
      case "good": return "text-green-500";
      case "fair": return "text-yellow-500";
      case "poor": return "text-orange-500";
      case "critical": return "text-red-500";
      default: return "text-gray-500";
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "low": return "bg-yellow-100 text-yellow-800";
      case "medium": return "bg-orange-100 text-orange-800";
      case "high": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (scanResult) {
    return (
      <div className={cn("fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4", className)}>
        <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xl font-bold">Plant Health Analysis</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Overall Health Score */}
            <div className="text-center space-y-2">
              <div className={cn("text-3xl font-bold", getHealthColor(scanResult.overallHealth))}>
                {scanResult.healthScore}%
              </div>
              <div className="text-sm text-muted-foreground uppercase tracking-wide">
                {scanResult.overallHealth} Health
              </div>
              <Progress value={scanResult.healthScore} className="w-full" />
            </div>

            {/* Plant Identification */}
            {scanResult.identifiedPlant && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-900">Plant Identified</span>
                </div>
                <p className="text-blue-800">
                  <strong>{scanResult.identifiedPlant.name}</strong> ({scanResult.identifiedPlant.species})
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Confidence: {Math.round(scanResult.identifiedPlant.confidence * 100)}%
                </p>
              </div>
            )}

            {/* Health Issues */}
            {scanResult.issues.length > 0 && (
              <div>
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  Detected Issues
                </h3>
                <div className="space-y-3">
                  {scanResult.issues.map((issue, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{issue.name}</h4>
                        <Badge className={getSeverityColor(issue.severity)}>
                          {issue.severity} severity
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{issue.description}</p>
                      <div className="bg-green-50 p-3 rounded">
                        <p className="text-sm text-green-800">
                          <strong>Treatment:</strong> {issue.treatment}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Confidence: {Math.round(issue.confidence * 100)}%
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            <div>
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Care Recommendations
              </h3>
              <ul className="space-y-2">
                {scanResult.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-sm">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex gap-2">
              <Button onClick={() => setScanResult(null)} variant="outline" className="flex-1">
                Scan Again
              </Button>
              <Button onClick={onClose} className="flex-1">
                Done
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn("fixed inset-0 bg-black z-50 flex flex-col", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black text-white">
        <h2 className="text-lg font-semibold">AR Plant Scanner</h2>
        <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-gray-800">
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
        <div className="flex justify-center">
          <Button
            onClick={handleScan}
            disabled={isScanning || !!error}
            size="lg"
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-full"
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
        </div>
        
        <p className="text-center text-sm text-gray-400 mt-4">
          Point your camera at a plant and tap scan for instant health diagnosis
        </p>
      </div>

      {/* Hidden canvas for image capture */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}

export default ARPlantScanner;