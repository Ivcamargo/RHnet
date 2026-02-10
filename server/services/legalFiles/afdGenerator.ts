/**
 * AFD (Arquivo Fonte de Dados) Generator
 * Generates AFD files per Portaria 671 - MTE
 */

import { calculateCRC16 } from './crc16';
import crypto from 'crypto';

export interface AFDRecord {
  type: string;
  nsr?: number;
  cpf?: string;
  pis?: string;
  date?: string; // DDMMYYYY
  time?: string; // HHMM
  eventType?: string; // E, S, etc
}

export interface AFDOptions {
  companyId: number;
  companyCnpj: string;
  companyName: string;
  periodStart: string; // DDMMYYYY
  periodEnd: string; // DDMMYYYY
  repIdentifier: string;
  fabricanteCnpj: string;
  records: AFDRecord[];
  nsrStart: number;
}

/**
 * Generate AFD file content in ISO 8859-1 format
 */
export function generateAFD(options: AFDOptions): { content: string; hash: string; nsrEnd: number } {
  const lines: string[] = [];
  let currentNsr = options.nsrStart;
  
  // Tipo 1 - Cabeçalho (Header)
  const generationDateTime = formatDateTime(new Date());
  const header = [
    '1', // Tipo
    '1', // Indicador (1 = CNPJ, 2 = CPF)
    options.companyCnpj.padEnd(14, ' '), // CNPJ
    '', // CEI (vazio se não houver)
    options.companyName.substring(0, 150).padEnd(150, ' '), // Razão social (max 150)
    options.periodStart, // Data inicial DDMMYYYY
    options.periodEnd, // Data final DDMMYYYY
    generationDateTime, // Data/hora geração DDMMYYYYHHMM
    '003', // Versão do layout
    options.fabricanteCnpj.padEnd(14, ' ') // CNPJ fabricante
  ].join('\t');
  
  const headerWithCrc = header + '\t' + calculateCRC16(header);
  lines.push(headerWithCrc);

  // Tipo 2 - Identificação do REP
  currentNsr++;
  const repRecord = [
    '2', // Tipo
    currentNsr.toString().padStart(9, '0'), // NSR
    options.repIdentifier.substring(0, 20).padEnd(20, ' '), // Identificador REP
    '3', // Tipo REP (3 = REP-P)
    '1.0.0', // Versão do software
    '003' // Layout
  ].join('\t');
  
  const repRecordWithCrc = repRecord + '\t' + calculateCRC16(repRecord);
  lines.push(repRecordWithCrc);

  // Tipo 3 - Marcações de ponto
  let type3Count = 0;
  for (const record of options.records.filter(r => r.type === '3')) {
    currentNsr++;
    type3Count++;
    
    const marcacao = [
      '3', // Tipo
      currentNsr.toString().padStart(9, '0'), // NSR
      record.date || '', // Data DDMMYYYY
      record.time || '', // Hora HHMM
      (record.cpf || record.pis || '').replace(/\D/g, '').padStart(12, '0'), // PIS/CPF (zero-padded numeric)
      record.eventType || 'E' // Tipo de marcação (E=Entrada, S=Saída)
    ].join('\t');
    
    const marcacaoWithCrc = marcacao + '\t' + calculateCRC16(marcacao);
    lines.push(marcacaoWithCrc);
  }

  // Tipo 9 - Trailer (Final)
  currentNsr++;
  const trailer = [
    '9', // Tipo
    currentNsr.toString().padStart(9, '0'), // NSR
    '1', // Qtd tipo 2
    type3Count.toString(), // Qtd tipo 3
    '0', // Qtd tipo 4
    '0', // Qtd tipo 5
    '0' // Qtd tipo 6
  ].join('\t');
  
  const trailerWithCrc = trailer + '\t' + calculateCRC16(trailer);
  lines.push(trailerWithCrc);

  // Join with CRLF (CR+LF = \r\n)
  const content = lines.join('\r\n') + '\r\n';
  
  // Calculate SHA-256 hash
  const hash = crypto.createHash('sha256').update(Buffer.from(content, 'latin1')).digest('hex');

  return {
    content,
    hash,
    nsrEnd: currentNsr
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

/**
 * Format date as DDMMYYYY
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear().toString();
  return `${day}${month}${year}`;
}

/**
 * Format time as HHMM
 */
export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const hours = d.getHours().toString().padStart(2, '0');
  const minutes = d.getMinutes().toString().padStart(2, '0');
  return `${hours}${minutes}`;
}
