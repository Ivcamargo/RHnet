import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { 
  RotateCcw, 
  Users, 
  Plus,
  Edit, 
  Trash2,
  Calendar,
  Clock,
  Settings,
  Eye
} from "lucide-react";
import Sidebar from "@/components/layout/sidebar";
import TopBar from "@/components/layout/top-bar";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

// Schema para validação de template de rotação
const rotationTemplateSchema = z.object({
  name: z.string().min(1, "Nome do template é obrigatório"),
  description: z.string().optional(),
  cadenceType: z.string().min(1, "Tipo de cadência é obrigatório").default("daily"),
  cycleLength: z.coerce.number().min(1, "Duração do ciclo deve ser maior que 0"),
  startsOn: z.string().default("monday"),
  isActive: z.boolean().default(true),
});

// Schema para validação de segmento de rotação
const rotationSegmentSchema = z.object({
  shiftId: z.coerce.number({required_error: "Turno é obrigatório"}),
  sequenceOrder: z.coerce.number().min(0, "Ordem da sequência deve ser maior ou igual a 0"),
  daysCount: z.coerce.number().min(1, "Quantidade de dias deve ser maior que 0"),
});

type RotationTemplateFormData = z.infer<typeof rotationTemplateSchema>;
type RotationSegmentFormData = z.infer<typeof rotationSegmentSchema>;

export default function RotationManagement() {
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isSegmentDialogOpen, setIsSegmentDialogOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [editingSegment, setEditingSegment] = useState<any>(null);
  const [previewSchedule, setPreviewSchedule] = useState<any[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  // Queries
  const { data: rotationTemplates = [], isLoading: templatesLoading } = useQuery({
    queryKey: ["/api/admin/rotation-templates"],
  });

  const { data: sectors = [] } = useQuery({
    queryKey: ["/api/sectors"],
  });

  const { data: shifts = [] } = useQuery({
    queryKey: ["/api/shifts"],
  });

  const { data: segments = [], refetch: refetchSegments } = useQuery({
    queryKey: [`/api/admin/rotation-templates/${selectedTemplateId}/segments`],
    enabled: !!selectedTemplateId,
  });

  // Forms
  const templateForm = useForm<RotationTemplateFormData>({
    resolver: zodResolver(rotationTemplateSchema),
    defaultValues: {
      name: "",
      description: "",
      cadenceType: "daily",
      cycleLength: 30,
      startsOn: "monday",
      isActive: true,
    },
  });

  const segmentForm = useForm<RotationSegmentFormData>({
    resolver: zodResolver(rotationSegmentSchema),
    defaultValues: {
      shiftId: 0,
      sequenceOrder: 0,
      daysCount: 1,
    },
  });

  // Mutations
  const createTemplateMutation = useMutation({
    mutationFn: (data: RotationTemplateFormData) => 
      apiRequest("/api/admin/rotation-templates", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/rotation-templates"] });
      setIsCreateDialogOpen(false);
      templateForm.reset();
      toast({
        title: "Sucesso",
        description: "Template de rotação criado com sucesso!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao criar template de rotação",
        variant: "destructive",
      });
    },
  });

  const updateTemplateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: RotationTemplateFormData }) =>
      apiRequest(`/api/admin/rotation-templates/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/rotation-templates"] });
      setEditingTemplate(null);
      templateForm.reset();
      toast({
        title: "Sucesso",
        description: "Template atualizado com sucesso!",
      });
    },
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: (id: number) =>
      apiRequest(`/api/admin/rotation-templates/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/rotation-templates"] });
      toast({
        title: "Sucesso",
        description: "Template excluído com sucesso!",
      });
    },
  });

  const createSegmentMutation = useMutation({
    mutationFn: (data: RotationSegmentFormData & { templateId: number }) =>
      apiRequest("/api/admin/rotation-segments", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      refetchSegments();
      queryClient.invalidateQueries({ 
        queryKey: [`/api/admin/rotation-templates/${selectedTemplateId}/segments`] 
      });
      setIsSegmentDialogOpen(false);
      segmentForm.reset();
      toast({
        title: "Sucesso",
        description: "Segmento de rotação criado com sucesso!",
      });
    },
  });

  const deleteSegmentMutation = useMutation({
    mutationFn: (id: number) =>
      apiRequest(`/api/admin/rotation-segments/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      refetchSegments();
      toast({
        title: "Sucesso",
        description: "Segmento excluído com sucesso!",
      });
    },
  });

  const previewScheduleMutation = useMutation({
    mutationFn: async ({ templateId, startDate, endDate }: { templateId: number; startDate: string; endDate: string }) => {
      const response = await apiRequest(`/api/admin/rotation-templates/${templateId}/preview`, {
        method: "POST",
        body: JSON.stringify({ startDate, endDate }),
      });
      return response.json();
    },
    onSuccess: (data) => {
      setPreviewSchedule(data);
      setShowPreview(true);
    },
  });

  const generateScheduleMutation = useMutation({
    mutationFn: ({ templateId, startDate, endDate }: { templateId: number; startDate: string; endDate: string }) =>
      apiRequest(`/api/admin/rotation-templates/${templateId}/generate`, {
        method: "POST",
        body: JSON.stringify({ startDate, endDate }),
      }),
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Escala de rotação gerada com sucesso!",
      });
    },
  });

  const handleCreateTemplate = (data: RotationTemplateFormData) => {
    createTemplateMutation.mutate(data);
  };

  const handleUpdateTemplate = (data: RotationTemplateFormData) => {
    if (editingTemplate) {
      updateTemplateMutation.mutate({ id: editingTemplate.id, data });
    }
  };

  const handleCreateSegment = (data: RotationSegmentFormData) => {
    if (selectedTemplateId) {
      // Find the selected shift to generate a name
      const selectedShift = (shifts as any[] || []).find((shift: any) => {
        const shiftData = shift.department_shifts || shift;
        return shiftData && shiftData.id === data.shiftId;
      });
      
      const shiftData = selectedShift?.department_shifts || selectedShift;
      const shiftName = shiftData?.name || "Turno";
      const generatedName = `${shiftName} - Ordem ${data.sequenceOrder}`;
      
      createSegmentMutation.mutate({ 
        ...data, 
        templateId: selectedTemplateId,
        name: generatedName
      });
    }
  };

  const handleEditTemplate = (template: any) => {
    setEditingTemplate(template);
    templateForm.reset({
      name: template.name,
      description: template.description || "",
      cadenceType: template.cadenceType || "daily",
      cycleLength: template.cycleLength || 30,
      startsOn: template.startsOn || "monday",
      isActive: template.isActive,
    });
    setIsCreateDialogOpen(true);
  };

  const handlePreviewSchedule = (templateId: number) => {
    const startDate = new Date().toISOString().split('T')[0];
    const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // 30 days from now
    previewScheduleMutation.mutate({ templateId, startDate, endDate });
  };

  const handleGenerateSchedule = (templateId: number) => {
    const startDate = new Date().toISOString().split('T')[0];
    const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // 30 days from now
    generateScheduleMutation.mutate({ templateId, startDate, endDate });
  };

  if (templatesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <Sidebar />
        <div className="flex-1">
          <TopBar />
          <main className="p-6">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Gestão de Rotações
              </h1>
              <p className="text-muted-foreground">
                Configure templates de rotação automática para os turnos dos funcionários
              </p>
            </div>

            <Tabs defaultValue="templates" className="space-y-6">
              <TabsList>
                <TabsTrigger value="templates" data-testid="tab-templates">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Templates de Rotação
                </TabsTrigger>
                <TabsTrigger value="segments" data-testid="tab-segments">
                  <Settings className="h-4 w-4 mr-2" />
                  Segmentos
                </TabsTrigger>
              </TabsList>

              {/* Templates Tab */}
              <TabsContent value="templates" className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-semibold">Templates de Rotação</h2>
                    <p className="text-sm text-muted-foreground">
                      Crie e gerencie templates para rotação automática de turnos
                    </p>
                  </div>
                  <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                      <Button data-testid="button-create-template">
                        <Plus className="h-4 w-4 mr-2" />
                        Novo Template
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>
                          {editingTemplate ? "Editar Template" : "Criar Template de Rotação"}
                        </DialogTitle>
                      </DialogHeader>
                      <Form {...templateForm}>
                        <form onSubmit={templateForm.handleSubmit(editingTemplate ? handleUpdateTemplate : handleCreateTemplate)} className="space-y-4">
                          <FormField
                            control={templateForm.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nome do Template</FormLabel>
                                <FormControl>
                                  <Input 
                                    {...field} 
                                    placeholder="Ex: Rotação 12x36" 
                                    data-testid="input-template-name"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={templateForm.control}
                            name="description"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Descrição</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    {...field} 
                                    placeholder="Descreva o padrão de rotação"
                                    data-testid="input-template-description"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={templateForm.control}
                            name="cadenceType"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Tipo de Cadência</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger data-testid="select-cadence-type">
                                      <SelectValue placeholder="Selecione o tipo de cadência" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="daily">Diária</SelectItem>
                                    <SelectItem value="weekly">Semanal</SelectItem>
                                    <SelectItem value="monthly">Mensal</SelectItem>
                                    <SelectItem value="custom">Personalizada</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={templateForm.control}
                            name="cycleLength"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Duração do Ciclo (em dias)</FormLabel>
                                <FormControl>
                                  <Input 
                                    {...field} 
                                    type="number" 
                                    min="1"
                                    placeholder="30"
                                    data-testid="input-cycle-length"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={templateForm.control}
                            name="startsOn"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Inicia em</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger data-testid="select-starts-on">
                                      <SelectValue placeholder="Selecione o dia de início" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="monday">Segunda-feira</SelectItem>
                                    <SelectItem value="tuesday">Terça-feira</SelectItem>
                                    <SelectItem value="wednesday">Quarta-feira</SelectItem>
                                    <SelectItem value="thursday">Quinta-feira</SelectItem>
                                    <SelectItem value="friday">Sexta-feira</SelectItem>
                                    <SelectItem value="saturday">Sábado</SelectItem>
                                    <SelectItem value="sunday">Domingo</SelectItem>
                                    <SelectItem value="first_day">Primeiro dia do período</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <div className="flex justify-end space-x-2">
                            <Button 
                              type="button" 
                              variant="outline" 
                              onClick={() => {
                                setIsCreateDialogOpen(false);
                                setEditingTemplate(null);
                                templateForm.reset();
                              }}
                              data-testid="button-cancel-template"
                            >
                              Cancelar
                            </Button>
                            <Button type="submit" data-testid="button-save-template">
                              {editingTemplate ? "Atualizar" : "Criar"}
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="grid gap-4">
                  {(rotationTemplates as any[] || []).length === 0 ? (
                    <Card>
                      <CardContent className="text-center py-8">
                        <RotateCcw className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Nenhum template criado</h3>
                        <p className="text-muted-foreground mb-4">
                          Crie seu primeiro template de rotação para automatizar as escalas
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    (rotationTemplates as any[] || []).map((template: any) => (
                      <Card key={template.id} data-testid={`card-template-${template.id}`}>
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="flex items-center gap-2">
                                {template.name}
                                {template.isActive ? (
                                  <Badge variant="default">Ativo</Badge>
                                ) : (
                                  <Badge variant="secondary">Inativo</Badge>
                                )}
                              </CardTitle>
                              {template.description && (
                                <p className="text-sm text-muted-foreground">
                                  {template.description}
                                </p>
                              )}
                            </div>
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant={selectedTemplateId === template.id ? "default" : "outline"}
                                onClick={() => {
                                  setSelectedTemplateId(template.id);
                                  toast({
                                    title: "Template Selecionado",
                                    description: "Agora vá para a aba 'Segmentos' para configurar os segmentos deste template.",
                                  });
                                }}
                                data-testid={`button-manage-segments-${template.id}`}
                              >
                                <Settings className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handlePreviewSchedule(template.id)}
                                data-testid={`button-preview-${template.id}`}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditTemplate(template)}
                                data-testid={`button-edit-template-${template.id}`}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => deleteTemplateMutation.mutate(template.id)}
                                data-testid={`button-delete-template-${template.id}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleGenerateSchedule(template.id)}
                                data-testid={`button-generate-${template.id}`}
                              >
                                <Calendar className="h-4 w-4 mr-2" />
                                Gerar Escala
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="text-sm text-muted-foreground">
                            <p>Tipo: {template.cadenceType || "Não definido"} | Ciclo: {template.cycleLength || "0"} dias</p>
                            <p>Inicia em: {template.startsOn || "Segunda-feira"}</p>
                            <p>Criado em: {new Date(template.createdAt).toLocaleDateString()}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>

              {/* Segments Tab */}
              <TabsContent value="segments" className="space-y-6">
                {selectedTemplateId ? (
                  <>
                    <div className="flex justify-between items-center">
                      <div>
                        <h2 className="text-xl font-semibold">Segmentos de Rotação</h2>
                        <p className="text-sm text-muted-foreground">
                          Configure os segmentos do template de rotação
                        </p>
                      </div>
                      <Dialog open={isSegmentDialogOpen} onOpenChange={setIsSegmentDialogOpen}>
                        <DialogTrigger asChild>
                          <Button data-testid="button-create-segment">
                            <Plus className="h-4 w-4 mr-2" />
                            Novo Segmento
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Criar Segmento de Rotação</DialogTitle>
                          </DialogHeader>
                          <Form {...segmentForm}>
                            <form onSubmit={segmentForm.handleSubmit(handleCreateSegment)} className="space-y-4">
                              <FormField
                                control={segmentForm.control}
                                name="shiftId"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Turno</FormLabel>
                                    <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                                      <FormControl>
                                        <SelectTrigger data-testid="select-shift">
                                          <SelectValue placeholder="Selecione um turno" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        {(shifts as any[] || []).map((shift: any) => {
                                          // Handle both nested and flat data structures
                                          const shiftData = shift.department_shifts || shift;
                                          if (!shiftData || !shiftData.id) return null;
                                          
                                          return (
                                            <SelectItem key={shiftData.id} value={shiftData.id.toString()}>
                                              {shiftData.name} ({shiftData.startTime} - {shiftData.endTime})
                                            </SelectItem>
                                          );
                                        }).filter(Boolean)}
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={segmentForm.control}
                                name="sequenceOrder"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Ordem na Sequência</FormLabel>
                                    <FormControl>
                                      <Input 
                                        {...field} 
                                        type="number" 
                                        min="0"
                                        placeholder="0"
                                        data-testid="input-sequence-order"
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={segmentForm.control}
                                name="daysCount"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Quantidade de Dias</FormLabel>
                                    <FormControl>
                                      <Input 
                                        {...field} 
                                        type="number" 
                                        min="1"
                                        placeholder="1"
                                        data-testid="input-days-count"
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
                                  onClick={() => {
                                    setIsSegmentDialogOpen(false);
                                    segmentForm.reset();
                                  }}
                                  data-testid="button-cancel-segment"
                                >
                                  Cancelar
                                </Button>
                                <Button type="submit" data-testid="button-save-segment">
                                  Criar
                                </Button>
                              </div>
                            </form>
                          </Form>
                        </DialogContent>
                      </Dialog>
                    </div>

                    <Card>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Ordem</TableHead>
                              <TableHead>Turno</TableHead>
                              <TableHead>Quantidade de Dias</TableHead>
                              <TableHead>Ações</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {(segments as any[] || []).length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={4} className="text-center py-8">
                                  <Settings className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                                  <p>Nenhum segmento configurado</p>
                                </TableCell>
                              </TableRow>
                            ) : (
                              (segments as any[] || []).map((segment: any) => (
                                <TableRow key={segment.id} data-testid={`row-segment-${segment.id}`}>
                                  <TableCell>{segment.sequenceOrder}</TableCell>
                                  <TableCell>
                                    {(shifts as any[] || []).find((s: any) => s.id === segment.shiftId)?.name || "Turno não encontrado"}
                                  </TableCell>
                                  <TableCell>{segment.daysCount}</TableCell>
                                  <TableCell>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={() => deleteSegmentMutation.mutate(segment.id)}
                                      data-testid={`button-delete-segment-${segment.id}`}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </>
                ) : (
                  <Card>
                    <CardContent className="text-center py-8">
                      <Settings className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Selecione um template</h3>
                      <p className="text-muted-foreground">
                        Escolha um template na aba "Templates de Rotação" para configurar seus segmentos
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>

            {/* Preview Dialog */}
            <Dialog open={showPreview} onOpenChange={setShowPreview}>
              <DialogContent className="max-w-4xl">
                <DialogHeader>
                  <DialogTitle>Preview da Escala de Rotação</DialogTitle>
                </DialogHeader>
                <div className="max-h-96 overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Funcionário</TableHead>
                        <TableHead>Turno</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {previewSchedule.map((entry, index) => (
                        <TableRow key={index}>
                          <TableCell>{new Date(entry.date).toLocaleDateString()}</TableCell>
                          <TableCell>{entry.userName}</TableCell>
                          <TableCell>{entry.shiftName}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </DialogContent>
            </Dialog>
          </main>
        </div>
      </div>
    </div>
  );
}