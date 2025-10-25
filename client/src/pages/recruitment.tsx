import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Briefcase, 
  Users, 
  ClipboardList, 
  Link as LinkIcon,
  Calendar,
  MapPin,
  DollarSign,
  Eye,
  Edit,
  Share2,
  CheckCircle,
  XCircle,
  Home,
  Trash2,
  UserPlus,
  Clock,
  FileText,
  Send
} from 'lucide-react';
import rhnetLogo from "@assets/rhnetp_1757765662344.jpg";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from '@/lib/queryClient';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Recruitment() {
  const [activeTab, setActiveTab] = useState('jobs');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [createEmploymentType, setCreateEmploymentType] = useState('full_time');
  const [createExperienceLevel, setCreateExperienceLevel] = useState('mid');
  const [editEmploymentType, setEditEmploymentType] = useState('full_time');
  const [editExperienceLevel, setEditExperienceLevel] = useState('mid');
  const [isCreateApplicationDialogOpen, setIsCreateApplicationDialogOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [isViewApplicationDialogOpen, setIsViewApplicationDialogOpen] = useState(false);
  const [selectedJobForApplication, setSelectedJobForApplication] = useState<number>(0);
  const [selectedCandidateForApplication, setSelectedCandidateForApplication] = useState<number>(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: jobOpenings = [], isLoading, refetch } = useQuery<any[]>({
    queryKey: ['/api/job-openings'],
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const { data: candidates = [] } = useQuery<any[]>({
    queryKey: ['/api/candidates'],
  });

  const { data: onboardingLinks = [] } = useQuery<any[]>({
    queryKey: ['/api/onboarding-links'],
  });

  const { data: allApplications = [] } = useQuery<any[]>({
    queryKey: ['/api/applications/all'],
    enabled: activeTab === 'applications',
  });

  const createJobMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('/api/job-openings', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['/api/job-openings'] });
      await refetch();
      setIsCreateDialogOpen(false);
      toast({
        title: "Vaga criada com sucesso!",
        description: "A vaga foi adicionada ao sistema.",
      });
    },
    onError: () => {
      toast({
        title: "Erro ao criar vaga",
        description: "Não foi possível criar a vaga. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const publishJobMutation = useMutation({
    mutationFn: async (jobId: number) => {
      return await apiRequest(`/api/job-openings/${jobId}/publish`, {
        method: 'POST',
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['/api/job-openings'] });
      await refetch();
      toast({
        title: "Vaga publicada!",
        description: "A vaga está agora visível para candidatos.",
      });
    },
  });

  const updateJobMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return await apiRequest(`/api/job-openings/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['/api/job-openings'] });
      await refetch();
      setIsEditDialogOpen(false);
      setSelectedJob(null);
      toast({
        title: "Vaga atualizada!",
        description: "As alterações foram salvas com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro ao atualizar vaga",
        description: "Não foi possível atualizar a vaga. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const deleteJobMutation = useMutation({
    mutationFn: async (jobId: number) => {
      return await apiRequest(`/api/job-openings/${jobId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['/api/job-openings'] });
      await refetch();
      toast({
        title: "Vaga excluída!",
        description: "A vaga foi removida do sistema.",
      });
    },
    onError: () => {
      toast({
        title: "Erro ao excluir vaga",
        description: "Não foi possível excluir a vaga. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const createApplicationMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('/api/applications', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['/api/applications/all'] });
      setIsCreateApplicationDialogOpen(false);
      setSelectedJobForApplication(0);
      setSelectedCandidateForApplication(0);
      toast({
        title: "Candidatura criada!",
        description: "O candidato foi vinculado à vaga com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro ao criar candidatura",
        description: "Não foi possível vincular o candidato à vaga.",
        variant: "destructive",
      });
    },
  });

  const updateApplicationMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return await apiRequest(`/api/applications/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['/api/applications/all'] });
      toast({
        title: "Status atualizado!",
        description: "O status da candidatura foi atualizado com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro ao atualizar status",
        description: "Não foi possível atualizar o status. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const handleCreateJob = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    createJobMutation.mutate({
      title: formData.get('title'),
      description: formData.get('description'),
      requirements: formData.get('requirements'),
      location: formData.get('location'),
      employmentType: formData.get('employmentType'),
      salaryMin: formData.get('salaryMin') ? parseFloat(formData.get('salaryMin') as string) : null,
      salaryMax: formData.get('salaryMax') ? parseFloat(formData.get('salaryMax') as string) : null,
      experienceLevel: formData.get('experienceLevel'),
      status: 'draft',
    });
  };

  const handleUpdateJob = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    updateJobMutation.mutate({
      id: selectedJob.id,
      data: {
        title: formData.get('title'),
        description: formData.get('description'),
        requirements: formData.get('requirements'),
        location: formData.get('location'),
        employmentType: formData.get('employmentType'),
        salaryMin: formData.get('salaryMin') ? parseFloat(formData.get('salaryMin') as string) : null,
        salaryMax: formData.get('salaryMax') ? parseFloat(formData.get('salaryMax') as string) : null,
        experienceLevel: formData.get('experienceLevel'),
      },
    });
  };

  const handleEditJob = (job: any) => {
    setSelectedJob(job);
    setEditEmploymentType(job.employmentType || 'full_time');
    setEditExperienceLevel(job.experienceLevel || 'mid');
    setIsEditDialogOpen(true);
  };

  const handleViewJob = (job: any) => {
    setSelectedJob(job);
    setIsViewDialogOpen(true);
  };

  const handleDeleteJob = (jobId: number) => {
    if (confirm('Tem certeza que deseja excluir esta vaga?')) {
      deleteJobMutation.mutate(jobId);
    }
  };

  const handleCreateApplication = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    createApplicationMutation.mutate({
      jobOpeningId: parseInt(formData.get('jobOpeningId') as string),
      candidateId: parseInt(formData.get('candidateId') as string),
      status: 'applied',
      screeningNotes: formData.get('notes') || '',
    });
  };

  const handleUpdateApplicationStatus = (applicationId: number, newStatus: string) => {
    updateApplicationMutation.mutate({
      id: applicationId,
      data: { status: newStatus }
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      draft: { variant: "outline", label: "Rascunho" },
      published: { variant: "default", label: "Publicada" },
      closed: { variant: "destructive", label: "Encerrada" },
    };
    const config = variants[status] || variants.draft;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getApplicationStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      applied: { variant: "outline", label: "Candidatura Enviada", className: "border-[hsl(175,65%,45%)] text-[hsl(175,65%,35%)]" },
      screening: { variant: "default", label: "Em Triagem", className: "bg-[hsl(220,65%,18%)]" },
      interview: { variant: "default", label: "Entrevista", className: "bg-[hsl(175,65%,45%)]" },
      test: { variant: "default", label: "Teste/Avaliação", className: "bg-[hsl(220,50%,35%)]" },
      approved: { variant: "default", label: "Aprovado", className: "bg-green-600" },
      rejected: { variant: "destructive", label: "Reprovado" },
      hired: { variant: "default", label: "Contratado", className: "bg-green-700" },
    };
    const config = variants[status] || variants.applied;
    return <Badge variant={config.variant} className={config.className}>{config.label}</Badge>;
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-gradient-to-r from-[hsl(220,65%,18%)] to-[hsl(175,65%,45%)] shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <img src={rhnetLogo} alt="RHNet" className="h-10 w-10 rounded-lg" />
              <div>
                <h1 className="text-2xl font-bold text-white">Recrutamento & Seleção</h1>
                <p className="text-sm text-white/90">
                  Gerencie vagas, candidatos e processos seletivos
                </p>
              </div>
            </div>
            <Button 
              onClick={() => window.location.href = '/'} 
              variant="ghost"
              className="text-white/90 hover:text-white hover:bg-white/10"
              data-testid="button-home"
            >
              <Home className="mr-2 h-4 w-4" />
              Voltar ao Início
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-6 space-y-6">
        <div className="flex justify-end items-center">
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-job">
              <Plus className="mr-2 h-4 w-4" />
              Nova Vaga
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Criar Nova Vaga</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateJob} className="space-y-4">
              <div>
                <Label htmlFor="title">Título da Vaga *</Label>
                <Input
                  id="title"
                  name="title"
                  required
                  placeholder="Ex: Analista de RH"
                  data-testid="input-job-title"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Descrição *</Label>
                <Textarea
                  id="description"
                  name="description"
                  required
                  placeholder="Descreva as responsabilidades e atividades da vaga..."
                  rows={4}
                  data-testid="input-job-description"
                />
              </div>

              <div>
                <Label htmlFor="requirements">Requisitos *</Label>
                <Textarea
                  id="requirements"
                  name="requirements"
                  required
                  placeholder="Liste os requisitos necessários..."
                  rows={3}
                  data-testid="input-job-requirements"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="location">Localização</Label>
                  <Input
                    id="location"
                    name="location"
                    placeholder="Ex: São Paulo - SP"
                    data-testid="input-job-location"
                  />
                </div>

                <div>
                  <Label htmlFor="employmentType">Tipo de Contrato</Label>
                  <Select 
                    value={createEmploymentType} 
                    onValueChange={setCreateEmploymentType}
                  >
                    <SelectTrigger data-testid="select-employment-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full_time">Tempo Integral</SelectItem>
                      <SelectItem value="part_time">Meio Período</SelectItem>
                      <SelectItem value="contract">Contrato</SelectItem>
                      <SelectItem value="temporary">Temporário</SelectItem>
                      <SelectItem value="internship">Estágio</SelectItem>
                    </SelectContent>
                  </Select>
                  <input type="hidden" name="employmentType" value={createEmploymentType} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="salaryMin">Salário Mínimo (R$)</Label>
                  <Input
                    id="salaryMin"
                    name="salaryMin"
                    type="number"
                    step="0.01"
                    placeholder="Ex: 3000.00"
                    data-testid="input-salary-min"
                  />
                </div>

                <div>
                  <Label htmlFor="salaryMax">Salário Máximo (R$)</Label>
                  <Input
                    id="salaryMax"
                    name="salaryMax"
                    type="number"
                    step="0.01"
                    placeholder="Ex: 5000.00"
                    data-testid="input-salary-max"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="experienceLevel">Nível de Experiência</Label>
                <Select 
                  value={createExperienceLevel} 
                  onValueChange={setCreateExperienceLevel}
                >
                  <SelectTrigger data-testid="select-experience-level">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entry">Júnior</SelectItem>
                    <SelectItem value="mid">Pleno</SelectItem>
                    <SelectItem value="senior">Sênior</SelectItem>
                    <SelectItem value="lead">Especialista</SelectItem>
                  </SelectContent>
                </Select>
                <input type="hidden" name="experienceLevel" value={createExperienceLevel} />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                  data-testid="button-cancel"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={createJobMutation.isPending}
                  data-testid="button-submit-job"
                >
                  {createJobMutation.isPending ? "Criando..." : "Criar Vaga"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Dialog de Edição */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar Vaga</DialogTitle>
            </DialogHeader>
            {selectedJob && (
              <form onSubmit={handleUpdateJob} className="space-y-4">
                <div>
                  <Label htmlFor="edit-title">Título da Vaga *</Label>
                  <Input
                    id="edit-title"
                    name="title"
                    required
                    defaultValue={selectedJob.title}
                    data-testid="input-edit-job-title"
                  />
                </div>
                
                <div>
                  <Label htmlFor="edit-description">Descrição *</Label>
                  <Textarea
                    id="edit-description"
                    name="description"
                    required
                    defaultValue={selectedJob.description}
                    rows={4}
                    data-testid="input-edit-job-description"
                  />
                </div>

                <div>
                  <Label htmlFor="edit-requirements">Requisitos *</Label>
                  <Textarea
                    id="edit-requirements"
                    name="requirements"
                    required
                    defaultValue={selectedJob.requirements}
                    rows={3}
                    data-testid="input-edit-job-requirements"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-location">Localização</Label>
                    <Input
                      id="edit-location"
                      name="location"
                      defaultValue={selectedJob.location}
                      data-testid="input-edit-job-location"
                    />
                  </div>

                  <div>
                    <Label htmlFor="edit-employmentType">Tipo de Contrato</Label>
                    <Select 
                      value={editEmploymentType} 
                      onValueChange={setEditEmploymentType}
                    >
                      <SelectTrigger data-testid="select-edit-employment-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full_time">Tempo Integral</SelectItem>
                        <SelectItem value="part_time">Meio Período</SelectItem>
                        <SelectItem value="contract">Contrato</SelectItem>
                        <SelectItem value="temporary">Temporário</SelectItem>
                        <SelectItem value="internship">Estágio</SelectItem>
                      </SelectContent>
                    </Select>
                    <input type="hidden" name="employmentType" value={editEmploymentType} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-salaryMin">Salário Mínimo (R$)</Label>
                    <Input
                      id="edit-salaryMin"
                      name="salaryMin"
                      type="number"
                      step="0.01"
                      defaultValue={selectedJob.salaryMin || ''}
                      data-testid="input-edit-salary-min"
                    />
                  </div>

                  <div>
                    <Label htmlFor="edit-salaryMax">Salário Máximo (R$)</Label>
                    <Input
                      id="edit-salaryMax"
                      name="salaryMax"
                      type="number"
                      step="0.01"
                      defaultValue={selectedJob.salaryMax || ''}
                      data-testid="input-edit-salary-max"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="edit-experienceLevel">Nível de Experiência</Label>
                  <Select 
                    value={editExperienceLevel} 
                    onValueChange={setEditExperienceLevel}
                  >
                    <SelectTrigger data-testid="select-edit-experience-level">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="entry">Júnior</SelectItem>
                      <SelectItem value="mid">Pleno</SelectItem>
                      <SelectItem value="senior">Sênior</SelectItem>
                      <SelectItem value="lead">Especialista</SelectItem>
                    </SelectContent>
                  </Select>
                  <input type="hidden" name="experienceLevel" value={editExperienceLevel} />
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsEditDialogOpen(false);
                      setSelectedJob(null);
                    }}
                    data-testid="button-cancel-edit"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={updateJobMutation.isPending}
                    data-testid="button-submit-edit"
                  >
                    {updateJobMutation.isPending ? "Salvando..." : "Salvar Alterações"}
                  </Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>

        {/* Dialog de Visualização */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Detalhes da Vaga</DialogTitle>
            </DialogHeader>
            {selectedJob && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold mb-2">{selectedJob.title}</h3>
                  <div className="flex gap-2 mb-4">
                    {getStatusBadge(selectedJob.status)}
                    {selectedJob.employmentType && (
                      <Badge variant="outline">{selectedJob.employmentType}</Badge>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Descrição</h4>
                  <p className="text-muted-foreground whitespace-pre-wrap">{selectedJob.description}</p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Requisitos</h4>
                  <p className="text-muted-foreground whitespace-pre-wrap">{selectedJob.requirements}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {selectedJob.location && (
                    <div>
                      <h4 className="font-semibold mb-1">Localização</h4>
                      <p className="text-muted-foreground">{selectedJob.location}</p>
                    </div>
                  )}
                  {selectedJob.experienceLevel && (
                    <div>
                      <h4 className="font-semibold mb-1">Nível de Experiência</h4>
                      <p className="text-muted-foreground capitalize">{selectedJob.experienceLevel}</p>
                    </div>
                  )}
                </div>

                {(selectedJob.salaryMin || selectedJob.salaryMax) && (
                  <div>
                    <h4 className="font-semibold mb-1">Faixa Salarial</h4>
                    <p className="text-muted-foreground">
                      {selectedJob.salaryMin && selectedJob.salaryMax
                        ? `R$ ${selectedJob.salaryMin} - R$ ${selectedJob.salaryMax}`
                        : selectedJob.salaryMin
                        ? `A partir de R$ ${selectedJob.salaryMin}`
                        : `Até R$ ${selectedJob.salaryMax}`}
                    </p>
                  </div>
                )}

                {selectedJob.publishedAt && (
                  <div>
                    <h4 className="font-semibold mb-1">Data de Publicação</h4>
                    <p className="text-muted-foreground">
                      {new Date(selectedJob.publishedAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsViewDialogOpen(false);
                      setSelectedJob(null);
                    }}
                    data-testid="button-close-view"
                  >
                    Fechar
                  </Button>
                  <Button
                    onClick={() => {
                      setIsViewDialogOpen(false);
                      handleEditJob(selectedJob);
                    }}
                    data-testid="button-edit-from-view"
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Editar
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="jobs" data-testid="tab-jobs">
            <Briefcase className="mr-2 h-4 w-4" />
            Vagas ({jobOpenings.length})
          </TabsTrigger>
          <TabsTrigger value="candidates" data-testid="tab-candidates">
            <Users className="mr-2 h-4 w-4" />
            Candidatos ({candidates.length})
          </TabsTrigger>
          <TabsTrigger value="applications" data-testid="tab-applications">
            <ClipboardList className="mr-2 h-4 w-4" />
            Candidaturas
          </TabsTrigger>
          <TabsTrigger value="onboarding" data-testid="tab-onboarding">
            <LinkIcon className="mr-2 h-4 w-4" />
            Admissão Digital ({onboardingLinks.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="jobs" className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">Carregando vagas...</div>
          ) : jobOpenings.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                <Briefcase className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>Nenhuma vaga cadastrada</p>
                <p className="text-sm">Clique em "Nova Vaga" para começar</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {jobOpenings.map((job: any) => (
                <Card key={job.id} data-testid={`card-job-${job.id}`}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl" data-testid={`text-job-title-${job.id}`}>
                          {job.title}
                        </CardTitle>
                        <div className="flex gap-2 mt-2">
                          {getStatusBadge(job.status)}
                          {job.employmentType && (
                            <Badge variant="outline">{job.employmentType}</Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {job.status === 'draft' && (
                          <Button
                            size="sm"
                            onClick={() => publishJobMutation.mutate(job.id)}
                            disabled={publishJobMutation.isPending}
                            data-testid={`button-publish-${job.id}`}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Publicar
                          </Button>
                        )}
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleViewJob(job)}
                          data-testid={`button-view-${job.id}`}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Ver
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleEditJob(job)}
                          data-testid={`button-edit-${job.id}`}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => handleDeleteJob(job.id)}
                          disabled={deleteJobMutation.isPending}
                          data-testid={`button-delete-${job.id}`}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Excluir
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      {job.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{job.location}</span>
                        </div>
                      )}
                      {(job.salaryMin || job.salaryMax) && (
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {job.salaryMin && job.salaryMax
                              ? `R$ ${job.salaryMin} - R$ ${job.salaryMax}`
                              : job.salaryMin
                              ? `A partir de R$ ${job.salaryMin}`
                              : `Até R$ ${job.salaryMax}`}
                          </span>
                        </div>
                      )}
                      {job.publishedAt && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>
                            Publicada em{' '}
                            {new Date(job.publishedAt).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="candidates" className="space-y-4">
          {candidates.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                <Users className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>Nenhum candidato cadastrado</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {candidates.map((candidate: any) => (
                <Card key={candidate.id} data-testid={`card-candidate-${candidate.id}`}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle data-testid={`text-candidate-name-${candidate.id}`}>
                          {candidate.name}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {candidate.email}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      {candidate.phone && (
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Telefone:</span>
                          <span>{candidate.phone}</span>
                        </div>
                      )}
                      {candidate.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{candidate.location}</span>
                        </div>
                      )}
                      {candidate.resumeUrl && (
                        <div className="mt-4">
                          <a 
                            href={candidate.resumeUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline inline-flex items-center gap-2"
                          >
                            <Eye className="h-4 w-4" />
                            Ver Currículo
                          </a>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="applications" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Gerenciar Candidaturas</h2>
            <Dialog open={isCreateApplicationDialogOpen} onOpenChange={setIsCreateApplicationDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-create-application">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Vincular Candidato à Vaga
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Vincular Candidato à Vaga</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateApplication} className="space-y-4">
                  <div>
                    <Label htmlFor="jobOpeningId">Vaga *</Label>
                    <Select 
                      value={selectedJobForApplication.toString()} 
                      onValueChange={(val) => setSelectedJobForApplication(parseInt(val))}
                    >
                      <SelectTrigger data-testid="select-job-opening">
                        <SelectValue placeholder="Selecione uma vaga" />
                      </SelectTrigger>
                      <SelectContent>
                        {jobOpenings.filter(j => j.status === 'published').map((job: any) => (
                          <SelectItem key={job.id} value={job.id.toString()}>
                            {job.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <input type="hidden" name="jobOpeningId" value={selectedJobForApplication} />
                  </div>

                  <div>
                    <Label htmlFor="candidateId">Candidato *</Label>
                    <Select 
                      value={selectedCandidateForApplication.toString()} 
                      onValueChange={(val) => setSelectedCandidateForApplication(parseInt(val))}
                    >
                      <SelectTrigger data-testid="select-candidate">
                        <SelectValue placeholder="Selecione um candidato" />
                      </SelectTrigger>
                      <SelectContent>
                        {candidates.map((candidate: any) => (
                          <SelectItem key={candidate.id} value={candidate.id.toString()}>
                            {candidate.name} ({candidate.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <input type="hidden" name="candidateId" value={selectedCandidateForApplication} />
                  </div>

                  <div>
                    <Label htmlFor="notes">Observações</Label>
                    <Textarea
                      id="notes"
                      name="notes"
                      placeholder="Adicione observações sobre esta candidatura..."
                      rows={3}
                      data-testid="input-application-notes"
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsCreateApplicationDialogOpen(false)}
                      data-testid="button-cancel-application"
                    >
                      Cancelar
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={createApplicationMutation.isPending || !selectedJobForApplication || !selectedCandidateForApplication}
                      data-testid="button-submit-application"
                    >
                      {createApplicationMutation.isPending ? "Criando..." : "Criar Candidatura"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {allApplications.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                <ClipboardList className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>Nenhuma candidatura registrada</p>
                <p className="text-sm mt-2">Vincule candidatos às vagas para iniciar</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {allApplications.map((application: any) => (
                <Card key={application.id} data-testid={`card-application-${application.id}`}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg" data-testid={`text-application-title-${application.id}`}>
                          {application.candidateName}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {application.candidateEmail}
                        </p>
                        <div className="flex gap-2 mt-2">
                          {getApplicationStatusBadge(application.status)}
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Briefcase className="h-3 w-3" />
                            {application.jobTitle}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {application.candidatePhone && (
                        <div className="text-sm">
                          <span className="font-medium">Telefone:</span> {application.candidatePhone}
                        </div>
                      )}
                      {application.jobLocation && (
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{application.jobLocation}</span>
                        </div>
                      )}
                      {application.notes && (
                        <div className="text-sm">
                          <span className="font-medium">Observações:</span>
                          <p className="text-muted-foreground mt-1">{application.notes}</p>
                        </div>
                      )}
                      {application.appliedAt && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>
                            Candidatura: {new Date(application.appliedAt).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      )}
                      
                      <div className="pt-3 border-t">
                        <Label className="text-sm font-medium mb-2 block">Alterar Status:</Label>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateApplicationStatus(application.id, 'screening')}
                            disabled={application.status === 'screening'}
                            className="text-xs"
                            data-testid={`button-status-screening-${application.id}`}
                          >
                            Triagem
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateApplicationStatus(application.id, 'interview')}
                            disabled={application.status === 'interview'}
                            className="text-xs"
                            data-testid={`button-status-interview-${application.id}`}
                          >
                            Entrevista
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateApplicationStatus(application.id, 'test')}
                            disabled={application.status === 'test'}
                            className="text-xs"
                            data-testid={`button-status-test-${application.id}`}
                          >
                            Teste
                          </Button>
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleUpdateApplicationStatus(application.id, 'approved')}
                            disabled={application.status === 'approved' || application.status === 'hired'}
                            className="text-xs bg-green-600 hover:bg-green-700"
                            data-testid={`button-status-approved-${application.id}`}
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Aprovar
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleUpdateApplicationStatus(application.id, 'rejected')}
                            disabled={application.status === 'rejected'}
                            className="text-xs"
                            data-testid={`button-status-rejected-${application.id}`}
                          >
                            <XCircle className="h-3 w-3 mr-1" />
                            Reprovar
                          </Button>
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleUpdateApplicationStatus(application.id, 'hired')}
                            disabled={application.status === 'hired' || application.status !== 'approved'}
                            className="text-xs bg-green-700 hover:bg-green-800"
                            data-testid={`button-status-hired-${application.id}`}
                          >
                            <UserPlus className="h-3 w-3 mr-1" />
                            Contratar
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="onboarding" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Admissão Digital</h2>
            <p className="text-sm text-muted-foreground">
              Links de onboarding para candidatos aprovados
            </p>
          </div>

          {onboardingLinks.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                <LinkIcon className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>Nenhum link de admissão criado</p>
                <p className="text-sm mt-2">
                  Aprove candidatos e crie links de admissão para iniciar o processo de onboarding
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {onboardingLinks.map((link: any) => {
                const isExpired = new Date(link.expiresAt) < new Date();
                const statusColors: Record<string, string> = {
                  pending: "border-[hsl(175,65%,45%)] text-[hsl(175,65%,35%)] bg-[hsl(175,65%,96%)]",
                  in_progress: "border-[hsl(220,65%,18%)] text-[hsl(220,65%,18%)] bg-[hsl(220,65%,96%)]",
                  completed: "border-green-600 text-green-700 bg-green-50",
                  expired: "border-gray-400 text-gray-600 bg-gray-50"
                };
                
                return (
                  <Card key={link.id} data-testid={`card-onboarding-${link.id}`}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="text-lg" data-testid={`text-onboarding-name-${link.id}`}>
                            {link.candidateName}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            {link.candidateEmail}
                          </p>
                          <div className="flex gap-2 mt-2">
                            <Badge 
                              variant="outline" 
                              className={statusColors[isExpired ? 'expired' : link.status]}
                            >
                              {isExpired ? 'Expirado' : link.status === 'pending' ? 'Pendente' : 
                               link.status === 'in_progress' ? 'Em andamento' : 
                               link.status === 'completed' ? 'Concluído' : link.status}
                            </Badge>
                            <Badge variant="outline" className="flex items-center gap-1">
                              <Briefcase className="h-3 w-3" />
                              {link.position}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {link.candidatePhone && (
                          <div className="text-sm">
                            <span className="font-medium">Telefone:</span> {link.candidatePhone}
                          </div>
                        )}
                        {link.department && (
                          <div className="text-sm">
                            <span className="font-medium">Departamento:</span> {link.department}
                          </div>
                        )}
                        {link.startDate && (
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>
                              Início previsto: {new Date(link.startDate).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>
                            Expira em: {new Date(link.expiresAt).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                        {link.completedAt && (
                          <div className="flex items-center gap-2 text-sm text-green-600">
                            <CheckCircle className="h-4 w-4" />
                            <span>
                              Concluído em: {new Date(link.completedAt).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                        )}
                        
                        <div className="pt-3 border-t">
                          <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-md">
                            <Label className="text-xs font-medium mb-1 block">Link de Admissão:</Label>
                            <div className="flex items-center gap-2">
                              <code className="text-xs bg-white dark:bg-gray-800 p-2 rounded flex-1 break-all border">
                                {window.location.origin}/onboarding/{link.token}
                              </code>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  navigator.clipboard.writeText(`${window.location.origin}/onboarding/${link.token}`);
                                  toast({
                                    title: "Link copiado!",
                                    description: "O link de admissão foi copiado para a área de transferência.",
                                  });
                                }}
                                data-testid={`button-copy-link-${link.id}`}
                              >
                                <FileText className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => {
                                  window.open(`/onboarding/${link.token}`, '_blank');
                                }}
                                data-testid={`button-open-link-${link.id}`}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                Abrir
                              </Button>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">
                            Envie este link para o candidato preencher os dados de admissão
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
}
