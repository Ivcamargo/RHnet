import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  MessageSquare, 
  FileText, 
  GraduationCap, 
  UsersRound, 
  Clock, 
  TrendingUp, 
  BellRing,
  ShieldCheck, 
  Sparkles,
  MailOpen,
  UploadCloud,
  Award,
  CalendarDays,
  ChevronRight
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";
import Sidebar from "@/components/layout/sidebar";
import TopBar from "@/components/layout/top-bar";

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
    id: string;
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
  const [, setLocation] = useLocation();
  const [showMessagesPopup, setShowMessagesPopup] = useState(false);
  const [popupShownInSession, setPopupShownInSession] = useState(() => {
    return sessionStorage.getItem('messagesPopupShown') === 'true';
  });

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

  // Real data queries for HR dashboard
  const { data: dashboardSummary, isLoading: summaryLoading } = useQuery({
    queryKey: ["/api/dashboard/summary"],
  });

  const { data: recentMessages, isLoading: messagesLoading } = useQuery({
    queryKey: ["/api/dashboard/messages/recent"],
  });

  const { data: pendingTasks, isLoading: tasksLoading } = useQuery({
    queryKey: ["/api/dashboard/tasks/pending"],
  });

  const { data: employeeCourses } = useQuery({
    queryKey: [`/api/employee-courses`],
  });

  // Combine real data with fallbacks
  const hrData: HRDashboardData = {
    unreadMessages: dashboardSummary?.unreadMessages || 0,
    pendingDocuments: dashboardSummary?.pendingDocuments || 0,
    activeCourses: dashboardSummary?.activeCourses || 0,
    completedCourses: dashboardSummary?.completedCourses || 0,
    recentMessages: recentMessages || [],
    pendingTasks: pendingTasks || [],
    courseProgress: employeeCourses?.filter((course: any) => course.status === 'in_progress').map((course: any) => ({
      id: course.id,
      title: course.courseTitle,
      progress: course.progress || 0,
      status: course.status
    })) || []
  };

  const isLoading = summaryLoading || messagesLoading || tasksLoading;

  // Auto-show popup when there are unread messages (once per session)
  useEffect(() => {
    if (hrData.unreadMessages > 0 && !popupShownInSession && !isLoading) {
      setShowMessagesPopup(true);
    }
  }, [hrData.unreadMessages, popupShownInSession, isLoading]);

  const handleClosePopup = () => {
    setShowMessagesPopup(false);
    setPopupShownInSession(true);
    sessionStorage.setItem('messagesPopupShown', 'true');
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
      case 'high': return 'text-[hsl(0,72%,51%)] bg-[hsl(0,72%,95%)]';
      case 'normal': return 'text-[hsl(175,65%,35%)] bg-[hsl(175,65%,95%)]';
      default: return 'text-[hsl(220,15%,40%)] bg-[hsl(220,15%,95%)]';
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-[hsl(220,20%,98%)] via-[hsl(175,20%,98%)] to-[hsl(220,15%,96%)] dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Sidebar />
      
      {/* Popup de Mensagens Não Lidas */}
      <Dialog open={showMessagesPopup} onOpenChange={(open) => !open && handleClosePopup()}>
        <DialogContent className="sm:max-w-[500px]" data-testid="dialog-unread-messages">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[hsl(220,65%,18%)] dark:text-[hsl(175,65%,45%)]">
              <BellRing className="h-5 w-5" />
              Você tem {hrData.unreadMessages} {hrData.unreadMessages === 1 ? 'mensagem não lida' : 'mensagens não lidas'}
            </DialogTitle>
            <DialogDescription>
              Confira suas mensagens recentes abaixo ou clique em "Ver Todas" para acessar a caixa de entrada completa.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3 max-h-[300px] overflow-y-auto">
            {hrData.recentMessages.filter(m => !m.isRead).slice(0, 5).map((message) => (
              <div 
                key={message.id} 
                className="p-3 rounded-lg bg-[hsl(175,40%,98%)] dark:bg-[hsl(175,20%,15%)] border border-[hsl(175,40%,90%)] dark:border-[hsl(175,20%,25%)] hover:bg-[hsl(175,40%,95%)] dark:hover:bg-[hsl(175,20%,18%)] cursor-pointer transition"
                onClick={() => {
                  handleClosePopup();
                  setLocation('/messages');
                }}
                data-testid={`message-preview-${message.id}`}
              >
                <div className="flex items-start justify-between mb-1">
                  <p className="font-medium text-[hsl(220,65%,18%)] dark:text-[hsl(175,65%,45%)] text-sm">
                    {message.senderName}
                  </p>
                  <Badge 
                    variant="outline" 
                    className={getPriorityColor(message.priority)}
                  >
                    {message.priority === 'high' ? 'Alta' : 'Normal'}
                  </Badge>
                </div>
                <p className="text-sm font-medium text-[hsl(220,40%,25%)] dark:text-[hsl(175,40%,70%)] mb-1">
                  {message.subject}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(message.createdAt)}
                </p>
              </div>
            ))}
            
            {hrData.recentMessages.filter(m => !m.isRead).length === 0 && (
              <p className="text-center text-muted-foreground py-4">
                Nenhuma mensagem não lida recente
              </p>
            )}
          </div>
          
          <div className="flex gap-2 mt-4">
            <Button
              variant="outline"
              onClick={handleClosePopup}
              className="flex-1"
              data-testid="button-close-popup"
            >
              Fechar
            </Button>
            <Button
              onClick={() => {
                handleClosePopup();
                setLocation('/messages');
              }}
              className="flex-1 bg-[hsl(220,65%,18%)] hover:bg-[hsl(220,65%,25%)] dark:bg-[hsl(175,65%,45%)] dark:hover:bg-[hsl(175,65%,50%)]"
              data-testid="button-view-all-messages"
            >
              <MailOpen className="h-4 w-4 mr-2" />
              Ver Todas as Mensagens
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar title="Dashboard" />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          {/* Superadmin Claim Alert - Only show if no superadmin exists in the system */}
          {user && superadminCheck && !superadminCheck.hasSuperadmin && (
            <div className="mb-6">
              <Alert className="border-[hsl(175,65%,75%)] bg-[hsl(175,65%,96%)] dark:border-[hsl(175,40%,30%)] dark:bg-[hsl(175,40%,15%)]">
                <Sparkles className="h-4 w-4 text-[hsl(175,65%,45%)]" />
                <AlertDescription className="flex items-center justify-between">
                  <div>
                    <span className="font-medium text-[hsl(220,65%,18%)] dark:text-[hsl(175,65%,55%)]">
                      Sistema sem Super Administrador
                    </span>
                    <p className="text-[hsl(220,40%,35%)] dark:text-[hsl(175,40%,70%)] mt-1">
                      Seja o primeiro administrador do sistema e tenha controle total sobre empresas e usuários.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => claimSuperadminMutation.mutate()}
                    disabled={claimSuperadminMutation.isPending}
                    className="ml-4 border-[hsl(175,65%,45%)] text-[hsl(175,65%,35%)] hover:bg-[hsl(175,40%,92%)] dark:border-[hsl(175,65%,45%)] dark:text-[hsl(175,65%,45%)] dark:hover:bg-[hsl(175,20%,20%)]"
                    data-testid="button-claim-superadmin"
                  >
                    {claimSuperadminMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[hsl(175,65%,45%)] mr-2"></div>
                        Processando...
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="h-4 w-4 mr-2" />
                        Tornar-se Super Admin
                      </>
                    )}
                  </Button>
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Bem-vindo ao RHNet
            </h1>
          </div>

          {/* Time Clock Quick Access - Prioritized */}
          <div className="mb-8">
            <Card className="bg-gradient-to-r from-[hsl(220,40%,96%)] to-[hsl(175,40%,96%)] dark:from-[hsl(220,20%,15%)] dark:to-[hsl(175,20%,18%)] border-[hsl(220,40%,85%)] dark:border-[hsl(220,15%,25%)]">
              <CardHeader>
                <CardTitle className="flex items-center text-[hsl(220,65%,18%)] dark:text-[hsl(175,65%,45%)]">
                  <Clock className="h-5 w-5 mr-2" />
                  Controle de Ponto
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button 
                    className="bg-[hsl(220,65%,18%)] hover:bg-[hsl(220,65%,25%)] dark:bg-[hsl(175,65%,45%)] dark:hover:bg-[hsl(175,65%,50%)] text-white"
                    onClick={() => setLocation('/time-clock')}
                    data-testid="button-time-clock-access"
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Acessar Controle de Ponto
                  </Button>
                  <Button 
                    variant="outline" 
                    className="border-[hsl(175,65%,45%)] text-[hsl(175,65%,35%)] hover:bg-[hsl(175,40%,95%)] dark:border-[hsl(175,65%,45%)] dark:text-[hsl(175,65%,45%)] dark:hover:bg-[hsl(175,20%,20%)]"
                    onClick={() => setLocation('/reports')}
                    data-testid="button-view-entries"
                  >
                    <CalendarDays className="h-4 w-4 mr-2" />
                    Ver Registros
                  </Button>
                  <Button 
                    variant="outline" 
                    className="border-[hsl(175,65%,45%)] text-[hsl(175,65%,35%)] hover:bg-[hsl(175,40%,95%)] dark:border-[hsl(175,65%,45%)] dark:text-[hsl(175,65%,45%)] dark:hover:bg-[hsl(175,20%,20%)]"
                    onClick={() => setLocation('/time-clock?tab=manual')}
                    data-testid="button-manual-entry"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Entrada Manual
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-8">
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

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card 
              className="bg-white/90 dark:bg-[hsl(220,20%,12%)] backdrop-blur-sm border-[hsl(175,40%,85%)] dark:border-[hsl(220,15%,25%)] hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setLocation('/messages')}
              data-testid="card-messages"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Mensagens</CardTitle>
                <MessageSquare className="h-4 w-4 text-[hsl(175,65%,45%)]" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <>
                    <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded animate-pulse mb-2"></div>
                    <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded animate-pulse w-16"></div>
                  </>
                ) : (
                  <>
                    <div className="text-2xl font-bold text-[hsl(220,65%,18%)] dark:text-[hsl(175,65%,45%)]" data-testid="text-unread-count">{hrData.unreadMessages}</div>
                    <p className="text-xs text-muted-foreground">Não lidas</p>
                    {hrData.unreadMessages > 0 && (
                      <Badge variant="destructive" className="mt-2">
                        Requer atenção
                      </Badge>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            <Card 
              className="bg-white/90 dark:bg-[hsl(220,20%,12%)] backdrop-blur-sm border-[hsl(175,40%,85%)] dark:border-[hsl(220,15%,25%)] hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setLocation('/documents')}
              data-testid="card-documents"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Documentos</CardTitle>
                <FileText className="h-4 w-4 text-[hsl(175,65%,45%)]" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <>
                    <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded animate-pulse mb-2"></div>
                    <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded animate-pulse w-16"></div>
                  </>
                ) : (
                  <>
                    <div className="text-2xl font-bold text-[hsl(220,65%,18%)] dark:text-[hsl(175,65%,45%)]" data-testid="text-pending-documents">{hrData.pendingDocuments}</div>
                    <p className="text-xs text-muted-foreground">Pendentes</p>
                    {hrData.pendingDocuments > 0 && (
                      <Badge variant="outline" className="mt-2">
                        Para enviar
                      </Badge>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            <Card 
              className="bg-white/90 dark:bg-[hsl(220,20%,12%)] backdrop-blur-sm border-[hsl(175,40%,85%)] dark:border-[hsl(220,15%,25%)] hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setLocation('/training')}
              data-testid="card-training"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cursos Ativos</CardTitle>
                <GraduationCap className="h-4 w-4 text-[hsl(175,65%,45%)]" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <>
                    <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded animate-pulse mb-2"></div>
                    <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded animate-pulse w-20"></div>
                    <div className="h-5 bg-gray-200 dark:bg-slate-700 rounded animate-pulse w-24 mt-2"></div>
                  </>
                ) : (
                  <>
                    <div className="text-2xl font-bold" data-testid="text-active-courses">{hrData.activeCourses}</div>
                    <p className="text-xs text-muted-foreground">Em andamento</p>
                    <Badge variant="secondary" className="mt-2">
                      {hrData.completedCourses} concluídos
                    </Badge>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ações Rápidas</CardTitle>
                <TrendingUp className="h-4 w-4 text-[hsl(220,65%,18%)]" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start"
                    onClick={() => setLocation('/messages')}
                    data-testid="button-new-message"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Nova Mensagem
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start"
                    onClick={() => setLocation('/documents')}
                    data-testid="button-upload-document"
                  >
                    <UploadCloud className="h-4 w-4 mr-2" />
                    Enviar Documento
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Messages */}
            <Card className="bg-white/90 dark:bg-[hsl(220,20%,12%)] backdrop-blur-sm border-[hsl(175,40%,85%)] dark:border-[hsl(220,15%,25%)]">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center">
                  <MailOpen className="h-5 w-5 mr-2 text-[hsl(175,65%,45%)]" />
                  Mensagens Recentes
                </CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setLocation('/messages')}
                  data-testid="button-view-all-messages"
                >
                  Ver todas
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {hrData.recentMessages.map((message) => (
                  <div key={message.id} className="flex items-start space-x-4 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex-shrink-0">
                      <div className={`w-3 h-3 rounded-full mt-2 ${message.isRead ? 'bg-gray-400' : 'bg-[hsl(175,65%,45%)]'}`} />
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
            <Card className="bg-white/90 dark:bg-[hsl(220,20%,12%)] backdrop-blur-sm border-[hsl(175,40%,85%)] dark:border-[hsl(220,15%,25%)]">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center">
                  <BellRing className="h-5 w-5 mr-2 text-[hsl(175,65%,45%)]" />
                  Tarefas Pendentes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {hrData.pendingTasks.map((task) => (
                  <div key={task.id} className="flex items-center space-x-4 p-3 border rounded-lg">
                    <div className="flex-shrink-0">
                      {task.type === 'document' && <FileText className="h-5 w-5 text-[hsl(175,65%,45%)]" />}
                      {task.type === 'course' && <GraduationCap className="h-5 w-5 text-[hsl(142,71%,45%)]" />}
                      {task.type === 'message' && <MessageSquare className="h-5 w-5 text-[hsl(175,65%,45%)]" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{task.title}</p>
                      {task.dueDate && (
                        <p className="text-xs text-muted-foreground">
                          Prazo: {new Date(task.dueDate).toLocaleDateString('pt-BR')}
                        </p>
                      )}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (task.type === 'document') {
                          setLocation('/documents');
                        } else if (task.type === 'course') {
                          setLocation('/training');
                        } else if (task.type === 'message') {
                          setLocation('/messages');
                        }
                      }}
                      data-testid={`button-task-${task.id}`}
                    >
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
