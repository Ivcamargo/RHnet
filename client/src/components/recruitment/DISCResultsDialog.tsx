import { useQuery } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Brain, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface DISCResultsDialogProps {
  assessmentId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

export function DISCResultsDialog({ assessmentId, isOpen, onClose }: DISCResultsDialogProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['/api/disc/assessments', assessmentId, 'results'],
    queryFn: async () => {
      const res = await fetch(`/api/disc/assessments/${assessmentId}/results`);
      if (!res.ok) throw new Error('Erro ao carregar resultados');
      return res.json();
    },
    enabled: !!assessmentId && isOpen,
  });

  if (!assessmentId) return null;

  const assessment = data?.assessment;
  const profileDescription = data?.profileDescription;
  const compatibility = data?.compatibility;
  const compatibilityScore = compatibility?.compatibilityScore;
  const matchDetails = compatibility?.matchDetails;

  const getProfileColor = (profile: string) => {
    const colors: Record<string, string> = {
      D: '#ef4444', // red-500
      I: '#eab308', // yellow-500
      S: '#22c55e', // green-500
      C: '#3b82f6', // blue-500
    };
    return colors[profile] || colors.D;
  };

  const getProfileName = (profile: string) => {
    const names: Record<string, string> = {
      D: 'Dominância',
      I: 'Influência',
      S: 'Estabilidade',
      C: 'Conformidade',
    };
    return names[profile] || profile;
  };

  const radarData = assessment ? [
    { profile: 'D', candidato: assessment.dScore || 0, ideal: assessment.jobOpening?.idealDISCProfile?.D || 0 },
    { profile: 'I', candidato: assessment.iScore || 0, ideal: assessment.jobOpening?.idealDISCProfile?.I || 0 },
    { profile: 'S', candidato: assessment.sScore || 0, ideal: assessment.jobOpening?.idealDISCProfile?.S || 0 },
    { profile: 'C', candidato: assessment.cScore || 0, ideal: assessment.jobOpening?.idealDISCProfile?.C || 0 },
  ] : [];

  const hasIdealProfile = assessment?.jobOpening?.idealDISCProfile;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Brain className="h-6 w-6 text-blue-600" />
            Resultados da Avaliação DISC
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="py-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600 dark:text-slate-400">Carregando resultados...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Candidate Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Informações do Candidato</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <span className="font-medium">Candidato:</span>{' '}
                  <span className="text-slate-700 dark:text-slate-300">
                    {assessment?.candidate?.fullName || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Vaga:</span>{' '}
                  <span className="text-slate-700 dark:text-slate-300">
                    {assessment?.jobOpening?.title || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Data de Conclusão:</span>{' '}
                  <span className="text-slate-700 dark:text-slate-300">
                    {assessment?.completedAt
                      ? new Date(assessment.completedAt).toLocaleDateString('pt-BR')
                      : 'N/A'}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Primary Profile */}
            {assessment?.primaryProfile && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Perfil Predominante</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white"
                      style={{ backgroundColor: getProfileColor(assessment.primaryProfile) }}
                    >
                      {assessment.primaryProfile}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">
                        {getProfileName(assessment.primaryProfile)}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Perfil comportamental dominante
                      </p>
                    </div>
                  </div>
                  
                  {profileDescription && (
                    <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                      <h4 className="font-semibold mb-2">Características:</h4>
                      <p className="text-sm text-slate-700 dark:text-slate-300">
                        {profileDescription}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* DISC Scores */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Pontuações DISC</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border-2 border-red-200 dark:border-red-800">
                    <div className="text-3xl font-bold text-red-700 dark:text-red-400">D</div>
                    <div className="text-sm text-muted-foreground mt-1">Dominância</div>
                    <div className="text-2xl font-semibold mt-2">{assessment?.dScore || 0}%</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border-2 border-yellow-200 dark:border-yellow-800">
                    <div className="text-3xl font-bold text-yellow-700 dark:text-yellow-400">I</div>
                    <div className="text-sm text-muted-foreground mt-1">Influência</div>
                    <div className="text-2xl font-semibold mt-2">{assessment?.iScore || 0}%</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border-2 border-green-200 dark:border-green-800">
                    <div className="text-3xl font-bold text-green-700 dark:text-green-400">S</div>
                    <div className="text-sm text-muted-foreground mt-1">Estabilidade</div>
                    <div className="text-2xl font-semibold mt-2">{assessment?.sScore || 0}%</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-2 border-blue-200 dark:border-blue-800">
                    <div className="text-3xl font-bold text-blue-700 dark:text-blue-400">C</div>
                    <div className="text-sm text-muted-foreground mt-1">Conformidade</div>
                    <div className="text-2xl font-semibold mt-2">{assessment?.cScore || 0}%</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Radar Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Gráfico Radar - Perfil Comportamental
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#cbd5e1" />
                    <PolarAngleAxis 
                      dataKey="profile" 
                      tick={{ fill: '#64748b', fontSize: 14, fontWeight: 600 }}
                    />
                    <PolarRadiusAxis 
                      angle={90} 
                      domain={[0, 100]}
                      tick={{ fill: '#64748b', fontSize: 12 }}
                    />
                    <Radar
                      name="Candidato"
                      dataKey="candidato"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.6}
                      strokeWidth={2}
                    />
                    {hasIdealProfile && (
                      <Radar
                        name="Perfil Ideal da Vaga"
                        dataKey="ideal"
                        stroke="#10b981"
                        fill="#10b981"
                        fillOpacity={0.3}
                        strokeWidth={2}
                        strokeDasharray="5 5"
                      />
                    )}
                    <Legend />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        padding: '8px 12px',
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Compatibility Analysis */}
            {hasIdealProfile && compatibilityScore !== null && compatibilityScore !== undefined && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Análise de Compatibilidade</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className={`text-5xl font-bold ${
                      compatibilityScore >= 80 ? 'text-green-600' :
                      compatibilityScore >= 60 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {Math.round(compatibilityScore)}%
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg">
                        Compatibilidade com Perfil Ideal
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {compatibilityScore >= 80 ? 'Alta compatibilidade - Excelente alinhamento com a vaga' :
                         compatibilityScore >= 60 ? 'Compatibilidade moderada - Bom alinhamento geral' :
                         'Compatibilidade baixa - Perfil divergente do ideal'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold">Comparação Detalhada:</h4>
                    {['D', 'I', 'S', 'C'].map((profile) => {
                      const details = matchDetails?.[profile];
                      const candidateScore = details?.candidate || 0;
                      const idealScore = details?.ideal || 0;
                      // Calculate signed difference (candidate - ideal) for direction
                      const diff = candidateScore - idealScore;
                      const absDiff = Math.abs(diff);

                      return (
                        <div key={profile} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900 rounded">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white"
                               style={{ backgroundColor: getProfileColor(profile) }}>
                            {profile}
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between text-sm">
                              <span>{getProfileName(profile)}</span>
                              <span className="font-medium">
                                {candidateScore}% (Ideal: {idealScore}%)
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            {absDiff <= 10 ? (
                              <Minus className="h-4 w-4 text-green-600" />
                            ) : diff > 0 ? (
                              <TrendingUp className="h-4 w-4 text-blue-600" />
                            ) : (
                              <TrendingDown className="h-4 w-4 text-orange-600" />
                            )}
                            <span className={`text-sm font-medium ${
                              absDiff <= 10 ? 'text-green-600' :
                              'text-slate-600 dark:text-slate-400'
                            }`}>
                              {absDiff <= 10 ? 'Alinhado' : `${diff > 0 ? '+' : ''}${diff}%`}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
