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
  Trash2
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
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: jobOpenings = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/job-openings'],
    refetchOnMount: 'always',
  });

  const { data: candidates = [] } = useQuery<any[]>({
    queryKey: ['/api/candidates'],
  });

  const { data: onboardingLinks = [] } = useQuery<any[]>({
    queryKey: ['/api/onboarding-links'],
  });

  const createJobMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('/api/job-openings', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: async () => {
      queryClient.resetQueries({ queryKey: ['/api/job-openings'] });
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
      queryClient.resetQueries({ queryKey: ['/api/job-openings'] });
      toast({
        title: "Vaga publicada!",
        description: "A vaga está agora visível para candidatos.",
      });
    },
  });

  const updateJobMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return await apiRequest(`/api/job-openings/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },
    onSuccess: async () => {
      queryClient.resetQueries({ queryKey: ['/api/job-openings'] });
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
      queryClient.resetQueries({ queryKey: ['/api/job-openings'] });
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

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      draft: { variant: "outline", label: "Rascunho" },
      published: { variant: "default", label: "Publicada" },
      closed: { variant: "destructive", label: "Encerrada" },
    };
    const config = variants[status] || variants.draft;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <img src={rhnetLogo} alt="RHNet" className="h-10 w-10 rounded-lg" />
              <div>
                <h1 className="text-2xl font-bold text-[hsl(215,80%,25%)]">Recrutamento & Seleção</h1>
                <p className="text-sm text-muted-foreground">
                  Gerencie vagas, candidatos e processos seletivos
                </p>
              </div>
            </div>
            <Button 
              onClick={() => window.location.href = '/'} 
              variant="outline"
              className="border-blue-600 text-blue-600 hover:bg-blue-50"
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
                  <Select name="employmentType" defaultValue="full_time">
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
                <Select name="experienceLevel" defaultValue="mid">
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
                    <Select name="employmentType" defaultValue={selectedJob.employmentType}>
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
                  <Select name="experienceLevel" defaultValue={selectedJob.experienceLevel}>
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
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              <ClipboardList className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>Gestão de candidaturas em desenvolvimento</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="onboarding" className="space-y-4">
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              <LinkIcon className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>Admissão digital em desenvolvimento</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
}
