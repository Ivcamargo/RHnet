import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Users, Mail, Building, Shield, Settings, UserCheck, Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Sidebar from "@/components/layout/sidebar";
import TopBar from "@/components/layout/top-bar";

// Schema for adding new employee
const addEmployeeSchema = z.object({
  email: z.string().email("Email inválido"),
  firstName: z.string().min(1, "Nome é obrigatório"),
  lastName: z.string().min(1, "Sobrenome é obrigatório"),
  role: z.enum(["employee", "admin"]).default("employee"),
  departmentId: z.string().optional(),
});

type AddEmployeeForm = z.infer<typeof addEmployeeSchema>;

export default function Employees() {
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
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

  // Form for adding employees
  const addForm = useForm<AddEmployeeForm>({
    resolver: zodResolver(addEmployeeSchema),
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      role: "employee",
      departmentId: "",
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ userId, data }: { userId: string; data: any }) => {
      await apiRequest("PUT", `/api/admin/users/${userId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setIsEditDialogOpen(false);
      setSelectedEmployee(null);
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

  const addEmployeeMutation = useMutation({
    mutationFn: async (data: AddEmployeeForm) => {
      await apiRequest("POST", "/api/admin/employees", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setIsAddDialogOpen(false);
      addForm.reset();
      toast({
        title: "Sucesso",
        description: "Funcionário adicionado com sucesso",
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

  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';

  const handleEditUser = (employee: any) => {
    setSelectedEmployee(employee);
    setIsEditDialogOpen(true);
  };

  const handleUpdateUser = (formData: any) => {
    if (!selectedEmployee) return;
    
    updateUserMutation.mutate({
      userId: selectedEmployee.id,
      data: formData,
    });
  };

  const onSubmitAddEmployee = (data: AddEmployeeForm) => {
    addEmployeeMutation.mutate(data);
  };

  if (!isAdmin) {
    // Show only current user profile for non-admin users
    return (
      <div className="flex h-screen overflow-hidden bg-gradient-to-br from-orange-50 via-red-50 to-blue-50">
        <Sidebar />
        
        <div className="flex flex-col flex-1 overflow-hidden">
          <TopBar title="Meu Perfil" />
          
          <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-orange-800">Meu Perfil</h1>
              <p className="text-gray-600">Informações do seu perfil e departamento</p>
            </div>

            {user ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Card */}
                <Card className="material-shadow lg:col-span-1">
                  <CardHeader className="text-center">
                    <Avatar className="w-24 h-24 mx-auto mb-4">
                      <AvatarImage src={user.profileImageUrl} alt={`${user.firstName} ${user.lastName}`} />
                      <AvatarFallback className="text-2xl">
                        {user.firstName?.[0]}{user.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <CardTitle className="text-xl">
                      {user.firstName} {user.lastName}
                    </CardTitle>
                    <div className="flex justify-center">
                      <Badge variant="secondary">Funcionário</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{user.email}</span>
                    </div>
                    
                    {user.department && (
                      <div className="flex items-center space-x-3">
                        <Building className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{user.department.name}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-3">
                      <Shield className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {user.isActive ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* Department Info */}
                <Card className="material-shadow lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Informações do Departamento</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {user.department ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Departamento</h4>
                            <p className="text-gray-600">{user.department.name}</p>
                          </div>
                          
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Horário de Trabalho</h4>
                            <p className="text-gray-600">
                              {user.department.shiftStart} - {user.department.shiftEnd}
                            </p>
                          </div>
                          
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Localização</h4>
                            <p className="text-gray-600 text-sm">
                              Lat: {user.department.latitude.toFixed(4)}, 
                              Lng: {user.department.longitude.toFixed(4)}
                            </p>
                          </div>
                          
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Raio da Cerca Virtual</h4>
                            <p className="text-gray-600">{user.department.radius} metros</p>
                          </div>
                        </div>
                        
                        {user.department.description && (
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Descrição</h4>
                            <p className="text-gray-600">{user.department.description}</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">Nenhum departamento atribuído</p>
                        <p className="text-sm text-gray-400 mt-2">
                          Entre em contato com o administrador para ser atribuído a um departamento
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Carregando informações...</h3>
              </div>
            )}
          </main>
        </div>
      </div>
    );
  }

  // Admin view with user management
  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-orange-50 via-red-50 to-blue-50">
      <Sidebar />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar title="Gestão de Funcionários" />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gestão de Funcionários</h1>
              <p className="text-gray-600">Visualize e gerencie os funcionários da empresa</p>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="point-primary" data-testid="button-add-employee">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Funcionário
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Adicionar Novo Funcionário</DialogTitle>
                </DialogHeader>
                <Form {...addForm}>
                  <form onSubmit={addForm.handleSubmit(onSubmitAddEmployee)} className="space-y-4">
                    <FormField
                      control={addForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input 
                              type="email"
                              placeholder="funcionario@empresa.com"
                              data-testid="input-employee-email" 
                              data-testid="input-employee-email"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={addForm.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="João" 
                                data-testid="input-employee-first-name"
                                {...field} 
                              />
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
                            <FormLabel>Sobrenome</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Silva" 
                                data-testid="input-employee-last-name"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={addForm.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Função</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-employee-role">
                                <SelectValue placeholder="Selecione a função" />
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
                    
                    <FormField
                      control={addForm.control}
                      name="departmentId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Departamento (Opcional)</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-employee-department">
                                <SelectValue placeholder="Selecione o departamento" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="none">Nenhum departamento</SelectItem>
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
                    
                    <div className="flex gap-2 pt-4">
                      <Button 
                        type="submit" 
                        disabled={addEmployeeMutation.isPending} 
                        className="point-primary"
                        data-testid="button-submit-employee"
                      >
                        {addEmployeeMutation.isPending ? "Adicionando..." : "Adicionar"}
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

          {usersLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="material-shadow">
                  <CardContent className="p-6">
                    <div className="animate-pulse">
                      <div className="w-16 h-16 bg-orange-200 rounded-full mx-auto mb-4"></div>
                      <div className="h-4 bg-orange-200 rounded w-3/4 mx-auto mb-2"></div>
                      <div className="h-3 bg-orange-200 rounded w-1/2 mx-auto mb-4"></div>
                      <div className="h-3 bg-orange-200 rounded w-full mb-2"></div>
                      <div className="h-3 bg-orange-200 rounded w-2/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : allUsers?.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum funcionário encontrado</h3>
              <p className="text-gray-500">Aguarde o primeiro login de funcionários no sistema.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allUsers?.map((employee: any) => (
                <Card key={employee.id} className="material-shadow hover:shadow-lg transition-shadow">
                  <CardHeader className="text-center">
                    <Avatar className="w-16 h-16 mx-auto mb-3">
                      <AvatarImage src={employee.profileImageUrl} alt={`${employee.firstName} ${employee.lastName}`} />
                      <AvatarFallback className="text-lg">
                        {employee.firstName?.[0]}{employee.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <CardTitle className="text-lg">
                      {employee.firstName} {employee.lastName}
                    </CardTitle>
                    <div className="flex justify-center space-x-2">
                      <Badge variant={employee.role === 'admin' ? 'default' : 'secondary'}>
                        {employee.role === 'admin' ? 'Admin' : 'Funcionário'}
                      </Badge>
                      <Badge variant={employee.isActive ? 'outline' : 'destructive'}>
                        {employee.isActive ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Mail className="h-4 w-4" />
                      <span className="truncate">{employee.email}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Building className="h-4 w-4" />
                      <span>{employee.department?.name || 'Sem departamento'}</span>
                    </div>
                    
                    <div className="pt-3 border-t">
                      <Button
                        onClick={() => handleEditUser(employee)}
                        size="sm"
                        className="w-full point-primary"
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Gerenciar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Edit User Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>
                  Gerenciar Funcionário - {selectedEmployee?.firstName} {selectedEmployee?.lastName}
                </DialogTitle>
              </DialogHeader>
              
              {selectedEmployee && (
                <EditUserForm
                  employee={selectedEmployee}
                  departments={departments || []}
                  onSave={handleUpdateUser}
                  onCancel={() => setIsEditDialogOpen(false)}
                  isLoading={updateUserMutation.isPending}
                />
              )}
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  );
}

interface EditUserFormProps {
  employee: any;
  departments: any[];
  onSave: (data: any) => void;
  onCancel: () => void;
  isLoading: boolean;
}

function EditUserForm({ employee, departments, onSave, onCancel, isLoading }: EditUserFormProps) {
  const [role, setRole] = useState(employee.role);
  const [departmentId, setDepartmentId] = useState(employee.departmentId?.toString() || 'none');
  const [isActive, setIsActive] = useState(employee.isActive);

  const handleSave = () => {
    const data: any = {
      role,
      isActive,
    };
    
    if (departmentId && departmentId !== 'none') {
      data.departmentId = parseInt(departmentId);
    } else {
      data.departmentId = null;
    }

    onSave(data);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label>Função</Label>
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione a função" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="employee">Funcionário</SelectItem>
              <SelectItem value="admin">Administrador</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Departamento</Label>
          <Select value={departmentId} onValueChange={setDepartmentId}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o departamento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Nenhum departamento</SelectItem>
              {departments.map((dept: any) => (
                <SelectItem key={dept.id} value={dept.id.toString()}>
                  {dept.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="active-status"
            checked={isActive}
            onCheckedChange={setIsActive}
          />
          <Label htmlFor="active-status">
            Usuário ativo
          </Label>
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          onClick={handleSave}
          disabled={isLoading}
          className="flex-1 point-primary"
        >
          <UserCheck className="h-4 w-4 mr-2" />
          {isLoading ? "Salvando..." : "Salvar"}
        </Button>
        <Button
          onClick={onCancel}
          variant="outline"
          className="flex-1"
        >
          Cancelar
        </Button>
      </div>
    </div>
  );
}
