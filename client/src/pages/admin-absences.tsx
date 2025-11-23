import Sidebar from "@/components/layout/sidebar";
import TopBar from "@/components/layout/top-bar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AlertCircle, Calendar, CheckCircle, Clock, FileText, Filter, User, XCircle } from "lucide-react";
import { useState } from "react";
import type { Absence } from "@shared/schema";
import { formatBrazilianDate } from "@shared/timezone";

const absenceTypeLabels: Record<string, string> = {
  vacation: "Férias",
  medical_leave: "Atestado Médico",
  maternity_leave: "Licença Maternidade",
  paternity_leave: "Licença Paternidade",
  bereavement: "Luto/Nojo",
  wedding: "Casamento",
  blood_donation: "Doação de Sangue",
  military_service: "Serviço Militar",
  jury_duty: "Júri",
  other: "Outro"
};

const statusLabels: Record<string, string> = {
  pending: "Pendente",
  approved: "Aprovado",
  rejected: "Rejeitado",
  cancelled: "Cancelado"
};

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700",
  approved: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300 border-green-300 dark:border-green-700",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300 border-red-300 dark:border-red-700",
  cancelled: "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300 border-gray-300 dark:border-gray-700"
};

type AbsenceWithEmployee = Absence & {
  employee?: {
    id: string;
    name: string;
    email: string;
    departmentId?: number | null;
  };
  department?: {
    id: number;
    name: string;
  } | null;
};

export default function AdminAbsences() {
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [employeeFilter, setEmployeeFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedAbsence, setSelectedAbsence] = useState<Absence | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const { data: absences, isLoading: absencesLoading } = useQuery<AbsenceWithEmployee[]>({
    queryKey: ['/api/absences'],
  });

  const { data: pendingAbsences } = useQuery<AbsenceWithEmployee[]>({
    queryKey: ['/api/absences/pending'],
  });

  const { data: employees } = useQuery<Array<{ id: string; name: string }>>({
    queryKey: ['/api/users'],
  });

  const { data: departments } = useQuery<Array<{ id: number; name: string }>>({
    queryKey: ['/api/departments'],
  });

  const approveMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/absences/${id}/approve`, 'POST', {});
    },
    onSuccess: () => {
      toast({
        title: "Ausência aprovada!",
        description: "A solicitação foi aprovada com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/absences'] });
      queryClient.invalidateQueries({ queryKey: ['/api/absences/pending'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao aprovar",
        description: error.message || "Tente novamente mais tarde.",
        variant: "destructive",
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: number; reason: string }) => {
      return await apiRequest(`/api/absences/${id}/reject`, 'POST', { rejectionReason: reason });
    },
    onSuccess: () => {
      toast({
        title: "Ausência rejeitada!",
        description: "A solicitação foi rejeitada.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/absences'] });
      queryClient.invalidateQueries({ queryKey: ['/api/absences/pending'] });
      setRejectDialogOpen(false);
      setRejectionReason('');
      setSelectedAbsence(null);
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao rejeitar",
        description: error.message || "Tente novamente mais tarde.",
        variant: "destructive",
      });
    },
  });

  const handleReject = (absence: Absence) => {
    setSelectedAbsence(absence);
    setRejectDialogOpen(true);
  };

  const confirmReject = () => {
    if (!selectedAbsence || !rejectionReason.trim()) {
      toast({
        title: "Erro",
        description: "O motivo da rejeição é obrigatório.",
        variant: "destructive",
      });
      return;
    }
    rejectMutation.mutate({ id: selectedAbsence.id, reason: rejectionReason });
  };

  const filteredAbsences = absences?.filter(a => {
    if (statusFilter !== 'all' && a.status !== statusFilter) return false;
    if (typeFilter !== 'all' && a.type !== typeFilter) return false;
    if (employeeFilter !== 'all' && a.employee?.id !== employeeFilter) return false;
    if (departmentFilter !== 'all') {
      const deptId = a.department?.id || a.employee?.departmentId;
      if (deptId?.toString() !== departmentFilter) return false;
    }
    return true;
  }) || [];

  const stats = {
    pending: absences?.filter(a => a.status === 'pending').length || 0,
    approved: absences?.filter(a => a.status === 'approved').length || 0,
    rejected: absences?.filter(a => a.status === 'rejected').length || 0,
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-orange-50 via-red-50 to-orange-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Sidebar />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar title="Gestão de Ausências" />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-yellow-200 dark:border-yellow-700 shadow-lg">
                <CardContent className="p-6 dark:bg-transparent">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pendentes</p>
                      <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pending}</p>
                    </div>
                    <Clock className="h-12 w-12 text-yellow-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-green-200 dark:border-green-700 shadow-lg">
                <CardContent className="p-6 dark:bg-transparent">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Aprovadas</p>
                      <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.approved}</p>
                    </div>
                    <CheckCircle className="h-12 w-12 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-red-200 dark:border-red-700 shadow-lg">
                <CardContent className="p-6 dark:bg-transparent">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Rejeitadas</p>
                      <p className="text-3xl font-bold text-red-600 dark:text-red-400">{stats.rejected}</p>
                    </div>
                    <XCircle className="h-12 w-12 text-red-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <Tabs defaultValue="pending" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6 bg-[hsl(210,100%,25%)] border-[hsl(210,100%,25%)]">
                <TabsTrigger 
                  value="pending" 
                  data-testid="tab-pending"
                  className="text-white data-[state=active]:bg-[hsl(180,60%,70%)] data-[state=active]:text-[hsl(210,100%,25%)] hover:bg-[hsl(210,100%,35%)] hover:text-white"
                >
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Pendentes ({stats.pending})
                </TabsTrigger>
                <TabsTrigger 
                  value="all" 
                  data-testid="tab-all"
                  className="text-white data-[state=active]:bg-[hsl(180,60%,70%)] data-[state=active]:text-[hsl(210,100%,25%)] hover:bg-[hsl(210,100%,35%)] hover:text-white"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Todas as Solicitações
                </TabsTrigger>
              </TabsList>

              {/* Pending Tab */}
              <TabsContent value="pending">
                <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-orange-200 dark:border-slate-700 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-[hsl(210,100%,25%)] to-[hsl(180,60%,70%)] text-white rounded-t-lg">
                    <CardTitle>Solicitações Pendentes de Aprovação</CardTitle>
                    <CardDescription className="text-gray-100">
                      Analise e aprove/rejeite as solicitações de ausências dos colaboradores
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 dark:bg-transparent">
                    {absencesLoading ? (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <Clock className="h-8 w-8 animate-spin mx-auto mb-2" />
                        Carregando...
                      </div>
                    ) : !pendingAbsences || pendingAbsences.length === 0 ? (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <CheckCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>Nenhuma solicitação pendente</p>
                        <p className="text-sm">Todas as solicitações foram processadas</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {pendingAbsences.map((absence) => (
                          <Card key={absence.id} className="border-2 border-yellow-200 dark:border-yellow-700">
                            <CardContent className="p-4 dark:bg-transparent">
                              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <User className="h-4 w-4 text-gray-500" />
                                    <span className="font-medium text-gray-900 dark:text-white" data-testid={`text-employee-${absence.id}`}>
                                      {absence.employee?.name || 'Funcionário Desconhecido'}
                                    </span>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[absence.type]}`}>
                                      {absenceTypeLabels[absence.type]}
                                    </span>
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400">
                                    <div>
                                      <Calendar className="h-4 w-4 inline mr-1" />
                                      <strong>Período:</strong> {formatBrazilianDate(absence.startDate)} - {formatBrazilianDate(absence.endDate)}
                                    </div>
                                    <div>
                                      <Clock className="h-4 w-4 inline mr-1" />
                                      <strong>Dias:</strong> {absence.totalDays}
                                    </div>
                                  </div>
                                  {absence.reason && (
                                    <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                      <strong>Motivo:</strong> {absence.reason}
                                    </div>
                                  )}
                                  {absence.documentUrl && (
                                    <div className="mt-2">
                                      <a 
                                        href={absence.documentUrl} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-sm text-blue-600 hover:underline dark:text-blue-400"
                                      >
                                        📎 Ver Documento
                                      </a>
                                    </div>
                                  )}
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    onClick={() => approveMutation.mutate(absence.id)}
                                    disabled={approveMutation.isPending}
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                    data-testid={`button-approve-${absence.id}`}
                                  >
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Aprovar
                                  </Button>
                                  <Button
                                    onClick={() => handleReject(absence)}
                                    disabled={rejectMutation.isPending}
                                    variant="destructive"
                                    data-testid={`button-reject-${absence.id}`}
                                  >
                                    <XCircle className="h-4 w-4 mr-1" />
                                    Rejeitar
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* All Absences Tab */}
              <TabsContent value="all">
                <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-orange-200 dark:border-slate-700 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-[hsl(210,100%,25%)] to-[hsl(180,60%,70%)] text-white rounded-t-lg">
                    <CardTitle className="flex items-center gap-2">
                      <Filter className="h-5 w-5" />
                      Filtros
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 dark:bg-transparent">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
                      <div>
                        <Label className="text-black dark:text-white">Status</Label>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                          <SelectTrigger data-testid="select-filter-status">
                            <SelectValue placeholder="Todos" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Todos</SelectItem>
                            {Object.entries(statusLabels).map(([value, label]) => (
                              <SelectItem key={value} value={value}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-black dark:text-white">Tipo</Label>
                        <Select value={typeFilter} onValueChange={setTypeFilter}>
                          <SelectTrigger data-testid="select-filter-type">
                            <SelectValue placeholder="Todos" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Todos</SelectItem>
                            {Object.entries(absenceTypeLabels).map(([value, label]) => (
                              <SelectItem key={value} value={value}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-black dark:text-white">Funcionário</Label>
                        <Select value={employeeFilter} onValueChange={setEmployeeFilter}>
                          <SelectTrigger data-testid="select-filter-employee">
                            <SelectValue placeholder="Todos" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Todos</SelectItem>
                            {employees?.map((employee) => (
                              <SelectItem key={employee.id} value={employee.id}>
                                {employee.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-black dark:text-white">Departamento</Label>
                        <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                          <SelectTrigger data-testid="select-filter-department">
                            <SelectValue placeholder="Todos" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Todos</SelectItem>
                            {departments?.map((department) => (
                              <SelectItem key={department.id} value={department.id.toString()}>
                                {department.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Results Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="border-b border-gray-200 dark:border-gray-700">
                          <tr className="text-left">
                            <th className="pb-3 font-medium text-gray-700 dark:text-gray-300">Funcionário</th>
                            <th className="pb-3 font-medium text-gray-700 dark:text-gray-300">Tipo</th>
                            <th className="pb-3 font-medium text-gray-700 dark:text-gray-300">Período</th>
                            <th className="pb-3 font-medium text-gray-700 dark:text-gray-300">Dias</th>
                            <th className="pb-3 font-medium text-gray-700 dark:text-gray-300">Anexo</th>
                            <th className="pb-3 font-medium text-gray-700 dark:text-gray-300">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                          {filteredAbsences.map((absence) => (
                            <tr key={absence.id} className="text-gray-900 dark:text-gray-100">
                              <td className="py-3" data-testid={`text-employee-list-${absence.id}`}>
                                {absence.employee?.name || 'Desconhecido'}
                              </td>
                              <td className="py-3" data-testid={`text-type-list-${absence.id}`}>
                                {absenceTypeLabels[absence.type]}
                              </td>
                              <td className="py-3" data-testid={`text-period-list-${absence.id}`}>
                                {formatBrazilianDate(absence.startDate)} - {formatBrazilianDate(absence.endDate)}
                              </td>
                              <td className="py-3" data-testid={`text-days-list-${absence.id}`}>
                                {absence.totalDays}
                              </td>
                              <td className="py-3">
                                {absence.documentUrl ? (
                                  <a
                                    href={absence.documentUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                    data-testid={`link-document-list-${absence.id}`}
                                  >
                                    <FileText className="h-4 w-4" />
                                  </a>
                                ) : (
                                  <span className="text-gray-400 dark:text-gray-600" data-testid={`text-no-document-list-${absence.id}`}>
                                    -
                                  </span>
                                )}
                              </td>
                              <td className="py-3">
                                <span 
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[absence.status]}`}
                                  data-testid={`status-list-${absence.id}`}
                                >
                                  {statusLabels[absence.status]}
                                </span>
                                {absence.rejectionReason && (
                                  <p className="text-xs text-red-600 dark:text-red-400 mt-1" data-testid={`rejection-reason-${absence.id}`}>
                                    {absence.rejectionReason}
                                  </p>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {filteredAbsences.length === 0 && (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                          Nenhum resultado encontrado
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="bg-white dark:bg-slate-800">
          <DialogHeader>
            <DialogTitle className="text-black dark:text-white">Rejeitar Solicitação</DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              Por favor, informe o motivo da rejeição. Esta informação será enviada ao funcionário.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="rejection-reason" className="text-black dark:text-white">Motivo da Rejeição *</Label>
            <Textarea
              id="rejection-reason"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Ex: Período conflita com férias de outro colaborador do setor"
              rows={4}
              className="mt-2"
              data-testid="textarea-rejection-reason"
            />
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setRejectDialogOpen(false);
                setRejectionReason('');
                setSelectedAbsence(null);
              }}
              data-testid="button-cancel-reject"
            >
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmReject}
              disabled={!rejectionReason.trim() || rejectMutation.isPending}
              data-testid="button-confirm-reject"
            >
              {rejectMutation.isPending ? "Rejeitando..." : "Confirmar Rejeição"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
