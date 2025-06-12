import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Leaf, CheckCircle, AlertTriangle, X, MapPin, Calendar, Camera } from "lucide-react";
import { cn } from "@/lib/utils";

interface PlantIdentificationCardProps {
  scan: {
    id: number;
    overallHealth: string;
    healthScore: number;
    identifiedName: string | null;
    identifiedSpecies: string | null;
    identificationConfidence: number | null;
    isPlantProbability?: number;
    issues: Array<{
      type: string;
      severity: string;
      name: string;
      description: string;
      treatment: string;
      confidence: number;
    }>;
    recommendations: string[];
    allSpeciesSuggestions?: Array<{
      name: string;
      scientificName: string;
      probability: number;
      similarImages: string[];
    }>;
    plantIdRawResponse?: any;
    createdAt: string;
  };
  onClose: () => void;
  onSaveAsPlant?: () => void;
}

export function PlantIdentificationCard({ scan, onClose, onSaveAsPlant }: PlantIdentificationCardProps) {
  const getHealthColor = (health: string) => {
    switch (health.toLowerCase()) {
      case "excellent": return "text-green-600";
      case "good": return "text-green-500";
      case "fair": return "text-yellow-500";
      case "poor": return "text-orange-500";
      case "critical": return "text-red-500";
      default: return "text-gray-500";
    }
  };

  const getHealthBadgeColor = (health: string) => {
    switch (health.toLowerCase()) {
      case "excellent": return "bg-green-100 text-green-800";
      case "good": return "bg-green-100 text-green-700";
      case "fair": return "bg-yellow-100 text-yellow-800";
      case "poor": return "bg-orange-100 text-orange-800";
      case "critical": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "high": return "🔴";
      case "medium": return "🟡";
      case "low": return "🟠";
      default: return "⚠️";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get main species from suggestions or identified name
  const mainSpecies = scan.allSpeciesSuggestions?.[0] || {
    name: scan.identifiedName || "Неизвестное растение",
    scientificName: scan.identifiedSpecies || "",
    probability: (scan.identificationConfidence || 0) / 100
  };

  // Get similar images from Plant.ID response
  const similarImages = scan.allSpeciesSuggestions?.[0]?.similarImages?.slice(0, 2) || [];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center gap-2">
            <Leaf className="h-6 w-6 text-green-600" />
            <CardTitle className="text-xl font-bold">Результат идентификации растения</CardTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Main Species Section */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Основной вид:</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-lg">{mainSpecies.name}</h4>
                <Badge variant="outline" className="text-sm">
                  {(mainSpecies.probability * 100).toFixed(1)}% уверенности
                </Badge>
              </div>
              {mainSpecies.scientificName && (
                <p className="text-sm text-gray-600 italic mb-3">
                  {mainSpecies.scientificName}
                </p>
              )}
              
              {/* Similar Images */}
              {similarImages.length > 0 && (
                <div className="flex gap-2 mt-3">
                  {similarImages.map((imageUrl, index) => (
                    <div key={index} className="w-20 h-20 rounded-lg overflow-hidden">
                      <img 
                        src={imageUrl} 
                        alt={`Похожее изображение ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Is it a plant? */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Это растение?</h3>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-green-600 font-medium">
                Да ({((scan.isPlantProbability || 0) * 100).toFixed(1)}%)
              </span>
            </div>
          </div>

          {/* Health Status */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Состояние здоровья:</h3>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Leaf className="h-5 w-5 text-green-600" />
                <Badge className={cn("capitalize", getHealthBadgeColor(scan.overallHealth))}>
                  {scan.overallHealth === 'excellent' ? 'Отличное' :
                   scan.overallHealth === 'good' ? 'Хорошее' :
                   scan.overallHealth === 'fair' ? 'Удовлетворительное' :
                   scan.overallHealth === 'poor' ? 'Плохое' :
                   scan.overallHealth === 'critical' ? 'Критическое' : scan.overallHealth}
                </Badge>
              </div>
              <span className={cn("text-2xl font-bold", getHealthColor(scan.overallHealth))}>
                ({scan.healthScore.toFixed(1)}%)
              </span>
            </div>
          </div>

          {/* Potential Issues */}
          {scan.issues && scan.issues.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Потенциальные проблемы (низкий риск):</h3>
              <div className="space-y-2">
                {scan.issues.map((issue, index) => (
                  <div key={index} className="flex items-start gap-2 p-3 bg-yellow-50 rounded-lg">
                    <span className="text-lg">{getSeverityIcon(issue.severity)}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{issue.name}</span>
                        <span className="text-sm text-gray-600">
                          ({(issue.confidence * 100).toFixed(2)}%)
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{issue.description}</p>
                      {issue.treatment && (
                        <p className="text-sm text-blue-700 mt-1">
                          <strong>Лечение:</strong> {issue.treatment}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {scan.recommendations && scan.recommendations.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Рекомендации:</h3>
              <div className="space-y-2">
                {scan.recommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-blue-800">{recommendation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Location & Timestamp */}
          <div className="space-y-3 pt-4 border-t">
            <h3 className="text-lg font-semibold">Местоположение и время:</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4" />
                <span>Широта: 49.207, Долгота: 16.608</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>Отсканировано: {formatDate(scan.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button 
              onClick={onClose}
              variant="outline" 
              className="flex-1"
            >
              Закрыть
            </Button>
            {onSaveAsPlant && (
              <Button 
                onClick={onSaveAsPlant}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <Leaf className="h-4 w-4 mr-2" />
                Сохранить как растение
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}