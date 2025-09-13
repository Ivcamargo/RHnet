import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Clock, Calendar, Building, MapPin, Shield, Crown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import Sidebar from "@/components/layout/sidebar";
import TopBar from "@/components/layout/top-bar";
import ClockInterface from "@/components/time-clock/clock-interface";
import { MonthlyTimeTable } from "@/components/reports/monthly-summary";

interface DashboardStats {
  todayHours: number;
  weekHours: number;
  monthHours: number;
  monthlyStats: {
    totalHours: number;
    totalDays: number;
    averageHours: number;
  };
  activeEntry: any;
}

export default function Dashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const { toast } = useToast();

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Mutation to claim superadmin access
  const claimSuperadminMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/claim-superadmin", {
        method: "POST",
        credentials: "include",
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Sucesso!",
        description: data.message,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const { data: user } = useQuery({
    queryKey: ["/api/auth/user"],
  });

  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: timeEntries } = useQuery({
    queryKey: ["/api/time-entries"],
    queryFn: async () => {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const params = new URLSearchParams({
        startDate: startOfMonth.toISOString().split('T')[0],
        endDate: now.toISOString().split('T')[0],
      });
      
      const response = await fetch(`/api/time-entries?${params}`, {
        credentials: 'include'
      });
      return response.json();
    },
  });

  const formatHours = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  };

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

  const recentActivities = timeEntries?.slice(0, 5).map((entry: any) => ({
    type: entry.clockOutTime ? 'clock-out' : 'clock-in',
    time: entry.clockOutTime || entry.clockInTime,
    status: entry.status,
  })) || [];

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      <Sidebar />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar title="Dashboard" />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          {/* Superadmin Claim Alert */}
          {user && user.role !== 'superadmin' && (
            <div className="mb-6">
              <Alert className="border-amber-200 bg-amber-50">
                <Crown className="h-4 w-4 text-amber-600" />
                <AlertDescription className="flex items-center justify-between">
                  <div>
                    <span className="font-medium text-amber-800">
                      Sistema sem Super Administrador
                    </span>
                    <p className="text-amber-700 mt-1">
                      Seja o primeiro administrador do sistema e tenha controle total sobre empresas e usuários.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => claimSuperadminMutation.mutate()}
                    disabled={claimSuperadminMutation.isPending}
                    className="ml-4 border-amber-300 text-amber-700 hover:bg-amber-100"
                    data-testid="button-claim-superadmin"
                  >
                    {claimSuperadminMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-amber-600 mr-2"></div>
                        Processando...
                      </>
                    ) : (
                      <>
                        <Shield className="h-4 w-4 mr-2" />
                        Tornar-se Super Admin
                      </>
                    )}
                  </Button>
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Clock In/Out Section */}
          <div className="mb-8">
            <Card className="material-shadow">
              <CardContent className="p-6">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">Controle de Ponto</h3>
                  <div className="clock-display">
                    {formatTime(currentTime)}
                  </div>
                  <div className="text-gray-600 mb-6">
                    {formatDate(currentTime)}
                  </div>
                  
                  {/* Status Indicator */}
                  <div className="flex items-center justify-center mb-6">
                    <div className={stats?.activeEntry ? "status-active" : "status-inactive"}>
                      <div className="w-3 h-3 bg-white rounded-full animate-pulse-dot"></div>
                      <span>
                        {stats?.activeEntry ? "Ponto Batido - Entrada" : "Fora do Expediente"}
                      </span>
                    </div>
                  </div>
                  
                  <ClockInterface />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="material-shadow">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 point-primary rounded-lg flex items-center justify-center">
                      <Clock className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Horas Hoje</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {statsLoading ? "..." : formatHours(stats?.todayHours || 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="material-shadow">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 point-secondary rounded-lg flex items-center justify-center">
                      <Calendar className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Horas Semana</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {statsLoading ? "..." : formatHours(stats?.weekHours || 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="material-shadow">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 point-accent rounded-lg flex items-center justify-center">
                      <Calendar className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Horas Mês</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {statsLoading ? "..." : formatHours(stats?.monthHours || 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="material-shadow">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 point-success rounded-lg flex items-center justify-center">
                      <Building className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Departamento</p>
                    <p className="text-lg font-bold text-gray-900">
                      {user?.department?.name || "Não atribuído"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity & Department Info */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Recent Activity */}
            <Card className="material-shadow">
              <CardHeader>
                <CardTitle>Atividade Recente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.length > 0 ? (
                    recentActivities.map((activity: any, index: number) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="flex-shrink-0">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            activity.type === 'clock-in' ? 'point-success' : 'point-warning'
                          }`}>
                            <Clock className="h-4 w-4" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {activity.type === 'clock-in' ? 'Entrada registrada' : 'Saída registrada'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(activity.time).toLocaleString('pt-BR')}
                          </p>
                        </div>
                        <div className="text-xs text-gray-400">
                          {new Date(activity.time).toLocaleDateString('pt-BR') === new Date().toLocaleDateString('pt-BR') ? 'Hoje' : 'Anterior'}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">Nenhuma atividade recente</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Department Info */}
            <Card className="material-shadow">
              <CardHeader>
                <CardTitle>Informações do Departamento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {user?.department ? (
                    <>
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center mb-3">
                          <Building className="h-5 w-5 text-primary mr-2" />
                          <h4 className="font-medium text-gray-800">{user.department.name}</h4>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Turno:</p>
                            <p className="font-medium">
                              {user.department.shiftStart} - {user.department.shiftEnd}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600">Funcionários:</p>
                            <p className="font-medium">-</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center mb-2">
                          <MapPin className="h-5 w-5 text-green-600 mr-2" />
                          <h4 className="font-medium text-gray-800">Cerca Virtual</h4>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          Status: <span className="text-green-600 font-medium">Configurada</span>
                        </p>
                        <div className="text-xs text-gray-500">
                          <p>Raio: {user.department.radius}m do ponto central</p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <p className="text-gray-500 text-center py-4">Departamento não atribuído</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Monthly Summary */}
          {timeEntries && (
            <Card className="material-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Resumo Mensal - {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <MonthlyTimeTable entries={timeEntries} />
                
                {stats?.monthlyStats && (
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Total de Horas</p>
                      <p className="text-xl font-bold text-gray-900">
                        {formatHours(stats.monthlyStats.totalHours)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Dias Trabalhados</p>
                      <p className="text-xl font-bold text-gray-900">
                        {stats.monthlyStats.totalDays}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Média Diária</p>
                      <p className="text-xl font-bold text-gray-900">
                        {formatHours(stats.monthlyStats.averageHours)}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}
