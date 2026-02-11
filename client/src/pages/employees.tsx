import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Users, Mail, Building, Shield, Settings, UserCheck, Plus, Search, FileText, MapPin, Phone, Briefcase, GraduationCap, Heart, Edit, Trash2, Key, Lock, Download, Upload, FileDown } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertCompleteEmployeeSchema, type InsertCompleteEmployee } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Sidebar from "@/components/layout/sidebar";
import TopBar from "@/components/layout/top-bar";

// Função utilitária para aplicar máscara de telefone brasileiro
const applyPhoneMask = (value: string): string => {
  // Remove todos os caracteres não numéricos
  const numbersOnly = value.replace(/\D/g, '');
  
  // Limita a 11 dígitos (2 para DDD + 9 para número)
  const limitedNumbers = numbersOnly.slice(0, 11);
  
  // Aplica a máscara conforme o número de dígitos
  if (limitedNumbers.length <= 2) {
    return `(${limitedNumbers}`;
  } else if (limitedNumbers.length <= 6) {
    return `(${limitedNumbers.slice(0, 2)}) ${limitedNumbers.slice(2)}`;
  } else if (limitedNumbers.length <= 10) {
    return `(${limitedNumbers.slice(0, 2)}) ${limitedNumbers.slice(2, 6)}-${limitedNumbers.slice(6)}`;
  } else {
    return `(${limitedNumbers.slice(0, 2)}) ${limitedNumbers.slice(2, 7)}-${limitedNumbers.slice(7)}`;
  }
};

// Função para criar handler customizado que aplica a máscara
const createPhoneHandler = (field: any) => ({
  ...field,
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
    const maskedValue = applyPhoneMask(e.target.value);
    field.onChange(maskedValue);
  }
});

// Mapeia nomes de campos para as abas correspondentes
const FIELD_TO_TAB_MAP: Record<string, string> = {
  firstName: 'pessoais',
  lastName: 'pessoais',
  email: 'pessoais',
  birthDate: 'pessoais',
  gender: 'pessoais',
  cpf: 'documentos',
  ctps: 'documentos',
  pisPasep: 'documentos',
  cep: 'endereco',
  address: 'endereco',
  addressNumber: 'endereco',
  addressComplement: 'endereco',
  neighborhood: 'endereco',
  city: 'endereco',
  state: 'endereco',
  country: 'endereco',
  personalPhone: 'contatos',
  commercialPhone: 'contatos',
  emergencyContactName: 'contatos',
  emergencyContactPhone: 'contatos',
  emergencyContactRelationship: 'contatos',
  position: 'profissionais',
  internalId: 'profissionais',
  companyId: 'profissionais',
  departmentId: 'profissionais',
  admissionDate: 'profissionais',
  contractType: 'profissionais',
  workSchedule: 'profissionais',
  salary: 'profissionais',
  benefits: 'profissionais',
  educationLevel: 'profissionais',
  institution: 'profissionais',
  course: 'profissionais',
  graduationYear: 'profissionais',
};

export default function Employees() {
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showInactive, setShowInactive] = useState(false);
  const [deleteEmployee, setDeleteEmployee] = useState<any>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [managingUser, setManagingUser] = useState<any>(null);
  const [isResetPasswordLoading, setIsResetPasswordLoading] = useState(false);
  const [temporaryPassword, setTemporaryPassword] = useState("");
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [importResults, setImportResults] = useState<any>(null);
  const [activeAddTab, setActiveAddTab] = useState("pessoais");
  const [activeEditTab, setActiveEditTab] = useState("pessoais");
  const { toast } = useToast();

  const { data: user } = useQuery({
    queryKey: ["/api/auth/user"],
  });

  const { data: allUsers, isLoading: usersLoading } = useQuery({
    queryKey: ["/api/admin/users"],
    enabled: user?.role === 'admin' || user?.role === 'superadmin',
  });

  const { data: departments } = useQuery({
    queryKey: ["/api/departments"],
    enabled: user?.role === 'admin' || user?.role === 'superadmin',
  });

  // Fetch companies for SuperAdmin and regular Admin
  const { data: companies } = useQuery({
    queryKey: user?.role === 'superadmin' ? ["/api/superadmin/companies"] : ["/api/companies"],
    enabled: user?.role === 'admin' || user?.role === 'superadmin',
  });

  // Form for editing employee
  const editForm = useForm<InsertCompleteEmployee>({
    resolver: zodResolver(insertCompleteEmployeeSchema),
    mode: "onSubmit",
    criteriaMode: "firstError",
    shouldFocusError: true,
    defaultValues: {
      // Dados pessoais
      firstName: "",
      lastName: "",
      email: "",
      cpf: "",
      rg: "",
      rgIssuingOrgan: "",
      ctps: "",
      pisPasep: "",
      tituloEleitor: "",
      birthDate: "",
      maritalStatus: "",
      gender: "prefiro_nao_informar",
      nationality: "",
      naturalness: "",
      
      // Endereço
      cep: "",
      address: "",
      addressNumber: "",
      addressComplement: "",
      neighborhood: "",
      city: "",
      state: "",
      country: "Brasil",
      
      // Contatos
      personalPhone: "",
      commercialPhone: "",
      emergencyContactName: "",
      emergencyContactPhone: "",
      emergencyContactRelationship: "",
      
      // Dados profissionais
      internalId: "",
      role: "employee",
      departmentId: null,
      position: "",
      admissionDate: "",
      contractType: "clt",
      workSchedule: "integral",
      salary: 0,
      benefits: "",
      
      // Dados bancários
      bankCode: "",
      bankName: "",
      agencyNumber: "",
      accountNumber: "",
      accountType: "corrente",
      pixKey: "",
      
      // Escolaridade
      educationLevel: "medio",
      institution: "",
      course: "",
      graduationYear: new Date().getFullYear(),
      
      // Sistema
      isActive: true,
    },
  });

  // Form for adding complete employee
  const addForm = useForm<InsertCompleteEmployee>({
    resolver: zodResolver(insertCompleteEmployeeSchema),
    mode: "onSubmit",
    criteriaMode: "firstError",
    shouldFocusError: true,
    defaultValues: {
      // Dados pessoais
      firstName: "",
      lastName: "",
      email: "",
      cpf: "",
      rg: "",
      rgIssuingOrgan: "",
      ctps: "",
      pisPasep: "",
      tituloEleitor: "",
      birthDate: "",
      maritalStatus: "",
      gender: "prefiro_nao_informar",
      nationality: "",
      naturalness: "",
      
      // Endereço
      cep: "",
      address: "",
      addressNumber: "",
      addressComplement: "",
      neighborhood: "",
      city: "",
      state: "",
      country: "Brasil",
      
      // Contatos
      personalPhone: "",
      commercialPhone: "",
      emergencyContactName: "",
      emergencyContactPhone: "",
      emergencyContactRelationship: "",
      
      // Dados profissionais
      internalId: "",
      role: "employee",
      companyId: null,
      departmentId: null,
      position: "",
      admissionDate: "",
      contractType: "clt",
      workSchedule: "integral",
      salary: 0,
      benefits: "",
      
      // Dados bancários
      bankCode: "",
      bankName: "",
      agencyNumber: "",
      accountNumber: "",
      accountType: "corrente",
      pixKey: "",
      
      // Escolaridade
      educationLevel: "medio",
      institution: "",
      course: "",
      graduationYear: new Date().getFullYear(),
      
      // Sistema
      isActive: true,
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ userId, data }: { userId: string; data: any }) => {
      await apiRequest(`/api/admin/users/${userId}`, { method: "PUT", body: JSON.stringify(data) });
    },
    onSuccess: () => {
      // Force refetch to ensure UI is synchronized
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.refetchQueries({ queryKey: ["/api/admin/users"] });
      setIsEditDialogOpen(false);
      setSelectedEmployee(null);
      toast({
        title: "Sucesso",
        description: "Funcionário atualizado com sucesso",
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

  const addEmployeeMutation = useMutation({
    mutationFn: async (data: InsertCompleteEmployee) => {
      const response = await fetch("/api/admin/users", { 
        method: "POST", 
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data) 
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Erro ao cadastrar funcionário");
      }
      
      return await response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setIsAddDialogOpen(false);
      addForm.reset();
      
      if (data.emailFailed) {
        toast({
          title: "Atenção",
          description: data.message || "Funcionário cadastrado, mas não foi possível enviar o email com as credenciais. Entre em contato com o administrador do sistema para obter as credenciais de acesso.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Sucesso",
          description: "Funcionário cadastrado com sucesso e email com credenciais enviado!",
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const editEmployeeMutation = useMutation({
    mutationFn: async (data: InsertCompleteEmployee) => {
      await apiRequest(`/api/admin/users/${selectedEmployee.id}`, { 
        method: "PUT", 
        body: JSON.stringify(data) 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setIsEditDialogOpen(false);
      setSelectedEmployee(null);
      editForm.reset();
      toast({
        title: "Sucesso",
        description: "Funcionário atualizado com sucesso",
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

  const hardDeleteEmployeeMutation = useMutation({
    mutationFn: async ({ userId, confirmation }: { userId: string; confirmation: string }) => {
      await apiRequest(`/api/admin/users/${userId}/hard-delete`, { 
        method: "POST", 
        body: JSON.stringify({ confirmation }) 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setDeleteEmployee(null);
      setDeleteConfirmation("");
      toast({
        title: "Sucesso",
        description: "Funcionário excluído permanentemente",
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

  // Mutation for managing user role and company (SuperAdmin only)
  const manageUserMutation = useMutation({
    mutationFn: async ({ userId, role, companyId }: { userId: string; role: string; companyId?: number }) => {
      await apiRequest(`/api/superadmin/users/${userId}/role`, { 
        method: "PUT", 
        body: JSON.stringify({ role, companyId }) 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setManagingUser(null);
      toast({
        title: "Sucesso",
        description: "Usuário atualizado com sucesso",
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

  const toggleEmployeeStatus = (employee: any) => {
    updateUserMutation.mutate({
      userId: employee.id,
      data: { isActive: !employee.isActive }
    });
  };

  const handleRoleChange = (employee: any, newRole: string) => {
    updateUserMutation.mutate({
      userId: employee.id,
      data: { role: newRole }
    });
  };

  const handleDepartmentChange = (employee: any, departmentId: string) => {
    updateUserMutation.mutate({
      userId: employee.id,
      data: { departmentId: departmentId && departmentId !== "none" ? parseInt(departmentId) : null }
    });
  };

  const handleCompanyChange = (employee: any, companyId: string) => {
    updateUserMutation.mutate({
      userId: employee.id,
      data: { companyId: companyId && companyId !== "none" ? parseInt(companyId) : null }
    });
  };

  const handleManageUser = (employee: any) => {
    setManagingUser(employee);
  };

  const handleUpdateUserRole = (role: string, companyId?: number) => {
    if (!managingUser) return;
    manageUserMutation.mutate({
      userId: managingUser.id,
      role,
      companyId
    });
  };

  // Função para resetar senha de usuário pelo admin
  const handleResetPassword = async () => {
    if (!managingUser || !temporaryPassword.trim()) {
      toast({
        title: "Erro",
        description: "Digite uma senha temporária válida.",
        variant: "destructive",
      });
      return;
    }

    if (temporaryPassword.length < 6) {
      toast({
        title: "Erro",
        description: "A senha temporária deve ter pelo menos 6 caracteres.",
        variant: "destructive",
      });
      return;
    }

    setIsResetPasswordLoading(true);
    try {
      const response = await fetch("/api/auth/admin/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          userId: managingUser.id,
          temporaryPassword,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Erro ao resetar senha");
      }

      toast({
        title: "Senha resetada!",
        description: result.message,
      });

      setTemporaryPassword("");
      setManagingUser(null);

    } catch (error) {
      console.error("Erro ao resetar senha:", error);
      toast({
        title: "Erro ao resetar senha",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setIsResetPasswordLoading(false);
    }
  };


  // Função auxiliar para limpar dados do formulário antes de enviar
  const cleanFormData = (data: any) => {
    const cleaned = { ...data };
    
    // Converter strings vazias para null em campos de data
    const dateFields = ['birthDate', 'admissionDate', 'dismissalDate'];
    dateFields.forEach(field => {
      if (cleaned[field] === "" || cleaned[field] === null || (typeof cleaned[field] === 'string' && cleaned[field].trim() === "")) {
        cleaned[field] = null;
      }
    });
    
    // Converter strings vazias/inválidas para null em campos numéricos
    const numericFields = ['graduationYear', 'salary'];
    numericFields.forEach(field => {
      if (cleaned[field] === "" || cleaned[field] === null || 
          (typeof cleaned[field] === 'string' && cleaned[field].trim() === "") ||
          cleaned[field] === 0) {
        cleaned[field] = null;
      } else if (typeof cleaned[field] === 'string') {
        const num = Number(cleaned[field]);
        cleaned[field] = isNaN(num) ? null : num;
      }
    });
    
    return cleaned;
  };

  // Handler para erros de validação - navega para a aba com o primeiro erro e foca no campo
  const onAddFormInvalid = (errors: any) => {
    console.log('[FORM VALIDATION ERROR]', JSON.stringify(errors, null, 2));
    const firstErrorField = Object.keys(errors)[0];
    const targetTab = FIELD_TO_TAB_MAP[firstErrorField] || 'pessoais';
    
    // Navega para a aba com erro
    setActiveAddTab(targetTab);
    
    // Aguarda a aba ser ativada e então foca no campo
    setTimeout(() => {
      addForm.setFocus(firstErrorField as any);
    }, 100);
  };

  const onEditFormInvalid = (errors: any) => {
    const firstErrorField = Object.keys(errors)[0];
    const targetTab = FIELD_TO_TAB_MAP[firstErrorField] || 'pessoais';
    
    // Navega para a aba com erro
    setActiveEditTab(targetTab);
    
    // Aguarda a aba ser ativada e então foca no campo
    setTimeout(() => {
      editForm.setFocus(firstErrorField as any);
    }, 100);
  };

  const onSubmitNewEmployee = (data: InsertCompleteEmployee) => {
    console.log('[SUBMIT NEW EMPLOYEE]', data);
    // Validação de companyId
    if (user?.role === 'superadmin') {
      // Superadmin deve selecionar uma empresa
      if (!data.companyId) {
        toast({
          title: "Erro",
          description: "Por favor, selecione uma empresa para o funcionário",
          variant: "destructive",
        });
        return;
      }
    } else {
      // Para não-superadmins, usa o companyId do usuário logado
      if (!user?.companyId) {
        toast({
          title: "Erro",
          description: "Seu perfil não possui empresa vinculada. Entre em contato com o administrador.",
          variant: "destructive",
        });
        return;
      }
      data.companyId = user.companyId;
    }
    
    // Limpar dados antes de enviar
    const cleanedData = cleanFormData(data);
    
    addEmployeeMutation.mutate(cleanedData as any);
  };

  const onSubmitEditEmployee = (data: InsertCompleteEmployee) => {
    // Limpar dados antes de enviar
    const cleanedData = cleanFormData(data);
    
    editEmployeeMutation.mutate(cleanedData as any);
  };

  const handleEditEmployee = (employee: any) => {
    setSelectedEmployee(employee);
    
    // Pre-populate form with employee data
    editForm.reset({
      // Dados pessoais
      firstName: employee.firstName || "",
      lastName: employee.lastName || "",
      email: employee.email || "",
      cpf: employee.cpf || "",
      rg: employee.rg || "",
      rgIssuingOrgan: employee.rgIssuingOrgan || "",
      ctps: employee.ctps || "",
      pisPasep: employee.pisPasep || "",
      tituloEleitor: employee.tituloEleitor || "",
      birthDate: employee.birthDate || "",
      maritalStatus: employee.maritalStatus || "solteiro",
      gender: employee.gender || "prefiro_nao_informar",
      nationality: employee.nationality || "Brasileira",
      naturalness: employee.naturalness || "",
      
      // Endereço
      cep: employee.cep || "",
      address: employee.address || "",
      addressNumber: employee.addressNumber || "",
      addressComplement: employee.addressComplement || "",
      neighborhood: employee.neighborhood || "",
      city: employee.city || "",
      state: employee.state || "",
      country: employee.country || "Brasil",
      
      // Contatos
      personalPhone: employee.personalPhone || "",
      commercialPhone: employee.commercialPhone || "",
      emergencyContactName: employee.emergencyContactName || "",
      emergencyContactPhone: employee.emergencyContactPhone || "",
      emergencyContactRelationship: employee.emergencyContactRelationship || "",
      
      // Dados profissionais
      internalId: employee.internalId || "",
      role: employee.role || "employee",
      departmentId: employee.departmentId ?? null,
      position: employee.position || "",
      admissionDate: employee.admissionDate || "",
      contractType: employee.contractType || "clt",
      workSchedule: employee.workSchedule || "integral",
      salary: parseFloat(employee.salary || "0"),
      benefits: employee.benefits || "",
      
      // Dados bancários
      bankCode: employee.bankCode || "",
      bankName: employee.bankName || "",
      agencyNumber: employee.agencyNumber || "",
      accountNumber: employee.accountNumber || "",
      accountType: employee.accountType || "corrente",
      pixKey: employee.pixKey || "",
      
      // Escolaridade
      educationLevel: employee.educationLevel || "medio",
      institution: employee.institution || "",
      course: employee.course || "",
      graduationYear: employee.graduationYear || new Date().getFullYear(),
      
      // Sistema
      isActive: employee.isActive !== false,
    });
    
    setIsEditDialogOpen(true);
  };

  // Filter users based on search term and active/inactive status, then sort alphabetically
  const filteredUsers = allUsers?.filter((employee: any) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = (
      employee.firstName?.toLowerCase().includes(searchLower) ||
      employee.lastName?.toLowerCase().includes(searchLower) ||
      employee.email?.toLowerCase().includes(searchLower) ||
      employee.position?.toLowerCase().includes(searchLower)
    );
    
    // If showInactive is false, only show active employees
    // If showInactive is true, show all employees (both active and inactive)
    const matchesStatus = showInactive || employee.isActive;
    
    return matchesSearch && matchesStatus;
  })?.sort((a: any, b: any) => {
    // Sort alphabetically by first name, then last name
    const nameA = `${a.firstName || ''} ${a.lastName || ''}`.trim().toLowerCase();
    const nameB = `${b.firstName || ''} ${b.lastName || ''}`.trim().toLowerCase();
    return nameA.localeCompare(nameB);
  });



  // CSV Handlers
  const handleDownloadTemplate = async () => {
    try {
      const response = await fetch('/api/admin/users/csv/template', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Erro ao baixar modelo');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'modelo_funcionarios.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Modelo baixado",
        description: "Modelo CSV baixado com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao baixar modelo",
        variant: "destructive",
      });
    }
  };

  const handleImportCSV = async () => {
    if (!csvFile) {
      toast({
        title: "Erro",
        description: "Selecione um arquivo CSV",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append('file', csvFile);

    try {
      const response = await fetch('/api/admin/users/csv/import', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Erro ao importar CSV');
      }
      
      setImportResults(result);
      
      toast({
        title: "Importação concluída",
        description: result.message,
      });
      
      // Refresh users list
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao importar CSV",
        variant: "destructive",
      });
    }
  };

  const handleExportCSV = async () => {
    try {
      const response = await fetch('/api/admin/users/csv/export', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Erro ao exportar dados');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const timestamp = new Date().toISOString().split('T')[0];
      a.download = `funcionarios_${timestamp}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Exportação concluída",
        description: "Dados exportados com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao exportar dados",
        variant: "destructive",
      });
    }
  };

  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';

  if (!isAdmin) {
    return (
      <div className="flex h-screen bg-gray-50 dark:bg-slate-900">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <TopBar title="Funcionários" />
          <main className="flex-1 overflow-auto p-6">
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Acesso Restrito</h1>
                <p className="text-gray-600 dark:text-gray-400">Apenas administradores podem acessar esta página.</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-slate-900">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <TopBar title="Funcionários" />
        <main className="flex-1 overflow-auto p-6">
          {/* Header with Search and Add Employee Button */}
          <div className="flex items-center justify-between mb-6">
            {/* Search and filters on the left */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por nome, email ou cargo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-md"
                  data-testid="input-search-employees"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="show-inactive"
                  checked={showInactive}
                  onCheckedChange={setShowInactive}
                  data-testid="checkbox-show-inactive"
                />
                <Label htmlFor="show-inactive" className="text-sm font-medium">
                  Mostrar inativos
                </Label>
              </div>
            </div>
            
            {/* Action Buttons on the right */}
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                onClick={handleDownloadTemplate}
                data-testid="button-download-template"
              >
                <FileDown className="h-4 w-4 mr-2" />
                Baixar Modelo
              </Button>
              
              <Button 
                variant="outline" 
                onClick={handleExportCSV}
                data-testid="button-export-csv"
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar CSV
              </Button>
              
              <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" data-testid="button-import-csv">
                    <Upload className="h-4 w-4 mr-2" />
                    Importar CSV
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Importar Funcionários via CSV</DialogTitle>
                    <DialogDescription>
                      Selecione um arquivo CSV para importar funcionários. Use o modelo fornecido como referência.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="csv-file">Arquivo CSV</Label>
                      <Input
                        id="csv-file"
                        type="file"
                        accept=".csv"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setCsvFile(file);
                            setImportResults(null);
                          }
                        }}
                        data-testid="input-csv-file"
                      />
                    </div>
                    
                    {csvFile && (
                      <Alert>
                        <FileText className="h-4 w-4" />
                        <AlertDescription>
                          Arquivo selecionado: {csvFile.name}
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    {importResults && (
                      <Alert>
                        <AlertDescription>
                          <div className="space-y-2">
                            <p className="font-semibold">Resultado da Importação:</p>
                            <p>✅ {importResults.success} funcionários importados com sucesso</p>
                            {importResults.errors && importResults.errors.length > 0 && (
                              <div className="mt-2">
                                <p className="text-red-600 font-semibold">❌ Erros encontrados:</p>
                                <div className="max-h-40 overflow-y-auto">
                                  {importResults.errors.map((err: any, idx: number) => (
                                    <p key={idx} className="text-sm text-red-600">
                                      Linha {err.row} ({err.email}): {err.error}
                                    </p>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                  
                  <DialogFooter>
                    <Button variant="outline" onClick={() => {
                      setIsImportDialogOpen(false);
                      setCsvFile(null);
                      setImportResults(null);
                    }}>
                      Cancelar
                    </Button>
                    <Button onClick={handleImportCSV} disabled={!csvFile} data-testid="button-confirm-import">
                      Importar
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="point-primary" data-testid="button-add-employee">
                    <Plus className="h-4 w-4 mr-2" />
                    Cadastrar Funcionário
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Cadastro Completo de Funcionário</DialogTitle>
                </DialogHeader>
                <Form {...addForm}>
                  <form onSubmit={addForm.handleSubmit(onSubmitNewEmployee, onAddFormInvalid)} className="space-y-6">
                    <Tabs value={activeAddTab} onValueChange={setActiveAddTab} className="w-full">
                      <TabsList className="grid w-full grid-cols-6">
                        <TabsTrigger value="pessoais" className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          Pessoais
                        </TabsTrigger>
                        <TabsTrigger value="documentos" className="flex items-center gap-1">
                          <FileText className="h-4 w-4" />
                          Documentos
                        </TabsTrigger>
                        <TabsTrigger value="endereco" className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          Endereço
                        </TabsTrigger>
                        <TabsTrigger value="contatos" className="flex items-center gap-1">
                          <Phone className="h-4 w-4" />
                          Contatos
                        </TabsTrigger>
                        <TabsTrigger value="profissionais" className="flex items-center gap-1">
                          <Briefcase className="h-4 w-4" />
                          Profissional
                        </TabsTrigger>
                      </TabsList>

                      {/* Dados Pessoais */}
                      <TabsContent value="pessoais" className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={addForm.control}
                            name="firstName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nome *</FormLabel>
                                <FormControl>
                                  <Input placeholder="Ex: João" {...field} data-testid="input-first-name" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={addForm.control}
                            name="lastName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Sobrenome *</FormLabel>
                                <FormControl>
                                  <Input placeholder="Ex: Silva" {...field} data-testid="input-last-name" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={addForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>E-mail *</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="joao.silva@empresa.com" {...field} data-testid="input-email" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-3 gap-4">
                          <FormField
                            control={addForm.control}
                            name="birthDate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Data de Nascimento *</FormLabel>
                                <FormControl>
                                  <Input type="date" {...field} data-testid="input-birth-date" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={addForm.control}
                            name="gender"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Gênero</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger data-testid="select-gender">
                                      <SelectValue />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="masculino">Masculino</SelectItem>
                                    <SelectItem value="feminino">Feminino</SelectItem>
                                    <SelectItem value="outro">Outro</SelectItem>
                                    <SelectItem value="prefiro_nao_informar">Prefiro não informar</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                      </TabsContent>

                      {/* Documentos */}
                      <TabsContent value="documentos" className="space-y-4">
                        <FormField
                          control={addForm.control}
                          name="cpf"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>CPF *</FormLabel>
                              <FormControl>
                                <Input placeholder="000.000.000-00" {...field} data-testid="input-cpf" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={addForm.control}
                            name="ctps"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Carteira de Trabalho</FormLabel>
                                <FormControl>
                                  <Input placeholder="000000000" {...field} data-testid="input-ctps" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={addForm.control}
                            name="pisPasep"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>PIS/PASEP</FormLabel>
                                <FormControl>
                                  <Input placeholder="000.00000.00-0" {...field} data-testid="input-pis" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </TabsContent>

                      {/* Endereço */}
                      <TabsContent value="endereco" className="space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                          <FormField
                            control={addForm.control}
                            name="cep"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>CEP *</FormLabel>
                                <FormControl>
                                  <Input placeholder="00000-000" {...field} data-testid="input-cep" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={addForm.control}
                            name="city"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Cidade *</FormLabel>
                                <FormControl>
                                  <Input placeholder="São Paulo" {...field} data-testid="input-city" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={addForm.control}
                            name="state"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Estado *</FormLabel>
                                <FormControl>
                                  <Input placeholder="SP" {...field} data-testid="input-state" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-4 gap-4">
                          <div className="col-span-2">
                            <FormField
                              control={addForm.control}
                              name="address"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Endereço *</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Rua das Flores" {...field} data-testid="input-address" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <FormField
                            control={addForm.control}
                            name="addressNumber"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Número *</FormLabel>
                                <FormControl>
                                  <Input placeholder="123" {...field} data-testid="input-address-number" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={addForm.control}
                            name="addressComplement"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Complemento</FormLabel>
                                <FormControl>
                                  <Input placeholder="Apto 45" {...field} data-testid="input-complement" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={addForm.control}
                          name="neighborhood"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Bairro *</FormLabel>
                              <FormControl>
                                <Input placeholder="Centro" {...field} data-testid="input-neighborhood" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </TabsContent>

                      {/* Contatos */}
                      <TabsContent value="contatos" className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={addForm.control}
                            name="personalPhone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Telefone Pessoal *</FormLabel>
                                <FormControl>
                                  <Input placeholder="(11) 99999-9999" {...createPhoneHandler(field)} data-testid="input-personal-phone" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={addForm.control}
                            name="commercialPhone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Telefone Comercial</FormLabel>
                                <FormControl>
                                  <Input placeholder="(11) 3333-3333" {...createPhoneHandler(field)} data-testid="input-commercial-phone" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <Separator />
                        <div className="flex items-center gap-2 mb-4">
                          <Heart className="h-5 w-5 text-red-500" />
                          <h3 className="text-lg font-semibold">Contato de Emergência</h3>
                        </div>

                        <FormField
                          control={addForm.control}
                          name="emergencyContactName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nome do Contato *</FormLabel>
                              <FormControl>
                                <Input placeholder="Maria Silva" {...field} data-testid="input-emergency-name" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={addForm.control}
                            name="emergencyContactPhone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Telefone do Contato *</FormLabel>
                                <FormControl>
                                  <Input placeholder="(11) 88888-8888" {...createPhoneHandler(field)} data-testid="input-emergency-phone" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={addForm.control}
                            name="emergencyContactRelationship"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Parentesco *</FormLabel>
                                <FormControl>
                                  <Input placeholder="Mãe, Cônjuge, Irmão..." {...field} data-testid="input-emergency-relationship" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </TabsContent>

                      {/* Dados Profissionais */}
                      <TabsContent value="profissionais" className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={addForm.control}
                            name="position"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Cargo *</FormLabel>
                                <FormControl>
                                  <Input placeholder="Analista de Sistemas" {...field} data-testid="input-position" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={addForm.control}
                            name="internalId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Registro Interno</FormLabel>
                                <FormControl>
                                  <Input placeholder="EMP001" {...field} value={field.value || ""} data-testid="input-internal-id" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        {user?.role === 'superadmin' ? (
                          <FormField
                            control={addForm.control}
                            name="companyId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Empresa *</FormLabel>
                                <Select 
                                  onValueChange={(value) => {
                                    field.onChange(parseInt(value));
                                  }} 
                                  value={field.value ? String(field.value) : undefined}
                                >
                                  <FormControl>
                                    <SelectTrigger data-testid="select-company-create">
                                      <SelectValue placeholder="Selecione uma empresa" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {companies?.map((company: any) => (
                                      <SelectItem key={company.id} value={company.id.toString()}>
                                        {company.tradeName || company.legalName || company.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        ) : (
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Empresa</label>
                            <Input 
                              value={companies?.find((c: any) => c.id === user?.companyId)?.tradeName || 
                                     companies?.find((c: any) => c.id === user?.companyId)?.legalName || 
                                     companies?.find((c: any) => c.id === user?.companyId)?.name || 
                                     "Carregando..."}
                              disabled
                              className="bg-muted"
                              data-testid="input-company-readonly"
                            />
                            <p className="text-xs text-muted-foreground">Funcionário será cadastrado na sua empresa</p>
                          </div>
                        )}

                        <FormField
                          control={addForm.control}
                          name="departmentId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Departamento</FormLabel>
                              <Select 
                                onValueChange={(value) => {
                                  field.onChange(value === "none" ? null : parseInt(value));
                                }} 
                                value={field.value === null ? "none" : String(field.value)}
                              >
                                <FormControl>
                                  <SelectTrigger data-testid="select-department-create">
                                    <SelectValue placeholder="Selecione um departamento" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="none">Sem departamento</SelectItem>
                                  {departments?.map((dept: any) => (
                                    <SelectItem key={dept.id} value={dept.id.toString()}>
                                      {dept.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-3 gap-4">
                          <FormField
                            control={addForm.control}
                            name="admissionDate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Data de Admissão *</FormLabel>
                                <FormControl>
                                  <Input type="date" {...field} data-testid="input-admission-date" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={addForm.control}
                            name="contractType"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Tipo de Contrato *</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger data-testid="select-contract-type">
                                      <SelectValue />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="clt">CLT</SelectItem>
                                    <SelectItem value="pj">PJ</SelectItem>
                                    <SelectItem value="estagio">Estágio</SelectItem>
                                    <SelectItem value="terceirizado">Terceirizado</SelectItem>
                                    <SelectItem value="temporario">Temporário</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={addForm.control}
                            name="workSchedule"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Jornada de Trabalho *</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger data-testid="select-work-schedule">
                                      <SelectValue />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="integral">Integral</SelectItem>
                                    <SelectItem value="meio_periodo">Meio Período</SelectItem>
                                    <SelectItem value="flexivel">Flexível</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={addForm.control}
                            name="salary"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Salário *</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    step="0.01" 
                                    placeholder="5000.00" 
                                    {...field}
                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                    data-testid="input-salary"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={addForm.control}
                            name="role"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nível de Acesso</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger data-testid="select-role">
                                      <SelectValue />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="employee">Funcionário</SelectItem>
                                    <SelectItem value="supervisor">Supervisor</SelectItem>
                                    <SelectItem value="admin">Administrador</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={addForm.control}
                          name="benefits"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Benefícios</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Vale alimentação, plano de saúde, convênio odontológico..." 
                                  {...field} 
                                  data-testid="input-benefits"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-3 gap-4">
                          <FormField
                            control={addForm.control}
                            name="educationLevel"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Escolaridade</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger data-testid="select-education">
                                      <SelectValue />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="fundamental">Ensino Fundamental</SelectItem>
                                    <SelectItem value="medio">Ensino Médio</SelectItem>
                                    <SelectItem value="superior">Ensino Superior</SelectItem>
                                    <SelectItem value="pos_graduacao">Pós-graduação</SelectItem>
                                    <SelectItem value="mestrado">Mestrado</SelectItem>
                                    <SelectItem value="doutorado">Doutorado</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={addForm.control}
                            name="institution"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Instituição</FormLabel>
                                <FormControl>
                                  <Input placeholder="Universidade de São Paulo" {...field} data-testid="input-institution" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={addForm.control}
                            name="course"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Curso</FormLabel>
                                <FormControl>
                                  <Input placeholder="Engenharia de Software" {...field} data-testid="input-course" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </TabsContent>

                    </Tabs>

                    <div className="flex gap-2 pt-4">
                      <Button 
                        type="submit" 
                        disabled={addEmployeeMutation.isPending} 
                        className="point-primary"
                        data-testid="button-save-employee"
                      >
                        {addEmployeeMutation.isPending ? "Cadastrando..." : "Cadastrar Funcionário"}
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsAddDialogOpen(false)}
                        data-testid="button-cancel-employee"
                      >
                        Cancelar
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
            </div>

            {/* Edit Employee Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Editar Funcionário</DialogTitle>
                </DialogHeader>
                <Form {...editForm}>
                  <form onSubmit={editForm.handleSubmit(onSubmitEditEmployee, onEditFormInvalid)} className="space-y-6">
                    <Tabs value={activeEditTab} onValueChange={setActiveEditTab} className="w-full">
                      <TabsList className="grid w-full grid-cols-6">
                        <TabsTrigger value="pessoais" className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          Pessoais
                        </TabsTrigger>
                        <TabsTrigger value="documentos" className="flex items-center gap-1">
                          <FileText className="h-4 w-4" />
                          Documentos
                        </TabsTrigger>
                        <TabsTrigger value="endereco" className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          Endereço
                        </TabsTrigger>
                        <TabsTrigger value="contatos" className="flex items-center gap-1">
                          <Phone className="h-4 w-4" />
                          Contatos
                        </TabsTrigger>
                        <TabsTrigger value="profissionais" className="flex items-center gap-1">
                          <Briefcase className="h-4 w-4" />
                          Profissional
                        </TabsTrigger>
                      </TabsList>

                      {/* Dados Pessoais */}
                      <TabsContent value="pessoais" className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={editForm.control}
                            name="firstName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nome *</FormLabel>
                                <FormControl>
                                  <Input placeholder="Ex: João" {...field} data-testid="input-first-name-edit" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={editForm.control}
                            name="lastName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Sobrenome *</FormLabel>
                                <FormControl>
                                  <Input placeholder="Ex: Silva" {...field} data-testid="input-last-name-edit" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <FormField
                          control={editForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>E-mail *</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="joao.silva@email.com" {...field} data-testid="input-email-edit" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-3 gap-4">
                          <FormField
                            control={editForm.control}
                            name="personalPhone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Telefone Pessoal *</FormLabel>
                                <FormControl>
                                  <Input placeholder="(11) 99999-9999" {...createPhoneHandler(field)} data-testid="input-personal-phone-edit" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={editForm.control}
                            name="birthDate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Data de Nascimento</FormLabel>
                                <FormControl>
                                  <Input type="date" {...field} data-testid="input-birth-date-edit" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={editForm.control}
                            name="gender"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Gênero</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger data-testid="select-gender-edit">
                                      <SelectValue />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="masculino">Masculino</SelectItem>
                                    <SelectItem value="feminino">Feminino</SelectItem>
                                    <SelectItem value="nao_binario">Não Binário</SelectItem>
                                    <SelectItem value="prefiro_nao_informar">Prefiro não informar</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </TabsContent>

                      {/* Documentos */}
                      <TabsContent value="documentos" className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={editForm.control}
                            name="cpf"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>CPF *</FormLabel>
                                <FormControl>
                                  <Input placeholder="000.000.000-00" {...field} data-testid="input-cpf-edit" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={editForm.control}
                            name="ctps"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>CTPS</FormLabel>
                                <FormControl>
                                  <Input placeholder="0000000-00" {...field} data-testid="input-ctps-edit" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={editForm.control}
                            name="pisPasep"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>PIS/PASEP</FormLabel>
                                <FormControl>
                                  <Input placeholder="000.00000.00-0" {...field} data-testid="input-pis-edit" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </TabsContent>

                      {/* Endereço */}
                      <TabsContent value="endereco" className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={editForm.control}
                            name="cep"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>CEP</FormLabel>
                                <FormControl>
                                  <Input placeholder="00000-000" {...field} data-testid="input-cep-edit" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={editForm.control}
                            name="address"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Endereço</FormLabel>
                                <FormControl>
                                  <Input placeholder="Rua das Flores" {...field} data-testid="input-address-edit" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <FormField
                            control={editForm.control}
                            name="addressNumber"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Número</FormLabel>
                                <FormControl>
                                  <Input placeholder="123" {...field} data-testid="input-address-number-edit" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={editForm.control}
                            name="addressComplement"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Complemento</FormLabel>
                                <FormControl>
                                  <Input placeholder="Apto 45" {...field} data-testid="input-complement-edit" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={editForm.control}
                            name="neighborhood"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Bairro</FormLabel>
                                <FormControl>
                                  <Input placeholder="Centro" {...field} data-testid="input-neighborhood-edit" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <FormField
                            control={editForm.control}
                            name="city"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Cidade</FormLabel>
                                <FormControl>
                                  <Input placeholder="São Paulo" {...field} data-testid="input-city-edit" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={editForm.control}
                            name="state"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Estado</FormLabel>
                                <FormControl>
                                  <Input placeholder="SP" {...field} data-testid="input-state-edit" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={editForm.control}
                            name="country"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>País</FormLabel>
                                <FormControl>
                                  <Input placeholder="Brasil" {...field} data-testid="input-country-edit" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </TabsContent>

                      {/* Contatos */}
                      <TabsContent value="contatos" className="space-y-4">
                        <FormField
                          control={editForm.control}
                          name="commercialPhone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Telefone Comercial</FormLabel>
                              <FormControl>
                                <Input placeholder="(11) 3000-0000" {...createPhoneHandler(field)} data-testid="input-commercial-phone-edit" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={editForm.control}
                            name="emergencyContactName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nome do Contato de Emergência</FormLabel>
                                <FormControl>
                                  <Input placeholder="Maria Silva" {...field} data-testid="input-emergency-name-edit" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={editForm.control}
                            name="emergencyContactPhone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Telefone do Contato de Emergência</FormLabel>
                                <FormControl>
                                  <Input placeholder="(11) 99999-8888" {...createPhoneHandler(field)} data-testid="input-emergency-phone-edit" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={editForm.control}
                          name="emergencyContactRelationship"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Parentesco do Contato de Emergência</FormLabel>
                              <FormControl>
                                <Input placeholder="Mãe, Pai, Cônjuge, etc." {...field} data-testid="input-emergency-relationship-edit" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </TabsContent>

                      {/* Profissional */}
                      <TabsContent value="profissionais" className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={editForm.control}
                            name="position"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Cargo *</FormLabel>
                                <FormControl>
                                  <Input placeholder="Desenvolvedor Full Stack" {...field} data-testid="input-position-edit" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={editForm.control}
                            name="internalId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Registro Interno</FormLabel>
                                <FormControl>
                                  <Input placeholder="EMP001" {...field} value={field.value || ""} data-testid="input-internal-id-edit" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={editForm.control}
                            name="departmentId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Departamento</FormLabel>
                                <Select 
                                  onValueChange={(value) => {
                                    field.onChange(value === "none" ? null : parseInt(value));
                                  }} 
                                  value={field.value === null ? "none" : String(field.value)}
                                >
                                  <FormControl>
                                    <SelectTrigger data-testid="select-department-edit">
                                      <SelectValue placeholder="Selecione um departamento" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="none">Sem departamento</SelectItem>
                                    {departments?.map((dept: any) => (
                                      <SelectItem key={dept.id} value={dept.id.toString()}>
                                        {dept.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <FormField
                            control={editForm.control}
                            name="admissionDate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Data de Admissão</FormLabel>
                                <FormControl>
                                  <Input type="date" {...field} data-testid="input-admission-date-edit" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={editForm.control}
                            name="contractType"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Tipo de Contrato</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger data-testid="select-contract-type-edit">
                                      <SelectValue />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="clt">CLT</SelectItem>
                                    <SelectItem value="pj">PJ</SelectItem>
                                    <SelectItem value="estagio">Estágio</SelectItem>
                                    <SelectItem value="terceirizado">Terceirizado</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={editForm.control}
                            name="workSchedule"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Jornada de Trabalho</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger data-testid="select-work-schedule-edit">
                                      <SelectValue />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="integral">Integral</SelectItem>
                                    <SelectItem value="meio_periodo">Meio Período</SelectItem>
                                    <SelectItem value="flexivel">Flexível</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={editForm.control}
                            name="salary"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Salário</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    step="0.01" 
                                    placeholder="5000.00" 
                                    {...field}
                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                    data-testid="input-salary-edit"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={editForm.control}
                            name="role"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nível de Acesso</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger data-testid="select-role-edit">
                                      <SelectValue />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="employee">Funcionário</SelectItem>
                                    <SelectItem value="supervisor">Supervisor</SelectItem>
                                    <SelectItem value="admin">Administrador</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={editForm.control}
                          name="benefits"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Benefícios</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Vale alimentação, plano de saúde, convênio odontológico..." 
                                  {...field} 
                                  data-testid="input-benefits-edit"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-3 gap-4">
                          <FormField
                            control={editForm.control}
                            name="educationLevel"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Escolaridade</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger data-testid="select-education-edit">
                                      <SelectValue />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="fundamental">Ensino Fundamental</SelectItem>
                                    <SelectItem value="medio">Ensino Médio</SelectItem>
                                    <SelectItem value="superior">Ensino Superior</SelectItem>
                                    <SelectItem value="pos_graduacao">Pós-graduação</SelectItem>
                                    <SelectItem value="mestrado">Mestrado</SelectItem>
                                    <SelectItem value="doutorado">Doutorado</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={editForm.control}
                            name="institution"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Instituição</FormLabel>
                                <FormControl>
                                  <Input placeholder="Universidade de São Paulo" {...field} data-testid="input-institution-edit" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={editForm.control}
                            name="course"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Curso</FormLabel>
                                <FormControl>
                                  <Input placeholder="Engenharia de Software" {...field} data-testid="input-course-edit" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </TabsContent>

                    </Tabs>

                    <div className="flex gap-2 pt-4">
                      <Button 
                        type="submit" 
                        disabled={editEmployeeMutation.isPending} 
                        className="point-primary"
                        data-testid="button-save-edit-employee"
                      >
                        {editEmployeeMutation.isPending ? "Atualizando..." : "Atualizar Funcionário"}
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsEditDialogOpen(false)}
                        data-testid="button-cancel-edit-employee"
                      >
                        Cancelar
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Employee Table */}
          {usersLoading ? (
            <Card>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="space-y-3">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                        <div className="w-20 h-6 bg-gray-200 rounded"></div>
                        <div className="w-8 h-8 bg-gray-200 rounded"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : filteredUsers && filteredUsers.length > 0 ? (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12"></TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Função</TableHead>
                      <TableHead>Departamento</TableHead>
                      <TableHead>Empresa</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-24">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((employee: any) => (
                      <TableRow key={employee.id} className="hover:bg-gray-50">
                        <TableCell>
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={employee.profileImageUrl} />
                            <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                              {employee.firstName?.[0]}{employee.lastName?.[0]}
                            </AvatarFallback>
                          </Avatar>
                        </TableCell>
                        <TableCell className="font-medium">
                          <div>
                            <div className="font-semibold">{employee.firstName} {employee.lastName}</div>
                            {employee.position && (
                              <div className="text-sm text-gray-500">{employee.position}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{employee.email}</div>
                          {employee.personalPhone && (
                            <div className="text-xs text-gray-500">{employee.personalPhone}</div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Select
                            value={employee.role}
                            onValueChange={(value) => handleRoleChange(employee, value)}
                            disabled={updateUserMutation.isPending}
                          >
                            <SelectTrigger className="w-28 h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="employee">Funcionário</SelectItem>
                              <SelectItem value="supervisor">Supervisor</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={employee.departmentId?.toString() || ""}
                            onValueChange={(value) => handleDepartmentChange(employee, value)}
                            disabled={updateUserMutation.isPending}
                          >
                            <SelectTrigger className="w-32 h-8 text-xs">
                              <SelectValue placeholder="Sem depto" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">Sem departamento</SelectItem>
                              {departments?.map((dept: any) => (
                                <SelectItem key={dept.id} value={dept.id.toString()}>
                                  {dept.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={employee.companyId?.toString() || ""}
                            onValueChange={(value) => handleCompanyChange(employee, value)}
                            disabled={updateUserMutation.isPending}
                          >
                            <SelectTrigger className="w-32 h-8 text-xs">
                              <SelectValue placeholder="Sem empresa" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">Sem empresa</SelectItem>
                              {companies?.map((company: any) => (
                                <SelectItem key={company.id} value={company.id.toString()}>
                                  {company.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={employee.isActive ? "default" : "destructive"} 
                            className={employee.isActive ? "bg-green-500 text-white text-xs" : "bg-red-500 text-white text-xs"}
                          >
                            {employee.isActive ? "Ativo" : "Inativo"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditEmployee(employee)}
                              className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-900/20 h-8 w-8 p-0"
                              data-testid={`button-edit-employee-${employee.id}`}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            {user?.role === 'superadmin' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleManageUser(employee)}
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 h-8 w-8 p-0"
                                data-testid={`button-manage-employee-${employee.id}`}
                              >
                                <Settings className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {searchTerm ? "Nenhum funcionário encontrado" : "Nenhum funcionário cadastrado"}
              </h2>
              <p className="text-gray-600 mb-4">
                {searchTerm 
                  ? `Não foram encontrados funcionários com "${searchTerm}"`
                  : "Comece adicionando o primeiro funcionário da empresa."
                }
              </p>
              {!searchTerm && (
                <Button 
                  onClick={() => setIsAddDialogOpen(true)} 
                  className="point-primary"
                  data-testid="button-add-first-employee"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Cadastrar Primeiro Funcionário
                </Button>
              )}
            </div>
          )}
        </main>
      </div>
      
      {/* Dialog para gerenciar usuário */}
      <Dialog open={!!managingUser} onOpenChange={() => setManagingUser(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Gerenciar Usuário
            </DialogTitle>
            <DialogDescription>
              {managingUser && `Gerenciando: ${managingUser.firstName} ${managingUser.lastName} (${managingUser.email})`}
            </DialogDescription>
          </DialogHeader>
          
          {managingUser && (
            <div className="space-y-6">
              {/* Seção de Informações do Usuário */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Informações Atuais</h4>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p><strong>Role:</strong> {managingUser.role}</p>
                  <p><strong>Status:</strong> {managingUser.isActive ? "Ativo" : "Inativo"}</p>
                  {managingUser.companyId && (
                    <p><strong>Empresa ID:</strong> {managingUser.companyId}</p>
                  )}
                </div>
              </div>

              <Separator />

              {/* Seção de Reset de Senha */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  <h4 className="text-sm font-medium">Resetar Senha</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Defina uma senha temporária para o usuário. Ele será obrigado a alterar a senha no próximo login.
                </p>
                
                <div className="space-y-2">
                  <Label htmlFor="temporary-password">Senha Temporária</Label>
                  <Input
                    id="temporary-password"
                    type="password"
                    placeholder="Digite uma senha temporária (min. 6 caracteres)"
                    value={temporaryPassword}
                    onChange={(e) => setTemporaryPassword(e.target.value)}
                    disabled={isResetPasswordLoading}
                    data-testid="input-temporary-password"
                  />
                </div>

                <Button 
                  onClick={handleResetPassword}
                  disabled={isResetPasswordLoading || temporaryPassword.length < 6}
                  className="w-full"
                  variant="outline"
                  data-testid="button-reset-user-password"
                >
                  {isResetPasswordLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                      Resetando...
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4 mr-2" />
                      Resetar Senha
                    </>
                  )}
                </Button>
                
                <Alert>
                  <AlertDescription className="text-xs">
                    ⚠️ O usuário receberá uma senha temporária e deverá alterá-la no próximo login.
                    Esta ação não pode ser desfeita.
                  </AlertDescription>
                </Alert>
              </div>

              <Separator />

              {/* Seção de Alteração de Role (para superadmin) */}
              {user?.role === 'superadmin' && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    <h4 className="text-sm font-medium">Alterar Privilégios</h4>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-2">
                    <Button
                      variant={managingUser.role === 'employee' ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleUpdateUserRole('employee')}
                      disabled={manageUserMutation.isPending}
                      data-testid="button-set-employee"
                    >
                      Funcionário
                    </Button>
                    <Button
                      variant={managingUser.role === 'supervisor' ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleUpdateUserRole('supervisor')}
                      disabled={manageUserMutation.isPending}
                      data-testid="button-set-supervisor"
                    >
                      Supervisor
                    </Button>
                    <Button
                      variant={managingUser.role === 'admin' ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleUpdateUserRole('admin')}
                      disabled={manageUserMutation.isPending}
                      data-testid="button-set-admin"
                    >
                      Admin
                    </Button>
                    <Button
                      variant={managingUser.role === 'superadmin' ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleUpdateUserRole('superadmin')}
                      disabled={manageUserMutation.isPending}
                      data-testid="button-set-superadmin"
                    >
                      SuperAdmin
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="sm:justify-start">
            <Button 
              variant="outline" 
              onClick={() => setManagingUser(null)}
              data-testid="button-close-manage-user"
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
