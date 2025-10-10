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
  XCircle
} from 'lucide-react';
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
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Recrutamento & Seleção</h1>
          <p className="text-muted-foreground">
            Gerencie vagas, candidatos e processos seletivos
          </p>
        </div>
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
                        <Button size="sm" variant="outline" data-testid={`button-view-${job.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          Ver
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
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              <Users className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>Gestão de candidatos em desenvolvimento</p>
            </CardContent>
          </Card>
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
  );
}
