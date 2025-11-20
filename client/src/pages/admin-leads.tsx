import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { 
  UserPlus, 
  Phone, 
  Mail, 
  Building2, 
  MessageSquare,
  Calendar,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  FileText
} from "lucide-react";
import Sidebar from "@/components/layout/sidebar";
import TopBar from "@/components/layout/top-bar";

interface Lead {
  id: number;
  name: string;
  email: string;
  phone?: string;
  companyName?: string;
  message?: string;
  status: string;
  sourceChannel: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  assignedTo?: string;
  companyId?: number;
  followUpNotes?: string;
  lastContactedAt?: string;
  createdAt: string;
  updatedAt: string;
}

const statusLabels: Record<string, string> = {
  new: "Novo",
  contacted: "Contatado",
  meeting_scheduled: "Reunião Agendada",
  proposal_sent: "Proposta Enviada",
  contracted: "Contratado",
  lost: "Perdido"
};

const statusColors: Record<string, string> = {
  new: "bg-blue-500",
  contacted: "bg-yellow-500",
  meeting_scheduled: "bg-purple-500",
  proposal_sent: "bg-orange-500",
  contracted: "bg-green-500",
  lost: "bg-gray-500"
};

const statusIcons: Record<string, any> = {
  new: UserPlus,
  contacted: Phone,
  meeting_scheduled: Calendar,
  proposal_sent: FileText,
  contracted: CheckCircle2,
  lost: XCircle
};

export default function AdminLeads() {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<string>("");
  const [followUpNotes, setFollowUpNotes] = useState<string>("");
  const { toast } = useToast();

  const { data: leads = [], isLoading } = useQuery<Lead[]>({
    queryKey: ['/api/leads', statusFilter !== 'all' ? statusFilter : undefined],
    enabled: true,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ leadId, data }: { leadId: number, data: any }) => {
      return await apiRequest(`/api/leads/${leadId}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/leads'] });
      toast({
        title: "Status atualizado",
        description: "O status do lead foi atualizado com sucesso.",
      });
      setIsDetailsDialogOpen(false);
      setSelectedLead(null);
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar",
        description: error.message || "Não foi possível atualizar o status.",
        variant: "destructive",
      });
    },
  });

  const handleViewDetails = (lead: Lead) => {
    setSelectedLead(lead);
    setNewStatus(lead.status);
    setFollowUpNotes(lead.followUpNotes || "");
    setIsDetailsDialogOpen(true);
  };

  const handleUpdateStatus = () => {
    if (!selectedLead) return;
    
    updateStatusMutation.mutate({
      leadId: selectedLead.id,
      data: {
        status: newStatus,
        followUpNotes: followUpNotes || undefined,
      }
    });
  };

  const filteredLeads = statusFilter === 'all' 
    ? leads 
    : leads.filter(lead => lead.status === statusFilter);

  const leadsByStatus = {
    new: leads.filter(l => l.status === 'new').length,
    contacted: leads.filter(l => l.status === 'contacted').length,
    meeting_scheduled: leads.filter(l => l.status === 'meeting_scheduled').length,
    proposal_sent: leads.filter(l => l.status === 'proposal_sent').length,
    contracted: leads.filter(l => l.status === 'contracted').length,
    lost: leads.filter(l => l.status === 'lost').length,
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-slate-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar title="Gestão de Leads" />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-slate-900">
          <div className="container mx-auto px-6 py-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Gestão de Leads
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Gerencie contatos capturados e acompanhe o funil de vendas
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setStatusFilter('new')}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Novos</p>
                      <p className="text-2xl font-bold text-blue-600">{leadsByStatus.new}</p>
                    </div>
                    <UserPlus className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setStatusFilter('contacted')}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Contatados</p>
                      <p className="text-2xl font-bold text-yellow-600">{leadsByStatus.contacted}</p>
                    </div>
                    <Phone className="h-8 w-8 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setStatusFilter('meeting_scheduled')}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Reuniões</p>
                      <p className="text-2xl font-bold text-purple-600">{leadsByStatus.meeting_scheduled}</p>
                    </div>
                    <Calendar className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setStatusFilter('proposal_sent')}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Propostas</p>
                      <p className="text-2xl font-bold text-orange-600">{leadsByStatus.proposal_sent}</p>
                    </div>
                    <FileText className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setStatusFilter('contracted')}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Contratados</p>
                      <p className="text-2xl font-bold text-green-600">{leadsByStatus.contracted}</p>
                    </div>
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setStatusFilter('lost')}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Perdidos</p>
                      <p className="text-2xl font-bold text-gray-600">{leadsByStatus.lost}</p>
                    </div>
                    <XCircle className="h-8 w-8 text-gray-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle>Lista de Leads</CardTitle>
                <div className="flex items-center gap-4">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[200px]" data-testid="select-status-filter">
                      <SelectValue placeholder="Filtrar por status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="new">Novos</SelectItem>
                      <SelectItem value="contacted">Contatados</SelectItem>
                      <SelectItem value="meeting_scheduled">Reuniões Agendadas</SelectItem>
                      <SelectItem value="proposal_sent">Propostas Enviadas</SelectItem>
                      <SelectItem value="contracted">Contratados</SelectItem>
                      <SelectItem value="lost">Perdidos</SelectItem>
                    </SelectContent>
                  </Select>
                  {statusFilter !== 'all' && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setStatusFilter('all')}
                      data-testid="button-clear-filter"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Limpar Filtro
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">
                    <Clock className="h-8 w-8 animate-spin mx-auto text-gray-400" />
                    <p className="mt-2 text-gray-500">Carregando leads...</p>
                  </div>
                ) : filteredLeads.length === 0 ? (
                  <div className="text-center py-8">
                    <UserPlus className="h-12 w-12 mx-auto text-gray-300" />
                    <p className="mt-2 text-gray-500">Nenhum lead encontrado</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nome</TableHead>
                          <TableHead>Empresa</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Telefone</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Origem</TableHead>
                          <TableHead>Data</TableHead>
                          <TableHead>Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredLeads.map((lead) => {
                          const StatusIcon = statusIcons[lead.status];
                          return (
                            <TableRow key={lead.id} data-testid={`row-lead-${lead.id}`}>
                              <TableCell className="font-medium">{lead.name}</TableCell>
                              <TableCell>{lead.companyName || '-'}</TableCell>
                              <TableCell>
                                <a 
                                  href={`mailto:${lead.email}`} 
                                  className="text-blue-600 hover:underline flex items-center gap-1"
                                >
                                  <Mail className="h-3 w-3" />
                                  {lead.email}
                                </a>
                              </TableCell>
                              <TableCell>
                                {lead.phone ? (
                                  <a 
                                    href={`tel:${lead.phone}`}
                                    className="text-blue-600 hover:underline flex items-center gap-1"
                                  >
                                    <Phone className="h-3 w-3" />
                                    {lead.phone}
                                  </a>
                                ) : '-'}
                              </TableCell>
                              <TableCell>
                                <Badge className={`${statusColors[lead.status]} text-white flex items-center gap-1 w-fit`}>
                                  <StatusIcon className="h-3 w-3" />
                                  {statusLabels[lead.status]}
                                </Badge>
                              </TableCell>
                              <TableCell className="capitalize">{lead.sourceChannel}</TableCell>
                              <TableCell>
                                {new Date(lead.createdAt).toLocaleDateString('pt-BR')}
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleViewDetails(lead)}
                                  data-testid={`button-view-lead-${lead.id}`}
                                >
                                  Ver Detalhes
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Lead</DialogTitle>
          </DialogHeader>
          
          {selectedLead && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Nome</p>
                  <p className="text-base">{selectedLead.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Empresa</p>
                  <p className="text-base">{selectedLead.companyName || 'Não informada'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <a href={`mailto:${selectedLead.email}`} className="text-base text-blue-600 hover:underline">
                    {selectedLead.email}
                  </a>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Telefone</p>
                  {selectedLead.phone ? (
                    <a href={`tel:${selectedLead.phone}`} className="text-base text-blue-600 hover:underline">
                      {selectedLead.phone}
                    </a>
                  ) : (
                    <p className="text-base">Não informado</p>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Origem</p>
                  <p className="text-base capitalize">{selectedLead.sourceChannel}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Data de Cadastro</p>
                  <p className="text-base">
                    {new Date(selectedLead.createdAt).toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>

              {selectedLead.message && (
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2">Mensagem</p>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">{selectedLead.message}</p>
                  </div>
                </div>
              )}

              {(selectedLead.utmSource || selectedLead.utmMedium || selectedLead.utmCampaign) && (
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2">Informações de Marketing</p>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    {selectedLead.utmSource && <p><span className="font-medium">Fonte:</span> {selectedLead.utmSource}</p>}
                    {selectedLead.utmMedium && <p><span className="font-medium">Mídia:</span> {selectedLead.utmMedium}</p>}
                    {selectedLead.utmCampaign && <p><span className="font-medium">Campanha:</span> {selectedLead.utmCampaign}</p>}
                  </div>
                </div>
              )}

              <div className="space-y-4 pt-4 border-t">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    Atualizar Status
                  </label>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger data-testid="select-lead-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">Novo</SelectItem>
                      <SelectItem value="contacted">Contatado</SelectItem>
                      <SelectItem value="meeting_scheduled">Reunião Agendada</SelectItem>
                      <SelectItem value="proposal_sent">Proposta Enviada</SelectItem>
                      <SelectItem value="contracted">Contratado</SelectItem>
                      <SelectItem value="lost">Perdido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    Notas de Acompanhamento
                  </label>
                  <Textarea
                    value={followUpNotes}
                    onChange={(e) => setFollowUpNotes(e.target.value)}
                    placeholder="Adicione notas sobre o contato, reunião ou próximos passos..."
                    rows={4}
                    data-testid="textarea-follow-up-notes"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsDetailsDialogOpen(false)}
                    data-testid="button-cancel-update"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleUpdateStatus}
                    disabled={updateStatusMutation.isPending}
                    data-testid="button-save-lead"
                  >
                    {updateStatusMutation.isPending ? "Salvando..." : "Salvar Alterações"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
