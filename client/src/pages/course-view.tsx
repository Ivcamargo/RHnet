import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, Award, ArrowLeft } from "lucide-react";
import Sidebar from "@/components/layout/sidebar";
import TopBar from "@/components/layout/top-bar";
import type { Course, CourseQuestion, EmployeeCourse } from "@shared/schema";

export default function CourseView() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(0);

  // Fetch course details
  const { data: course, isLoading: courseLoading } = useQuery<Course>({
    queryKey: [`/api/courses/${id}`],
  });

  // Fetch course questions
  const { data: questions = [], isLoading: questionsLoading } = useQuery<CourseQuestion[]>({
    queryKey: [`/api/courses/${id}/questions`],
  });

  // Fetch employee course progress
  const { data: employeeCourse } = useQuery<EmployeeCourse>({
    queryKey: [`/api/employee-courses/course/${id}`],
  });

  // Submit quiz mutation
  const submitQuizMutation = useMutation({
    mutationFn: async (data: { employeeCourseId: number; answers: Array<{ questionId: number; answer: string }> }) => {
      const response = await apiRequest(`/api/courses/${id}/submit-quiz`, {
        method: "POST",
        body: JSON.stringify(data),
      });
      return response;
    },
    onSuccess: (data: any) => {
      setScore(data.score);
      setQuizCompleted(true);
      queryClient.invalidateQueries({ queryKey: ["/api/employee-courses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/certificates"] });
      
      if (data.passed) {
        toast({
          title: "Parabéns! 🎉",
          description: `Você foi aprovado com ${data.score}% de acertos e recebeu seu certificado!`,
        });
      } else {
        toast({
          title: "Não aprovado",
          description: `Você obteve ${data.score}% de acertos. A nota mínima é ${course?.passingScore}%.`,
          variant: "destructive",
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

  const handleVideoEnd = () => {
    if (questions.length > 0) {
      setShowQuiz(true);
    } else {
      // Complete course without quiz
      completeCourseWithoutQuiz();
    }
  };

  const completeCourseWithoutQuiz = async () => {
    if (!employeeCourse) return;
    
    try {
      await apiRequest(`/api/employee-courses/${employeeCourse.id}/complete`, {
        method: "PUT",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/employee-courses"] });
      toast({
        title: "Curso concluído!",
        description: "Parabéns por completar o curso!",
      });
      setLocation("/training");
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleAnswerChange = (questionId: number, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmitQuiz = () => {
    if (!employeeCourse) return;

    const answerArray = questions.map(q => ({
      questionId: q.id,
      answer: answers[q.id] || "",
    }));

    submitQuizMutation.mutate({
      employeeCourseId: employeeCourse.id,
      answers: answerArray,
    });
  };

  const getVideoEmbedUrl = (url: string) => {
    if (!url) return "";
    
    // YouTube
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      const videoId = url.includes("youtu.be") 
        ? url.split("/").pop()
        : new URLSearchParams(new URL(url).search).get("v");
      return `https://www.youtube.com/embed/${videoId}`;
    }
    
    // Vimeo
    if (url.includes("vimeo.com")) {
      const videoId = url.split("/").pop();
      return `https://player.vimeo.com/video/${videoId}`;
    }
    
    return url;
  };

  if (courseLoading || questionsLoading) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <TopBar title="Curso" />
          <main className="flex-1 overflow-auto p-8">
            <div>Carregando curso...</div>
          </main>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <TopBar title="Curso" />
          <main className="flex-1 overflow-auto p-8">
            <div>Curso não encontrado</div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar title={course.title} />
        <main className="flex-1 overflow-auto p-8">
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={() => setLocation("/training")}
                data-testid="button-back-to-courses"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar para Cursos
              </Button>
            </div>

            {!showQuiz && !quizCompleted && (
              <Card>
                <CardHeader>
                  <CardTitle>{course.title}</CardTitle>
                  <p className="text-muted-foreground">{course.description}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {course.videoUrl ? (
                    <div className="aspect-video bg-black rounded-lg overflow-hidden">
                      <iframe
                        src={getVideoEmbedUrl(course.videoUrl)}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        data-testid="video-player"
                      />
                    </div>
                  ) : (
                    <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                      <p className="text-muted-foreground">Nenhum vídeo disponível</p>
                    </div>
                  )}

                  <Button
                    onClick={handleVideoEnd}
                    className="w-full point-primary"
                    data-testid="button-finish-video"
                  >
                    {questions.length > 0 ? "Iniciar Questionário" : "Concluir Curso"}
                  </Button>
                </CardContent>
              </Card>
            )}

            {showQuiz && !quizCompleted && questions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Questionário de Avaliação</CardTitle>
                  <Progress value={((currentQuestion + 1) / questions.length) * 100} className="mt-2" />
                  <p className="text-sm text-muted-foreground">
                    Questão {currentQuestion + 1} de {questions.length}
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">{questions[currentQuestion].question}</h3>
                    
                    <RadioGroup
                      value={answers[questions[currentQuestion].id] || ""}
                      onValueChange={(value) => handleAnswerChange(questions[currentQuestion].id, value)}
                    >
                      {(questions[currentQuestion].options as string[]).map((option, index) => (
                        <div key={index} className="flex items-center space-x-2 p-3 border rounded-lg">
                          <RadioGroupItem value={option} id={`option-${index}`} />
                          <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                            {option}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  <div className="flex justify-between">
                    <Button
                      variant="outline"
                      onClick={handlePreviousQuestion}
                      disabled={currentQuestion === 0}
                      data-testid="button-previous-question"
                    >
                      Anterior
                    </Button>

                    {currentQuestion < questions.length - 1 ? (
                      <Button
                        onClick={handleNextQuestion}
                        disabled={!answers[questions[currentQuestion].id]}
                        data-testid="button-next-question"
                      >
                        Próxima
                      </Button>
                    ) : (
                      <Button
                        onClick={handleSubmitQuiz}
                        disabled={!answers[questions[currentQuestion].id] || submitQuizMutation.isPending}
                        className="point-primary"
                        data-testid="button-submit-quiz"
                      >
                        {submitQuizMutation.isPending ? "Enviando..." : "Finalizar Questionário"}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {quizCompleted && (
              <Card>
                <CardContent className="py-12 text-center space-y-6">
                  {score >= (course.passingScore || 70) ? (
                    <>
                      <Award className="h-20 w-20 text-orange-400 mx-auto" />
                      <div>
                        <h2 className="text-2xl font-bold mb-2">Parabéns! 🎉</h2>
                        <p className="text-muted-foreground">
                          Você foi aprovado com {score}% de acertos!
                        </p>
                        <p className="text-sm text-muted-foreground mt-2">
                          Seu certificado foi gerado e está disponível na página de treinamentos.
                        </p>
                      </div>
                      <Button
                        onClick={() => setLocation("/training")}
                        className="point-primary"
                        data-testid="button-view-certificate"
                      >
                        Ver Certificados
                      </Button>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-20 w-20 text-muted-foreground mx-auto" />
                      <div>
                        <h2 className="text-2xl font-bold mb-2">Não aprovado</h2>
                        <p className="text-muted-foreground">
                          Você obteve {score}% de acertos. A nota mínima é {course.passingScore}%.
                        </p>
                        <p className="text-sm text-muted-foreground mt-2">
                          Você pode tentar novamente mais tarde.
                        </p>
                      </div>
                      <Button
                        onClick={() => setLocation("/training")}
                        variant="outline"
                        data-testid="button-back-to-training"
                      >
                        Voltar para Treinamentos
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
