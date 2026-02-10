import { useMutation, useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";

interface ClockData {
  latitude: number;
  longitude: number;
  faceRecognitionData?: any;
}

export function useTimeClock() {
  const { toast } = useToast();

  const { data: clockStatus, isLoading: statusLoading } = useQuery({
    queryKey: ["/api/time-clock/status"],
  });

  const clockInMutation = useMutation({
    mutationFn: async (data: ClockData) => {
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
      queryClient.invalidateQueries({ queryKey: ["/api/time-entries"] });
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
          window.location.href = "/login";
        }, 500);
        return;
      }

      let errorMessage = "Erro ao registrar entrada";
      let errorCode = null;
      try {
        const errorData = JSON.parse(error.message);
        errorMessage = errorData.message || errorMessage;
        errorCode = errorData.code;
      } catch {
        errorMessage = error.message || errorMessage;
      }

      const isPeriodClosed = errorCode === "PERIOD_CLOSED";
      toast({
        title: isPeriodClosed ? "Período Fechado" : "Erro",
        description: isPeriodClosed 
          ? "Este período foi fechado pelo administrador. Não é possível registrar ponto."
          : errorMessage,
        variant: "destructive",
      });
    },
  });

  const clockOutMutation = useMutation({
    mutationFn: async (data: ClockData) => {
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
      queryClient.invalidateQueries({ queryKey: ["/api/time-entries"] });
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
          window.location.href = "/login";
        }, 500);
        return;
      }

      let errorMessage = "Erro ao registrar saída";
      let errorCode = null;
      try {
        const errorData = JSON.parse(error.message);
        errorMessage = errorData.message || errorMessage;
        errorCode = errorData.code;
      } catch {
        errorMessage = error.message || errorMessage;
      }

      const isPeriodClosed = errorCode === "PERIOD_CLOSED";
      toast({
        title: isPeriodClosed ? "Período Fechado" : "Erro",
        description: isPeriodClosed 
          ? "Este período foi fechado pelo administrador. Não é possível registrar ponto."
          : errorMessage,
        variant: "destructive",
      });
    },
  });

  const clockIn = (data: ClockData) => {
    clockInMutation.mutate(data);
  };

  const clockOut = (data: ClockData) => {
    clockOutMutation.mutate(data);
  };

  const isClocked = clockStatus?.isClocked || false;
  const activeEntry = clockStatus?.activeEntry || null;
  const isProcessing = clockInMutation.isPending || clockOutMutation.isPending;

  return {
    clockStatus,
    statusLoading,
    clockIn,
    clockOut,
    isClocked,
    activeEntry,
    isProcessing,
  };
}
