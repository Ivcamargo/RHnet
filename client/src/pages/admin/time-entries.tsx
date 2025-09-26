import { useState } from "react";
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
import { CalendarIcon, Edit, Clock, User, MapPin, Camera, AlertTriangle, Save, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatBrazilianDateTime } from "@shared/timezone";
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

function EditTimeEntryDialog({ entry, open, onOpenChange }: EditTimeEntryDialogProps) {
  const { toast } = useToast();

  const form = useForm<EditTimeEntryForm>({
    resolver: zodResolver(editTimeEntrySchema),
    defaultValues: {
      clockInTime: entry.clockInTime ? new Date(entry.clockInTime).toISOString().slice(0, 16) : '',
      clockOutTime: entry.clockOutTime ? new Date(entry.clockOutTime).toISOString().slice(0, 16) : '',
      justification: '',
    },
  });

  const editMutation = useMutation({
    mutationFn: ({ entryId, data }: { entryId: number; data: EditTimeEntryForm }) =>
      apiRequest(`/api/admin/time-entries/${entryId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      toast({
        title: "Registro alterado",
        description: "O registro de ponto foi alterado com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/time-entries"] });
      onOpenChange(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao alterar registro",
        description: error.message || "Ocorreu um erro ao alterar o registro.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: EditTimeEntryForm) => {
    editMutation.mutate({ entryId: entry.id, data });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Registro de Ponto</DialogTitle>
        </DialogHeader>

        <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="text-sm">
            <p className="font-medium">{entry.user?.firstName} {entry.user?.lastName}</p>
            <p className="text-gray-600 dark:text-gray-400">{entry.user?.email}</p>
            <p className="text-gray-600 dark:text-gray-400">{entry.department?.name}</p>
            <p className="text-xs text-gray-500 mt-1">Data: {format(parseISO(entry.date), 'dd/MM/yyyy')}</p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                      className="min-h-[100px]"
                      data-testid="input-justification"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-2 pt-4">
              <Button
                type="submit"
                disabled={editMutation.isPending}
                className="flex-1"
                data-testid="button-save-changes"
              >
                <Save className="h-4 w-4 mr-2" />
                {editMutation.isPending ? "Salvando..." : "Salvar Alterações"}
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
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedEntry, setSelectedEntry] = useState<TimeEntry | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // Queries
  const selectedDateString = selectedDate ? selectedDate.toISOString().split('T')[0] : null;
  
  const { data: entries = [], isLoading } = useQuery<TimeEntry[]>({
    queryKey: ["/api/admin/time-entries", selectedDateString],
    queryFn: async () => {
      if (!selectedDateString) return [];
      const response = await fetch(`/api/admin/time-entries?date=${selectedDateString}`, {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch time entries: ${response.statusText}`);
      }
      return response.json();
    },
    enabled: !!selectedDateString,
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <TopBar />
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
                    <Calendar className="h-5 w-5" />
                    Selecionar Data
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-[280px] justify-start text-left font-normal",
                          !selectedDate && "text-muted-foreground"
                        )}
                        data-testid="button-select-date"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, "dd/MM/yyyy") : "Selecionar data"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </CardContent>
              </Card>
            </div>

            {isLoading ? (
              <div className="text-center py-8">
                <Clock className="h-8 w-8 animate-spin mx-auto mb-2" />
                <p className="text-gray-600 dark:text-gray-400">Carregando registros...</p>
              </div>
            ) : entries.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Clock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600 dark:text-gray-400">
                    Nenhum registro encontrado para esta data
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {entries.map((entry) => (
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
                                  <Camera className="h-4 w-4 text-blue-600" title="Verificação facial" />
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

                          <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              <span>
                                {entry.clockInLatitude?.toFixed(4)}, {entry.clockInLongitude?.toFixed(4)}
                              </span>
                            </div>
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