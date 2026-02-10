/**
 * Tipo 07 - Mapeamento de Ausências e Banco de Horas
 * Conforme Portaria 671/2021 MTE - Códigos para registros de ausências
 */

/**
 * Mapeamento de tipos de ausência do RHNet para códigos MTE
 * Baseado na legislação trabalhista brasileira
 */
export const ABSENCE_TYPE_TO_MTE_CODE: Record<string, string> = {
  // Férias - CLT Art. 129 e seguintes
  'vacation': 'FERIAS',
  
  // Atestado Médico - CLT Art. 473
  'medical_leave': 'ATESTMED',
  
  // Licença Maternidade - CLT Art. 392 (120-180 dias)
  'maternity_leave': 'LICMAT',
  
  // Licença Paternidade - CLT Art. 473, X e Lei 13.257/2016 (5-20 dias)
  'paternity_leave': 'LICPAT',
  
  // Luto/Nojo - CLT Art. 473, I (até 2 dias consecutivos)
  'bereavement': 'LUTO',
  
  // Casamento - CLT Art. 473, II (até 3 dias consecutivos)
  'wedding': 'CASAMENTO',
  
  // Doação de Sangue - CLT Art. 473, IV (1 dia a cada 12 meses)
  'blood_donation': 'DOASANGUE',
  
  // Serviço Militar - CLT Art. 472
  'military_service': 'SERVMIL',
  
  // Júri/Testemunho - CLT Art. 430 e Art. 822
  'jury_duty': 'JURI',
  
  // Outros tipos de ausência (genérico)
  'other': 'OUTROS'
};

/**
 * Códigos para transações de banco de horas
 */
export const TIME_BANK_CODES = {
  CREDIT: 'BANCOCRED', // Crédito de horas (horas extras acumuladas)
  DEBIT: 'BANCODEB'    // Débito de horas (compensação/uso do banco)
};

/**
 * Tipo 07 Record Structure
 */
export interface Tipo07Record {
  cpf: string;
  date: string; // DDMMYYYY
  type: string; // Código MTE
  minutes: number; // Duração em minutos
}

/**
 * Converte tipo de ausência do RHNet para código MTE
 */
export function getAbsenceMTECode(absenceType: string): string {
  return ABSENCE_TYPE_TO_MTE_CODE[absenceType] || 'OUTROS';
}

/**
 * Converte tipo de transação de banco de horas para código MTE
 */
export function getTimeBankMTECode(transactionType: 'credit' | 'debit'): string {
  return transactionType === 'credit' 
    ? TIME_BANK_CODES.CREDIT 
    : TIME_BANK_CODES.DEBIT;
}

/**
 * Calcula minutos para ausência usando o totalDays já computado
 */
export function calculateMinutesForAbsence(totalDays: number): number {
  // Para ausências, normalmente contamos 8h por dia útil
  const MINUTES_PER_DAY = 480; // 8 horas = 480 minutos
  
  return totalDays * MINUTES_PER_DAY;
}

/**
 * Clamp date to period boundaries
 */
export function clampDateToPeriod(date: Date, periodStart: Date, periodEnd: Date): Date {
  if (date < periodStart) return periodStart;
  if (date > periodEnd) return periodEnd;
  return date;
}

/**
 * Calculate business days between two dates (inclusive)
 */
export function calculateBusinessDays(startDate: Date, endDate: Date): number {
  let count = 0;
  const current = new Date(startDate);
  
  while (current <= endDate) {
    const dayOfWeek = current.getDay();
    // 0 = Sunday, 6 = Saturday
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }
  
  return count;
}

/**
 * Generate array of business days between two dates (inclusive)
 * Each day returned is a Date object at midnight
 */
export function getBusinessDaysArray(startDate: Date, endDate: Date): Date[] {
  const days: Date[] = [];
  const current = new Date(startDate);
  current.setHours(0, 0, 0, 0); // Normalize to midnight
  
  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);
  
  while (current <= end) {
    const dayOfWeek = current.getDay();
    // 0 = Sunday, 6 = Saturday - only business days
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      days.push(new Date(current));
    }
    current.setDate(current.getDate() + 1);
  }
  
  return days;
}

/**
 * Formata data para DDMMYYYY
 */
export function formatDateForTipo07(date: Date): string {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear().toString();
  return `${day}${month}${year}`;
}
