/**
 * AFD (Arquivo Fonte de Dados) Parser
 * Parses and validates AFD files per Portaria 671
 */

import { verifyCRC16 } from './crc16';

export interface ParsedAFDRecord {
  type: string;
  nsr?: number;
  cpf?: string;
  date?: Date;
  time?: string;
  eventType?: string;
  raw: string;
}

export interface ParsedAFD {
  header: {
    cnpj: string;
    companyName: string;
    periodStart: string;
    periodEnd: string;
    layoutVersion: string;
  };
  records: ParsedAFDRecord[];
  trailer: {
    totalType2: number;
    totalType3: number;
    totalType4: number;
  };
  isValid: boolean;
  errors: string[];
}

/**
 * Parse AFD file content
 */
export function parseAFD(content: string): ParsedAFD {
  const lines = content.split(/\r?\n/).filter(line => line.trim().length > 0);
  const records: ParsedAFDRecord[] = [];
  const errors: string[] = [];
  let header: any = null;
  let trailer: any = null;
  let lastNsr = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const fields = line.split('\t');
    const type = fields[0];

    // Verify CRC if present
    if (fields.length > 1) {
      const dataFields = fields.slice(0, -1);
      const dataPart = dataFields.join('\t');
      const crc = fields[fields.length - 1];
      
      if (!verifyCRC16(dataPart, crc)) {
        errors.push(`Linha ${i + 1}: CRC inválido`);
      }
    }

    switch (type) {
      case '1': // Header
        header = {
          cnpj: fields[1]?.trim() || '',
          companyName: fields[3]?.trim() || '',
          periodStart: fields[4] || '',
          periodEnd: fields[5] || '',
          layoutVersion: fields[7] || ''
        };
        
        if (header.layoutVersion !== '003') {
          errors.push(`Versão do layout inválida: ${header.layoutVersion}. Esperado: 003`);
        }
        break;

      case '2': // REP Identification
        const nsr2 = parseInt(fields[1] || '0');
        if (nsr2 <= lastNsr) {
          errors.push(`Linha ${i + 1}: NSR fora de ordem (${nsr2} <= ${lastNsr})`);
        }
        lastNsr = nsr2;
        break;

      case '3': // Time entry
        const nsr3 = parseInt(fields[1] || '0');
        if (nsr3 <= lastNsr) {
          errors.push(`Linha ${i + 1}: NSR fora de ordem (${nsr3} <= ${lastNsr})`);
        }
        lastNsr = nsr3;

        const dateStr = fields[2]; // DDMMYYYY
        const timeStr = fields[3]; // HHMM
        const cpf = fields[4]?.trim();
        const eventType = fields[5]?.trim();

        // Parse date
        let parsedDate: Date | undefined;
        if (dateStr && dateStr.length === 8) {
          const day = parseInt(dateStr.substring(0, 2));
          const month = parseInt(dateStr.substring(2, 4)) - 1;
          const year = parseInt(dateStr.substring(4, 8));
          parsedDate = new Date(year, month, day);
        }

        records.push({
          type: '3',
          nsr: nsr3,
          cpf,
          date: parsedDate,
          time: timeStr,
          eventType,
          raw: line
        });
        break;

      case '9': // Trailer
        const nsr9 = parseInt(fields[1] || '0');
        if (nsr9 <= lastNsr) {
          errors.push(`Linha ${i + 1}: NSR fora de ordem (${nsr9} <= ${lastNsr})`);
        }
        lastNsr = nsr9;

        trailer = {
          totalType2: parseInt(fields[2] || '0'),
          totalType3: parseInt(fields[3] || '0'),
          totalType4: parseInt(fields[4] || '0')
        };
        break;
    }
  }

  // Validate counts
  const actualType3 = records.filter(r => r.type === '3').length;
  if (trailer && trailer.totalType3 !== actualType3) {
    errors.push(`Trailer indica ${trailer.totalType3} registros tipo 3, mas foram encontrados ${actualType3}`);
  }

  return {
    header: header || {
      cnpj: '',
      companyName: '',
      periodStart: '',
      periodEnd: '',
      layoutVersion: ''
    },
    records,
    trailer: trailer || {
      totalType2: 0,
      totalType3: 0,
      totalType4: 0
    },
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Convert parsed AFD records to time entries format
 */
export function convertAFDToTimeEntries(parsed: ParsedAFD, companyId: number): any[] {
  const entries: any[] = [];
  const groupedByDate: Map<string, any[]> = new Map();

  // Group records by CPF and date
  for (const record of parsed.records.filter(r => r.type === '3')) {
    if (!record.cpf || !record.date) continue;

    const dateKey = `${record.cpf}_${record.date.toISOString().split('T')[0]}`;
    if (!groupedByDate.has(dateKey)) {
      groupedByDate.set(dateKey, []);
    }
    groupedByDate.get(dateKey)!.push(record);
  }

  // Convert to time entries (pairing entries and exits)
  for (const [key, records] of groupedByDate) {
    const sorted = records.sort((a, b) => (a.time || '').localeCompare(b.time || ''));
    const [cpf, dateStr] = key.split('_');

    for (let i = 0; i < sorted.length; i += 2) {
      const entryRecord = sorted[i];
      const exitRecord = sorted[i + 1];

      if (entryRecord && exitRecord) {
        const date = new Date(dateStr);
        const [entryHH, entryMM] = (entryRecord.time || '0000').match(/.{1,2}/g) || ['00', '00'];
        const [exitHH, exitMM] = (exitRecord.time || '0000').match(/.{1,2}/g) || ['00', '00'];

        const clockIn = new Date(date);
        clockIn.setHours(parseInt(entryHH), parseInt(entryMM), 0, 0);

        const clockOut = new Date(date);
        clockOut.setHours(parseInt(exitHH), parseInt(exitMM), 0, 0);

        entries.push({
          cpf,
          clockIn,
          clockOut,
          companyId,
          source: 'AFD_IMPORT'
        });
      }
    }
  }

  return entries;
}
