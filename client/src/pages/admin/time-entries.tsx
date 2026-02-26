import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Edit, Clock, User, MapPin, Camera, AlertTriangle, Save, X, History as HistoryIcon, Paperclip } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatBrazilianDateTime, formatToDateTimeLocal, convertLocalToUTC } from "@shared/timezone";
import Sidebar from "@/components/layout/sidebar";
import TopBar from "@/components/layout/top-bar";

interface TimeEntry {
  id: number;
  userId: string;
  departmentId: number;
  clockInTime: string;
  clockOutTime?: string;
  clockInLatitude: number;
  clockInLongitude: number;
  clockOutLatitude?: number;
  clockOutLongitude?: number;
  totalHours?: string;
  regularHours?: string;
  overtimeHours?: string;
  date: string;
  status: string;
  entryType: string;
  faceRecognitionVerified?: boolean;
  clockInPhotoUrl?: string;
  clockOutPhotoUrl?: string;
  justification?: string;
  approvalStatus?: string;
  // Validation fields
  clockInIpAddress?: string;
  clockOutIpAddress?: string;
  clockInWithinGeofence?: boolean;
  clockOutWithinGeofence?: boolean;
  clockInShiftCompliant?: boolean;
  clockOutShiftCompliant?: boolean;
  clockInValidationMessage?: string;
  clockOutValidationMessage?: string;
  user?: {
    firstName: string;
    lastName: string;
    email: string;
  };
  department?: {
    name: string;
  };
}

const editTimeEntrySchema = z.object({
  clockInTime: z.string().min(1, "Horário de entrada é obrigatório"),
  clockOutTime: z.string().optional(),
  justification: z.string().min(5, "Justificativa deve ter pelo menos 5 caracteres"),
});

type EditTimeEntryForm = z.infer<typeof editTimeEntrySchema>;

interface EditTimeEntryDialogProps {
  entry: TimeEntry;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface AuditHistoryEntry {
  id: number;
  fieldName: string;
  oldValue: string | null;
  newValue: string | null;
  justification: string;
  attachmentUrl?: string | null;
  ipAddress?: string;
  createdAt: string;
  editor?: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

function formatAuditTimestampUTC(timestamp: string): string {
  const hasTimezone = /(?:Z|[+-]\d{2}:\d{2})$/i.test(timestamp);
  const normalized = hasTimezone ? timestamp : `${timestamp}Z`;
  const date = new Date(normalized);
  return date.toLocaleString('pt-BR', {
    timeZone: 'UTC',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

function EditTimeEntryDialog({ entry, open, onOpenChange }: EditTimeEntryDialogProps) {
  const { toast } = useToast();
  const [showHistory, setShowHistory] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const form = useForm<EditTimeEntryForm>({
    resolver: zodResolver(editTimeEntrySchema),
    defaultValues: {
      clockInTime: entry.clockInTime ? formatToDateTimeLocal(entry.clockInTime) : '',
      clockOutTime: entry.clockOutTime ? formatToDateTimeLocal(entry.clockOutTime) : '',
      justification: '',
    },
  });

  // Fetch audit history
  const { data: history = [] } = useQuery<AuditHistoryEntry[]>({
    queryKey: ["/api/admin/time-entries", entry.id, "history"],
    queryFn: async () => {
      const response = await fetch(`/api/admin/time-entries/${entry.id}/history`, {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to fetch history');
      }
      return response.json();
    },
    enabled: open && showHistory,
  });

  const uploadFile = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append('attachment', file);

    try {
      const response = await fetch('/api/admin/time-entry-attachment', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to upload file');
      }

      const result = await response.json();
      return result.url;
    } catch (error) {
      console.error('Upload error:', error);
      return null;
    }
  };

  useEffect(() => {
    if (!open) return;

    form.reset({
      clockInTime: entry.clockInTime ? formatToDateTimeLocal(entry.clockInTime) : '',
      clockOutTime: entry.clockOutTime ? formatToDateTimeLocal(entry.clockOutTime) : '',
      justification: '',
    });
    setShowHistory(false);
    setSelectedFile(null);
  }, [open, entry.id, entry.clockInTime, entry.clockOutTime, form]);

  const editMutation = useMutation({
    mutationFn: async ({ entryId, data }: { entryId: number; data: EditTimeEntryForm & { attachmentUrl?: string } }) => {
      const response = await apiRequest(`/api/admin/time-entries/${entryId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      return response.json();
    },
    onSuccess: async (updatedEntry: TimeEntry) => {
      queryClient.setQueriesData<TimeEntry[]>(
        { queryKey: ["/api/admin/time-entries"] },
        (oldEntries) => {
          if (!oldEntries) return oldEntries;
          return oldEntries.map((item) =>
            item.id === updatedEntry.id
              ? { ...item, ...updatedEntry }
              : item
          );
        }
      );

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["/api/admin/time-entries"] }),
        queryClient.invalidateQueries({ queryKey: ["/api/admin/time-entries", entry.id, "history"] }),
      ]);
      await queryClient.refetchQueries({ queryKey: ["/api/admin/time-entries"], type: "active" });

      toast({
        title: "Registro alterado",
        description: "O registro de ponto foi alterado com sucesso.",
      });
      onOpenChange(false);
      form.reset();
      setSelectedFile(null);
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao alterar registro",
        description: error.message || "Ocorreu um erro ao alterar o registro.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: EditTimeEntryForm) => {
    let attachmentUrl: string | undefined = undefined;

    // Upload file if selected
    if (selectedFile) {
      setUploading(true);
      const url = await uploadFile(selectedFile);
      setUploading(false);

      if (!url) {
        toast({
          title: "Erro no upload",
          description: "Não foi possível fazer o upload do comprovante.",
          variant: "destructive",
        });
        return;
      }
      attachmentUrl = url;
    }

    editMutation.mutate({ entryId: entry.id, data: { ...data, attachmentUrl } });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Registro de Ponto</DialogTitle>
        </DialogHeader>

        <div className="mb-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="text-sm">
            <p className="font-medium">{entry.user?.firstName} {entry.user?.lastName}</p>
            <p className="text-gray-600 dark:text-gray-400">{entry.user?.email}</p>
            <p className="text-gray-600 dark:text-gray-400">{entry.department?.name}</p>
            {entry.date && (
              <p className="text-xs text-gray-500 mt-1">Data: {format(parseISO(entry.date), 'dd/MM/yyyy')}</p>
            )}
          </div>
        </div>

        {/* History Toggle Button */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowHistory(!showHistory)}
          className="mb-2 w-full"
          data-testid="button-toggle-history"
        >
          <HistoryIcon className="h-4 w-4 mr-2" />
          {showHistory ? 'Ocultar Histórico' : 'Ver Histórico de Alterações'}
        </Button>

        {/* History Display */}
        {showHistory && (
          <div className="mb-2 max-h-48 overflow-y-auto border rounded-lg">
            {history.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Nenhuma alteração registrada</p>
              </div>
            ) : (
              <div className="divide-y">
                {history.map((audit) => (
                  <div key={audit.id} className="p-3 bg-white dark:bg-gray-900">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <p className="text-xs font-medium text-gray-900 dark:text-gray-100">
                          {audit.editor?.firstName} {audit.editor?.lastName}
                        </p>
                        <p className="text-xs text-gray-500">{audit.editor?.email}</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        {formatAuditTimestampUTC(audit.createdAt)} UTC
                      </p>
                    </div>
                    
                    <div className="text-sm mb-2">
                      <p className="font-medium text-gray-700 dark:text-gray-300">
                        Campo: {audit.fieldName === 'clockInTime' ? 'Entrada' : 'Saída'}
                      </p>
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        <div>
                          <p className="text-xs text-gray-500">De:</p>
                          <p className="text-sm text-red-600 dark:text-red-400">
                            {audit.oldValue ? formatBrazilianDateTime(audit.oldValue) : '-'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Para:</p>
                          <p className="text-sm text-green-600 dark:text-green-400">
                            {audit.newValue ? formatBrazilianDateTime(audit.newValue) : '-'}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded text-xs">
                      <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">Justificativa:</p>
                      <p className="text-gray-600 dark:text-gray-400">{audit.justification}</p>
                      {audit.attachmentUrl && (
                        <a
                          href={audit.attachmentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-800 mt-2"
                        >
                          <Paperclip className="h-3 w-3" />
                          Ver comprovante anexado
                        </a>
                      )}
                    </div>
                    
                    {audit.ipAddress && (
                      <p className="text-xs text-gray-400 mt-1">IP: {audit.ipAddress}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
            <FormField
              control={form.control}
              name="clockInTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Horário de Entrada</FormLabel>
                  <FormControl>
                    <Input
                      type="datetime-local"
                      {...field}
                      data-testid="input-clock-in-time"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="clockOutTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Horário de Saída (Opcional)</FormLabel>
                  <FormControl>
                    <Input
                      type="datetime-local"
                      {...field}
                      data-testid="input-clock-out-time"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="justification"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Justificativa da Alteração</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Explique o motivo da alteração do registro..."
                      className="min-h-[60px]"
                      data-testid="input-justification"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* File attachment */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Anexar Comprovante (Opcional)</label>
              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="flex-1"
                  data-testid="input-attachment"
                />
                {selectedFile && (
                  <div className="flex items-center gap-1 text-xs text-green-600">
                    <Paperclip className="h-3 w-3" />
                    {selectedFile.name}
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500">
                Atestados médicos, recibos, etc. (PDF, JPG, PNG - máx 5MB)
              </p>
            </div>

            <div className="flex gap-2 pt-2 sticky bottom-0 bg-white dark:bg-gray-950 pb-2 border-t mt-2">
              <Button
                type="submit"
                disabled={editMutation.isPending || uploading}
                className="flex-1"
                data-testid="button-save-changes"
              >
                <Save className="h-4 w-4 mr-2" />
                {uploading ? "Fazendo upload..." : editMutation.isPending ? "Salvando..." : "Salvar Alterações"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                data-testid="button-cancel"
              >
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminTimeEntries() {
  const { toast } = useToast();
  const today = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState<string>(today);
  const [endDate, setEndDate] = useState<string>(today);
  const [employeeFilter, setEmployeeFilter] = useState<string>("");
  const [selectedEntry, setSelectedEntry] = useState<TimeEntry | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // Queries
  const { data: entries = [], isLoading } = useQuery<TimeEntry[]>({
    queryKey: ["/api/admin/time-entries", startDate, endDate],
    queryFn: async () => {
      if (!startDate || !endDate) return [];
      const response = await fetch(`/api/admin/time-entries?startDate=${startDate}&endDate=${endDate}`, {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch time entries: ${response.statusText}`);
      }
      return response.json();
    },
    enabled: !!startDate && !!endDate,
  });

  const getStatusBadge = (entry: TimeEntry) => {
    if (entry.approvalStatus === 'pending') {
      return <Badge variant="outline" className="text-orange-600">Pendente</Badge>;
    }
    if (entry.approvalStatus === 'approved') {
      return <Badge variant="outline" className="text-green-600">Aprovado</Badge>;
    }
    if (entry.approvalStatus === 'rejected') {
      return <Badge variant="outline" className="text-red-600">Rejeitado</Badge>;
    }
    if (entry.status === 'active') {
      return <Badge variant="outline" className="text-blue-600">Ativo</Badge>;
    }
    if (entry.status === 'completed') {
      return <Badge variant="outline" className="text-green-600">Concluído</Badge>;
    }
    return <Badge variant="outline">{entry.status}</Badge>;
  };

  const getEntryTypeBadge = (entryType: string) => {
    if (entryType === 'manual_insertion') {
      return <Badge variant="secondary">Manual</Badge>;
    }
    return <Badge variant="default">Automático</Badge>;
  };

  const handleEditEntry = (entry: TimeEntry) => {
    setSelectedEntry(entry);
    setEditDialogOpen(true);
  };

  const uniqueEntries = useMemo(() => {
    const grouped = new Map<string, TimeEntry>();

    for (const entry of entries) {
      const key = `${entry.userId}|${entry.date}|${entry.clockInTime || 'no_clockin'}`;
      const current = grouped.get(key);

      if (!current) {
        grouped.set(key, entry);
        continue;
      }

      const currentUpdated = (current as any).updatedAt ? new Date((current as any).updatedAt as string).getTime() : 0;
      const entryUpdated = (entry as any).updatedAt ? new Date((entry as any).updatedAt as string).getTime() : 0;

      if (entryUpdated > currentUpdated || entry.id > current.id) {
        grouped.set(key, entry);
      }
    }

    return Array.from(grouped.values());
  }, [entries]);

  const filteredEntries = useMemo(() => {
    const term = employeeFilter.trim().toLowerCase();
    if (!term) return uniqueEntries;

    return uniqueEntries.filter((entry) => {
      const fullName = `${entry.user?.firstName || ''} ${entry.user?.lastName || ''}`.trim().toLowerCase();
      const email = (entry.user?.email || '').toLowerCase();
      return fullName.includes(term) || email.includes(term);
    });
  }, [uniqueEntries, employeeFilter]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <TopBar title="Administrar Registros de Ponto" />
      <div className="flex">
        <Sidebar />
        <div className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Administrar Registros de Ponto
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Visualize e edite registros de ponto dos funcionários
              </p>
            </div>

            <div className="mb-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5" />
                    Filtrar por Período
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-4 items-end">
                    <div className="flex-1 min-w-[200px]">
                      <label className="block text-sm font-medium mb-2">
                        Data Inicial
                      </label>
                      <Input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        max={endDate}
                        data-testid="input-start-date"
                      />
                    </div>
                    <div className="flex-1 min-w-[200px]">
                      <label className="block text-sm font-medium mb-2">
                        Data Final
                      </label>
                      <Input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        min={startDate}
                        data-testid="input-end-date"
                      />
                    </div>
                    <div className="flex-1 min-w-[240px]">
                      <label className="block text-sm font-medium mb-2">
                        Funcionário
                      </label>
                      <Input
                        type="text"
                        value={employeeFilter}
                        onChange={(e) => setEmployeeFilter(e.target.value)}
                        placeholder="Filtrar por nome ou e-mail"
                        data-testid="input-employee-filter"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {isLoading ? (
              <div className="text-center py-8">
                <Clock className="h-8 w-8 animate-spin mx-auto mb-2" />
                <p className="text-gray-600 dark:text-gray-400">Carregando registros...</p>
              </div>
            ) : filteredEntries.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Clock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600 dark:text-gray-400">
                    Nenhum registro encontrado para os filtros aplicados
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {filteredEntries.map((entry) => (
                  <Card key={entry.id} className="transition-shadow hover:shadow-md">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-gray-500" />
                              <span className="font-medium">
                                {entry.user?.firstName} {entry.user?.lastName}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              {getStatusBadge(entry)}
                              {getEntryTypeBadge(entry.entryType)}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600 dark:text-gray-400">Entrada</p>
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-green-600" />
                                <span className="font-medium">
                                  {entry.clockInTime ? formatBrazilianDateTime(entry.clockInTime) : 'N/A'}
                                </span>
                                {entry.faceRecognitionVerified && (
                                  <Camera className="h-4 w-4 text-blue-600" />
                                )}
                              </div>
                            </div>

                            <div>
                              <p className="text-gray-600 dark:text-gray-400">Saída</p>
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-red-600" />
                                <span className="font-medium">
                                  {entry.clockOutTime ? formatBrazilianDateTime(entry.clockOutTime) : 'Em aberto'}
                                </span>
                              </div>
                            </div>

                            <div>
                              <p className="text-gray-600 dark:text-gray-400">Horas Trabalhadas</p>
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-purple-600" />
                                <span className="font-medium">
                                  {entry.totalHours ? `${parseFloat(entry.totalHours).toFixed(2)}h` : 'N/A'}
                                </span>
                              </div>
                            </div>
                          </div>

                          {entry.justification && (
                            <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded">
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Justificativa:</p>
                              <p className="text-sm">{entry.justification}</p>
                            </div>
                          )}

                          {/* Validation Messages - Show Inconsistencies */}
                          {(entry.clockInValidationMessage || entry.clockOutValidationMessage) && (
                            <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded">
                              <div className="flex items-start gap-2">
                                <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-amber-800 dark:text-amber-300 mb-2">
                                    Validações do Registro
                                  </p>
                                  {entry.clockInValidationMessage && (
                                    <div className="mb-2">
                                      <p className="text-xs text-amber-700 dark:text-amber-400 font-medium mb-1">
                                        Entrada:
                                      </p>
                                      <pre className="text-xs text-amber-700 dark:text-amber-400 whitespace-pre-wrap">
                                        {entry.clockInValidationMessage}
                                      </pre>
                                    </div>
                                  )}
                                  {entry.clockOutValidationMessage && (
                                    <div>
                                      <p className="text-xs text-amber-700 dark:text-amber-400 font-medium mb-1">
                                        Saída:
                                      </p>
                                      <pre className="text-xs text-amber-700 dark:text-amber-400 whitespace-pre-wrap">
                                        {entry.clockOutValidationMessage}
                                      </pre>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Fotos de Reconhecimento Facial */}
                          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded">
                            <div className="flex items-start gap-2 mb-3">
                              <Camera className="h-4 w-4 text-blue-600 mt-0.5" />
                              <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
                                Fotos de Reconhecimento Facial
                              </p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              {/* Foto de Entrada */}
                              <div>
                                <p className="text-xs text-blue-700 dark:text-blue-400 font-medium mb-2">
                                  Foto de Entrada
                                </p>
                                {entry.clockInPhotoUrl ? (
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <button 
                                        className="cursor-pointer hover:opacity-75 transition-opacity"
                                        data-testid={`button-view-clockin-photo-${entry.id}`}
                                      >
                                        <img 
                                          src={entry.clockInPhotoUrl} 
                                          alt="Foto de entrada" 
                                          className="w-32 h-32 object-cover rounded border border-blue-300 dark:border-blue-700"
                                        />
                                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 underline">
                                          Clique para ampliar
                                        </p>
                                      </button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-2xl">
                                      <DialogHeader>
                                        <DialogTitle>Foto de Reconhecimento Facial - Entrada</DialogTitle>
                                      </DialogHeader>
                                      <div className="flex justify-center">
                                        <img 
                                          src={entry.clockInPhotoUrl} 
                                          alt="Foto de entrada ampliada" 
                                          className="max-w-full h-auto rounded"
                                        />
                                      </div>
                                    </DialogContent>
                                  </Dialog>
                                ) : (
                                  <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 dark:bg-gray-800 p-3 rounded border border-dashed h-32">
                                    <Camera className="h-4 w-4" />
                                    <span>Não disponível</span>
                                  </div>
                                )}
                              </div>
                              
                              {/* Foto de Saída */}
                              {entry.clockOutTime && (
                                <div>
                                  <p className="text-xs text-blue-700 dark:text-blue-400 font-medium mb-2">
                                    Foto de Saída
                                  </p>
                                  {entry.clockOutPhotoUrl ? (
                                    <Dialog>
                                      <DialogTrigger asChild>
                                        <button 
                                          className="cursor-pointer hover:opacity-75 transition-opacity"
                                          data-testid={`button-view-clockout-photo-${entry.id}`}
                                        >
                                          <img 
                                            src={entry.clockOutPhotoUrl} 
                                            alt="Foto de saída" 
                                            className="w-32 h-32 object-cover rounded border border-blue-300 dark:border-blue-700"
                                          />
                                          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 underline">
                                            Clique para ampliar
                                          </p>
                                        </button>
                                      </DialogTrigger>
                                      <DialogContent className="max-w-2xl">
                                        <DialogHeader>
                                          <DialogTitle>Foto de Reconhecimento Facial - Saída</DialogTitle>
                                        </DialogHeader>
                                        <div className="flex justify-center">
                                          <img 
                                            src={entry.clockOutPhotoUrl} 
                                            alt="Foto de saída ampliada" 
                                            className="max-w-full h-auto rounded"
                                          />
                                        </div>
                                      </DialogContent>
                                    </Dialog>
                                  ) : (
                                    <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 dark:bg-gray-800 p-3 rounded border border-dashed h-32">
                                      <Camera className="h-4 w-4" />
                                      <span>Não disponível</span>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              <span>
                                {entry.clockInLatitude?.toFixed(4)}, {entry.clockInLongitude?.toFixed(4)}
                              </span>
                            </div>
                            {entry.clockInIpAddress && (
                              <span title="IP da Entrada">IP: {entry.clockInIpAddress}</span>
                            )}
                            <span>Departamento: {entry.department?.name || 'N/A'}</span>
                          </div>
                        </div>

                        <div className="ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditEntry(entry)}
                            data-testid={`button-edit-${entry.id}`}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {selectedEntry && (
              <EditTimeEntryDialog
                entry={selectedEntry}
                open={editDialogOpen}
                onOpenChange={setEditDialogOpen}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
