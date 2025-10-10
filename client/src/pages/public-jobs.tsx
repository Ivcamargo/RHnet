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
  Filter
} from 'lucide-react';
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

export default function PublicJobs() {
  const [match, params] = useRoute('/vagas/:id');
  const [isApplyDialogOpen, setIsApplyDialogOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [applicationSuccess, setApplicationSuccess] = useState(false);
  const { toast } = useToast();
  
  // Filtros
  const [filterLocation, setFilterLocation] = useState<string>('');
  const [filterEmploymentType, setFilterEmploymentType] = useState<string>('');
  const [filterTitle, setFilterTitle] = useState<string>('');

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

  const applyMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('/api/public/apply', {
        method: 'POST',
        body: JSON.stringify(data),
      });
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
    setIsApplyDialogOpen(true);
  };

  const handleSubmitApplication = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    applyMutation.mutate({
      jobOpeningId: selectedJob.id,
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      resume: formData.get('resume'),
      coverLetter: formData.get('coverLetter'),
    });
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
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Vaga não encontrada</h1>
            <Button onClick={() => window.location.href = '/vagas'}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Ver todas as vagas
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
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
              {(job.location || job.salaryMin || job.publishedAt) && (
                <div className="flex gap-4 flex-wrap text-sm text-muted-foreground">
                  {job.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{job.location}</span>
                    </div>
                  )}
                  {(job.salaryMin || job.salaryMax) && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      <span>
                        {job.salaryMin && job.salaryMax
                          ? `R$ ${job.salaryMin.toLocaleString()} - R$ ${job.salaryMax.toLocaleString()}`
                          : job.salaryMin
                          ? `A partir de R$ ${job.salaryMin.toLocaleString()}`
                          : `Até R$ ${job.salaryMax.toLocaleString()}`}
                      </span>
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
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Trabalhe Conosco</h1>
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
                    {(job.salaryMin || job.salaryMax) && (
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        <span>
                          {job.salaryMin && job.salaryMax
                            ? `R$ ${job.salaryMin.toLocaleString()} - R$ ${job.salaryMax.toLocaleString()}`
                            : job.salaryMin
                            ? `A partir de R$ ${job.salaryMin.toLocaleString()}`
                            : `Até R$ ${job.salaryMax.toLocaleString()}`}
                        </span>
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
