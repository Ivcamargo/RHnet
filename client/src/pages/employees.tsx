import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Users, Mail, Building, Shield, Settings, UserCheck, Plus, Trash2, Search, FileText, MapPin, Phone, Briefcase, CreditCard, GraduationCap, Heart, Edit } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertCompleteEmployeeSchema, type InsertCompleteEmployee } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Sidebar from "@/components/layout/sidebar";
import TopBar from "@/components/layout/top-bar";

export default function Employees() {
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showInactive, setShowInactive] = useState(false);
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

  // Form for editing employee
  const editForm = useForm<InsertCompleteEmployee>({
    resolver: zodResolver(insertCompleteEmployeeSchema),
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
      maritalStatus: "solteiro",
      gender: "prefiro_nao_informar",
      nationality: "Brasileira",
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
      role: "employee",
      departmentId: "",
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
      maritalStatus: "solteiro",
      gender: "prefiro_nao_informar",
      nationality: "Brasileira",
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
      role: "employee",
      departmentId: "",
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
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
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
      await apiRequest("/api/admin/users", { method: "POST", body: JSON.stringify(data) });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setIsAddDialogOpen(false);
      addForm.reset();
      toast({
        title: "Sucesso",
        description: "Funcionário cadastrado com sucesso",
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

  const deleteEmployeeMutation = useMutation({
    mutationFn: async (userId: string) => {
      await apiRequest(`/api/admin/users/${userId}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "Sucesso",
        description: "Funcionário desativado permanentemente",
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

  const handleDeleteEmployee = (employee: any) => {
    if (window.confirm(`Tem certeza que deseja desativar permanentemente o funcionário ${employee.firstName} ${employee.lastName}? Esta ação não pode ser desfeita.`)) {
      deleteEmployeeMutation.mutate(employee.id);
    }
  };

  const onSubmitNewEmployee = (data: InsertCompleteEmployee) => {
    addEmployeeMutation.mutate(data);
  };

  const onSubmitEditEmployee = (data: InsertCompleteEmployee) => {
    editEmployeeMutation.mutate(data);
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
      role: employee.role || "employee",
      departmentId: employee.departmentId?.toString() || "",
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

  // Filter users based on search term and active/inactive status
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
  });

  // Debug: Log filter status
  console.log('Filter debug:', { 
    totalUsers: allUsers?.length, 
    filteredUsers: filteredUsers?.length, 
    showInactive,
    inactiveCount: allUsers?.filter(u => !u.isActive).length 
  });

  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';

  if (!isAdmin) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <TopBar title="Funcionários" />
          <main className="flex-1 overflow-auto p-6">
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Acesso Restrito</h1>
                <p className="text-gray-600">Apenas administradores podem acessar esta página.</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
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
            
            {/* Add Employee Button on the right */}
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
                  <form onSubmit={addForm.handleSubmit(onSubmitNewEmployee)} className="space-y-6">
                    <Tabs defaultValue="pessoais" className="w-full">
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
                        <TabsTrigger value="bancarios" className="flex items-center gap-1">
                          <CreditCard className="h-4 w-4" />
                          Bancários
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
                            name="maritalStatus"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Estado Civil *</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger data-testid="select-marital-status">
                                      <SelectValue />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="solteiro">Solteiro(a)</SelectItem>
                                    <SelectItem value="casado">Casado(a)</SelectItem>
                                    <SelectItem value="divorciado">Divorciado(a)</SelectItem>
                                    <SelectItem value="viuvo">Viúvo(a)</SelectItem>
                                    <SelectItem value="uniao_estavel">União Estável</SelectItem>
                                  </SelectContent>
                                </Select>
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

                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={addForm.control}
                            name="nationality"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nacionalidade</FormLabel>
                                <FormControl>
                                  <Input {...field} data-testid="input-nationality" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={addForm.control}
                            name="naturalness"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Naturalidade</FormLabel>
                                <FormControl>
                                  <Input placeholder="Cidade de nascimento" {...field} data-testid="input-naturalness" />
                                </FormControl>
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
                            name="rg"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>RG</FormLabel>
                                <FormControl>
                                  <Input placeholder="00.000.000-0" {...field} data-testid="input-rg" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={addForm.control}
                            name="rgIssuingOrgan"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Órgão Emissor RG</FormLabel>
                                <FormControl>
                                  <Input placeholder="SSP-SP" {...field} data-testid="input-rg-organ" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

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

                        <FormField
                          control={addForm.control}
                          name="tituloEleitor"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Título de Eleitor</FormLabel>
                              <FormControl>
                                <Input placeholder="0000 0000 0000" {...field} data-testid="input-titulo" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
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
                                  <Input placeholder="(11) 99999-9999" {...field} data-testid="input-personal-phone" />
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
                                  <Input placeholder="(11) 3333-3333" {...field} data-testid="input-commercial-phone" />
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
                                  <Input placeholder="(11) 88888-8888" {...field} data-testid="input-emergency-phone" />
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
                          name="departmentId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Departamento</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value?.toString()}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-department-create">
                                    <SelectValue placeholder="Selecione um departamento" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
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

                      {/* Dados Bancários */}
                      <TabsContent value="bancarios" className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={addForm.control}
                            name="bankCode"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Código do Banco *</FormLabel>
                                <FormControl>
                                  <Input placeholder="341" maxLength={3} {...field} data-testid="input-bank-code" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={addForm.control}
                            name="bankName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nome do Banco *</FormLabel>
                                <FormControl>
                                  <Input placeholder="Banco Itaú" {...field} data-testid="input-bank-name" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <FormField
                            control={addForm.control}
                            name="agencyNumber"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Agência *</FormLabel>
                                <FormControl>
                                  <Input placeholder="1234" {...field} data-testid="input-agency" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={addForm.control}
                            name="accountNumber"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Número da Conta *</FormLabel>
                                <FormControl>
                                  <Input placeholder="12345-6" {...field} data-testid="input-account-number" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={addForm.control}
                            name="accountType"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Tipo de Conta *</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger data-testid="select-account-type">
                                      <SelectValue />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="corrente">Conta Corrente</SelectItem>
                                    <SelectItem value="poupanca">Conta Poupança</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={addForm.control}
                          name="pixKey"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Chave PIX</FormLabel>
                              <FormControl>
                                <Input placeholder="joao.silva@email.com ou CPF ou telefone" {...field} data-testid="input-pix-key" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
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

            {/* Edit Employee Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Editar Funcionário</DialogTitle>
                </DialogHeader>
                <Form {...editForm}>
                  <form onSubmit={editForm.handleSubmit(onSubmitEditEmployee)} className="space-y-6">
                    <Tabs defaultValue="pessoais" className="w-full">
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
                        <TabsTrigger value="bancarios" className="flex items-center gap-1">
                          <CreditCard className="h-4 w-4" />
                          Bancários
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
                                  <Input placeholder="(11) 99999-9999" {...field} data-testid="input-personal-phone-edit" />
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
                          <FormField
                            control={editForm.control}
                            name="maritalStatus"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Estado Civil</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger data-testid="select-marital-status-edit">
                                      <SelectValue />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="solteiro">Solteiro(a)</SelectItem>
                                    <SelectItem value="casado">Casado(a)</SelectItem>
                                    <SelectItem value="divorciado">Divorciado(a)</SelectItem>
                                    <SelectItem value="viuvo">Viúvo(a)</SelectItem>
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
                          <FormField
                            control={editForm.control}
                            name="nationality"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nacionalidade</FormLabel>
                                <FormControl>
                                  <Input placeholder="Brasileira" {...field} data-testid="input-nationality-edit" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={editForm.control}
                            name="naturalness"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Naturalidade</FormLabel>
                                <FormControl>
                                  <Input placeholder="São Paulo - SP" {...field} data-testid="input-naturalness-edit" />
                                </FormControl>
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
                          <FormField
                            control={editForm.control}
                            name="rg"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>RG</FormLabel>
                                <FormControl>
                                  <Input placeholder="00.000.000-0" {...field} data-testid="input-rg-edit" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <FormField
                            control={editForm.control}
                            name="rgIssuingOrgan"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Órgão Emissor RG</FormLabel>
                                <FormControl>
                                  <Input placeholder="SSP-SP" {...field} data-testid="input-rg-organ-edit" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
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

                        <FormField
                          control={editForm.control}
                          name="tituloEleitor"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Título de Eleitor</FormLabel>
                              <FormControl>
                                <Input placeholder="0000.0000.0000" {...field} data-testid="input-titulo-edit" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
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
                                <Input placeholder="(11) 3000-0000" {...field} data-testid="input-commercial-phone-edit" />
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
                                  <Input placeholder="(11) 99999-8888" {...field} data-testid="input-emergency-phone-edit" />
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
                            name="departmentId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Departamento</FormLabel>
                                <Select 
                                  onValueChange={(value) => {
                                    field.onChange(value === "none" ? "" : value);
                                  }} 
                                  value={field.value?.toString() || ""}
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

                      {/* Dados Bancários */}
                      <TabsContent value="bancarios" className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={editForm.control}
                            name="bankCode"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Código do Banco</FormLabel>
                                <FormControl>
                                  <Input placeholder="001" {...field} data-testid="input-bank-code-edit" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={editForm.control}
                            name="bankName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nome do Banco</FormLabel>
                                <FormControl>
                                  <Input placeholder="Banco do Brasil" {...field} data-testid="input-bank-name-edit" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <FormField
                            control={editForm.control}
                            name="agencyNumber"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Número da Agência</FormLabel>
                                <FormControl>
                                  <Input placeholder="1234-5" {...field} data-testid="input-agency-edit" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={editForm.control}
                            name="accountNumber"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Número da Conta</FormLabel>
                                <FormControl>
                                  <Input placeholder="12345-6" {...field} data-testid="input-account-edit" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={editForm.control}
                            name="accountType"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Tipo de Conta</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger data-testid="select-account-type-edit">
                                      <SelectValue />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="corrente">Corrente</SelectItem>
                                    <SelectItem value="poupanca">Poupança</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={editForm.control}
                          name="pixKey"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Chave PIX</FormLabel>
                              <FormControl>
                                <Input placeholder="joao.silva@email.com ou CPF ou telefone" {...field} data-testid="input-pix-key-edit" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
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

          {/* Employee Cards */}
          {usersLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="material-shadow">
                  <CardContent className="p-6">
                    <div className="animate-pulse">
                      <div className="w-12 h-12 bg-gray-200 rounded-full mb-4"></div>
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded mb-4"></div>
                      <div className="space-y-2">
                        <div className="h-3 bg-gray-200 rounded"></div>
                        <div className="h-3 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredUsers && filteredUsers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredUsers.map((employee: any) => (
                <Card key={employee.id} className="material-shadow hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={employee.profileImageUrl} />
                        <AvatarFallback className="bg-blue-100 text-blue-600">
                          {employee.firstName?.[0]}{employee.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <CardTitle className="text-lg">
                          {employee.firstName} {employee.lastName}
                        </CardTitle>
                        <p className="text-sm text-gray-500">{employee.position || employee.email}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={employee.isActive ? "default" : "secondary"}>
                          {employee.isActive ? "Ativo" : "Inativo"}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditEmployee(employee)}
                          className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                          data-testid={`button-edit-employee-${employee.id}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteEmployee(employee)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          data-testid={`button-delete-employee-${employee.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{employee.email}</span>
                      </div>
                      
                      {employee.cpf && (
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">CPF: {employee.cpf}</span>
                        </div>
                      )}

                      {employee.personalPhone && (
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{employee.personalPhone}</span>
                        </div>
                      )}

                      {departments?.find((d: any) => d.id === employee.departmentId) && (
                        <div className="flex items-center space-x-2">
                          <Building className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">
                            {departments.find((d: any) => d.id === employee.departmentId)?.name}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center space-x-2">
                        <Shield className="h-4 w-4 text-gray-400" />
                        <Select
                          value={employee.role}
                          onValueChange={(value) => handleRoleChange(employee, value)}
                          disabled={updateUserMutation.isPending}
                        >
                          <SelectTrigger className="w-32 h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="employee">Funcionário</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Building className="h-4 w-4 text-gray-400" />
                        <Select
                          value={employee.departmentId?.toString() || ""}
                          onValueChange={(value) => handleDepartmentChange(employee, value)}
                          disabled={updateUserMutation.isPending}
                        >
                          <SelectTrigger className="w-full h-8 text-xs">
                            <SelectValue placeholder="Sem departamento" />
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
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center space-x-2">
                          <UserCheck className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">Ativo</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleEmployeeStatus(employee)}
                          disabled={updateUserMutation.isPending}
                          className={employee.isActive ? "text-red-600" : "text-green-600"}
                          data-testid={`button-toggle-employee-${employee.id}`}
                        >
                          {employee.isActive ? "Desativar" : "Ativar"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
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
    </div>
  );
}