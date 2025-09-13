import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Play, Award, Clock, CheckCircle } from "lucide-react";
import Sidebar from "@/components/layout/sidebar";
import TopBar from "@/components/layout/top-bar";

export default function Training() {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
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
                <Play className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2</div>
                <p className="text-xs text-muted-foreground">Em andamento</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Concluídos</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8</div>
                <p className="text-xs text-muted-foreground">Certificados obtidos</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Horas de Treinamento</CardTitle>
                <Clock className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">45h</div>
                <p className="text-xs text-muted-foreground">Este ano</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Certificados</CardTitle>
                <Award className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8</div>
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
                {[
                  { title: "Segurança do Trabalho", progress: 75, dueDate: "20/01/2025" },
                  { title: "Comunicação Eficaz", progress: 30, dueDate: "25/01/2025" },
                ].map((course, index) => (
                  <div key={index} className="space-y-2" data-testid={`course-progress-${index}`}>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{course.title}</span>
                      <span className="text-sm text-muted-foreground">{course.progress}%</span>
                    </div>
                    <Progress value={course.progress} className="h-2" />
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Prazo: {course.dueDate}</span>
                      <Button variant="outline" size="sm" data-testid={`button-continue-course-${index}`}>
                        <Play className="h-4 w-4 mr-1" />
                        Continuar
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Available Courses */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Play className="h-5 w-5 mr-2" />
                  Cursos Disponíveis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { title: "Primeiros Socorros", duration: "8h", required: true },
                  { title: "Liderança e Gestão", duration: "12h", required: false },
                  { title: "Excel Avançado", duration: "6h", required: false },
                ].map((course, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg" data-testid={`available-course-${index}`}>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{course.title}</span>
                        {course.required && (
                          <Badge variant="destructive" className="text-xs">
                            Obrigatório
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{course.duration}</p>
                    </div>
                    <Button variant="outline" size="sm" data-testid={`button-start-course-${index}`}>
                      Iniciar
                    </Button>
                  </div>
                ))}
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
                {[
                  { title: "Segurança Básica", date: "15/12/2024", valid: "15/12/2025" },
                  { title: "Atendimento ao Cliente", date: "10/11/2024", valid: "10/11/2026" },
                  { title: "Informática Básica", date: "05/10/2024", valid: "Permanente" },
                ].map((cert, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-2" data-testid={`certificate-${index}`}>
                    <div className="flex items-center space-x-2">
                      <Award className="h-4 w-4 text-yellow-500" />
                      <span className="font-medium text-sm">{cert.title}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Emitido: {cert.date}</p>
                    <p className="text-xs text-muted-foreground">Válido até: {cert.valid}</p>
                    <Button variant="outline" size="sm" className="w-full">
                      Ver Certificado
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}