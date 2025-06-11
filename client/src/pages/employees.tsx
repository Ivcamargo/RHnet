import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, Mail, Building, Shield } from "lucide-react";
import Sidebar from "@/components/layout/sidebar";
import TopBar from "@/components/layout/top-bar";

export default function Employees() {
  const { data: user } = useQuery({
    queryKey: ["/api/auth/user"],
  });

  // For now, we'll show just the current user's profile
  // In a full implementation, this would show all employees for admins
  const isAdmin = user?.role === 'admin';

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      <Sidebar />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar title="Funcionários" />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              {isAdmin ? "Gestão de Funcionários" : "Meu Perfil"}
            </h1>
            <p className="text-gray-600">
              {isAdmin 
                ? "Visualize e gerencie os funcionários da empresa" 
                : "Informações do seu perfil e departamento"
              }
            </p>
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
                    <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                      {user.role === 'admin' ? 'Administrador' : 'Funcionário'}
                    </Badge>
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

          {/* Additional Info for Admins */}
          {isAdmin && (
            <Card className="material-shadow mt-6">
              <CardHeader>
                <CardTitle>Funcionalidades Administrativas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">Recursos Disponíveis</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Criação e gestão de departamentos</li>
                    <li>• Visualização de relatórios globais</li>
                    <li>• Configuração de cercas virtuais</li>
                    <li>• Gestão de turnos e horários</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}
