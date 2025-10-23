import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Briefcase, MapPin, DollarSign, Clock, Building, FileText, CheckCircle, Upload } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Job opening interface
interface JobOpening {
  id: number;
  title: string;
  description?: string;
  requirements?: string;
  responsibilities?: string;
  benefits?: string;
  location?: string;
  employmentType: string;
  salaryRange?: string;
  status: string;
}

// Form schema for job application
const applicationSchema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  email: z.string().email("Email inválido"),
  phone: z.string().optional(),
  cpf: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  coverLetter: z.string().optional(),
  resume: z.instanceof(FileList).optional()
});

type ApplicationForm = z.infer<typeof applicationSchema>;

export default function JobApply() {
  const { jobId } = useParams<{ jobId: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [applicationSubmitted, setApplicationSubmitted] = useState(false);

  // Fetch job details
  const { data: job, isLoading } = useQuery<JobOpening>({
    queryKey: [`/api/public/jobs/${jobId}`],
  });

  const form = useForm<ApplicationForm>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      cpf: "",
      city: "",
      state: "",
      coverLetter: "",
    },
  });

  // Submit application mutation
  const submitApplicationMutation = useMutation({
    mutationFn: async (data: ApplicationForm) => {
      if (!jobId) {
        throw new Error("Job ID is missing");
      }

      const formData = new FormData();
      formData.append("jobOpeningId", jobId);
      console.log("Job ID being sent:", jobId);
      formData.append("name", data.name);
      formData.append("email", data.email);
      if (data.phone) formData.append("phone", data.phone);
      if (data.cpf) formData.append("cpf", data.cpf);
      if (data.city) formData.append("city", data.city);
      if (data.state) formData.append("state", data.state);
      if (data.coverLetter) formData.append("coverLetter", data.coverLetter);
      
      // Add resume file if selected
      if (data.resume && data.resume.length > 0) {
        formData.append("resume", data.resume[0]);
      }

      const response = await fetch("/api/public/apply", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Erro ao enviar candidatura");
      }

      return response.json();
    },
    onSuccess: () => {
      setApplicationSubmitted(true);
      toast({
        title: "Candidatura enviada!",
        description: "Sua candidatura foi enviada com sucesso. Entraremos em contato em breve.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao enviar candidatura",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ApplicationForm) => {
    submitApplicationMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando vaga...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Vaga não encontrada</CardTitle>
            <CardDescription>Esta vaga não está mais disponível ou foi removida.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (applicationSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center p-4">
        <Card className="max-w-lg w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Candidatura Enviada!</CardTitle>
            <CardDescription className="text-base">
              Sua candidatura para a vaga de <strong>{job.title}</strong> foi enviada com sucesso.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-sm text-muted-foreground">
              Nossa equipe de RH irá analisar seu currículo e entraremos em contato em breve.
            </p>
            <Button
              className="w-full"
              onClick={() => setLocation("/")}
              data-testid="button-back-home"
            >
              Voltar para a Página Inicial
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Job Details Card */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1 flex-1">
                <CardTitle className="text-2xl">{job.title}</CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  Vaga #{job.id}
                </CardDescription>
              </div>
              <Badge variant="secondary" className="text-sm">
                {job.employmentType}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {job.location && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{job.location}</span>
                </div>
              )}
              {job.salaryRange && (
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span>{job.salaryRange}</span>
                </div>
              )}
            </div>

            {job.description && (
              <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Descrição da Vaga
                </h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{job.description}</p>
              </div>
            )}

            {job.requirements && (
              <div className="space-y-2">
                <h3 className="font-semibold">Requisitos</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{job.requirements}</p>
              </div>
            )}

            {job.responsibilities && (
              <div className="space-y-2">
                <h3 className="font-semibold">Responsabilidades</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{job.responsibilities}</p>
              </div>
            )}

            {job.benefits && (
              <div className="space-y-2">
                <h3 className="font-semibold">Benefícios</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{job.benefits}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Application Form Card */}
        <Card>
          <CardHeader>
            <CardTitle>Candidate-se a Esta Vaga</CardTitle>
            <CardDescription>
              Preencha o formulário abaixo com seus dados e anexe seu currículo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome Completo *</FormLabel>
                        <FormControl>
                          <Input placeholder="Seu nome completo" {...field} data-testid="input-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email *</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="seu@email.com" {...field} data-testid="input-email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone</FormLabel>
                        <FormControl>
                          <Input placeholder="(11) 98765-4321" {...field} data-testid="input-phone" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cpf"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CPF</FormLabel>
                        <FormControl>
                          <Input placeholder="000.000.000-00" {...field} data-testid="input-cpf" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cidade</FormLabel>
                        <FormControl>
                          <Input placeholder="Sua cidade" {...field} data-testid="input-city" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estado</FormLabel>
                        <FormControl>
                          <Input placeholder="SP" {...field} data-testid="input-state" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="resume"
                  render={({ field: { onChange, value, ...field } }) => (
                    <FormItem>
                      <FormLabel>Currículo (PDF ou DOC) *</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-2">
                          <Input
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={(e) => onChange(e.target.files)}
                            {...field}
                            data-testid="input-resume"
                          />
                          <Upload className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </FormControl>
                      <p className="text-xs text-muted-foreground">Tamanho máximo: 5MB</p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="coverLetter"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Carta de Apresentação (Opcional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Conte-nos um pouco sobre você e por que você se interessa por esta vaga..."
                          rows={6}
                          {...field}
                          data-testid="input-cover-letter"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-3">
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={submitApplicationMutation.isPending}
                    data-testid="button-submit-application"
                  >
                    {submitApplicationMutation.isPending ? "Enviando..." : "Enviar Candidatura"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setLocation("/")}
                    data-testid="button-cancel"
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
