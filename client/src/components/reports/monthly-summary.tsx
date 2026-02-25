import { useMemo, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Clock, Calendar, AlertTriangle, MapPin, Shield, CheckCircle, XCircle, Camera, Utensils, Coffee } from "lucide-react";

interface TimeEntry {
  id: number;
  clockInTime: string | null;
  clockOutTime: string | null;
  totalHours: string | null;
  status: string;
  date: string;
  faceRecognitionVerified: boolean;
  // Validation fields
  clockInWithinGeofence?: boolean;
  clockOutWithinGeofence?: boolean;
  clockInShiftCompliant?: boolean;
  clockOutShiftCompliant?: boolean;
  clockInValidationMessage?: string;
  clockOutValidationMessage?: string;
  // Additional details
  clockInPhotoUrl?: string | null;
  clockOutPhotoUrl?: string | null;
  clockInIpAddress?: string | null;
  clockOutIpAddress?: string | null;
  clockInLatitude?: number | null;
  clockInLongitude?: number | null;
  clockOutLatitude?: number | null;
  clockOutLongitude?: number | null;
  regularHours?: string | null;
  overtimeHours?: string | null;
  // Irregularity tracking
  expectedHours?: string | null;
  lateMinutes?: number | null;
  shortfallMinutes?: number | null;
  irregularityReasons?: string[] | null;
  breakEntries?: BreakEntry[];
  periodEntries?: TimeEntry[];
}

interface BreakEntry {
  id: number;
  breakStart: string | null;
  breakEnd: string | null;
  duration: string | null;
  type: string | null;
}

interface MonthlyTimeTableProps {
  entries: TimeEntry[];
}

interface GroupedDayEntry {
  summary: TimeEntry;
  primaryEntry: TimeEntry;
  periodCount: number;
}

export function MonthlyTimeTable({ entries }: MonthlyTimeTableProps) {
  const [selectedEntry, setSelectedEntry] = useState<TimeEntry | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const sortedEntries = useMemo(() => {
    return [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [entries]);

  const openDetails = (entry: TimeEntry) => {
    setSelectedEntry(entry);
    setDetailsOpen(true);
  };

  const formatTime = (timeString: string | null) => {
    if (!timeString) return "-";
    return new Date(timeString).toLocaleTimeString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString: string) => {
    // Parse date string (YYYY-MM-DD) sem interpretar timezone
    // Evita problema de timezone que faz a data voltar 1 dia
    const [year, month, day] = dateString.split('-').map(Number);
    const localDate = new Date(year, month - 1, day);
    
    return localDate.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatHours = (hoursString: string | null) => {
    if (!hoursString) return "-";
    const hours = parseFloat(hoursString);
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  const parseHours = (hoursString: string | null) => {
    if (!hoursString) return 0;
    const parsed = parseFloat(hoursString);
    return Number.isNaN(parsed) ? 0 : parsed;
  };

  const formatBreakType = (type: string | null) => {
    if (!type) return "Intervalo";
    return type.toLowerCase() === "lunch" ? "Almoço" : "Intervalo";
  };

  const isLunchBreak = (type: string | null) => type?.toLowerCase() === "lunch";

  const getBreakEntries = (entry: TimeEntry) => {
    if (!entry.breakEntries) return [];
    return [...entry.breakEntries].sort((a, b) => {
      if (!a.breakStart) return 1;
      if (!b.breakStart) return -1;
      return new Date(a.breakStart).getTime() - new Date(b.breakStart).getTime();
    });
  };

  const getStatusBadge = (entry: TimeEntry) => {
    const today = new Date().toISOString().split('T')[0];
    const isToday = entry.date === today;
    
    // Prioridade para "Irregular" se houver problemas
    if (isIrregular(entry)) {
      return (
        <Badge variant="destructive" className="bg-red-600">
          Irregular
        </Badge>
      );
    }
    
    if (entry.status === "active" && isToday) {
      return (
        <Badge className="point-success">
          Em andamento
        </Badge>
      );
    }
    
    if (entry.status === "completed") {
      return (
        <Badge className="point-success">
          Completo
        </Badge>
      );
    }
    
    if (entry.status === "incomplete") {
      return (
        <Badge variant="destructive">
          Incompleto
        </Badge>
      );
    }

    // Check if it's weekend
    const date = new Date(entry.date);
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return (
        <Badge variant="secondary">
          Fim de semana
        </Badge>
      );
    }

    return (
      <Badge variant="outline">
        {entry.status}
      </Badge>
    );
  };

  const getWorkingHours = (entry: TimeEntry) => {
    if (entry.status === "active" && entry.clockInTime) {
      // Calculate current working hours for active entries
      const now = new Date();
      const clockIn = new Date(entry.clockInTime);
      const diffMs = now.getTime() - clockIn.getTime();
      const hours = diffMs / (1000 * 60 * 60);
      return formatHours(hours.toFixed(2));
    }
    
    return formatHours(entry.totalHours);
  };

  if (sortedEntries.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum registro encontrado</h3>
        <p className="text-gray-500">
          Não há registros de ponto para este período.
        </p>
      </div>
    );
  }

  const hasValidationIssues = (entry: TimeEntry) => {
    const hasGeofenceIssue = entry.clockInWithinGeofence === false || entry.clockOutWithinGeofence === false;
    const hasShiftIssue = entry.clockInShiftCompliant === false || entry.clockOutShiftCompliant === false;
    return hasGeofenceIssue || hasShiftIssue;
  };

  const isIrregular = (entry: TimeEntry) => {
    // Usa irregularityReasons do backend se disponível
    if (entry.irregularityReasons && entry.irregularityReasons.length > 0) {
      return true;
    }
    // Status irregular
    if (entry.status === "irregular") return true;
    return false;
  };

  const groupedEntries = useMemo<GroupedDayEntry[]>(() => {
    const groupedByDate = new Map<string, TimeEntry[]>();

    for (const entry of sortedEntries) {
      const current = groupedByDate.get(entry.date) || [];
      current.push(entry);
      groupedByDate.set(entry.date, current);
    }

    return Array.from(groupedByDate.entries())
      .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
      .map(([date, dayEntries]) => {
        const sortedByLongest = [...dayEntries].sort(
          (a, b) => parseHours(b.totalHours) - parseHours(a.totalHours)
        );
        const primaryEntry = sortedByLongest[0];

        const earliestClockIn = dayEntries
          .map((entry) => entry.clockInTime)
          .filter((v): v is string => !!v)
          .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())[0] || null;

        const latestClockOut = dayEntries
          .map((entry) => entry.clockOutTime)
          .filter((v): v is string => !!v)
          .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0] || null;

        const totalHours = dayEntries.reduce((sum, entry) => sum + parseHours(entry.totalHours), 0);
        const regularHours = dayEntries.reduce((sum, entry) => sum + parseHours(entry.regularHours || null), 0);
        const overtimeHours = dayEntries.reduce((sum, entry) => sum + parseHours(entry.overtimeHours || null), 0);

        const mergedBreakEntries = dayEntries.flatMap((entry) => entry.breakEntries || []);
        const mergedIrregularityReasons = Array.from(
          new Set(dayEntries.flatMap((entry) => entry.irregularityReasons || []))
        );

        const hasAnyIrregular = dayEntries.some((entry) => isIrregular(entry));
        const hasAnyActive = dayEntries.some((entry) => entry.status === "active");
        const hasAnyIncomplete = dayEntries.some((entry) => entry.status === "incomplete");
        const allCompleted = dayEntries.every((entry) => entry.status === "completed");

        const mergedClockInValidation = dayEntries
          .map((entry) => entry.clockInValidationMessage)
          .filter((msg): msg is string => !!msg)
          .join("\n");
        const mergedClockOutValidation = dayEntries
          .map((entry) => entry.clockOutValidationMessage)
          .filter((msg): msg is string => !!msg)
          .join("\n");

        const firstClockInPhotoUrl = dayEntries.find((entry) => !!entry.clockInPhotoUrl)?.clockInPhotoUrl || null;
        const lastClockOutPhotoUrl = [...dayEntries].reverse().find((entry) => !!entry.clockOutPhotoUrl)?.clockOutPhotoUrl || null;

        const summary: TimeEntry = {
          ...primaryEntry,
          id: primaryEntry.id,
          date,
          clockInTime: earliestClockIn,
          clockOutTime: latestClockOut,
          totalHours: totalHours.toFixed(2),
          regularHours: regularHours.toFixed(2),
          overtimeHours: overtimeHours.toFixed(2),
          breakEntries: mergedBreakEntries,
          periodEntries: [...dayEntries].sort((a, b) => {
            const aTime = a.clockInTime ? new Date(a.clockInTime).getTime() : 0;
            const bTime = b.clockInTime ? new Date(b.clockInTime).getTime() : 0;
            return aTime - bTime;
          }),
          faceRecognitionVerified: dayEntries.some((entry) => entry.faceRecognitionVerified),
          clockInPhotoUrl: firstClockInPhotoUrl,
          clockOutPhotoUrl: lastClockOutPhotoUrl,
          status: hasAnyIrregular
            ? "irregular"
            : hasAnyActive
              ? "active"
              : hasAnyIncomplete
                ? "incomplete"
                : allCompleted
                  ? "completed"
                  : primaryEntry.status,
          irregularityReasons: mergedIrregularityReasons.length > 0 ? mergedIrregularityReasons : null,
          clockInValidationMessage: mergedClockInValidation || undefined,
          clockOutValidationMessage: mergedClockOutValidation || undefined,
          clockInWithinGeofence: dayEntries.some((entry) => entry.clockInWithinGeofence === false)
            ? false
            : primaryEntry.clockInWithinGeofence,
          clockOutWithinGeofence: dayEntries.some((entry) => entry.clockOutWithinGeofence === false)
            ? false
            : primaryEntry.clockOutWithinGeofence,
          clockInShiftCompliant: dayEntries.some((entry) => entry.clockInShiftCompliant === false)
            ? false
            : primaryEntry.clockInShiftCompliant,
          clockOutShiftCompliant: dayEntries.some((entry) => entry.clockOutShiftCompliant === false)
            ? false
            : primaryEntry.clockOutShiftCompliant,
        };

        return {
          summary,
          primaryEntry,
          periodCount: dayEntries.length,
        };
      });
  }, [sortedEntries]);

  return (
    <>
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              Detalhes de Validação - {selectedEntry && formatDate(selectedEntry.date)}
              {selectedEntry?.periodEntries && selectedEntry.periodEntries.length > 1 && (
                <span className="text-sm font-normal text-gray-500">
                  ({selectedEntry.periodEntries.length} períodos)
                </span>
              )}
            </DialogTitle>
          </DialogHeader>
          
          {selectedEntry && (
            <div className="space-y-6 mt-4 max-h-[70vh] overflow-y-auto">
              {/* Períodos do Dia */}
              {selectedEntry.periodEntries && selectedEntry.periodEntries.length > 1 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-blue-800 flex items-center gap-2 border-b pb-2">
                    <Clock className="h-5 w-5" />
                    Períodos do Dia
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    {selectedEntry.periodEntries.map((period) => (
                      <div key={period.id} className="flex items-center justify-between text-sm bg-white border rounded p-3">
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {formatTime(period.clockInTime)} - {formatTime(period.clockOutTime)}
                          </span>
                          <span className="text-xs text-gray-500">Período #{period.id}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-semibold">{formatHours(period.totalHours)}</span>
                          <div className="mt-1">{getStatusBadge(period)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Status */}
              <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                <span className="text-sm font-medium">Status do Registro:</span>
                {getStatusBadge(selectedEntry)}
              </div>

              {/* Irregularidades */}
              {selectedEntry.irregularityReasons && selectedEntry.irregularityReasons.length > 0 && (
                <div className="bg-red-50 border border-red-200 p-4 rounded-lg space-y-2">
                  <h3 className="font-semibold text-red-800 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Irregularidades Detectadas
                  </h3>
                  <ul className="space-y-1 ml-7">
                    {selectedEntry.irregularityReasons.map((reason, idx) => (
                      <li key={idx} className="text-sm text-red-700">
                        • {reason}
                      </li>
                    ))}
                  </ul>
                  {selectedEntry.expectedHours && (
                    <div className="mt-3 pt-3 border-t border-red-200 text-xs text-red-600">
                      <span className="font-medium">Horas esperadas:</span> {selectedEntry.expectedHours}h
                    </div>
                  )}
                </div>
              )}

              {/* Entrada */}
              <div className="space-y-3">
                <h3 className="font-semibold text-blue-800 flex items-center gap-2 border-b pb-2">
                  <Clock className="h-5 w-5" />
                  Registro de Entrada - {formatTime(selectedEntry.clockInTime)}
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                  {/* Validação */}
                  {selectedEntry.clockInValidationMessage ? (
                    <div className="text-sm whitespace-pre-line bg-white p-3 rounded border-l-4 border-blue-500">
                      {selectedEntry.clockInValidationMessage}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Nenhuma informação de validação disponível</p>
                  )}
                  
                  {/* Status de Conformidade */}
                  <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t">
                    <div className="flex items-center gap-2">
                      {selectedEntry.clockInWithinGeofence ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                      <span className="text-xs">
                        {selectedEntry.clockInWithinGeofence ? 'Dentro da geofence' : 'Fora da geofence'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {selectedEntry.clockInShiftCompliant ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                      <span className="text-xs">
                        {selectedEntry.clockInShiftCompliant ? 'Turno compatível' : 'Turno incompatível'}
                      </span>
                    </div>
                  </div>

                  {/* IP e Localização */}
                  <div className="grid grid-cols-1 gap-2 mt-3 pt-3 border-t">
                    {selectedEntry.clockInIpAddress && (
                      <div className="flex items-center gap-2 text-xs">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">IP:</span>
                        <span className="font-mono">{selectedEntry.clockInIpAddress}</span>
                      </div>
                    )}
                    {selectedEntry.clockInLatitude && selectedEntry.clockInLongitude && (
                      <div className="flex items-center gap-2 text-xs">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">Localização:</span>
                        <span className="font-mono">
                          {selectedEntry.clockInLatitude.toFixed(6)}, {selectedEntry.clockInLongitude.toFixed(6)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Reconhecimento Facial */}
                  <div className="mt-3 pt-3 border-t">
                    <div className="flex items-center gap-2 mb-2">
                      <Camera className="h-4 w-4 text-blue-600" />
                      <p className="text-xs font-medium text-blue-800">Reconhecimento Facial:</p>
                    </div>
                    {selectedEntry.clockInPhotoUrl ? (
                      <img 
                        src={selectedEntry.clockInPhotoUrl} 
                        alt="Foto de entrada" 
                        className="w-32 h-32 object-cover rounded border border-blue-300"
                      />
                    ) : (
                      <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 p-3 rounded border border-dashed">
                        <Camera className="h-4 w-4" />
                        <span>Foto não disponível para este registro</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Saída */}
              {selectedEntry.clockOutTime && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-blue-800 flex items-center gap-2 border-b pb-2">
                    <Clock className="h-5 w-5" />
                    Registro de Saída - {formatTime(selectedEntry.clockOutTime)}
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                    {/* Validação */}
                    {selectedEntry.clockOutValidationMessage ? (
                      <div className="text-sm whitespace-pre-line bg-white p-3 rounded border-l-4 border-blue-500">
                        {selectedEntry.clockOutValidationMessage}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">Nenhuma informação de validação disponível</p>
                    )}
                    
                    {/* Status de Conformidade */}
                    <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t">
                      <div className="flex items-center gap-2">
                        {selectedEntry.clockOutWithinGeofence ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                        <span className="text-xs">
                          {selectedEntry.clockOutWithinGeofence ? 'Dentro da geofence' : 'Fora da geofence'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {selectedEntry.clockOutShiftCompliant ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                        <span className="text-xs">
                          {selectedEntry.clockOutShiftCompliant ? 'Turno compatível' : 'Turno incompatível'}
                        </span>
                      </div>
                    </div>

                    {/* IP e Localização */}
                    <div className="grid grid-cols-1 gap-2 mt-3 pt-3 border-t">
                      {selectedEntry.clockOutIpAddress && (
                        <div className="flex items-center gap-2 text-xs">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">IP:</span>
                          <span className="font-mono">{selectedEntry.clockOutIpAddress}</span>
                        </div>
                      )}
                      {selectedEntry.clockOutLatitude && selectedEntry.clockOutLongitude && (
                        <div className="flex items-center gap-2 text-xs">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">Localização:</span>
                          <span className="font-mono">
                            {selectedEntry.clockOutLatitude.toFixed(6)}, {selectedEntry.clockOutLongitude.toFixed(6)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Reconhecimento Facial */}
                    <div className="mt-3 pt-3 border-t">
                      <div className="flex items-center gap-2 mb-2">
                        <Camera className="h-4 w-4 text-blue-600" />
                        <p className="text-xs font-medium text-blue-800">Reconhecimento Facial:</p>
                      </div>
                      {selectedEntry.clockOutPhotoUrl ? (
                        <img 
                          src={selectedEntry.clockOutPhotoUrl} 
                          alt="Foto de saída" 
                          className="w-32 h-32 object-cover rounded border border-blue-300"
                        />
                      ) : (
                        <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 p-3 rounded border border-dashed">
                          <Camera className="h-4 w-4" />
                          <span>Foto não disponível para este registro</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Intervalos / Almoço */}
              <div className="space-y-3">
                <h3 className="font-semibold text-blue-800 flex items-center gap-2 border-b pb-2">
                  <Clock className="h-5 w-5" />
                  Apontamentos de Intervalo
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="text-xs text-gray-500">Legenda:</span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                      <Utensils className="h-3 w-3" />
                      Almoço
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-sky-100 text-sky-800">
                      <Coffee className="h-3 w-3" />
                      Intervalo
                    </span>
                  </div>
                  {getBreakEntries(selectedEntry).length > 0 ? (
                    <div className="space-y-2">
                      {getBreakEntries(selectedEntry).map((breakEntry) => (
                        <div
                          key={breakEntry.id}
                          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-sm bg-white p-3 rounded border"
                        >
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium w-fit ${
                              isLunchBreak(breakEntry.type)
                                ? "bg-amber-100 text-amber-800"
                                : "bg-sky-100 text-sky-800"
                            }`}
                          >
                            {isLunchBreak(breakEntry.type) ? (
                              <Utensils className="h-3 w-3" />
                            ) : (
                              <Coffee className="h-3 w-3" />
                            )}
                            {formatBreakType(breakEntry.type)}
                          </span>
                          <span className="text-gray-700">
                            {formatTime(breakEntry.breakStart)} - {formatTime(breakEntry.breakEnd)}
                          </span>
                          <span className="text-xs text-gray-500">
                            {breakEntry.duration ? `(${Math.round(parseFloat(breakEntry.duration) * 60)} min)` : "(em andamento)"}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Nenhum apontamento de almoço/intervalo neste dia.</p>
                  )}
                </div>
              </div>

              {/* Resumo de Horas */}
              <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-800">Total de Horas Trabalhadas</span>
                  <span className="text-lg font-bold text-blue-900">
                    {formatHours(selectedEntry.totalHours)}
                  </span>
                </div>
                {(selectedEntry.regularHours || selectedEntry.overtimeHours) && (
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-blue-200">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-blue-700">Horas Regulares:</span>
                      <span className="font-semibold">{formatHours(selectedEntry.regularHours || '0')}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-blue-700">Horas Extras:</span>
                      <span className="font-semibold">{formatHours(selectedEntry.overtimeHours || '0')}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <div className="overflow-x-auto text-gray-900 dark:text-gray-100">
        <Table className="[&_th]:text-gray-600 dark:[&_th]:text-gray-200 [&_td]:text-gray-900 dark:[&_td]:text-gray-100">
        <TableHeader>
          <TableRow className="border-b border-gray-200 dark:border-slate-600">
            <TableHead className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-200">Data</TableHead>
            <TableHead className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-200">Entrada</TableHead>
            <TableHead className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-200">Saída</TableHead>
            <TableHead className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-200">Intervalos</TableHead>
            <TableHead className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-200">Horas Trabalhadas</TableHead>
            <TableHead className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-200">Status</TableHead>
            <TableHead className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-200">Verificação</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {groupedEntries.map((grouped) => {
            const entry = grouped.summary;
            return (
            <TableRow key={`${entry.date}-${grouped.primaryEntry.id}`} className={`border-b border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800/60 ${hasValidationIssues(entry) ? 'bg-amber-50/50 dark:bg-amber-900/20' : ''}`}>
              <TableCell className="py-3 px-4 text-sm text-gray-900 dark:text-gray-100">
                <div className="flex items-center gap-1">
                  {formatDate(entry.date)}
                  {grouped.periodCount > 1 && (
                    <span className="ml-2 text-[11px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-200">
                      {grouped.periodCount} períodos
                    </span>
                  )}
                  {hasValidationIssues(entry) && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => openDetails(grouped.summary)}
                            className="cursor-pointer hover:scale-110 transition-transform"
                            data-testid={`button-warning-${entry.id}`}
                          >
                            <AlertTriangle className="h-4 w-4 text-amber-600" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">⚠️ Problemas de validação detectados</p>
                          <p className="text-xs text-gray-400 dark:text-gray-200">Clique para ver detalhes</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              </TableCell>
              <TableCell className="py-3 px-4 text-sm text-gray-900 dark:text-gray-100">
                {formatTime(entry.clockInTime)}
              </TableCell>
              <TableCell className="py-3 px-4 text-sm text-gray-900 dark:text-gray-100">
                {formatTime(entry.clockOutTime)}
              </TableCell>
              <TableCell className="py-3 px-4 text-sm text-gray-900 dark:text-gray-100">
                {getBreakEntries(entry).length > 0 ? (
                  <div className="inline-flex items-center gap-2 rounded-full border px-2 py-1 text-xs bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-600">
                    <Clock className="h-3 w-3 text-gray-500 dark:text-gray-300" />
                    <span className="font-medium">{getBreakEntries(entry).length}</span>
                    <span className="text-gray-500 dark:text-gray-300">apont.</span>
                  </div>
                ) : (
                  <span className="text-gray-400 dark:text-gray-300">-</span>
                )}
              </TableCell>
              <TableCell className="py-3 px-4 text-sm text-gray-900 dark:text-gray-100">
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3 text-gray-400 dark:text-gray-300" />
                  <span>{getWorkingHours(entry)}</span>
                </div>
              </TableCell>
              <TableCell className="py-3 px-4">
                {getStatusBadge(entry)}
              </TableCell>
              <TableCell className="py-3 px-4">
                <div className="flex flex-col gap-1">
                  {entry.faceRecognitionVerified ? (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                            <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                              <Camera className="h-4 w-4" />
                              <span className="text-xs">Verificado</span>
                            </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">✓ Reconhecimento facial verificado</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ) : (
                    <span className="text-gray-400 dark:text-gray-300 text-xs">-</span>
                  )}
                  <button
                    onClick={() => openDetails(grouped.summary)}
                    className={`text-xs underline cursor-pointer text-left ${
                      (entry.clockInValidationMessage || entry.clockOutValidationMessage || isIrregular(entry))
                        ? 'text-amber-600 hover:text-amber-700'
                        : 'text-blue-600 hover:text-blue-700'
                    }`}
                    data-testid={`button-details-${entry.id}`}
                  >
                    {(entry.clockInValidationMessage || entry.clockOutValidationMessage || isIrregular(entry))
                      ? `⚠ Ver detalhes${grouped.periodCount > 1 ? ` (${grouped.periodCount})` : ''}`
                      : `Ver detalhes${grouped.periodCount > 1 ? ` (${grouped.periodCount})` : ''}`}
                  </button>
                </div>
              </TableCell>
            </TableRow>
          )})}
        </TableBody>
      </Table>
      </div>
    </>
  );
}

export function MonthlyStatsSummary({ 
  totalHours, 
  totalDays, 
  averageHours 
}: { 
  totalHours: number; 
  totalDays: number; 
  averageHours: number; 
}) {
  const formatHours = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
      <div className="text-center">
        <p className="text-sm text-gray-600">Total de Horas</p>
        <p className="text-xl font-bold text-gray-900">
          {formatHours(totalHours)}
        </p>
      </div>
      <div className="text-center">
        <p className="text-sm text-gray-600">Dias Trabalhados</p>
        <p className="text-xl font-bold text-gray-900">
          {totalDays}
        </p>
      </div>
      <div className="text-center">
        <p className="text-sm text-gray-600">Média Diária</p>
        <p className="text-xl font-bold text-gray-900">
          {formatHours(averageHours)}
        </p>
      </div>
    </div>
  );
}
