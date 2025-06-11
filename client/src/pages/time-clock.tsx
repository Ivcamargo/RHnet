import Sidebar from "@/components/layout/sidebar";
import TopBar from "@/components/layout/top-bar";
import ClockInterface from "@/components/time-clock/clock-interface";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";

export default function TimeClock() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const { data: clockStatus } = useQuery({
    queryKey: ["/api/time-clock/status"],
  });

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      <Sidebar />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar title="Controle de Ponto" />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          <div className="max-w-2xl mx-auto">
            <Card className="material-shadow">
              <CardContent className="p-8">
                <div className="text-center">
                  <h1 className="text-3xl font-bold text-gray-800 mb-2">Controle de Ponto</h1>
                  <div className="clock-display">
                    {formatTime(currentTime)}
                  </div>
                  <div className="text-gray-600 mb-8">
                    {formatDate(currentTime)}
                  </div>
                  
                  {/* Status Indicator */}
                  <div className="flex items-center justify-center mb-8">
                    <div className={clockStatus?.isClocked ? "status-active" : "status-inactive"}>
                      <div className="w-3 h-3 bg-white rounded-full animate-pulse-dot"></div>
                      <span>
                        {clockStatus?.isClocked ? "Ponto Batido - Entrada" : "Fora do Expediente"}
                      </span>
                    </div>
                  </div>
                  
                  <ClockInterface />
                  
                  {/* Current Session Info */}
                  {clockStatus?.activeEntry && (
                    <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h3 className="font-medium text-gray-800 mb-2">Sessão Atual</h3>
                      <div className="text-sm text-gray-600">
                        <p>Entrada: {new Date(clockStatus.activeEntry.clockInTime).toLocaleTimeString('pt-BR')}</p>
                        <p>Data: {new Date(clockStatus.activeEntry.clockInTime).toLocaleDateString('pt-BR')}</p>
                        {clockStatus.activeEntry.faceRecognitionVerified && (
                          <p className="text-green-600">✓ Reconhecimento facial verificado</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
