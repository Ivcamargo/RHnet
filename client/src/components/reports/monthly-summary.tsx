import { useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar } from "lucide-react";

interface TimeEntry {
  id: number;
  clockInTime: string | null;
  clockOutTime: string | null;
  totalHours: string | null;
  status: string;
  date: string;
  faceRecognitionVerified: boolean;
}

interface MonthlyTimeTableProps {
  entries: TimeEntry[];
}

export function MonthlyTimeTable({ entries }: MonthlyTimeTableProps) {
  const sortedEntries = useMemo(() => {
    return [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [entries]);

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

  return (
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
            <TableRow key={entry.id} className="border-b border-gray-100 hover:bg-gray-50">
              <TableCell className="py-3 px-4 text-sm text-gray-900">
                {formatDate(entry.date)}
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
                {entry.faceRecognitionVerified ? (
                  <span className="text-green-600 text-sm">✓ Verificado</span>
                ) : (
                  <span className="text-gray-400 text-sm">-</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
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
