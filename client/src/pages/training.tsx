import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { GraduationCap, Play, Award, Clock, CheckCircle, Plus, Edit, Trash2, X } from "lucide-react";
import Sidebar from "@/components/layout/sidebar";
import TopBar from "@/components/layout/top-bar";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { Course, EmployeeCourse, Certificate, insertCourseSchema, type InsertCourse } from "@shared/schema";

export default function Training() {
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const { toast } = useToast();

  // Fetch user info
  const { data: user } = useQuery({
    queryKey: ["/api/auth/user"],
  });

  // Fetch courses, employee progress, and certificates
  const { data: courses = [], isLoading: coursesLoading } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
  });

  const { data: employeeCourses = [], isLoading: progressLoading } = useQuery<EmployeeCourse[]>({
    queryKey: ["/api/employee-courses"],
  });

  const { data: certificates = [], isLoading: certificatesLoading } = useQuery<Certificate[]>({
    queryKey: ["/api/certificates"],
  });

  // Form for creating courses
  const form = useForm<InsertCourse>({
    resolver: zodResolver(insertCourseSchema),
    defaultValues: {
      title: "",
      description: "",
      duration: 0,
      isRequired: false,
    },
  });

  // Mutations for course actions
  const startCourseMutation = useMutation({
    mutationFn: (courseId: number) => apiRequest("/api/employee-courses/start", { method: "POST", body: JSON.stringify({ courseId }) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employee-courses"] });
    }
  });

  const createCourseMutation = useMutation({
    mutationFn: async (data: InsertCourse) => {
      await apiRequest("/api/courses", { method: "POST", body: JSON.stringify(data) });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      setIsCreateOpen(false);
      form.reset();
      toast({
        title: "Sucesso",
        description: "Curso criado com sucesso",
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

  // Update course mutation
  const updateCourseMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertCourse> }) => {
      await apiRequest(`/api/courses/${id}`, { method: "PUT", body: JSON.stringify(data) });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      setShowEditDialog(false);
      setEditingCourse(null);
      form.reset();
      toast({
        title: "Sucesso",
        description: "Curso atualizado com sucesso",
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

  // Delete course mutation
  const deleteCourseMutation = useMutation({
    mutationFn: async (courseId: number) => {
      await apiRequest(`/api/courses/${courseId}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      toast({
        title: "Sucesso",
        description: "Curso excluído com sucesso",
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

  // Stop course mutation
  const stopCourseMutation = useMutation({
    mutationFn: async (employeeCourseId: number) => {
      await apiRequest(`/api/employee-courses/${employeeCourseId}/stop`, { method: "PUT" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employee-courses"] });
      toast({
        title: "Curso parado",
        description: "Você parou o curso com sucesso",
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

  // Calculate stats
  const activeCourses = employeeCourses.filter(ec => ec.status === 'in_progress').length;
  const completedCourses = employeeCourses.filter(ec => ec.status === 'completed').length;
  const totalHours = employeeCourses
    .filter(ec => ec.status === 'completed' && ec.completedAt)
    .reduce((total, ec) => {
      const course = courses.find(c => c.id === ec.courseId);
      return total + (course?.duration ? Math.floor(course.duration / 60) : 0);
    }, 0);

  // Get courses in progress
  const coursesInProgress = employeeCourses
    .filter(ec => ec.status === 'in_progress')
    .map(ec => ({
      ...ec,
      course: courses.find(c => c.id === ec.courseId)
    }))
    .filter(item => item.course);

  // Get available courses (not yet started)
  const availableCourses = courses.filter(course => 
    !employeeCourses.some(ec => ec.courseId === course.id)
  );

  const handleStartCourse = (courseId: number) => {
    startCourseMutation.mutate(courseId);
  };

  const onSubmitCourse = (data: InsertCourse) => {
    createCourseMutation.mutate(data);
  };

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    form.reset({
      title: course.title || "",
      description: course.description || "",
      duration: course.duration || 0,
      isRequired: course.isRequired || false,
    });
    setShowEditDialog(true);
  };

  const handleUpdateCourse = (data: InsertCourse) => {
    if (!editingCourse) return;
    updateCourseMutation.mutate({ id: editingCourse.id, data });
  };

  const handleDeleteCourse = (courseId: number) => {
    if (confirm("Tem certeza que deseja excluir este curso? Esta ação não pode ser desfeita.")) {
      deleteCourseMutation.mutate(courseId);
    }
  };

  const handleStopCourse = (employeeCourseId: number) => {
    if (confirm("Tem certeza que deseja parar este curso?")) {
      stopCourseMutation.mutate(employeeCourseId);
    }
  };

  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-orange-50 via-red-50 to-orange-100">
      <Sidebar />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar title="Capacitação e Treinamentos" />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Capacitação
            </h1>
            <p className="text-muted-foreground">
              Acompanhe seu progresso em cursos e treinamentos
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cursos Ativos</CardTitle>
                <Play className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                {progressLoading ? (
                  <Skeleton className="h-8 w-8" />
                ) : (
                  <div className="text-2xl font-bold">{activeCourses}</div>
                )}
                <p className="text-xs text-muted-foreground">Em andamento</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Concluídos</CardTitle>
                <CheckCircle className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                {progressLoading ? (
                  <Skeleton className="h-8 w-8" />
                ) : (
                  <div className="text-2xl font-bold">{completedCourses}</div>
                )}
                <p className="text-xs text-muted-foreground">Certificados obtidos</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Horas de Treinamento</CardTitle>
                <Clock className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                {coursesLoading || progressLoading ? (
                  <Skeleton className="h-8 w-8" />
                ) : (
                  <div className="text-2xl font-bold">{totalHours}h</div>
                )}
                <p className="text-xs text-muted-foreground">Este ano</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Certificados</CardTitle>
                <Award className="h-4 w-4 text-orange-400" />
              </CardHeader>
              <CardContent>
                {certificatesLoading ? (
                  <Skeleton className="h-8 w-8" />
                ) : (
                  <div className="text-2xl font-bold">{certificates.length}</div>
                )}
                <p className="text-xs text-muted-foreground">Válidos</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Current Courses */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <GraduationCap className="h-5 w-5 mr-2" />
                  Cursos em Andamento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {progressLoading || coursesLoading ? (
                  [1, 2].map((i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-12" />
                      </div>
                      <Skeleton className="h-2 w-full" />
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-8 w-20" />
                      </div>
                    </div>
                  ))
                ) : coursesInProgress.length === 0 ? (
                  <div className="text-center py-8">
                    <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Nenhum curso em andamento</p>
                    <p className="text-sm text-muted-foreground mt-1">Inicie um curso para começar sua capacitação</p>
                  </div>
                ) : (
                  coursesInProgress.map((item, index) => (
                    <div key={item.id} className="space-y-2" data-testid={`course-progress-${index}`}>
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{item.course?.title}</span>
                        <span className="text-sm text-muted-foreground">{item.progress}%</span>
                      </div>
                      <Progress value={item.progress} className="h-2" />
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          Iniciado: {item.startedAt ? new Date(item.startedAt).toLocaleDateString('pt-BR') : 'N/A'}
                        </span>
                        <div className="flex gap-1">
                          <Button variant="outline" size="sm" data-testid={`button-continue-course-${index}`}>
                            <Play className="h-4 w-4 mr-1" />
                            Continuar
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            onClick={() => handleStopCourse(item.id)}
                            data-testid={`button-stop-course-${index}`}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Available Courses */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Play className="h-5 w-5 mr-2" />
                    Cursos Disponíveis
                  </CardTitle>
                  {isAdmin && (
                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                      <DialogTrigger asChild>
                        <Button className="point-primary">
                          <Plus className="h-4 w-4 mr-2" />
                          Novo Curso
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                          <DialogTitle>Criar Novo Curso</DialogTitle>
                        </DialogHeader>
                        <Form {...form}>
                          <form onSubmit={form.handleSubmit(onSubmitCourse)} className="space-y-4">
                            <FormField
                              control={form.control}
                              name="title"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Título do Curso</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Ex: Treinamento de Segurança no Trabalho" {...field} />
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
                                    <Textarea placeholder="Descrição do curso..." {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="duration"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Duração (em minutos)</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number"
                                      placeholder="Ex: 120" 
                                      {...field}
                                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="isRequired"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                  <div className="space-y-0.5">
                                    <FormLabel className="text-base">
                                      Curso Obrigatório
                                    </FormLabel>
                                    <div className="text-sm text-muted-foreground">
                                      Marque se este curso é obrigatório para todos os funcionários
                                    </div>
                                  </div>
                                  <FormControl>
                                    <Switch
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                            
                            <div className="flex gap-2">
                              <Button type="submit" disabled={createCourseMutation.isPending} className="point-primary">
                                {createCourseMutation.isPending ? "Criando..." : "Criar"}
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

                {/* Edit Course Dialog */}
                <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                  <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle>Editar Curso</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(handleUpdateCourse)} className="space-y-4">
                        <FormField
                          control={form.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Título do Curso</FormLabel>
                              <FormControl>
                                <Input placeholder="Ex: Treinamento de Segurança no Trabalho" {...field} data-testid="input-course-title-edit" />
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
                                <Textarea placeholder="Descrição do curso..." {...field} data-testid="textarea-course-description-edit" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="duration"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Duração (em minutos)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number"
                                  placeholder="Ex: 120" 
                                  {...field}
                                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                                  data-testid="input-course-duration-edit"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="isRequired"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">
                                  Curso Obrigatório
                                </FormLabel>
                                <div className="text-sm text-muted-foreground">
                                  Marque se este curso é obrigatório para todos os funcionários
                                </div>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  data-testid="switch-course-required-edit"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        <div className="flex gap-2">
                          <Button type="submit" disabled={updateCourseMutation.isPending} className="point-primary" data-testid="button-update-course">
                            {updateCourseMutation.isPending ? "Atualizando..." : "Atualizar"}
                          </Button>
                          <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)}>
                            Cancelar
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent className="space-y-4">
                {coursesLoading ? (
                  [1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                      <Skeleton className="h-8 w-16" />
                    </div>
                  ))
                ) : availableCourses.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <p className="text-muted-foreground">Todos os cursos foram iniciados!</p>
                    <p className="text-sm text-muted-foreground mt-1">Continue seus estudos nos cursos em andamento</p>
                  </div>
                ) : (
                  availableCourses.map((course, index) => (
                    <div key={course.id} className="flex items-center justify-between p-3 border rounded-lg" data-testid={`available-course-${index}`}>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{course.title}</span>
                          {course.isRequired && (
                            <Badge variant="destructive" className="text-xs">
                              Obrigatório
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {course.duration ? `${Math.floor(course.duration / 60)}h` : 'Duração não definida'}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          data-testid={`button-start-course-${index}`}
                          onClick={() => handleStartCourse(course.id)}
                          disabled={startCourseMutation.isPending}
                        >
                          {startCourseMutation.isPending ? (
                            <Clock className="h-4 w-4 mr-1" />
                          ) : (
                            <Play className="h-4 w-4 mr-1" />
                          )}
                          Iniciar
                        </Button>
                        {isAdmin && (
                          <>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handleEditCourse(course)}
                              data-testid={`button-edit-course-${index}`}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive" 
                              onClick={() => handleDeleteCourse(course.id)}
                              data-testid={`button-delete-course-${index}`}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Certificates */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="h-5 w-5 mr-2" />
                Certificados Obtidos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {certificatesLoading ? (
                  [1, 2, 3].map((i) => (
                    <div key={i} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-center space-x-2">
                        <Skeleton className="h-4 w-4" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-8 w-full" />
                    </div>
                  ))
                ) : certificates.length === 0 ? (
                  <div className="col-span-full text-center py-8">
                    <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Nenhum certificado ainda</p>
                    <p className="text-sm text-muted-foreground mt-1">Complete cursos para ganhar certificados</p>
                  </div>
                ) : (
                  certificates.map((cert, index) => (
                    <div key={cert.id} className="border rounded-lg p-4 space-y-2" data-testid={`certificate-${index}`}>
                      <div className="flex items-center space-x-2">
                        <Award className="h-4 w-4 text-orange-400" />
                        <span className="font-medium text-sm">{cert.title}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Emitido: {new Date(cert.issuedDate).toLocaleDateString('pt-BR')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Válido até: {cert.expiryDate ? new Date(cert.expiryDate).toLocaleDateString('pt-BR') : 'Permanente'}
                      </p>
                      <Button variant="outline" size="sm" className="w-full">
                        Ver Certificado
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}