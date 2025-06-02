import React, { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Camera, History, Info, AlertTriangle, CheckCircle } from "lucide-react";
import ARPlantScanner from "@/components/ar-plant-scanner";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";

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

export default function ARScanPage() {
  const [showScanner, setShowScanner] = useState(false);
  const [, navigate] = useLocation();

  // Fetch recent plant health scans
  const { data: recentScans, isLoading } = useQuery({
    queryKey: ["/api/plant-health-scans"],
  });

  // Save plant health scan
  const saveScanMutation = useMutation({
    mutationFn: async (scanData: any) => {
      const response = await fetch("/api/plant-health-scans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(scanData),
      });
      if (!response.ok) throw new Error("Failed to save scan");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/plant-health-scans"] });
    },
  });

  const handleScanComplete = async (result: PlantHealthResult) => {
    // The scan result is already saved by the AR scanner component
    // We just need to close the scanner
    setShowScanner(false);
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case "excellent": return "text-green-600 bg-green-50";
      case "good": return "text-green-500 bg-green-50";
      case "fair": return "text-yellow-500 bg-yellow-50";
      case "poor": return "text-orange-500 bg-orange-50";
      case "critical": return "text-red-500 bg-red-50";
      default: return "text-gray-500 bg-gray-50";
    }
  };

  if (showScanner) {
    return (
      <ARPlantScanner
        onClose={() => setShowScanner(false)}
        onScanComplete={handleScanComplete}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-xl font-bold">AR Plant Scanner</h1>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Scanner Introduction */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Camera className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-2">Instant Plant Health Diagnosis</h2>
                <p className="text-muted-foreground">
                  Use advanced plant recognition to identify diseases, pests, and care issues instantly
                </p>
              </div>
              <Button 
                onClick={() => setShowScanner(true)}
                size="lg" 
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Camera className="h-5 w-5 mr-2" />
                Start AR Scan
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <Info className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold">Plant Identification</h3>
                <p className="text-sm text-muted-foreground">
                  Identify plant species with high accuracy
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                  <AlertTriangle className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="font-semibold">Health Diagnosis</h3>
                <p className="text-sm text-muted-foreground">
                  Detect diseases, pests, and nutrient deficiencies
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold">Care Recommendations</h3>
                <p className="text-sm text-muted-foreground">
                  Get personalized treatment and care advice
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Scans */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Recent Scans
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading recent scans...
              </div>
            ) : recentScans && Array.isArray(recentScans) && recentScans.length > 0 ? (
              <div className="space-y-4">
                {recentScans.slice(0, 5).map((scan: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {scan.identifiedPlantName && (
                          <span className="font-medium">{scan.identifiedPlantName}</span>
                        )}
                        <Badge className={getHealthColor(scan.overallHealth)}>
                          {scan.overallHealth}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={scan.healthScore} className="flex-1 max-w-32" />
                        <span className="text-sm text-muted-foreground">{scan.healthScore}%</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(scan.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Camera className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No scans yet. Start your first AR scan to see results here.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}