import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CheckCircle, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const API_BASE = "/api/disc/assessments";

export default function DISCAssessment() {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState<"welcome" | "questions" | "completed">("welcome");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<number, number>>({});
  
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get("token");

  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/disc/assessments/token", token],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/token/${token}`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Erro ao carregar avaliação");
      }
      return res.json();
    },
    enabled: !!token && currentStep !== "completed",
  });

  const startMutation = useMutation({
    mutationFn: async (assessmentId: number) => {
      const res = await fetch(`${API_BASE}/${assessmentId}/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Erro ao iniciar avaliação");
      return res.json();
    },
  });

  const submitMutation = useMutation({
    mutationFn: async ({ assessmentId, responses }: { assessmentId: number; responses: any[] }) => {
      const res = await fetch(`${API_BASE}/${assessmentId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ responses }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Erro ao enviar respostas");
      }
      return res.json();
    },
    onSuccess: () => {
      setCurrentStep("completed");
    },
  });

  const handleStartAssessment = async () => {
    if (!data?.assessment?.id) return;
    
    try {
      if (data.assessment.status === "pending") {
        await startMutation.mutateAsync(data.assessment.id);
      }
      setCurrentStep("questions");
    } catch (error: any) {
      console.error("Erro ao iniciar:", error);
    }
  };

  const handleAnswerQuestion = (questionId: number, value: number) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleNextQuestion = () => {
    const currentQuestion = data?.questions?.[currentQuestionIndex];
    if (!currentQuestion || !responses[currentQuestion.id]) {
      // Cannot advance without answering current question
      return;
    }
    
    if (currentQuestionIndex < (data?.questions?.length || 0) - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!data?.assessment?.id || !data?.questions) return;

    const responsesArray = Object.entries(responses).map(([questionId, selectedValue]) => ({
      questionId: parseInt(questionId),
      selectedValue,
    }));

    await submitMutation.mutateAsync({
      assessmentId: data.assessment.id,
      responses: responsesArray,
    });
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Token Inválido
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 dark:text-slate-400">
              O link de acesso ao teste DISC é inválido ou expirado.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Carregando avaliação...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Erro ao Carregar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 dark:text-slate-400">
              {(error as Error).message || "Erro desconhecido"}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const questions = data?.questions || [];
  const currentQuestion = questions[currentQuestionIndex];
  const answeredCount = Object.keys(responses).length;
  const progress = questions.length > 0 ? ((answeredCount / questions.length) * 100) : 0;
  const allQuestionsAnswered = answeredCount === questions.length;

  if (currentStep === "welcome") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full shadow-xl">
          <CardHeader className="bg-gradient-to-r from-[#1e3a8a] to-[#06b6d4] text-white rounded-t-lg">
            <CardTitle className="text-2xl">Avaliação DISC de Perfil Comportamental</CardTitle>
            <CardDescription className="text-blue-100">
              Descubra seu perfil de personalidade profissional
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Sobre a Avaliação DISC</h3>
              <p className="text-slate-600 dark:text-slate-400">
                A metodologia DISC identifica quatro perfis comportamentais principais:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <h4 className="font-semibold text-red-700 dark:text-red-400 mb-2">D - Dominância</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Direto, focado em resultados, competitivo e decisivo
                  </p>
                </div>
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <h4 className="font-semibold text-yellow-700 dark:text-yellow-400 mb-2">I - Influência</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Entusiasta, comunicativo, persuasivo e sociável
                  </p>
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <h4 className="font-semibold text-green-700 dark:text-green-400 mb-2">S - Estabilidade</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Paciente, leal, cooperativo e confiável
                  </p>
                </div>
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h4 className="font-semibold text-blue-700 dark:text-blue-400 mb-2">C - Conformidade</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Analítico, preciso, sistemático e orientado a detalhes
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Instruções</h3>
              <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-400">
                <li>O teste contém {questions.length} afirmações</li>
                <li>Para cada afirmação, indique o quanto você concorda em uma escala de 1 a 5</li>
                <li>Não existem respostas certas ou erradas - seja honesto</li>
                <li>O teste leva aproximadamente 5-10 minutos para completar</li>
                <li>Você pode voltar para questões anteriores a qualquer momento</li>
              </ul>
            </div>

            <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
              <AlertDescription className="text-slate-700 dark:text-slate-300">
                Suas respostas ajudarão a identificar o melhor alinhamento entre seu perfil e as necessidades da vaga.
              </AlertDescription>
            </Alert>

            <Button
              onClick={handleStartAssessment}
              className="w-full bg-gradient-to-r from-[#1e3a8a] to-[#06b6d4] hover:opacity-90"
              size="lg"
              data-testid="button-start-assessment"
            >
              Iniciar Avaliação
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (currentStep === "questions") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <Card className="shadow-xl">
            <CardHeader className="bg-gradient-to-r from-[#1e3a8a] to-[#06b6d4] text-white">
              <div className="flex justify-between items-center mb-4">
                <CardTitle>Avaliação DISC</CardTitle>
                <span className="text-sm text-blue-100">
                  Questão {currentQuestionIndex + 1} de {questions.length}
                </span>
              </div>
              <Progress value={progress} className="h-2 bg-blue-200" />
              <p className="text-sm text-blue-100 mt-2">{Math.round(progress)}% concluído</p>
            </CardHeader>
            <CardContent className="pt-8 pb-6">
              {currentQuestion && (
                <div className="space-y-6">
                  <div className="min-h-[80px] flex items-center">
                    <p className="text-lg font-medium text-slate-800 dark:text-slate-200">
                      {currentQuestion.questionText}
                    </p>
                  </div>

                  <RadioGroup
                    value={responses[currentQuestion.id]?.toString() || ""}
                    onValueChange={(value) => handleAnswerQuestion(currentQuestion.id, parseInt(value))}
                  >
                    <div className="space-y-3">
                      {[
                        { value: 1, label: "Discordo totalmente" },
                        { value: 2, label: "Discordo parcialmente" },
                        { value: 3, label: "Neutro" },
                        { value: 4, label: "Concordo parcialmente" },
                        { value: 5, label: "Concordo totalmente" },
                      ].map((option) => (
                        <div
                          key={option.value}
                          className="flex items-center space-x-3 p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                          <RadioGroupItem
                            value={option.value.toString()}
                            id={`q${currentQuestion.id}-${option.value}`}
                            data-testid={`radio-answer-${option.value}`}
                          />
                          <Label
                            htmlFor={`q${currentQuestion.id}-${option.value}`}
                            className="flex-1 cursor-pointer text-slate-700 dark:text-slate-300"
                          >
                            {option.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>

                  <div className="flex gap-3 pt-6">
                    <Button
                      onClick={handlePreviousQuestion}
                      disabled={currentQuestionIndex === 0}
                      variant="outline"
                      className="flex-1"
                      data-testid="button-previous"
                    >
                      Anterior
                    </Button>
                    {currentQuestionIndex < questions.length - 1 ? (
                      <Button
                        onClick={handleNextQuestion}
                        disabled={!responses[currentQuestion?.id]}
                        className="flex-1 bg-gradient-to-r from-[#1e3a8a] to-[#06b6d4]"
                        data-testid="button-next"
                      >
                        Próxima
                      </Button>
                    ) : (
                      <Button
                        onClick={handleSubmit}
                        disabled={!allQuestionsAnswered || submitMutation.isPending}
                        className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600"
                        data-testid="button-submit-assessment"
                      >
                        {submitMutation.isPending ? "Enviando..." : "Concluir Avaliação"}
                      </Button>
                    )}
                  </div>

                  {submitMutation.isError && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        {(submitMutation.error as Error).message}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (currentStep === "completed") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
        <Card className="max-w-lg w-full shadow-xl">
          <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-lg text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16" />
            </div>
            <CardTitle className="text-2xl">Avaliação Concluída!</CardTitle>
            <CardDescription className="text-green-100">
              Suas respostas foram enviadas com sucesso
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 text-center space-y-4">
            <p className="text-slate-600 dark:text-slate-400">
              Obrigado por completar a avaliação DISC.
            </p>
            <p className="text-slate-600 dark:text-slate-400">
              Seus resultados foram registrados e serão analisados pela equipe de RH em breve.
            </p>
            <div className="pt-4">
              <p className="text-sm text-slate-500 dark:text-slate-500">
                Você pode fechar esta página agora.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}
