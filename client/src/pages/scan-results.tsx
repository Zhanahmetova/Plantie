import { useLocation, useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, CheckCircle, AlertTriangle, Info, Camera, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ScanResults() {
  const [, navigate] = useLocation();
  const [match, params] = useRoute("/scan-results/:scanId");

  const { data: scan, isLoading, error } = useQuery({
    queryKey: ["/api/plant-health-scans", params?.scanId],
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

  if (error || !scan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
        <div className="max-w-2xl mx-auto pt-8">
          <Card>
            <CardContent className="pt-6 text-center">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Scan Results Not Found</h2>
              <p className="text-gray-600 mb-4">
                We couldn't find the scan results you're looking for.
              </p>
              <Button onClick={() => navigate("/")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-2xl mx-auto pt-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
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
              Scanned on {new Date(scan.createdAt).toLocaleDateString()}
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
                <Info className="h-5 w-5 text-blue-600" />
                Plant Identification
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-blue-900 font-semibold text-lg">
                  {scan.identifiedName}
                </p>
                {scan.identificationConfidence && (
                  <p className="text-blue-600 text-sm mt-1">
                    Confidence: {Math.round(scan.identificationConfidence * 100)}%
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Health Issues */}
        {scan.issues && scan.issues.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Detected Issues ({scan.issues.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {scan.issues.map((issue: any, index: number) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{issue.name}</h4>
                      <Badge className={getSeverityColor(issue.severity)}>
                        {issue.severity} severity
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{issue.description}</p>
                    <div className="bg-green-50 p-3 rounded-lg">
                      <p className="text-sm text-green-800">
                        <strong>Treatment:</strong> {issue.treatment}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Confidence: {Math.round(issue.confidence * 100)}%
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recommendations */}
        {scan.recommendations && scan.recommendations.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Care Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {scan.recommendations.map((recommendation: string, index: number) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{recommendation}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex gap-3 mb-8">
          <Button 
            onClick={() => navigate("/ar-scan")} 
            className="flex-1"
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