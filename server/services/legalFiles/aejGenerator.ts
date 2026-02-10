/**
 * AEJ (Arquivo Eletrônico de Jornada) Generator
 * Generates AEJ files per Portaria 671 - MTE
 */

import { calculateCRC16 } from './crc16';
import crypto from 'crypto';

export interface AEJEmployee {
  cpf: string;
  firstName: string;
  lastName: string;
  admissionDate: string;
  contractedHours: number; // Daily hours in minutes
  esocialMatriculas?: string[]; // OPTIONAL: eSocial registration numbers for multiple employment bonds
  absencesOrCompensations?: Array<{ // OPTIONAL: Absences or time bank compensations
    date: string; // DDMMYYYY
    type: string; // Code for absence/compensation type
    minutes: number; // Duration in minutes
  }>;
}

export interface AEJTimeEntry {
  cpf: string;
  date: string; // DDMMYYYY
  clockIn?: string; // HHMM
  clockOut?: string; // HHMM
  totalMinutes: number;
}

export interface AEJOptions {
  companyId: number;
  companyCnpj: string;
  companyName: string;
  periodStart: string; // DDMMYYYY
  periodEnd: string; // DDMMYYYY
  repIdentifier: string;
  employees: AEJEmployee[];
  timeEntries: AEJTimeEntry[];
  ptpIdentifier: string;
  ptpVersion: string;
}

/**
 * Generate AEJ file content
 */
export function generateAEJ(options: AEJOptions): { content: string; hash: string } {
  const lines: string[] = [];
  
  // Tipo 01 - Cabeçalho
  const generationDateTime = formatDateTime(new Date());
  const header = [
    '01', // Tipo
    '1', // Indicador (1 = CNPJ, 2 = CPF)
    options.companyCnpj.padEnd(14, ' '), // CNPJ
    options.companyName.substring(0, 115).padEnd(115, ' '), // Razão social
    options.periodStart, // Início período DDMMYYYY
    options.periodEnd, // Fim período DDMMYYYY
    generationDateTime // Data/hora geração DDMMYYYYHHMM
  ].join('\t');
  
  const headerWithCrc = header + '\t' + calculateCRC16(header);
  lines.push(headerWithCrc);

  // Tipo 02 - REPs utilizados
  const repRecord = [
    '02', // Tipo
    options.repIdentifier.substring(0, 20).padEnd(20, ' '), // Identificador REP
    '3', // Tipo REP (3 = REP-P)
    options.periodStart, // Início utilização
    options.periodEnd // Fim utilização
  ].join('\t');
  
  const repRecordWithCrc = repRecord + '\t' + calculateCRC16(repRecord);
  lines.push(repRecordWithCrc);

  // Tipo 03 - Vínculos + Tipo 04 - Horário contratual + Tipo 05 - Marcações
  // Tipo 06 - Matrícula eSocial (OPCIONAL - somente para múltiplos vínculos)
  // Tipo 07 - Ausências e Banco de Horas (OPCIONAL - somente quando houver dados)
  for (const employee of options.employees) {
    // Tipo 03 - Vínculo
    const vinculo = [
      '03', // Tipo
      employee.cpf.replace(/\D/g, '').padStart(11, '0'), // CPF (zero-padded numeric)
      `${employee.firstName} ${employee.lastName}`.substring(0, 70).padEnd(70, ' '), // Nome
      employee.admissionDate // Data admissão DDMMYYYY
    ].join('\t');
    
    const vinculoWithCrc = vinculo + '\t' + calculateCRC16(vinculo);
    lines.push(vinculoWithCrc);

    // Tipo 04 - Horário contratual
    const horario = [
      '04', // Tipo
      employee.cpf.replace(/\D/g, '').padStart(11, '0'), // CPF (zero-padded numeric)
      employee.contractedHours.toString().padStart(4, '0'), // Duração jornada em minutos
      options.periodStart, // Início vigência
      options.periodEnd // Fim vigência
    ].join('\t');
    
    const horarioWithCrc = horario + '\t' + calculateCRC16(horario);
    lines.push(horarioWithCrc);

    // Tipo 05 - Marcações deste funcionário
    const employeeEntries = options.timeEntries.filter(e => e.cpf === employee.cpf);
    for (const entry of employeeEntries) {
      if (entry.clockIn) {
        const marcacaoIn = [
          '05', // Tipo
          employee.cpf.replace(/\D/g, '').padStart(11, '0'), // CPF (zero-padded numeric)
          entry.date, // Data DDMMYYYY
          entry.clockIn, // Hora HHMM
          'E' // Tipo (Entrada)
        ].join('\t');
        
        const marcacaoInWithCrc = marcacaoIn + '\t' + calculateCRC16(marcacaoIn);
        lines.push(marcacaoInWithCrc);
      }

      if (entry.clockOut) {
        const marcacaoOut = [
          '05', // Tipo
          employee.cpf.replace(/\D/g, '').padStart(11, '0'), // CPF (zero-padded numeric)
          entry.date, // Data DDMMYYYY
          entry.clockOut, // Hora HHMM
          'S' // Tipo (Saída)
        ].join('\t');
        
        const marcacaoOutWithCrc = marcacaoOut + '\t' + calculateCRC16(marcacaoOut);
        lines.push(marcacaoOutWithCrc);
      }
    }

    // Tipo 06 - Matrícula eSocial (OPCIONAL - somente para múltiplos vínculos)
    // Gerado apenas quando o funcionário tem múltiplas matrículas eSocial
    if (employee.esocialMatriculas && employee.esocialMatriculas.length > 0) {
      for (const matricula of employee.esocialMatriculas) {
        const tipo06 = [
          '06', // Tipo
          employee.cpf.replace(/\D/g, '').padStart(11, '0'), // CPF (zero-padded numeric)
          matricula.substring(0, 30).padEnd(30, ' ') // Matrícula eSocial (max 30 chars)
        ].join('\t');
        
        const tipo06WithCrc = tipo06 + '\t' + calculateCRC16(tipo06);
        lines.push(tipo06WithCrc);
      }
    }
    
    // Tipo 07 - Ausências e Banco de Horas (OPCIONAL - somente quando houver dados)
    // Gerado apenas quando há ausências ou compensações registradas
    if (employee.absencesOrCompensations && employee.absencesOrCompensations.length > 0) {
      for (const record of employee.absencesOrCompensations) {
        const tipo07 = [
          '07', // Tipo
          employee.cpf.replace(/\D/g, '').padStart(11, '0'), // CPF (zero-padded numeric)
          record.date, // Data DDMMYYYY
          record.type.padEnd(10, ' '), // Código do tipo (max 10 chars)
          record.minutes.toString().padStart(5, '0') // Quantidade em minutos (5 digits)
        ].join('\t');
        
        const tipo07WithCrc = tipo07 + '\t' + calculateCRC16(tipo07);
        lines.push(tipo07WithCrc);
      }
    }
  }

  // Tipo 08 - Identificação do PTRP
  const ptrp = [
    '08', // Tipo (corrigido de 09 para 08)
    options.ptpIdentifier.substring(0, 60).padEnd(60, ' '), // Nome do PTRP
    options.ptpVersion.substring(0, 10).padEnd(10, ' '), // Versão
    generationDateTime // Data/hora geração
  ].join('\t');
  
  const ptrpWithCrc = ptrp + '\t' + calculateCRC16(ptrp);
  lines.push(ptrpWithCrc);

  // Tipo 99 - Totalizador de registros
  const totalRecords = lines.length + 1; // Conta todos os registros anteriores + este próprio registro
  const totalizador = [
    '99', // Tipo
    totalRecords.toString().padStart(6, '0') // Total de registros (incluindo este)
  ].join('\t');
  
  const totalizadorWithCrc = totalizador + '\t' + calculateCRC16(totalizador);
  lines.push(totalizadorWithCrc);

  // Join with CRLF
  const content = lines.join('\r\n') + '\r\n';
  
  // Calculate SHA-256 hash
  const hash = crypto.createHash('sha256').update(Buffer.from(content, 'latin1')).digest('hex');

  return {
    content,
    hash
  };
}

/**
 * Format date/time as DDMMYYYYHHMM
 */
function formatDateTime(date: Date): string {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear().toString();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${day}${month}${year}${hours}${minutes}`;
}
