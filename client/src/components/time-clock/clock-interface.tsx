import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Clock, MapPin, Camera } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { useGeolocation } from "@/hooks/useGeolocation";
import { isUnauthorizedError } from "@/lib/authUtils";
import FacialRecognition from "./facial-recognition";

export default function ClockInterface() {
  const [isFaceRecognitionActive, setIsFaceRecognitionActive] = useState(false);
  const { toast } = useToast();
  const { location, error: locationError } = useGeolocation();

  const { data: clockStatus, isLoading } = useQuery({
    queryKey: ["/api/time-clock/status"],
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
    if (locationError) {
      toast({
        title: "Erro de localização",
        description: "Permita o acesso à localização para registrar o ponto",
        variant: "destructive",
      });
      return;
    }

    if (!location) {
      toast({
        title: "Aguarde",
        description: "Obtendo sua localização...",
      });
      return;
    }

    setIsFaceRecognitionActive(true);
  };

  const handleFaceRecognitionComplete = (faceData?: any) => {
    if (!location) return;

    const data = {
      latitude: location.latitude,
      longitude: location.longitude,
      faceRecognitionData: faceData,
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
        disabled={isProcessing || !location || !!locationError}
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
      <div className="text-center text-sm text-gray-500">
        <p>Certifique-se de estar na área permitida</p>
        <p>O reconhecimento facial será solicitado</p>
      </div>
    </div>
  );
}
