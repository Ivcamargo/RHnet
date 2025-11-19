import { useState, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Brain,
  Plus,
  Copy,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from '@/lib/queryClient';
import { DISCResultsDialog } from './DISCResultsDialog';

interface DISCAssessmentsPanelProps {
  jobOpenings: any[];
  candidates: any[];
  assessments: any[];
  isLoading: boolean;
  isError?: boolean;
  error?: any;
}

export function DISCAssessmentsPanel({ jobOpenings, candidates, assessments, isLoading, isError, error }: DISCAssessmentsPanelProps) {
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [selectedCandidateId, setSelectedCandidateId] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterJob, setFilterJob] = useState<string>('all');
  const [searchCandidate, setSearchCandidate] = useState('');
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<number | null>(null);
  const [isResultsDialogOpen, setIsResultsDialogOpen] = useState(false);

  const createAssessmentMutation = useMutation({
    mutationFn: async (data: { candidateId: number; jobOpeningId: number }) => {
      return await apiRequest('/api/disc/assessments', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: async (response) => {
      await queryClient.invalidateQueries({ queryKey: ['/api/disc/assessments'] });
      const assessment = await response.json();
      const link = `${window.location.origin}/disc-assessment?token=${assessment.accessToken}`;
      
      navigator.clipboard.writeText(link);
      
      toast({
        title: "Avaliação DISC criada!",
        description: "O link foi copiado para a área de transferência.",
      });
      
      setIsCreateDialogOpen(false);
      setSelectedJobId('');
      setSelectedCandidateId('');
    },
    onError: () => {
      toast({
        title: "Erro ao criar avaliação",
        description: "Não foi possível criar a avaliação. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const filteredAssessments = useMemo(() => {
    return assessments.filter((assessment) => {
      const statusMatch = filterStatus === 'all' || assessment.status === filterStatus;
      const jobMatch = filterJob === 'all' || assessment.jobOpeningId?.toString() === filterJob;
      const candidateMatch = searchCandidate === '' || 
        assessment.candidate?.fullName?.toLowerCase().includes(searchCandidate.toLowerCase()) ||
        assessment.candidate?.email?.toLowerCase().includes(searchCandidate.toLowerCase());
      
      return statusMatch && jobMatch && candidateMatch;
    });
  }, [assessments, filterStatus, filterJob, searchCandidate]);

  const handleCreateAssessment = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!selectedJobId || !selectedCandidateId) {
      toast({
        title: "Campos obrigatórios",
        description: "Selecione uma vaga e um candidato.",
        variant: "destructive",
      });
      return;
    }

    createAssessmentMutation.mutate({
      candidateId: parseInt(selectedCandidateId),
      jobOpeningId: parseInt(selectedJobId),
    });
  };

  const copyAssessmentLink = (token: string) => {
    const link = `${window.location.origin}/disc-assessment?token=${token}`;
    navigator.clipboard.writeText(link);
    
    toast({
      title: "Link copiado!",
      description: "O link do teste DISC foi copiado para a área de transferência.",
    });
  };

  const handleViewResults = (assessmentId: number) => {
    setSelectedAssessmentId(assessmentId);
    setIsResultsDialogOpen(true);
  };

  const handleCloseResults = () => {
    setIsResultsDialogOpen(false);
    setSelectedAssessmentId(null);
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; className: string }> = {
      pending: {
        label: 'Pendente',
        className: 'border-yellow-600 text-yellow-700 bg-yellow-50 dark:bg-yellow-900/20',
      },
      in_progress: {
        label: 'Em Andamento',
        className: 'border-blue-600 text-blue-700 bg-blue-50 dark:bg-blue-900/20',
      },
      completed: {
        label: 'Concluído',
        className: 'border-green-600 text-green-700 bg-green-50 dark:bg-green-900/20',
      },
    };

    const { label, className } = config[status] || config.pending;
    return <Badge variant="outline" className={className}>{label}</Badge>;
  };

  const getProfileBadge = (profile: string) => {
    const colors: Record<string, string> = {
      D: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      I: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      S: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      C: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    };

    const profileNames: Record<string, string> = {
      D: 'Dominância',
      I: 'Influência',
      S: 'Estabilidade',
      C: 'Conformidade',
    };

    return (
      <Badge className={colors[profile] || colors.D}>
        {profile} - {profileNames[profile] || profile}
      </Badge>
    );
  };

  const calculateCompatibility = (assessment: any) => {
    if (!assessment.jobOpening?.idealDISCProfile || assessment.status !== 'completed') {
      return null;
    }

    const ideal = assessment.jobOpening.idealDISCProfile;
    const actual = {
      D: assessment.dScore || 0,
      I: assessment.iScore || 0,
      S: assessment.sScore || 0,
      C: assessment.cScore || 0,
    };

    const totalDiff = Math.abs(ideal.D - actual.D) + 
                      Math.abs(ideal.I - actual.I) + 
                      Math.abs(ideal.S - actual.S) + 
                      Math.abs(ideal.C - actual.C);

    const compatibility = Math.max(0, 100 - (totalDiff / 4));
    return Math.round(compatibility);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold">Testes DISC</h2>
          <p className="text-sm text-muted-foreground">
            Avaliações de perfil comportamental dos candidatos
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-disc-assessment">
              <Plus className="mr-2 h-4 w-4" />
              Nova Avaliação DISC
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Avaliação DISC</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateAssessment} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="job-select">Vaga *</Label>
                <Select value={selectedJobId} onValueChange={setSelectedJobId}>
                  <SelectTrigger id="job-select" data-testid="select-job-disc">
                    <SelectValue placeholder="Selecione uma vaga" />
                  </SelectTrigger>
                  <SelectContent>
                    {jobOpenings.map((job) => (
                      <SelectItem key={job.id} value={job.id.toString()}>
                        {job.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="candidate-select">Candidato *</Label>
                <Select value={selectedCandidateId} onValueChange={setSelectedCandidateId}>
                  <SelectTrigger id="candidate-select" data-testid="select-candidate-disc">
                    <SelectValue placeholder="Selecione um candidato" />
                  </SelectTrigger>
                  <SelectContent>
                    {candidates.map((candidate) => (
                      <SelectItem key={candidate.id} value={candidate.id.toString()}>
                        {candidate.fullName} ({candidate.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                  data-testid="button-cancel-disc"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={createAssessmentMutation.isPending}
                  data-testid="button-submit-disc"
                >
                  {createAssessmentMutation.isPending ? 'Criando...' : 'Criar Avaliação'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <Label htmlFor="filter-status">Status</Label>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger id="filter-status" data-testid="select-filter-status">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="in_progress">Em Andamento</SelectItem>
              <SelectItem value="completed">Concluído</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1">
          <Label htmlFor="filter-job">Vaga</Label>
          <Select value={filterJob} onValueChange={setFilterJob}>
            <SelectTrigger id="filter-job" data-testid="select-filter-job">
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {jobOpenings.map((job) => (
                <SelectItem key={job.id} value={job.id.toString()}>
                  {job.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1">
          <Label htmlFor="search-candidate">Candidato</Label>
          <Input
            id="search-candidate"
            placeholder="Buscar por nome ou email..."
            value={searchCandidate}
            onChange={(e) => setSearchCandidate(e.target.value)}
            data-testid="input-search-candidate"
          />
        </div>
      </div>

      {isError ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <XCircle className="mx-auto h-12 w-12 mb-4 text-destructive opacity-50" />
            <p className="font-semibold text-destructive mb-2">Erro ao carregar avaliações DISC</p>
            <p className="text-sm">
              {error?.message || "Não foi possível carregar a lista de avaliações. Tente recarregar a página."}
            </p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => window.location.reload()}
              data-testid="button-reload-page"
            >
              Recarregar Página
            </Button>
          </CardContent>
        </Card>
      ) : isLoading ? (
        <div className="text-center py-8">Carregando avaliações...</div>
      ) : filteredAssessments.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <Brain className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p>Nenhuma avaliação DISC encontrada</p>
            <p className="text-sm mt-2">
              Clique em "Nova Avaliação DISC" para criar a primeira
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredAssessments.map((assessment) => {
            const compatibility = calculateCompatibility(assessment);
            const isExpired = assessment.expiresAt && new Date(assessment.expiresAt) < new Date();

            return (
              <Card key={assessment.id} data-testid={`card-disc-${assessment.id}`}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg" data-testid={`text-candidate-${assessment.id}`}>
                        {assessment.candidate?.fullName || 'Candidato não encontrado'}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {assessment.candidate?.email}
                      </p>
                      <p className="text-sm font-medium mt-2">
                        Vaga: {assessment.jobOpening?.title || 'Vaga não encontrada'}
                      </p>
                      <div className="flex gap-2 mt-2 flex-wrap">
                        {getStatusBadge(assessment.status)}
                        {assessment.primaryProfile && getProfileBadge(assessment.primaryProfile)}
                        {compatibility !== null && (
                          <Badge variant="outline" className="border-purple-600 text-purple-700 bg-purple-50 dark:bg-purple-900/20">
                            Compatibilidade: {compatibility}%
                          </Badge>
                        )}
                        {isExpired && (
                          <Badge variant="destructive">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Link Expirado
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {assessment.status === 'completed' && assessment.completedAt && (
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span>
                          Concluído em: {new Date(assessment.completedAt).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    )}

                    {assessment.status === 'in_progress' && assessment.startedAt && (
                      <div className="flex items-center gap-2 text-sm text-blue-600">
                        <Clock className="h-4 w-4" />
                        <span>
                          Iniciado em: {new Date(assessment.startedAt).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    )}

                    {assessment.expiresAt && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>
                          Expira em: {new Date(assessment.expiresAt).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    )}

                    {assessment.status === 'completed' && (
                      <div className="pt-3 border-t">
                        <div className="grid grid-cols-4 gap-2 text-sm">
                          <div className="text-center p-2 bg-red-50 dark:bg-red-900/20 rounded">
                            <div className="font-semibold text-red-700 dark:text-red-400">D</div>
                            <div className="text-xs text-muted-foreground">{assessment.dScore}%</div>
                          </div>
                          <div className="text-center p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                            <div className="font-semibold text-yellow-700 dark:text-yellow-400">I</div>
                            <div className="text-xs text-muted-foreground">{assessment.iScore}%</div>
                          </div>
                          <div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded">
                            <div className="font-semibold text-green-700 dark:text-green-400">S</div>
                            <div className="text-xs text-muted-foreground">{assessment.sScore}%</div>
                          </div>
                          <div className="text-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                            <div className="font-semibold text-blue-700 dark:text-blue-400">C</div>
                            <div className="text-xs text-muted-foreground">{assessment.cScore}%</div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2 pt-3">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyAssessmentLink(assessment.accessToken)}
                        data-testid={`button-copy-link-${assessment.id}`}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copiar Link
                      </Button>
                      
                      {assessment.status === 'completed' && (
                        <Button
                          size="sm"
                          onClick={() => handleViewResults(assessment.id)}
                          data-testid={`button-view-results-${assessment.id}`}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Resultados
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <DISCResultsDialog
        assessmentId={selectedAssessmentId}
        isOpen={isResultsDialogOpen}
        onClose={handleCloseResults}
      />
    </div>
  );
}
