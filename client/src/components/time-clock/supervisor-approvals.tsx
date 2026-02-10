import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CheckCircle, XCircle, Clock, FileText, User, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TimeEntry {
  id: number;
  userId: string;
  clockInTime: string;
  clockOutTime?: string;
  date: string;
  justification: string;
  supportDocumentUrl?: string;
  entryType: string;
  approvalStatus: string;
  insertedBy: string;
  createdAt: string;
  user?: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export default function SupervisorApprovals() {
  const [selectedEntry, setSelectedEntry] = useState<TimeEntry | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');
  const [rejectionReason, setRejectionReason] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: pendingEntries = [], isLoading } = useQuery({
    queryKey: ["/api/time-clock/pending-approval"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const approvalMutation = useMutation({
    mutationFn: ({ entryId, action, reason }: { entryId: number; action: 'approve' | 'reject'; reason?: string }) => 
      apiRequest(`/api/time-clock/approve/${entryId}`, {
        method: 'POST',
        body: JSON.stringify({ action, reason }),
      }),
    onSuccess: (_, variables) => {
      toast({
        title: variables.action === 'approve' ? "Entrada aprovada" : "Entrada rejeitada",
        description: variables.action === 'approve' 
          ? "A entrada manual foi aprovada com sucesso." 
          : "A entrada manual foi rejeitada.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/time-clock/pending-approval"] });
      setIsDialogOpen(false);
      setSelectedEntry(null);
      setRejectionReason('');
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao processar aprovação",
        description: error.message || "Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const handleApproval = (entry: TimeEntry, action: 'approve' | 'reject') => {
    setSelectedEntry(entry);
    setActionType(action);
    setIsDialogOpen(true);
  };

  const confirmApproval = () => {
    if (!selectedEntry) return;
    
    if (actionType === 'reject' && !rejectionReason.trim()) {
      toast({
        title: "Motivo necessário",
        description: "Por favor, informe o motivo da rejeição.",
        variant: "destructive",
      });
      return;
    }

    approvalMutation.mutate({
      entryId: selectedEntry.id,
      action: actionType,
      reason: actionType === 'reject' ? rejectionReason : undefined,
    });
  };

  const calculateHours = (clockIn: string, clockOut?: string) => {
    if (!clockOut) return 'Em andamento';
    
    const start = new Date(clockIn);
    const end = new Date(clockOut);
    const diff = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    return `${diff.toFixed(2)}h`;
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="text-center text-orange-600">Carregando entradas pendentes...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-800">
            <FileText className="h-5 w-5" />
            Aprovações Pendentes
            {pendingEntries.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {pendingEntries.length}
              </Badge>
            )}
          </CardTitle>
          <p className="text-sm text-orange-600">
            Analise e aprove ou rejeite as solicitações de inclusão manual de horários.
          </p>
        </CardHeader>
        <CardContent>
          {pendingEntries.length === 0 ? (
            <div className="text-center py-8 text-orange-600">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma entrada pendente de aprovação.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingEntries.map((entry: TimeEntry) => (
                <Card key={entry.id} className="border border-orange-200">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 text-sm text-orange-700">
                          <User className="h-4 w-4" />
                          <span className="font-medium">
                            {entry.user?.firstName} {entry.user?.lastName}
                          </span>
                          <span>({entry.user?.email})</span>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(entry.date)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>
                              {formatDateTime(entry.clockInTime)}
                              {entry.clockOutTime && (
                                <> → {formatDateTime(entry.clockOutTime)}</>
                              )}
                            </span>
                          </div>
                          <Badge variant="outline">
                            {calculateHours(entry.clockInTime, entry.clockOutTime)}
                          </Badge>
                        </div>

                        <div className="bg-orange-50 p-3 rounded border border-orange-200">
                          <p className="text-sm text-orange-800">
                            <strong>Justificativa:</strong> {entry.justification}
                          </p>
                          {entry.supportDocumentUrl && (
                            <p className="text-sm text-orange-700 mt-1">
                              <strong>Documento:</strong> 
                              <a 
                                href={entry.supportDocumentUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="ml-1 underline hover:text-orange-800"
                                data-testid={`link-document-${entry.id}`}
                              >
                                Ver documento
                              </a>
                            </p>
                          )}
                        </div>

                        <div className="text-xs text-orange-600">
                          Solicitado em: {formatDateTime(entry.createdAt)}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 ml-4">
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => handleApproval(entry, 'approve')}
                          data-testid={`button-approve-${entry.id}`}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Aprovar
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleApproval(entry, 'reject')}
                          data-testid={`button-reject-${entry.id}`}
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' ? 'Aprovar Entrada' : 'Rejeitar Entrada'}
            </DialogTitle>
          </DialogHeader>
          
          {selectedEntry && (
            <div className="space-y-4">
              <div className="bg-orange-50 p-4 rounded border border-orange-200">
                <p className="text-sm">
                  <strong>Funcionário:</strong> {selectedEntry.user?.firstName} {selectedEntry.user?.lastName}
                </p>
                <p className="text-sm">
                  <strong>Data:</strong> {formatDate(selectedEntry.date)}
                </p>
                <p className="text-sm">
                  <strong>Horário:</strong> {formatDateTime(selectedEntry.clockInTime)}
                  {selectedEntry.clockOutTime && (
                    <> → {formatDateTime(selectedEntry.clockOutTime)}</>
                  )}
                </p>
                <p className="text-sm">
                  <strong>Justificativa:</strong> {selectedEntry.justification}
                </p>
              </div>

              {actionType === 'reject' && (
                <div className="space-y-2">
                  <Label htmlFor="rejection-reason">Motivo da Rejeição *</Label>
                  <Textarea
                    id="rejection-reason"
                    placeholder="Explique o motivo da rejeição..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="min-h-[100px]"
                    data-testid="textarea-rejection-reason"
                  />
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={confirmApproval}
              disabled={approvalMutation.isPending}
              className={actionType === 'approve' 
                ? "bg-green-600 hover:bg-green-700" 
                : "bg-red-600 hover:bg-red-700"
              }
              data-testid="button-confirm-approval"
            >
              {approvalMutation.isPending ? "Processando..." : (
                actionType === 'approve' ? 'Confirmar Aprovação' : 'Confirmar Rejeição'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}