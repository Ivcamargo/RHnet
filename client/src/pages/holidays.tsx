import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { CalendarPlus, Edit, Trash2, Calendar } from "lucide-react";
import Sidebar from "@/components/layout/sidebar";
import TopBar from "@/components/layout/top-bar";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

// Schema for holiday form validation
const holidayFormSchema = z.object({
  name: z.string().min(1, "Nome do feriado é obrigatório"),
  date: z.string().min(1, "Data é obrigatória"),
  type: z.enum(["national", "regional", "company"]),
  isRecurring: z.boolean().default(false),
  description: z.string().optional(),
});

type HolidayFormData = z.infer<typeof holidayFormSchema>;

interface Holiday {
  id: number;
  name: string;
  date: string;
  type: "national" | "regional" | "company";
  isRecurring: boolean;
  description?: string;
  isActive: boolean;
  companyId: number;
  createdAt: string;
  updatedAt: string;
}

export default function Holidays() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState<Holiday | null>(null);
  const { toast } = useToast();

  const form = useForm<HolidayFormData>({
    resolver: zodResolver(holidayFormSchema),
    defaultValues: {
      name: "",
      date: "",
      type: "company",
      isRecurring: false,
      description: "",
    },
  });

  // Fetch holidays
  const { data: holidays = [], isLoading } = useQuery<Holiday[]>({
    queryKey: ["/api/holidays"],
  });

  // Create holiday mutation
  const createHolidayMutation = useMutation({
    mutationFn: (data: HolidayFormData) => apiRequest("/api/holidays", {
      method: "POST",
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/holidays"] });
      setIsCreateDialogOpen(false);
      form.reset();
      toast({
        title: "Feriado criado",
        description: "O feriado foi criado com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar feriado",
        description: error.message || "Ocorreu um erro ao criar o feriado.",
        variant: "destructive",
      });
    },
  });

  // Update holiday mutation
  const updateHolidayMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<HolidayFormData> }) =>
      apiRequest(`/api/holidays/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/holidays"] });
      setEditingHoliday(null);
      form.reset();
      toast({
        title: "Feriado atualizado",
        description: "O feriado foi atualizado com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar feriado",
        description: error.message || "Ocorreu um erro ao atualizar o feriado.",
        variant: "destructive",
      });
    },
  });

  // Delete holiday mutation
  const deleteHolidayMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/holidays/${id}`, {
      method: "DELETE",
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/holidays"] });
      toast({
        title: "Feriado excluído",
        description: "O feriado foi excluído com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao excluir feriado",
        description: error.message || "Ocorreu um erro ao excluir o feriado.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: HolidayFormData) => {
    if (editingHoliday) {
      updateHolidayMutation.mutate({ id: editingHoliday.id, data });
    } else {
      createHolidayMutation.mutate(data);
    }
  };

  const handleEdit = (holiday: Holiday) => {
    setEditingHoliday(holiday);
    form.reset({
      name: holiday.name,
      date: holiday.date,
      type: holiday.type,
      isRecurring: holiday.isRecurring,
      description: holiday.description || "",
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja excluir este feriado?")) {
      deleteHolidayMutation.mutate(id);
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "national": return "Nacional";
      case "regional": return "Regional";
      case "company": return "Empresa";
      default: return type;
    }
  };

  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case "national": return "default";
      case "regional": return "secondary";
      case "company": return "outline";
      default: return "outline";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString + "T00:00:00").toLocaleDateString('pt-BR');
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-slate-900">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        <TopBar title="Feriados" />
        
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900" data-testid="page-title">
                  Gerenciamento de Feriados
                </h1>
                <p className="text-gray-600 mt-1">
                  Gerencie os feriados da sua empresa
                </p>
              </div>
              
              <Dialog 
                open={isCreateDialogOpen || !!editingHoliday} 
                onOpenChange={(open) => {
                  if (!open) {
                    setIsCreateDialogOpen(false);
                    setEditingHoliday(null);
                    form.reset();
                  }
                }}
              >
                <DialogTrigger asChild>
                  <Button 
                    onClick={() => setIsCreateDialogOpen(true)}
                    data-testid="button-create-holiday"
                  >
                    <CalendarPlus className="h-4 w-4 mr-2" />
                    Novo Feriado
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle data-testid="dialog-title">
                      {editingHoliday ? "Editar Feriado" : "Novo Feriado"}
                    </DialogTitle>
                  </DialogHeader>
                  
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome do Feriado</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Ex: Dia do Trabalhador"
                                data-testid="input-holiday-name"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Data</FormLabel>
                            <FormControl>
                              <Input 
                                type="date"
                                data-testid="input-holiday-date"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tipo</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger data-testid="select-holiday-type">
                                  <SelectValue placeholder="Selecione o tipo" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="national">Nacional</SelectItem>
                                <SelectItem value="regional">Regional</SelectItem>
                                <SelectItem value="company">Empresa</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="isRecurring"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                Feriado Recorrente
                              </FormLabel>
                              <div className="text-sm text-muted-foreground">
                                Este feriado se repete todos os anos
                              </div>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                data-testid="switch-holiday-recurring"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Descrição (Opcional)</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Informações adicionais sobre o feriado"
                                data-testid="textarea-holiday-description"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex justify-end space-x-2 pt-4">
                        <Button 
                          type="button" 
                          variant="outline"
                          onClick={() => {
                            setIsCreateDialogOpen(false);
                            setEditingHoliday(null);
                            form.reset();
                          }}
                          data-testid="button-cancel"
                        >
                          Cancelar
                        </Button>
                        <Button 
                          type="submit"
                          disabled={createHolidayMutation.isPending || updateHolidayMutation.isPending}
                          data-testid="button-save-holiday"
                        >
                          {createHolidayMutation.isPending || updateHolidayMutation.isPending
                            ? "Salvando..." 
                            : editingHoliday ? "Atualizar" : "Criar"
                          }
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Holidays Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Feriados Cadastrados
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : holidays.length === 0 ? (
                  <div className="text-center py-8 text-gray-500" data-testid="empty-state">
                    <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Nenhum feriado cadastrado</p>
                    <p className="text-sm">Clique em "Novo Feriado" para começar</p>
                  </div>
                ) : (
                  <Table data-testid="holidays-table">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Recorrente</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {holidays.map((holiday) => (
                        <TableRow key={holiday.id} data-testid={`holiday-row-${holiday.id}`}>
                          <TableCell className="font-medium" data-testid={`holiday-name-${holiday.id}`}>
                            {holiday.name}
                          </TableCell>
                          <TableCell data-testid={`holiday-date-${holiday.id}`}>
                            {formatDate(holiday.date)}
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={getTypeBadgeVariant(holiday.type)}
                              data-testid={`holiday-type-${holiday.id}`}
                            >
                              {getTypeLabel(holiday.type)}
                            </Badge>
                          </TableCell>
                          <TableCell data-testid={`holiday-recurring-${holiday.id}`}>
                            {holiday.isRecurring ? (
                              <Badge variant="secondary">Sim</Badge>
                            ) : (
                              <span className="text-gray-500">Não</span>
                            )}
                          </TableCell>
                          <TableCell data-testid={`holiday-description-${holiday.id}`}>
                            {holiday.description || <span className="text-gray-400">-</span>}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(holiday)}
                                data-testid={`button-edit-${holiday.id}`}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(holiday.id)}
                                disabled={deleteHolidayMutation.isPending}
                                data-testid={`button-delete-${holiday.id}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}