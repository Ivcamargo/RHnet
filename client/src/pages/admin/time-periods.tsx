import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Lock, Unlock, Plus, Clock, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { TimePeriod } from "@shared/schema";
import Sidebar from "@/components/layout/sidebar";
import TopBar from "@/components/layout/top-bar";

const createPeriodSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  startDate: z.date({ required_error: "Data inicial é obrigatória" }),
  endDate: z.date({ required_error: "Data final é obrigatória" }),
  description: z.string().optional(),
});

const closePeriodSchema = z.object({
  reason: z.string().min(1, "Motivo é obrigatório"),
});

type CreatePeriodForm = z.infer<typeof createPeriodSchema>;
type ClosePeriodForm = z.infer<typeof closePeriodSchema>;

export default function TimePeriodsAdmin() {
  const { toast } = useToast();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [closeDialogOpen, setCloseDialogOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod | null>(null);

  // Forms
  const createForm = useForm<CreatePeriodForm>({
    resolver: zodResolver(createPeriodSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const closeForm = useForm<ClosePeriodForm>({
    resolver: zodResolver(closePeriodSchema),
    defaultValues: {
      reason: "",
    },
  });

  // Queries
  const { data: periods = [], isLoading } = useQuery<TimePeriod[]>({
    queryKey: ["/api/admin/time-periods"],
  });

  // Mutations
  const createPeriodMutation = useMutation({
    mutationFn: async (data: CreatePeriodForm) => {
      return apiRequest("/api/admin/time-periods", {
        method: "POST",
        body: JSON.stringify({
          ...data,
          startDate: format(data.startDate, "yyyy-MM-dd"),
          endDate: format(data.endDate, "yyyy-MM-dd"),
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/time-periods"] });
      setCreateDialogOpen(false);
      createForm.reset();
      toast({
        title: "Período criado",
        description: "O período foi criado com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar período",
        variant: "destructive",
      });
    },
  });

  const closePeriodMutation = useMutation({
    mutationFn: async ({ periodId, reason }: { periodId: number; reason: string }) => {
      return apiRequest(`/api/admin/time-periods/${periodId}/close`, {
        method: "POST",
        body: JSON.stringify({ reason }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/time-periods"] });
      setCloseDialogOpen(false);
      closeForm.reset();
      setSelectedPeriod(null);
      toast({
        title: "Período fechado",
        description: "O período foi fechado com sucesso. Registros neste período não podem mais ser modificados.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao fechar período",
        variant: "destructive",
      });
    },
  });

  const reopenPeriodMutation = useMutation({
    mutationFn: async ({ periodId, reason }: { periodId: number; reason: string }) => {
      return apiRequest(`/api/admin/time-periods/${periodId}/reopen`, {
        method: "POST",
        body: JSON.stringify({ reason }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/time-periods"] });
      setCloseDialogOpen(false);
      closeForm.reset();
      setSelectedPeriod(null);
      toast({
        title: "Período reaberto",
        description: "O período foi reaberto com sucesso. Registros podem ser novamente modificados.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao reabrir período",
        variant: "destructive",
      });
    },
  });

  const onCreateSubmit = (data: CreatePeriodForm) => {
    if (data.startDate >= data.endDate) {
      createForm.setError("endDate", {
        message: "Data final deve ser posterior à data inicial",
      });
      return;
    }
    createPeriodMutation.mutate(data);
  };

  const onCloseSubmit = (data: ClosePeriodForm) => {
    if (!selectedPeriod) return;
    
    if (selectedPeriod.status === "closed") {
      reopenPeriodMutation.mutate({
        periodId: selectedPeriod.id,
        reason: data.reason,
      });
    } else {
      closePeriodMutation.mutate({
        periodId: selectedPeriod.id,
        reason: data.reason,
      });
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === "open") {
      return (
        <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
          <Unlock className="h-3 w-3 mr-1" />
          Aberto
        </Badge>
      );
    }
    return (
      <Badge variant="destructive">
        <Lock className="h-3 w-3 mr-1" />
        Fechado
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex h-screen overflow-hidden bg-gradient-to-br from-blue-50 via-teal-50 to-green-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <Sidebar />
        
        <div className="flex flex-col flex-1 overflow-hidden">
          <TopBar title="Gestão de Períodos" />
          
          <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-3xl font-bold">Gestão de Períodos</h1>
                  <p className="text-muted-foreground">Controle os períodos de registro de ponto eletrônico</p>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader className="h-24 bg-gray-200 dark:bg-gray-700" />
                    <CardContent className="h-32 bg-gray-100 dark:bg-gray-800" />
                  </Card>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-blue-50 via-teal-50 to-green-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Sidebar />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar title="Gestão de Períodos" />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestão de Períodos</h1>
          <p className="text-muted-foreground">
            Controle os períodos de registro de ponto eletrônico
          </p>
        </div>
        
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-period">
              <Plus className="h-4 w-4 mr-2" />
              Criar Período
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Criar Novo Período</DialogTitle>
              <DialogDescription>
                Defina um período para controle de registros de ponto
              </DialogDescription>
            </DialogHeader>
            <Form {...createForm}>
              <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
                <FormField
                  control={createForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Período</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Janeiro 2025" {...field} data-testid="input-period-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={createForm.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Data Inicial</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                                data-testid="button-start-date"
                              >
                                {field.value ? (
                                  format(field.value, "dd/MM/yyyy")
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
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date < new Date(new Date().setHours(0, 0, 0, 0))
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={createForm.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Data Final</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                                data-testid="button-end-date"
                              >
                                {field.value ? (
                                  format(field.value, "dd/MM/yyyy")
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
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date < new Date(new Date().setHours(0, 0, 0, 0))
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={createForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição (Opcional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Descrição do período..."
                          {...field}
                          data-testid="textarea-period-description"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCreateDialogOpen(false)}
                    data-testid="button-cancel-create"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit"
                    disabled={createPeriodMutation.isPending}
                    data-testid="button-submit-create"
                  >
                    {createPeriodMutation.isPending ? "Criando..." : "Criar Período"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Warning about closed periods */}
      <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
        <CardContent className="flex items-center space-x-2 pt-6">
          <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          <p className="text-sm text-orange-800 dark:text-orange-200">
            <strong>Atenção:</strong> Períodos fechados impedem a modificação de registros de ponto. 
            Certifique-se de que todos os ajustes necessários foram feitos antes de fechar um período.
          </p>
        </CardContent>
      </Card>

      {/* Periods Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {periods.map((period: TimePeriod) => (
          <Card key={period.id} className="relative">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg" data-testid={`text-period-name-${period.id}`}>
                  {period.name}
                </CardTitle>
                {getStatusBadge(period.status || "open")}
              </div>
              <CardDescription data-testid={`text-period-dates-${period.id}`}>
                {format(parseISO(period.startDate), "dd/MM/yyyy")} - {format(parseISO(period.endDate), "dd/MM/yyyy")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {(period as any).description && (
                <p className="text-sm text-muted-foreground" data-testid={`text-period-description-${period.id}`}>
                  {(period as any).description}
                </p>
              )}
              
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span data-testid={`text-period-created-${period.id}`}>
                  Criado em {period.createdAt ? format(new Date(period.createdAt), "dd/MM/yyyy 'às' HH:mm") : "Data não disponível"}
                </span>
              </div>

              {period.status === "closed" && period.closedAt && (
                <div className="text-sm text-red-600 dark:text-red-400">
                  <p>Fechado em {format(new Date(period.closedAt), "dd/MM/yyyy 'às' HH:mm")}</p>
                  {period.closedBy && <p>Por: {period.closedBy}</p>}
                  {period.reason && <p className="italic">"{period.reason}"</p>}
                </div>
              )}

              {period.status === "open" && period.reopenedAt && (
                <div className="text-sm text-green-600 dark:text-green-400">
                  <p>Reaberto em {format(new Date(period.reopenedAt), "dd/MM/yyyy 'às' HH:mm")}</p>
                  {period.reopenedBy && <p>Por: {period.reopenedBy}</p>}
                </div>
              )}

              <Button
                variant={period.status === "open" ? "destructive" : "default"}
                className="w-full"
                onClick={() => {
                  setSelectedPeriod(period);
                  setCloseDialogOpen(true);
                }}
                data-testid={`button-toggle-period-${period.id}`}
              >
                {period.status === "open" ? (
                  <>
                    <Lock className="h-4 w-4 mr-2" />
                    Fechar Período
                  </>
                ) : (
                  <>
                    <Unlock className="h-4 w-4 mr-2" />
                    Reabrir Período
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {periods.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Clock className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum período criado</h3>
            <p className="text-muted-foreground text-center mb-4">
              Crie o primeiro período para começar a controlar os registros de ponto
            </p>
            <Button onClick={() => setCreateDialogOpen(true)} data-testid="button-create-first-period">
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeiro Período
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Close/Reopen Period Dialog */}
      <Dialog open={closeDialogOpen} onOpenChange={setCloseDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedPeriod?.status === "open" ? "Fechar Período" : "Reabrir Período"}
            </DialogTitle>
            <DialogDescription>
              {selectedPeriod?.status === "open" 
                ? "Ao fechar este período, nenhum registro de ponto poderá ser modificado no intervalo especificado."
                : "Ao reabrir este período, registros de ponto poderão ser novamente modificados."
              }
            </DialogDescription>
          </DialogHeader>
          <Form {...closeForm}>
            <form onSubmit={closeForm.handleSubmit(onCloseSubmit)} className="space-y-4">
              <FormField
                control={closeForm.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Motivo para {selectedPeriod?.status === "open" ? "fechamento" : "reabertura"}
                    </FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder={`Explique o motivo para ${selectedPeriod?.status === "open" ? "fechar" : "reabrir"} este período...`}
                        {...field}
                        data-testid="textarea-period-reason"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCloseDialogOpen(false)}
                  data-testid="button-cancel-action"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit"
                  variant={selectedPeriod?.status === "open" ? "destructive" : "default"}
                  disabled={closePeriodMutation.isPending || reopenPeriodMutation.isPending}
                  data-testid="button-confirm-action"
                >
                  {closePeriodMutation.isPending || reopenPeriodMutation.isPending
                    ? "Processando..."
                    : selectedPeriod?.status === "open" 
                      ? "Fechar Período" 
                      : "Reabrir Período"
                  }
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
            </div>
          </main>
        </div>
      </div>
  );
}