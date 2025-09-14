import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  MessageSquare, 
  FileText, 
  GraduationCap, 
  Users, 
  Clock, 
  TrendingUp, 
  Bell,
  Shield, 
  Crown,
  Mail,
  Upload,
  Award,
  Calendar,
  ChevronRight
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import Sidebar from "@/components/layout/sidebar";
import TopBar from "@/components/layout/top-bar";
import logoImage from "@assets/generated_images/RHNet_company_logo_design_27776a18.png";

interface HRDashboardData {
  unreadMessages: number;
  pendingDocuments: number;
  activeCourses: number;
  completedCourses: number;
  recentMessages: Array<{
    id: number;
    subject: string;
    senderName: string;
    createdAt: string;
    isRead: boolean;
    priority: string;
  }>;
  pendingTasks: Array<{
    id: number;
    title: string;
    type: 'document' | 'course' | 'message';
    dueDate?: string;
  }>;
  courseProgress: Array<{
    id: number;
    title: string;
    progress: number;
    status: string;
  }>;
}

export default function Dashboard() {
  const { toast } = useToast();

  // Mutation to claim superadmin access
  const claimSuperadminMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/claim-superadmin", {
        method: "POST",
        credentials: "include",
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Sucesso!",
        description: data.message,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const { data: user } = useQuery<any>({
    queryKey: ["/api/auth/user"],
  });

  // Check if any superadmin exists in the system
  const { data: superadminCheck } = useQuery<{ hasSuperadmin: boolean }>({
    queryKey: ["/api/auth/has-superadmin"],
  });

  // Mock data for HR dashboard - will be replaced with real API calls
  const hrData: HRDashboardData = {
    unreadMessages: 5,
    pendingDocuments: 3,
    activeCourses: 2,
    completedCourses: 8,
    recentMessages: [
      {
        id: 1,
        subject: "Atualização de documentos necessária",
        senderName: "RH - Maria Silva",
        createdAt: "2025-01-13T10:30:00Z",
        isRead: false,
        priority: "high"
      },
      {
        id: 2,
        subject: "Novo programa de capacitação disponível",
        senderName: "RH - João Santos", 
        createdAt: "2025-01-13T09:15:00Z",
        isRead: false,
        priority: "normal"
      },
      {
        id: 3,
        subject: "Comunicado: Política de trabalho remoto",
        senderName: "RH - Ana Costa",
        createdAt: "2025-01-12T16:45:00Z",
        isRead: true,
        priority: "normal"
      }
    ],
    pendingTasks: [
      { id: 1, title: "Enviar documentação pessoal atualizada", type: "document", dueDate: "2025-01-15" },
      { id: 2, title: "Concluir programa de capacitação obrigatório", type: "course", dueDate: "2025-01-20" },
      { id: 3, title: "Responder mensagem sobre benefícios", type: "message", dueDate: "2025-01-18" }
    ],
    courseProgress: [
      { id: 1, title: "Gestão de Pessoas e Liderança", progress: 75, status: "in_progress" },
      { id: 2, title: "Comunicação Corporativa Eficaz", progress: 30, status: "in_progress" }
    ]
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'normal': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-orange-100';
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-orange-50 via-red-50 to-orange-100">
      <Sidebar />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar title="Dashboard" />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          {/* Superadmin Claim Alert - Only show if no superadmin exists in the system */}
          {user && superadminCheck && !superadminCheck.hasSuperadmin && (
            <div className="mb-6">
              <Alert className="border-amber-200 bg-amber-50">
                <Crown className="h-4 w-4 text-amber-600" />
                <AlertDescription className="flex items-center justify-between">
                  <div>
                    <span className="font-medium text-amber-800">
                      Sistema sem Super Administrador
                    </span>
                    <p className="text-amber-700 mt-1">
                      Seja o primeiro administrador do sistema e tenha controle total sobre empresas e usuários.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => claimSuperadminMutation.mutate()}
                    disabled={claimSuperadminMutation.isPending}
                    className="ml-4 border-amber-300 text-amber-700 hover:bg-amber-100"
                    data-testid="button-claim-superadmin"
                  >
                    {claimSuperadminMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-amber-600 mr-2"></div>
                        Processando...
                      </>
                    ) : (
                      <>
                        <Shield className="h-4 w-4 mr-2" />
                        Tornar-se Super Admin
                      </>
                    )}
                  </Button>
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Welcome Section with Logo Background */}
          <div className="mb-8 relative">
            <div 
              className="absolute inset-0 opacity-5 bg-no-repeat bg-center bg-contain pointer-events-none"
              style={{ backgroundImage: `url(${logoImage})` }}
            />
            <div className="relative z-10">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Bem-vindo ao RHNet
              </h1>
              <p className="text-muted-foreground text-lg mb-4">
                "A Rede do RH" - Sistema completo de gestão de recursos humanos
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">Mensageria Corporativa Integrada</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">Gestão Completa de Documentos</span>
                </div>
                <div className="flex items-center space-x-2">
                  <GraduationCap className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">Capacitação e Certificação</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-white/90 backdrop-blur-sm border-orange-200 hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Mensagens</CardTitle>
                <MessageSquare className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-800">{hrData.unreadMessages}</div>
                <p className="text-xs text-muted-foreground">Não lidas</p>
                {hrData.unreadMessages > 0 && (
                  <Badge variant="destructive" className="mt-2">
                    Requer atenção
                  </Badge>
                )}
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm border-orange-200 hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Documentos</CardTitle>
                <FileText className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-800">{hrData.pendingDocuments}</div>
                <p className="text-xs text-muted-foreground">Pendentes</p>
                {hrData.pendingDocuments > 0 && (
                  <Badge variant="outline" className="mt-2">
                    Para enviar
                  </Badge>
                )}
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm border-orange-200 hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cursos Ativos</CardTitle>
                <GraduationCap className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{hrData.activeCourses}</div>
                <p className="text-xs text-muted-foreground">Em andamento</p>
                <Badge variant="secondary" className="mt-2">
                  {hrData.completedCourses} concluídos
                </Badge>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ações Rápidas</CardTitle>
                <TrendingUp className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Nova Mensagem
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Upload className="h-4 w-4 mr-2" />
                    Enviar Documento
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Messages */}
            <Card className="bg-white/90 backdrop-blur-sm border-orange-200">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center">
                  <Mail className="h-5 w-5 mr-2 text-orange-600" />
                  Mensagens Recentes
                </CardTitle>
                <Button variant="ghost" size="sm">
                  Ver todas
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {hrData.recentMessages.map((message) => (
                  <div key={message.id} className="flex items-start space-x-4 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex-shrink-0">
                      <div className={`w-3 h-3 rounded-full mt-2 ${message.isRead ? 'bg-gray-400' : 'bg-orange-600'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={`text-sm font-medium truncate ${!message.isRead ? 'font-semibold' : ''}`}>
                          {message.subject}
                        </p>
                        <Badge 
                          variant="outline" 
                          className={`ml-2 text-xs ${getPriorityColor(message.priority)}`}
                        >
                          {message.priority === 'high' ? 'Alta' : 'Normal'}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{message.senderName}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(message.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Pending Tasks */}
            <Card className="bg-white/90 backdrop-blur-sm border-orange-200">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center">
                  <Bell className="h-5 w-5 mr-2 text-orange-600" />
                  Tarefas Pendentes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {hrData.pendingTasks.map((task) => (
                  <div key={task.id} className="flex items-center space-x-4 p-3 border rounded-lg">
                    <div className="flex-shrink-0">
                      {task.type === 'document' && <FileText className="h-5 w-5 text-orange-500" />}
                      {task.type === 'course' && <GraduationCap className="h-5 w-5 text-green-500" />}
                      {task.type === 'message' && <MessageSquare className="h-5 w-5 text-blue-500" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{task.title}</p>
                      {task.dueDate && (
                        <p className="text-xs text-muted-foreground">
                          Prazo: {new Date(task.dueDate).toLocaleDateString('pt-BR')}
                        </p>
                      )}
                    </div>
                    <Button variant="outline" size="sm">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Course Progress */}
          {hrData.courseProgress.length > 0 && (
            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="h-5 w-5 mr-2" />
                  Progresso de Capacitação
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {hrData.courseProgress.map((course) => (
                  <div key={course.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{course.title}</span>
                      <span className="text-sm text-muted-foreground">{course.progress}%</span>
                    </div>
                    <Progress value={course.progress} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}