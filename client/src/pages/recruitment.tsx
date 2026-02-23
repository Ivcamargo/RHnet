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
  Send,
  Brain,
  Copy,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Target,
  Award
} from 'lucide-react';
import rhnetLogo from "@assets/rhnetp_1757765662344.jpg";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from '@/lib/queryClient';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RequirementsManager, type JobRequirement } from "@/components/recruitment/RequirementsManager";
import { DISCAssessmentsPanel } from "@/components/recruitment/DISCAssessmentsPanel";
import { DISC_OPTIONS, buildIdealDiscProfile, validateDiscProfile, mapDiscValueToOption } from "@/lib/discOptions";
import Sidebar from "@/components/layout/sidebar";
import TopBar from "@/components/layout/top-bar";

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
  const [createRequiresDISC, setCreateRequiresDISC] = useState(false);
  const [createDiscTiming, setCreateDiscTiming] = useState('during_selection');
  const [createDiscD, setCreateDiscD] = useState('0');
  const [createDiscI, setCreateDiscI] = useState('0');
  const [createDiscS, setCreateDiscS] = useState('0');
  const [createDiscC, setCreateDiscC] = useState('0');
  const [editRequiresDISC, setEditRequiresDISC] = useState(false);
  const [editDiscTiming, setEditDiscTiming] = useState('during_selection');
  const [editDiscD, setEditDiscD] = useState('0');
  const [editDiscI, setEditDiscI] = useState('0');
  const [editDiscS, setEditDiscS] = useState('0');
  const [editDiscC, setEditDiscC] = useState('0');
  const [isCreateApplicationDialogOpen, setIsCreateApplicationDialogOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [isViewApplicationDialogOpen, setIsViewApplicationDialogOpen] = useState(false);
  const [selectedJobForApplication, setSelectedJobForApplication] = useState<number>(0);
  const [selectedCandidateForApplication, setSelectedCandidateForApplication] = useState<number>(0);
  const [createRequirements, setCreateRequirements] = useState<JobRequirement[]>([]);
  const [editRequirements, setEditRequirements] = useState<JobRequirement[]>([]);
  const [isCreateDISCDialogOpen, setIsCreateDISCDialogOpen] = useState(false);
  const [selectedJobForDISC, setSelectedJobForDISC] = useState<number>(0);
  const [selectedCandidateForDISC, setSelectedCandidateForDISC] = useState<number>(0);
  const [selectedAssessment, setSelectedAssessment] = useState<any>(null);
  const [isViewResultsDialogOpen, setIsViewResultsDialogOpen] = useState(false);
  const [isLoadingJobData, setIsLoadingJobData] = useState(false);
  const [jobFilter, setJobFilter] = useState<string>('all');
  const [phaseFilter, setPhaseFilter] = useState<string>('all');
  const [selectedApplicationIds, setSelectedApplicationIds] = useState<Set<number>>(new Set());
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
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

  const { data: discAssessments = [], isLoading: isLoadingDISC, isError: isErrorDISC, error: discError } = useQuery<any[]>({
    queryKey: ['/api/disc/assessments'],
    enabled: activeTab === 'disc',
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

  const deleteBulkApplicationsMutation = useMutation({
    mutationFn: async (ids: number[]) => {
      return await apiRequest('/api/applications/bulk-delete', {
        method: 'POST',
        body: JSON.stringify({ ids }),
      });
    },
    onSuccess: async (data: any) => {
      await queryClient.invalidateQueries({ queryKey: ['/api/applications/all'] });
      clearSelection();
      setIsDeleteDialogOpen(false);
      toast({
        title: "Candidaturas excluídas!",
        description: `${data.deletedCount} candidatura(s) foram removidas do sistema.`,
      });
    },
    onError: () => {
      toast({
        title: "Erro ao excluir candidaturas",
        description: "Não foi possível excluir as candidaturas. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const handleCreateJob = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      // Validate DISC profile if required
      if (createRequiresDISC && !validateDiscProfile(createDiscD, createDiscI, createDiscS, createDiscC)) {
        toast({
          title: "Perfil DISC inválido",
          description: "Pelo menos uma dimensão DISC deve ser diferente de 'Não relevante'.",
          variant: "destructive",
        });
        return;
      }

      // Prepare DISC profile data using centralized helper
      const idealDISCProfile = createRequiresDISC 
        ? buildIdealDiscProfile(createDiscD, createDiscI, createDiscS, createDiscC)
        : null;

      // First, create the job opening
      const newJobRes = await apiRequest('/api/job-openings', {
        method: 'POST',
        body: JSON.stringify({
          title: formData.get('title'),
          description: formData.get('description'),
          requirements: formData.get('requirements'),
          location: formData.get('location'),
          employmentType: formData.get('employmentType'),
          salaryMin: formData.get('salaryMin') ? parseFloat(formData.get('salaryMin') as string) : null,
          salaryMax: formData.get('salaryMax') ? parseFloat(formData.get('salaryMax') as string) : null,
          experienceLevel: formData.get('experienceLevel'),
          status: 'draft',
          requiresDISC: createRequiresDISC,
          discTiming: createRequiresDISC ? createDiscTiming : null,
          idealDISCProfile: idealDISCProfile,
        }),
      });
      const newJob = await newJobRes.json();

      // Then, create the requirements in parallel
      if (createRequirements.length > 0) {
        try {
          await Promise.all(
            createRequirements.map(requirement =>
              apiRequest(`/api/job-openings/${newJob.id}/requirements`, {
                method: 'POST',
                body: JSON.stringify({
                  ...requirement,
                  jobOpeningId: newJob.id,
                }),
              })
            )
          );
        } catch (reqError) {
          // If requirements creation fails, show warning but don't fail completely
          toast({
            title: "Vaga criada, mas com avisos",
            description: "Alguns requisitos não foram salvos. Edite a vaga para tentar novamente.",
            variant: "destructive",
          });
        }
      }

      await queryClient.invalidateQueries({ queryKey: ['/api/job-openings'] });
      await refetch();
      setIsCreateDialogOpen(false);
      setCreateRequirements([]);
      setCreateRequiresDISC(false);
      setCreateDiscTiming('during_selection');
      setCreateDiscD('0');
      setCreateDiscI('0');
      setCreateDiscS('0');
      setCreateDiscC('0');
      toast({
        title: "Vaga criada com sucesso!",
        description: `A vaga foi adicionada com ${createRequirements.length} requisito(s).`,
      });
    } catch (error) {
      toast({
        title: "Erro ao criar vaga",
        description: "Não foi possível criar a vaga. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateJob = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedJob) return; // Guard against null selectedJob
    
    const formData = new FormData(e.currentTarget);
    
    // Save previous state for rollback
    const previousRequirements = [...editRequirements];
    
    try {
      // Validate DISC profile if required
      if (editRequiresDISC && !validateDiscProfile(editDiscD, editDiscI, editDiscS, editDiscC)) {
        toast({
          title: "Perfil DISC inválido",
          description: "Pelo menos uma dimensão DISC deve ser diferente de 'Não relevante'.",
          variant: "destructive",
        });
        return;
      }

      // Prepare DISC profile data using centralized helper
      const idealDISCProfile = editRequiresDISC 
        ? buildIdealDiscProfile(editDiscD, editDiscI, editDiscS, editDiscC)
        : null;

      // First, update the job opening
      await apiRequest(`/api/job-openings/${selectedJob.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          title: formData.get('title'),
          description: formData.get('description'),
          requirements: formData.get('requirements'),
          location: formData.get('location'),
          employmentType: formData.get('employmentType'),
          salaryMin: formData.get('salaryMin') ? parseFloat(formData.get('salaryMin') as string) : null,
          salaryMax: formData.get('salaryMax') ? parseFloat(formData.get('salaryMax') as string) : null,
          experienceLevel: formData.get('experienceLevel'),
          requiresDISC: editRequiresDISC,
          discTiming: editRequiresDISC ? editDiscTiming : null,
          idealDISCProfile: idealDISCProfile,
        }),
      });

      // Atomically replace all requirements using bulk endpoint with transaction
      await apiRequest(`/api/job-openings/${selectedJob.id}/requirements/bulk`, {
        method: 'POST',
        body: JSON.stringify(editRequirements),
      });

      // Invalidate cache and wait for fresh data before closing
      await queryClient.invalidateQueries({ queryKey: ['/api/job-openings'] });
      const { data: updatedJobs } = await refetch();
      
      setIsEditDialogOpen(false);
      setSelectedJob(null);
      setEditRequirements([]);
      toast({
        title: "Vaga atualizada!",
        description: `As alterações foram salvas com ${editRequirements.length} requisito(s).`,
      });
    } catch (error: any) {
      // Rollback UI state to previous requirements
      setEditRequirements(previousRequirements);
      
      toast({
        title: "Erro ao atualizar vaga",
        description: error.message || "Não foi possível atualizar a vaga. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleEditJob = async (job: any) => {
    // Fetch fresh data from server instead of using cached list data
    setIsLoadingJobData(true);
    try {
      const jobRes = await apiRequest(`/api/job-openings/${job.id}`);
      const freshJob = await jobRes.json();
      
      setSelectedJob(freshJob);
      setEditEmploymentType(freshJob.employmentType || 'full_time');
      setEditExperienceLevel(freshJob.experienceLevel || 'mid');
      setEditRequiresDISC(freshJob.requiresDISC || false);
      setEditDiscTiming(freshJob.discTiming || 'during_selection');
      
      // Hydrate DISC values using mapper to handle legacy numeric values
      const idealProfile = freshJob.idealDISCProfile || {};
      setEditDiscD(mapDiscValueToOption(idealProfile.D).optionValue);
      setEditDiscI(mapDiscValueToOption(idealProfile.I).optionValue);
      setEditDiscS(mapDiscValueToOption(idealProfile.S).optionValue);
      setEditDiscC(mapDiscValueToOption(idealProfile.C).optionValue);
      
      // Load existing requirements
      const requirementsRes = await apiRequest(`/api/job-openings/${job.id}/requirements`);
      const requirements = await requirementsRes.json();
      setEditRequirements(requirements);
      
      setIsEditDialogOpen(true);
    } catch (error) {
      console.error("Error loading job data:", error);
      toast({
        title: "Erro ao carregar vaga",
        description: "Não foi possível carregar os dados da vaga. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingJobData(false);
    }
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

  const getScoreColor = (score: number) => {
    if (score >= 70) return { bg: "bg-green-100 dark:bg-green-950", text: "text-green-700 dark:text-green-400", border: "border-green-300 dark:border-green-800" };
    if (score >= 40) return { bg: "bg-yellow-100 dark:bg-yellow-950", text: "text-yellow-700 dark:text-yellow-400", border: "border-yellow-300 dark:border-yellow-800" };
    return { bg: "bg-red-100 dark:bg-red-950", text: "text-red-700 dark:text-red-400", border: "border-red-300 dark:border-red-800" };
  };

  const getDiscProfileLabel = (profile: string) => {
    const labels: Record<string, string> = {
      D: "Dominância",
      I: "Influência",
      S: "Estabilidade",
      C: "Conformidade"
    };
    return labels[profile] || profile;
  };

  // Filter applications by selected job and phase
  const filteredApplications = allApplications.filter((app: any) => {
    const matchesJob = jobFilter === 'all' || app.jobOpeningId === parseInt(jobFilter);
    const matchesPhase = phaseFilter === 'all' || app.status === phaseFilter;
    return matchesJob && matchesPhase;
  });

  // Functions to handle selection
  const toggleSelectApplication = (id: number) => {
    setSelectedApplicationIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedApplicationIds.size === filteredApplications.length) {
      setSelectedApplicationIds(new Set());
    } else {
      setSelectedApplicationIds(new Set(filteredApplications.map((app: any) => app.id)));
    }
  };

  const clearSelection = () => {
    setSelectedApplicationIds(new Set());
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-slate-900">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar title="Recrutamento & Seleção" />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          <div className="space-y-6">{/* Subtitle */}
            <p className="text-sm text-gray-600 dark:text-gray-400 -mt-2">
              Gerencie vagas, candidatos e processos seletivos
            </p>
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
                <Label htmlFor="requirements">Descrição Geral dos Requisitos (opcional)</Label>
                <Textarea
                  id="requirements"
                  name="requirements"
                  placeholder="Descrição geral adicional sobre os requisitos..."
                  rows={2}
                  data-testid="input-job-requirements"
                />
              </div>

              <RequirementsManager
                requirements={createRequirements}
                onChange={setCreateRequirements}
              />

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

              <div className="border-t pt-4 space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="requiresDISC"
                    checked={createRequiresDISC}
                    onCheckedChange={(checked) => setCreateRequiresDISC(checked === true)}
                    data-testid="checkbox-requires-disc"
                  />
                  <Label htmlFor="requiresDISC" className="font-semibold cursor-pointer">
                    Requer Teste DISC de Personalidade
                  </Label>
                </div>

                {createRequiresDISC && (
                  <>
                    <div>
                      <Label htmlFor="discTiming">Momento da Aplicação</Label>
                      <Select 
                        value={createDiscTiming} 
                        onValueChange={setCreateDiscTiming}
                      >
                        <SelectTrigger data-testid="select-disc-timing">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="on_application">Durante a candidatura (obrigatório)</SelectItem>
                          <SelectItem value="during_selection">Durante processo seletivo (opcional)</SelectItem>
                        </SelectContent>
                      </Select>
                      <input type="hidden" name="discTiming" value={createDiscTiming} />
                      <p className="text-sm text-muted-foreground mt-1">
                        {createDiscTiming === 'on_application' 
                          ? 'Candidato deve completar o teste DISC antes de finalizar a candidatura'
                          : 'RH pode enviar link do teste durante o processo seletivo'}
                      </p>
                    </div>

                    <div>
                      <Label className="mb-2 block">Perfil DISC Ideal</Label>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="idealD" className="text-sm text-red-600 font-semibold mb-1">D - Dominância</Label>
                          <Select value={createDiscD} onValueChange={setCreateDiscD}>
                            <SelectTrigger data-testid="select-ideal-d">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {DISC_OPTIONS.map(opt => (
                                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="idealI" className="text-sm text-yellow-600 font-semibold mb-1">I - Influência</Label>
                          <Select value={createDiscI} onValueChange={setCreateDiscI}>
                            <SelectTrigger data-testid="select-ideal-i">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {DISC_OPTIONS.map(opt => (
                                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="idealS" className="text-sm text-green-600 font-semibold mb-1">S - Estabilidade</Label>
                          <Select value={createDiscS} onValueChange={setCreateDiscS}>
                            <SelectTrigger data-testid="select-ideal-s">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {DISC_OPTIONS.map(opt => (
                                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="idealC" className="text-sm text-blue-600 font-semibold mb-1">C - Conformidade</Label>
                          <Select value={createDiscC} onValueChange={setCreateDiscC}>
                            <SelectTrigger data-testid="select-ideal-c">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {DISC_OPTIONS.map(opt => (
                                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Selecione o nível ideal para cada dimensão. Pelo menos uma deve ser diferente de "Não relevante".
                      </p>
                    </div>
                  </>
                )}
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
                  <Label htmlFor="edit-requirements">Descrição Geral dos Requisitos (opcional)</Label>
                  <Textarea
                    id="edit-requirements"
                    name="requirements"
                    defaultValue={selectedJob.requirements}
                    rows={2}
                    data-testid="input-edit-job-requirements"
                  />
                </div>

                <RequirementsManager
                  requirements={editRequirements}
                  onChange={setEditRequirements}
                />

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

                <div className="border-t pt-4 space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="edit-requiresDISC"
                      checked={editRequiresDISC}
                      onCheckedChange={(checked) => setEditRequiresDISC(checked === true)}
                      data-testid="checkbox-edit-requires-disc"
                    />
                    <Label htmlFor="edit-requiresDISC" className="font-semibold cursor-pointer">
                      Requer Teste DISC de Personalidade
                    </Label>
                  </div>

                  {editRequiresDISC && (
                    <>
                      <div>
                        <Label htmlFor="edit-discTiming">Momento da Aplicação</Label>
                        <Select 
                          value={editDiscTiming} 
                          onValueChange={setEditDiscTiming}
                        >
                          <SelectTrigger data-testid="select-edit-disc-timing">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="on_application">Durante a candidatura (obrigatório)</SelectItem>
                            <SelectItem value="during_selection">Durante processo seletivo (opcional)</SelectItem>
                          </SelectContent>
                        </Select>
                        <input type="hidden" name="discTiming" value={editDiscTiming} />
                        <p className="text-sm text-muted-foreground mt-1">
                          {editDiscTiming === 'on_application' 
                            ? 'Candidato deve completar o teste DISC antes de finalizar a candidatura'
                            : 'RH pode enviar link do teste durante o processo seletivo'}
                        </p>
                      </div>

                      <div>
                        <Label className="mb-2 block">Perfil DISC Ideal</Label>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="edit-idealD" className="text-sm text-red-600 font-semibold mb-1">D - Dominância</Label>
                            <Select value={editDiscD} onValueChange={setEditDiscD}>
                              <SelectTrigger data-testid="select-edit-ideal-d">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {DISC_OPTIONS.map(opt => (
                                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="edit-idealI" className="text-sm text-yellow-600 font-semibold mb-1">I - Influência</Label>
                            <Select value={editDiscI} onValueChange={setEditDiscI}>
                              <SelectTrigger data-testid="select-edit-ideal-i">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {DISC_OPTIONS.map(opt => (
                                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="edit-idealS" className="text-sm text-green-600 font-semibold mb-1">S - Estabilidade</Label>
                            <Select value={editDiscS} onValueChange={setEditDiscS}>
                              <SelectTrigger data-testid="select-edit-ideal-s">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {DISC_OPTIONS.map(opt => (
                                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="edit-idealC" className="text-sm text-blue-600 font-semibold mb-1">C - Conformidade</Label>
                            <Select value={editDiscC} onValueChange={setEditDiscC}>
                              <SelectTrigger data-testid="select-edit-ideal-c">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {DISC_OPTIONS.map(opt => (
                                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          Selecione o nível ideal para cada dimensão. Pelo menos uma deve ser diferente de "Não relevante".
                        </p>
                      </div>
                    </>
                  )}
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
          <TabsTrigger value="applications" data-testid="tab-applications">
            <ClipboardList className="mr-2 h-4 w-4" />
            Candidaturas
          </TabsTrigger>
          <TabsTrigger value="disc" data-testid="tab-disc">
            <Brain className="mr-2 h-4 w-4" />
            Testes DISC
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
                          disabled={isLoadingJobData}
                          data-testid={`button-edit-${job.id}`}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          {isLoadingJobData ? "Carregando..." : "Editar"}
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

        <TabsContent value="applications" className="space-y-4">
          <div className="flex flex-col gap-4 mb-4">
            <div className="flex justify-between items-center">
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

            {/* Selection Actions Bar */}
            {selectedApplicationIds.size > 0 && (
              <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-4">
                  <Checkbox
                    checked={selectedApplicationIds.size === filteredApplications.length}
                    onCheckedChange={toggleSelectAll}
                    data-testid="checkbox-select-all"
                  />
                  <span className="font-medium">
                    {selectedApplicationIds.size} candidatura(s) selecionada(s)
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearSelection}
                    data-testid="button-clear-selection"
                  >
                    Limpar seleção
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setIsDeleteDialogOpen(true)}
                    data-testid="button-delete-selected"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir Selecionados
                  </Button>
                </div>
              </div>
            )}

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="job-filter" className="text-sm font-medium mb-2 block">
                  Filtrar por Vaga
                </Label>
                <Select value={jobFilter} onValueChange={(value) => { setJobFilter(value); clearSelection(); }}>
                  <SelectTrigger id="job-filter" className="w-full" data-testid="select-job-filter">
                    <SelectValue placeholder="Todas as vagas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as vagas</SelectItem>
                    {jobOpenings.filter(j => j.status === 'published').map((job: any) => (
                      <SelectItem key={job.id} value={job.id.toString()}>
                        {job.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="phase-filter" className="text-sm font-medium mb-2 block">
                  Filtrar por Fase
                </Label>
                <Select value={phaseFilter} onValueChange={(value) => { setPhaseFilter(value); clearSelection(); }}>
                  <SelectTrigger id="phase-filter" className="w-full" data-testid="select-phase-filter">
                    <SelectValue placeholder="Todas as fases" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as fases</SelectItem>
                    <SelectItem value="applied">Candidatura Enviada</SelectItem>
                    <SelectItem value="screening">Em Triagem</SelectItem>
                    <SelectItem value="interview">Entrevista</SelectItem>
                    <SelectItem value="test">Teste/Avaliação</SelectItem>
                    <SelectItem value="approved">Aprovados</SelectItem>
                    <SelectItem value="rejected">Reprovados</SelectItem>
                    <SelectItem value="hired">Contratados</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Badge variant="outline" className="text-base px-3 py-2 h-10">
                  {filteredApplications.length} de {allApplications.length} candidaturas
                </Badge>
              </div>
            </div>
          </div>

          {filteredApplications.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                <ClipboardList className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>Nenhuma candidatura encontrada</p>
                <p className="text-sm mt-2">
                  {jobFilter === 'all' 
                    ? 'Vincule candidatos às vagas para iniciar' 
                    : 'Nenhuma candidatura para esta vaga'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredApplications.map((application: any) => (
                <Card key={application.id} data-testid={`card-application-${application.id}`}>
                  <CardHeader>
                    <div className="flex justify-between items-start gap-4">
                      <Checkbox
                        checked={selectedApplicationIds.has(application.id)}
                        onCheckedChange={() => toggleSelectApplication(application.id)}
                        data-testid={`checkbox-application-${application.id}`}
                        className="mt-1"
                      />
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
                    <div className="space-y-4">
                      {/* Scores and Compatibility Section */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-3 border-b">
                        {/* Requirements Score */}
                        <div className={`p-3 rounded-lg border ${getScoreColor(application.score || 0).bg} ${getScoreColor(application.score || 0).border}`}>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Target className="h-4 w-4" />
                              <span className="text-sm font-medium">Aptidão (Requisitos)</span>
                            </div>
                            <Badge variant="outline" className={`${getScoreColor(application.score || 0).text} font-bold`}>
                              {application.score || 0}%
                            </Badge>
                          </div>
                          <Progress value={application.score || 0} className="h-2" />
                        </div>

                        {/* DISC Compatibility */}
                        {application.discCompatibility !== null && application.candidateDISC ? (
                          <div className={`p-3 rounded-lg border ${getScoreColor(application.discCompatibility).bg} ${getScoreColor(application.discCompatibility).border}`}>
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Brain className="h-4 w-4" />
                                <span className="text-sm font-medium">Compatibilidade DISC</span>
                              </div>
                              <Badge variant="outline" className={`${getScoreColor(application.discCompatibility).text} font-bold`}>
                                {application.discCompatibility}%
                              </Badge>
                            </div>
                            <Progress value={application.discCompatibility} className="h-2" />
                            <div className="mt-2 text-xs text-muted-foreground">
                              Perfil: <span className="font-medium">{getDiscProfileLabel(application.candidateDISC.primaryProfile)}</span>
                            </div>
                          </div>
                        ) : application.candidateDISC ? (
                          <div className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                            <div className="flex items-center gap-2 mb-1">
                              <Brain className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm font-medium">Teste DISC Completo</span>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Perfil: <span className="font-medium">{getDiscProfileLabel(application.candidateDISC.primaryProfile)}</span>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              (Vaga sem perfil ideal configurado)
                            </div>
                          </div>
                        ) : (
                          <div className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                            <div className="flex items-center gap-2 mb-1">
                              <Brain className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm font-medium">Teste DISC</span>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Não realizado
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Basic Info */}
                      <div className="space-y-2">
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
                        {application.appliedAt && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>
                              Candidatura: {new Date(application.appliedAt).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Job Details Collapsible */}
                      {(application.jobDescription || (application.jobRequirements && application.jobRequirements.length > 0)) && (
                        <Collapsible className="border-t pt-3">
                          <CollapsibleTrigger className="flex items-center justify-between w-full text-sm font-medium hover:underline">
                            <span className="flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              Ver Detalhes da Vaga e Requisitos
                            </span>
                            <ChevronDown className="h-4 w-4" />
                          </CollapsibleTrigger>
                          <CollapsibleContent className="mt-3 space-y-3">
                            {application.jobDescription && (
                              <div>
                                <Label className="text-xs font-semibold text-muted-foreground">DESCRIÇÃO DA VAGA</Label>
                                <p className="text-sm mt-1 text-muted-foreground whitespace-pre-wrap">{application.jobDescription}</p>
                              </div>
                            )}
                            
                            {application.jobRequirements && application.jobRequirements.length > 0 && (
                              <div>
                                <Label className="text-xs font-semibold text-muted-foreground">REQUISITOS</Label>
                                <div className="mt-2 space-y-2">
                                  {application.jobRequirements.map((req: any) => {
                                    const response = application.requirementResponses?.find((r: any) => r.requirementId === req.id);
                                    return (
                                      <div key={req.id} className="text-sm p-2 rounded border border-gray-200 dark:border-gray-700">
                                        <div className="flex items-start justify-between gap-2">
                                          <div className="flex-1">
                                            <div className="font-medium flex items-center gap-2">
                                              {req.title}
                                              <Badge variant="outline" className="text-xs">
                                                {req.category === 'hard_skill' ? 'Hard Skill' : req.category === 'soft_skill' ? 'Soft Skill' : 'Administrativo'}
                                              </Badge>
                                              {req.requirementType === 'mandatory' && (
                                                <Badge variant="destructive" className="text-xs">Obrigatório</Badge>
                                              )}
                                            </div>
                                            {req.description && (
                                              <p className="text-xs text-muted-foreground mt-1">{req.description}</p>
                                            )}
                                          </div>
                                          {response && (
                                            <div className="text-right">
                                              <Badge variant="default" className="bg-[hsl(175,65%,45%)]">
                                                {response.proficiencyLevel}
                                              </Badge>
                                              <div className="text-xs text-muted-foreground mt-1">
                                                {response.pointsEarned} pts
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </CollapsibleContent>
                        </Collapsible>
                      )}

                      {application.notes && (
                        <div className="text-sm border-t pt-3">
                          <span className="font-medium">Observações:</span>
                          <p className="text-muted-foreground mt-1">{application.notes}</p>
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

          {/* Delete Confirmation Dialog */}
          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirmar Exclusão</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Você está prestes a excluir <strong>{selectedApplicationIds.size}</strong> candidatura(s). 
                  Esta ação não pode ser desfeita.
                </p>
                
                {selectedApplicationIds.size > 0 && (
                  <div className="max-h-60 overflow-y-auto border rounded-lg p-3 space-y-2">
                    {Array.from(selectedApplicationIds).map(id => {
                      const app = allApplications.find((a: any) => a.id === id);
                      return app ? (
                        <div key={id} className="flex items-center justify-between text-sm p-2 bg-gray-50 dark:bg-gray-900 rounded">
                          <div>
                            <span className="font-medium">{app.candidateName}</span>
                            <span className="text-muted-foreground ml-2">({app.candidateEmail})</span>
                          </div>
                          {getApplicationStatusBadge(app.status)}
                        </div>
                      ) : null;
                    })}
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsDeleteDialogOpen(false)}
                    disabled={deleteBulkApplicationsMutation.isPending}
                    data-testid="button-cancel-delete"
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => deleteBulkApplicationsMutation.mutate(Array.from(selectedApplicationIds))}
                    disabled={deleteBulkApplicationsMutation.isPending}
                    data-testid="button-confirm-delete"
                  >
                    {deleteBulkApplicationsMutation.isPending ? "Excluindo..." : "Excluir Candidaturas"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="disc" className="space-y-4">
          <DISCAssessmentsPanel
            jobOpenings={jobOpenings}
            candidates={candidates}
            assessments={discAssessments}
            isLoading={isLoadingDISC}
            isError={isErrorDISC}
            error={discError}
          />
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
        </main>
      </div>
    </div>
  );
}
