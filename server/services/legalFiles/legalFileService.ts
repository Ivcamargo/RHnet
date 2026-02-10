/**
 * Legal File Service
 * Orchestrates AFD/AEJ generation, storage, and import
 */

import { db } from '../../db';
import { legalFiles, legalNsrSequences, timeEntries, users, companies, absences, timeBankTransactions } from '@shared/schema';
import { generateAFD, formatDate, formatTime, type AFDRecord } from './afdGenerator';
import { generateAEJ, type AEJEmployee, type AEJTimeEntry } from './aejGenerator';
import { parseAFD, convertAFDToTimeEntries } from './afdParser';
import { getAbsenceMTECode, getTimeBankMTECode, formatDateForTipo07, calculateMinutesForAbsence, clampDateToPeriod, getBusinessDaysArray } from './tipo07Mapper';
import { eq, and, gte, lte, sql } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';

const LEGAL_FILES_DIR = path.join(process.cwd(), 'legal_files');

// Ensure directory exists
if (!fs.existsSync(LEGAL_FILES_DIR)) {
  fs.mkdirSync(LEGAL_FILES_DIR, { recursive: true });
}

export interface ExportAFDRequest {
  companyId: number;
  periodStart: Date;
  periodEnd: Date;
  userId: string;
}

export interface ExportAEJRequest {
  companyId: number;
  periodStart: Date;
  periodEnd: Date;
  userId: string;
}

export interface ImportAFDRequest {
  companyId: number;
  fileContent: string;
  userId: string;
}

/**
 * Reserve NSR range for a company
 */
async function reserveNSR(companyId: number, count: number): Promise<{ startNsr: number; endNsr: number }> {
  // Try to find existing sequence
  const [sequence] = await db
    .select()
    .from(legalNsrSequences)
    .where(eq(legalNsrSequences.companyId, companyId))
    .limit(1);

  if (sequence) {
    // Update existing
    const startNsr = sequence.currentNsr + 1;
    const endNsr = startNsr + count - 1;
    
    await db
      .update(legalNsrSequences)
      .set({ 
        currentNsr: endNsr,
        updatedAt: new Date()
      })
      .where(eq(legalNsrSequences.companyId, companyId));
    
    return { startNsr, endNsr };
  } else {
    // Create new sequence
    const startNsr = 1;
    const endNsr = count;
    
    await db
      .insert(legalNsrSequences)
      .values({
        companyId,
        currentNsr: endNsr,
        repIdentifier: 'REP-P-001'
      });
    
    return { startNsr, endNsr };
  }
}

/**
 * Export AFD file
 */
export async function exportAFD(request: ExportAFDRequest): Promise<{ id: number; filePath: string }> {
  const { companyId, periodStart, periodEnd, userId } = request;

  // Get company info
  const [company] = await db
    .select()
    .from(companies)
    .where(eq(companies.id, companyId))
    .limit(1);

  if (!company) {
    throw new Error('Empresa não encontrada');
  }

  // Get time entries for period
  const entries = await db
    .select({
      id: timeEntries.id,
      userId: timeEntries.userId,
      clockIn: timeEntries.clockInTime,
      clockOut: timeEntries.clockOutTime,
      userCpf: users.cpf,
      userCompanyId: users.companyId
    })
    .from(timeEntries)
    .innerJoin(users, eq(timeEntries.userId, users.id))
    .where(
      and(
        eq(users.companyId, companyId),
        gte(timeEntries.clockInTime, periodStart),
        lte(timeEntries.clockInTime, periodEnd)
      )
    )
    .orderBy(timeEntries.clockInTime);

  // Convert to AFD records
  const afdRecords: AFDRecord[] = [];
  for (const entry of entries) {
    if (!entry.userCpf) continue;

    if (entry.clockIn) {
      afdRecords.push({
        type: '3',
        cpf: entry.userCpf,
        date: formatDate(entry.clockIn),
        time: formatTime(entry.clockIn),
        eventType: 'E'
      });
    }

    if (entry.clockOut) {
      afdRecords.push({
        type: '3',
        cpf: entry.userCpf,
        date: formatDate(entry.clockOut),
        time: formatTime(entry.clockOut),
        eventType: 'S'
      });
    }
  }

  // Reserve NSR range
  const recordCount = afdRecords.length + 3; // +3 for header, REP, trailer
  const { startNsr, endNsr } = await reserveNSR(companyId, recordCount);

  // Generate AFD
  const { content, hash } = generateAFD({
    companyId,
    companyCnpj: company.cnpj || '',
    companyName: company.name,
    periodStart: formatDate(periodStart),
    periodEnd: formatDate(periodEnd),
    repIdentifier: 'REP-P-001',
    fabricanteCnpj: '00000000000000', // Replace with actual fabricante CNPJ
    records: afdRecords,
    nsrStart: startNsr
  });

  // Save file
  const filename = `AFD_${company.cnpj}_${formatDate(periodStart)}_${formatDate(periodEnd)}.txt`;
  const filePath = path.join(LEGAL_FILES_DIR, filename);
  fs.writeFileSync(filePath, content, 'latin1');

  // Save metadata
  const [metadata] = await db
    .insert(legalFiles)
    .values({
      companyId,
      type: 'AFD',
      periodStart: periodStart.toISOString().split('T')[0],
      periodEnd: periodEnd.toISOString().split('T')[0],
      nsrStart: startNsr,
      nsrEnd: endNsr,
      totalRecords: afdRecords.length,
      filePath: filename,
      sha256Hash: hash,
      repIdentifier: 'REP-P-001',
      generatedBy: userId,
      status: 'generated'
    })
    .returning();

  return { id: metadata.id, filePath: filename };
}

/**
 * Export AEJ file
 */
export async function exportAEJ(request: ExportAEJRequest): Promise<{ id: number; filePath: string }> {
  const { companyId, periodStart, periodEnd, userId } = request;

  // Get company info
  const [company] = await db
    .select()
    .from(companies)
    .where(eq(companies.id, companyId))
    .limit(1);

  if (!company) {
    throw new Error('Empresa não encontrada');
  }

  // Get employees with time entries in period
  const employeeData = await db
    .select({
      userId: users.id,
      cpf: users.cpf,
      firstName: users.firstName,
      lastName: users.lastName,
      admissionDate: users.admissionDate
    })
    .from(users)
    .where(eq(users.companyId, companyId));

  // Get approved absences for the period
  const approvedAbsences = await db
    .select({
      employeeId: absences.employeeId,
      type: absences.type,
      startDate: absences.startDate,
      endDate: absences.endDate,
      totalDays: absences.totalDays,
      userCpf: users.cpf
    })
    .from(absences)
    .innerJoin(users, eq(absences.employeeId, users.id))
    .where(
      and(
        eq(absences.companyId, companyId),
        eq(absences.status, 'approved'),
        // Absence overlaps with period
        lte(absences.startDate, periodEnd),
        gte(absences.endDate, periodStart)
      )
    );

  // Get time bank transactions for the period
  const timeBankTxs = await db
    .select({
      userId: timeBankTransactions.userId,
      transactionType: timeBankTransactions.transactionType,
      hours: timeBankTransactions.hours,
      createdAt: timeBankTransactions.createdAt,
      userCpf: users.cpf
    })
    .from(timeBankTransactions)
    .innerJoin(users, eq(timeBankTransactions.userId, users.id))
    .where(
      and(
        eq(users.companyId, companyId),
        gte(timeBankTransactions.createdAt, periodStart),
        lte(timeBankTransactions.createdAt, periodEnd)
      )
    );

  // Build employees with Tipo 07 data
  const employees: AEJEmployee[] = employeeData
    .filter(e => e.cpf)
    .map(e => {
      const absencesForEmployee = approvedAbsences.filter(a => a.employeeId === e.userId);
      const timeBankForEmployee = timeBankTxs.filter(t => t.userId === e.userId);

      const absencesOrCompensations: Array<{
        date: string;
        type: string;
        minutes: number;
      }> = [];

      // Add absences to Tipo 07 - ONE RECORD PER BUSINESS DAY
      for (const absence of absencesForEmployee) {
        const mteCode = getAbsenceMTECode(absence.type);
        
        // Clamp absence to the export period (only count days within period)
        const absenceStart = new Date(absence.startDate!);
        const absenceEnd = new Date(absence.endDate!);
        const clampedStart = clampDateToPeriod(absenceStart, periodStart, periodEnd);
        const clampedEnd = clampDateToPeriod(absenceEnd, periodStart, periodEnd);
        
        // Get array of all business days within the clamped period
        const businessDays = getBusinessDaysArray(clampedStart, clampedEnd);
        
        if (businessDays.length === 0) continue; // No business days in period
        
        // CRITICAL: Only export minutes for days WITHIN the export period
        // If absence crosses period boundaries, we only count the intersection
        // Example: Absence 5 days (Nov 1-7), export period Nov 5-30
        //          Only export Nov 5-6 (2 days), not the full 5 days
        
        // For standard full-day absences: 480 min per business day
        const minutesPerDay = 480; // 8 hours = 480 minutes
        
        // TODO: Handle fractional-day absences (half days, etc.)
        // For now, we assume all absence days are full workdays
        // Future enhancement: If totalDays contains fractions, distribute accordingly
        
        // Emit one Tipo 07 record per business day
        for (const day of businessDays) {
          absencesOrCompensations.push({
            date: formatDateForTipo07(day),
            type: mteCode,
            minutes: minutesPerDay
          });
        }
      }

      // Add time bank transactions to Tipo 07
      for (const tx of timeBankForEmployee) {
        const mteCode = getTimeBankMTECode(tx.transactionType as 'credit' | 'debit');
        const minutes = Math.round(parseFloat(tx.hours as any) * 60); // Convert hours to minutes
        
        absencesOrCompensations.push({
          date: formatDateForTipo07(new Date(tx.createdAt!)),
          type: mteCode,
          minutes
        });
      }

      return {
        cpf: e.cpf!,
        firstName: e.firstName || '',
        lastName: e.lastName || '',
        admissionDate: e.admissionDate ? formatDate(e.admissionDate) : formatDate(new Date()),
        contractedHours: 480, // 8 hours = 480 minutes (default)
        absencesOrCompensations: absencesOrCompensations.length > 0 ? absencesOrCompensations : undefined
      };
    });

  // Get time entries
  const entries = await db
    .select({
      userId: timeEntries.userId,
      clockIn: timeEntries.clockInTime,
      clockOut: timeEntries.clockOutTime,
      userCpf: users.cpf
    })
    .from(timeEntries)
    .innerJoin(users, eq(timeEntries.userId, users.id))
    .where(
      and(
        eq(users.companyId, companyId),
        gte(timeEntries.clockInTime, periodStart),
        lte(timeEntries.clockInTime, periodEnd)
      )
    );

  const aejEntries: AEJTimeEntry[] = entries
    .filter(e => e.userCpf)
    .map(e => ({
      cpf: e.userCpf!,
      date: formatDate(e.clockIn!),
      clockIn: e.clockIn ? formatTime(e.clockIn) : undefined,
      clockOut: e.clockOut ? formatTime(e.clockOut) : undefined,
      totalMinutes: e.clockIn && e.clockOut ? 
        Math.floor((new Date(e.clockOut).getTime() - new Date(e.clockIn).getTime()) / 60000) : 0
    }));

  // Generate AEJ
  const { content, hash } = generateAEJ({
    companyId,
    companyCnpj: company.cnpj || '',
    companyName: company.name,
    periodStart: formatDate(periodStart),
    periodEnd: formatDate(periodEnd),
    repIdentifier: 'REP-P-001',
    employees,
    timeEntries: aejEntries,
    ptpIdentifier: 'RHNet PTRP',
    ptpVersion: '1.0.0'
  });

  // Save file
  const filename = `AEJ_${company.cnpj}_${formatDate(periodStart)}_${formatDate(periodEnd)}.txt`;
  const filePath = path.join(LEGAL_FILES_DIR, filename);
  fs.writeFileSync(filePath, content, 'latin1');

  // Save metadata
  const [metadata] = await db
    .insert(legalFiles)
    .values({
      companyId,
      type: 'AEJ',
      periodStart: periodStart.toISOString().split('T')[0],
      periodEnd: periodEnd.toISOString().split('T')[0],
      totalRecords: aejEntries.length,
      filePath: filename,
      sha256Hash: hash,
      repIdentifier: 'REP-P-001',
      generatedBy: userId,
      status: 'generated'
    })
    .returning();

  return { id: metadata.id, filePath: filename };
}

/**
 * Import AFD file
 */
export async function importAFD(request: ImportAFDRequest): Promise<{ imported: number; errors: string[] }> {
  const { companyId, fileContent, userId } = request;

  // Parse AFD
  const parsed = parseAFD(fileContent);

  if (!parsed.isValid) {
    return { imported: 0, errors: parsed.errors };
  }

  // Convert to time entries
  const entries = convertAFDToTimeEntries(parsed, companyId);

  // TODO: Match CPF to userId and insert time entries
  // This requires additional logic to find or create users

  return { imported: entries.length, errors: [] };
}

/**
 * Get legal file by ID and return file path
 */
export async function getLegalFile(id: number, companyId: number): Promise<string> {
  const [file] = await db
    .select()
    .from(legalFiles)
    .where(and(
      eq(legalFiles.id, id),
      eq(legalFiles.companyId, companyId)
    ))
    .limit(1);

  if (!file || !file.filePath) {
    throw new Error('Arquivo não encontrado');
  }

  return path.join(LEGAL_FILES_DIR, file.filePath);
}

/**
 * List legal files for a company
 */
export async function listLegalFiles(companyId: number) {
  return db
    .select()
    .from(legalFiles)
    .where(eq(legalFiles.companyId, companyId))
    .orderBy(sql`${legalFiles.generatedAt} DESC`);
}
