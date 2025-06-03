import { useLocation, useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, CheckCircle, AlertTriangle, Info, Camera, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

interface PlantHealthScan {
  id: number;
  userId: number;
  plantId: number | null;
  image: string;
  overallHealth: string;
  healthScore: number;
  issues: Array<{
    type: string;
    severity: string;
    name: string;
    description: string;
    treatment: string;
    confidence: number;
  }>;
  recommendations: string[];
  identifiedName: string | null;
  identifiedSpecies: string | null;
  identificationConfidence: number | null;
  createdAt: string;
  updatedAt: string;
}

export default function ScanResults() {
  const [, navigate] = useLocation();
  const [match, params] = useRoute("/scan-results/:scanId");

  const { data: scan, isLoading, error } = useQuery<PlantHealthScan>({
    queryKey: [`/api/plant-health-scans/${params?.scanId}`],
    enabled: !!params?.scanId,
  });

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
        <div className="max-w-2xl mx-auto pt-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="h-64 bg-gray-200 rounded mb-4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
        <div className="max-w-2xl mx-auto pt-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Scan</h1>
            <p className="text-gray-600 mb-4">Unable to load the plant health scan.</p>
            <Button onClick={() => navigate("/")}>Back to Home</Button>
          </div>
        </div>
      </div>
    );
  }

  if (!scan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
        <div className="max-w-2xl mx-auto pt-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Scan Not Found</h1>
            <p className="text-gray-600 mb-4">The requested plant health scan could not be found.</p>
            <Button onClick={() => navigate("/")}>Back to Home</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6 pt-8">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate("/")}
            className="p-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Plant Health Analysis</h1>
            <p className="text-gray-600">
              Scanned on {scan.createdAt ? new Date(scan.createdAt).toLocaleDateString() : 'Unknown date'}
            </p>
          </div>
        </div>

        {/* Scan Image */}
        {scan.image && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <img 
                src={scan.image} 
                alt="Scanned plant" 
                className="w-full h-64 object-cover rounded-lg"
              />
            </CardContent>
          </Card>
        )}

        {/* Health Score */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className={cn("text-4xl font-bold", getHealthColor(scan.overallHealth))}>
                {scan.healthScore}%
              </div>
              <div className="text-lg text-gray-600 uppercase tracking-wide">
                {scan.overallHealth} Health
              </div>
              <Progress value={scan.healthScore} className="w-full" />
            </div>
          </CardContent>
        </Card>

        {/* Plant Identification */}
        {scan.identifiedName && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Plant Identification
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <span className="font-semibold">Name: </span>
                  {scan.identifiedName}
                </div>
                {scan.identifiedSpecies && (
                  <div>
                    <span className="font-semibold">Species: </span>
                    {scan.identifiedSpecies}
                  </div>
                )}
                {scan.identificationConfidence && (
                  <div>
                    <span className="font-semibold">Confidence: </span>
                    {scan.identificationConfidence}%
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Issues */}
        {scan.issues && Array.isArray(scan.issues) && scan.issues.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Detected Issues
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {scan.issues.map((issue, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{issue.name}</h4>
                      <Badge className={getSeverityColor(issue.severity)}>
                        {issue.severity}
                      </Badge>
                    </div>
                    <p className="text-gray-600 text-sm mb-2">{issue.description}</p>
                    <div className="text-sm">
                      <span className="font-medium">Treatment: </span>
                      {issue.treatment}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Confidence: {Math.round(issue.confidence * 100)}%
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recommendations */}
        {scan.recommendations && Array.isArray(scan.recommendations) && scan.recommendations.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {scan.recommendations.map((recommendation, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700">{recommendation}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 mb-8">
          <Button 
            onClick={() => navigate("/ar-scan")} 
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            <Camera className="h-4 w-4 mr-2" />
            Scan Another Plant
          </Button>
          <Button 
            variant="outline" 
            onClick={() => navigate("/")}
            className="flex-1"
          >
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}