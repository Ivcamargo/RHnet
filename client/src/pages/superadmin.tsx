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
  Building2, 
  Users, 
  UserPlus, 
  Edit, 
  Shield, 
  Plus,
  Settings
} from "lucide-react";
import Sidebar from "@/components/layout/sidebar";
import TopBar from "@/components/layout/top-bar";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

// Schema for company form validation
const companyFormSchema = z.object({
  name: z.string().min(1, "Nome da empresa é obrigatório"),
  cnpj: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
});

type CompanyFormData = z.infer<typeof companyFormSchema>;

interface Company {
  id: number;
  name: string;
  cnpj?: string;
  address?: string;
  phone?: string;
  email?: string;
  isActive: boolean;
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
  createdAt: string;
  updatedAt: string;
}

export default function SuperAdmin() {
  const [isCreateCompanyDialogOpen, setIsCreateCompanyDialogOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const { toast } = useToast();

  const companyForm = useForm<CompanyFormData>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: {
      name: "",
      cnpj: "",
      address: "",
      phone: "",
      email: "",
    },
  });

  // Fetch companies
  const { data: companies = [], isLoading: companiesLoading } = useQuery<Company[]>({
    queryKey: ["/api/superadmin/companies"],
  });

  // Fetch all users
  const { data: users = [], isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/superadmin/users"],
  });

  // Create company mutation
  const createCompanyMutation = useMutation({
    mutationFn: (data: CompanyFormData) => {
      return fetch("/api/superadmin/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      }).then(res => res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/superadmin/companies"] });
      setIsCreateCompanyDialogOpen(false);
      companyForm.reset();
      toast({
        title: "Empresa criada",
        description: "A empresa foi criada com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar empresa",
        description: error.message || "Ocorreu um erro ao criar a empresa.",
        variant: "destructive",
      });
    },
  });

  // Update company mutation
  const updateCompanyMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CompanyFormData> }) => {
      return fetch(`/api/superadmin/companies/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      }).then(res => res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/superadmin/companies"] });
      setEditingCompany(null);
      companyForm.reset();
      toast({
        title: "Empresa atualizada",
        description: "A empresa foi atualizada com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar empresa",
        description: error.message || "Ocorreu um erro ao atualizar a empresa.",
        variant: "destructive",
      });
    },
  });

  // Update user role mutation
  const updateUserRoleMutation = useMutation({
    mutationFn: ({ userId, role, companyId }: { userId: string; role: string; companyId?: number }) => {
      return fetch(`/api/superadmin/users/${userId}/role`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ role, companyId }),
      }).then(res => res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/superadmin/users"] });
      setEditingUser(null);
      toast({
        title: "Usuário atualizado",
        description: "O papel do usuário foi atualizado com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar usuário",
        description: error.message || "Ocorreu um erro ao atualizar o usuário.",
        variant: "destructive",
      });
    },
  });

  const onSubmitCompany = (data: CompanyFormData) => {
    if (editingCompany) {
      updateCompanyMutation.mutate({ id: editingCompany.id, data });
    } else {
      createCompanyMutation.mutate(data);
    }
  };

  const handleEditCompany = (company: Company) => {
    setEditingCompany(company);
    companyForm.reset({
      name: company.name,
      cnpj: company.cnpj || "",
      address: company.address || "",
      phone: company.phone || "",
      email: company.email || "",
    });
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
  };

  const handleUpdateUserRole = (role: string, companyId?: number) => {
    if (editingUser) {
      updateUserRoleMutation.mutate({ 
        userId: editingUser.id, 
        role, 
        companyId 
      });
    }
  };

  const getCompanyName = (companyId?: number) => {
    if (!companyId) return "-";
    const company = companies.find(c => c.id === companyId);
    return company?.name || `Empresa ${companyId}`;
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "superadmin":
        return <Badge variant="destructive">Super Admin</Badge>;
      case "admin":
        return <Badge variant="default">Administrador</Badge>;
      case "employee":
        return <Badge variant="secondary">Funcionário</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-orange-100">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        <TopBar title="Gerenciamento do Sistema" />
        
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center" data-testid="page-title">
                <Shield className="h-8 w-8 mr-3 text-orange-600" />
                Gerenciamento do Sistema
              </h1>
              <p className="text-gray-600 mt-1">
                Gerencie empresas, administradores e usuários do sistema
              </p>
            </div>

            <Tabs defaultValue="companies" className="space-y-6">
              <TabsList>
                <TabsTrigger value="companies" className="flex items-center">
                  <Building2 className="h-4 w-4 mr-2" />
                  Empresas
                </TabsTrigger>
                <TabsTrigger value="users" className="flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  Usuários
                </TabsTrigger>
              </TabsList>

              {/* Companies Tab */}
              <TabsContent value="companies" className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Empresas Cadastradas</h2>
                  
                  <Dialog 
                    open={isCreateCompanyDialogOpen || !!editingCompany} 
                    onOpenChange={(open) => {
                      if (!open) {
                        setIsCreateCompanyDialogOpen(false);
                        setEditingCompany(null);
                        companyForm.reset();
                      }
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button 
                        onClick={() => setIsCreateCompanyDialogOpen(true)}
                        data-testid="button-create-company"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Nova Empresa
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                      <DialogHeader>
                        <DialogTitle data-testid="dialog-company-title">
                          {editingCompany ? "Editar Empresa" : "Nova Empresa"}
                        </DialogTitle>
                      </DialogHeader>
                      
                      <Form {...companyForm}>
                        <form onSubmit={companyForm.handleSubmit(onSubmitCompany)} className="space-y-4">
                          <FormField
                            control={companyForm.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nome da Empresa</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="Ex: Tech Solutions Ltda"
                                    data-testid="input-company-name"
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={companyForm.control}
                            name="cnpj"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>CNPJ (Opcional)</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="00.000.000/0000-00"
                                    data-testid="input-company-cnpj"
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={companyForm.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email (Opcional)</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="email"
                                    placeholder="contato@empresa.com"
                                    data-testid="input-company-email"
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={companyForm.control}
                            name="phone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Telefone (Opcional)</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="(11) 9999-9999"
                                    data-testid="input-company-phone"
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={companyForm.control}
                            name="address"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Endereço (Opcional)</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="Endereço completo da empresa"
                                    data-testid="textarea-company-address"
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
                                setIsCreateCompanyDialogOpen(false);
                                setEditingCompany(null);
                                companyForm.reset();
                              }}
                              data-testid="button-cancel-company"
                            >
                              Cancelar
                            </Button>
                            <Button 
                              type="submit"
                              disabled={createCompanyMutation.isPending || updateCompanyMutation.isPending}
                              data-testid="button-save-company"
                            >
                              {createCompanyMutation.isPending || updateCompanyMutation.isPending
                                ? "Salvando..." 
                                : editingCompany ? "Atualizar" : "Criar"
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
                    {companiesLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    ) : companies.length === 0 ? (
                      <div className="text-center py-8 text-gray-500" data-testid="empty-companies">
                        <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>Nenhuma empresa cadastrada</p>
                        <p className="text-sm">Clique em "Nova Empresa" para começar</p>
                      </div>
                    ) : (
                      <Table data-testid="companies-table">
                        <TableHeader>
                          <TableRow>
                            <TableHead>Nome</TableHead>
                            <TableHead>CNPJ</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Telefone</TableHead>
                            <TableHead>Data de Criação</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {companies.map((company) => (
                            <TableRow key={company.id} data-testid={`company-row-${company.id}`}>
                              <TableCell className="font-medium" data-testid={`company-name-${company.id}`}>
                                {company.name}
                              </TableCell>
                              <TableCell data-testid={`company-cnpj-${company.id}`}>
                                {company.cnpj || <span className="text-gray-400">-</span>}
                              </TableCell>
                              <TableCell data-testid={`company-email-${company.id}`}>
                                {company.email || <span className="text-gray-400">-</span>}
                              </TableCell>
                              <TableCell data-testid={`company-phone-${company.id}`}>
                                {company.phone || <span className="text-gray-400">-</span>}
                              </TableCell>
                              <TableCell data-testid={`company-created-${company.id}`}>
                                {formatDate(company.createdAt)}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditCompany(company)}
                                  data-testid={`button-edit-company-${company.id}`}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Users Tab */}
              <TabsContent value="users" className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Usuários do Sistema</h2>
                </div>

                <Card>
                  <CardContent className="p-0">
                    {usersLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    ) : users.length === 0 ? (
                      <div className="text-center py-8 text-gray-500" data-testid="empty-users">
                        <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>Nenhum usuário encontrado</p>
                      </div>
                    ) : (
                      <Table data-testid="users-table">
                        <TableHeader>
                          <TableRow>
                            <TableHead>Nome</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Papel</TableHead>
                            <TableHead>Empresa</TableHead>
                            <TableHead>Data de Cadastro</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {users.map((user) => (
                            <TableRow key={user.id} data-testid={`user-row-${user.id}`}>
                              <TableCell className="font-medium" data-testid={`user-name-${user.id}`}>
                                {user.firstName} {user.lastName}
                              </TableCell>
                              <TableCell data-testid={`user-email-${user.id}`}>
                                {user.email}
                              </TableCell>
                              <TableCell data-testid={`user-role-${user.id}`}>
                                {getRoleBadge(user.role)}
                              </TableCell>
                              <TableCell data-testid={`user-company-${user.id}`}>
                                {getCompanyName(user.companyId)}
                              </TableCell>
                              <TableCell data-testid={`user-created-${user.id}`}>
                                {formatDate(user.createdAt)}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditUser(user)}
                                  data-testid={`button-edit-user-${user.id}`}
                                >
                                  <Settings className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>

                {/* User Edit Dialog */}
                <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Editar Usuário</DialogTitle>
                    </DialogHeader>
                    
                    {editingUser && (
                      <div className="space-y-4">
                        <div>
                          <Label>Usuário</Label>
                          <p className="text-sm text-gray-600">
                            {editingUser.firstName} {editingUser.lastName} ({editingUser.email})
                          </p>
                        </div>
                        
                        <div>
                          <Label>Papel Atual</Label>
                          <div className="mt-1">
                            {getRoleBadge(editingUser.role)}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            variant={editingUser.role === 'employee' ? 'default' : 'outline'}
                            onClick={() => {
                              const companyId = editingUser.companyId || companies[0]?.id;
                              handleUpdateUserRole('employee', companyId);
                            }}
                            disabled={!companies.length}
                            data-testid="button-set-employee"
                          >
                            Funcionário
                          </Button>
                          <Button
                            variant={editingUser.role === 'admin' ? 'default' : 'outline'}
                            onClick={() => {
                              const companyId = editingUser.companyId || companies[0]?.id;
                              handleUpdateUserRole('admin', companyId);
                            }}
                            disabled={!companies.length}
                            data-testid="button-set-admin"
                          >
                            Admin
                          </Button>
                        </div>

                        <Button
                          variant={editingUser.role === 'superadmin' ? 'destructive' : 'outline'}
                          onClick={() => handleUpdateUserRole('superadmin')}
                          className="w-full"
                          data-testid="button-set-superadmin"
                        >
                          Super Administrador
                        </Button>

                        {editingUser.role !== 'superadmin' && (
                          <div>
                            <Label>Empresa</Label>
                            <Select
                              value={editingUser.companyId?.toString() || ""}
                              onValueChange={(value) => {
                                const companyId = parseInt(value);
                                handleUpdateUserRole(editingUser.role, companyId);
                              }}
                            >
                              <SelectTrigger data-testid="select-user-company">
                                <SelectValue placeholder="Selecione uma empresa" />
                              </SelectTrigger>
                              <SelectContent>
                                {companies.map((company) => (
                                  <SelectItem key={company.id} value={company.id.toString()}>
                                    {company.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>
                    )}
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