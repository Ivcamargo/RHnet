import { useState, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useRoute } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Briefcase, 
  MapPin,
  DollarSign,
  Calendar,
  ArrowLeft,
  Send,
  CheckCircle,
  Filter,
  Home,
  Check
} from 'lucide-react';
import rhnetLogo from "@assets/rhnetp_1757765662344.jpg";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from '@/lib/queryClient';

interface DISCQuestion {
  id: number;
  questionText: string;
  profileType: string;
  order: number;
}

export default function PublicJobs() {
  const [match, params] = useRoute('/vagas/:id');
  const [isApplyDialogOpen, setIsApplyDialogOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [applicationSuccess, setApplicationSuccess] = useState(false);
  const [requirementResponses, setRequirementResponses] = useState<Record<number, string>>({});
  const [discResponses, setDiscResponses] = useState<Record<number, number>>({});
  const { toast } = useToast();
  
  // Filtros
  const [filterLocation, setFilterLocation] = useState<string>('');
  const [filterEmploymentType, setFilterEmploymentType] = useState<string>('');
  const [filterTitle, setFilterTitle] = useState<string>('');
  const routeJobId = match && params?.id ? parseInt(params.id) : null;
  const requirementsJobId = routeJobId || selectedJob?.id || null;

  // Buscar vagas publicadas (rota pública)
  const { data: jobs = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/public/jobs'],
    queryFn: async () => {
      const res = await fetch('/api/public/jobs');
      if (!res.ok) throw new Error('Failed to fetch jobs');
      return res.json();
    },
    refetchOnMount: 'always',
  });

  // Buscar requisitos da vaga selecionada
  const { data: jobRequirements = [], isLoading: requirementsLoading } = useQuery<any[]>({
    queryKey: ['/api/job-openings', requirementsJobId, 'requirements'],
    queryFn: async () => {
      if (!requirementsJobId) return [];
      const res = await fetch(`/api/job-openings/${requirementsJobId}/requirements`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!requirementsJobId,
    staleTime: 0,
    refetchOnMount: true,
  });

  // Buscar questões DISC se required
  const { data: discQuestions = [], isLoading: discQuestionsLoading, error: discQuestionsError, refetch: refetchDiscQuestions } = useQuery<DISCQuestion[]>({
    queryKey: ['/api/disc-questions'],
    queryFn: async () => {
      const res = await fetch('/api/disc-questions');
      if (!res.ok) throw new Error('Failed to fetch DISC questions');
      return res.json();
    },
    enabled: !!selectedJob?.requiresDISC && selectedJob?.discTiming === 'on_application' && isApplyDialogOpen,
    retry: 3,
    staleTime: 5 * 60 * 1000,
  });

  const applyMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch('/api/public/apply', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Application submission failed:', errorData);
        throw new Error(errorData.message || 'Failed to submit application');
      }

      return response.json();
    },
    onSuccess: () => {
      setApplicationSuccess(true);
      toast({
        title: "Candidatura enviada com sucesso!",
        description: "Entraremos em contato em breve.",
      });
    },
    onError: () => {
      toast({
        title: "Erro ao enviar candidatura",
        description: "Por favor, tente novamente.",
        variant: "destructive",
      });
    },
  });

  const handleApply = (job: any) => {
    setSelectedJob(job);
    setApplicationSuccess(false);
    setRequirementResponses({});
    setDiscResponses({});
    setIsApplyDialogOpen(true);
  };

  // Check if DISC is complete (if required)
  const discRequired = selectedJob?.requiresDISC && selectedJob?.discTiming === 'on_application';
  const discQuestionsCount = discQuestions.length;
  const discAnsweredCount = Object.keys(discResponses).length;
  const discComplete = !discRequired || (discQuestionsCount > 0 && discAnsweredCount === discQuestionsCount);

  const handleSubmitApplication = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate DISC responses if required
    if (discRequired && !discComplete) {
      toast({
        title: "Teste DISC incompleto",
        description: `Por favor, responda todas as ${discQuestionsCount} questões do teste DISC antes de enviar sua candidatura.`,
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData(e.currentTarget);
    
    // Adicionar jobOpeningId
    formData.append('jobOpeningId', selectedJob.id.toString());
    
    // Construir array de respostas aos requisitos e adicionar como JSON string
    const responses = Object.entries(requirementResponses).map(([requirementId, proficiencyLevel]) => ({
      requirementId: parseInt(requirementId),
      proficiencyLevel,
    }));
    
    if (responses.length > 0) {
      formData.append('requirementResponses', JSON.stringify(responses));
    }

    // Add DISC responses if required
    if (discRequired) {
      const discResponsesJson = JSON.stringify(discResponses);
      formData.append("discResponses", discResponsesJson);
    }
    
    applyMutation.mutate(formData);
  };

  const getEmploymentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      full_time: 'Tempo Integral',
      part_time: 'Meio Período',
      contract: 'Contrato',
      temporary: 'Temporário',
      internship: 'Estágio',
    };
    return labels[type] || type;
  };

  const getExperienceLevelLabel = (level: string) => {
    const labels: Record<string, string> = {
      entry: 'Júnior',
      mid: 'Pleno',
      senior: 'Sênior',
      lead: 'Especialista',
    };
    return labels[level] || level;
  };

  // Filtrar vagas
  const filteredJobs = useMemo(() => {
    return jobs.filter((job: any) => {
      if (filterLocation && job.location !== filterLocation) return false;
      if (filterEmploymentType && job.employmentType !== filterEmploymentType) return false;
      if (filterTitle && !job.title.toLowerCase().includes(filterTitle.toLowerCase())) return false;
      return true;
    });
  }, [jobs, filterLocation, filterEmploymentType, filterTitle]);

  // Obter opções únicas para os filtros
  const uniqueLocations = useMemo(() => {
    const locations = jobs.map((job: any) => job.location).filter(Boolean);
    return Array.from(new Set(locations)).sort();
  }, [jobs]);

  const uniqueEmploymentTypes = useMemo(() => {
    const types = jobs.map((job: any) => job.employmentType).filter(Boolean);
    return Array.from(new Set(types)).sort();
  }, [jobs]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando vagas...</p>
        </div>
      </div>
    );
  }

  // Se estiver visualizando uma vaga específica
  if (match && params?.id) {
    const job = jobs.find(j => j.id === parseInt(params.id));
    
    if (!job) {
      return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-slate-900 dark:to-slate-900">
          {/* Header */}
          <header className="bg-white/90 backdrop-blur-sm shadow-xl border-b border-orange-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center py-6">
                <div className="flex items-center">
                  <img src={rhnetLogo} alt="RHNet" className="h-16 w-16 mr-3 rounded-lg" />
                  <h1 className="text-2xl font-bold text-[hsl(215,80%,25%)]">Trabalhe Conosco</h1>
                </div>
                <Button 
                  onClick={() => window.location.href = '/'} 
                  variant="outline"
                  className="border-orange-600 text-orange-600 hover:bg-orange-50"
                  data-testid="button-home"
                >
                  <Home className="mr-2 h-4 w-4" />
                  Página Inicial
                </Button>
              </div>
            </div>
          </header>
          
          <div className="flex items-center justify-center mt-20">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-2">Vaga não encontrada</h1>
              <Button onClick={() => window.location.href = '/vagas'}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Ver todas as vagas
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-slate-900 dark:to-slate-900">
        {/* Header */}
        <header className="bg-white/90 backdrop-blur-sm shadow-xl border-b border-orange-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <img src={rhnetLogo} alt="RHNet" className="h-16 w-16 mr-3 rounded-lg" />
                <h1 className="text-2xl font-bold text-[hsl(215,80%,25%)]">Trabalhe Conosco</h1>
              </div>
              <Button 
                onClick={() => window.location.href = '/'} 
                variant="outline"
                className="border-orange-600 text-orange-600 hover:bg-orange-50"
                data-testid="button-home"
              >
                <Home className="mr-2 h-4 w-4" />
                Página Inicial
              </Button>
            </div>
          </div>
        </header>
        
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Button 
            variant="ghost" 
            onClick={() => window.location.href = '/vagas'}
            className="mb-6"
            data-testid="button-back-to-jobs"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para vagas
          </Button>

          <Card className="mb-6">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-3xl mb-2">{job.title}</CardTitle>
                  <div className="flex gap-2 flex-wrap">
                    <Badge variant="default">Vaga Aberta</Badge>
                    {job.employmentType && (
                      <Badge variant="outline">{getEmploymentTypeLabel(job.employmentType)}</Badge>
                    )}
                    {job.experienceLevel && (
                      <Badge variant="outline">{getExperienceLevelLabel(job.experienceLevel)}</Badge>
                    )}
                  </div>
                </div>
                <Button 
                  size="lg" 
                  onClick={() => handleApply(job)}
                  data-testid="button-apply"
                >
                  <Send className="mr-2 h-4 w-4" />
                  Candidatar-se
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {(job.companyName || job.location || job.publishedAt) && (
                <div className="flex gap-4 flex-wrap text-sm text-muted-foreground">
                  {job.companyName && (
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />
                      <span>{job.companyName}</span>
                    </div>
                  )}
                  {job.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{job.location}</span>
                    </div>
                  )}
                  {job.publishedAt && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>
                        Publicada em {new Date(job.publishedAt).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  )}
                </div>
              )}

              <div>
                <h3 className="font-semibold text-lg mb-2">Descrição da Vaga</h3>
                <p className="whitespace-pre-wrap text-muted-foreground">{job.description}</p>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">Requisitos</h3>
                <p className="whitespace-pre-wrap text-muted-foreground">{job.requirements}</p>
              </div>

              {requirementsLoading ? (
                <div className="py-2 text-sm text-muted-foreground">Carregando requisitos técnicos...</div>
              ) : jobRequirements.length > 0 && (
                <div>
                  <h3 className="font-semibold text-lg mb-3">Requisitos da Vaga</h3>
                  <div className="space-y-3">
                    {jobRequirements.map((requirement: any) => {
                      const levels = Array.isArray(requirement.proficiencyLevels) ? requirement.proficiencyLevels : [];
                      const isMandatory = requirement.requirementType === 'mandatory';

                      return (
                        <div key={requirement.id} className="border rounded-lg p-4 space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-semibold">{requirement.title}</span>
                            <Badge variant={isMandatory ? 'destructive' : 'secondary'}>
                              {isMandatory ? 'Obrigatório' : 'Desejável'}
                            </Badge>
                            {requirement.category && (
                              <Badge variant="outline">{requirement.category}</Badge>
                            )}
                          </div>
                          {requirement.description && (
                            <p className="text-sm text-muted-foreground">{requirement.description}</p>
                          )}
                          {levels.length > 0 && (
                            <div className="flex flex-wrap gap-2 pt-1">
                              {levels.map((level: any, idx: number) => (
                                <Badge key={idx} variant="outline">
                                  {level.level}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {job.benefits && (
                <div>
                  <h3 className="font-semibold text-lg mb-2">Benefícios</h3>
                  <p className="whitespace-pre-wrap text-muted-foreground">{job.benefits}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Dialog de Candidatura */}
        <Dialog open={isApplyDialogOpen} onOpenChange={setIsApplyDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {applicationSuccess ? 'Candidatura Enviada!' : `Candidatar-se: ${selectedJob?.title}`}
              </DialogTitle>
            </DialogHeader>
            
            {applicationSuccess ? (
              <div className="text-center py-8">
                <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Candidatura enviada com sucesso!</h3>
                <p className="text-muted-foreground mb-6">
                  Recebemos sua candidatura e entraremos em contato em breve.
                </p>
                <Button onClick={() => setIsApplyDialogOpen(false)}>
                  Fechar
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmitApplication} className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome Completo *</Label>
                  <Input
                    id="name"
                    name="name"
                    required
                    placeholder="Seu nome completo"
                    data-testid="input-applicant-name"
                  />
                </div>

                <div>
                  <Label htmlFor="email">E-mail *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="seu@email.com"
                    data-testid="input-applicant-email"
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Telefone *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    required
                    placeholder="(00) 00000-0000"
                    data-testid="input-applicant-phone"
                  />
                </div>

                <div>
                  <Label htmlFor="resume">Link do Currículo</Label>
                  <Input
                    id="resume"
                    name="resume"
                    type="url"
                    placeholder="https://..."
                    data-testid="input-applicant-resume"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Link para Google Drive, Dropbox, LinkedIn, etc.
                  </p>
                </div>

                <div>
                  <Label htmlFor="coverLetter">Carta de Apresentação</Label>
                  <Textarea
                    id="coverLetter"
                    name="coverLetter"
                    placeholder="Conte um pouco sobre você e por que quer trabalhar conosco..."
                    rows={4}
                    data-testid="input-cover-letter"
                  />
                </div>

                {/* Seção de Requisitos */}
                {requirementsLoading ? (
                  <div className="py-4 text-center text-sm text-muted-foreground">
                    Carregando requisitos...
                  </div>
                ) : jobRequirements.length > 0 && (
                  <div className="border-t pt-4 space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Requisitos da Vaga</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Avalie seu nível de conhecimento em cada requisito abaixo. Isso nos ajudará a entender melhor seu perfil.
                      </p>
                    </div>

                    {jobRequirements.map((requirement: any) => {
                      const levels = requirement.proficiencyLevels || [];
                      const isMandatory = requirement.requirementType === 'mandatory';
                      
                      return (
                        <div key={requirement.id} className="space-y-2">
                          <Label htmlFor={`requirement-${requirement.id}`}>
                            {requirement.title}
                            {isMandatory && <span className="text-red-500 ml-1">*</span>}
                          </Label>
                          {requirement.description && (
                            <p className="text-sm text-muted-foreground">{requirement.description}</p>
                          )}
                          <Select
                            value={requirementResponses[requirement.id] || ''}
                            onValueChange={(value) => {
                              setRequirementResponses(prev => ({
                                ...prev,
                                [requirement.id]: value
                              }));
                            }}
                            required={isMandatory}
                          >
                            <SelectTrigger 
                              id={`requirement-${requirement.id}`}
                              data-testid={`select-requirement-${requirement.id}`}
                            >
                              <SelectValue placeholder="Selecione seu nível" />
                            </SelectTrigger>
                            <SelectContent>
                              {levels.map((level: any, idx: number) => (
                                <SelectItem 
                                  key={idx} 
                                  value={level.level}
                                  data-testid={`requirement-${requirement.id}-level-${level.level}`}
                                >
                                  {level.level}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsApplyDialogOpen(false)}
                    data-testid="button-cancel-apply"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={applyMutation.isPending}
                    data-testid="button-submit-application"
                  >
                    {applyMutation.isPending ? "Enviando..." : "Enviar Candidatura"}
                  </Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Lista de vagas
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-slate-900 dark:to-slate-900">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm shadow-xl border-b border-orange-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <img src={rhnetLogo} alt="RHNet" className="h-16 w-16 mr-3 rounded-lg" />
              <h1 className="text-2xl font-bold text-[hsl(215,80%,25%)]">Trabalhe Conosco</h1>
            </div>
            <Button 
              onClick={() => window.location.href = '/'} 
              variant="outline"
              className="border-orange-600 text-orange-600 hover:bg-orange-50"
              data-testid="button-home"
            >
              <Home className="mr-2 h-4 w-4" />
              Página Inicial
            </Button>
          </div>
        </div>
      </header>
      
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <p className="text-xl text-muted-foreground">
            Encontre a vaga perfeita para você
          </p>
        </div>

        {/* Filtros */}
        <Card className="mb-8 max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="filter-title">Cargo</Label>
                <Input
                  id="filter-title"
                  placeholder="Buscar por cargo..."
                  value={filterTitle}
                  onChange={(e) => setFilterTitle(e.target.value)}
                  data-testid="filter-title"
                />
              </div>
              
              <div>
                <Label htmlFor="filter-location">Cidade</Label>
                <Select value={filterLocation} onValueChange={(value) => setFilterLocation(value === 'all' ? '' : value)}>
                  <SelectTrigger id="filter-location" data-testid="filter-location">
                    <SelectValue placeholder="Todas as cidades" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as cidades</SelectItem>
                    {uniqueLocations.map((location: string) => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="filter-employment-type">Tipo de Emprego</Label>
                <Select value={filterEmploymentType} onValueChange={(value) => setFilterEmploymentType(value === 'all' ? '' : value)}>
                  <SelectTrigger id="filter-employment-type" data-testid="filter-employment-type">
                    <SelectValue placeholder="Todos os tipos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os tipos</SelectItem>
                    {uniqueEmploymentTypes.map((type: string) => (
                      <SelectItem key={type} value={type}>
                        {getEmploymentTypeLabel(type)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {(filterLocation || filterEmploymentType || filterTitle) && (
              <div className="mt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFilterLocation('');
                    setFilterEmploymentType('');
                    setFilterTitle('');
                  }}
                  data-testid="button-clear-filters"
                >
                  Limpar Filtros
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {filteredJobs.length === 0 ? (
          <Card className="max-w-4xl mx-auto">
            <CardContent className="py-12 text-center">
              <Briefcase className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p className="text-lg text-muted-foreground">
                {jobs.length === 0 
                  ? "Não há vagas abertas no momento" 
                  : "Nenhuma vaga encontrada com esses filtros"}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                {jobs.length === 0 
                  ? "Volte em breve para conferir novas oportunidades"
                  : "Tente ajustar os filtros para ver mais vagas"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 max-w-4xl mx-auto">
            {filteredJobs.map((job: any) => (
              <Card key={job.id} className="hover:shadow-lg transition-shadow" data-testid={`job-card-${job.id}`}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-2xl mb-2">{job.title}</CardTitle>
                      {job.companyName && (
                        <p className="text-sm font-medium text-muted-foreground mb-2">
                          <Briefcase className="inline h-4 w-4 mr-1" />
                          {job.companyName}
                        </p>
                      )}
                      <CardDescription className="text-base line-clamp-2">
                        {job.description}
                      </CardDescription>
                      <div className="flex gap-2 mt-3 flex-wrap">
                        {job.employmentType && (
                          <Badge variant="outline">{getEmploymentTypeLabel(job.employmentType)}</Badge>
                        )}
                        {job.experienceLevel && (
                          <Badge variant="outline">{getExperienceLevelLabel(job.experienceLevel)}</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4 flex-wrap text-sm text-muted-foreground mb-4">
                    {job.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{job.location}</span>
                      </div>
                    )}
                    {job.salaryRange && (
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        <span>{job.salaryRange}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => window.location.href = `/vagas/${job.id}`}
                      variant="outline"
                      data-testid={`button-view-${job.id}`}
                    >
                      Ver Detalhes
                    </Button>
                    <Button 
                      onClick={() => handleApply(job)}
                      data-testid={`button-apply-${job.id}`}
                    >
                      <Send className="mr-2 h-4 w-4" />
                      Candidatar-se
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Dialog de Candidatura */}
      <Dialog open={isApplyDialogOpen} onOpenChange={setIsApplyDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {applicationSuccess ? 'Candidatura Enviada!' : `Candidatar-se: ${selectedJob?.title}`}
            </DialogTitle>
          </DialogHeader>
          
          {applicationSuccess ? (
            <div className="text-center py-8">
              <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Candidatura enviada com sucesso!</h3>
              <p className="text-muted-foreground mb-6">
                Recebemos sua candidatura e entraremos em contato em breve.
              </p>
              <Button onClick={() => setIsApplyDialogOpen(false)}>
                Fechar
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmitApplication} className="space-y-4">
              <div>
                <Label htmlFor="name">Nome Completo *</Label>
                <Input
                  id="name"
                  name="name"
                  required
                  placeholder="Seu nome completo"
                  data-testid="input-applicant-name"
                />
              </div>

              <div>
                <Label htmlFor="email">E-mail *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="seu@email.com"
                  data-testid="input-applicant-email"
                />
              </div>

              <div>
                <Label htmlFor="phone">Telefone *</Label>
                <Input
                  id="phone"
                  name="phone"
                  required
                  placeholder="(00) 00000-0000"
                  data-testid="input-applicant-phone"
                />
              </div>

              <div>
                <Label htmlFor="resume">Link do Currículo</Label>
                <Input
                  id="resume"
                  name="resume"
                  type="url"
                  placeholder="https://..."
                  data-testid="input-applicant-resume"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Link para Google Drive, Dropbox, LinkedIn, etc.
                </p>
              </div>

              <div>
                <Label htmlFor="coverLetter">Carta de Apresentação</Label>
                <Textarea
                  id="coverLetter"
                  name="coverLetter"
                  placeholder="Conte um pouco sobre você e por que quer trabalhar conosco..."
                  rows={4}
                  data-testid="input-cover-letter"
                />
              </div>

              {/* Seção de Requisitos */}
              {requirementsLoading ? (
                <div className="py-4 text-center text-sm text-muted-foreground">
                  Carregando requisitos...
                </div>
              ) : jobRequirements.length > 0 && (
                <div className="border-t pt-4 space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Requisitos da Vaga</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Avalie seu nível de conhecimento em cada requisito abaixo. Isso nos ajudará a entender melhor seu perfil.
                    </p>
                  </div>

                  {jobRequirements.map((requirement: any) => {
                    const levels = requirement.proficiencyLevels || [];
                    const isMandatory = requirement.requirementType === 'mandatory';
                    
                    return (
                      <div key={requirement.id} className="space-y-2">
                        <Label htmlFor={`requirement-${requirement.id}`}>
                          {requirement.title}
                          {isMandatory && <span className="text-red-500 ml-1">*</span>}
                        </Label>
                        {requirement.description && (
                          <p className="text-sm text-muted-foreground">{requirement.description}</p>
                        )}
                        <Select
                          value={requirementResponses[requirement.id] || ''}
                          onValueChange={(value) => {
                            setRequirementResponses(prev => ({
                              ...prev,
                              [requirement.id]: value
                            }));
                          }}
                          required={isMandatory}
                        >
                          <SelectTrigger 
                            id={`requirement-${requirement.id}`}
                            data-testid={`select-requirement-${requirement.id}`}
                          >
                            <SelectValue placeholder="Selecione seu nível" />
                          </SelectTrigger>
                          <SelectContent>
                            {levels.map((level: any, idx: number) => (
                              <SelectItem 
                                key={idx} 
                                value={level.level}
                                data-testid={`requirement-${requirement.id}-level-${level.level}`}
                              >
                                {level.level}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* DISC Assessment Section - Only show if required during application */}
              {discRequired && (
                <div className="border-t pt-6 mt-6 space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Teste DISC de Personalidade (Obrigatório)</h3>
                    <p className="text-sm text-muted-foreground">
                      Para esta vaga, pedimos que você complete o teste DISC. 
                      Avalie cada afirmação de 1 (discordo totalmente) a 5 (concordo totalmente).
                    </p>
                  </div>

                  {discQuestionsLoading ? (
                    <p className="text-sm text-muted-foreground">Carregando questões...</p>
                  ) : discQuestionsError ? (
                    <div className="p-4 border border-red-200 rounded-lg bg-red-50 space-y-3">
                      <p className="text-sm text-red-800">
                        Erro ao carregar questões do teste DISC. Por favor, tente novamente.
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => refetchDiscQuestions()}
                        data-testid="button-retry-disc"
                      >
                        Tentar Novamente
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {discQuestions.map((question, index) => (
                        <div key={question.id} className="space-y-2 p-4 border rounded-lg">
                          <Label className="text-sm font-medium">
                            {index + 1}. {question.questionText}
                          </Label>
                          <div className="flex gap-2 justify-between items-center">
                            <span className="text-xs text-muted-foreground">Discordo totalmente</span>
                            <div className="flex gap-2">
                              {[1, 2, 3, 4, 5].map((value) => (
                                <Button
                                  key={value}
                                  type="button"
                                  variant={discResponses[question.id] === value ? "default" : "outline"}
                                  size="sm"
                                  className="w-10 h-10"
                                  onClick={() => {
                                    setDiscResponses(prev => ({
                                      ...prev,
                                      [question.id]: Number(value)
                                    }));
                                  }}
                                  data-testid={`button-disc-${question.id}-${value}`}
                                >
                                  {value}
                                </Button>
                              ))}
                            </div>
                            <span className="text-xs text-muted-foreground">Concordo totalmente</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Progress Indicator */}
                  {discQuestions.length > 0 && (
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <span className="text-sm font-medium">Progresso do Teste DISC:</span>
                      <Badge 
                        variant={discComplete ? "default" : "secondary"}
                        className={discComplete ? "bg-green-600 hover:bg-green-700" : ""}
                      >
                        {discComplete && <Check className="h-3 w-3 mr-1" />}
                        {discAnsweredCount} de {discQuestionsCount} questões
                      </Badge>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsApplyDialogOpen(false)}
                  data-testid="button-cancel-apply"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  className={discRequired && discComplete ? "bg-green-600 hover:bg-green-700" : ""}
                  disabled={
                    applyMutation.isPending || 
                    (discRequired && (discQuestionsLoading || !!discQuestionsError || !discComplete))
                  }
                  data-testid="button-submit-application"
                >
                  {applyMutation.isPending ? (
                    "Enviando..."
                  ) : discRequired && discComplete ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Teste DISC Completo - Enviar Candidatura
                    </>
                  ) : (
                    "Enviar Candidatura"
                  )}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
