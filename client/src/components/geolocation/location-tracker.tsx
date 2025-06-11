import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useQuery } from "@tanstack/react-query";

interface LocationTrackerProps {
  showDetails?: boolean;
}

export default function LocationTracker({ showDetails = false }: LocationTrackerProps) {
  const { location, error, isLoading } = useGeolocation();
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const { data: user } = useQuery({
    queryKey: ["/api/auth/user"],
  });

  useEffect(() => {
    if (location) {
      setLastUpdate(new Date());
    }
  }, [location]);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  };

  const getLocationStatus = () => {
    if (error) {
      return {
        status: "error",
        text: "Localização Negada",
        color: "point-error",
        icon: AlertCircle,
      };
    }

    if (isLoading) {
      return {
        status: "loading",
        text: "Obtendo Localização...",
        color: "point-warning",
        icon: Clock,
      };
    }

    if (location && user?.department) {
      const distance = calculateDistance(
        location.latitude,
        location.longitude,
        user.department.latitude,
        user.department.longitude
      );

      const isWithinRange = distance <= user.department.radius;

      return {
        status: isWithinRange ? "success" : "warning",
        text: isWithinRange ? "Localização Ativa" : "Fora da Área Permitida",
        color: isWithinRange ? "point-success" : "point-warning",
        icon: isWithinRange ? CheckCircle : AlertCircle,
        distance: Math.round(distance),
        maxDistance: user.department.radius,
      };
    }

    if (location) {
      return {
        status: "success",
        text: "Localização Ativa",
        color: "point-success", 
        icon: CheckCircle,
      };
    }

    return {
      status: "loading",
      text: "Obtendo Localização...",
      color: "point-warning",
      icon: Clock,
    };
  };

  const locationStatus = getLocationStatus();
  const StatusIcon = locationStatus.icon;

  if (!showDetails) {
    // Compact version for top bar
    return (
      <div className={`flex items-center space-x-2 px-3 py-1 text-white rounded-full text-sm ${locationStatus.color}`}>
        <StatusIcon className="h-4 w-4" />
        <span>{locationStatus.text}</span>
      </div>
    );
  }

  // Detailed version for dashboard
  return (
    <Card className="material-shadow">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MapPin className="h-5 w-5" />
          <span>Status de Localização</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <StatusIcon className="h-5 w-5 text-gray-600" />
            <span className="font-medium">{locationStatus.text}</span>
          </div>
          <Badge 
            variant={locationStatus.status === "success" ? "default" : 
                   locationStatus.status === "warning" ? "secondary" : "destructive"}
          >
            {locationStatus.status === "success" ? "Ativa" : 
             locationStatus.status === "warning" ? "Aviso" : "Erro"}
          </Badge>
        </div>

        {location && (
          <div className="text-sm text-gray-600 space-y-1">
            <p>Latitude: {location.latitude.toFixed(6)}</p>
            <p>Longitude: {location.longitude.toFixed(6)}</p>
            {lastUpdate && (
              <p>Última atualização: {lastUpdate.toLocaleTimeString('pt-BR')}</p>
            )}
          </div>
        )}

        {user?.department && location && locationStatus.distance !== undefined && (
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-1">Cerca Virtual</h4>
            <div className="text-sm text-blue-800">
              <p>Distância: {locationStatus.distance}m</p>
              <p>Raio permitido: {locationStatus.maxDistance}m</p>
              <p className={`font-medium ${
                locationStatus.distance <= locationStatus.maxDistance 
                  ? "text-green-600" 
                  : "text-red-600"
              }`}>
                {locationStatus.distance <= locationStatus.maxDistance 
                  ? "✓ Dentro da área permitida" 
                  : "⚠ Fora da área permitida"
                }
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 rounded-lg border border-red-200">
            <h4 className="font-medium text-red-900 mb-1">Erro de Localização</h4>
            <p className="text-sm text-red-800">{error}</p>
            <p className="text-xs text-red-700 mt-1">
              Verifique as configurações de localização do seu navegador
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
