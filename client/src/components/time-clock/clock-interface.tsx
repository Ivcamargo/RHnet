import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Clock, MapPin, Camera, Building, Users } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { useGeolocation } from "@/hooks/useGeolocation";
import { isUnauthorizedError } from "@/lib/authUtils";
import FacialRecognition from "./facial-recognition";

// Types for API responses
interface ClockStatus {
  isClocked: boolean;
  activeEntry: any | null;
}

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  companyId: number;
  departmentId: number | null;
  department?: {
    name: string;
    shiftStart: string;
    shiftEnd: string;
  } | null;
  company?: {
    id: number;
    name: string;
  } | null;
}

export default function ClockInterface() {
  const [isFaceRecognitionActive, setIsFaceRecognitionActive] = useState(false);
  const { toast } = useToast();
  const { location, error: locationError } = useGeolocation();

  const { data: clockStatus, isLoading } = useQuery<ClockStatus>({
    queryKey: ["/api/time-clock/status"],
  });

  // Fetch user data including department and company info
  const { data: userData } = useQuery<UserData>({
    queryKey: ["/api/auth/user"],
  });

  const clockInMutation = useMutation({
    mutationFn: async (data: { latitude: number; longitude: number; faceRecognitionData?: any }) => {
      const response = await fetch("/api/time-clock/clock-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || response.statusText);
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/time-clock/status"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      setIsFaceRecognitionActive(false);
      toast({
        title: "Sucesso",
        description: "Entrada registrada com sucesso!",
      });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Não autorizado",
          description: "Você foi desconectado. Fazendo login novamente...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }

      let errorMessage = "Erro ao registrar entrada";
      try {
        const errorData = JSON.parse(error.message);
        errorMessage = errorData.message || errorMessage;
      } catch {
        errorMessage = error.message || errorMessage;
      }

      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const clockOutMutation = useMutation({
    mutationFn: async (data: { latitude: number; longitude: number; faceRecognitionData?: any }) => {
      const response = await fetch("/api/time-clock/clock-out", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || response.statusText);
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/time-clock/status"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      setIsFaceRecognitionActive(false);
      toast({
        title: "Sucesso",
        description: "Saída registrada com sucesso!",
      });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Não autorizado",
          description: "Você foi desconectado. Fazendo login novamente...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }

      let errorMessage = "Erro ao registrar saída";
      try {
        const errorData = JSON.parse(error.message);
        errorMessage = errorData.message || errorMessage;
      } catch {
        errorMessage = error.message || errorMessage;
      }

      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const handleClockAction = () => {
    // Prosseguir com reconhecimento facial mesmo sem localização exata
    // Uma localização padrão será usada se necessário
    setIsFaceRecognitionActive(true);
  };

  const handleFaceRecognitionComplete = (faceData?: any) => {
    // Usar localização obtida ou coordenadas padrão se localização não estiver disponível
    const defaultCoords = { latitude: -23.5505, longitude: -46.6333 }; // São Paulo como padrão
    const coords = location || defaultCoords;

    const data = {
      latitude: coords.latitude,
      longitude: coords.longitude,
      faceRecognitionData: faceData,
      locationFallback: !location, // Indica se usou coordenadas padrão
    };

    if (clockStatus?.isClocked) {
      clockOutMutation.mutate(data);
    } else {
      clockInMutation.mutate(data);
    }
  };

  const isProcessing = clockInMutation.isPending || clockOutMutation.isPending;

  if (isLoading) {
    return (
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-600">Verificando status...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Company and User Information */}
      {userData && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
          <div className="flex items-center space-x-2">
            <Building className="h-5 w-5 text-blue-600" />
            <div>
              <h3 className="font-semibold text-lg" data-testid="company-name">
                {userData.company?.name || "Carregando empresa..."}
              </h3>
              {userData.department && (
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <Users className="h-4 w-4" />
                  <span data-testid="department-name">{userData.department.name}</span>
                  <span className="text-gray-400">•</span>
                  <span data-testid="shift-hours">
                    Turno: {userData.department.shiftStart} às {userData.department.shiftEnd}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400" data-testid="user-name">
                Funcionário: {userData.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500" data-testid="user-role">
                {userData.role === 'admin' ? 'Administrador' : 'Funcionário'}
              </p>
            </div>
            
            <div className="text-right">
              <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                clockStatus?.isClocked 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
              }`} data-testid="clock-status">
                {clockStatus?.isClocked ? 'Ponto Batido' : 'Não Batido'}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Facial Recognition Area */}
      <FacialRecognition
        isActive={isFaceRecognitionActive}
        onComplete={handleFaceRecognitionComplete}
        onCancel={() => setIsFaceRecognitionActive(false)}
      />
      
      {/* Location Status */}
      <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
        <MapPin className="h-4 w-4" />
        <span>
          {locationError
            ? "Localização negada"
            : location
            ? `Localização obtida (${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)})`
            : "Obtendo localização..."
          }
        </span>
      </div>
      
      {/* Clock Action Button */}
      <Button
        onClick={handleClockAction}
        disabled={isProcessing}
        size="lg"
        className="px-8 py-4 point-primary text-lg font-medium shadow-lg hover:shadow-xl transition-shadow"
      >
        <Clock className="mr-2 h-5 w-5" />
        {isProcessing
          ? "Processando..."
          : clockStatus?.isClocked
          ? "Bater Ponto - Saída"
          : "Bater Ponto - Entrada"
        }
      </Button>
      
      {/* Instructions */}
      <div className="text-center text-sm text-gray-500 space-y-1">
        {locationError ? (
          <>
            <p className="text-amber-600">⚠️ Localização não disponível - usando modo manual</p>
            <p>Certifique-se de estar na área permitida da sua empresa</p>
            <p>O reconhecimento facial será solicitado para confirmar identidade</p>
          </>
        ) : location ? (
          <>
            <p className="text-green-600">✅ Localização confirmada</p>
            <p>O reconhecimento facial será solicitado</p>
          </>
        ) : (
          <>
            <p>Obtendo sua localização...</p>
            <p>O reconhecimento facial será solicitado</p>
          </>
        )}
      </div>
    </div>
  );
}
