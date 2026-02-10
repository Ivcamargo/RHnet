import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertDepartmentSchema, insertDepartmentShiftBreakSchema, type InsertDepartment, type SelectDepartmentShiftBreak, type InsertDepartmentShiftBreak } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Building, MapPin, Users, Plus, Edit, Trash2, MoreVertical, Coffee } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import Sidebar from "@/components/layout/sidebar";
import TopBar from "@/components/layout/top-bar";
import { GeofencingMap } from "@/components/departments/geofencing-map";

export default function Departments() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<any>(null);
  
  // Shift breaks management state
  const [isShiftBreaksOpen, setIsShiftBreaksOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState<any>(null);
  const [isCreateBreakOpen, setIsCreateBreakOpen] = useState(false);
  const [isEditBreakOpen, setIsEditBreakOpen] = useState(false);
  const [isDeleteBreakOpen, setIsDeleteBreakOpen] = useState(false);
  const [selectedBreak, setSelectedBreak] = useState<SelectDepartmentShiftBreak | null>(null);
  
  const { toast } = useToast();

  const { data: departments, isLoading } = useQuery({
    queryKey: ["/api/departments"],
  });

  const { data: user } = useQuery({
    queryKey: ["/api/auth/user"],
  });

  // Fetch sectors for the selector
  const { data: sectors = [] } = useQuery({
    queryKey: ["/api/sectors"],
  });


  // Fetch breaks for selected shift
  const { data: shiftBreaks = [] } = useQuery<SelectDepartmentShiftBreak[]>({
    queryKey: ["/api/department-shifts", selectedShift?.id, "breaks"],
    enabled: !!selectedShift?.id,
  });

  const form = useForm<InsertDepartment>({
    resolver: zodResolver(insertDepartmentSchema),
    defaultValues: {
      name: "",
      description: "",
      isActive: true,
      companyId: 1, // Backend will override this with user's actual company
    },
  });

  const editForm = useForm<InsertDepartment>({
    resolver: zodResolver(insertDepartmentSchema),
    defaultValues: {
      name: "",
      description: "",
      isActive: true,
      companyId: 1,
    },
  });

  // Forms for shift break management
  const breakForm = useForm<InsertDepartmentShiftBreak>({
    resolver: zodResolver(insertDepartmentShiftBreakSchema),
    defaultValues: {
      name: "",
      durationMinutes: 60,
      isPaid: false,
      autoDeduct: false,
      scheduledStart: "",
      scheduledEnd: "",
      minWorkMinutes: 360,
      toleranceBeforeMinutes: 0,
      toleranceAfterMinutes: 0,
      isActive: true,
    },
  });

  const editBreakForm = useForm<InsertDepartmentShiftBreak>({
    resolver: zodResolver(insertDepartmentShiftBreakSchema),
    defaultValues: {
      name: "",
      durationMinutes: 60,
      isPaid: false,
      autoDeduct: false,
      scheduledStart: "",
      scheduledEnd: "",
      minWorkMinutes: 360,
      toleranceBeforeMinutes: 0,
      toleranceAfterMinutes: 0,
      isActive: true,
    },
  });


  const createMutation = useMutation({
    mutationFn: async (data: InsertDepartment) => {
      await apiRequest("/api/departments", { method: "POST", body: JSON.stringify(data) });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/departments"] });
      setIsCreateOpen(false);
      form.reset();
      toast({
        title: "Sucesso",
        description: "Departamento criado com sucesso",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: InsertDepartment }) => {
      await apiRequest(`/api/departments/${id}`, { method: "PUT", body: JSON.stringify(data) });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/departments"] });
      setIsEditOpen(false);
      setSelectedDepartment(null);
      editForm.reset();
      toast({
        title: "Sucesso",
        description: "Departamento atualizado com sucesso",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest(`/api/departments/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/departments"] });
      setIsDeleteOpen(false);
      setSelectedDepartment(null);
      toast({
        title: "Sucesso",
        description: "Departamento excluído com sucesso",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Shift break mutations
  const createBreakMutation = useMutation({
    mutationFn: async (data: InsertDepartmentShiftBreak) => {
      await apiRequest(`/api/department-shifts/${selectedShift?.id}/breaks`, { 
        method: "POST", 
        body: JSON.stringify(data) 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/department-shifts", selectedShift?.id, "breaks"] });
      setIsCreateBreakOpen(false);
      breakForm.reset();
      toast({
        title: "Sucesso",
        description: "Intervalo criado com sucesso",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateBreakMutation = useMutation({
    mutationFn: async (data: InsertDepartmentShiftBreak) => {
      await apiRequest(`/api/shift-breaks/${selectedBreak?.id}`, { 
        method: "PATCH", 
        body: JSON.stringify(data) 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/department-shifts", selectedShift?.id, "breaks"] });
      setIsEditBreakOpen(false);
      setSelectedBreak(null);
      editBreakForm.reset();
      toast({
        title: "Sucesso",
        description: "Intervalo atualizado com sucesso",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteBreakMutation = useMutation({
    mutationFn: async () => {
      await apiRequest(`/api/shift-breaks/${selectedBreak?.id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/department-shifts", selectedShift?.id, "breaks"] });
      setIsDeleteBreakOpen(false);
      setSelectedBreak(null);
      toast({
        title: "Sucesso",
        description: "Intervalo excluído com sucesso",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });


  const onSubmit = (data: InsertDepartment) => {
    createMutation.mutate(data);
  };

  const onEditSubmit = (data: InsertDepartment) => {
    if (selectedDepartment) {
      updateMutation.mutate({ id: selectedDepartment.id, data });
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    form.handleSubmit(onSubmit)(e);
  };

  const handleEditFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    editForm.handleSubmit(onEditSubmit)(e);
  };

  const handleEditDepartment = (department: any) => {
    setSelectedDepartment(department);
    editForm.reset({
      name: department.name,
      description: department.description || "",
      sectorId: department.sectorId,
      isActive: department.isActive,
      companyId: department.companyId,
    });
    setIsEditOpen(true);
  };

  const handleDeleteDepartment = (department: any) => {
    setSelectedDepartment(department);
    setIsDeleteOpen(true);
  };


  const confirmDelete = () => {
    if (selectedDepartment) {
      deleteMutation.mutate(selectedDepartment.id);
    }
  };

  const isAdmin = (user as any)?.role === 'admin' || (user as any)?.role === 'superadmin';

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-orange-50 via-red-50 to-orange-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Sidebar />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar title="Departamentos" />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          <div className="mb-6 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Departamentos</h1>
            {isAdmin && (
              <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogTrigger asChild>
                  <Button className="point-primary" data-testid="button-new-department">
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Departamento
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Criar Novo Departamento</DialogTitle>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={handleFormSubmit} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome do Departamento</FormLabel>
                            <FormControl>
                              <Input placeholder="Ex: Tecnologia da Informação" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Descrição</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Descrição do departamento..." {...field} value={field.value || ''} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="sectorId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Setor</FormLabel>
                            <Select 
                              onValueChange={(value) => field.onChange(parseInt(value))} 
                              value={field.value?.toString()}
                            >
                              <FormControl>
                                <SelectTrigger data-testid="select-sector">
                                  <SelectValue placeholder="Selecione um setor" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {sectors.map((sector: any) => (
                                  <SelectItem key={sector.id} value={sector.id.toString()}>
                                    {sector.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="flex gap-2">
                        <Button type="submit" disabled={createMutation.isPending} className="point-primary">
                          {createMutation.isPending ? "Criando..." : "Criar"}
                        </Button>
                        <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                          Cancelar
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {/* Edit Department Dialog */}
          <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Editar Departamento</DialogTitle>
              </DialogHeader>
              <Form {...editForm}>
                <form onSubmit={handleEditFormSubmit} className="space-y-4">
                  <FormField
                    control={editForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome do Departamento</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Tecnologia da Informação" {...field} data-testid="edit-input-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={editForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Descrição do departamento..." {...field} value={field.value || ''} data-testid="edit-input-description" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={editForm.control}
                    name="sectorId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Setor</FormLabel>
                        <Select 
                          onValueChange={(value) => field.onChange(parseInt(value))} 
                          value={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger data-testid="edit-select-sector">
                              <SelectValue placeholder="Selecione um setor" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {sectors.map((sector: any) => (
                              <SelectItem key={sector.id} value={sector.id.toString()}>
                                {sector.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex gap-2">
                    <Button type="submit" disabled={updateMutation.isPending} className="point-primary" data-testid="button-save-department">
                      {updateMutation.isPending ? "Salvando..." : "Salvar Alterações"}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)} data-testid="button-cancel-edit">
                      Cancelar
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          {/* Delete Confirmation Dialog */}
          <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza de que deseja excluir o departamento "{selectedDepartment?.name}"? 
                  Esta ação não pode ser desfeita e pode afetar funcionários associados a este departamento.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel data-testid="button-cancel-delete">Cancelar</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={confirmDelete}
                  disabled={deleteMutation.isPending}
                  className="bg-red-600 hover:bg-red-700"
                  data-testid="button-confirm-delete"
                >
                  {deleteMutation.isPending ? "Excluindo..." : "Excluir"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="material-shadow">
                  <CardContent className="p-6">
                    <div className="animate-pulse">
                      <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-1/2 mb-4"></div>
                      <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-full mb-2"></div>
                      <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-2/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : !departments || departments.length === 0 ? (
            <div className="text-center py-12">
              <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum departamento encontrado</h3>
              <p className="text-gray-500 mb-4">
                {isAdmin ? "Crie o primeiro departamento para começar." : "Aguarde a criação dos departamentos pelo administrador."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {departments?.map && departments.map((department: any) => (
                <Card key={department.id} className="material-shadow hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 point-primary rounded-lg flex items-center justify-center">
                          <Building className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{department.name}</CardTitle>
                          <p className="text-sm text-gray-500">
                            {department.description || 'Sem descrição'}
                          </p>
                        </div>
                      </div>
                      {isAdmin && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0" data-testid={`dropdown-department-${department.id}`}>
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleEditDepartment(department)}
                              data-testid={`edit-department-${department.id}`}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteDepartment(department)}
                              className="text-red-600"
                              data-testid={`delete-department-${department.id}`}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {department.description && (
                        <p className="text-sm text-gray-600">{department.description}</p>
                      )}
                      
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <Users className="h-4 w-4" />
                        <span>Funcionários ativos</span>
                      </div>
                      
                      <div className="pt-2 border-t">
                        <div className="flex items-center justify-between">
                          <div className="text-xs text-gray-400">
                            Setor: {department.sectorId ? `ID ${department.sectorId}` : 'Não atribuído'}
                          </div>
                          <div className={`px-2 py-1 rounded-full text-xs ${
                            department.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {department.isActive ? 'Ativo' : 'Inativo'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>

      </div>
    </div>
  );
}
