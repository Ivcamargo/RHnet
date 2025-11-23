import Sidebar from "@/components/layout/sidebar";
import TopBar from "@/components/layout/top-bar";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest } from "@/lib/queryClient";
import { useMutation, useQuery } from "@tanstack/react-query";
import { CalendarIcon, Clock, FileText, Plus, Trash2, Upload, X } from "lucide-react";
import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { insertAbsenceSchema, type Absence, type VacationBalance } from "@shared/schema";
import { z } from "zod";
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
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300",
  approved: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300",
  cancelled: "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300"
};

export default function MyAbsences() {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: absences, isLoading: absencesLoading } = useQuery<Absence[]>({
    queryKey: ['/api/absences'],
  });

  const { data: userInfo } = useQuery<{ id: string; role: string; }>({
    queryKey: ["/api/auth/user"],
  });

  const { data: vacationBalance } = useQuery<VacationBalance>({
    queryKey: ['/api/vacation-balance', userInfo?.id],
    enabled: !!userInfo?.id,
  });

  // Calculate pending vacation days
  const pendingVacationDays = absences
    ?.filter(a => a.status === 'pending' && a.type === 'vacation')
    ?.reduce((sum, a) => sum + a.totalDays, 0) || 0;

  const form = useForm<z.infer<typeof insertAbsenceSchema>>({
    resolver: zodResolver(insertAbsenceSchema),
    defaultValues: {
      type: "vacation",
      startDate: "",
      endDate: "",
      totalDays: 0,
      reason: undefined,
      documentUrl: undefined,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: z.infer<typeof insertAbsenceSchema>) => {
      return await apiRequest('/api/absences', 'POST', data);
    },
    onSuccess: () => {
      toast({
        title: "Solicitação enviada!",
        description: "Sua solicitação foi enviada para aprovação do RH.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/absences'] });
      queryClient.invalidateQueries({ queryKey: ['/api/vacation-balance', userInfo?.id] });
      
      // Reset form and upload state
      form.reset();
      setSelectedFile(null);
      setUploadedFileUrl("");
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      setShowForm(false);
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao enviar solicitação",
        description: error.message || "Tente novamente mais tarde.",
        variant: "destructive",
      });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/absences/${id}/cancel`, 'POST', {});
    },
    onSuccess: () => {
      toast({
        title: "Solicitação cancelada!",
        description: "Sua solicitação foi cancelada com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/absences'] });
      queryClient.invalidateQueries({ queryKey: ['/api/vacation-balance', userInfo?.id] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao cancelar",
        description: error.message || "Tente novamente mais tarde.",
        variant: "destructive",
      });
    },
  });

  const uploadFileMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/absences/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Erro ao fazer upload do arquivo');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setUploadedFileUrl(data.filePath);
      form.setValue('documentUrl', data.filePath);
      toast({
        title: "Arquivo enviado!",
        description: "Documento anexado com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao enviar arquivo",
        description: error.message || "Tente novamente mais tarde.",
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Tipo de arquivo inválido",
          description: "Apenas PDF, JPG e PNG são permitidos.",
          variant: "destructive",
        });
        return;
      }
      
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Arquivo muito grande",
          description: "O arquivo deve ter no máximo 5MB.",
          variant: "destructive",
        });
        return;
      }
      
      setSelectedFile(file);
      uploadFileMutation.mutate(file);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setUploadedFileUrl("");
    form.setValue('documentUrl', undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const onSubmit = (data: z.infer<typeof insertAbsenceSchema>) => {
    // Prevent submission if file upload is still in progress
    if (uploadFileMutation.isPending) {
      toast({
        title: "Aguarde",
        description: "O arquivo ainda está sendo enviado. Aguarde a conclusão do upload.",
        variant: "destructive",
      });
      return;
    }
    
    createMutation.mutate(data);
  };

  const calculateDays = () => {
    const startDate = form.watch("startDate");
    const endDate = form.watch("endDate");
    
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      // Validate chronological order
      if (end < start) {
        toast({
          title: "Data inválida",
          description: "A data final não pode ser anterior à data inicial.",
          variant: "destructive",
        });
        form.setValue("totalDays", 0);
        return;
      }
      
      const diffTime = end.getTime() - start.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      form.setValue("totalDays", diffDays);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-orange-50 via-red-50 to-orange-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Sidebar />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar title="Minhas Férias e Afastamentos" />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Vacation Balance Card */}
            {vacationBalance && (
              <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-orange-200 dark:border-slate-700 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-[hsl(210,100%,25%)] to-[hsl(180,60%,70%)] text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5" />
                    Saldo de Férias
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 dark:bg-transparent">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Direito Adquirido</p>
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{vacationBalance.totalDaysEarned} dias</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Disponível</p>
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">{vacationBalance.currentBalance} dias</p>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Pendente</p>
                      <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{pendingVacationDays} dias</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-900/20 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Usados</p>
                      <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">{vacationBalance.totalDaysUsed} dias</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-center">
                    Última atualização: {vacationBalance.lastCalculatedAt ? new Date(vacationBalance.lastCalculatedAt).toLocaleDateString('pt-BR') : 'Nunca'}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Request Form */}
            {!showForm ? (
              <Button 
                onClick={() => setShowForm(true)} 
                className="w-full bg-gradient-to-r from-[hsl(210,100%,25%)] to-[hsl(180,60%,70%)] hover:from-[hsl(210,100%,35%)] hover:to-[hsl(180,60%,80%)] text-white"
                data-testid="button-new-absence"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nova Solicitação de Férias/Afastamento
              </Button>
            ) : (
              <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-orange-200 dark:border-slate-700 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-[hsl(210,100%,25%)] to-[hsl(180,60%,70%)] text-white rounded-t-lg">
                  <CardTitle>Nova Solicitação</CardTitle>
                  <CardDescription className="text-gray-100">
                    Preencha os dados abaixo para solicitar férias ou afastamento
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 dark:bg-transparent">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-black dark:text-white">Tipo de Ausência *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-absence-type">
                                  <SelectValue placeholder="Selecione o tipo" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {Object.entries(absenceTypeLabels).map(([value, label]) => (
                                  <SelectItem key={value} value={value}>
                                    {label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="startDate"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel className="text-black dark:text-white">Data Início *</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant="outline"
                                      className={cn(
                                        "w-full pl-3 text-left font-normal",
                                        !field.value && "text-muted-foreground"
                                      )}
                                      data-testid="button-start-date"
                                    >
                                      {field.value ? (
                                        format(new Date(field.value), "dd/MM/yyyy", { locale: ptBR })
                                      ) : (
                                        <span>Selecione a data</span>
                                      )}
                                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={field.value ? new Date(field.value) : undefined}
                                    onSelect={(date) => {
                                      field.onChange(date ? format(date, "yyyy-MM-dd") : "");
                                      calculateDays();
                                    }}
                                    locale={ptBR}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="endDate"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel className="text-black dark:text-white">Data Fim *</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant="outline"
                                      className={cn(
                                        "w-full pl-3 text-left font-normal",
                                        !field.value && "text-muted-foreground"
                                      )}
                                      data-testid="button-end-date"
                                    >
                                      {field.value ? (
                                        format(new Date(field.value), "dd/MM/yyyy", { locale: ptBR })
                                      ) : (
                                        <span>Selecione a data</span>
                                      )}
                                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={field.value ? new Date(field.value) : undefined}
                                    onSelect={(date) => {
                                      field.onChange(date ? format(date, "yyyy-MM-dd") : "");
                                      calculateDays();
                                    }}
                                    locale={ptBR}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="totalDays"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-black dark:text-white">Total de Dias</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  {...field} 
                                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                                  readOnly 
                                  className="bg-gray-100 dark:bg-gray-700"
                                  data-testid="input-total-days"
                                />
                              </FormControl>
                              <FormDescription className="text-gray-600 dark:text-gray-400">
                                Calculado automaticamente
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="reason"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-black dark:text-white">Motivo/Observações</FormLabel>
                            <FormControl>
                              <Textarea 
                                {...field} 
                                placeholder="Descreva o motivo da solicitação (opcional para férias, obrigatório para outros tipos)"
                                rows={3}
                                data-testid="textarea-reason"
                              />
                            </FormControl>
                            <FormDescription className="text-gray-600 dark:text-gray-400">
                              Mínimo de 10 caracteres se preenchido
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Document Upload Field */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-black dark:text-white">
                          Documento Comprobatório (Opcional)
                        </label>
                        <div className="flex flex-col gap-2">
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={handleFileSelect}
                            className="hidden"
                            id="file-upload"
                          />
                          
                          {!selectedFile && !uploadedFileUrl ? (
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => fileInputRef.current?.click()}
                              className="w-full justify-start"
                              disabled={uploadFileMutation.isPending}
                              data-testid="button-choose-file"
                            >
                              <Upload className="h-4 w-4 mr-2" />
                              {uploadFileMutation.isPending ? "Enviando..." : "Escolher e Anexar"}
                            </Button>
                          ) : (
                            <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
                              <FileText className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                              <span className="flex-1 text-sm text-green-800 dark:text-green-300 truncate">
                                {selectedFile?.name || "Documento anexado"}
                              </span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={handleRemoveFile}
                                className="h-6 w-6 p-0 text-green-600 dark:text-green-400 hover:text-red-600 dark:hover:text-red-400"
                                data-testid="button-remove-file"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Anexe atestado médico, certidão ou outro comprovante (PDF, JPG, PNG - máx. 5MB)
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <Button 
                          type="submit" 
                          disabled={createMutation.isPending || uploadFileMutation.isPending}
                          className="bg-gradient-to-r from-[hsl(210,100%,25%)] to-[hsl(180,60%,70%)] hover:from-[hsl(210,100%,35%)] hover:to-[hsl(180,60%,80%)] text-white"
                          data-testid="button-submit-absence"
                        >
                          {uploadFileMutation.isPending 
                            ? "Enviando arquivo..." 
                            : createMutation.isPending 
                            ? "Enviando solicitação..." 
                            : "Enviar Solicitação"}
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => {
                            setShowForm(false);
                            form.reset();
                            setSelectedFile(null);
                            setUploadedFileUrl("");
                            if (fileInputRef.current) {
                              fileInputRef.current.value = '';
                            }
                          }}
                          data-testid="button-cancel-form"
                        >
                          Cancelar
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            )}

            {/* Absences History */}
            <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-orange-200 dark:border-slate-700 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-[hsl(210,100%,25%)] to-[hsl(180,60%,70%)] text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Histórico de Solicitações
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 dark:bg-transparent">
                {absencesLoading ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <Clock className="h-8 w-8 animate-spin mx-auto mb-2" />
                    Carregando...
                  </div>
                ) : !absences || absences.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Nenhuma solicitação encontrada</p>
                    <p className="text-sm">Clique no botão acima para fazer sua primeira solicitação</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="border-b border-gray-200 dark:border-gray-700">
                        <tr className="text-left">
                          <th className="pb-3 font-medium text-gray-700 dark:text-gray-300">Tipo</th>
                          <th className="pb-3 font-medium text-gray-700 dark:text-gray-300">Período</th>
                          <th className="pb-3 font-medium text-gray-700 dark:text-gray-300">Dias</th>
                          <th className="pb-3 font-medium text-gray-700 dark:text-gray-300">Anexo</th>
                          <th className="pb-3 font-medium text-gray-700 dark:text-gray-300">Status</th>
                          <th className="pb-3 font-medium text-gray-700 dark:text-gray-300">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {absences.map((absence) => (
                          <tr key={absence.id} className="text-gray-900 dark:text-gray-100">
                            <td className="py-3" data-testid={`text-type-${absence.id}`}>
                              {absenceTypeLabels[absence.type]}
                            </td>
                            <td className="py-3" data-testid={`text-period-${absence.id}`}>
                              {formatBrazilianDate(absence.startDate)} - {formatBrazilianDate(absence.endDate)}
                            </td>
                            <td className="py-3" data-testid={`text-days-${absence.id}`}>
                              {absence.totalDays}
                            </td>
                            <td className="py-3">
                              {absence.documentUrl ? (
                                <a
                                  href={absence.documentUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                  data-testid={`link-document-${absence.id}`}
                                >
                                  <FileText className="h-4 w-4" />
                                </a>
                              ) : (
                                <span className="text-gray-400 dark:text-gray-600" data-testid={`text-no-document-${absence.id}`}>
                                  -
                                </span>
                              )}
                            </td>
                            <td className="py-3">
                              <span 
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[absence.status]}`}
                                data-testid={`status-${absence.id}`}
                              >
                                {statusLabels[absence.status]}
                              </span>
                            </td>
                            <td className="py-3">
                              {absence.status === 'pending' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => cancelMutation.mutate(absence.id)}
                                  disabled={cancelMutation.isPending}
                                  className="text-red-600 hover:text-red-800 hover:bg-red-100 dark:hover:bg-red-900/20"
                                  data-testid={`button-cancel-${absence.id}`}
                                >
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  Cancelar
                                </Button>
                              )}
                              {absence.rejectionReason && (
                                <p className="text-xs text-red-600 dark:text-red-400 mt-1" data-testid={`text-rejection-${absence.id}`}>
                                  Motivo: {absence.rejectionReason}
                                </p>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
