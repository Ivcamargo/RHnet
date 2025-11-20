import Sidebar from "@/components/layout/sidebar";
import TopBar from "@/components/layout/top-bar";
import ClockInterface from "@/components/time-clock/clock-interface";
import ManualTimeEntry from "@/components/time-clock/manual-time-entry";
import SupervisorApprovals from "@/components/time-clock/supervisor-approvals";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useSearch } from "wouter";
import { formatBrazilianTime, formatBrazilianDate } from "../../../shared/timezone";

export default function TimeClock() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const tabFromUrl = params.get('tab') || 'clock';
  const [activeTab, setActiveTab] = useState(tabFromUrl);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const { data: clockStatus } = useQuery({
    queryKey: ["/api/time-clock/status"],
  });

  const { data: userInfo } = useQuery({
    queryKey: ["/api/auth/user"],
  });

  // Check if user is supervisor by checking if they have supervisor scope
  const { data: supervisorScope } = useQuery({
    queryKey: ["/api/supervisor/scope"],
    enabled: !!userInfo,
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
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-orange-50 via-red-50 to-orange-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Sidebar />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar title="Controle de Ponto" />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-black dark:text-white mb-2">Controle de Ponto</h1>
              <div className="clock-display">
                {formatTime(currentTime)}
              </div>
              <div className="text-black dark:text-white mb-4">
                {formatDate(currentTime)}
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6 bg-[hsl(210,100%,25%)] border-[hsl(210,100%,25%)]">
                <TabsTrigger value="clock" data-testid="tab-clock" className="text-white data-[state=active]:bg-[hsl(180,60%,70%)] data-[state=active]:text-[hsl(210,100%,25%)] hover:bg-[hsl(210,100%,35%)] hover:text-white">
                  Relógio de Ponto
                </TabsTrigger>
                <TabsTrigger value="manual" data-testid="tab-manual" className="text-white data-[state=active]:bg-[hsl(180,60%,70%)] data-[state=active]:text-[hsl(210,100%,25%)] hover:bg-[hsl(210,100%,35%)] hover:text-white">
                  Entrada Manual
                </TabsTrigger>
                {supervisorScope && (
                  <TabsTrigger value="approvals" data-testid="tab-approvals" className="text-white data-[state=active]:bg-[hsl(180,60%,70%)] data-[state=active]:text-[hsl(210,100%,25%)] hover:bg-[hsl(210,100%,35%)] hover:text-white">
                    Aprovações
                  </TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="clock" className="space-y-6">
                <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-orange-200 dark:border-slate-700 shadow-lg">
                  <CardContent className="p-8 dark:bg-transparent">
                    <div className="text-center dark:text-white">
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
                        <div className="mt-8 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                          <h3 className="font-medium text-orange-800 dark:text-orange-300 mb-2">Sessão Atual</h3>
                          <div className="text-sm text-orange-600 dark:text-orange-400">
                            <p>Entrada: {formatBrazilianTime(clockStatus.activeEntry.clockInTime)}</p>
                            <p>Data: {formatBrazilianDate(clockStatus.activeEntry.clockInTime)}</p>
                            {clockStatus.activeEntry.faceRecognitionVerified && (
                              <p className="text-green-600">✓ Reconhecimento facial verificado</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="manual" className="space-y-6">
                <ManualTimeEntry />
              </TabsContent>

              {supervisorScope && (
                <TabsContent value="approvals" className="space-y-6">
                  <SupervisorApprovals />
                </TabsContent>
              )}
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}
