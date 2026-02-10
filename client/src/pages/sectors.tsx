import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
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
  UserCheck,
  Check,
  ChevronsUpDown,
  Clock
} from "lucide-react";
import { ShiftBreaksManager } from "@/components/shifts/shift-breaks-manager";
import Sidebar from "@/components/layout/sidebar";
import TopBar from "@/components/layout/top-bar";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { GeofencingMap } from "@/components/departments/geofencing-map";

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
  breakStart: z.string().optional(),
  breakEnd: z.string().optional(),
  daysOfWeek: z.array(z.number()).default([1, 2, 3, 4, 5]), // Monday to Friday
  toleranceBeforeMinutes: z.coerce.number().min(0).max(60).default(5),
  toleranceAfterMinutes: z.coerce.number().min(0).max(60).default(5),
});

type SectorFormData = z.infer<typeof sectorFormSchema>;
type ShiftFormData = z.infer<typeof shiftFormSchema>;

// Função para calcular horas líquidas trabalhadas
function calculateLiquidHours(shift: any) {
  if (!shift || !shift.startTime || !shift.endTime) {
    return 0;
  }
  
  // Calculate shift duration in hours
  const [startHour, startMin] = shift.startTime.split(':').map(Number);
  const [endHour, endMin] = shift.endTime.split(':').map(Number);
  const shiftStart = startHour + startMin / 60;
  const shiftEnd = endHour + endMin / 60;
  
  let totalShiftHours = shiftEnd - shiftStart;
  if (totalShiftHours < 0) {
    totalShiftHours += 24; // Handle overnight shifts
  }
  
  // Calculate break duration if defined
  let breakHours = 0;
  if (shift.breakStart && shift.breakEnd) {
    const [breakStartHour, breakStartMin] = shift.breakStart.split(':').map(Number);
    const [breakEndHour, breakEndMin] = shift.breakEnd.split(':').map(Number);
    const breakStart = breakStartHour + breakStartMin / 60;
    const breakEnd = breakEndHour + breakEndMin / 60;
    
    breakHours = breakEnd - breakStart;
    if (breakHours < 0) {
      breakHours += 24; // Handle overnight breaks
    }
  }
  
  return totalShiftHours - breakHours;
}

// Função para formatar horas trabalhadas de forma clara
function formatWorkedHours(hours: number): string {
  const wholeHours = Math.floor(hours);
  const minutes = Math.round((hours - wholeHours) * 60);
  
  if (minutes === 0) {
    return `${wholeHours}h`;
  } else {
    return `${wholeHours}h${minutes.toString().padStart(2, '0')}m`;
  }
}

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
  breakStart?: string;
  breakEnd?: string;
  daysOfWeek: number[];
  isActive: boolean;
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

interface Company {
  id: number;
  name: string;
  cnpj: string;
  createdAt: string;
  updatedAt: string;
}

export default function Sectors() {
  const [isCreateSectorDialogOpen, setIsCreateSectorDialogOpen] = useState(false);
  const [editingSector, setEditingSector] = useState<Sector | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [isCreateShiftDialogOpen, setIsCreateShiftDialogOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<DepartmentShift | null>(null);
  const [isAssignSupervisorDialogOpen, setIsAssignSupervisorDialogOpen] = useState(false);
  const [selectedSector, setSelectedSector] = useState<Sector | null>(null);
  const [deletingSector, setDeletingSector] = useState<Sector | null>(null);
  const [deletingShift, setDeletingShift] = useState<DepartmentShift | null>(null);
  const [managingShiftEmployees, setManagingShiftEmployees] = useState<DepartmentShift | null>(null);
  const [managingShiftBreaks, setManagingShiftBreaks] = useState<DepartmentShift | null>(null);
  const [selectedEmployeeForAssignment, setSelectedEmployeeForAssignment] = useState<string>("");
  const [assignmentStartDate, setAssignmentStartDate] = useState<string>("");
  const [assignmentEndDate, setAssignmentEndDate] = useState<string>("");
  const [employeeComboboxOpen, setEmployeeComboboxOpen] = useState(false);
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
      breakStart: "",
      breakEnd: "",
      daysOfWeek: [1, 2, 3, 4, 5], // Monday to Friday
      toleranceBeforeMinutes: 5,
      toleranceAfterMinutes: 5,
    },
  });

  // Fetch sectors
  const { data: sectors = [], isLoading: sectorsLoading, refetch: refetchSectors } = useQuery<Sector[]>({
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
  const { data: companies = [] } = useQuery<Company[]>({
    queryKey: ["/api/superadmin/companies"],
    enabled: (currentUser as any)?.role === 'superadmin'
  });

  // Fetch supervisor assignments (admin view)
  const { data: supervisorAssignments = [] } = useQuery<(SupervisorAssignment & { supervisor: User; sector: Sector })[]>({
    queryKey: ["/api/admin/supervisor-assignments"],
  });

  // Fetch shifts for selected department
  const { data: shifts = [], isLoading: shiftsLoading, error: shiftsError } = useQuery<DepartmentShift[]>({
    queryKey: [`/api/departments/${selectedDepartment?.id}/shifts`],
    enabled: !!selectedDepartment?.id,
  });

  // Fetch employees for shift assignment
  const { data: availableEmployees = [] } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    select: (users: User[]) => {
      // Include all users except superadmins (they manage multiple companies)
      // This includes employees, admins, and supervisors who can be assigned to shifts
      return users.filter(user => 
        user.role !== 'superadmin' && 
        user.isActive !== false // Exclude inactive users
      );
    }
  });

  // Fetch shift assignments when managing employees
  const { data: shiftAssignments = [] } = useQuery<any[]>({
    queryKey: [`/api/shifts/${managingShiftEmployees?.id}/assignments`],
    enabled: !!managingShiftEmployees?.id,
  });

  // Auto-fill company for non-superadmins when dialog opens
  useEffect(() => {
    if ((isCreateSectorDialogOpen || editingSector) && currentUser) {
      if ((currentUser as any)?.role !== 'superadmin') {
        // For non-superadmins, auto-fill with their company
        const userCompanyId = (currentUser as any)?.companyId;
        if (userCompanyId && !editingSector) {
          sectorForm.setValue('companyId', userCompanyId);
        }
      }
      
      // If editing, populate form with existing sector data
      if (editingSector) {
        sectorForm.reset({
          name: editingSector.name,
          description: editingSector.description || "",
          companyId: editingSector.companyId,
          latitude: editingSector.latitude,
          longitude: editingSector.longitude,
          radius: editingSector.radius,
        });
      }
    }
  }, [isCreateSectorDialogOpen, editingSector, currentUser]);

  // Component to show shift count badge for a department
  const ShiftCountBadge = ({ departmentId }: { departmentId: number }) => {
    const { data: departmentShifts = [] } = useQuery<DepartmentShift[]>({
      queryKey: [`/api/departments/${departmentId}/shifts`],
      enabled: true,
    });
    
    if (departmentShifts.length === 0) {
      return <Badge variant="secondary">0 turnos</Badge>;
    }
    
    return <Badge variant="default">{departmentShifts.length} turno{departmentShifts.length > 1 ? 's' : ''}</Badge>;
  };

  // Component to show employee count badge for a shift
  const EmployeeCountBadge = ({ shiftId }: { shiftId: number }) => {
    const { data: assignments = [] } = useQuery<any[]>({
      queryKey: [`/api/shifts/${shiftId}/assignments`],
      enabled: true,
    });
    
    if (assignments.length === 0) {
      return <Badge variant="secondary" className="text-xs">0 funcionários</Badge>;
    }
    
    return <Badge variant="outline" className="text-xs">{assignments.length} funcionário{assignments.length > 1 ? 's' : ''}</Badge>;
  };

  // Create sector mutation
  const createSectorMutation = useMutation({
    mutationFn: (data: SectorFormData) => apiRequest("/api/sectors", {
      method: "POST",
      body: JSON.stringify(data),
    }),
    onSuccess: async () => {
      // Invalidate and refetch to ensure the list updates
      await queryClient.invalidateQueries({ queryKey: ["/api/sectors"] });
      await refetchSectors();
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
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/api/sectors"] });
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

  // Delete sector mutation
  const deleteSectorMutation = useMutation({
    mutationFn: (sectorId: number) => apiRequest(`/api/sectors/${sectorId}`, {
      method: "DELETE",
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sectors"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/supervisor-assignments"] });
      setDeletingSector(null);
      toast({
        title: "Setor excluído",
        description: "O setor foi excluído com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao excluir setor",
        description: error.message || "Ocorreu um erro ao excluir o setor.",
        variant: "destructive",
      });
    },
  });

  // Update shift mutation
  const updateShiftMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<ShiftFormData> }) =>
      apiRequest(`/api/department-shifts/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      // Invalidate shifts cache for all departments (broader invalidation)
      queryClient.invalidateQueries({ queryKey: ["/api/departments"] });
      // Also invalidate specific department shifts if selected
      if (selectedDepartment?.id) {
        queryClient.invalidateQueries({ queryKey: [`/api/departments/${selectedDepartment.id}/shifts`] });
      }
      setEditingShift(null);
      setIsCreateShiftDialogOpen(false);
      shiftForm.reset();
      toast({
        title: "Turno atualizado",
        description: "O turno foi atualizado com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar turno",
        description: error.message || "Ocorreu um erro ao atualizar o turno.",
        variant: "destructive",
      });
    },
  });

  // Delete shift mutation
  const deleteShiftMutation = useMutation({
    mutationFn: (shiftId: number) => apiRequest(`/api/department-shifts/${shiftId}`, {
      method: "DELETE",
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/departments/${selectedDepartment?.id}/shifts`] });
      setDeletingShift(null);
      toast({
        title: "Turno excluído",
        description: "O turno foi excluído com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao excluir turno",
        description: error.message || "Ocorreu um erro ao excluir o turno.",
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
      // Invalidate shifts cache for all departments (broader invalidation)
      queryClient.invalidateQueries({ queryKey: ["/api/departments"] });
      // Also invalidate specific department shifts if selected
      if (selectedDepartment?.id) {
        queryClient.invalidateQueries({ queryKey: [`/api/departments/${selectedDepartment.id}/shifts`] });
      }
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

  // Create shift assignment mutation
  const createShiftAssignmentMutation = useMutation({
    mutationFn: (data: { userId: string; shiftId: number; startDate?: string; endDate?: string }) =>
      apiRequest("/api/user-shift-assignments", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/shifts/${managingShiftEmployees?.id}/assignments`] });
      setSelectedEmployeeForAssignment("");
      setAssignmentStartDate("");
      setAssignmentEndDate("");
      toast({
        title: "Funcionário vinculado",
        description: "O funcionário foi vinculado ao turno com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao vincular funcionário",
        description: error.message || "Ocorreu um erro ao vincular o funcionário.",
        variant: "destructive",
      });
    },
  });

  // Delete shift assignment mutation
  const deleteShiftAssignmentMutation = useMutation({
    mutationFn: (assignmentId: number) =>
      apiRequest(`/api/user-shift-assignments/${assignmentId}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/shifts/${managingShiftEmployees?.id}/assignments`] });
      toast({
        title: "Vinculação removida",
        description: "A vinculação foi removida com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao remover vinculação",
        description: error.message || "Ocorreu um erro ao remover a vinculação.",
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
    if (editingShift) {
      updateShiftMutation.mutate({ id: editingShift.id, data });
    } else {
      createShiftMutation.mutate(data);
    }
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
    setEditingShift(null);
    shiftForm.reset();
    setIsCreateShiftDialogOpen(true);
  };

  const handleEditShift = (shift: DepartmentShift) => {
    setEditingShift(shift);
    // Buscar o departamento do turno para definir selectedDepartment
    const department = departments.find(d => d.id === shift.departmentId);
    if (department) {
      setSelectedDepartment(department);
    }
    
    const formData = {
      name: shift.name,
      startTime: shift.startTime,
      endTime: shift.endTime,
      breakStart: shift.breakStart || "",
      breakEnd: shift.breakEnd || "",
      daysOfWeek: shift.daysOfWeek || [1, 2, 3, 4, 5],
      toleranceBeforeMinutes: (shift as any).toleranceBeforeMinutes ?? 5,
      toleranceAfterMinutes: (shift as any).toleranceAfterMinutes ?? 5,
    };
    
    shiftForm.reset(formData);
    setIsCreateShiftDialogOpen(true);
  };

  const formatTime = (time: string | undefined | null) => {
    if (!time) return '';
    return time.slice(0, 5); // Remove seconds from time
  };

  const formatDate = (dateString: string) => {
    try {
      if (!dateString) return '-';
      return new Date(dateString).toLocaleDateString('pt-BR');
    } catch (error) {
      console.error('Error formatting date:', dateString, error);
      return '-';
    }
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

  const handleManageShiftEmployees = (shift: DepartmentShift) => {
    setManagingShiftEmployees(shift);
  };

  const handleAssignEmployee = () => {
    if (!selectedEmployeeForAssignment || !managingShiftEmployees) {
      return;
    }

    const assignmentData = {
      userId: selectedEmployeeForAssignment,
      shiftId: managingShiftEmployees.id,
      startDate: assignmentStartDate || undefined,
      endDate: assignmentEndDate || undefined,
    };

    createShiftAssignmentMutation.mutate(assignmentData);
  };

  const handleRemoveAssignment = (assignmentId: number) => {
    deleteShiftAssignmentMutation.mutate(assignmentId);
  };

  const getEmployeeName = (employeeId: string) => {
    const employee = availableEmployees.find(emp => emp.id === employeeId);
    if (!employee) return 'Funcionário não encontrado';
    
    const name = [employee.firstName, employee.lastName].filter(Boolean).join(' ');
    return name || employee.email;
  };

  const getAvailableEmployees = () => {
    const assignedEmployeeIds = shiftAssignments.map(assignment => assignment.userId);
    return availableEmployees.filter(emp => !assignedEmployeeIds.includes(emp.id));
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-green-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        <TopBar title="Gestão de Setores" />
        
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center" data-testid="page-title">
                  <Building className="h-8 w-8 mr-3 text-blue-600" />
                  Gestão de Setores
                </h1>
                <p className="text-gray-600 mt-1">
                  Gerencie setores, turnos de trabalho e atribuições de supervisores
                </p>
              </div>
              
              {/* Botão Rotações */}
              {((currentUser as any)?.role === 'admin' || (currentUser as any)?.role === 'superadmin') && (
                <Button 
                  onClick={() => window.location.href = '/admin/rotation-management'}
                  className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white flex items-center gap-2"
                  data-testid="button-rotations"
                >
                  <svg 
                    className="w-5 h-5" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
                    />
                  </svg>
                  Rotações
                </Button>
              )}
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
                    <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle data-testid="dialog-sector-title">
                          {editingSector ? "Editar Setor" : "Novo Setor"}
                        </DialogTitle>
                      </DialogHeader>
                      
                      <Form {...sectorForm}>
                        <form onSubmit={sectorForm.handleSubmit(onSubmitSector)} className="space-y-4">
                          {/* Grid layout - formulário à esquerda, mapa à direita */}
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Coluna esquerda - Formulário */}
                            <div className="space-y-4">
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
                                        rows={3}
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
                                          {companies.map((company) => (
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
                            </div>

                            {/* Coluna direita - Mapa de Geofencing */}
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <h3 className="text-sm font-medium">Configuração de Geofencing</h3>
                                <p className="text-xs text-muted-foreground">
                                  Defina a localização e o raio permitido para registro de ponto
                                </p>
                              </div>
                              <GeofencingMap
                                latitude={sectorForm.watch('latitude') || null}
                                longitude={sectorForm.watch('longitude') || null}
                                radius={sectorForm.watch('radius') || 100}
                                onLocationChange={(lat, lng) => {
                                  sectorForm.setValue('latitude', lat);
                                  sectorForm.setValue('longitude', lng);
                                }}
                                onRadiusChange={(radius) => {
                                  sectorForm.setValue('radius', radius);
                                }}
                              />
                            </div>
                          </div>

                          {/* Botões sempre visíveis no final */}
                          <div className="flex justify-end space-x-2 pt-4 border-t">
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
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => setDeletingSector(sector)}
                                      data-testid={`button-delete-sector-${sector.id}`}
                                    >
                                      <Trash2 className="h-4 w-4" />
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
                            <div className="flex items-center gap-3">
                              <div>
                                <div className="flex items-center gap-2">
                                  {department.name}
                                  <ShiftCountBadge departmentId={department.id} />
                                </div>
                                <div className="text-sm font-normal text-gray-600 mt-1">
                                  Setor: {getSectorName(department.sectorId)}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  if (selectedDepartment?.id === department.id) {
                                    setSelectedDepartment(null); // Recolher se já está selecionado
                                  } else {
                                    setSelectedDepartment(department); // Expandir
                                  }
                                }}
                                data-testid={`button-view-shifts-${department.id}`}
                              >
                                {selectedDepartment?.id === department.id ? 'Ocultar Turnos' : 'Ver Turnos'}
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleCreateShiftForDepartment(department)}
                                data-testid={`button-add-shift-${department.id}`}
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Adicionar Turno
                              </Button>
                            </div>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {selectedDepartment?.id === department.id ? (
                            shifts.length > 0 ? (
                              <div className="space-y-2">
                                {shifts.map((shift, index) => {
                                  return (
                                  <div key={shift.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div>
                                      <div className="flex items-center gap-2 mb-1">
                                        <div className="font-medium">{shift.name}</div>
                                        <EmployeeCountBadge shiftId={shift.id} />
                                      </div>
                                      <div className="text-sm text-gray-600">
                                        {formatTime(shift.startTime)} - {formatTime(shift.endTime)}
                                      </div>
                                      {shift.breakStart && shift.breakEnd && (
                                        <div className="text-xs text-orange-600">
                                          Intervalo: {formatTime(shift.breakStart)} - {formatTime(shift.breakEnd)}
                                        </div>
                                      )}
                                      <div className="text-sm font-medium text-blue-600 mt-1">
                                        Horas Trabalhadas: {formatWorkedHours(calculateLiquidHours(shift))}
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setManagingShiftBreaks(shift)}
                                        data-testid={`button-manage-breaks-${shift.id}`}
                                        title="Gerenciar intervalos automáticos"
                                      >
                                        <Clock className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleManageShiftEmployees(shift)}
                                        data-testid={`button-manage-employees-${shift.id}`}
                                        title="Gerenciar funcionários"
                                      >
                                        <Users className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                          console.log('BUTTON CLICK - Shift being passed:', shift);
                                          handleEditShift(shift);
                                        }}
                                        data-testid={`button-edit-shift-${shift.id}`}
                                      >
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setDeletingShift(shift)}
                                        data-testid={`button-delete-shift-${shift.id}`}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <div className="text-center py-6 text-gray-500">
                                <div className="text-sm">Nenhum turno cadastrado para este departamento</div>
                                <div className="text-xs text-gray-400 mt-1">Use o botão "Adicionar Turno" para criar o primeiro turno</div>
                              </div>
                            )
                          ) : (
                            <div className="text-center py-4 text-gray-500 text-sm">
                              <div>Clique em "Ver Turnos" para visualizar os turnos deste departamento</div>
                              {/* A badge no cabeçalho já mostra quantos turnos existem */}
                            </div>
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
                      setEditingShift(null);
                      shiftForm.reset();
                    }
                  }}
                >
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle data-testid="dialog-shift-title">
                        {editingShift ? `Editar Turno - ${selectedDepartment?.name}` : `Novo Turno - ${selectedDepartment?.name}`}
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

                        {/* Break Time Fields */}
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700">Intervalo (Opcional)</Label>
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={shiftForm.control}
                              name="breakStart"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Início do Intervalo</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="time"
                                      placeholder="12:00"
                                      data-testid="input-shift-break-start"
                                      {...field} 
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={shiftForm.control}
                              name="breakEnd"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Fim do Intervalo</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="time"
                                      placeholder="13:00"
                                      data-testid="input-shift-break-end"
                                      {...field} 
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <div className="text-xs text-gray-500">
                            Configure o horário de intervalo para cálculo das horas líquidas trabalhadas
                          </div>
                          
                          {/* Campo calculado de horas trabalhadas */}
                          {shiftForm.watch('startTime') && shiftForm.watch('endTime') && (
                            <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                              <div className="text-sm font-medium text-blue-700">
                                Horas Trabalhadas: {formatWorkedHours(calculateLiquidHours({
                                  startTime: shiftForm.watch('startTime'),
                                  endTime: shiftForm.watch('endTime'),
                                  breakStart: shiftForm.watch('breakStart'),
                                  breakEnd: shiftForm.watch('breakEnd')
                                }))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Tolerance Fields */}
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700">Tolerância de Horário</Label>
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={shiftForm.control}
                              name="toleranceBeforeMinutes"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Tolerância Antes (minutos)</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number"
                                      min="0"
                                      max="60"
                                      placeholder="5"
                                      data-testid="input-shift-tolerance-before"
                                      {...field} 
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={shiftForm.control}
                              name="toleranceAfterMinutes"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Tolerância Depois (minutos)</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number"
                                      min="0"
                                      max="60"
                                      placeholder="5"
                                      data-testid="input-shift-tolerance-after"
                                      {...field} 
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <div className="text-xs text-gray-500">
                            Define quanto tempo antes ou depois do horário oficial é aceitável sem gerar irregularidade
                          </div>
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
                            disabled={createShiftMutation.isPending || updateShiftMutation.isPending}
                            data-testid="button-save-shift"
                          >
                            {(createShiftMutation.isPending || updateShiftMutation.isPending)
                              ? "Salvando..." 
                              : editingShift ? "Atualizar Turno" : "Criar Turno"
                            }
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

            {/* Delete Sector Confirmation Dialog */}
            <Dialog 
              open={!!deletingSector} 
              onOpenChange={(open) => {
                if (!open) setDeletingSector(null);
              }}
            >
              <DialogContent>
                <DialogHeader>
                  <DialogTitle data-testid="dialog-delete-sector-title">
                    Confirmar Exclusão
                  </DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Tem certeza que deseja excluir o setor <strong>{deletingSector?.name}</strong>?
                  </p>
                  <p className="text-sm text-red-600">
                    ⚠️ Esta ação não pode ser desfeita. O setor será permanentemente removido do sistema.
                  </p>
                  
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => setDeletingSector(null)}
                      disabled={deleteSectorMutation.isPending}
                      data-testid="button-cancel-delete-sector"
                    >
                      Cancelar
                    </Button>
                    <Button 
                      type="button"
                      variant="destructive"
                      onClick={() => {
                        if (deletingSector) {
                          deleteSectorMutation.mutate(deletingSector.id);
                        }
                      }}
                      disabled={deleteSectorMutation.isPending}
                      data-testid="button-confirm-delete-sector"
                    >
                      {deleteSectorMutation.isPending ? "Excluindo..." : "Excluir Setor"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Delete Shift Confirmation Dialog */}
            <Dialog 
              open={!!deletingShift} 
              onOpenChange={(open) => {
                if (!open) setDeletingShift(null);
              }}
            >
              <DialogContent>
                <DialogHeader>
                  <DialogTitle data-testid="dialog-delete-shift-title">
                    Confirmar Exclusão
                  </DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Tem certeza que deseja excluir o turno <strong>{deletingShift?.name}</strong>?
                  </p>
                  <p className="text-sm text-red-600">
                    ⚠️ Esta ação não pode ser desfeita. O turno será permanentemente removido do sistema.
                  </p>
                  
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => setDeletingShift(null)}
                      disabled={deleteShiftMutation.isPending}
                      data-testid="button-cancel-delete-shift"
                    >
                      Cancelar
                    </Button>
                    <Button 
                      type="button"
                      variant="destructive"
                      onClick={() => {
                        if (deletingShift) {
                          deleteShiftMutation.mutate(deletingShift.id);
                        }
                      }}
                      disabled={deleteShiftMutation.isPending}
                      data-testid="button-confirm-delete-shift"
                    >
                      {deleteShiftMutation.isPending ? "Excluindo..." : "Excluir Turno"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Manage Shift Employees Dialog */}
            <Dialog 
              open={!!managingShiftEmployees} 
              onOpenChange={(open) => {
                if (!open) {
                  setManagingShiftEmployees(null);
                  setSelectedEmployeeForAssignment("");
                  setAssignmentStartDate("");
                  setAssignmentEndDate("");
                  setEmployeeComboboxOpen(false);
                }
              }}
            >
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle data-testid="dialog-manage-employees-title">
                    Gerenciar Funcionários - {managingShiftEmployees?.name}
                  </DialogTitle>
                </DialogHeader>
                
                <div className="space-y-6">
                  {/* Add Employee Section */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Vincular Funcionário</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="employee-select">Funcionário</Label>
                          <Popover open={employeeComboboxOpen} onOpenChange={setEmployeeComboboxOpen}>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={employeeComboboxOpen}
                                className="w-full justify-between"
                                data-testid="select-employee"
                              >
                                {selectedEmployeeForAssignment ? (
                                  (() => {
                                    const employee = getAvailableEmployees().find(
                                      (emp) => emp.id === selectedEmployeeForAssignment
                                    );
                                    if (!employee) return "Funcionário não encontrado";
                                    const name = [employee.firstName, employee.lastName].filter(Boolean).join(' ');
                                    const displayName = name || employee.email;
                                    return `${displayName} (${employee.email})`;
                                  })()
                                ) : (
                                  "Selecione um funcionário..."
                                )}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0">
                              <Command>
                                <CommandInput placeholder="Buscar funcionário por nome ou email..." />
                                <CommandEmpty>
                                  <div className="py-6 text-center text-sm">
                                    <Users className="mx-auto h-8 w-8 text-gray-300 mb-2" />
                                    <p className="text-gray-500">Nenhum funcionário disponível</p>
                                    <p className="text-xs text-gray-400 mt-1">
                                      Todos os funcionários já estão vinculados ou não há funcionários cadastrados
                                    </p>
                                  </div>
                                </CommandEmpty>
                                <CommandList>
                                  <CommandGroup>
                                    {getAvailableEmployees().map((employee) => {
                                      const name = [employee.firstName, employee.lastName].filter(Boolean).join(' ');
                                      const displayName = name || employee.email;
                                      return (
                                        <CommandItem
                                          key={employee.id}
                                          value={`${displayName} ${employee.email}`}
                                          onSelect={() => {
                                            setSelectedEmployeeForAssignment(employee.id);
                                            setEmployeeComboboxOpen(false);
                                          }}
                                          className="cursor-pointer"
                                        >
                                          <Check
                                            className={`mr-2 h-4 w-4 ${
                                              selectedEmployeeForAssignment === employee.id
                                                ? "opacity-100"
                                                : "opacity-0"
                                            }`}
                                          />
                                          <div className="flex flex-col">
                                            <span className="font-medium">{displayName}</span>
                                            <span className="text-sm text-gray-500">{employee.email}</span>
                                          </div>
                                        </CommandItem>
                                      );
                                    })}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                        </div>
                        
                        <div>
                          <Label htmlFor="start-date">Data de Início (Opcional)</Label>
                          <Input
                            id="start-date"
                            type="date"
                            value={assignmentStartDate}
                            onChange={(e) => setAssignmentStartDate(e.target.value)}
                            data-testid="input-start-date"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="end-date">Data de Fim (Opcional)</Label>
                          <Input
                            id="end-date"
                            type="date"
                            value={assignmentEndDate}
                            onChange={(e) => setAssignmentEndDate(e.target.value)}
                            data-testid="input-end-date"
                          />
                        </div>
                      </div>
                      
                      <Button 
                        onClick={handleAssignEmployee}
                        disabled={!selectedEmployeeForAssignment || createShiftAssignmentMutation.isPending || getAvailableEmployees().length === 0}
                        className="w-full md:w-auto"
                        data-testid="button-assign-employee"
                      >
                        {createShiftAssignmentMutation.isPending ? (
                          <>
                            <div className="mr-2 h-4 w-4 border-2 border-gray-300 border-t-white rounded-full animate-spin" />
                            Vinculando...
                          </>
                        ) : (
                          <>
                            <UserPlus className="mr-2 h-4 w-4" />
                            Vincular Funcionário
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Current Assignments */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Funcionários Vinculados</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {shiftAssignments.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                          <p>Nenhum funcionário vinculado a este turno</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {shiftAssignments.map((assignment: any) => (
                            <div 
                              key={assignment.id} 
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                            >
                              <div>
                                <div className="font-medium">
                                  {getEmployeeName(assignment.userId)}
                                </div>
                                <div className="text-sm text-gray-600">
                                  {assignment.startDate && assignment.endDate ? (
                                    `Período: ${formatDate(assignment.startDate)} - ${formatDate(assignment.endDate)}`
                                  ) : assignment.startDate ? (
                                    `A partir de: ${formatDate(assignment.startDate)}`
                                  ) : assignment.endDate ? (
                                    `Até: ${formatDate(assignment.endDate)}`
                                  ) : (
                                    "Vinculação permanente"
                                  )}
                                </div>
                              </div>
                              
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRemoveAssignment(assignment.id)}
                                disabled={deleteShiftAssignmentMutation.isPending}
                                data-testid={`button-remove-assignment-${assignment.id}`}
                                className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                              >
                                {deleteShiftAssignmentMutation.isPending ? (
                                  <div className="h-4 w-4 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  
                  <div className="flex justify-end space-x-2">
                    <Button 
                      variant="outline" 
                      onClick={() => setManagingShiftEmployees(null)}
                      data-testid="button-close-manage-employees"
                    >
                      Fechar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Shift Breaks Management Dialog */}
            {managingShiftBreaks && (
              <ShiftBreaksManager
                shiftId={managingShiftBreaks.id}
                shiftName={managingShiftBreaks.name}
                open={!!managingShiftBreaks}
                onOpenChange={(open) => !open && setManagingShiftBreaks(null)}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}