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
  Building, 
  Users, 
  UserPlus, 
  Edit, 
  Shield, 
  Plus,
  MapPin,
  Trash2,
  UserCheck
} from "lucide-react";
import Sidebar from "@/components/layout/sidebar";
import TopBar from "@/components/layout/top-bar";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

// Schema for sector form validation
const getSectorFormSchema = (isSuperadmin: boolean) => z.object({
  name: z.string().min(1, "Nome do setor é obrigatório"),
  description: z.string().optional(),
  companyId: isSuperadmin 
    ? z.coerce.number({required_error: "Empresa é obrigatória"})
    : z.coerce.number().optional(),
  latitude: z.coerce.number().min(-90).max(90, "Latitude deve estar entre -90 e 90"),
  longitude: z.coerce.number().min(-180).max(180, "Longitude deve estar entre -180 e 180"),
  radius: z.coerce.number().min(1).max(1000, "Raio deve estar entre 1 e 1000 metros").default(100),
});

const sectorFormSchema = z.object({
  name: z.string().min(1, "Nome do setor é obrigatório"),
  description: z.string().optional(),
  companyId: z.coerce.number().optional(),
  latitude: z.coerce.number().min(-90).max(90, "Latitude deve estar entre -90 e 90"),
  longitude: z.coerce.number().min(-180).max(180, "Longitude deve estar entre -180 e 180"),
  radius: z.coerce.number().min(1).max(1000, "Raio deve estar entre 1 e 1000 metros").default(100),
});

// Schema for shift form validation  
const shiftFormSchema = z.object({
  name: z.string().min(1, "Nome do turno é obrigatório"),
  startTime: z.string().min(1, "Horário de início é obrigatório"),
  endTime: z.string().min(1, "Horário de fim é obrigatório"),
  breakStartTime: z.string().optional(),
  breakEndTime: z.string().optional(),
});

type SectorFormData = z.infer<typeof sectorFormSchema>;
type ShiftFormData = z.infer<typeof shiftFormSchema>;

interface Sector {
  id: number;
  name: string;
  description?: string;
  latitude: number;
  longitude: number;
  radius: number;
  companyId: number;
  createdAt: string;
  updatedAt: string;
}

interface Department {
  id: number;
  name: string;
  description?: string;
  companyId: number;
  sectorId: number;
  createdAt: string;
  updatedAt: string;
}

interface DepartmentShift {
  id: number;
  name: string;
  startTime: string;
  endTime: string;
  breakStartTime?: string;
  breakEndTime?: string;
  departmentId: number;
  createdAt: string;
  updatedAt: string;
}

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  companyId?: number;
  departmentId?: number;
  isActive: boolean;
}

interface SupervisorAssignment {
  id: number;
  supervisorId: string;
  sectorId: number;
  createdAt: string;
  updatedAt: string;
  sector: Sector;
  supervisor: User;
}

export default function Sectors() {
  const [isCreateSectorDialogOpen, setIsCreateSectorDialogOpen] = useState(false);
  const [editingSector, setEditingSector] = useState<Sector | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [isCreateShiftDialogOpen, setIsCreateShiftDialogOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<DepartmentShift | null>(null);
  const [isAssignSupervisorDialogOpen, setIsAssignSupervisorDialogOpen] = useState(false);
  const [selectedSector, setSelectedSector] = useState<Sector | null>(null);
  const { toast } = useToast();

  const sectorForm = useForm<SectorFormData>({
    resolver: zodResolver(sectorFormSchema),
    defaultValues: {
      name: "",
      description: "",
      companyId: undefined,
      latitude: 0,
      longitude: 0,
      radius: 100,
    },
  });

  const shiftForm = useForm<ShiftFormData>({
    resolver: zodResolver(shiftFormSchema),
    defaultValues: {
      name: "",
      startTime: "",
      endTime: "",
      breakStartTime: "",
      breakEndTime: "",
    },
  });

  // Fetch sectors
  const { data: sectors = [], isLoading: sectorsLoading } = useQuery<Sector[]>({
    queryKey: ["/api/sectors"],
  });

  // Fetch departments
  const { data: departments = [], isLoading: departmentsLoading } = useQuery<Department[]>({
    queryKey: ["/api/departments"],
  });

  // Fetch users for supervisor assignment
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });

  // Fetch current user to check role
  const { data: currentUser } = useQuery({
    queryKey: ["/api/auth/user"],
  });

  // Fetch companies for superadmin company selector
  const { data: companies = [] } = useQuery({
    queryKey: ["/api/superadmin/companies"],
    enabled: (currentUser as any)?.role === 'superadmin'
  });

  // Fetch supervisor assignments (admin view)
  const { data: supervisorAssignments = [] } = useQuery<(SupervisorAssignment & { supervisor: User; sector: Sector })[]>({
    queryKey: ["/api/admin/supervisor-assignments"],
  });

  // Fetch shifts for selected department
  const { data: shifts = [] } = useQuery<DepartmentShift[]>({
    queryKey: ["/api/departments", selectedDepartment?.id, "shifts"],
    enabled: !!selectedDepartment?.id,
  });

  // Create sector mutation
  const createSectorMutation = useMutation({
    mutationFn: (data: SectorFormData) => apiRequest("/api/sectors", {
      method: "POST",
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sectors"] });
      setIsCreateSectorDialogOpen(false);
      sectorForm.reset();
      toast({
        title: "Setor criado",
        description: "O setor foi criado com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar setor",
        description: error.message || "Ocorreu um erro ao criar o setor.",
        variant: "destructive",
      });
    },
  });

  // Update sector mutation
  const updateSectorMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<SectorFormData> }) =>
      apiRequest(`/api/sectors/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sectors"] });
      setEditingSector(null);
      sectorForm.reset();
      toast({
        title: "Setor atualizado",
        description: "O setor foi atualizado com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar setor",
        description: error.message || "Ocorreu um erro ao atualizar o setor.",
        variant: "destructive",
      });
    },
  });

  // Create shift mutation
  const createShiftMutation = useMutation({
    mutationFn: (data: ShiftFormData) =>
      apiRequest(`/api/departments/${selectedDepartment?.id}/shifts`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/departments", selectedDepartment?.id, "shifts"] });
      setIsCreateShiftDialogOpen(false);
      shiftForm.reset();
      toast({
        title: "Turno criado",
        description: "O turno foi criado com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar turno",
        description: error.message || "Ocorreu um erro ao criar o turno.",
        variant: "destructive",
      });
    },
  });

  // Assign supervisor mutation
  const assignSupervisorMutation = useMutation({
    mutationFn: ({ supervisorId, sectorId }: { supervisorId: string; sectorId: number }) =>
      apiRequest("/api/supervisor-assignments", {
        method: "POST",
        body: JSON.stringify({ supervisorId, sectorId }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/supervisor-assignments"] });
      setIsAssignSupervisorDialogOpen(false);
      setSelectedSector(null);
      toast({
        title: "Supervisor atribuído",
        description: "O supervisor foi atribuído ao setor com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atribuir supervisor",
        description: error.message || "Ocorreu um erro ao atribuir o supervisor.",
        variant: "destructive",
      });
    },
  });

  // Remove supervisor assignment mutation
  const removeSupervisorMutation = useMutation({
    mutationFn: ({ supervisorId, sectorId }: { supervisorId: string; sectorId: number }) =>
      apiRequest("/api/supervisor-assignments", {
        method: "DELETE",
        body: JSON.stringify({ supervisorId, sectorId }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/supervisor-assignments"] });
      toast({
        title: "Supervisor removido",
        description: "O supervisor foi removido do setor com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao remover supervisor",
        description: error.message || "Ocorreu um erro ao remover o supervisor.",
        variant: "destructive",
      });
    },
  });

  const onSubmitSector = (data: SectorFormData) => {
    // Validate companyId is required for superadmins
    if ((currentUser as any)?.role === 'superadmin' && !data.companyId) {
      toast({
        title: "Erro",
        description: "Por favor, selecione uma empresa",
        variant: "destructive",
      });
      return;
    }
    
    if (editingSector) {
      updateSectorMutation.mutate({ id: editingSector.id, data });
    } else {
      createSectorMutation.mutate(data);
    }
  };

  const onSubmitShift = (data: ShiftFormData) => {
    createShiftMutation.mutate(data);
  };

  const handleEditSector = (sector: Sector) => {
    setEditingSector(sector);
    sectorForm.reset({
      name: sector.name,
      description: sector.description || "",
      latitude: sector.latitude,
      longitude: sector.longitude,
      radius: sector.radius,
    });
  };

  const handleAssignSupervisor = (sector: Sector) => {
    setSelectedSector(sector);
    setIsAssignSupervisorDialogOpen(true);
  };

  const handleRemoveSupervisor = (assignment: SupervisorAssignment) => {
    removeSupervisorMutation.mutate({
      supervisorId: assignment.supervisorId,
      sectorId: assignment.sectorId,
    });
  };

  const handleCreateShiftForDepartment = (department: Department) => {
    setSelectedDepartment(department);
    setIsCreateShiftDialogOpen(true);
  };

  const formatTime = (time: string | undefined | null) => {
    if (!time) return '';
    return time.slice(0, 5); // Remove seconds from time
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getSectorName = (sectorId?: number) => {
    if (!sectorId) return <span className="text-gray-400">Sem setor</span>;
    const sector = sectors.find(s => s.id === sectorId);
    return sector?.name || `Setor ${sectorId}`;
  };

  const getSupervisors = () => {
    return users.filter(user => user.role === 'supervisor');
  };

  const getAssignedSupervisors = (sectorId: number) => {
    return supervisorAssignments.filter(assignment => assignment.sectorId === sectorId);
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-green-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        <TopBar title="Gestão de Setores" />
        
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center" data-testid="page-title">
                <Building className="h-8 w-8 mr-3 text-blue-600" />
                Gestão de Setores
              </h1>
              <p className="text-gray-600 mt-1">
                Gerencie setores, turnos de trabalho e atribuições de supervisores
              </p>
            </div>

            <Tabs defaultValue="sectors" className="space-y-6">
              <TabsList>
                <TabsTrigger value="sectors" className="flex items-center">
                  <Building className="h-4 w-4 mr-2" />
                  Setores
                </TabsTrigger>
                <TabsTrigger value="departments" className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  Turnos por Departamento
                </TabsTrigger>
                <TabsTrigger value="supervisors" className="flex items-center">
                  <UserCheck className="h-4 w-4 mr-2" />
                  Supervisores
                </TabsTrigger>
              </TabsList>

              {/* Sectors Tab */}
              <TabsContent value="sectors" className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Setores da Empresa</h2>
                  
                  <Dialog 
                    open={isCreateSectorDialogOpen || !!editingSector} 
                    onOpenChange={(open) => {
                      if (!open) {
                        setIsCreateSectorDialogOpen(false);
                        setEditingSector(null);
                        sectorForm.reset();
                      }
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button 
                        onClick={() => setIsCreateSectorDialogOpen(true)}
                        data-testid="button-create-sector"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Novo Setor
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle data-testid="dialog-sector-title">
                          {editingSector ? "Editar Setor" : "Novo Setor"}
                        </DialogTitle>
                      </DialogHeader>
                      
                      <Form {...sectorForm}>
                        <form onSubmit={sectorForm.handleSubmit(onSubmitSector)} className="space-y-4">
                          <FormField
                            control={sectorForm.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nome do Setor</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="Ex: Vendas, RH, TI"
                                    data-testid="input-sector-name"
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={sectorForm.control}
                            name="description"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Descrição (Opcional)</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="Descrição do setor"
                                    data-testid="textarea-sector-description"
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {/* Company selector - only for superadmins */}
                          {(currentUser as any)?.role === 'superadmin' && (
                            <FormField
                              control={sectorForm.control}
                              name="companyId"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Empresa *</FormLabel>
                                  <Select 
                                    onValueChange={(value) => field.onChange(parseInt(value))} 
                                    value={field.value?.toString()}
                                  >
                                    <FormControl>
                                      <SelectTrigger data-testid="select-company">
                                        <SelectValue placeholder="Selecione uma empresa" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {companies.map((company: any) => (
                                        <SelectItem key={company.id} value={company.id.toString()}>
                                          {company.name} ({company.cnpj})
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          )}

                          <div className="space-y-4 border-t pt-4">
                            <h4 className="text-sm font-medium text-gray-700">Localização da Cerca Virtual</h4>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <FormField
                                control={sectorForm.control}
                                name="latitude"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Latitude</FormLabel>
                                    <FormControl>
                                      <Input 
                                        type="number"
                                        step="any"
                                        placeholder="Ex: -23.5505"
                                        data-testid="input-sector-latitude"
                                        {...field} 
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={sectorForm.control}
                                name="longitude"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Longitude</FormLabel>
                                    <FormControl>
                                      <Input 
                                        type="number"
                                        step="any"
                                        placeholder="Ex: -46.6333"
                                        data-testid="input-sector-longitude"
                                        {...field} 
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            
                            <FormField
                              control={sectorForm.control}
                              name="radius"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Raio da Cerca Virtual (metros)</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number"
                                      min="1"
                                      max="1000"
                                      placeholder="Ex: 100"
                                      data-testid="input-sector-radius"
                                      {...field} 
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="flex justify-end space-x-2 pt-4">
                            <Button 
                              type="button" 
                              variant="outline"
                              onClick={() => {
                                setIsCreateSectorDialogOpen(false);
                                setEditingSector(null);
                                sectorForm.reset();
                              }}
                              data-testid="button-cancel-sector"
                            >
                              Cancelar
                            </Button>
                            <Button 
                              type="submit"
                              disabled={createSectorMutation.isPending || updateSectorMutation.isPending}
                              data-testid="button-save-sector"
                            >
                              {createSectorMutation.isPending || updateSectorMutation.isPending
                                ? "Salvando..." 
                                : editingSector ? "Atualizar" : "Criar"
                              }
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </div>

                <Card>
                  <CardContent className="p-0">
                    {sectorsLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    ) : sectors.length === 0 ? (
                      <div className="text-center py-8 text-gray-500" data-testid="empty-sectors">
                        <Building className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>Nenhum setor cadastrado</p>
                        <p className="text-sm">Clique em "Novo Setor" para começar</p>
                      </div>
                    ) : (
                      <Table data-testid="sectors-table">
                        <TableHeader>
                          <TableRow>
                            <TableHead>Nome</TableHead>
                            <TableHead>Descrição</TableHead>
                            <TableHead>Supervisores</TableHead>
                            <TableHead>Data de Criação</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {sectors.map((sector) => {
                            const assignedSupervisors = getAssignedSupervisors(sector.id);
                            return (
                              <TableRow key={sector.id} data-testid={`sector-row-${sector.id}`}>
                                <TableCell className="font-medium" data-testid={`sector-name-${sector.id}`}>
                                  {sector.name}
                                </TableCell>
                                <TableCell data-testid={`sector-description-${sector.id}`}>
                                  {sector.description || <span className="text-gray-400">-</span>}
                                </TableCell>
                                <TableCell data-testid={`sector-supervisors-${sector.id}`}>
                                  <div className="flex flex-wrap gap-1">
                                    {assignedSupervisors.length === 0 ? (
                                      <span className="text-gray-400 text-sm">Nenhum</span>
                                    ) : (
                                      assignedSupervisors.map((assignment) => (
                                        <Badge key={assignment.id} variant="secondary" className="text-xs">
                                          {assignment.supervisor.firstName} {assignment.supervisor.lastName}
                                        </Badge>
                                      ))
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell data-testid={`sector-created-${sector.id}`}>
                                  {formatDate(sector.createdAt)}
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleEditSector(sector)}
                                      data-testid={`button-edit-sector-${sector.id}`}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleAssignSupervisor(sector)}
                                      data-testid={`button-assign-supervisor-${sector.id}`}
                                    >
                                      <UserPlus className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Departments Tab */}
              <TabsContent value="departments" className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Turnos por Departamento</h2>
                </div>

                <div className="grid gap-6">
                  {departmentsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : departments.length === 0 ? (
                    <div className="text-center py-8 text-gray-500" data-testid="empty-departments">
                      <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>Nenhum departamento encontrado</p>
                    </div>
                  ) : (
                    departments.map((department) => (
                      <Card key={department.id}>
                        <CardHeader>
                          <CardTitle className="flex items-center justify-between">
                            <div>
                              {department.name}
                              <div className="text-sm font-normal text-gray-600 mt-1">
                                Setor: {getSectorName(department.sectorId)}
                              </div>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => handleCreateShiftForDepartment(department)}
                              data-testid={`button-add-shift-${department.id}`}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Adicionar Turno
                            </Button>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {selectedDepartment?.id === department.id && shifts.length > 0 ? (
                            <div className="space-y-2">
                              {shifts.map((shift) => (
                                <div key={shift.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                  <div>
                                    <div className="font-medium">{shift.name}</div>
                                    <div className="text-sm text-gray-600">
                                      {formatTime(shift.startTime)} - {formatTime(shift.endTime)}
                                      {shift.breakStartTime && shift.breakEndTime && (
                                        <span className="ml-2 text-gray-500">
                                          (Intervalo: {formatTime(shift.breakStartTime)} - {formatTime(shift.breakEndTime)})
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-gray-500 text-sm">Nenhum turno cadastrado para este departamento</p>
                          )}
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>

                {/* Create Shift Dialog */}
                <Dialog 
                  open={isCreateShiftDialogOpen} 
                  onOpenChange={(open) => {
                    if (!open) {
                      setIsCreateShiftDialogOpen(false);
                      setSelectedDepartment(null);
                      shiftForm.reset();
                    }
                  }}
                >
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle data-testid="dialog-shift-title">
                        Novo Turno - {selectedDepartment?.name}
                      </DialogTitle>
                    </DialogHeader>
                    
                    <Form {...shiftForm}>
                      <form onSubmit={shiftForm.handleSubmit(onSubmitShift)} className="space-y-4">
                        <FormField
                          control={shiftForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nome do Turno</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Ex: Manhã, Tarde, Noite"
                                  data-testid="input-shift-name"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={shiftForm.control}
                            name="startTime"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Horário de Início</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="time"
                                    data-testid="input-shift-start"
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={shiftForm.control}
                            name="endTime"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Horário de Fim</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="time"
                                    data-testid="input-shift-end"
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={shiftForm.control}
                            name="breakStartTime"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Início do Intervalo (Opcional)</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="time"
                                    data-testid="input-break-start"
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={shiftForm.control}
                            name="breakEndTime"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Fim do Intervalo (Opcional)</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="time"
                                    data-testid="input-break-end"
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="flex justify-end space-x-2 pt-4">
                          <Button 
                            type="button" 
                            variant="outline"
                            onClick={() => {
                              setIsCreateShiftDialogOpen(false);
                              setSelectedDepartment(null);
                              shiftForm.reset();
                            }}
                            data-testid="button-cancel-shift"
                          >
                            Cancelar
                          </Button>
                          <Button 
                            type="submit"
                            disabled={createShiftMutation.isPending}
                            data-testid="button-save-shift"
                          >
                            {createShiftMutation.isPending ? "Salvando..." : "Criar Turno"}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </TabsContent>

              {/* Supervisors Tab */}
              <TabsContent value="supervisors" className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Atribuições de Supervisores</h2>
                </div>

                <Card>
                  <CardContent className="p-0">
                    {supervisorAssignments.length === 0 ? (
                      <div className="text-center py-8 text-gray-500" data-testid="empty-assignments">
                        <UserCheck className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>Nenhum supervisor atribuído</p>
                        <p className="text-sm">Atribua supervisores aos setores na aba "Setores"</p>
                      </div>
                    ) : (
                      <Table data-testid="assignments-table">
                        <TableHeader>
                          <TableRow>
                            <TableHead>Supervisor</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Setor</TableHead>
                            <TableHead>Data de Atribuição</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {supervisorAssignments.map((assignment) => (
                            <TableRow key={assignment.id} data-testid={`assignment-row-${assignment.id}`}>
                              <TableCell className="font-medium" data-testid={`assignment-supervisor-${assignment.id}`}>
                                {assignment.supervisor.firstName} {assignment.supervisor.lastName}
                              </TableCell>
                              <TableCell data-testid={`assignment-email-${assignment.id}`}>
                                {assignment.supervisor.email}
                              </TableCell>
                              <TableCell data-testid={`assignment-sector-${assignment.id}`}>
                                {assignment.sector.name}
                              </TableCell>
                              <TableCell data-testid={`assignment-created-${assignment.id}`}>
                                {formatDate(assignment.createdAt)}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleRemoveSupervisor(assignment)}
                                  data-testid={`button-remove-assignment-${assignment.id}`}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>

                {/* Assign Supervisor Dialog */}
                <Dialog 
                  open={isAssignSupervisorDialogOpen} 
                  onOpenChange={(open) => {
                    if (!open) {
                      setIsAssignSupervisorDialogOpen(false);
                      setSelectedSector(null);
                    }
                  }}
                >
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle data-testid="dialog-assign-title">
                        Atribuir Supervisor - {selectedSector?.name}
                      </DialogTitle>
                    </DialogHeader>
                    
                    <div className="space-y-4">
                      <Label>Selecione um supervisor:</Label>
                      <div className="grid gap-2">
                        {getSupervisors().length === 0 ? (
                          <p className="text-gray-500 text-sm">Nenhum supervisor disponível</p>
                        ) : (
                          getSupervisors().map((supervisor) => {
                            const isAlreadyAssigned = supervisorAssignments.some(
                              assignment => assignment.supervisorId === supervisor.id && 
                                           assignment.sectorId === selectedSector?.id
                            );
                            
                            return (
                              <Button
                                key={supervisor.id}
                                variant="outline"
                                className="justify-start"
                                disabled={isAlreadyAssigned || assignSupervisorMutation.isPending}
                                onClick={() => {
                                  if (selectedSector) {
                                    assignSupervisorMutation.mutate({
                                      supervisorId: supervisor.id,
                                      sectorId: selectedSector.id,
                                    });
                                  }
                                }}
                                data-testid={`button-assign-${supervisor.id}`}
                              >
                                <UserCheck className="h-4 w-4 mr-2" />
                                {supervisor.firstName} {supervisor.lastName} ({supervisor.email})
                                {isAlreadyAssigned && (
                                  <Badge variant="secondary" className="ml-auto">
                                    Já atribuído
                                  </Badge>
                                )}
                              </Button>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}