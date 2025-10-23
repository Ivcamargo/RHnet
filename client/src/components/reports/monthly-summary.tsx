import { useMemo, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Clock, Calendar, AlertTriangle, MapPin, Shield, CheckCircle, XCircle } from "lucide-react";

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
}

interface MonthlyTimeTableProps {
  entries: TimeEntry[];
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
    return new Date(dateString).toLocaleDateString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
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
    // Irregular se: falta de registro, atraso, horário não cumprido, falta de saída
    if (entry.status === "incomplete") return true;
    if (!entry.clockInTime) return true; // Falta
    if (!entry.clockOutTime && entry.status !== "active") return true; // Não bateu saída
    if (entry.clockInShiftCompliant === false || entry.clockOutShiftCompliant === false) return true; // Fora do horário
    return false;
  };

  return (
    <>
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              Detalhes de Validação - {selectedEntry && formatDate(selectedEntry.date)}
            </DialogTitle>
          </DialogHeader>
          
          {selectedEntry && (
            <div className="space-y-6 mt-4 max-h-[70vh] overflow-y-auto">
              {/* Status */}
              <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                <span className="text-sm font-medium">Status do Registro:</span>
                {getStatusBadge(selectedEntry)}
              </div>

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

                  {/* Foto */}
                  {selectedEntry.clockInPhotoUrl && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-xs font-medium mb-2">Foto de Entrada:</p>
                      <img 
                        src={selectedEntry.clockInPhotoUrl} 
                        alt="Foto de entrada" 
                        className="w-32 h-32 object-cover rounded border"
                      />
                    </div>
                  )}
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

                    {/* Foto */}
                    {selectedEntry.clockOutPhotoUrl && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-xs font-medium mb-2">Foto de Saída:</p>
                        <img 
                          src={selectedEntry.clockOutPhotoUrl} 
                          alt="Foto de saída" 
                          className="w-32 h-32 object-cover rounded border"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

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

      <div className="overflow-x-auto">
        <Table>
        <TableHeader>
          <TableRow className="border-b border-gray-200">
            <TableHead className="text-left py-3 px-4 font-medium text-gray-600">Data</TableHead>
            <TableHead className="text-left py-3 px-4 font-medium text-gray-600">Entrada</TableHead>
            <TableHead className="text-left py-3 px-4 font-medium text-gray-600">Saída</TableHead>
            <TableHead className="text-left py-3 px-4 font-medium text-gray-600">Horas Trabalhadas</TableHead>
            <TableHead className="text-left py-3 px-4 font-medium text-gray-600">Status</TableHead>
            <TableHead className="text-left py-3 px-4 font-medium text-gray-600">Verificação</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedEntries.map((entry) => (
            <TableRow key={entry.id} className={`border-b border-gray-100 hover:bg-gray-50 ${hasValidationIssues(entry) ? 'bg-amber-50/50' : ''}`}>
              <TableCell className="py-3 px-4 text-sm text-gray-900">
                <div className="flex items-center gap-1">
                  {formatDate(entry.date)}
                  {hasValidationIssues(entry) && (
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                  )}
                </div>
              </TableCell>
              <TableCell className="py-3 px-4 text-sm text-gray-900">
                {formatTime(entry.clockInTime)}
              </TableCell>
              <TableCell className="py-3 px-4 text-sm text-gray-900">
                {formatTime(entry.clockOutTime)}
              </TableCell>
              <TableCell className="py-3 px-4 text-sm text-gray-900">
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3 text-gray-400" />
                  <span>{getWorkingHours(entry)}</span>
                </div>
              </TableCell>
              <TableCell className="py-3 px-4">
                {getStatusBadge(entry)}
              </TableCell>
              <TableCell className="py-3 px-4">
                <div className="flex flex-col gap-1">
                  {entry.faceRecognitionVerified ? (
                    <span className="text-green-600 text-xs">✓ Facial</span>
                  ) : (
                    <span className="text-gray-400 text-xs">-</span>
                  )}
                  <button
                    onClick={() => openDetails(entry)}
                    className={`text-xs underline cursor-pointer text-left ${
                      (entry.clockInValidationMessage || entry.clockOutValidationMessage || isIrregular(entry))
                        ? 'text-amber-600 hover:text-amber-700'
                        : 'text-blue-600 hover:text-blue-700'
                    }`}
                    data-testid={`button-details-${entry.id}`}
                  >
                    {(entry.clockInValidationMessage || entry.clockOutValidationMessage || isIrregular(entry))
                      ? '⚠ Ver detalhes'
                      : 'Ver detalhes'}
                  </button>
                </div>
              </TableCell>
            </TableRow>
          ))}
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
