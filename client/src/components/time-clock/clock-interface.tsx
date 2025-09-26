import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Clock, MapPin, Camera, Building, Users, Coffee, PlayCircle, StopCircle } from "lucide-react";
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

interface BreakEntry {
  id: number;
  timeEntryId: number;
  breakStart: string | null;
  breakEnd: string | null;
  duration: string | null;
  type: string;
}

interface HoursStats {
  isActive: boolean;
  totalHours: number;
  regularHours: number;
  overtimeHours: number;
  estimatedOvertimeHours: number;
}

// Helper function to calculate liquid hours based on shift data
function calculateLiquidHours(shift: any) {
  if (!shift || !shift.startTime || !shift.endTime) {
    return 0;
  }
  
  // Calculate shift duration in hours
  const [startHour, startMin] = shift.startTime.split(':').map(Number);
  const [endHour, endMin] = shift.endTime.split(':').map(Number);
  const shiftStart = startHour + startMin / 60;
  const shiftEnd = endHour + endMin / 60;
  
  let totalShiftHours = shiftEnd - shiftStart;
  if (totalShiftHours < 0) {
    totalShiftHours += 24; // Handle overnight shifts
  }
  
  // Calculate break duration if defined
  let breakHours = 0;
  if (shift.breakStart && shift.breakEnd) {
    const [breakStartHour, breakStartMin] = shift.breakStart.split(':').map(Number);
    const [breakEndHour, breakEndMin] = shift.breakEnd.split(':').map(Number);
    const breakStart = breakStartHour + breakStartMin / 60;
    const breakEnd = breakEndHour + breakEndMin / 60;
    
    breakHours = breakEnd - breakStart;
    if (breakHours < 0) {
      breakHours += 24; // Handle overnight breaks
    }
  }
  
  return totalShiftHours - breakHours;
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

  // Fetch current breaks for active time entry
  const { data: breaks = [] } = useQuery<BreakEntry[]>({
    queryKey: ["/api/time-clock/breaks"],
    enabled: !!clockStatus?.isClocked, // Only fetch when user is clocked in
  });

  // Get active break (if any)
  const activeBreak = breaks.find(b => b.breakStart && !b.breakEnd);

  // Fetch current hours statistics (including overtime)
  const { data: hoursStats } = useQuery<HoursStats>({
    queryKey: ["/api/time-clock/hours-stats"],
    enabled: !!clockStatus?.isClocked,
    refetchInterval: 30000, // Update every 30 seconds when clocked in
  });

  // Fetch user's shift data for liquid hours calculation
  const { data: userShift } = useQuery({
    queryKey: ["/api/department-shifts", userData?.departmentId, "user-shift"],
    queryFn: async () => {
      if (!userData?.departmentId) return null;
      const response = await fetch(`/api/department-shifts/${userData.departmentId}/user-shift`, {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch user shift: ${response.statusText}`);
      }
      return response.json();
    },
    enabled: !!userData?.departmentId,
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

  // Break start mutation
  const startBreakMutation = useMutation({
    mutationFn: async (type: string = 'break') => {
      const response = await fetch("/api/time-clock/break-start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ type }),
      });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || response.statusText);
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/time-clock/breaks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Intervalo iniciado",
        description: "Intervalo registrado com sucesso!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao iniciar intervalo",
        variant: "destructive",
      });
    },
  });

  // Break end mutation
  const endBreakMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/time-clock/break-end", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || response.statusText);
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/time-clock/breaks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Intervalo finalizado",
        description: "Retorno do intervalo registrado com sucesso!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao finalizar intervalo",
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
      locationFallback: !location || faceData?.noPhoto, // Indica se usou coordenadas padrão ou registrou sem foto
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
      
      {/* Hours Statistics - Only show when user is clocked in */}
      {clockStatus?.isClocked && hoursStats && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 space-y-3">
          <h3 className="text-center text-sm font-medium text-blue-900 dark:text-blue-300">
            Horas Trabalhadas Hoje
          </h3>
          
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400" data-testid="total-hours">
                {hoursStats.totalHours.toFixed(1)}h
              </div>
              <div className="text-xs text-blue-600 dark:text-blue-400">Total</div>
            </div>
            
            <div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400" data-testid="regular-hours">
                {hoursStats.regularHours.toFixed(1)}h
              </div>
              <div className="text-xs text-green-600 dark:text-green-400">Regulares</div>
            </div>
          </div>
          
          {/* Liquid Hours Display - Show expected shift hours minus break */}
          <div className="border-t border-blue-200 dark:border-blue-800 pt-3 mt-3">
            <div className="text-center">
              {userShift && userShift.startTime && userShift.endTime ? (
                <>
                  <div className="text-lg font-medium text-purple-600 dark:text-purple-400" data-testid="liquid-hours">
                    {calculateLiquidHours(userShift).toFixed(1)}h
                  </div>
                  <div className="text-xs text-purple-600 dark:text-purple-400">Horas Líquidas do Turno</div>
                  {userShift.breakStart && userShift.breakEnd ? (
                    <div className="text-xs text-gray-500 mt-1">
                      Intervalo: {userShift.breakStart} - {userShift.breakEnd}
                    </div>
                  ) : (
                    <div className="text-xs text-gray-500 mt-1">
                      Sem intervalo configurado
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="text-lg font-medium text-gray-400" data-testid="no-shift">
                    --h
                  </div>
                  <div className="text-xs text-gray-400">Turno Não Encontrado</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Nenhum turno ativo configurado para hoje
                  </div>
                </>
              )}
            </div>
          </div>
          
          {hoursStats.estimatedOvertimeHours > 0 && (
            <div className="bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
              <div className="text-center">
                <div className="text-lg font-bold text-amber-700 dark:text-amber-300" data-testid="overtime-hours">
                  +{hoursStats.estimatedOvertimeHours.toFixed(1)}h
                </div>
                <div className="text-xs text-amber-600 dark:text-amber-400">
                  🕐 Horas Extras em Andamento
                </div>
                <div className="text-xs text-amber-500 dark:text-amber-500 mt-1">
                  Acima do horário padrão do turno
                </div>
              </div>
            </div>
          )}
          
          <div className="text-center text-xs text-gray-500 dark:text-gray-400">
            Atualizado automaticamente a cada 30 segundos
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
      
      {/* Break Controls - Only show when user is clocked in */}
      {clockStatus?.isClocked && (
        <div className="space-y-4">
          <div className="flex items-center justify-center">
            <div className="w-full max-w-md">
              <h3 className="text-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Controle de Intervalos
              </h3>
              
              {activeBreak ? (
                <div className="space-y-3">
                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                    <div className="flex items-center justify-center space-x-2 text-amber-800 dark:text-amber-300">
                      <Coffee className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        Intervalo em andamento
                      </span>
                    </div>
                    <div className="text-center text-xs text-amber-600 dark:text-amber-400 mt-1">
                      Iniciado às{" "}
                      {activeBreak.breakStart
                        ? new Date(activeBreak.breakStart).toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : "N/A"}
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => endBreakMutation.mutate()}
                    disabled={endBreakMutation.isPending}
                    variant="outline"
                    className="w-full border-green-200 hover:bg-green-50 dark:border-green-800 dark:hover:bg-green-900/20"
                    data-testid="button-end-break"
                  >
                    <StopCircle className="mr-2 h-4 w-4 text-green-600" />
                    {endBreakMutation.isPending ? "Finalizando..." : "Finalizar Intervalo"}
                  </Button>
                </div>
              ) : (
                <div className="flex space-x-2">
                  <Button
                    onClick={() => startBreakMutation.mutate('break')}
                    disabled={startBreakMutation.isPending}
                    variant="outline"
                    className="flex-1 border-blue-200 hover:bg-blue-50 dark:border-blue-800 dark:hover:bg-blue-900/20"
                    data-testid="button-start-break"
                  >
                    <PlayCircle className="mr-2 h-4 w-4 text-blue-600" />
                    {startBreakMutation.isPending ? "Iniciando..." : "Intervalo"}
                  </Button>
                  
                  <Button
                    onClick={() => startBreakMutation.mutate('lunch')}
                    disabled={startBreakMutation.isPending}
                    variant="outline"
                    className="flex-1 border-orange-200 hover:bg-orange-50 dark:border-orange-800 dark:hover:bg-orange-900/20"
                    data-testid="button-start-lunch"
                  >
                    <Coffee className="mr-2 h-4 w-4 text-orange-600" />
                    {startBreakMutation.isPending ? "Iniciando..." : "Almoço"}
                  </Button>
                </div>
              )}
            </div>
          </div>
          
          {/* Display recent breaks */}
          {breaks.length > 0 && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 text-center">
                Intervalos de Hoje
              </h4>
              <div className="space-y-2">
                {breaks.slice(-3).reverse().map((breakEntry) => (
                  <div key={breakEntry.id} className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                    <span className="capitalize">
                      {breakEntry.type === 'lunch' ? 'Almoço' : 'Intervalo'}:
                    </span>
                    <span>
                      {breakEntry.breakStart
                        ? new Date(breakEntry.breakStart).toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : "N/A"}{" "}
                      -{" "}
                      {breakEntry.breakEnd
                        ? new Date(breakEntry.breakEnd).toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : "Em andamento"}
                      {breakEntry.duration && breakEntry.breakEnd && (
                        <span className="ml-2 text-gray-500">
                          ({Math.round(parseFloat(breakEntry.duration) * 60)}min)
                        </span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
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
