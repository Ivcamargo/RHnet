import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MonthlyTimeTable } from "@/components/reports/monthly-summary";
import { FileDown, Calendar, Clock, TrendingUp, Users } from "lucide-react";
import Sidebar from "@/components/layout/sidebar";
import TopBar from "@/components/layout/top-bar";

export default function Reports() {
  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState((currentDate.getMonth() + 1).toString());
  const [selectedUserId, setSelectedUserId] = useState<string>("me");

  // Get current user to check if admin
  const { data: currentUser } = useQuery<{ role?: string }>({
    queryKey: ["/api/auth/user"],
  });

  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'superadmin';

  // Get employees for admin users
  const { data: employees = [] } = useQuery<Array<{ id: string; firstName: string; lastName: string; email: string }>>({
    queryKey: ["/api/users/by-company"],
    enabled: isAdmin,
  });

  const { data: monthlyReport, isLoading } = useQuery({
    queryKey: ["/api/reports/monthly", selectedYear, selectedMonth, selectedUserId],
    queryFn: async () => {
      const params = new URLSearchParams({
        year: selectedYear,
        month: selectedMonth,
      });
      
      if (selectedUserId && selectedUserId !== "me") {
        params.append('userId', selectedUserId);
      }
      
      const response = await fetch(`/api/reports/monthly?${params.toString()}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch report');
      return response.json();
    },
  });

  const formatHours = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  const exportReport = () => {
    // Implementation for exporting report
    // This would typically generate a PDF or Excel file
    console.log("Exporting report...");
  };

  const years = Array.from({ length: 5 }, (_, i) => currentDate.getFullYear() - i);
  const months = [
    { value: "1", label: "Janeiro" },
    { value: "2", label: "Fevereiro" },
    { value: "3", label: "Março" },
    { value: "4", label: "Abril" },
    { value: "5", label: "Maio" },
    { value: "6", label: "Junho" },
    { value: "7", label: "Julho" },
    { value: "8", label: "Agosto" },
    { value: "9", label: "Setembro" },
    { value: "10", label: "Outubro" },
    { value: "11", label: "Novembro" },
    { value: "12", label: "Dezembro" },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-blue-50 via-teal-50 to-green-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Sidebar />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar title="Relatórios" />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          <div className="mb-6 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h1 className="text-2xl font-bold text-blue-800 dark:text-blue-300">Relatórios de Ponto</h1>
              
              <div className="flex items-center gap-4">
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Mês" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((month) => (
                      <SelectItem key={month.value} value={month.value}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Ano" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Button onClick={exportReport} className="point-primary">
                  <FileDown className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </div>

            {/* Employee filter for admins */}
            {isAdmin && employees.length > 0 && (
              <Card className="border-blue-200 dark:border-slate-600">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <Users className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                    <div className="flex-1">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2 block">
                        Funcionário
                      </label>
                      <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                        <SelectTrigger className="w-full" data-testid="select-employee">
                          <SelectValue placeholder="Meu relatório (padrão)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="me">Meu relatório (padrão)</SelectItem>
                          {employees.map((emp: any) => (
                            <SelectItem key={emp.id} value={emp.id}>
                              {emp.firstName} {emp.lastName} - {emp.email}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {isLoading ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="material-shadow">
                    <CardContent className="p-6">
                      <div className="animate-pulse">
                        <div className="h-4 bg-orange-200 rounded w-1/2 mb-2"></div>
                        <div className="h-8 bg-orange-200 rounded w-3/4"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <Card className="material-shadow">
                <CardContent className="p-6">
                  <div className="animate-pulse">
                    <div className="h-4 bg-orange-200 rounded w-1/4 mb-4"></div>
                    <div className="space-y-2">
                      {[...Array(10)].map((_, i) => (
                        <div key={i} className="h-12 bg-orange-200 rounded"></div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <>
              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="material-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 point-primary rounded-lg flex items-center justify-center">
                          <Clock className="h-6 w-6" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total de Horas</p>
                        <p className="text-2xl font-bold text-orange-800 dark:text-orange-300">
                          {monthlyReport?.stats ? formatHours(monthlyReport.stats.totalHours) : "0h 0m"}
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
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Dias Trabalhados</p>
                        <p className="text-2xl font-bold text-orange-800 dark:text-orange-300">
                          {monthlyReport?.stats?.totalDays || 0}
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
                          <TrendingUp className="h-6 w-6" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Média Diária</p>
                        <p className="text-2xl font-bold text-orange-800 dark:text-orange-300">
                          {monthlyReport?.stats ? formatHours(monthlyReport.stats.averageHours) : "0h 0m"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Detailed Report */}
              <Card className="material-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>
                      Relatório Detalhado - {months.find(m => m.value === selectedMonth)?.label} {selectedYear}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  {monthlyReport?.entries && monthlyReport.entries.length > 0 ? (
                    <MonthlyTimeTable entries={monthlyReport.entries} />
                  ) : (
                    <div className="text-center py-12">
                      <Calendar className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-orange-800 dark:text-orange-300 mb-2">Nenhum registro encontrado</h3>
                      <p className="text-gray-500 dark:text-gray-300">
                        Não há registros de ponto para o período selecionado.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
