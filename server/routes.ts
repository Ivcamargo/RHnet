import type { Express } from "express";
import { createServer, type Server } from "http";
import path from "path";
import fs from "fs";
import { storage } from "./storage";
import { setupLocalAuth, isAuthenticatedHybrid, hashPassword } from "./localAuth";
import { 
  insertDepartmentSchema, 
  clockInSchema, 
  clockOutSchema, 
  insertCompanySchema,
  insertHolidaySchema,
  insertMessageSchema,
  insertMessageCategorySchema,
  insertMessageRecipientSchema,
  insertDocumentSchema,
  insertCourseSchema,
  insertCourseQuestionSchema,
  insertCourseAnswerSchema,
  insertEmployeeCourseSchema,
  insertCertificateSchema,
  updateDocumentSchema,
  updateCourseSchema,
  updateEmployeeCourseSchema,
  insertCompleteEmployeeSchema,
  baseCompleteEmployeeSchema,
  insertAuditLogSchema,
  insertSectorSchema,
  insertDepartmentShiftSchema,
  insertDepartmentShiftBreakSchema,
  insertSupervisorAssignmentSchema,
  insertUserShiftAssignmentSchema,
  insertFaceProfileSchema,
  insertTimePeriodSchema,
  insertRotationTemplateSchema,
  insertRotationSegmentSchema,
  insertRotationUserAssignmentSchema,
  insertRotationExceptionSchema,
  insertJobRequirementSchema,
  insertLeadSchema,
  updateLeadStatusSchema,
  type ClockInRequest,
  type ClockOutRequest,
  type InsertMessage,
  type InsertMessageCategory,
  type InsertDocument,
  type InsertCourse,
  type InsertCourseQuestion,
  type InsertCourseAnswer,
  type InsertEmployeeCourse,
  type InsertCertificate,
  type InsertCompleteEmployee,
  type InsertAuditLog,
  type InsertSector,
  type InsertDepartmentShift,
  type InsertDepartmentShiftBreak,
  type InsertSupervisorAssignment,
  type InsertUserShiftAssignment,
  type InsertFaceProfile,
  type InsertTimePeriod,
  type InsertRotationTemplate,
  type InsertRotationSegment,
  type InsertRotationUserAssignment,
  type InsertRotationException
} from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import { getBrazilianTime, getBrazilianDateString, convertToLocal, convertLocalToUTC } from "../shared/timezone";
import { parse } from "csv-parse/sync";
import { stringify } from "csv-stringify/sync";
import { sendLeadNotificationEmail, generateTemporaryPassword, sendTemporaryPasswordEmail } from "./emailService";

// Helper function to create audit logs
async function createAuditLog(
  userId: string, 
  companyId: number, 
  action: string, 
  targetType: string, 
  targetId: string, 
  details?: any,
  targetUserId?: string
) {
  try {
    await storage.createAuditLog({
      performedBy: userId, // Fixed: use performedBy instead of userId
      companyId,
      action,
      targetResource: targetId, // Fixed: use targetResource instead of targetId
      details: details ? JSON.stringify(details) : null,
      targetUserId,
      success: true // Mark as successful
    });
  } catch (error) {
    console.error("Failed to create audit log:", error);
    // Don't throw error to avoid disrupting main operation
  }
}

// Helper function to calculate distance between two coordinates
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
}

// Helper function to calculate hours between timestamps
function calculateHours(start: Date, end: Date): number {
  const diffMs = end.getTime() - start.getTime();
  return Number((diffMs / (1000 * 60 * 60)).toFixed(2));
}

// Helper function to get user's active shift for a specific date
async function getUserShiftForDate(
  userId: string,
  date: Date,
  storage: Storage
): Promise<number | null> {
  try {
    // Get all user shift assignments
    const assignments = await storage.getUserShiftAssignments(userId);
    
    // Filter for active assignments valid on the given date
    const validAssignments = assignments.filter((assignment: any) => {
      if (!assignment.isActive) return false;
      
      const entryDate = new Date(date);
      entryDate.setHours(0, 0, 0, 0); // Normalize to start of day
      
      // Check if assignment is valid on this date
      const startDate = assignment.startDate ? new Date(assignment.startDate) : null;
      const endDate = assignment.endDate ? new Date(assignment.endDate) : null;
      
      if (startDate) {
        startDate.setHours(0, 0, 0, 0);
        if (entryDate < startDate) return false;
      }
      
      if (endDate) {
        endDate.setHours(0, 0, 0, 0);
        if (entryDate > endDate) return false;
      }
      
      return true;
    });
    
    // Return the first valid assignment's shiftId (or null if none found)
    return validAssignments.length > 0 ? validAssignments[0].shiftId : null;
  } catch (error) {
    console.error("Error getting user shift for date:", error);
    return null;
  }
}

// Helper function to compute net worked hours considering breaks
async function computeNetWorkedHours(
  timeEntry: any, // TimeEntry with break entries
  storage: Storage
): Promise<number> {
  // Calculate gross hours (total time between clock-in and clock-out)
  if (!timeEntry.clockInTime || !timeEntry.clockOutTime) {
    return 0;
  }
  
  const grossHours = calculateHours(
    new Date(timeEntry.clockInTime),
    new Date(timeEntry.clockOutTime)
  );
  
  let totalBreakMinutes = 0;
  
  // 1. Subtract unpaid manual breaks (from breakEntries table)
  const manualBreaks = await storage.getBreakEntriesByTimeEntry(timeEntry.id);
  for (const breakEntry of manualBreaks) {
    if (breakEntry.breakStart && breakEntry.breakEnd) {
      const breakDuration = calculateHours(
        new Date(breakEntry.breakStart),
        new Date(breakEntry.breakEnd)
      );
      totalBreakMinutes += breakDuration * 60; // Convert to minutes
    }
  }
  
  // 2. Subtract automatic unpaid breaks (from user's specific shift configuration)
  if (timeEntry.userId && timeEntry.date) {
    // Get the user's assigned shift for this date
    const userShiftId = await getUserShiftForDate(timeEntry.userId, new Date(timeEntry.date), storage);
    
    if (userShiftId) {
      // Get breaks only for the user's specific shift
      const shiftBreaks = await storage.getShiftBreaks(userShiftId);
      
      for (const shiftBreak of shiftBreaks) {
        // Only process unpaid breaks that are set to auto-deduct
        if (!shiftBreak.isPaid && shiftBreak.autoDeduct && shiftBreak.isActive) {
          // Check if minimum work time requirement is met
          const minWorkHours = (shiftBreak.minWorkMinutes || 360) / 60; // Default 6 hours
          
          if (grossHours >= minWorkHours) {
            // Check if there's already a manual break overlapping with this scheduled break
            let hasOverlappingManualBreak = false;
            
            if (shiftBreak.scheduledStart && shiftBreak.scheduledEnd) {
              // More sophisticated overlap detection could be implemented here
              // For now, we'll just check if the break names match
              const matchingManualBreak = manualBreaks.find((mb: any) => 
                mb.type && 
                (mb.type.toLowerCase().includes('almoço') && shiftBreak.name.toLowerCase().includes('almoço')) ||
                (mb.type.toLowerCase().includes('lanche') && shiftBreak.name.toLowerCase().includes('lanche'))
              );
              
              if (matchingManualBreak) {
                hasOverlappingManualBreak = true;
              }
            }
            
            // Only deduct if no overlapping manual break exists
            if (!hasOverlappingManualBreak) {
              totalBreakMinutes += shiftBreak.durationMinutes;
            }
          }
        }
      }
    }
  }
  
  // Calculate net hours
  const netHours = grossHours - (totalBreakMinutes / 60);
  return Math.max(0, Number(netHours.toFixed(2))); // Ensure non-negative result
}

// Helper function to calculate standard working hours for a shift (considering unpaid breaks)
async function calculateStandardWorkingHours(
  departmentId: number | undefined,
  storage: Storage
): Promise<number> {
  try {
    // If no department assigned, default to 8 hours
    if (!departmentId) {
      return 8;
    }
    
    // Get department shifts
    const shifts = await storage.getDepartmentShifts(departmentId);
    
    let standardHours = 8; // Default to 8 hours if no shift configured
    
    if (shifts.length > 0) {
      // Use the first active shift (assuming one shift per day)
      const shift = shifts[0];
      if (shift.startTime && shift.endTime) {
        // Calculate hours between shift start and end
        const [startHour, startMin] = shift.startTime.split(':').map(Number);
        const [endHour, endMin] = shift.endTime.split(':').map(Number);
        
        const startMinutes = startHour * 60 + startMin;
        const endMinutes = endHour * 60 + endMin;
        
        // Handle shifts that cross midnight
        const totalShiftMinutes = endMinutes >= startMinutes 
          ? endMinutes - startMinutes 
          : (24 * 60) - startMinutes + endMinutes;
          
        // Subtract unpaid breaks from standard hours
        const shiftBreaks = await storage.getShiftBreaks(shift.id);
        let unpaidBreakMinutes = 0;
        
        for (const shiftBreak of shiftBreaks) {
          if (!shiftBreak.isPaid && shiftBreak.isActive) {
            unpaidBreakMinutes += shiftBreak.durationMinutes;
          }
        }
        
        // Standard working hours = shift duration - unpaid breaks
        standardHours = (totalShiftMinutes - unpaidBreakMinutes) / 60;
      }
    }
    
    return Math.max(0, Number(standardHours.toFixed(2)));
  } catch (error) {
    console.error('Error calculating standard working hours:', error);
    return 8; // Fallback to 8 hours
  }
}

// Helper function to calculate worked hours for a shift considering break times
function calculateShiftWorkedHours(shift: any): number {
  if (!shift.startTime || !shift.endTime) {
    return 8; // Default to 8 hours if no times configured
  }
  
  // Calculate hours between shift start and end
  const [startHour, startMin] = shift.startTime.split(':').map(Number);
  const [endHour, endMin] = shift.endTime.split(':').map(Number);
  
  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;
  
  // Handle shifts that cross midnight
  const totalShiftMinutes = endMinutes >= startMinutes 
    ? endMinutes - startMinutes 
    : (24 * 60) - startMinutes + endMinutes;
  
  // Subtract break time if configured
  let breakMinutes = 0;
  if (shift.breakStart && shift.breakEnd) {
    const [breakStartHour, breakStartMin] = shift.breakStart.split(':').map(Number);
    const [breakEndHour, breakEndMin] = shift.breakEnd.split(':').map(Number);
    
    const breakStartTotalMinutes = breakStartHour * 60 + breakStartMin;
    const breakEndTotalMinutes = breakEndHour * 60 + breakEndMin;
    
    // Calculate break duration (assuming break doesn't cross midnight)
    breakMinutes = breakEndTotalMinutes >= breakStartTotalMinutes 
      ? breakEndTotalMinutes - breakStartTotalMinutes 
      : (24 * 60) - breakStartTotalMinutes + breakEndTotalMinutes;
  }
  
  // Total worked hours = shift duration - break time
  const workedHours = (totalShiftMinutes - breakMinutes) / 60;
  return Math.max(0, Number(workedHours.toFixed(2)));
}

// Helper function to calculate regular vs overtime hours using net worked hours
async function calculateOvertimeHours(
  netWorkedHours: number, 
  departmentId: number | undefined, 
  storage: Storage
): Promise<{ regularHours: number; overtimeHours: number }> {
  try {
    const standardHours = await calculateStandardWorkingHours(departmentId, storage);
    
    // Calculate regular vs overtime hours
    if (netWorkedHours <= standardHours) {
      return {
        regularHours: Number(netWorkedHours.toFixed(2)),
        overtimeHours: 0
      };
    } else {
      return {
        regularHours: Number(standardHours.toFixed(2)),
        overtimeHours: Number((netWorkedHours - standardHours).toFixed(2))
      };
    }
  } catch (error) {
    console.error('Error calculating overtime hours:', error);
    // Fallback: treat all hours as regular if calculation fails
    return {
      regularHours: Number(netWorkedHours.toFixed(2)),
      overtimeHours: 0
    };
  }
}

// Helper function to compute irregularities for a time entry
async function computeIrregularities(
  timeEntry: any,
  storage: Storage
): Promise<{
  expectedHours: number;
  lateMinutes: number;
  shortfallMinutes: number;
  irregularityReasons: string[];
  status: string;
}> {
  const irregularityReasons: string[] = [];
  let expectedHours = 0;
  let lateMinutes = 0;
  let shortfallMinutes = 0;
  
  try {
    // Get user's assigned shift for this entry's date
    const entryDate = new Date(timeEntry.date);
    const userShiftAssignment = await storage.getUserActiveShift(timeEntry.userId, entryDate);
    
    let shift = userShiftAssignment?.shift;
    
    // Fallback: if no user-specific shift, use first department shift
    if (!shift && timeEntry.departmentId) {
      const departmentShifts = await storage.getDepartmentShifts(timeEntry.departmentId);
      if (departmentShifts.length > 0) {
        shift = departmentShifts[0];
      }
    }
    
    if (shift) {
      
      // Calculate expected hours from the assigned shift
      if (shift.startTime && shift.endTime) {
        const [startHour, startMin] = shift.startTime.split(':').map(Number);
        const [endHour, endMin] = shift.endTime.split(':').map(Number);
        
        const startMinutes = startHour * 60 + startMin;
        const endMinutes = endHour * 60 + endMin;
        
        // Handle shifts that cross midnight
        const totalShiftMinutes = endMinutes >= startMinutes 
          ? endMinutes - startMinutes 
          : (24 * 60) - startMinutes + endMinutes;
        
        // Subtract unpaid breaks from expected hours
        const shiftBreaks = await storage.getShiftBreaks(shift.id);
        let unpaidBreakMinutes = 0;
        
        for (const shiftBreak of shiftBreaks) {
          if (!shiftBreak.isPaid && shiftBreak.isActive) {
            unpaidBreakMinutes += shiftBreak.durationMinutes;
          }
        }
        
        expectedHours = (totalShiftMinutes - unpaidBreakMinutes) / 60;
      }
      
      // Check if employee clocked in
      if (!timeEntry.clockInTime) {
        irregularityReasons.push('Falta - Sem registro de entrada');
      } else if (shift.startTime) {
        // Convert UTC timestamp to Brazil timezone using toLocaleString
        const clockInUTC = new Date(timeEntry.clockInTime);
        
        // Get time components in Brazil timezone
        const brasilTime = clockInUTC.toLocaleString('en-US', { 
          timeZone: 'America/Sao_Paulo',
          hour12: false
        });
        
        // Parse the time string to get hours and minutes
        const timeParts = brasilTime.split(' ')[1].split(':');
        const clockInHour = parseInt(timeParts[0]);
        const clockInMinute = parseInt(timeParts[1]);
        const clockInTotalMinutes = clockInHour * 60 + clockInMinute;
        
        const [shiftStartHour, shiftStartMinute] = shift.startTime.split(':').map(Number);
        const shiftStartTotalMinutes = shiftStartHour * 60 + shiftStartMinute;
        
        // Use shift's configured tolerances (default 5 minutes if not set)
        const toleranceAfter = shift.toleranceAfterMinutes ?? 5;
        const toleranceBefore = shift.toleranceBeforeMinutes ?? 5;
        let rawLateMinutes = clockInTotalMinutes - shiftStartTotalMinutes;
        
        // Handle overnight shifts (e.g., 22:00-06:00)
        if (rawLateMinutes < -12 * 60) {
          // Clock-in is early morning, shift starts late night
          rawLateMinutes += 24 * 60;
        }
        
        // Check for late arrival (after tolerance)
        if (rawLateMinutes > toleranceAfter) {
          lateMinutes = rawLateMinutes;
          const hours = Math.floor(lateMinutes / 60);
          const mins = lateMinutes % 60;
          irregularityReasons.push(
            `Atraso - Chegou ${hours > 0 ? `${hours}h` : ''}${mins > 0 ? `${mins}min` : ''} depois do horário (${shift.startTime})`
          );
        }
        // Check for excessively early arrival (before tolerance)
        else if (rawLateMinutes < -toleranceBefore) {
          const earlyMinutes = Math.abs(rawLateMinutes);
          const hours = Math.floor(earlyMinutes / 60);
          const mins = earlyMinutes % 60;
          irregularityReasons.push(
            `Chegada antecipada - Chegou ${hours > 0 ? `${hours}h` : ''}${mins > 0 ? `${mins}min` : ''} antes do horário (${shift.startTime})`
          );
        }
      }
      
      // Check if employee clocked out
      if (timeEntry.clockInTime && !timeEntry.clockOutTime) {
        irregularityReasons.push('Registro incompleto - Sem registro de saída');
      }
      
      // Check hours worked vs expected (only if both clock in and out exist)
      if (timeEntry.clockInTime && timeEntry.clockOutTime && expectedHours > 0) {
        const workedHours = parseFloat(timeEntry.totalHours || '0');
        
        // Allow 15-minute deficit tolerance
        const DEFICIT_TOLERANCE_MINUTES = 15;
        const expectedMinutes = expectedHours * 60;
        const workedMinutes = workedHours * 60;
        const deficit = expectedMinutes - workedMinutes;
        
        if (deficit > DEFICIT_TOLERANCE_MINUTES) {
          shortfallMinutes = Math.floor(deficit);
          const hours = Math.floor(shortfallMinutes / 60);
          const mins = shortfallMinutes % 60;
          irregularityReasons.push(
            `Horas insuficientes - Trabalhou ${hours > 0 ? `${hours}h` : ''}${mins > 0 ? `${mins}min` : ''} a menos (esperado: ${expectedHours.toFixed(1)}h)`
          );
        }
      }
    }
    
    // Check shift compliance flags
    if (timeEntry.clockInShiftCompliant === false) {
      if (!irregularityReasons.some(r => r.includes('Atraso'))) {
        irregularityReasons.push('Turno incompatível - Fora do horário do turno na entrada');
      }
    }
    
    if (timeEntry.clockOutShiftCompliant === false) {
      irregularityReasons.push('Turno incompatível - Fora do horário do turno na saída');
    }
    
    // Determine status
    let status = timeEntry.status || 'active';
    if (irregularityReasons.length > 0) {
      status = 'irregular';
    } else if (timeEntry.clockInTime && timeEntry.clockOutTime) {
      status = 'completed';
    } else if (timeEntry.clockInTime && !timeEntry.clockOutTime) {
      status = 'incomplete';
    }
    
    return {
      expectedHours: Number(expectedHours.toFixed(2)),
      lateMinutes,
      shortfallMinutes,
      irregularityReasons,
      status
    };
  } catch (error) {
    console.error('Error computing irregularities:', error);
    return {
      expectedHours: 0,
      lateMinutes: 0,
      shortfallMinutes: 0,
      irregularityReasons: [],
      status: timeEntry.status || 'active'
    };
  }
}

// Helper function to get user scope based on role
async function getUserScope(userId: string) {
  const user = await storage.getUser(userId);
  if (!user) {
    throw new Error("User not found");
  }

  if (user.role === 'superadmin') {
    // Superadmin has access to all data
    return { 
      type: 'superadmin' as const, 
      user,
      companyId: null,
      departmentIds: null
    };
  } else if (user.role === 'admin') {
    // Admin has access to all data in their company
    if (!user.companyId) {
      throw new Error("Admin must be assigned to a company");
    }
    return { 
      type: 'admin' as const, 
      user,
      companyId: user.companyId,
      departmentIds: null
    };
  } else if (user.role === 'supervisor') {
    // Supervisor has access only to their assigned sectors
    const scope = await storage.getSupervisorScope(userId);
    if (!scope) {
      throw new Error("Supervisor has no assigned sectors");
    }
    return { 
      type: 'supervisor' as const, 
      user,
      companyId: scope.companyId,
      departmentIds: scope.departmentIds
    };
  } else {
    // Employee has access only to their own data
    return { 
      type: 'employee' as const, 
      user,
      companyId: user.companyId,
      departmentIds: user.departmentId ? [user.departmentId] : []
    };
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware - sistema híbrido (OIDC + Local)
  setupLocalAuth(app);

  // System initialization route - PUBLIC (for first-time setup in production)
  app.post('/api/setup/init', async (req, res) => {
    try {
      // Check if a superadmin already exists
      const users = await storage.getAllUsers();
      const hasSuperadmin = users.some(u => u.role === 'superadmin');
      
      if (hasSuperadmin) {
        return res.status(403).json({ 
          message: 'Sistema já inicializado. Um superadmin já existe.' 
        });
      }

      // Validate input
      const { email, firstName, lastName, password } = req.body;
      
      if (!email || !firstName || !lastName || !password) {
        return res.status(400).json({ 
          message: 'Todos os campos são obrigatórios: email, firstName, lastName, password' 
        });
      }

      if (password.length < 6) {
        return res.status(400).json({ 
          message: 'Senha deve ter no mínimo 6 caracteres' 
        });
      }

      // Hash the password
      const passwordHash = await hashPassword(password);
      
      // Create the first superadmin user
      const userId = `usr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const newUser = await storage.upsertUser({
        id: userId,
        email,
        firstName,
        lastName,
        passwordHash,
        role: 'superadmin',
        mustChangePassword: false,
        isActive: true,
      });

      res.status(201).json({
        message: 'Sistema inicializado com sucesso! Primeiro superadmin criado.',
        user: {
          id: newUser.id,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          role: newUser.role,
        }
      });

    } catch (error: any) {
      console.error('Erro na inicialização do sistema:', error);
      res.status(500).json({ 
        message: 'Erro ao inicializar sistema',
        error: error.message 
      });
    }
  });

  // EMERGENCY ROUTE: Force create superadmin (bypasses existing check)
  app.post('/api/setup/force-superadmin', async (req, res) => {
    try {
      const { email, firstName, lastName, password } = req.body;
      
      if (!email || !firstName || !lastName || !password) {
        return res.status(400).json({ 
          message: 'Todos os campos são obrigatórios: email, firstName, lastName, password' 
        });
      }

      if (password.length < 6) {
        return res.status(400).json({ 
          message: 'Senha deve ter no mínimo 6 caracteres' 
        });
      }

      // Hash the password
      const passwordHash = await hashPassword(password);
      
      // Create or update superadmin user (FORCE)
      const userId = `usr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const newUser = await storage.upsertUser({
        id: userId,
        email,
        firstName,
        lastName,
        passwordHash,
        role: 'superadmin',
        mustChangePassword: true,
        isActive: true,
      });

      res.status(201).json({
        message: 'Superadmin criado/atualizado com sucesso!',
        user: {
          id: newUser.id,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          role: newUser.role,
        }
      });

    } catch (error: any) {
      console.error('Erro ao criar superadmin forçado:', error);
      res.status(500).json({ 
        message: 'Erro ao criar superadmin',
        error: error.message 
      });
    }
  });

  // Serve superadmin creation HTML (for production setup)
  app.get('/api/setup-admin', (req, res) => {
    const htmlPath = path.join(process.cwd(), 'create-superadmin-production.html');
    res.sendFile(htmlPath);
  });

  // Configure multer for file uploads
  const uploadsDir = path.join(process.cwd(), 'uploads', 'documents');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const upload = multer({
    storage: multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, uploadsDir);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
      }
    }),
    limits: { 
      fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: (req, file, cb) => {
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/jpg',
        'image/png'
      ];
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Invalid file type'), false);
      }
    }
  });

  // Configure multer for audit attachment uploads (comprovantes)
  const auditUploadsDir = path.join(process.cwd(), 'uploads', 'audit-attachments');
  if (!fs.existsSync(auditUploadsDir)) {
    fs.mkdirSync(auditUploadsDir, { recursive: true });
  }

  const auditUpload = multer({
    storage: multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, auditUploadsDir);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'comprovante-' + uniqueSuffix + path.extname(file.originalname));
      }
    }),
    limits: {
      fileSize: 5 * 1024 * 1024 // 5MB limit for attachments
    },
    fileFilter: (req, file, cb) => {
      // Accept images and PDFs only
      const allowedTypes = /jpeg|jpg|png|pdf/;
      const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
      const mimetype = allowedTypes.test(file.mimetype);
      
      if (mimetype && extname) {
        return cb(null, true);
      } else {
        cb(new Error('Apenas imagens (JPEG, PNG) e PDFs são permitidos'));
      }
    }
  });

  // Configure multer for absence document uploads (comprovantes de ausência)
  const absenceUploadsDir = path.join(process.cwd(), 'uploads', 'absences');
  if (!fs.existsSync(absenceUploadsDir)) {
    fs.mkdirSync(absenceUploadsDir, { recursive: true });
  }

  const absenceUpload = multer({
    storage: multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, absenceUploadsDir);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'absence-doc-' + uniqueSuffix + path.extname(file.originalname));
      }
    }),
    limits: {
      fileSize: 5 * 1024 * 1024 // 5MB limit for absence documents
    },
    fileFilter: (req, file, cb) => {
      // Accept images and PDFs only
      const allowedTypes = /jpeg|jpg|png|pdf/;
      const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
      const mimetype = allowedTypes.test(file.mimetype);
      
      if (mimetype && extname) {
        return cb(null, true);
      } else {
        cb(new Error('Apenas imagens (JPEG, PNG) e PDFs são permitidos'));
      }
    }
  });

  // Configure multer for CSV uploads
  const csvUpload = multer({
    storage: multer.memoryStorage(), // Store in memory for parsing
    limits: { 
      fileSize: 5 * 1024 * 1024 // 5MB limit for CSV
    },
    fileFilter: (req, file, cb) => {
      const allowedTypes = [
        'text/csv',
        'text/plain',
        'application/csv',
        'application/vnd.ms-excel'
      ];
      if (allowedTypes.includes(file.mimetype) || file.originalname.endsWith('.csv')) {
        cb(null, true);
      } else {
        cb(new Error('Invalid file type. Only CSV files are allowed.'), false);
      }
    }
  });

  // Serve static files from uploads directory
  const express = await import('express');
  app.use('/uploads', express.default.static(path.join(process.cwd(), 'uploads')));

  // Database health check endpoint (no auth required for operational monitoring)
  app.get('/api/db-health', async (req, res) => {
    try {
      // Test database connectivity with a simple query
      const testResult = await storage.getCompanies();
      
      // If we get here, database is working
      res.status(200).json({
        status: 'healthy',
        database: 'connected',
        timestamp: new Date().toISOString(),
        version: 'postgresql'
      });
    } catch (error) {
      console.error("Database health check failed:", {
        error: error instanceof Error ? error.message : "Unknown error",
        errorType: error instanceof Error ? error.constructor.name : "Unknown",
        timestamp: new Date().toISOString()
      });
      
      res.status(500).json({
        status: 'unhealthy',
        database: 'disconnected',
        error: error instanceof Error ? error.message : "Database connection failed",
        timestamp: new Date().toISOString()
      });
    }
  });

  // Rota /api/auth/user removida - agora está no localAuth.ts

  // Check if any superadmin exists in the system
  app.get('/api/auth/has-superadmin', async (req, res) => {
    try {
      const allUsers = await storage.getAllUsers();
      const hasSuperadmin = allUsers.some(user => user.role === 'superadmin');
      res.json({ hasSuperadmin });
    } catch (error) {
      console.error("Error checking superadmin:", error);
      res.status(500).json({ message: "Failed to check superadmin" });
    }
  });

  // Department routes
  app.get('/api/departments', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const scope = await getUserScope(req.user.claims.sub);
      
      if (!scope.user.companyId && scope.type !== 'superadmin') {
        return res.status(400).json({ message: "User must be assigned to a company" });
      }
      
      let departments;
      if (scope.type === 'superadmin') {
        departments = await storage.getDepartments();
      } else if (scope.type === 'admin') {
        departments = await storage.getDepartmentsByCompany(scope.companyId!);
      } else if (scope.type === 'supervisor') {
        // Supervisors can only see departments from their assigned sectors
        departments = await storage.getDepartmentsByScope(scope.departmentIds!);
      } else {
        // Employees can see all departments in their company (for department selection purposes)
        departments = await storage.getDepartmentsByCompany(scope.companyId!);
      }
      
      res.json(departments);
    } catch (error) {
      console.error("Error fetching departments:", error);
      if (error instanceof Error && error.message.includes("assigned sectors")) {
        return res.status(400).json({ message: "Supervisor has no assigned sectors" });
      }
      res.status(500).json({ message: "Failed to fetch departments" });
    }
  });

  app.post('/api/departments', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin' && user?.role !== 'superadmin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const departmentData = insertDepartmentSchema.parse(req.body);
      
      // Handle companyId assignment based on user role
      if (user?.role === 'superadmin') {
        // For superadmins, derive companyId from the selected sector
        if (!departmentData.sectorId) {
          return res.status(400).json({ message: "Sector must be selected for department" });
        }
        
        const sector = await storage.getSector(departmentData.sectorId);
        if (!sector) {
          return res.status(400).json({ message: "Selected sector not found" });
        }
        
        departmentData.companyId = sector.companyId;
      } else {
        // For regular admins, use their company
        if (!user?.companyId) {
          return res.status(400).json({ message: "User must be assigned to a company" });
        }
        departmentData.companyId = user.companyId;
      }

      const department = await storage.createDepartment(departmentData);
      res.json(department);
    } catch (error) {
      console.error("Error creating department:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid department data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create department" });
    }
  });

  app.get('/api/departments/:id', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const scope = await getUserScope(req.user.claims.sub);
      
      if (!scope.user.companyId && scope.type !== 'superadmin') {
        return res.status(400).json({ message: "User must be assigned to a company" });
      }
      
      const id = parseInt(req.params.id);
      const department = await storage.getDepartment(id);
      if (!department) {
        return res.status(404).json({ message: "Department not found" });
      }
      
      // CRITICAL SECURITY: Verify access based on user role
      if (scope.type === 'superadmin') {
        // Superadmin has access to all departments
      } else if (scope.type === 'admin' || scope.type === 'employee') {
        // Admin and employee can access departments in their company
        if (department.companyId !== scope.companyId) {
          return res.status(403).json({ message: "Access denied: department not accessible" });
        }
      } else if (scope.type === 'supervisor') {
        // Supervisor can only access departments from their assigned sectors
        if (department.companyId !== scope.companyId) {
          return res.status(403).json({ message: "Access denied: department not accessible" });
        }
        if (!scope.departmentIds!.includes(id)) {
          return res.status(403).json({ message: "Access denied: department not in your assigned scope" });
        }
      }
      
      const stats = await storage.getDepartmentStats(id);
      res.json({ ...department, stats });
    } catch (error) {
      console.error("Error fetching department:", error);
      if (error instanceof Error && error.message.includes("assigned sectors")) {
        return res.status(400).json({ message: "Supervisor has no assigned sectors" });
      }
      res.status(500).json({ message: "Failed to fetch department" });
    }
  });

  // ==== SECTOR ROUTES ====
  
  // Get sectors for current user's company
  app.get('/api/sectors', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const scope = await getUserScope(req.user.claims.sub);
      
      if (!scope.user.companyId && scope.type !== 'superadmin') {
        return res.status(400).json({ message: "User must be assigned to a company" });
      }
      
      let sectors;
      if (scope.type === 'superadmin') {
        sectors = await storage.getSectors();
      } else if (scope.type === 'admin') {
        sectors = await storage.getSectorsByCompany(scope.companyId!);
      } else if (scope.type === 'supervisor') {
        // Get supervisor scope and filter sectors
        const supervisorScope = await storage.getSupervisorScope(req.user.claims.sub);
        if (!supervisorScope) {
          return res.status(400).json({ message: "Supervisor has no assigned sectors" });
        }
        // Return only sectors that the supervisor is assigned to
        sectors = [];
        for (const sectorId of supervisorScope.sectorIds) {
          const sector = await storage.getSector(sectorId);
          if (sector) {
            sectors.push(sector);
          }
        }
      } else {
        // Employees can see sectors in their company (for information purposes)
        sectors = await storage.getSectorsByCompany(scope.companyId!);
      }
      
      res.json(sectors);
    } catch (error) {
      console.error("Error fetching sectors:", error);
      if (error instanceof Error && error.message.includes("assigned sectors")) {
        return res.status(400).json({ message: "Supervisor has no assigned sectors" });
      }
      res.status(500).json({ message: "Failed to fetch sectors" });
    }
  });

  // Create new sector (admin only)
  app.post('/api/sectors', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin' && user?.role !== 'superadmin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      let targetCompanyId: number;
      
      if (user?.role === 'superadmin') {
        // Superadmins can specify companyId in request body
        if (!req.body.companyId) {
          return res.status(400).json({ message: "Company ID is required for creating sectors" });
        }
        targetCompanyId = req.body.companyId;
        
        // Validate that the company exists
        const company = await storage.getCompany(targetCompanyId);
        if (!company) {
          return res.status(400).json({ message: "Invalid company ID" });
        }
      } else {
        // Regular admins can only create sectors in their own company
        if (!user?.companyId) {
          return res.status(400).json({ message: "User must be assigned to a company" });
        }
        targetCompanyId = user.companyId;
      }

      // Add validated companyId to request body before validation - security critical
      const bodyWithCompanyId = {
        ...req.body,
        companyId: targetCompanyId
      };
      const sectorData = insertSectorSchema.parse(bodyWithCompanyId);
      const sector = await storage.createSector(sectorData);
      res.json(sector);
    } catch (error) {
      console.error("Error creating sector:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid sector data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create sector" });
    }
  });

  // Update sector (admin only)
  app.put('/api/sectors/:id', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin' && user?.role !== 'superadmin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const id = parseInt(req.params.id);
      const sector = await storage.getSector(id);
      if (!sector) {
        return res.status(404).json({ message: "Sector not found" });
      }
      
      // CRITICAL SECURITY: Verify sector access permissions
      if (user?.role === 'superadmin') {
        // Superadmins can edit any sector
      } else {
        // Regular admins can only edit sectors in their own company
        if (!user?.companyId) {
          return res.status(400).json({ message: "User must be assigned to a company" });
        }
        if (sector.companyId !== user.companyId) {
          return res.status(403).json({ message: "Access denied: sector not accessible" });
        }
      }
      
      const sectorData = insertSectorSchema.partial().parse(req.body);
      // Prevent companyId modification
      delete sectorData.companyId;
      const updatedSector = await storage.updateSector(id, sectorData);
      res.json(updatedSector);
    } catch (error) {
      console.error("Error updating sector:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid sector data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update sector" });
    }
  });

  // Delete sector (admin only)
  app.delete('/api/sectors/:id', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin' && user?.role !== 'superadmin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const sectorId = parseInt(req.params.id);
      const sector = await storage.getSector(sectorId);
      
      if (!sector) {
        return res.status(404).json({ message: "Sector not found" });
      }

      // For non-superadmins, verify they own the sector
      if (user.role !== 'superadmin' && sector.companyId !== user.companyId) {
        return res.status(403).json({ message: "Access denied: sector not accessible" });
      }

      await storage.deleteSector(sectorId);
      res.json({ message: "Sector deleted successfully" });
    } catch (error) {
      console.error("Error deleting sector:", error);
      if (error instanceof Error && error.message.includes("Cannot delete sector")) {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: "Failed to delete sector" });
    }
  });

  // ==== SHIFT ROUTES ====
  
  // Get all shifts (for rotation management)
  app.get('/api/shifts', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const scope = await getUserScope(req.user.claims.sub);
      
      if (!scope.user.companyId && scope.type !== 'superadmin') {
        return res.status(400).json({ message: "User must be assigned to a company" });
      }

      // Get all shifts for the user's company
      const shifts = await storage.getAllDepartmentShifts(scope.user.companyId);
      res.json(shifts);
    } catch (error) {
      console.error("Error fetching all shifts:", error);
      res.status(500).json({ message: "Failed to fetch shifts" });
    }
  });

  // ==== DEPARTMENT SHIFT ROUTES ====
  
  // Get shifts for a department
  app.get('/api/departments/:id/shifts', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const scope = await getUserScope(req.user.claims.sub);
      
      if (!scope.user.companyId && scope.type !== 'superadmin') {
        return res.status(400).json({ message: "User must be assigned to a company" });
      }

      const departmentId = parseInt(req.params.id);
      const department = await storage.getDepartment(departmentId);
      if (!department) {
        return res.status(404).json({ message: "Department not found" });
      }
      
      // CRITICAL SECURITY: Verify access based on user role
      if (scope.type === 'superadmin') {
        // Superadmin has access to all department shifts
      } else if (scope.type === 'admin' || scope.type === 'employee') {
        // Admin and employee can access shifts in their company departments
        if (department.companyId !== scope.companyId) {
          return res.status(403).json({ message: "Access denied: department not accessible" });
        }
      } else if (scope.type === 'supervisor') {
        // Supervisor can only access shifts from departments in their assigned sectors
        if (department.companyId !== scope.companyId) {
          return res.status(403).json({ message: "Access denied: department not accessible" });
        }
        if (!scope.departmentIds!.includes(departmentId)) {
          return res.status(403).json({ message: "Access denied: department not in your assigned scope" });
        }
      }
      
      const shifts = await storage.getDepartmentShifts(departmentId);
      res.json(shifts);
    } catch (error) {
      console.error("Error fetching department shifts:", error);
      if (error instanceof Error && error.message.includes("assigned sectors")) {
        return res.status(400).json({ message: "Supervisor has no assigned sectors" });
      }
      res.status(500).json({ message: "Failed to fetch department shifts" });
    }
  });

  // Create department shift (admin only)
  app.post('/api/departments/:id/shifts', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin' && user?.role !== 'superadmin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      if (!user?.companyId) {
        return res.status(400).json({ message: "User must be assigned to a company" });
      }

      const departmentId = parseInt(req.params.id);
      const department = await storage.getDepartment(departmentId);
      if (!department) {
        return res.status(404).json({ message: "Department not found" });
      }
      
      // CRITICAL SECURITY: Verify department belongs to user's company
      if (department.companyId !== user.companyId) {
        return res.status(403).json({ message: "Access denied: department not accessible" });
      }

      const validatedShiftData = insertDepartmentShiftSchema.parse(req.body);
      const shiftData = {
        ...validatedShiftData,
        departmentId: departmentId
      };
      const shift = await storage.createDepartmentShift(shiftData);
      res.json(shift);
    } catch (error) {
      console.error("Error creating department shift:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid shift data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create department shift" });
    }
  });

  // Update department shift (admin only)
  app.put('/api/department-shifts/:id', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin' && user?.role !== 'superadmin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      if (!user?.companyId) {
        return res.status(400).json({ message: "User must be assigned to a company" });
      }

      const id = parseInt(req.params.id);
      const shift = await storage.getDepartmentShift(id);
      if (!shift) {
        return res.status(404).json({ message: "Shift not found" });
      }
      
      // Verify shift's department belongs to user's company
      const department = await storage.getDepartment(shift.departmentId);
      if (!department || department.companyId !== user.companyId) {
        return res.status(403).json({ message: "Access denied: shift not accessible" });
      }
      
      const validatedShiftData = insertDepartmentShiftSchema.partial().parse(req.body);
      const shiftData = { ...validatedShiftData };
      // Prevent departmentId modification (shiftData doesn't have departmentId anyway)
      // delete shiftData.departmentId; // Not needed since schema omits it
      const updatedShift = await storage.updateDepartmentShift(id, shiftData);
      res.json(updatedShift);
    } catch (error) {
      console.error("Error updating department shift:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid shift data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update department shift" });
    }
  });

  // Delete department shift (admin only)
  app.delete('/api/department-shifts/:id', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin' && user?.role !== 'superadmin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      if (!user?.companyId) {
        return res.status(400).json({ message: "User must be assigned to a company" });
      }

      const id = parseInt(req.params.id);
      const shift = await storage.getDepartmentShift(id);
      if (!shift) {
        return res.status(404).json({ message: "Shift not found" });
      }
      
      // Verify shift's department belongs to user's company
      const department = await storage.getDepartment(shift.departmentId);
      if (!department || department.companyId !== user.companyId) {
        return res.status(403).json({ message: "Access denied: shift not accessible" });
      }
      
      await storage.deleteDepartmentShift(id);
      res.json({ message: "Department shift deleted successfully" });
    } catch (error) {
      console.error("Error deleting department shift:", error);
      res.status(500).json({ message: "Failed to delete department shift" });
    }
  });

  // ==== SUPERVISOR ASSIGNMENT ROUTES ====
  
  // Get supervisor assignments for current user
  app.get('/api/supervisor-assignments', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (user.role !== 'supervisor') {
        return res.status(403).json({ message: "Supervisor access required" });
      }

      const assignments = await storage.getSupervisorAssignments(userId);
      res.json(assignments);
    } catch (error) {
      console.error("Error fetching supervisor assignments:", error);
      res.status(500).json({ message: "Failed to fetch supervisor assignments" });
    }
  });

  // Get all company supervisor assignments (admin only)
  app.get('/api/admin/supervisor-assignments', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin' && user?.role !== 'superadmin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      if (!user?.companyId) {
        return res.status(400).json({ message: "User must be assigned to a company" });
      }

      const assignments = await storage.getAllCompanySupervisorAssignments(user.companyId);
      res.json(assignments);
    } catch (error) {
      console.error("Error fetching company supervisor assignments:", error);
      res.status(500).json({ message: "Failed to fetch company supervisor assignments" });
    }
  });

  // Create supervisor assignment (admin only)
  app.post('/api/supervisor-assignments', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin' && user?.role !== 'superadmin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      if (!user?.companyId) {
        return res.status(400).json({ message: "User must be assigned to a company" });
      }

      const assignmentData = insertSupervisorAssignmentSchema.parse(req.body);
      
      // Verify supervisor is from the same company
      const supervisor = await storage.getUser(assignmentData.supervisorId);
      if (!supervisor || supervisor.companyId !== user.companyId) {
        return res.status(400).json({ message: "Supervisor must be from your company" });
      }
      
      // Verify supervisor has supervisor role
      if (supervisor.role !== 'supervisor') {
        return res.status(400).json({ message: "User must have supervisor role" });
      }
      
      // Verify sector belongs to the same company
      const sector = await storage.getSector(assignmentData.sectorId);
      if (!sector || sector.companyId !== user.companyId) {
        return res.status(400).json({ message: "Sector must be from your company" });
      }

      const assignment = await storage.createSupervisorAssignment(assignmentData);
      res.json(assignment);
    } catch (error) {
      console.error("Error creating supervisor assignment:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid assignment data", errors: error.errors });
      }
      // Handle security validation errors from storage layer
      if (error instanceof Error && error.message.includes("same company")) {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: "Failed to create supervisor assignment" });
    }
  });

  // Delete supervisor assignment (admin only)
  app.delete('/api/supervisor-assignments', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin' && user?.role !== 'superadmin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      if (!user?.companyId) {
        return res.status(400).json({ message: "User must be assigned to a company" });
      }

      const { supervisorId, sectorId } = req.body;
      
      if (!supervisorId || !sectorId) {
        return res.status(400).json({ message: "supervisorId and sectorId are required" });
      }
      
      // Verify supervisor is from the same company
      const supervisor = await storage.getUser(supervisorId);
      if (!supervisor || supervisor.companyId !== user.companyId) {
        return res.status(403).json({ message: "Access denied: supervisor not in your company" });
      }
      
      // Verify sector belongs to the same company
      const sector = await storage.getSector(sectorId);
      if (!sector || sector.companyId !== user.companyId) {
        return res.status(403).json({ message: "Access denied: sector not in your company" });
      }

      await storage.deleteSupervisorAssignment(supervisorId, sectorId);
      res.json({ message: "Supervisor assignment deleted successfully" });
    } catch (error) {
      console.error("Error deleting supervisor assignment:", error);
      res.status(500).json({ message: "Failed to delete supervisor assignment" });
    }
  });

  // ==== USER SHIFT ASSIGNMENT ROUTES ====

  // Get user shift assignments for a specific user (admin only)
  app.get('/api/users/:userId/shift-assignments', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin' && user?.role !== 'superadmin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      if (!user?.companyId) {
        return res.status(400).json({ message: "User must be assigned to a company" });
      }

      const userId = req.params.userId;
      const targetUser = await storage.getUser(userId);
      if (!targetUser || targetUser.companyId !== user.companyId) {
        return res.status(404).json({ message: "User not found or not in your company" });
      }

      const assignments = await storage.getUserShiftAssignments(userId);
      res.json(assignments);
    } catch (error) {
      console.error("Error fetching user shift assignments:", error);
      res.status(500).json({ message: "Failed to fetch user shift assignments" });
    }
  });

  // Get all users assigned to a specific shift (admin only)
  app.get('/api/shifts/:shiftId/assignments', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin' && user?.role !== 'superadmin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      if (!user?.companyId) {
        return res.status(400).json({ message: "User must be assigned to a company" });
      }

      const shiftId = parseInt(req.params.shiftId);
      const shift = await storage.getDepartmentShift(shiftId);
      if (!shift) {
        return res.status(404).json({ message: "Shift not found" });
      }

      // Verify shift's department belongs to user's company (skip for superadmin)
      if (user.role !== 'superadmin') {
        const department = await storage.getDepartment(shift.departmentId);
        if (!department || department.companyId !== user.companyId) {
          return res.status(403).json({ message: "Access denied: shift not accessible" });
        }
      }

      const assignments = await storage.getShiftAssignments(shiftId);
      res.json(assignments);
    } catch (error) {
      console.error("Error fetching shift assignments:", error);
      res.status(500).json({ message: "Failed to fetch shift assignments" });
    }
  });

  // Create user shift assignment (admin only)
  app.post('/api/user-shift-assignments', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin' && user?.role !== 'superadmin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      if (!user?.companyId) {
        return res.status(400).json({ message: "User must be assigned to a company" });
      }

      const assignmentData = insertUserShiftAssignmentSchema.parse(req.body);

      // Verify target user is from the same company (skip for superadmin)
      const targetUser = await storage.getUser(assignmentData.userId);
      if (!targetUser) {
        return res.status(400).json({ message: "User not found" });
      }
      
      // Only enforce company match for non-superadmins
      if (user.role !== 'superadmin' && targetUser.companyId !== user.companyId) {
        return res.status(400).json({ message: "User must be from your company" });
      }

      const assignment = await storage.createUserShiftAssignment(assignmentData);
      res.json(assignment);
    } catch (error) {
      console.error("Error creating user shift assignment:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid assignment data", errors: error.errors });
      }
      if (error instanceof Error) {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: "Failed to create user shift assignment" });
    }
  });

  // Update user shift assignment (admin only)
  app.put('/api/user-shift-assignments/:id', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin' && user?.role !== 'superadmin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      if (!user?.companyId) {
        return res.status(400).json({ message: "User must be assigned to a company" });
      }

      const id = parseInt(req.params.id);
      const assignment = await storage.getUserShiftAssignment(id);
      if (!assignment) {
        return res.status(404).json({ message: "Assignment not found" });
      }

      // Verify assignment's user is from the same company (skip for superadmin)
      if (user.role !== 'superadmin') {
        const targetUser = await storage.getUser(assignment.userId);
        if (!targetUser || targetUser.companyId !== user.companyId) {
          return res.status(403).json({ message: "Access denied: assignment not accessible" });
        }
      }

      const assignmentData = insertUserShiftAssignmentSchema.partial().parse(req.body);
      const updatedAssignment = await storage.updateUserShiftAssignment(id, assignmentData);
      res.json(updatedAssignment);
    } catch (error) {
      console.error("Error updating user shift assignment:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid assignment data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update user shift assignment" });
    }
  });

  // Delete user shift assignment (admin only)
  app.delete('/api/user-shift-assignments/:id', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin' && user?.role !== 'superadmin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      if (!user?.companyId) {
        return res.status(400).json({ message: "User must be assigned to a company" });
      }

      const id = parseInt(req.params.id);
      const assignment = await storage.getUserShiftAssignment(id);
      if (!assignment) {
        return res.status(404).json({ message: "Assignment not found" });
      }

      // Verify assignment's user is from the same company (skip for superadmin)
      if (user.role !== 'superadmin') {
        const targetUser = await storage.getUser(assignment.userId);
        if (!targetUser || targetUser.companyId !== user.companyId) {
          return res.status(403).json({ message: "Access denied: assignment not accessible" });
        }
      }

      await storage.deleteUserShiftAssignment(id);
      res.json({ message: "User shift assignment deleted successfully" });
    } catch (error) {
      console.error("Error deleting user shift assignment:", error);
      res.status(500).json({ message: "Failed to delete user shift assignment" });
    }
  });

  // Get user's active shift for today (for employees to see their current shift)
  app.get('/api/my-active-shift', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const activeShift = await storage.getUserActiveShift(userId);
      
      if (!activeShift) {
        return res.status(404).json({ message: "No active shift found for today" });
      }

      res.json(activeShift);
    } catch (error) {
      console.error("Error fetching active shift:", error);
      res.status(500).json({ message: "Failed to fetch active shift" });
    }
  });

  // Special route to claim superadmin access (only works if no superadmin exists)
  app.post('/api/claim-superadmin', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Check if any superadmin already exists
      const allUsers = await storage.getAllUsers();
      const existingSuperadmin = allUsers.find(user => user.role === 'superadmin');
      
      if (existingSuperadmin) {
        return res.status(403).json({ 
          message: "Superadmin já existe no sistema. Apenas um superadmin pode atribuir outros superadmins." 
        });
      }
      
      // No superadmin exists, allow this user to become superadmin
      await storage.updateUser(userId, { 
        role: 'superadmin',
        companyId: null, // Superadmins don't belong to any specific company
        departmentId: null
      });
      
      res.json({ 
        message: "Você agora é o superadmin do sistema!",
        role: 'superadmin'
      });
    } catch (error) {
      console.error("Error claiming superadmin:", error);
      res.status(500).json({ message: "Erro ao reivindicar acesso de superadmin" });
    }
  });

  // Superadmin routes - Full system access
  app.get('/api/superadmin/companies', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'superadmin') {
        return res.status(403).json({ message: "Superadmin access required" });
      }
      
      const companies = await storage.getCompanies();
      res.json(companies);
    } catch (error) {
      console.error("Error fetching all companies:", error);
      res.status(500).json({ message: "Failed to fetch companies" });
    }
  });

  app.post('/api/superadmin/companies', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'superadmin') {
        return res.status(403).json({ message: "Superadmin access required" });
      }

      const companyData = insertCompanySchema.parse(req.body);
      const company = await storage.createCompany(companyData);
      res.json(company);
    } catch (error) {
      console.error("Error creating company:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid company data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create company" });
    }
  });

  app.get('/api/superadmin/users', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'superadmin') {
        return res.status(403).json({ message: "Superadmin access required" });
      }
      
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching all users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.put('/api/superadmin/users/:id/role', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'superadmin') {
        return res.status(403).json({ message: "Superadmin access required" });
      }

      const userId = req.params.id;
      const { role, companyId } = req.body;
      
      if (!['employee', 'admin', 'supervisor', 'superadmin'].includes(role)) {
        return res.status(400).json({ message: "Invalid role. Must be employee, admin, supervisor, or superadmin" });
      }

      // Verify the target user exists
      const targetUser = await storage.getUser(userId);
      if (!targetUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // If assigning admin or employee role, companyId is required
      if (role !== 'superadmin' && !companyId) {
        return res.status(400).json({ message: "Company ID is required for admin and employee roles" });
      }

      // Validate that the company exists when assigning admin or employee role
      if (role !== 'superadmin' && companyId) {
        const company = await storage.getCompany(companyId);
        if (!company) {
          return res.status(400).json({ message: "Invalid company ID - company does not exist" });
        }
      }

      // Prepare update data with proper integrity checks
      const updateData: any = { role };
      
      if (role === 'superadmin') {
        // Superadmin has no company or department
        updateData.companyId = null;
        updateData.departmentId = null;
      } else {
        updateData.companyId = companyId;
        
        // If user has a department, verify it belongs to the new company
        if (targetUser.departmentId) {
          const department = await storage.getDepartment(targetUser.departmentId);
          if (department && department.companyId !== companyId) {
            // Clear department if it doesn't belong to the new company
            updateData.departmentId = null;
          }
        }
        
        // If switching companies, clear department unless explicitly reassigned
        if (targetUser.companyId && targetUser.companyId !== companyId) {
          updateData.departmentId = null;
        }
      }

      await storage.updateUser(userId, updateData);
      res.json({ message: "User role updated successfully" });
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "Failed to update user role" });
    }
  });

  app.put('/api/superadmin/companies/:id', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'superadmin') {
        return res.status(403).json({ message: "Superadmin access required" });
      }

      const id = parseInt(req.params.id);
      const companyData = insertCompanySchema.partial().parse(req.body);
      const company = await storage.updateCompany(id, companyData);
      res.json(company);
    } catch (error) {
      console.error("Error updating company:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid company data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update company" });
    }
  });

  app.get('/api/superadmin/companies/:id/users', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'superadmin') {
        return res.status(403).json({ message: "Superadmin access required" });
      }

      const companyId = parseInt(req.params.id);
      const users = await storage.getUsersByCompany(companyId);
      res.json(users);
    } catch (error) {
      console.error("Error fetching company users:", error);
      res.status(500).json({ message: "Failed to fetch company users" });
    }
  });

  // Company routes
  app.get('/api/companies', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin' && user?.role !== 'superadmin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      if (!user?.companyId) {
        return res.status(400).json({ message: "User must be assigned to a company" });
      }

      // CRITICAL SECURITY: Admin can only see their own company
      const company = await storage.getCompany(user.companyId);
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }
      res.json([company]); // Return as array to maintain API compatibility
    } catch (error) {
      console.error("Error fetching companies:", error);
      res.status(500).json({ message: "Failed to fetch companies" });
    }
  });

  app.post('/api/companies', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin' && user?.role !== 'superadmin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const companyData = insertCompanySchema.parse(req.body);
      const company = await storage.createCompany(companyData);
      res.json(company);
    } catch (error) {
      console.error("Error creating company:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid company data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create company" });
    }
  });

  app.get('/api/companies/:id', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin' && user?.role !== 'superadmin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      if (!user?.companyId) {
        return res.status(400).json({ message: "User must be assigned to a company" });
      }

      const id = parseInt(req.params.id);
      // CRITICAL SECURITY: Admin can only access their own company
      if (id !== user.companyId) {
        return res.status(403).json({ message: "Access denied: company not accessible" });
      }
      
      const company = await storage.getCompany(id);
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }
      res.json(company);
    } catch (error) {
      console.error("Error fetching company:", error);
      res.status(500).json({ message: "Failed to fetch company" });
    }
  });

  app.put('/api/companies/:id', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin' && user?.role !== 'superadmin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      if (!user?.companyId) {
        return res.status(400).json({ message: "User must be assigned to a company" });
      }

      const id = parseInt(req.params.id);
      // CRITICAL SECURITY: Admin can only update their own company
      if (id !== user.companyId) {
        return res.status(403).json({ message: "Access denied: company not accessible" });
      }
      
      const companyData = insertCompanySchema.partial().parse(req.body);
      const company = await storage.updateCompany(id, companyData);
      res.json(company);
    } catch (error) {
      console.error("Error updating company:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid company data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update company" });
    }
  });

  // Holiday routes
  app.get('/api/holidays', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.companyId) {
        return res.status(400).json({ message: "User must be assigned to a company" });
      }
      
      const holidays = await storage.getHolidays(user.companyId);
      res.json(holidays);
    } catch (error) {
      console.error("Error fetching holidays:", error);
      res.status(500).json({ message: "Failed to fetch holidays" });
    }
  });

  app.post('/api/holidays', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      
      if (user?.role !== 'admin' && user?.role !== 'superadmin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      if (!user?.companyId) {
        return res.status(400).json({ message: "User must be assigned to a company" });
      }

      // Add companyId to req.body before validation - security critical
      const requestData = { ...req.body, companyId: user.companyId };
      const holidayData = insertHolidaySchema.parse(requestData);
      const holiday = await storage.createHoliday(holidayData);
      res.json(holiday);
    } catch (error) {
      console.error("Error creating holiday:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid holiday data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create holiday" });
    }
  });

  app.put('/api/holidays/:id', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin' && user?.role !== 'superadmin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      if (!user?.companyId) {
        return res.status(400).json({ message: "User must be assigned to a company" });
      }

      const id = parseInt(req.params.id);
      // CRITICAL SECURITY: Verify holiday belongs to user's company
      const existingHoliday = await storage.getHoliday(id);
      if (!existingHoliday || existingHoliday.companyId !== user.companyId) {
        return res.status(403).json({ message: "Access denied: holiday not accessible" });
      }
      
      const holidayData = insertHolidaySchema.partial().parse(req.body);
      // Prevent companyId modification
      delete holidayData.companyId;
      const holiday = await storage.updateHoliday(id, holidayData);
      res.json(holiday);
    } catch (error) {
      console.error("Error updating holiday:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid holiday data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update holiday" });
    }
  });

  app.delete('/api/holidays/:id', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin' && user?.role !== 'superadmin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      if (!user?.companyId) {
        return res.status(400).json({ message: "User must be assigned to a company" });
      }

      const id = parseInt(req.params.id);
      // CRITICAL SECURITY: Verify holiday belongs to user's company
      const existingHoliday = await storage.getHoliday(id);
      if (!existingHoliday || existingHoliday.companyId !== user.companyId) {
        return res.status(403).json({ message: "Access denied: holiday not accessible" });
      }
      
      await storage.deleteHoliday(id);
      res.json({ message: "Holiday deleted successfully" });
    } catch (error) {
      console.error("Error deleting holiday:", error);
      res.status(500).json({ message: "Failed to delete holiday" });
    }
  });

  app.get('/api/holidays/check/:date', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.companyId) {
        return res.status(400).json({ message: "User must be assigned to a company" });
      }

      const { date } = req.params;
      const isHoliday = await storage.isHoliday(date, user.companyId);
      res.json({ isHoliday, date });
    } catch (error) {
      console.error("Error checking holiday:", error);
      res.status(500).json({ message: "Failed to check holiday" });
    }
  });

  // Simple endpoint for getting users by company (for dropdowns/selects)
  app.get('/api/users/by-company', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const currentUser = await storage.getUser(req.user.claims.sub);
      
      if (!currentUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Only admins and superadmins can use this endpoint
      if (currentUser.role !== 'admin' && currentUser.role !== 'superadmin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      // Validate admin has a company
      if (currentUser.role === 'admin' && !currentUser.companyId) {
        return res.status(400).json({ message: "Admin must be assigned to a company" });
      }
      
      let users;
      if (currentUser.role === 'superadmin') {
        users = await storage.getAllUsers();
      } else {
        // Regular admins only get users from their company
        // Safe to use ! here because we validated above that admins have companyId
        users = await storage.getUsersByCompany(currentUser.companyId!);
      }
      
      // Return minimal user data for dropdowns
      const simpleUsers = users.map(user => ({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      }));
      
      res.json(simpleUsers);
    } catch (error) {
      console.error("Error fetching users by company:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // User management routes (admin and supervisor)
  app.get('/api/admin/users', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const scope = await getUserScope(req.user.claims.sub);
      
      // Allow admin, superadmin, and supervisor roles
      if (!['admin', 'superadmin', 'supervisor'].includes(scope.user.role)) {
        return res.status(403).json({ message: "Admin or supervisor access required" });
      }

      let users;
      if (scope.type === 'superadmin') {
        users = await storage.getAllUsers();
      } else if (scope.type === 'admin') {
        users = await storage.getUsersByCompany(scope.companyId!);
      } else if (scope.type === 'supervisor') {
        // Supervisors can only see users from their assigned sectors
        users = await storage.getUsersByScope(scope.companyId, scope.departmentIds!);
      } else {
        return res.status(403).json({ message: "Access denied" });
      }
      
      // Get departments for each user
      const usersWithDepartments = await Promise.all(
        users.map(async (user) => {
          let department = null;
          if (user.departmentId) {
            department = await storage.getDepartment(user.departmentId);
          }
          return { ...user, department };
        })
      );
      
      res.json(usersWithDepartments);
    } catch (error) {
      console.error("Error fetching users:", error);
      if (error instanceof Error && error.message.includes("assigned sectors")) {
        return res.status(400).json({ message: "Supervisor has no assigned sectors" });
      }
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // CSV Template Download
  app.get('/api/admin/users/csv/template', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const scope = await getUserScope(req.user.claims.sub);
      
      if (!['admin', 'superadmin'].includes(scope.user.role)) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const template = [
        {
          email: 'funcionario@exemplo.com',
          cpf: '123.456.789-00',
          nome: 'João da Silva',
          registro_interno: 'EMP001',
          telefone: '(11) 98765-4321',
          cargo: 'Analista',
          departamento_id: '1',
          salario: '3500.00',
          data_admissao: '2024-01-15',
          tipo_contrato: 'CLT',
          carga_horaria: '44',
          pis: '123.45678.90-1',
          rg: '12.345.678-9',
          orgao_emissor: 'SSP',
          uf_rg: 'SP',
          data_nascimento: '1990-05-20',
          sexo: 'M',
          estado_civil: 'Solteiro',
          naturalidade: 'São Paulo',
          uf_naturalidade: 'SP',
          nacionalidade: 'Brasileiro',
          grau_instrucao: 'Superior Completo',
          nome_mae: 'Maria da Silva',
          nome_pai: 'José da Silva',
          endereco_rua: 'Rua das Flores',
          endereco_numero: '123',
          endereco_complemento: 'Apto 45',
          endereco_bairro: 'Centro',
          endereco_cidade: 'São Paulo',
          endereco_estado: 'SP',
          endereco_cep: '01234-567',
          banco: '001',
          agencia: '1234',
          conta: '12345-6',
          tipo_conta: 'Corrente'
        }
      ];

      const csv = stringify(template, {
        header: true,
        columns: Object.keys(template[0]),
        delimiter: ';',
        bom: true
      });

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename=modelo_funcionarios.csv');
      res.send(csv);
    } catch (error) {
      console.error("Error generating CSV template:", error);
      res.status(500).json({ message: "Failed to generate CSV template" });
    }
  });

  // CSV Import
  app.post('/api/admin/users/csv/import', isAuthenticatedHybrid, csvUpload.single('file'), async (req: any, res) => {
    try {
      const scope = await getUserScope(req.user.claims.sub);
      
      if (!['admin', 'superadmin'].includes(scope.user.role)) {
        return res.status(403).json({ message: "Admin access required" });
      }

      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const fileContent = req.file.buffer.toString('utf-8');
      const records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        delimiter: ';',
        bom: true,
        trim: true
      });

      // WARNING: CSV import is synchronous - large imports may hit SendGrid rate limits
      if (records.length > 50) {
        console.warn(`[CSV IMPORT] Processing ${records.length} records synchronously. Large batches may encounter SendGrid rate limiting.`);
      }

      const results = {
        success: 0,
        errors: [] as Array<{ row: number; email: string; error: string }>,
        emailsFailed: [] as string[] // Only store emails, not passwords
      };

      for (let i = 0; i < records.length; i++) {
        const record = records[i];
        const rowNumber = i + 2; // +2 because row 1 is header and array is 0-indexed

        try {
          // Validate required fields
          if (!record.email || !record.nome) {
            results.errors.push({
              row: rowNumber,
              email: record.email || 'N/A',
              error: 'Email e nome são obrigatórios'
            });
            continue;
          }

          // Check if user already exists
          const existingUser = await storage.getUserByEmail(record.email);
          if (existingUser) {
            results.errors.push({
              row: rowNumber,
              email: record.email,
              error: 'Usuário já existe'
            });
            continue;
          }

          // Get company ID
          let companyId = scope.companyId;
          if (scope.type === 'superadmin' && !companyId) {
            results.errors.push({
              row: rowNumber,
              email: record.email,
              error: 'Superadmin deve especificar empresa'
            });
            continue;
          }

          // Parse department ID
          const departmentId = record.departamento_id ? parseInt(record.departamento_id) : undefined;

          // Generate temporary password and hash it
          const temporaryPassword = generateTemporaryPassword(10);
          const passwordHash = await hashPassword(temporaryPassword);

          // Create user with password
          const newUser = await storage.createCompleteEmployee({
            email: record.email,
            cpf: record.cpf || null,
            role: 'employee',
            passwordHash,
            mustChangePassword: true,
            companyId: companyId!,
            departmentId: departmentId || null,
            internalId: record.registro_interno || null,
            personalInfo: {
              fullName: record.nome,
              phone: record.telefone || null,
              position: record.cargo || null,
              salary: record.salario ? parseFloat(record.salario) : null,
              admissionDate: record.data_admissao || null,
              contractType: record.tipo_contrato || null,
              workload: record.carga_horaria ? parseInt(record.carga_horaria) : null,
              pis: record.pis || null,
              rg: record.rg || null,
              issuingAgency: record.orgao_emissor || null,
              rgUf: record.uf_rg || null,
              birthDate: record.data_nascimento || null,
              gender: record.sexo || null,
              maritalStatus: record.estado_civil || null,
              placeOfBirth: record.naturalidade || null,
              birthUf: record.uf_naturalidade || null,
              nationality: record.nacionalidade || null,
              educationLevel: record.grau_instrucao || null,
              motherName: record.nome_mae || null,
              fatherName: record.nome_pai || null,
            },
            addressInfo: {
              street: record.endereco_rua || null,
              number: record.endereco_numero || null,
              complement: record.endereco_complemento || null,
              neighborhood: record.endereco_bairro || null,
              city: record.endereco_cidade || null,
              state: record.endereco_estado || null,
              zipCode: record.endereco_cep || null,
            },
            bankInfo: {
              bank: record.banco || null,
              agency: record.agencia || null,
              account: record.conta || null,
              accountType: record.tipo_conta || null,
            }
          });

          results.success++;

          // Send welcome email with temporary password
          const emailSent = await sendTemporaryPasswordEmail(
            newUser.email,
            record.nome,
            temporaryPassword
          );
          
          if (!emailSent) {
            console.error(`[SECURITY] Failed to send welcome email to ${newUser.email} during CSV import. Temporary password: ${temporaryPassword}`);
            results.emailsFailed.push(newUser.email);
          }

          // Create audit log
          await createAuditLog(
            req.user.claims.sub,
            companyId!,
            'CREATE',
            'user',
            newUser.id,
            { source: 'csv_import', email: record.email, emailSent }
          );

        } catch (error) {
          console.error(`Error importing row ${rowNumber}:`, error);
          results.errors.push({
            row: rowNumber,
            email: record.email,
            error: error instanceof Error ? error.message : 'Erro desconhecido'
          });
        }
      }

      res.json({
        message: `Importação concluída: ${results.success} funcionários criados`,
        success: results.success,
        errors: results.errors,
        emailsFailed: results.emailsFailed
      });

    } catch (error) {
      console.error("Error importing CSV:", error);
      res.status(500).json({ message: "Failed to import CSV" });
    }
  });

  // CSV Export
  app.get('/api/admin/users/csv/export', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const scope = await getUserScope(req.user.claims.sub);
      
      if (!['admin', 'superadmin'].includes(scope.user.role)) {
        return res.status(403).json({ message: "Admin access required" });
      }

      let users;
      if (scope.type === 'superadmin') {
        users = await storage.getAllUsers();
      } else if (scope.type === 'admin') {
        users = await storage.getUsersByCompany(scope.companyId!);
      } else {
        return res.status(403).json({ message: "Access denied" });
      }

      // Get departments for each user
      const usersWithDetails = await Promise.all(
        users.map(async (user) => {
          let department = null;
          if (user.departmentId) {
            department = await storage.getDepartment(user.departmentId);
          }
          return { ...user, department };
        })
      );

      const csvData = usersWithDetails.map(user => ({
        email: user.email || '',
        cpf: user.cpf || '',
        nome: user.personalInfo?.fullName || '',
        registro_interno: user.internalId || '',
        telefone: user.personalInfo?.phone || '',
        cargo: user.personalInfo?.position || '',
        departamento_id: user.departmentId || '',
        departamento_nome: user.department?.name || '',
        salario: user.personalInfo?.salary || '',
        data_admissao: user.personalInfo?.admissionDate || '',
        tipo_contrato: user.personalInfo?.contractType || '',
        carga_horaria: user.personalInfo?.workload || '',
        pis: user.personalInfo?.pis || '',
        rg: user.personalInfo?.rg || '',
        orgao_emissor: user.personalInfo?.issuingAgency || '',
        uf_rg: user.personalInfo?.rgUf || '',
        data_nascimento: user.personalInfo?.birthDate || '',
        sexo: user.personalInfo?.gender || '',
        estado_civil: user.personalInfo?.maritalStatus || '',
        naturalidade: user.personalInfo?.placeOfBirth || '',
        uf_naturalidade: user.personalInfo?.birthUf || '',
        nacionalidade: user.personalInfo?.nationality || '',
        grau_instrucao: user.personalInfo?.educationLevel || '',
        nome_mae: user.personalInfo?.motherName || '',
        nome_pai: user.personalInfo?.fatherName || '',
        endereco_rua: user.addressInfo?.street || '',
        endereco_numero: user.addressInfo?.number || '',
        endereco_complemento: user.addressInfo?.complement || '',
        endereco_bairro: user.addressInfo?.neighborhood || '',
        endereco_cidade: user.addressInfo?.city || '',
        endereco_estado: user.addressInfo?.state || '',
        endereco_cep: user.addressInfo?.zipCode || '',
        banco: user.bankInfo?.bank || '',
        agencia: user.bankInfo?.agency || '',
        conta: user.bankInfo?.account || '',
        tipo_conta: user.bankInfo?.accountType || '',
        status: user.isActive ? 'Ativo' : 'Inativo',
        funcao: user.role === 'admin' ? 'Administrador' : 'Funcionário'
      }));

      const csv = stringify(csvData, {
        header: true,
        columns: Object.keys(csvData[0] || {}),
        delimiter: ';',
        bom: true
      });

      const timestamp = new Date().toISOString().split('T')[0];
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename=funcionarios_${timestamp}.csv`);
      res.send(csv);

    } catch (error) {
      console.error("Error exporting CSV:", error);
      res.status(500).json({ message: "Failed to export CSV" });
    }
  });

  app.put('/api/users/:id/company', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const currentUser = await storage.getUser(req.user.claims.sub);
      if (currentUser?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      if (!currentUser?.companyId) {
        return res.status(400).json({ message: "Admin must be assigned to a company" });
      }

      const userId = req.params.id;
      const { companyId } = req.body;
      
      if (!companyId) {
        return res.status(400).json({ message: "Company ID is required" });
      }

      // CRITICAL SECURITY: Admin can only move users within their own company
      if (companyId !== currentUser.companyId) {
        return res.status(403).json({ message: "Access denied: cannot move users to different company" });
      }

      // CRITICAL SECURITY: Verify target user belongs to admin's company
      const targetUser = await storage.getUser(userId);
      if (!targetUser) {
        return res.status(404).json({ message: "User not found" });
      }
      if (targetUser.companyId !== currentUser.companyId) {
        return res.status(403).json({ message: "Access denied: user not in your company" });
      }

      // Verify company exists (redundant but safe)
      const company = await storage.getCompany(companyId);
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }

      await storage.updateUserCompany(userId, companyId);
      res.json({ message: "User company updated successfully" });
    } catch (error) {
      console.error("Error updating user company:", error);
      res.status(500).json({ message: "Failed to update user company" });
    }
  });


  // Time clock routes
  app.get('/api/time-clock/status', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const activeEntry = await storage.getActiveTimeEntry(userId);
      
      res.json({
        isClocked: !!activeEntry,
        activeEntry: activeEntry || null,
      });
    } catch (error) {
      console.error("Error getting clock status:", error);
      res.status(500).json({ message: "Failed to get clock status" });
    }
  });

  // Get current day hours statistics (including overtime)
  app.get('/api/time-clock/hours-stats', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Get current active time entry
      const activeEntry = await storage.getActiveTimeEntry(userId);
      
      if (!activeEntry) {
        return res.json({
          isActive: false,
          totalHours: 0,
          regularHours: 0,
          overtimeHours: 0,
          estimatedOvertimeHours: 0
        });
      }
      
      // Calculate current hours worked (gross)
      const now = getBrazilianTime();
      const grossHours = calculateHours(new Date(activeEntry.clockInTime!), now);
      
      // Create a temporary time entry for net hours calculation
      const tempTimeEntry = {
        ...activeEntry,
        clockOutTime: now
      };
      
      // Calculate net worked hours (considering breaks) - using proper storage instance
      const netWorkedHours = await computeNetWorkedHours(tempTimeEntry, storage as any);
      
      // Calculate estimated overtime based on net hours
      const { regularHours: estimatedRegular, overtimeHours: estimatedOvertime } = await calculateOvertimeHours(
        netWorkedHours, 
        activeEntry.departmentId, 
        storage as any
      );
      
      return res.json({
        isActive: true,
        totalHours: Number(netWorkedHours.toFixed(2)), // Net hours (after breaks)
        regularHours: Number(estimatedRegular.toFixed(2)),
        overtimeHours: Number(estimatedOvertime.toFixed(2)),
        estimatedOvertimeHours: Number(estimatedOvertime.toFixed(2)) // For current session
      });
      
    } catch (error) {
      console.error("Error fetching hours stats:", error);
      res.status(500).json({ message: "Failed to fetch hours statistics" });
    }
  });

  // Department shift break management routes - API CRUD
  // Get breaks for a specific shift
  app.get('/api/department-shifts/:shiftId/breaks', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const shiftId = parseInt(req.params.shiftId);
      const breaks = await storage.getShiftBreaks(shiftId);
      
      res.json(breaks);
    } catch (error) {
      console.error("Error fetching shift breaks:", error);
      res.status(500).json({ message: "Failed to fetch shift breaks" });
    }
  });

  // Get user's active shift data (for liquid hours calculation in time clock)
  app.get('/api/department-shifts/:departmentId/user-shift', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || !user.companyId) {
        return res.status(404).json({ message: "User not found or not assigned to company" });
      }

      const departmentId = parseInt(req.params.departmentId);
      
      // Ensure user has access to this department data
      if (user.role !== 'admin' && user.role !== 'superadmin' && user.departmentId !== departmentId) {
        return res.status(403).json({ message: "Access denied to this department data" });
      }

      const allShifts = await storage.getDepartmentShifts(departmentId);
      
      // Filter for active shifts only
      const activeShifts = allShifts.filter(shift => shift.isActive);
      
      // Get current day of week (0 = Sunday, 1 = Monday, etc.)
      const today = new Date();
      const currentDayOfWeek = today.getDay();
      
      // Find shift that applies to today
      const applicableShift = activeShifts.find(shift => {
        // Check if today is in the shift's daysOfWeek array
        return shift.daysOfWeek && shift.daysOfWeek.includes(currentDayOfWeek);
      });
      
      // Return single shift or null
      if (applicableShift) {
        res.json(applicableShift);
      } else {
        // No shift found for today
        res.json(null);
      }
    } catch (error) {
      console.error("Error fetching user shift data:", error);
      res.status(500).json({ message: "Failed to fetch user shift data" });
    }
  });

  // Get specific break
  app.get('/api/shift-breaks/:id', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const breakId = parseInt(req.params.id);
      const shiftBreak = await storage.getShiftBreak(breakId);
      
      if (!shiftBreak) {
        return res.status(404).json({ message: "Shift break not found" });
      }
      
      res.json(shiftBreak);
    } catch (error) {
      console.error("Error fetching shift break:", error);
      res.status(500).json({ message: "Failed to fetch shift break" });
    }
  });

  // Create new shift break
  app.post('/api/department-shifts/:shiftId/breaks', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const shiftId = parseInt(req.params.shiftId);
      
      // Validate input data using insertDepartmentShiftBreakSchema
      const breakData = insertDepartmentShiftBreakSchema.parse(req.body);
      
      const newBreak = await storage.createShiftBreak({
        ...breakData,
        shiftId
      });
      
      res.status(201).json(newBreak);
    } catch (error) {
      console.error("Error creating shift break:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid break data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create shift break" });
    }
  });

  // Update shift break
  app.patch('/api/shift-breaks/:id', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const breakId = parseInt(req.params.id);
      
      // Validate partial update data
      const updateData = insertDepartmentShiftBreakSchema.partial().parse(req.body);
      
      const updatedBreak = await storage.updateShiftBreak(breakId, updateData);
      
      res.json(updatedBreak);
    } catch (error) {
      console.error("Error updating shift break:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid update data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update shift break" });
    }
  });

  // Delete shift break
  app.delete('/api/shift-breaks/:id', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const breakId = parseInt(req.params.id);
      
      await storage.deleteShiftBreak(breakId);
      
      res.json({ message: "Shift break deleted successfully" });
    } catch (error) {
      console.error("Error deleting shift break:", error);
      res.status(500).json({ message: "Failed to delete shift break" });
    }
  });

  // Break management routes
  app.post('/api/time-clock/break-start', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { type = 'break' } = req.body; // 'break' or 'lunch'
      
      // Get current active time entry
      const activeEntry = await storage.getActiveTimeEntry(userId);
      if (!activeEntry) {
        return res.status(400).json({ message: "No active time entry to start a break" });
      }
      
      // Check if there's already an active break
      const existingBreaks = await storage.getBreakEntriesByTimeEntry(activeEntry.id);
      const activeBreak = existingBreaks.find(b => b.breakStart && !b.breakEnd);
      if (activeBreak) {
        return res.status(400).json({ message: "A break is already in progress" });
      }
      
      // Create new break entry
      const breakEntry = await storage.createBreakEntry({
        timeEntryId: activeEntry.id,
        breakStart: new Date(),
        breakEnd: null,
        duration: null,
        type: type,
      });
      
      res.json(breakEntry);
    } catch (error) {
      console.error("Error starting break:", error);
      res.status(500).json({ message: "Failed to start break" });
    }
  });

  app.post('/api/time-clock/break-end', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Get current active time entry
      const activeEntry = await storage.getActiveTimeEntry(userId);
      if (!activeEntry) {
        return res.status(400).json({ message: "No active time entry" });
      }
      
      // Find active break
      const existingBreaks = await storage.getBreakEntriesByTimeEntry(activeEntry.id);
      const activeBreak = existingBreaks.find(b => b.breakStart && !b.breakEnd);
      
      if (!activeBreak) {
        return res.status(400).json({ message: "No active break to end" });
      }
      
      // Calculate duration in hours
      const breakEnd = new Date();
      const breakStart = new Date(activeBreak.breakStart!);
      const durationMs = breakEnd.getTime() - breakStart.getTime();
      const durationHours = durationMs / (1000 * 60 * 60); // Convert to hours
      
      // Update break entry with end time and duration
      const updatedBreak = await storage.updateBreakEntry(activeBreak.id, {
        breakEnd,
        duration: durationHours.toString(),
      });
      
      res.json(updatedBreak);
    } catch (error) {
      console.error("Error ending break:", error);
      res.status(500).json({ message: "Failed to end break" });
    }
  });

  app.get('/api/time-clock/breaks', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Get current active time entry
      const activeEntry = await storage.getActiveTimeEntry(userId);
      if (!activeEntry) {
        return res.json([]); // Return empty array if no active entry
      }
      
      const breaks = await storage.getBreakEntriesByTimeEntry(activeEntry.id);
      res.json(breaks);
    } catch (error) {
      console.error("Error fetching breaks:", error);
      res.status(500).json({ message: "Failed to fetch breaks" });
    }
  });

  app.post('/api/time-clock/clock-in', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || !user.companyId) {
        return res.status(400).json({ message: "User must be assigned to a company" });
      }

      // Check if user is already clocked in
      const activeEntry = await storage.getActiveTimeEntry(userId);
      if (activeEntry) {
        return res.status(400).json({ message: "Already clocked in" });
      }

      const { latitude, longitude, faceRecognitionData, locationFallback }: ClockInRequest = clockInSchema.parse(req.body);
      
      // Get current date and check if period is closed
      const now = getBrazilianTime();
      const today = getBrazilianDateString();
      const canModify = await storage.canModifyTimeEntries(user.companyId, today);
      if (!canModify) {
        return res.status(403).json({ 
          message: "Período fechado - não é possível registrar ponto nesta data",
          code: "PERIOD_CLOSED"
        });
      }
      
      // Capture IP address (normalize x-forwarded-for to first IP)
      let ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';
      if (typeof ipAddress === 'string' && ipAddress.includes(',')) {
        ipAddress = ipAddress.split(',')[0].trim();
      }
      
      // Validation results
      let withinGeofence: boolean | null = null;
      let shiftCompliant: boolean | null = null;
      let validationMessages: string[] = [];
      
      // Skip geolocation validation if this is a fallback registration (camera not available)
      // OR if user doesn't have department/sector configured
      if (!locationFallback && user.departmentId) {
        // Get department for geofence validation (optional)
        const department = await storage.getDepartment(user.departmentId);
        
        if (department && department.sectorId) {
          // Get sector for geolocation (lat/lng moved from departments to sectors)
          const sector = await storage.getSector(department.sectorId);
          
          if (sector) {
            // Validate geolocation only if sector has valid coordinates
            if (sector.latitude !== 0 || sector.longitude !== 0) {
              const distance = calculateDistance(latitude, longitude, sector.latitude, sector.longitude);
              const radius = sector.radius || 100; // Default to 100m if null
              withinGeofence = distance <= radius;
              
              if (withinGeofence) {
                validationMessages.push(`✓ Localização OK (${Math.round(distance)}m do setor)`);
              } else {
                validationMessages.push(`⚠ Fora da área permitida (${Math.round(distance)}m de distância, máximo: ${radius}m)`);
              }
            }
          }
        }
        
        // Validate shift schedule (optional - only if user has shifts configured)
        const userShifts = await storage.getUserShiftAssignments(userId);
        if (userShifts && userShifts.length > 0) {
          // Find active shift for today
          const todayDate = new Date(today);
          const activeShift = userShifts.find(assignment => {
            const startDate = assignment.startDate ? new Date(assignment.startDate) : null;
            const endDate = assignment.endDate ? new Date(assignment.endDate) : null;
            
            if (startDate && todayDate < startDate) return false;
            if (endDate && todayDate > endDate) return false;
            return true;
          });
          
          if (activeShift) {
            // Get shift details
            const shift = await storage.getDepartmentShift(activeShift.shiftId);
            if (shift && shift.isActive) {
              // Check if today's day of week matches shift schedule
              const dayOfWeek = todayDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
              const shiftDays = shift.daysOfWeek || [];
              
              if (shiftDays.includes(dayOfWeek)) {
                // Check time range (handle overnight shifts) - convert UTC to Brazil time
                const currentTime = now.toLocaleTimeString('pt-BR', {
                  timeZone: 'America/Sao_Paulo',
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false
                }).slice(0, 5); // "HH:MM"
                const startTime = shift.startTime;
                const endTime = shift.endTime;
                
                // Convert time to minutes for proper comparison
                const timeToMinutes = (time: string) => {
                  const [hours, minutes] = time.split(':').map(Number);
                  return hours * 60 + minutes;
                };
                
                const currentMinutes = timeToMinutes(currentTime);
                const startMinutes = timeToMinutes(startTime);
                const endMinutes = timeToMinutes(endTime);
                
                // Handle overnight shifts (e.g., 22:00 - 06:00)
                if (endMinutes < startMinutes) {
                  // Overnight shift: compliant if after start OR before end
                  shiftCompliant = currentMinutes >= startMinutes || currentMinutes <= endMinutes;
                } else {
                  // Normal shift: compliant if between start and end
                  shiftCompliant = currentMinutes >= startMinutes && currentMinutes <= endMinutes;
                }
                
                if (shiftCompliant) {
                  validationMessages.push(`✓ Turno OK (${shift.name}: ${startTime} - ${endTime})`);
                } else {
                  validationMessages.push(`⚠ Fora do horário do turno (${shift.name}: ${startTime} - ${endTime}, atual: ${currentTime})`);
                }
              } else {
                shiftCompliant = false;
                validationMessages.push(`⚠ Hoje não é dia de trabalho neste turno (${shift.name})`);
              }
            }
          }
        }
      }

      // Process facial recognition data
      console.log("🔍 DEBUG - faceRecognitionData received:", JSON.stringify(faceRecognitionData, null, 2));
      const faceRecognitionVerified = !!faceRecognitionData;
      const clockInPhotoUrl = faceRecognitionData?.photoUrl || null;
      console.log("🔍 DEBUG - clockInPhotoUrl extracted:", clockInPhotoUrl);

      const timeEntry = await storage.createTimeEntry({
        userId,
        departmentId: user.departmentId,
        clockInTime: now,
        clockInLatitude: latitude,
        clockInLongitude: longitude,
        clockInIpAddress: ipAddress as string,
        clockInWithinGeofence: withinGeofence,
        clockInShiftCompliant: shiftCompliant,
        clockInValidationMessage: validationMessages.join('\n') || null,
        faceRecognitionVerified,
        clockInPhotoUrl,
        date: today,
        status: 'active',
      });

      // Create audit log for clock-in
      await createAuditLog(
        userId,
        user.companyId,
        'time_entry_clock_in',
        'time_entry',
        timeEntry.id.toString(),
        {
          date: today,
          clockInTime: now,
          latitude,
          longitude,
          ipAddress,
          withinGeofence,
          shiftCompliant,
          validationMessages: validationMessages.join('\n'),
          faceRecognitionVerified
        },
        userId
      );

      res.json({
        ...timeEntry,
        validationMessages
      });
    } catch (error) {
      console.error("Error clocking in:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid clock in data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to clock in" });
    }
  });

  app.post('/api/time-clock/clock-out', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || !user.companyId) {
        return res.status(400).json({ message: "User must be assigned to a company" });
      }

      // Check if user is clocked in
      const activeEntry = await storage.getActiveTimeEntry(userId);
      if (!activeEntry) {
        return res.status(400).json({ message: "Not currently clocked in" });
      }

      // Check if the current date is within a closed period
      const today = getBrazilianDateString();
      const canModify = await storage.canModifyTimeEntries(user.companyId, today);
      if (!canModify) {
        return res.status(403).json({ 
          message: "Período fechado - não é possível registrar ponto nesta data",
          code: "PERIOD_CLOSED"
        });
      }

      const { latitude, longitude, faceRecognitionData, locationFallback }: ClockOutRequest = clockOutSchema.parse(req.body);
      
      // Capture IP address (normalize x-forwarded-for to first IP)
      let ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';
      if (typeof ipAddress === 'string' && ipAddress.includes(',')) {
        ipAddress = ipAddress.split(',')[0].trim();
      }
      
      // Validation results
      let withinGeofence: boolean | null = null;
      let shiftCompliant: boolean | null = null;
      let validationMessages: string[] = [];
      
      // Skip geolocation validation if this is a fallback registration (camera not available)
      // OR if user doesn't have department/sector configured
      if (!locationFallback && user.departmentId) {
        // Get department for geofence validation (optional)
        const department = await storage.getDepartment(user.departmentId);
        
        if (department && department.sectorId) {
          // Get sector for geolocation (lat/lng moved from departments to sectors)
          const sector = await storage.getSector(department.sectorId);
          
          if (sector) {
            // Validate geolocation only if sector has valid coordinates
            if (sector.latitude !== 0 || sector.longitude !== 0) {
              const distance = calculateDistance(latitude, longitude, sector.latitude, sector.longitude);
              const radius = sector.radius || 100; // Default to 100m if null
              withinGeofence = distance <= radius;
              
              if (withinGeofence) {
                validationMessages.push(`✓ Localização OK (${Math.round(distance)}m do setor)`);
              } else {
                validationMessages.push(`⚠ Fora da área permitida (${Math.round(distance)}m de distância, máximo: ${radius}m)`);
              }
            }
          }
        }
        
        // Validate shift schedule (optional - only if user has shifts configured)
        const userShifts = await storage.getUserShiftAssignments(userId);
        if (userShifts && userShifts.length > 0) {
          // Find active shift for today
          const todayDate = new Date(today);
          const activeShift = userShifts.find(assignment => {
            const startDate = assignment.startDate ? new Date(assignment.startDate) : null;
            const endDate = assignment.endDate ? new Date(assignment.endDate) : null;
            
            if (startDate && todayDate < startDate) return false;
            if (endDate && todayDate > endDate) return false;
            return true;
          });
          
          if (activeShift) {
            // Get shift details
            const shift = await storage.getDepartmentShift(activeShift.shiftId);
            if (shift && shift.isActive) {
              // Check if today's day of week matches shift schedule
              const dayOfWeek = todayDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
              const shiftDays = shift.daysOfWeek || [];
              
              if (shiftDays.includes(dayOfWeek)) {
                const now = getBrazilianTime();
                // Check time range - convert UTC to Brazil time
                const currentTime = now.toLocaleTimeString('pt-BR', {
                  timeZone: 'America/Sao_Paulo',
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false
                }).slice(0, 5); // "HH:MM"
                const startTime = shift.startTime;
                const endTime = shift.endTime;
                
                // Simple time comparison
                shiftCompliant = currentTime >= startTime && currentTime <= endTime;
                
                if (shiftCompliant) {
                  validationMessages.push(`✓ Turno OK (${shift.name}: ${startTime} - ${endTime})`);
                } else {
                  validationMessages.push(`⚠ Fora do horário do turno (${shift.name}: ${startTime} - ${endTime}, atual: ${currentTime})`);
                }
              } else {
                shiftCompliant = false;
                validationMessages.push(`⚠ Hoje não é dia de trabalho neste turno (${shift.name})`);
              }
            }
          }
        }
      }

      const now = getBrazilianTime();
      const grossHours = calculateHours(new Date(activeEntry.clockInTime!), now);

      // First, update the time entry with clock-out info and gross hours
      const timeEntryWithClockOut = await storage.updateTimeEntry(activeEntry.id, {
        clockOutTime: now,
        clockOutLatitude: latitude,
        clockOutLongitude: longitude,
        clockOutIpAddress: ipAddress as string,
        clockOutWithinGeofence: withinGeofence,
        clockOutShiftCompliant: shiftCompliant,
        clockOutValidationMessage: validationMessages.join('\n') || null,
        totalHours: grossHours.toString(),
        status: 'completed',
      });

      // Then calculate net worked hours (considering breaks)
      const netWorkedHours = await computeNetWorkedHours(timeEntryWithClockOut, storage as any);

      // Calculate overtime hours based on net worked hours
      const { regularHours, overtimeHours } = await calculateOvertimeHours(
        netWorkedHours, 
        activeEntry.departmentId, 
        storage as any
      );

      // Final update with calculated hours
      const updatedEntry = await storage.updateTimeEntry(activeEntry.id, {
        totalHours: grossHours.toString(), // Keep gross hours for transparency
        regularHours: regularHours.toString(),
        overtimeHours: overtimeHours.toString(),
      });

      // Create audit log for clock-out
      await createAuditLog(
        userId,
        user.companyId,
        'time_entry_clock_out',
        'time_entry',
        activeEntry.id.toString(),
        {
          date: today,
          clockOutTime: now,
          latitude,
          longitude,
          ipAddress,
          withinGeofence,
          shiftCompliant,
          validationMessages: validationMessages.join('\n'),
          totalHours: grossHours.toString()
        },
        userId
      );

      res.json({
        ...updatedEntry,
        validationMessages
      });
    } catch (error) {
      console.error("Error clocking out:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid clock out data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to clock out" });
    }
  });

  // Manual time entry schemas
  const manualTimeEntrySchema = z.object({
    clockInTime: z.string().refine(date => !isNaN(Date.parse(date)), "Invalid clock in time"),
    clockOutTime: z.string().refine(date => !isNaN(Date.parse(date)), "Invalid clock out time").optional(),
    justification: z.string().min(10, "Justification must be at least 10 characters"),
    supportDocumentUrl: z.string().optional(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  });

  const approvalSchema = z.object({
    action: z.enum(['approve', 'reject']),
    reason: z.string().optional(),
  });

  // Manual time entry endpoints
  app.post('/api/time-clock/manual-entry', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || !user.departmentId || !user.companyId) {
        return res.status(400).json({ message: "User must be assigned to a department and company" });
      }

      const { clockInTime, clockOutTime, justification, supportDocumentUrl, date } = manualTimeEntrySchema.parse(req.body);
      
      // Check if the requested date is within a closed period
      const canModify = await storage.canModifyTimeEntries(user.companyId, date);
      if (!canModify) {
        return res.status(403).json({ 
          message: "Período fechado - não é possível criar entrada manual para esta data",
          code: "PERIOD_CLOSED"
        });
      }
      
      // Convert string dates to Date objects
      const clockInDate = new Date(clockInTime);
      const clockOutDate = clockOutTime ? new Date(clockOutTime) : null;
      
      // Calculate total hours if both times provided
      let totalHours = null;
      if (clockOutDate) {
        totalHours = calculateHours(clockInDate, clockOutDate).toString();
      }

      const timeEntry = await storage.createManualTimeEntry({
        userId,
        departmentId: user.departmentId,
        clockInTime: clockInDate,
        clockOutTime: clockOutDate,
        totalHours,
        date,
        status: clockOutDate ? 'completed' : 'active',
        entryType: 'manual_insertion',
        insertedBy: userId,
        justification,
        supportDocumentUrl,
        approvalStatus: 'pending',
      });

      // Create audit log for manual time entry
      await createAuditLog(
        userId,
        user.companyId,
        'time_entry_manual_create',
        'time_entry',
        timeEntry.id.toString(),
        {
          date,
          clockInTime: clockInDate,
          clockOutTime: clockOutDate,
          justification,
          approvalStatus: 'pending'
        },
        userId
      );

      res.json(timeEntry);
    } catch (error) {
      console.error("Error creating manual time entry:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid manual entry data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create manual time entry" });
    }
  });

  app.get('/api/time-clock/pending-approval', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || !user.companyId) {
        return res.status(400).json({ message: "User not found or not assigned to company" });
      }

      // Check if user is a supervisor
      const scope = await storage.getSupervisorScope(userId);
      if (!scope) {
        return res.status(403).json({ message: "Access denied: supervisor privileges required" });
      }

      const pendingEntries = await storage.getTimeEntriesForApproval(userId);
      res.json(pendingEntries);
    } catch (error) {
      console.error("Error fetching pending approvals:", error);
      res.status(500).json({ message: "Failed to fetch pending approvals" });
    }
  });

  app.post('/api/time-clock/approve/:id', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const entryId = parseInt(req.params.id);
      const { action, reason } = approvalSchema.parse(req.body);

      // Check if user is a supervisor
      const scope = await storage.getSupervisorScope(userId);
      if (!scope) {
        return res.status(403).json({ message: "Access denied: supervisor privileges required" });
      }

      let updatedEntry;
      if (action === 'approve') {
        updatedEntry = await storage.approveTimeEntry(entryId, userId);
      } else {
        if (!reason) {
          return res.status(400).json({ message: "Reason is required for rejection" });
        }
        updatedEntry = await storage.rejectTimeEntry(entryId, userId, reason);
      }

      res.json(updatedEntry);
    } catch (error) {
      console.error("Error processing approval:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid approval data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to process approval" });
    }
  });

  // Medical certificate upload endpoint
  app.post('/api/time-clock/upload-certificate', isAuthenticatedHybrid, upload.single('certificate'), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // Create uploads directory if it doesn't exist
      const uploadsDir = path.join(process.cwd(), 'uploads', 'certificates');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      // Generate unique filename
      const filename = `${userId}_${Date.now()}_${req.file.originalname}`;
      const filepath = path.join(uploadsDir, filename);

      // Save file
      fs.writeFileSync(filepath, req.file.buffer);

      // Return URL
      const certificateUrl = `/uploads/certificates/${filename}`;
      
      res.json({ 
        url: certificateUrl,
        filename: filename,
        originalName: req.file.originalname,
        size: req.file.size
      });
    } catch (error) {
      console.error("Error uploading certificate:", error);
      res.status(500).json({ message: "Failed to upload certificate" });
    }
  });

  // Time entries and reports
  app.get('/api/time-entries', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { startDate, endDate } = req.query;
      
      const entries = await storage.getTimeEntriesByUser(
        userId, 
        startDate as string, 
        endDate as string
      );
      
      res.json(entries);
    } catch (error) {
      console.error("Error fetching time entries:", error);
      res.status(500).json({ message: "Failed to fetch time entries" });
    }
  });

  app.get('/api/reports/monthly', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const currentUserId = req.user.claims.sub;
      const { year, month, userId: requestedUserId } = req.query;
      
      if (!year || !month) {
        return res.status(400).json({ message: "Year and month are required" });
      }
      
      // Determine which user's report to fetch
      let targetUserId = currentUserId;
      
      // If a specific userId is requested, verify the current user is an admin
      if (requestedUserId && requestedUserId !== currentUserId) {
        const currentUser = await storage.getUser(currentUserId);
        if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'superadmin')) {
          return res.status(403).json({ message: "Only admins can view other users' reports" });
        }
        
        // Verify the requested user exists and is in the same company (for admin)
        const requestedUser = await storage.getUser(requestedUserId as string);
        if (!requestedUser) {
          return res.status(404).json({ message: "Requested user not found" });
        }
        
        // For regular admins, verify same company
        if (currentUser.role === 'admin' && currentUser.companyId !== requestedUser.companyId) {
          return res.status(403).json({ message: "Cannot view reports from other companies" });
        }
        
        targetUserId = requestedUserId as string;
      }
      
      const stats = await storage.getUserMonthlyStats(
        targetUserId, 
        parseInt(year as string), 
        parseInt(month as string)
      );
      
      // Get detailed entries for the month
      const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
      const endDate = `${year}-${month.toString().padStart(2, '0')}-31`;
      const entries = await storage.getTimeEntriesByUser(targetUserId, startDate, endDate);
      
      // Enrich each entry with irregularity data
      const enrichedEntries = await Promise.all(
        entries.map(async (entry) => {
          const irregularityData = await computeIrregularities(entry, storage);
          const breakEntries = await storage.getBreakEntriesByTimeEntry(entry.id);
          return {
            ...entry,
            expectedHours: irregularityData.expectedHours.toString(),
            lateMinutes: irregularityData.lateMinutes,
            shortfallMinutes: irregularityData.shortfallMinutes,
            irregularityReasons: irregularityData.irregularityReasons,
            status: irregularityData.status,
            breakEntries,
          };
        })
      );
      
      res.json({
        stats,
        entries: enrichedEntries,
      });
    } catch (error) {
      console.error("Error generating monthly report:", error);
      res.status(500).json({ message: "Failed to generate monthly report" });
    }
  });

  // Face profile routes
  app.get('/api/face-profile', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await storage.getFaceProfile(userId);
      res.json(profile);
    } catch (error) {
      console.error("Error fetching face profile:", error);
      res.status(500).json({ message: "Failed to fetch face profile" });
    }
  });

  app.post('/api/face-profile', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profileData = insertFaceProfileSchema.parse({
        ...req.body,
        userId,
      });
      
      const existingProfile = await storage.getFaceProfile(userId);
      
      let profile;
      if (existingProfile) {
        profile = await storage.updateFaceProfile(userId, profileData);
      } else {
        profile = await storage.createFaceProfile(profileData);
      }
      
      res.json(profile);
    } catch (error) {
      console.error("Error saving face profile:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid face profile data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to save face profile" });
    }
  });

  // Endpoint para processar captura de reconhecimento facial
  app.post('/api/face-recognition/capture', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { image, timestamp } = req.body;
      
      if (!image) {
        return res.status(400).json({ message: "Image data is required" });
      }
      
      // Store image as data URL directly (no file system needed)
      // This works in all environments including Replit
      const photoUrl = `data:image/jpeg;base64,${image}`;
      console.log("📸 Photo saved as data URL, length:", photoUrl.length);
      
      // Mock face recognition processing
      // In a real implementation, this would analyze the image for facial features
      const mockFaceData = {
        confidence: 0.95,
        features: "mock_face_embedding_data",
        timestamp: timestamp,
      };
      
      // Save or update face profile
      const existingProfile = await storage.getFaceProfile(userId);
      
      if (existingProfile) {
        await storage.updateFaceProfile(userId, {
          faceData: mockFaceData,
        });
      } else {
        await storage.createFaceProfile({
          userId,
          faceData: mockFaceData,
          isActive: true,
        });
      }
      
      res.json({
        success: true,
        photoUrl,
        confidence: mockFaceData.confidence,
        faceData: mockFaceData,
      });
      
    } catch (error) {
      console.error("Error processing face capture:", error);
      res.status(500).json({ message: "Failed to process face capture" });
    }
  });

  // Time Period Management Routes (Admin/SuperAdmin only)
  
  // Helper function to check admin/superadmin role
  const requireAdminRole = (req: any, res: any, next: any) => {
    // Support both OAuth (claims.role) and local auth (user.role)
    const userRole = req.user?.claims?.role || req.user?.role;
    if (!userRole || !['admin', 'superadmin'].includes(userRole)) {
      return res.status(403).json({ message: "Access denied: admin privileges required" });
    }
    next();
  };

  // Get all time periods for company
  app.get('/api/time-periods', isAuthenticatedHybrid, requireAdminRole, async (req: any, res) => {
    try {
      const companyId = req.user.claims.companyId;
      if (!companyId) {
        return res.status(400).json({ message: "Company ID required" });
      }
      
      const periods = await storage.getTimePeriods(companyId);
      res.json(periods);
    } catch (error) {
      console.error("Error fetching time periods:", error);
      res.status(500).json({ message: "Failed to fetch time periods" });
    }
  });

  // Create new time period
  app.post('/api/time-periods', isAuthenticatedHybrid, requireAdminRole, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const companyId = req.user.claims.companyId;
      
      if (!companyId) {
        return res.status(400).json({ message: "Company ID required" });
      }

      const periodData = insertTimePeriodSchema.parse({
        ...req.body,
        companyId,
      });
      
      const period = await storage.createTimePeriod(periodData);
      
      // Log audit trail
      await storage.createAuditLog({
        action: 'create_time_period',
        performedBy: userId,
        companyId,
        targetResource: period.id.toString(),
        details: { periodData },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        success: true,
      });
      
      res.status(201).json(period);
    } catch (error) {
      console.error("Error creating time period:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid period data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create time period" });
    }
  });

  // Close time period
  app.post('/api/time-periods/:id/close', isAuthenticatedHybrid, requireAdminRole, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const companyId = req.user.claims.companyId;
      const periodId = parseInt(req.params.id);
      const { reason } = req.body;
      
      if (!reason) {
        return res.status(400).json({ message: "Reason for closing is required" });
      }
      
      const period = await storage.closeTimePeriod(periodId, userId, reason);
      
      // Log audit trail
      await storage.createAuditLog({
        action: 'close_time_period',
        performedBy: userId,
        companyId,
        targetResource: periodId.toString(),
        details: { reason, periodName: period.name },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        success: true,
      });
      
      res.json(period);
    } catch (error) {
      console.error("Error closing time period:", error);
      res.status(500).json({ message: "Failed to close time period" });
    }
  });

  // Reopen time period
  app.post('/api/time-periods/:id/reopen', isAuthenticatedHybrid, requireAdminRole, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const companyId = req.user.claims.companyId;
      const periodId = parseInt(req.params.id);
      const { reason } = req.body;
      
      if (!reason) {
        return res.status(400).json({ message: "Reason for reopening is required" });
      }
      
      const period = await storage.reopenTimePeriod(periodId, userId, reason);
      
      // Log audit trail
      await storage.createAuditLog({
        action: 'reopen_time_period',
        performedBy: userId,
        companyId,
        targetResource: periodId.toString(),
        details: { reason, periodName: period.name },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        success: true,
      });
      
      res.json(period);
    } catch (error) {
      console.error("Error reopening time period:", error);
      res.status(500).json({ message: "Failed to reopen time period" });
    }
  });

  // Get audit log for time periods and entries
  app.get('/api/audit-log', isAuthenticatedHybrid, requireAdminRole, async (req: any, res) => {
    try {
      const companyId = req.user.claims.companyId;
      const { limit = 100, offset = 0, action, startDate, endDate } = req.query;
      
      if (!companyId) {
        return res.status(400).json({ message: "Company ID required" });
      }
      
      const logs = await storage.getAuditLog(companyId, {
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        action: action as string,
        startDate: startDate as string,
        endDate: endDate as string,
      });
      
      res.json(logs);
    } catch (error) {
      console.error("Error fetching audit log:", error);
      res.status(500).json({ message: "Failed to fetch audit log" });
    }
  });

  // Check if time entries can be modified (period not closed)
  app.get('/api/time-periods/can-modify/:date', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const companyId = req.user.claims.companyId;
      const date = req.params.date;
      
      if (!companyId) {
        return res.status(400).json({ message: "Company ID required" });
      }
      
      const canModify = await storage.canModifyTimeEntries(companyId, date);
      res.json({ canModify, date });
    } catch (error) {
      console.error("Error checking modification permission:", error);
      res.status(500).json({ message: "Failed to check modification permission" });
    }
  });

  // ========================================================================================
  // TERMINAL/KIOSK ROUTES
  // ========================================================================================

  // Validate device code (public endpoint)
  app.get('/api/terminals/:deviceCode/validate', async (req, res) => {
    try {
      const { deviceCode } = req.params;
      const device = await storage.getAuthorizedDeviceByCode(deviceCode);
      
      if (!device) {
        return res.status(404).json({ 
          valid: false,
          message: "Dispositivo não autorizado" 
        });
      }

      if (!device.isActive) {
        return res.status(403).json({ 
          valid: false,
          message: "Dispositivo desativado" 
        });
      }

      // Get company name
      const company = await storage.getCompany(device.companyId);

      res.json({ 
        valid: true,
        device: {
          id: device.id,
          deviceName: device.deviceName,
          location: device.location,
          companyId: device.companyId,
          companyName: company?.name || 'Empresa'
        }
      });
    } catch (error) {
      console.error("Error validating device:", error);
      res.status(500).json({ message: "Falha ao validar dispositivo" });
    }
  });

  // Temporary token store for terminal sessions (in-memory, valid for 10 minutes)
  const terminalTokens = new Map<string, { userId: string, deviceId: number, expiresAt: number }>();

  // Cleanup expired tokens every minute
  setInterval(() => {
    const now = Date.now();
    for (const [token, data] of terminalTokens.entries()) {
      if (data.expiresAt < now) {
        terminalTokens.delete(token);
      }
    }
  }, 60000);

  // Login employee on terminal (public endpoint)
  app.post('/api/terminals/:deviceCode/login', async (req, res) => {
    try {
      const { deviceCode } = req.params;
      const { identifier, password } = req.body;

      // Validate device
      const device = await storage.getAuthorizedDeviceByCode(deviceCode);
      if (!device || !device.isActive) {
        return res.status(403).json({ message: "Dispositivo não autorizado" });
      }

      // Find user by CPF, email, or internal ID
      const allUsers = await storage.getUsersByCompany(device.companyId);
      const user = allUsers.find(u => 
        u.cpf === identifier || 
        u.email === identifier || 
        u.internalId === identifier
      );

      if (!user) {
        return res.status(401).json({ message: "Credenciais inválidas" });
      }

      if (!user.isActive) {
        return res.status(403).json({ message: "Usuário inativo" });
      }

      // Verify password
      if (!user.passwordHash) {
        return res.status(401).json({ message: "Usuário sem senha configurada" });
      }

      const argon2 = await import('argon2');
      const isValid = await argon2.verify(user.passwordHash, password);
      
      if (!isValid) {
        return res.status(401).json({ message: "Credenciais inválidas" });
      }

      // Update device last used
      await storage.updateDeviceLastUsed(device.id);

      // Generate temporary token (valid for 10 minutes)
      const crypto = await import('crypto');
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
      
      terminalTokens.set(token, {
        userId: user.id,
        deviceId: device.id,
        expiresAt
      });

      // Return user info with temporary token
      res.json({
        token,
        userId: user.id,
        name: `${user.firstName} ${user.lastName}`,
        cpf: user.cpf ? `***.***.***-${user.cpf.slice(-2)}` : null,
        email: user.email ? `${user.email.slice(0, 3)}***@***` : null,
        departmentId: user.departmentId,
        deviceId: device.id
      });
    } catch (error) {
      console.error("Error logging in on terminal:", error);
      res.status(500).json({ message: "Falha no login" });
    }
  });

  // Clock in/out via terminal (public endpoint)
  app.post('/api/terminals/:deviceCode/clock', async (req, res) => {
    try {
      const { deviceCode } = req.params;
      const { token, location, photoUrl, latitude, longitude } = req.body;

      // Validate device
      const device = await storage.getAuthorizedDeviceByCode(deviceCode);
      if (!device || !device.isActive) {
        return res.status(403).json({ message: "Dispositivo não autorizado" });
      }

      // Validate token
      const tokenData = terminalTokens.get(token);
      if (!tokenData) {
        return res.status(401).json({ message: "Token inválido ou expirado" });
      }

      // Check if token expired
      if (tokenData.expiresAt < Date.now()) {
        terminalTokens.delete(token);
        return res.status(401).json({ message: "Token expirado. Faça login novamente." });
      }

      // Verify token device matches request device
      if (tokenData.deviceId !== device.id) {
        return res.status(403).json({ message: "Token não corresponde ao dispositivo" });
      }

      // Get user
      const user = await storage.getUser(tokenData.userId);
      if (!user || !user.isActive || user.companyId !== device.companyId) {
        return res.status(403).json({ message: "Usuário não autorizado" });
      }

      // DUAL GEOFENCE VALIDATION
      const validationMessages: string[] = [];
      let isTerminalLocationValid = true;
      let isEmployeeLocationValid = true;

      // 1. Validate TERMINAL location (if configured)
      if (device.latitude && device.longitude && latitude && longitude) {
        const terminalDistance = calculateDistance(
          device.latitude,
          device.longitude,
          latitude,
          longitude
        );
        const terminalRadius = device.radius || 100;
        
        if (terminalDistance > terminalRadius) {
          isTerminalLocationValid = false;
          validationMessages.push(
            `⚠ Terminal fora da área autorizada (${Math.round(terminalDistance)}m de distância, máximo ${terminalRadius}m)`
          );
        } else {
          validationMessages.push(
            `✓ Terminal dentro da área autorizada (${Math.round(terminalDistance)}m)`
          );
        }
      }

      // 2. Validate EMPLOYEE sector location (if configured)
      if (user.departmentId && latitude && longitude) {
        const department = await storage.getDepartment(user.departmentId);
        if (department && department.sectorId) {
          const sector = await storage.getSector(department.sectorId);
          if (sector && sector.latitude && sector.longitude) {
            const sectorDistance = calculateDistance(
              sector.latitude,
              sector.longitude,
              latitude,
              longitude
            );
            const sectorRadius = sector.radius || 100;
            
            if (sectorDistance > sectorRadius) {
              isEmployeeLocationValid = false;
              validationMessages.push(
                `⚠ Funcionário fora do setor autorizado (${Math.round(sectorDistance)}m de distância, máximo ${sectorRadius}m)`
              );
            } else {
              validationMessages.push(
                `✓ Funcionário dentro do setor autorizado (${Math.round(sectorDistance)}m)`
              );
            }
          }
        }
      }

      // BLOCK registration only if TERMINAL validation fails
      // Employee sector validation is informative only when using terminal
      if (!isTerminalLocationValid) {
        return res.status(403).json({ 
          message: "Registro bloqueado: terminal fora da área autorizada",
          validationMessages 
        });
      }

      // Get client IP
      const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || 
                       req.socket.remoteAddress || 
                       'unknown';

      // Check if user is already clocked in
      const activeEntry = await storage.getActiveTimeEntry(tokenData.userId);
      const now = getBrazilianTime();
      const today = getBrazilianDateString();

      if (!activeEntry) {
        // Clock in - create new entry
        const timeEntry = await storage.createTimeEntry({
          userId: tokenData.userId,
          date: today,
          clockInTime: now,
          clockInPhotoUrl: photoUrl || null,
          clockInIp: clientIp,
          clockInLocation: location,
          departmentId: user.departmentId || null,
          deviceId: device.id,
          status: 'active',
          clockInLatitude: latitude,
          clockInLongitude: longitude,
          clockInValidationMessages: validationMessages.join('\n'),
        });

        res.json({
          action: 'clock_in',
          time: now.toISOString(),
          message: 'Entrada registrada com sucesso',
          validationMessages
        });
      } else {
        // Clock out - update existing entry
        // Calculate total hours
        const clockInDate = new Date(activeEntry.clockInTime);
        const totalHours = calculateHours(clockInDate, now).toString();
        
        const updated = await storage.updateTimeEntry(activeEntry.id, {
          clockOutTime: now,
          clockOutPhotoUrl: photoUrl || null,
          clockOutIp: clientIp,
          clockOutLocation: location,
          status: 'completed',
          totalHours,
          clockOutLatitude: latitude,
          clockOutLongitude: longitude,
          clockOutValidationMessages: validationMessages.join('\n'),
        });

        res.json({
          action: 'clock_out',
          time: now.toISOString(),
          message: 'Saída registrada com sucesso',
          validationMessages
        });
      }
    } catch (error) {
      console.error("Error clocking on terminal:", error);
      res.status(500).json({ message: "Falha ao registrar ponto" });
    }
  });

  // Admin terminal management routes
  app.get('/api/terminals', isAuthenticatedHybrid, requireAdminRole, async (req: any, res) => {
    try {
      const companyId = req.user.claims.companyId;
      if (!companyId) {
        return res.status(400).json({ message: "Company ID required" });
      }

      const devices = await storage.getAuthorizedDevices(companyId);
      res.json(devices);
    } catch (error) {
      console.error("Error fetching terminals:", error);
      res.status(500).json({ message: "Failed to fetch terminals" });
    }
  });

  app.post('/api/terminals', isAuthenticatedHybrid, requireAdminRole, async (req: any, res) => {
    try {
      const companyId = req.user.claims.companyId;
      if (!companyId) {
        return res.status(400).json({ message: "Company ID required" });
      }

      const { deviceCode, deviceName, location, latitude, longitude, radius } = req.body;

      // Check if device code already exists
      const existing = await storage.getAuthorizedDeviceByCode(deviceCode);
      if (existing) {
        return res.status(400).json({ message: "Código de dispositivo já existe" });
      }

      const device = await storage.createAuthorizedDevice({
        companyId,
        deviceCode,
        deviceName,
        location,
        latitude,
        longitude,
        radius,
        isActive: true,
      });

      res.status(201).json(device);
    } catch (error) {
      console.error("Error creating terminal:", error);
      res.status(500).json({ message: "Failed to create terminal" });
    }
  });

  app.patch('/api/terminals/:id', isAuthenticatedHybrid, requireAdminRole, async (req: any, res) => {
    try {
      const { id } = req.params;
      const companyId = req.user.claims.companyId;
      
      const device = await storage.getAuthorizedDevice(parseInt(id));
      if (!device) {
        return res.status(404).json({ message: "Terminal não encontrado" });
      }

      if (device.companyId !== companyId) {
        return res.status(403).json({ message: "Acesso negado" });
      }

      const updated = await storage.updateAuthorizedDevice(parseInt(id), req.body);
      res.json(updated);
    } catch (error) {
      console.error("Error updating terminal:", error);
      res.status(500).json({ message: "Failed to update terminal" });
    }
  });

  app.delete('/api/terminals/:id', isAuthenticatedHybrid, requireAdminRole, async (req: any, res) => {
    try {
      const { id } = req.params;
      const companyId = req.user.claims.companyId;
      
      const device = await storage.getAuthorizedDevice(parseInt(id));
      if (!device) {
        return res.status(404).json({ message: "Terminal não encontrado" });
      }

      if (device.companyId !== companyId) {
        return res.status(403).json({ message: "Acesso negado" });
      }

      await storage.deleteAuthorizedDevice(parseInt(id));
      res.json({ message: "Terminal removido com sucesso" });
    } catch (error) {
      console.error("Error deleting terminal:", error);
      res.status(500).json({ message: "Failed to delete terminal" });
    }
  });

  // Admin Time Entries Management Routes
  
  // Get time entries for a specific date (admin only)
  app.get('/api/admin/time-entries', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const currentUser = await storage.getUser(req.user.claims.sub);
      if (currentUser?.role !== 'admin' && currentUser?.role !== 'superadmin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      if (!currentUser?.companyId) {
        return res.status(400).json({ message: "User must be assigned to a company" });
      }

      const { startDate, endDate } = req.query;
      if (!startDate || !endDate) {
        return res.status(400).json({ message: "Start date and end date parameters are required" });
      }

      console.log("📅 Buscando registros de", startDate, "até", endDate, "| Empresa:", currentUser.companyId);

      // Get all time entries for the specified period within the admin's company
      const timeEntries = await storage.getTimeEntriesByDateRange(startDate as string, endDate as string, currentUser.companyId);
      
      console.log("📊 Registros encontrados:", timeEntries.length);
      
      // Enrich entries with user and department information
      const enrichedEntries = await Promise.all(
        timeEntries.map(async (entry) => {
          const user = await storage.getUser(entry.userId);
          const department = entry.departmentId ? await storage.getDepartment(entry.departmentId) : null;
          
          return {
            ...entry,
            user: user ? {
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
            } : null,
            department: department ? {
              name: department.name,
            } : null,
          };
        })
      );
      
      res.json(enrichedEntries);
    } catch (error) {
      console.error("Error fetching admin time entries:", error);
      res.status(500).json({ message: "Failed to fetch time entries" });
    }
  });

  // Upload attachment for time entry audit
  app.post('/api/admin/time-entry-attachment', isAuthenticatedHybrid, auditUpload.single('attachment'), async (req: any, res) => {
    try {
      const currentUser = await storage.getUser(req.user.claims.sub);
      if (currentUser?.role !== 'admin' && currentUser?.role !== 'superadmin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // Return the file path relative to uploads directory
      const fileUrl = `/uploads/audit-attachments/${req.file.filename}`;
      
      res.json({ 
        success: true, 
        url: fileUrl,
        filename: req.file.originalname
      });
    } catch (error) {
      console.error("Error uploading attachment:", error);
      res.status(500).json({ message: "Failed to upload attachment" });
    }
  });

  // Edit time entry (admin only)
  app.put('/api/admin/time-entries/:id', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const currentUser = await storage.getUser(req.user.claims.sub);
      if (currentUser?.role !== 'admin' && currentUser?.role !== 'superadmin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      if (!currentUser?.companyId) {
        return res.status(400).json({ message: "User must be assigned to a company" });
      }

      const entryId = parseInt(req.params.id);
      const { clockInTime, clockOutTime, justification, attachmentUrl } = req.body;

      if (!justification || justification.length < 5) {
        return res.status(400).json({ message: "Justification is required and must be at least 5 characters long" });
      }

      // Get the existing time entry
      const existingEntry = await storage.getTimeEntry(entryId);
      if (!existingEntry) {
        return res.status(404).json({ message: "Time entry not found" });
      }

      // Verify the entry belongs to the admin's company
      const entryUser = await storage.getUser(existingEntry.userId);
      if (!entryUser || entryUser.companyId !== currentUser.companyId) {
        return res.status(403).json({ message: "Access denied: time entry not accessible" });
      }

      // Check if the date is within a closed period
      const canModify = await storage.canModifyTimeEntries(currentUser.companyId, existingEntry.date);
      if (!canModify) {
        return res.status(403).json({ 
          message: "Período fechado - não é possível editar registros nesta data",
          code: "PERIOD_CLOSED"
        });
      }

      // Get client IP address
      const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';
      const clientIp = typeof ipAddress === 'string' ? ipAddress.split(',')[0].trim() : 'unknown';

      // Prepare update data - converter de hora local (Brasil) para UTC
      const updateData: any = {
        clockInTime: convertLocalToUTC(clockInTime),
        justification: `${existingEntry.justification || ''}\n[EDITADO ADMIN]: ${justification}`.trim(),
        lastModifiedBy: currentUser.id,
        lastModifiedAt: getBrazilianTime(),
      };

      if (clockOutTime && clockOutTime.trim() !== '') {
        updateData.clockOutTime = convertLocalToUTC(clockOutTime);
        updateData.status = 'completed';
        
        // Recalculate total hours
        const grossHours = calculateHours(updateData.clockInTime, updateData.clockOutTime);
        updateData.totalHours = grossHours.toString();
        
        // Calculate net worked hours and overtime
        const tempEntry = { ...existingEntry, ...updateData };
        const netWorkedHours = await computeNetWorkedHours(tempEntry, storage as any);
        const { regularHours, overtimeHours } = await calculateOvertimeHours(
          netWorkedHours, 
          existingEntry.departmentId, 
          storage as any
        );
        
        updateData.regularHours = regularHours.toString();
        updateData.overtimeHours = overtimeHours.toString();
      } else {
        // If no clock out time provided, clear existing clock out data
        updateData.clockOutTime = null;
        updateData.status = 'active';
        updateData.totalHours = null;
        updateData.regularHours = null;
        updateData.overtimeHours = null;
      }

      // Update the time entry
      const updatedEntry = await storage.updateTimeEntry(entryId, updateData);

      // Save detailed change history in timeEntryAudit table
      // Track clockInTime changes
      if (existingEntry.clockInTime && updateData.clockInTime) {
        const oldTime = existingEntry.clockInTime.toISOString();
        const newTime = updateData.clockInTime.toISOString();
        if (oldTime !== newTime) {
          await storage.createTimeEntryAudit({
            timeEntryId: entryId,
            fieldName: 'clockInTime',
            oldValue: oldTime,
            newValue: newTime,
            justification,
            attachmentUrl: attachmentUrl || null,
            editedBy: currentUser.id,
            ipAddress: clientIp,
          });
        }
      }

      // Track clockOutTime changes
      if (existingEntry.clockOutTime || updateData.clockOutTime) {
        const oldTime = existingEntry.clockOutTime ? existingEntry.clockOutTime.toISOString() : null;
        const newTime = updateData.clockOutTime ? updateData.clockOutTime.toISOString() : null;
        if (oldTime !== newTime) {
          await storage.createTimeEntryAudit({
            timeEntryId: entryId,
            fieldName: 'clockOutTime',
            oldValue: oldTime,
            newValue: newTime,
            justification,
            attachmentUrl: attachmentUrl || null,
            editedBy: currentUser.id,
            ipAddress: clientIp,
          });
        }
      }

      // Create detailed audit log
      await createAuditLog(
        currentUser.id,
        currentUser.companyId,
        'time_entry_admin_edit',
        'time_entry',
        entryId.toString(),
        {
          originalEntry: {
            clockInTime: existingEntry.clockInTime,
            clockOutTime: existingEntry.clockOutTime,
            totalHours: existingEntry.totalHours,
          },
          updatedEntry: {
            clockInTime: updateData.clockInTime,
            clockOutTime: updateData.clockOutTime,
            totalHours: updateData.totalHours,
          },
          justification,
          targetUserId: existingEntry.userId,
          targetUserEmail: entryUser.email,
          targetUserName: `${entryUser.firstName} ${entryUser.lastName}`,
          date: existingEntry.date,
        },
        existingEntry.userId
      );

      res.json(updatedEntry);
    } catch (error) {
      console.error("Error editing time entry:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to edit time entry" });
    }
  });

  // Get time entry audit history
  app.get('/api/admin/time-entries/:id/history', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const currentUser = await storage.getUser(req.user.claims.sub);
      if (currentUser?.role !== 'admin' && currentUser?.role !== 'superadmin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const entryId = parseInt(req.params.id);
      
      // Get the time entry to verify access
      const timeEntry = await storage.getTimeEntry(entryId);
      if (!timeEntry) {
        return res.status(404).json({ message: "Time entry not found" });
      }

      // Verify the entry belongs to the admin's company
      const entryUser = await storage.getUser(timeEntry.userId);
      if (!entryUser || entryUser.companyId !== currentUser.companyId) {
        return res.status(403).json({ message: "Access denied" });
      }

      // Get audit history
      const history = await storage.getTimeEntryAuditHistory(entryId);
      
      // Enrich with editor information
      const enrichedHistory = await Promise.all(
        history.map(async (entry) => {
          const editor = await storage.getUser(entry.editedBy);
          return {
            ...entry,
            editor: editor ? {
              firstName: editor.firstName,
              lastName: editor.lastName,
              email: editor.email,
            } : null,
          };
        })
      );

      res.json(enrichedHistory);
    } catch (error) {
      console.error("Error fetching audit history:", error);
      res.status(500).json({ message: "Failed to fetch audit history" });
    }
  });

  app.put('/api/admin/users/:id', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const currentUser = await storage.getUser(req.user.claims.sub);
      if (currentUser?.role !== 'admin' && currentUser?.role !== 'superadmin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const userId = req.params.id;
      const { role, departmentId, isActive } = req.body;
      
      const updateData: any = {};
      if (role !== undefined) updateData.role = role;
      if (departmentId !== undefined) updateData.departmentId = departmentId;
      if (isActive !== undefined) updateData.isActive = isActive;

      const updatedUser = await storage.updateUser(userId, updateData);
      
      // Get department info
      let department = null;
      if (updatedUser.departmentId) {
        department = await storage.getDepartment(updatedUser.departmentId);
      }
      
      res.json({ ...updatedUser, department });
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  // Delete user (admin only) - Uses soft delete for data integrity
  app.delete('/api/admin/users/:id', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const currentUser = await storage.getUser(req.user.claims.sub);
      if (currentUser?.role !== 'admin' && currentUser?.role !== 'superadmin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const userId = req.params.id;
      
      // Get user to be deleted
      const userToDelete = await storage.getUser(userId);
      if (!userToDelete) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // CRITICAL SECURITY: Role-based authorization
      if (currentUser.role === 'admin') {
        // Admins can only delete employees from their own company
        if (!currentUser?.companyId) {
          return res.status(400).json({ message: "Admin must be assigned to a company" });
        }
        if (userToDelete.companyId !== currentUser.companyId) {
          return res.status(403).json({ message: "Access denied: cannot delete user from different company" });
        }
        // Admins cannot delete other admins or superadmins
        if (userToDelete.role === 'admin' || userToDelete.role === 'superadmin') {
          return res.status(403).json({ message: "Access denied: cannot delete admin or superadmin users" });
        }
      }
      // Superadmins can delete any user (no additional restrictions)

      // Prevent deleting the current user (self-deletion)
      if (userId === currentUser.id) {
        return res.status(400).json({ message: "Cannot delete your own account" });
      }

      // Check if user is already inactive
      if (!userToDelete.isActive) {
        return res.status(400).json({ message: "User is already deactivated" });
      }

      // Use soft delete (set isActive = false) for data integrity
      await storage.updateUser(userId, { isActive: false });
      
      res.status(200).json({ message: "User deactivated successfully" });
    } catch (error) {
      console.error("Error deactivating user:", error);
      res.status(500).json({ message: "Failed to deactivate user" });
    }
  });

  // Reset user password and send new credentials via email (admin only)
  app.post('/api/admin/users/:id/reset-password', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const currentUser = await storage.getUser(req.user.claims.sub);
      if (currentUser?.role !== 'admin' && currentUser?.role !== 'superadmin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const userId = req.params.id;
      
      // Get user to reset password for
      const userToReset = await storage.getUser(userId);
      if (!userToReset) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // CRITICAL SECURITY: Role-based authorization
      if (currentUser.role === 'admin') {
        // Admins can only reset passwords for employees from their own company
        if (!currentUser?.companyId) {
          return res.status(400).json({ message: "Admin must be assigned to a company" });
        }
        if (userToReset.companyId !== currentUser.companyId) {
          return res.status(403).json({ message: "Access denied: cannot reset password for user from different company" });
        }
        // Admins cannot reset passwords for other admins or superadmins
        if (userToReset.role === 'admin' || userToReset.role === 'superadmin') {
          return res.status(403).json({ message: "Access denied: cannot reset password for admin or superadmin users" });
        }
      }
      // Superadmins can reset any user's password (no additional restrictions)

      // Prevent resetting your own password through this endpoint (use normal password change flow)
      if (userId === currentUser.id) {
        return res.status(400).json({ message: "Use the normal password change flow to update your own password" });
      }

      // Generate new temporary password and hash it
      const temporaryPassword = generateTemporaryPassword(10);
      const passwordHash = await hashPassword(temporaryPassword);
      
      // Update user with new password hash and force password change
      await storage.updateUser(userId, { 
        passwordHash,
        mustChangePassword: true
      });

      // Get user name for email
      const userName = userToReset.firstName && userToReset.lastName 
        ? `${userToReset.firstName} ${userToReset.lastName}`
        : userToReset.personalInfo?.fullName || 'Usuário';

      // Send email with new temporary password
      const emailSent = await sendTemporaryPasswordEmail(
        userToReset.email,
        userName,
        temporaryPassword
      );
      
      if (!emailSent) {
        console.error(`[SECURITY] Failed to send password reset email to ${userToReset.email}. Temporary password: ${temporaryPassword}`);
        // Return error - admin needs to check server logs for the password
        return res.status(500).json({ 
          message: "Senha resetada, mas falha ao enviar email. Verifique os logs do servidor para obter a senha temporária.",
          emailSent: false
        });
      }

      // Create audit log
      await createAuditLog(
        req.user.claims.sub,
        currentUser.companyId!,
        'UPDATE',
        'user',
        userId,
        { 
          action: 'password_reset',
          performedBy: `${currentUser.firstName} ${currentUser.lastName}`,
          targetUser: userToReset.email
        }
      );
      
      res.status(200).json({ 
        message: "Password reset successfully and email sent",
        emailSent: true
      });
    } catch (error) {
      console.error("Error resetting user password:", error);
      res.status(500).json({ message: "Failed to reset user password" });
    }
  });

  // Toggle user active status (block/unblock user)
  app.post('/api/admin/users/:id/toggle-active', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const currentUser = await storage.getUser(req.user.claims.sub);
      if (currentUser?.role !== 'admin' && currentUser?.role !== 'superadmin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const userId = req.params.id;
      
      // Get user to toggle status
      const userToToggle = await storage.getUser(userId);
      if (!userToToggle) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // CRITICAL SECURITY: Role-based authorization
      if (currentUser.role === 'admin') {
        // Admins can only toggle status for employees from their own company
        if (!currentUser?.companyId) {
          return res.status(400).json({ message: "Admin must be assigned to a company" });
        }
        if (userToToggle.companyId !== currentUser.companyId) {
          return res.status(403).json({ message: "Access denied: cannot toggle status for user from different company" });
        }
        // Admins cannot toggle status for other admins or superadmins
        if (userToToggle.role === 'admin' || userToToggle.role === 'superadmin') {
          return res.status(403).json({ message: "Access denied: cannot toggle status for admin or superadmin users" });
        }
      }
      // Superadmins can toggle any user's status (no additional restrictions)

      // Prevent toggling your own status
      if (userId === currentUser.id) {
        return res.status(400).json({ message: "Cannot toggle your own account status" });
      }

      // Toggle the isActive status
      const newStatus = !userToToggle.isActive;
      await storage.updateUser(userId, { isActive: newStatus });

      // Create audit log - use target user's companyId if currentUser has none (superadmin case)
      // If neither has a company, use null (schema allows nullable companyId)
      const auditCompanyId = currentUser.companyId || userToToggle.companyId || null;
      if (auditCompanyId !== null) {
        await createAuditLog(
          req.user.claims.sub,
          auditCompanyId,
          'UPDATE',
          'user',
          userId,
          { 
            action: newStatus ? 'user_activated' : 'user_deactivated',
            performedBy: `${currentUser.firstName} ${currentUser.lastName}`,
            targetUser: userToToggle.email,
            newStatus: newStatus ? 'active' : 'inactive'
          }
        );
      } else {
        // Skip audit log if no valid companyId is available
        console.log(`[AUDIT] Skipping audit log for user toggle (no company context): user ${userId}`);
      }
      
      res.status(200).json({ 
        message: newStatus ? "Usuário ativado com sucesso" : "Usuário bloqueado com sucesso",
        isActive: newStatus
      });
    } catch (error) {
      console.error("Error toggling user status:", error);
      res.status(500).json({ message: "Failed to toggle user status" });
    }
  });

  // Hard delete route - PERMANENT deletion (separate from soft delete)
  app.post('/api/admin/users/:id/hard-delete', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const currentUser = await storage.getUser(req.user.claims.sub);
      if (currentUser?.role !== 'admin' && currentUser?.role !== 'superadmin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const userId = req.params.id;
      const { confirmation } = req.body;
      
      // Require DELETE confirmation phrase
      if (confirmation !== 'DELETE') {
        return res.status(400).json({ message: "Confirmation phrase 'DELETE' is required" });
      }
      
      // Get user to be permanently deleted
      const userToDelete = await storage.getUser(userId);
      if (!userToDelete) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // CRITICAL SECURITY: Role-based authorization
      if (currentUser.role === 'admin') {
        // Admins can only delete employees from their own company
        if (!currentUser?.companyId) {
          return res.status(400).json({ message: "Admin must be assigned to a company" });
        }
        if (userToDelete.companyId !== currentUser.companyId) {
          return res.status(403).json({ message: "Access denied: cannot delete user from different company" });
        }
        // Admins cannot delete other admins or superadmins
        if (userToDelete.role === 'admin' || userToDelete.role === 'superadmin') {
          return res.status(403).json({ message: "Access denied: cannot delete admin or superadmin users" });
        }
      }
      // Superadmins can delete any user (no additional restrictions)

      // Prevent deleting the current user (self-deletion)
      if (userId === currentUser.id) {
        return res.status(400).json({ message: "Cannot delete your own account" });
      }

      // Require user to be inactive first (two-step process)
      if (userToDelete.isActive) {
        return res.status(400).json({ message: "User must be deactivated first before permanent deletion" });
      }

      // Check for dependencies that prevent deletion
      const { allowed, dependencies } = await storage.canHardDeleteUser(userId);
      if (!allowed) {
        const dependencyList = Object.entries(dependencies)
          .filter(([_, count]) => count > 0)
          .map(([type, count]) => `${type}: ${count}`)
          .join(', ');
        
        return res.status(409).json({ 
          message: "Cannot delete user with existing records", 
          dependencies,
          details: `User has related records: ${dependencyList}. Remove these records first or contact system administrator.`
        });
      }

      try {
        // Create audit log entry BEFORE deletion attempt (while user still exists)
        const auditEntry: InsertAuditLog = {
          action: 'user_hard_delete',
          performedBy: currentUser.id,
          targetUserId: userId,
          targetResource: `user:${userId}`,
          companyId: userToDelete.companyId,
          details: {
            userEmail: userToDelete.email,
            userName: `${userToDelete.firstName} ${userToDelete.lastName}`,
            performedByEmail: currentUser.email,
            performedByName: `${currentUser.firstName} ${currentUser.lastName}`,
            confirmationReceived: confirmation,
            dependencies
          },
          ipAddress: req.ip || req.connection.remoteAddress,
          userAgent: req.get('User-Agent'),
          success: true, // Assume success, will be corrected if fails
        };
        
        await storage.createAuditLog(auditEntry);
        
        // Perform permanent deletion
        await storage.deleteUserPermanently(userId);
        
        res.status(200).json({ message: "User permanently deleted" });
      } catch (deletionError) {
        // Create failure audit log while user still exists
        const failureAuditEntry: InsertAuditLog = {
          action: 'user_hard_delete_failed',
          performedBy: currentUser.id,
          targetUserId: userId,
          targetResource: `user:${userId}`,
          companyId: userToDelete.companyId,
          details: {
            userEmail: userToDelete.email,
            userName: `${userToDelete.firstName} ${userToDelete.lastName}`,
            performedByEmail: currentUser.email,
            performedByName: `${currentUser.firstName} ${currentUser.lastName}`,
            confirmationReceived: confirmation,
            dependencies,
            error: deletionError instanceof Error ? deletionError.message : 'Unknown deletion error'
          },
          ipAddress: req.ip || req.connection.remoteAddress,
          userAgent: req.get('User-Agent'),
          success: false,
          errorMessage: deletionError instanceof Error ? deletionError.message : 'Unknown deletion error'
        };
        
        await storage.createAuditLog(failureAuditEntry);
        console.error('Failed to delete user permanently:', deletionError);
        throw deletionError;
      }
    } catch (error) {
      console.error("Error permanently deleting user:", error);
      res.status(500).json({ message: "Failed to permanently delete user" });
    }
  });

  // Create new employee with complete HR data (admin only)
  app.post('/api/admin/users', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const currentUser = await storage.getUser(req.user.claims.sub);
      if (currentUser?.role !== 'admin' && currentUser?.role !== 'superadmin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      let targetCompanyId: number;

      if (currentUser?.role === 'superadmin') {
        // Superadmins can specify companyId in request body
        if (!req.body.companyId) {
          return res.status(400).json({ message: "Company ID is required for creating users as superadmin" });
        }
        targetCompanyId = req.body.companyId;
        
        // Validate that the company exists
        const company = await storage.getCompany(targetCompanyId);
        if (!company) {
          return res.status(400).json({ message: "Invalid company ID" });
        }
      } else {
        // Regular admins can only create users in their own company
        if (!currentUser?.companyId) {
          return res.status(400).json({ message: "Admin must be assigned to a company" });
        }
        targetCompanyId = currentUser.companyId;
      }

      // Transform and validate request body using complete employee schema
      const requestData = { ...req.body };
      
      // Transform departmentId: empty string or "none" -> null, otherwise parse to int
      if (requestData.departmentId === "" || requestData.departmentId === "none") {
        requestData.departmentId = null;
      } else if (requestData.departmentId) {
        requestData.departmentId = parseInt(requestData.departmentId);
      }

      // Transform salary to string for decimal field
      if (requestData.salary !== undefined) {
        requestData.salary = typeof requestData.salary === 'number' ? requestData.salary.toFixed(2) : requestData.salary;
      }

      // Set companyId from validated target
      requestData.companyId = targetCompanyId;

      const validationResult = insertCompleteEmployeeSchema.safeParse(requestData);
      if (!validationResult.success) {
        console.error("Employee validation error:", validationResult.error.errors);
        return res.status(400).json({ 
          message: "Invalid employee data", 
          errors: validationResult.error.errors 
        });
      }

      const employeeData = validationResult.data;
      
      // Validate department belongs to current user's company (superadmins can create in any department)
      if (employeeData.departmentId) {
        const department = await storage.getDepartment(employeeData.departmentId);
        if (!department) {
          return res.status(400).json({ message: "Invalid department: department not found" });
        }
        
        // Only enforce company validation for non-superadmins
        if (currentUser.role !== 'superadmin' && department.companyId !== currentUser.companyId) {
          return res.status(400).json({ message: "Invalid department or department not in your company" });
        }
      }
      
      // Check if user with this email already exists
      const existingUsers = await storage.getAllUsers();
      const existingUser = existingUsers.find(u => u.email === employeeData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User with this email already exists" });
      }
      
      // Generate a unique ID for the new user
      const userId = `emp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Generate temporary password and hash it
      const temporaryPassword = generateTemporaryPassword(10);
      const passwordHash = await hashPassword(temporaryPassword);
      
      // Create new user with complete employee data, password, and force password change
      const userData = {
        id: userId,
        ...employeeData,
        passwordHash,
        role: employeeData.role || 'employee', // Default to employee if not specified
        mustChangePassword: true, // Force password change on first login
        isActive: true,
      };
      
      const newUser = await storage.upsertUser(userData);
      
      // Send welcome email with temporary password
      const emailSent = await sendTemporaryPasswordEmail(
        newUser.email,
        `${newUser.firstName} ${newUser.lastName}`,
        temporaryPassword
      );
      
      if (!emailSent) {
        console.error(`[SECURITY] Failed to send welcome email to ${newUser.email}. Temporary password: ${temporaryPassword}`);
        // Return error to admin - they need to manually provide credentials
        return res.status(201).json({ 
          ...newUser,
          department: null,
          emailFailed: true,
          message: "Usuário criado, mas falha ao enviar email. Entre em contato com o administrador do sistema."
        });
      }
      
      // Get department info if assigned
      let department = null;
      if (newUser.departmentId) {
        department = await storage.getDepartment(newUser.departmentId);
      }
      
      res.status(201).json({ 
        ...newUser, 
        department,
        emailSent: true
      });
    } catch (error) {
      console.error("Error creating employee:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid employee data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create employee" });
    }
  });

  // Update employee with complete HR data (admin only)
  app.put('/api/admin/users/:id', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const currentUser = await storage.getUser(req.user.claims.sub);
      if (currentUser?.role !== 'admin' && currentUser?.role !== 'superadmin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      if (!currentUser?.companyId) {
        return res.status(400).json({ message: "Admin must be assigned to a company" });
      }

      const userId = req.params.id;
      
      // Check if the user exists and belongs to current admin's company
      const existingUser = await storage.getUser(userId);
      if (!existingUser) {
        return res.status(404).json({ message: "User not found" });
      }
      if (existingUser.companyId !== currentUser.companyId) {
        return res.status(403).json({ message: "Cannot edit user from different company" });
      }

      // Transform and validate request body using complete employee schema
      const requestData = { ...req.body };
      
      // Transform departmentId: empty string or "none" -> null, otherwise parse to int
      if (requestData.departmentId === "" || requestData.departmentId === "none") {
        requestData.departmentId = null;
      } else if (requestData.departmentId) {
        requestData.departmentId = parseInt(requestData.departmentId);
      }

      // Transform salary to string for decimal field
      if (requestData.salary !== undefined) {
        requestData.salary = typeof requestData.salary === 'number' ? requestData.salary.toFixed(2) : requestData.salary;
      }

      // Set companyId from current user (cannot change company)
      requestData.companyId = currentUser.companyId;

      // Make some fields optional for updates (like email, required only for creation)
      const updateEmployeeSchema = baseCompleteEmployeeSchema.partial().extend({
        email: z.string().email("Invalid email format").optional(),
        firstName: z.string().min(1, "First name is required").optional(),
        lastName: z.string().min(1, "Last name is required").optional(),
      });

      const validationResult = updateEmployeeSchema.safeParse(requestData);
      if (!validationResult.success) {
        console.error("Employee update validation error:", validationResult.error.errors);
        return res.status(400).json({ 
          message: "Invalid employee data", 
          errors: validationResult.error.errors 
        });
      }

      const updateData = validationResult.data;

      // Validate department belongs to current user's company (superadmins can update to any department)
      if (updateData.departmentId) {
        const department = await storage.getDepartment(updateData.departmentId);
        if (!department) {
          return res.status(400).json({ message: "Invalid department: department not found" });
        }
        
        // Only enforce company validation for non-superadmins
        if (currentUser.role !== 'superadmin' && department.companyId !== currentUser.companyId) {
          return res.status(400).json({ message: "Invalid department or department not in your company" });
        }
      }
      
      // Check if email is being changed and already exists for another user
      if (updateData.email && updateData.email !== existingUser.email) {
        const existingUsers = await storage.getAllUsers();
        const emailExists = existingUsers.find(u => u.email === updateData.email && u.id !== userId);
        if (emailExists) {
          return res.status(400).json({ message: "User with this email already exists" });
        }
      }
      
      // Update user with new data
      const updatedUser = await storage.updateUser(userId, updateData);
      
      // Get department info if assigned
      let department = null;
      if (updatedUser.departmentId) {
        department = await storage.getDepartment(updatedUser.departmentId);
      }
      
      res.json({ ...updatedUser, department });
    } catch (error) {
      console.error("Error updating employee:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid employee data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update employee" });
    }
  });

  // Dashboard stats
  app.get('/api/dashboard/stats', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const now = new Date();
      const today = now.toISOString().split('T')[0];
      
      // Get today's entry
      const todayEntries = await storage.getTimeEntriesByUser(userId, today, today);
      const todayEntry = todayEntries[0];
      
      // Calculate today's hours
      let todayHours = 0;
      if (todayEntry) {
        if (todayEntry.clockOutTime) {
          todayHours = parseFloat(todayEntry.totalHours || '0');
        } else if (todayEntry.clockInTime) {
          // Calculate current working hours
          todayHours = calculateHours(new Date(todayEntry.clockInTime), now);
        }
      }
      
      // Get current month stats
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();
      const monthlyStats = await storage.getUserMonthlyStats(userId, currentYear, currentMonth);
      
      // Get week start (Monday)
      const startOfWeek = new Date(now);
      const day = startOfWeek.getDay();
      const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
      startOfWeek.setDate(diff);
      
      const weekStart = startOfWeek.toISOString().split('T')[0];
      const weekEnd = now.toISOString().split('T')[0];
      
      const weekEntries = await storage.getTimeEntriesByUser(userId, weekStart, weekEnd);
      const weekHours = weekEntries
        .filter(entry => entry.status === 'completed')
        .reduce((sum, entry) => sum + parseFloat(entry.totalHours || '0'), 0);
      
      res.json({
        todayHours,
        weekHours,
        monthHours: monthlyStats.totalHours,
        monthlyStats,
        activeEntry: todayEntry && todayEntry.status === 'active' ? todayEntry : null,
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Dashboard summary - real data for dashboard overview
  app.get('/api/dashboard/summary', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // For superadmin without companyId, return empty stats
      if (!user.companyId && user.role !== 'superadmin') {
        return res.status(400).json({ message: "User not assigned to company" });
      }
      
      if (!user.companyId && user.role === 'superadmin') {
        return res.json({
          unreadMessages: 0,
          pendingDocuments: 0,
          activeCourses: 0,
          completedCourses: 0,
        });
      }

      // Get unread messages count
      const receivedMessages = await storage.getReceivedMessages(userId, user.companyId);
      const unreadMessages = receivedMessages.filter(msg => !msg.isRead).length;
      
      // Get pending documents count (documents assigned to user or all if admin)
      let pendingDocuments = 0;
      if (user.role === 'admin' || user.role === 'superadmin') {
        const allDocuments = await storage.getDocuments(user.companyId);
        pendingDocuments = allDocuments.length; // All documents for admin
      } else {
        const assignedDocs = await storage.getDocumentsAssignedToUser(userId);
        pendingDocuments = assignedDocs.length;
      }
      
      // Get course statistics
      const employeeCourses = await storage.getEmployeeCourses(userId, user.companyId);
      const activeCourses = employeeCourses.filter(ec => ec.status === 'in_progress').length;
      const completedCourses = employeeCourses.filter(ec => ec.status === 'completed').length;
      
      res.json({
        unreadMessages,
        pendingDocuments,
        activeCourses,
        completedCourses,
      });
    } catch (error) {
      console.error("Error fetching dashboard summary:", error);
      res.status(500).json({ message: "Failed to fetch dashboard summary" });
    }
  });

  // Dashboard recent messages
  app.get('/api/dashboard/messages/recent', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // For superadmin without companyId, return empty messages
      if (!user.companyId && user.role !== 'superadmin') {
        return res.status(400).json({ message: "User not assigned to company" });
      }
      
      if (!user.companyId && user.role === 'superadmin') {
        return res.json([]);
      }

      // Get recent messages (limit to last 5, sorted by date)
      const recentMessages = await storage.getReceivedMessages(userId, user.companyId);
      const sortedMessages = recentMessages.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      const limitedMessages = sortedMessages.slice(0, 5).map(msg => ({
        id: msg.id,
        subject: msg.subject,
        senderName: msg.senderName,
        createdAt: msg.createdAt,
        isRead: msg.isRead,
        priority: msg.priority || 'normal'
      }));
      
      res.json(limitedMessages);
    } catch (error) {
      console.error("Error fetching recent messages:", error);
      res.status(500).json({ message: "Failed to fetch recent messages" });
    }
  });

  // Dashboard pending tasks
  app.get('/api/dashboard/tasks/pending', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // For superadmin without companyId, return empty tasks
      if (!user.companyId && user.role !== 'superadmin') {
        return res.status(400).json({ message: "User not assigned to company" });
      }
      
      if (!user.companyId && user.role === 'superadmin') {
        return res.json([]);
      }

      const pendingTasks = [];
      
      // Add unread messages as tasks
      const receivedMessages = await storage.getReceivedMessages(userId, user.companyId);
      const unreadMessages = receivedMessages.filter(msg => !msg.isRead).slice(0, 2);
      unreadMessages.forEach(msg => {
        pendingTasks.push({
          id: `message-${msg.id}`,
          title: `Responder: ${msg.subject}`,
          type: 'message' as const,
          dueDate: msg.createdAt
        });
      });
      
      // Add assigned documents as tasks  
      let assignedDocs = [];
      if (user.role === 'admin' || user.role === 'superadmin') {
        const allDocs = await storage.getDocuments(user.companyId);
        assignedDocs = allDocs.slice(0, 2);
      } else {
        assignedDocs = await storage.getDocumentsAssignedToUser(userId);
        assignedDocs = assignedDocs.slice(0, 2);
      }
      
      assignedDocs.forEach(doc => {
        pendingTasks.push({
          id: `document-${doc.id}`,
          title: `Revisar documento: ${doc.title}`,
          type: 'document' as const,
          dueDate: doc.expirationDate || doc.createdAt
        });
      });
      
      // Add in-progress courses as tasks
      const employeeCourses = await storage.getEmployeeCourses(userId, user.companyId);
      const inProgressCourses = employeeCourses
        .filter(ec => ec.status === 'in_progress')
        .slice(0, 2);
      
      inProgressCourses.forEach(course => {
        pendingTasks.push({
          id: `course-${course.id}`,
          title: `Continuar curso: ${course.courseTitle}`,
          type: 'course' as const,
          dueDate: course.validUntil
        });
      });
      
      // Sort by date and limit to 5 tasks
      const sortedTasks = pendingTasks
        .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
        .slice(0, 5);
      
      res.json(sortedTasks);
    } catch (error) {
      console.error("Error fetching pending tasks:", error);
      res.status(500).json({ message: "Failed to fetch pending tasks" });
    }
  });

  // ===== MESSAGE ROUTES =====
  
  // Get messages for current user based on type (inbox, sent, archived)
  app.get('/api/messages/:type', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const type = req.params.type;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      let messages;
      switch (type) {
        case 'inbox':
          messages = await storage.getReceivedMessages(userId, user.companyId);
          break;
        case 'sent':
          messages = await storage.getSentMessages(userId, user.companyId);
          break;
        case 'archived':
          messages = await storage.getArchivedMessages(userId, user.companyId);
          break;
        default:
          messages = await storage.getReceivedMessages(userId, user.companyId);
      }

      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  // Get messages for current user (default to inbox)
  app.get('/api/messages', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const messages = await storage.getReceivedMessages(userId, user.companyId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  // Send new message
  app.post('/api/messages', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (user.role !== 'admin' && user.role !== 'superadmin') {
        return res.status(403).json({ message: "Only administrators can send messages" });
      }

      const messageData: InsertMessage = insertMessageSchema.parse(req.body);
      messageData.senderId = userId;
      messageData.companyId = user.companyId;

      const message = await storage.createMessage(messageData);
      
      // Determine recipients based on targetType
      let recipients: any[] = [];
      const targetType = messageData.targetType || (messageData.recipientId === 'all' || messageData.isMassMessage ? 'all' : 'individual');
      
      if (targetType === 'all' || messageData.recipientId === 'all' || messageData.isMassMessage) {
        // Send to all employees in the company
        recipients = await storage.getCompanyEmployees(user.companyId);
      } else if (targetType === 'department' && messageData.targetId) {
        // Send to all employees in a specific department
        const allEmployees = await storage.getCompanyEmployees(user.companyId);
        recipients = allEmployees.filter(emp => emp.departmentId === messageData.targetId);
      } else if (targetType === 'sector' && messageData.targetId) {
        // Send to all employees in departments of a specific sector
        const allEmployees = await storage.getCompanyEmployees(user.companyId);
        const departments = await storage.getDepartments();
        const sectorDepts = departments.filter(dept => dept.sectorId === messageData.targetId);
        const sectorDeptIds = sectorDepts.map(d => d.id);
        recipients = allEmployees.filter(emp => sectorDeptIds.includes(emp.departmentId!));
      } else if (targetType === 'position' && messageData.targetValue) {
        // Send to all employees with a specific position/cargo
        const allEmployees = await storage.getCompanyEmployees(user.companyId);
        recipients = allEmployees.filter(emp => 
          emp.position?.toLowerCase() === messageData.targetValue?.toLowerCase()
        );
      } else if (targetType === 'individual' && messageData.recipientId) {
        // Send to specific recipient
        const recipient = await storage.getUser(messageData.recipientId);
        if (recipient) recipients = [recipient];
      }
      
      // Create message recipients
      for (const employee of recipients) {
        if (employee.id !== userId) { // Don't send to sender
          await storage.createMessageRecipient({
            messageId: message.id,
            userId: employee.id,
            isDelivered: true,
            deliveredAt: new Date()
          });
        }
      }

      res.status(201).json({ ...message, recipientsCount: recipients.length - (recipients.some(r => r.id === userId) ? 1 : 0) });
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  // Mark message as read
  app.patch('/api/messages/:id/read', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const messageId = parseInt(req.params.id);
      
      await storage.markMessageAsRead(messageId, userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking message as read:", error);
      res.status(500).json({ message: "Failed to mark message as read" });
    }
  });

  // Update message
  app.put('/api/messages/:id', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      const messageId = parseInt(req.params.id);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (user.role !== 'admin' && user.role !== 'superadmin') {
        return res.status(403).json({ message: "Only administrators can update messages" });
      }

      const messageData = req.body;
      // TODO: Add update message method to storage
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating message:", error);
      res.status(500).json({ message: "Failed to update message" });
    }
  });

  // Delete message
  app.delete('/api/messages/:id', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      const messageId = parseInt(req.params.id);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (user.role !== 'admin' && user.role !== 'superadmin') {
        return res.status(403).json({ message: "Only administrators can delete messages" });
      }

      await storage.deleteMessage(messageId, userId);
      res.json({ success: true, message: "Message deleted successfully" });
    } catch (error) {
      console.error("Error deleting message:", error);
      res.status(500).json({ message: "Failed to delete message" });
    }
  });

  // Archive message
  app.patch('/api/messages/:id/archive', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const messageId = parseInt(req.params.id);
      
      await storage.archiveMessage(messageId, userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error archiving message:", error);
      res.status(500).json({ message: "Failed to archive message" });
    }
  });

  // Get message categories
  app.get('/api/message-categories', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const categories = await storage.getMessageCategories(user.companyId);
      res.json(categories);
    } catch (error) {
      console.error("Error fetching message categories:", error);
      res.status(500).json({ message: "Failed to fetch message categories" });
    }
  });

  // Create message category
  app.post('/api/message-categories', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (user.role !== 'admin' && user.role !== 'superadmin') {
        return res.status(403).json({ message: "Only administrators can create message categories" });
      }

      const categoryData: InsertMessageCategory = insertMessageCategorySchema.parse(req.body);
      categoryData.companyId = user.companyId;

      const category = await storage.createMessageCategory(categoryData);
      res.status(201).json(category);
    } catch (error) {
      console.error("Error creating message category:", error);
      res.status(500).json({ message: "Failed to create message category" });
    }
  });

  // Get users (for recipient selection - hierarchical filtering)
  app.get('/api/users', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const scope = await getUserScope(req.user.claims.sub);
      
      if (!scope.user) {
        return res.status(404).json({ message: "User not found" });
      }

      let users;
      if (scope.type === 'superadmin') {
        // Superadmin sees all users
        users = await storage.getAllUsers();
      } else if (scope.type === 'admin') {
        // Admin sees all users in their company
        users = await storage.getCompanyEmployees(scope.companyId!);
      } else if (scope.type === 'supervisor') {
        // Supervisor sees: employees from their assigned sectors + admins/superadmins
        const employeesInSectors = await storage.getUsersByScope(scope.companyId, scope.departmentIds!);
        const companyAdmins = await storage.getCompanyEmployees(scope.companyId!);
        const admins = companyAdmins.filter(u => u.role === 'admin' || u.role === 'superadmin');
        
        // Combine and remove duplicates
        const userMap = new Map();
        [...employeesInSectors, ...admins].forEach(u => userMap.set(u.id, u));
        users = Array.from(userMap.values());
      } else {
        // Employee sees: their supervisor + admins/superadmins from their company
        const allCompanyUsers = await storage.getCompanyEmployees(scope.companyId!);
        
        // Filter to only show supervisors and admins
        users = allCompanyUsers.filter(u => 
          u.role === 'supervisor' || u.role === 'admin' || u.role === 'superadmin'
        );
      }

      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      if (error instanceof Error && error.message.includes("assigned sectors")) {
        return res.status(400).json({ message: "Supervisor has no assigned sectors" });
      }
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Get unique positions/cargos (for message targeting)
  app.get('/api/positions', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const scope = await getUserScope(req.user.claims.sub);
      
      if (!scope.user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (scope.type !== 'admin' && scope.type !== 'superadmin') {
        return res.status(403).json({ message: "Only administrators can access this resource" });
      }

      // Get all employees from company and extract unique positions
      const employees = await storage.getCompanyEmployees(scope.companyId!);
      const positionsSet = new Set<string>();
      
      employees.forEach(emp => {
        if (emp.position && emp.position.trim()) {
          positionsSet.add(emp.position.trim());
        }
      });

      const positions = Array.from(positionsSet).sort();
      res.json(positions);
    } catch (error) {
      console.error("Error fetching positions:", error);
      res.status(500).json({ message: "Failed to fetch positions" });
    }
  });

  // DOCUMENTS API ROUTES
  
  // Get documents
  app.get('/api/documents', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const documents = await storage.getDocuments(user.companyId, userId);
      res.json(documents);
    } catch (error) {
      console.error("Error fetching documents:", error);
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });

  // Get document by ID
  app.get('/api/documents/:id', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const documentId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const document = await storage.getDocument(documentId);
      
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }

      // Security check: User can only access documents from their company
      if (document.companyId !== user.companyId) {
        return res.status(403).json({ message: "Access denied" });
      }

      // Additional check: If document is assigned to specific user, verify access
      if (document.assignedTo && document.assignedTo !== userId && user.role !== 'admin' && user.role !== 'superadmin') {
        return res.status(403).json({ message: "Document not assigned to you" });
      }

      res.json(document);
    } catch (error) {
      console.error("Error fetching document:", error);
      res.status(500).json({ message: "Failed to fetch document" });
    }
  });

  // Upload document
  app.post('/api/documents/upload', isAuthenticatedHybrid, upload.single('file'), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // Use file info from multer
      let title = req.body.title || req.file.originalname;
      const mimeType = req.file.mimetype;
      const description = req.body.description || `Arquivo enviado: ${req.file.originalname}`;
      
      // Get assignedTo from FormData (convert empty/none to null)
      const assignedTo = req.body.assignedTo && req.body.assignedTo !== 'none' 
        ? req.body.assignedTo 
        : null;

      // Check for duplicate titles and add suffix if needed
      const existingDocs = await storage.getDocuments(user.companyId);
      const sameTitleDocs = existingDocs.filter(doc => 
        doc.title.toLowerCase() === title.toLowerCase() && doc.isActive
      );
      
      if (sameTitleDocs.length > 0) {
        // Extract file extension
        const lastDot = title.lastIndexOf('.');
        const baseName = lastDot > 0 ? title.substring(0, lastDot) : title;
        const extension = lastDot > 0 ? title.substring(lastDot) : '';
        
        // Add counter suffix
        let counter = 1;
        let newTitle = `${baseName} (${counter})${extension}`;
        while (existingDocs.some(doc => doc.title.toLowerCase() === newTitle.toLowerCase() && doc.isActive)) {
          counter++;
          newTitle = `${baseName} (${counter})${extension}`;
        }
        title = newTitle;
      }

      // Validate with schema (excluding generated fields)
      const documentData: InsertDocument = insertDocumentSchema.parse({
        title,
        description,
        fileName: req.file.filename,
        originalName: req.file.originalname,
        fileSize: req.file.size,
        mimeType,
        filePath: req.file.path,
        companyId: user.companyId,
        uploadedBy: userId,
        assignedTo,
      });

      const document = await storage.createDocument(documentData);
      res.status(201).json(document);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      console.error("Error uploading document:", error);
      res.status(500).json({ message: "Failed to upload document" });
    }
  });

  // Create document
  app.post('/api/documents', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const documentData: InsertDocument = insertDocumentSchema.parse({
        ...req.body,
        companyId: user.companyId,
        uploadedBy: userId
      });

      const document = await storage.createDocument(documentData);
      res.status(201).json(document);
    } catch (error) {
      console.error("Error creating document:", error);
      res.status(500).json({ message: "Failed to create document" });
    }
  });

  // Update document
  app.put('/api/documents/:id', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const documentId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Check if user has permission to update document
      const document = await storage.getDocument(documentId);
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }

      // Security checks: Same company and ownership/admin
      if (document.companyId !== user.companyId) {
        return res.status(403).json({ message: "Access denied" });
      }

      if (document.uploadedBy !== userId && user.role !== 'admin' && user.role !== 'superadmin') {
        return res.status(403).json({ message: "Permission denied" });
      }

      // Validate update payload with Zod schema
      const updateData = updateDocumentSchema.parse(req.body);

      const updatedDocument = await storage.updateDocument(documentId, updateData);
      res.json(updatedDocument);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error updating document:", error);
      res.status(500).json({ message: "Failed to update document" });
    }
  });

  // Delete document
  app.delete('/api/documents/:id', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const documentId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Check if user has permission to delete document
      const document = await storage.getDocument(documentId);
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }

      if (document.uploadedBy !== userId && user.role !== 'admin' && user.role !== 'superadmin') {
        return res.status(403).json({ message: "Permission denied" });
      }

      await storage.deleteDocument(documentId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting document:", error);
      res.status(500).json({ message: "Failed to delete document" });
    }
  });

  // COURSES API ROUTES
  
  // Get courses
  app.get('/api/courses', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const courses = await storage.getCourses(user.companyId);
      res.json(courses);
    } catch (error) {
      console.error("Error fetching courses:", error);
      res.status(500).json({ message: "Failed to fetch courses" });
    }
  });

  // Get course by ID
  app.get('/api/courses/:id', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const courseId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const course = await storage.getCourse(courseId);
      
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      // Security check: User can only access courses from their company
      if (course.companyId !== user.companyId) {
        return res.status(403).json({ message: "Access denied" });
      }

      res.json(course);
    } catch (error) {
      console.error("Error fetching course:", error);
      res.status(500).json({ message: "Failed to fetch course" });
    }
  });

  // Create course (admin only)
  app.post('/api/courses', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (user.role !== 'admin' && user.role !== 'superadmin') {
        return res.status(403).json({ message: "Only administrators can create courses" });
      }

      const courseData: InsertCourse = insertCourseSchema.parse({
        ...req.body,
        companyId: user.companyId
      });

      const course = await storage.createCourse(courseData);
      res.status(201).json(course);
    } catch (error) {
      console.error("Error creating course:", error);
      res.status(500).json({ message: "Failed to create course" });
    }
  });

  // EMPLOYEE COURSES API ROUTES
  
  // Get employee courses (progress)
  app.get('/api/employee-courses', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const employeeCourses = await storage.getEmployeeCourses(userId, user.companyId);
      res.json(employeeCourses);
    } catch (error) {
      console.error("Error fetching employee courses:", error);
      res.status(500).json({ message: "Failed to fetch employee courses" });
    }
  });

  // Start a course
  app.post('/api/employee-courses/start', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const { courseId } = req.body;
      
      if (!courseId) {
        return res.status(400).json({ message: "Course ID is required" });
      }

      const employeeCourse = await storage.startCourse(userId, courseId, user.companyId);
      res.status(201).json(employeeCourse);
    } catch (error) {
      console.error("Error starting course:", error);
      res.status(500).json({ message: "Failed to start course" });
    }
  });

  // Update course progress
  app.put('/api/employee-courses/progress', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { courseId, progress } = req.body;
      
      if (!courseId || progress === undefined) {
        return res.status(400).json({ message: "Course ID and progress are required" });
      }

      const employeeCourse = await storage.updateCourseProgress(userId, courseId, progress);
      res.json(employeeCourse);
    } catch (error) {
      console.error("Error updating course progress:", error);
      res.status(500).json({ message: "Failed to update course progress" });
    }
  });

  // Complete a course
  app.post('/api/employee-courses/complete', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { courseId, score } = req.body;
      
      if (!courseId) {
        return res.status(400).json({ message: "Course ID is required" });
      }

      const employeeCourse = await storage.completeCourse(userId, courseId, score);
      res.json(employeeCourse);
    } catch (error) {
      console.error("Error completing course:", error);
      res.status(500).json({ message: "Failed to complete course" });
    }
  });

  // Get employee course by course ID
  app.get('/api/employee-courses/course/:courseId', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const courseId = parseInt(req.params.courseId);
      
      const employeeCourse = await storage.getEmployeeCourse(userId, courseId);
      
      if (!employeeCourse) {
        return res.status(404).json({ message: "Employee course not found" });
      }

      res.json(employeeCourse);
    } catch (error) {
      console.error("Error fetching employee course:", error);
      res.status(500).json({ message: "Failed to fetch employee course" });
    }
  });

  // Complete employee course by ID
  app.put('/api/employee-courses/:id/complete', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const employeeCourseId = parseInt(req.params.id);
      const { score } = req.body;

      const employeeCourse = await storage.updateEmployeeCourse(employeeCourseId, {
        status: 'completed',
        progress: 100,
        score,
        completedAt: new Date()
      });
      res.json(employeeCourse);
    } catch (error) {
      console.error("Error completing employee course:", error);
      res.status(500).json({ message: "Failed to complete employee course" });
    }
  });

  // Restart/Retry a completed course
  app.post('/api/employee-courses/:id/restart', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const employeeCourseId = parseInt(req.params.id);
      const userId = req.user.claims.sub;

      // Reset course progress
      const employeeCourse = await storage.updateEmployeeCourse(employeeCourseId, {
        status: 'not_started',
        progress: 0,
        score: null,
        startedAt: null,
        completedAt: null
      });
      
      res.json(employeeCourse);
    } catch (error) {
      console.error("Error restarting employee course:", error);
      res.status(500).json({ message: "Failed to restart employee course" });
    }
  });

  // Get course questions
  app.get('/api/courses/:id/questions', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const courseId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const course = await storage.getCourse(courseId);
      
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      if (course.companyId !== user.companyId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const questions = await storage.getCourseQuestions(courseId);
      res.json(questions);
    } catch (error) {
      console.error("Error fetching course questions:", error);
      res.status(500).json({ message: "Failed to fetch course questions" });
    }
  });

  // Create course question (admin only)
  app.post('/api/courses/:id/questions', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const courseId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (user.role !== 'admin' && user.role !== 'superadmin') {
        return res.status(403).json({ message: "Only administrators can create questions" });
      }

      const course = await storage.getCourse(courseId);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      if (course.companyId !== user.companyId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const questionData: InsertCourseQuestion = insertCourseQuestionSchema.parse({
        ...req.body,
        courseId
      });

      const question = await storage.createCourseQuestion(questionData);
      res.status(201).json(question);
    } catch (error) {
      console.error("Error creating question:", error);
      res.status(500).json({ message: "Failed to create question" });
    }
  });

  // Delete course question (admin only)
  app.delete('/api/courses/:courseId/questions/:questionId', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const courseId = parseInt(req.params.courseId);
      const questionId = parseInt(req.params.questionId);
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (user.role !== 'admin' && user.role !== 'superadmin') {
        return res.status(403).json({ message: "Only administrators can delete questions" });
      }

      const course = await storage.getCourse(courseId);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      if (course.companyId !== user.companyId) {
        return res.status(403).json({ message: "Access denied" });
      }

      await storage.deleteCourseQuestion(questionId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting question:", error);
      res.status(500).json({ message: "Failed to delete question" });
    }
  });

  // Submit quiz
  app.post('/api/courses/:id/submit-quiz', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const courseId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      const { employeeCourseId, answers } = req.body;

      if (!employeeCourseId || !answers || !Array.isArray(answers)) {
        return res.status(400).json({ message: "Employee course ID and answers are required" });
      }

      // Security: Verify employee course belongs to authenticated user
      const employeeCourse = await storage.getEmployeeCourseById(employeeCourseId);
      if (!employeeCourse) {
        return res.status(404).json({ message: "Employee course not found" });
      }
      
      if (employeeCourse.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      if (employeeCourse.courseId !== courseId) {
        return res.status(400).json({ message: "Course ID mismatch" });
      }

      const course = await storage.getCourse(courseId);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      const questions = await storage.getCourseQuestions(courseId);
      
      let correctAnswers = 0;
      const totalQuestions = questions.length;

      // Server-side validation: Calculate correctness by comparing with authoritative answers
      for (const answer of answers) {
        const question = questions.find(q => q.id === answer.questionId);
        if (!question) {
          return res.status(400).json({ message: `Invalid question ID: ${answer.questionId}` });
        }

        // Server determines correctness, not client
        const isCorrect = answer.answer === question.correctAnswer;

        await storage.createCourseAnswer({
          employeeCourseId,
          questionId: answer.questionId,
          answer: answer.answer,
          isCorrect
        });

        if (isCorrect) {
          correctAnswers++;
        }
      }

      const score = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
      const passed = score >= (course.passingScore || 70);

      // Update employee course status
      if (passed) {
        await storage.updateEmployeeCourse(employeeCourseId, {
          status: 'completed',
          progress: 100,
          score,
          completedAt: new Date()
        });

        // Generate certificate automatically when user passes
        const user = await storage.getUser(userId);
        if (user) {
          const certificateNumber = `CERT-${Date.now()}-${userId.slice(0, 8)}`;
          await storage.createCertificate({
            userId,
            courseId,
            companyId: user.companyId,
            certificateNumber,
            title: course.title,
            issuedDate: new Date().toISOString().split('T')[0],
            expiryDate: course.validityPeriod 
              ? new Date(Date.now() + course.validityPeriod * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
              : null,
            metadata: {
              score,
              correctAnswers,
              totalQuestions,
              passingScore: course.passingScore || 70,
              completedAt: new Date().toISOString()
            }
          });
        }
      } else {
        await storage.updateEmployeeCourse(employeeCourseId, {
          status: 'failed',
          score,
          completedAt: new Date()
        });
      }

      res.json({ 
        score, 
        passed,
        correctAnswers,
        totalQuestions
      });
    } catch (error) {
      console.error("Error submitting quiz:", error);
      res.status(500).json({ message: "Failed to submit quiz" });
    }
  });

  // CERTIFICATES API ROUTES
  
  // Get user certificates
  app.get('/api/certificates', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const certificates = await storage.getCertificates(userId, user.companyId);
      res.json(certificates);
    } catch (error) {
      console.error("Error fetching certificates:", error);
      res.status(500).json({ message: "Failed to fetch certificates" });
    }
  });

  // Get specific certificate
  app.get('/api/certificates/:id', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const certificateId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Get all user certificates to check ownership
      const certificates = await storage.getCertificates(userId, user.companyId);
      const certificate = certificates.find(c => c.id === certificateId);
      
      if (!certificate) {
        return res.status(404).json({ message: "Certificate not found" });
      }

      res.json(certificate);
    } catch (error) {
      console.error("Error fetching certificate:", error);
      res.status(500).json({ message: "Failed to fetch certificate" });
    }
  });

  // Create certificate (admin only)
  app.post('/api/certificates', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (user.role !== 'admin' && user.role !== 'superadmin') {
        return res.status(403).json({ message: "Only administrators can create certificates" });
      }

      const certificateData: InsertCertificate = insertCertificateSchema.parse({
        ...req.body,
        companyId: user.companyId
      });

      const certificate = await storage.createCertificate(certificateData);
      res.status(201).json(certificate);
    } catch (error) {
      console.error("Error creating certificate:", error);
      res.status(500).json({ message: "Failed to create certificate" });
    }
  });

  // Verify certificate (admin only)
  app.put('/api/certificates/:id/verify', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      const certificateId = parseInt(req.params.id);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (user.role !== 'admin' && user.role !== 'superadmin') {
        return res.status(403).json({ message: "Only administrators can verify certificates" });
      }

      const certificate = await storage.verifyCertificate(certificateId, userId);
      res.json(certificate);
    } catch (error) {
      console.error("Error verifying certificate:", error);
      res.status(500).json({ message: "Failed to verify certificate" });
    }
  });

  // TIME PERIODS API ROUTES (Admin only)
  
  // Get time periods
  app.get('/api/admin/time-periods', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || !user.companyId) {
        return res.status(404).json({ message: "User not found or not assigned to company" });
      }

      if (user.role !== 'admin' && user.role !== 'superadmin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const periods = await storage.getTimePeriods(user.companyId);
      res.json(periods);
    } catch (error) {
      console.error("Error fetching time periods:", error);
      res.status(500).json({ message: "Failed to fetch time periods" });
    }
  });

  // Create time period
  app.post('/api/admin/time-periods', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || !user.companyId) {
        return res.status(404).json({ message: "User not found or not assigned to company" });
      }

      if (user.role !== 'admin' && user.role !== 'superadmin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const periodData: InsertTimePeriod = insertTimePeriodSchema.parse({
        ...req.body,
        companyId: user.companyId,
        status: 'open',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const period = await storage.createTimePeriod(periodData);
      
      // Create audit log for period creation
      await createAuditLog(
        req.user.claims.sub,
        user.companyId,
        'time_period_create',
        'time_period',
        period.id.toString(),
        {
          name: period.name,
          startDate: period.startDate,
          endDate: period.endDate,
          status: 'open'
        }
      );

      res.status(201).json(period);
    } catch (error) {
      console.error("Error creating time period:", error);
      res.status(500).json({ message: "Failed to create time period" });
    }
  });

  // Close time period
  app.post('/api/admin/time-periods/:id/close', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || !user.companyId) {
        return res.status(404).json({ message: "User not found or not assigned to company" });
      }

      if (user.role !== 'admin' && user.role !== 'superadmin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const periodId = parseInt(req.params.id);
      const { reason } = req.body;

      if (!reason || reason.trim().length === 0) {
        return res.status(400).json({ message: "Reason is required to close period" });
      }

      const closedPeriod = await storage.closeTimePeriod(periodId, req.user.claims.sub, reason);
      
      // Create audit log for period closure
      await createAuditLog(
        req.user.claims.sub,
        user.companyId,
        'time_period_close',
        'time_period',
        periodId.toString(),
        {
          reason,
          closedBy: req.user.claims.sub,
          closedAt: new Date()
        }
      );

      res.json(closedPeriod);
    } catch (error) {
      console.error("Error closing time period:", error);
      res.status(500).json({ message: "Failed to close time period" });
    }
  });

  // Reopen time period
  app.post('/api/admin/time-periods/:id/reopen', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || !user.companyId) {
        return res.status(404).json({ message: "User not found or not assigned to company" });
      }

      if (user.role !== 'admin' && user.role !== 'superadmin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const periodId = parseInt(req.params.id);
      const { reason } = req.body;

      if (!reason || reason.trim().length === 0) {
        return res.status(400).json({ message: "Reason is required to reopen period" });
      }

      const reopenedPeriod = await storage.reopenTimePeriod(periodId, req.user.claims.sub, reason);
      
      // Create audit log for period reopening
      await createAuditLog(
        req.user.claims.sub,
        user.companyId,
        'time_period_reopen',
        'time_period',
        periodId.toString(),
        {
          reason,
          reopenedBy: req.user.claims.sub,
          reopenedAt: new Date()
        }
      );

      res.json(reopenedPeriod);
    } catch (error) {
      console.error("Error reopening time period:", error);
      res.status(500).json({ message: "Failed to reopen time period" });
    }
  });

  // AUDIT LOG API ROUTES (Admin only)
  
  // Get audit logs
  app.get('/api/admin/audit-logs', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || !user.companyId) {
        return res.status(404).json({ message: "User not found or not assigned to company" });
      }

      if (user.role !== 'admin' && user.role !== 'superadmin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { limit, offset, action, startDate, endDate } = req.query;
      
      const filters = {
        limit: limit ? parseInt(limit as string) : 50,
        offset: offset ? parseInt(offset as string) : 0,
        action: action as string,
        startDate: startDate as string,
        endDate: endDate as string,
      };

      const auditLogs = await storage.getAuditLog(user.companyId, filters);
      res.json(auditLogs);
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      res.status(500).json({ message: "Failed to fetch audit logs" });
    }
  });

  // ROTATION API ROUTES (Admin only)
  
  // Get rotation templates for company
  app.get('/api/admin/rotation-templates', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || !user.companyId) {
        return res.status(404).json({ message: "User not found or not assigned to company" });
      }

      if (user.role !== 'admin' && user.role !== 'superadmin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { departmentId } = req.query;
      const departmentIdNum = departmentId ? parseInt(departmentId as string) : undefined;

      const templates = await storage.getRotationTemplates(user.companyId, departmentIdNum);
      res.json(templates);
    } catch (error) {
      console.error("Error fetching rotation templates:", error);
      res.status(500).json({ message: "Failed to fetch rotation templates" });
    }
  });

  // Create rotation template
  app.post('/api/admin/rotation-templates', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || !user.companyId) {
        return res.status(404).json({ message: "User not found or not assigned to company" });
      }

      if (user.role !== 'admin' && user.role !== 'superadmin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      // Prepare template data with required server-side fields
      const templateDataWithDefaults = {
        ...req.body,
        companyId: user.companyId,
        createdBy: user.id
      };
      
      // Now validate the complete data
      const finalTemplateData = insertRotationTemplateSchema.parse(templateDataWithDefaults);

      const template = await storage.createRotationTemplate(finalTemplateData);

      await createAuditLog(
        user.id,
        user.companyId,
        'create',
        'rotation_template',
        template.id.toString(),
        { templateName: template.name }
      );

      res.status(201).json(template);
    } catch (error) {
      console.error("Error creating rotation template:", error);
      res.status(500).json({ message: "Failed to create rotation template" });
    }
  });

  // Update rotation template
  app.put('/api/admin/rotation-templates/:id', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || !user.companyId) {
        return res.status(404).json({ message: "User not found or not assigned to company" });
      }

      if (user.role !== 'admin' && user.role !== 'superadmin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const id = parseInt(req.params.id);
      const existingTemplate = await storage.getRotationTemplate(id);
      
      if (!existingTemplate || existingTemplate.companyId !== user.companyId) {
        return res.status(404).json({ message: "Rotation template not found" });
      }

      const updateData = insertRotationTemplateSchema.partial().parse(req.body);
      const updatedTemplate = await storage.updateRotationTemplate(id, updateData);

      await createAuditLog(
        user.id,
        user.companyId,
        'update',
        'rotation_template',
        id.toString(),
        { oldTemplate: existingTemplate, newTemplate: updatedTemplate }
      );

      res.json(updatedTemplate);
    } catch (error) {
      console.error("Error updating rotation template:", error);
      res.status(500).json({ message: "Failed to update rotation template" });
    }
  });

  // Delete rotation template
  app.delete('/api/admin/rotation-templates/:id', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || !user.companyId) {
        return res.status(404).json({ message: "User not found or not assigned to company" });
      }

      if (user.role !== 'admin' && user.role !== 'superadmin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const id = parseInt(req.params.id);
      const existingTemplate = await storage.getRotationTemplate(id);
      
      if (!existingTemplate || existingTemplate.companyId !== user.companyId) {
        return res.status(404).json({ message: "Rotation template not found" });
      }

      await storage.deleteRotationTemplate(id);

      await createAuditLog(
        user.id,
        user.companyId,
        'delete',
        'rotation_template',
        id.toString(),
        { templateName: existingTemplate.name }
      );

      res.json({ message: "Rotation template deleted successfully" });
    } catch (error) {
      console.error("Error deleting rotation template:", error);
      res.status(500).json({ message: "Failed to delete rotation template" });
    }
  });

  // Get rotation segments for a template
  app.get('/api/admin/rotation-templates/:id/segments', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || !user.companyId) {
        return res.status(404).json({ message: "User not found or not assigned to company" });
      }

      if (user.role !== 'admin' && user.role !== 'superadmin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const templateId = parseInt(req.params.id);
      const template = await storage.getRotationTemplate(templateId);
      
      if (!template || template.companyId !== user.companyId) {
        return res.status(404).json({ message: "Rotation template not found" });
      }

      const segments = await storage.getRotationSegments(templateId);
      res.json(segments);
    } catch (error) {
      console.error("Error fetching rotation segments:", error);
      res.status(500).json({ message: "Failed to fetch rotation segments" });
    }
  });

  // Create rotation segment
  app.post('/api/admin/rotation-segments', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || !user.companyId) {
        return res.status(404).json({ message: "User not found or not assigned to company" });
      }

      if (user.role !== 'admin' && user.role !== 'superadmin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const segmentData = insertRotationSegmentSchema.parse(req.body);
      
      // Verify template belongs to user's company
      const template = await storage.getRotationTemplate(segmentData.templateId);
      if (!template || template.companyId !== user.companyId) {
        return res.status(404).json({ message: "Rotation template not found" });
      }

      const segment = await storage.createRotationSegment(segmentData);

      await createAuditLog(
        user.id,
        user.companyId,
        'create',
        'rotation_segment',
        segment.id.toString(),
        { segmentName: segment.name, templateId: segmentData.templateId }
      );

      res.status(201).json(segment);
    } catch (error) {
      console.error("Error creating rotation segment:", error);
      res.status(500).json({ message: "Failed to create rotation segment" });
    }
  });

  // Update rotation segment
  app.put('/api/admin/rotation-segments/:id', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || !user.companyId) {
        return res.status(404).json({ message: "User not found or not assigned to company" });
      }

      if (user.role !== 'admin' && user.role !== 'superadmin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const id = parseInt(req.params.id);
      const existingSegment = await storage.getRotationSegment(id);
      
      if (!existingSegment) {
        return res.status(404).json({ message: "Rotation segment not found" });
      }

      // Verify template belongs to user's company
      const template = await storage.getRotationTemplate(existingSegment.templateId);
      if (!template || template.companyId !== user.companyId) {
        return res.status(404).json({ message: "Rotation template not found" });
      }

      const updateData = insertRotationSegmentSchema.partial().parse(req.body);
      const updatedSegment = await storage.updateRotationSegment(id, updateData);

      await createAuditLog(
        user.id,
        user.companyId,
        'update',
        'rotation_segment',
        id.toString(),
        { oldSegment: existingSegment, newSegment: updatedSegment }
      );

      res.json(updatedSegment);
    } catch (error) {
      console.error("Error updating rotation segment:", error);
      res.status(500).json({ message: "Failed to update rotation segment" });
    }
  });

  // Delete rotation segment
  app.delete('/api/admin/rotation-segments/:id', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || !user.companyId) {
        return res.status(404).json({ message: "User not found or not assigned to company" });
      }

      if (user.role !== 'admin' && user.role !== 'superadmin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const id = parseInt(req.params.id);
      const existingSegment = await storage.getRotationSegment(id);
      
      if (!existingSegment) {
        return res.status(404).json({ message: "Rotation segment not found" });
      }

      // Verify template belongs to user's company
      const template = await storage.getRotationTemplate(existingSegment.templateId);
      if (!template || template.companyId !== user.companyId) {
        return res.status(404).json({ message: "Rotation template not found" });
      }

      await storage.deleteRotationSegment(id);

      await createAuditLog(
        user.id,
        user.companyId,
        'delete',
        'rotation_segment',
        id.toString(),
        { segmentName: existingSegment.name, templateId: existingSegment.templateId }
      );

      res.json({ message: "Rotation segment deleted successfully" });
    } catch (error) {
      console.error("Error deleting rotation segment:", error);
      res.status(500).json({ message: "Failed to delete rotation segment" });
    }
  });

  // Preview rotation schedule
  app.post('/api/admin/rotation-templates/:id/preview', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || !user.companyId) {
        return res.status(404).json({ message: "User not found or not assigned to company" });
      }

      if (user.role !== 'admin' && user.role !== 'superadmin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const templateId = parseInt(req.params.id);
      const template = await storage.getRotationTemplate(templateId);
      
      if (!template || template.companyId !== user.companyId) {
        return res.status(404).json({ message: "Rotation template not found" });
      }

      const { startDate, endDate, userIds } = req.body;

      const previewData = await storage.previewRotationSchedule(
        templateId,
        startDate,
        endDate,
        userIds
      );

      res.json(previewData);
    } catch (error) {
      console.error("Error generating rotation preview:", error);
      res.status(500).json({ message: "Failed to generate rotation preview" });
    }
  });

  // Generate rotation assignments
  app.post('/api/admin/rotation-templates/:id/generate', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || !user.companyId) {
        return res.status(404).json({ message: "User not found or not assigned to company" });
      }

      if (user.role !== 'admin' && user.role !== 'superadmin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const templateId = parseInt(req.params.id);
      const template = await storage.getRotationTemplate(templateId);
      
      if (!template || template.companyId !== user.companyId) {
        return res.status(404).json({ message: "Rotation template not found" });
      }

      const { startDate, endDate } = req.body;

      const result = await storage.generateRotationAssignments(
        templateId,
        startDate,
        endDate,
        user.id
      );

      await createAuditLog(
        user.id,
        user.companyId,
        'generate_rotation',
        'rotation_template',
        templateId.toString(),
        { 
          templateName: template.name,
          dateRange: result.dateRange,
          generatedAssignments: result.generatedAssignments,
          affectedUsers: result.affectedUsers
        }
      );

      res.json(result);
    } catch (error) {
      console.error("Error generating rotation assignments:", error);
      res.status(500).json({ message: "Failed to generate rotation assignments" });
    }
  });

  // Enhanced user shift assignment with validation
  app.post('/api/user-shift-assignments/validated', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin' && user?.role !== 'superadmin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      if (!user?.companyId) {
        return res.status(400).json({ message: "User must be assigned to a company" });
      }

      const assignmentData = insertUserShiftAssignmentSchema.parse(req.body);

      // Verify target user is from the same company (skip for superadmin)
      const targetUser = await storage.getUser(assignmentData.userId);
      if (!targetUser) {
        return res.status(400).json({ message: "User not found" });
      }
      
      // Only enforce company match for non-superadmins
      if (user.role !== 'superadmin' && targetUser.companyId !== user.companyId) {
        return res.status(400).json({ message: "User must be from your company" });
      }

      // Create assignment with validation
      const assignment = await storage.createUserShiftAssignmentWithValidation(assignmentData);

      await createAuditLog(
        user.id,
        user.companyId,
        'create',
        'user_shift_assignment',
        assignment.id.toString(),
        assignmentData,
        targetUser.id
      );

      res.status(201).json(assignment);
    } catch (error) {
      console.error("Error creating validated user shift assignment:", error);
      if (error instanceof Error && error.message.includes('Conflito de vinculação')) {
        res.status(409).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to create shift assignment" });
      }
    }
  });

  // ========================================================================================
  // RECRUITMENT & SELECTION ROUTES
  // ========================================================================================

  // PUBLIC ROUTES (No authentication required)
  // NOTE: Public job routes are defined later in the file (after LEAD CAPTURE section)
  // to avoid duplication and ensure proper company filtering

  // ========================================================================================
  // LEAD CAPTURE ROUTES
  // ========================================================================================

  // Create lead (public - no authentication required)
  app.post('/api/leads', async (req, res) => {
    try {
      // Validate request body
      const validationResult = insertLeadSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Dados inválidos",
          errors: validationResult.error.errors 
        });
      }

      // Create lead
      const lead = await storage.createLead(validationResult.data);

      // Send notification email (non-blocking)
      sendLeadNotificationEmail(lead).catch(err => {
        console.error("Failed to send lead notification email:", err);
      });

      res.status(201).json({ 
        success: true, 
        message: "Contato recebido com sucesso! Entraremos em contato em breve.",
        leadId: lead.id 
      });
    } catch (error) {
      console.error("Error creating lead:", error);
      res.status(500).json({ message: "Erro ao enviar contato. Tente novamente." });
    }
  });

  // Get all leads (admin only)
  app.get('/api/leads', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin' && user?.role !== 'superadmin') {
        return res.status(403).json({ message: "Acesso negado" });
      }

      const status = req.query.status as string | undefined;
      const leads = await storage.getLeads({ status });
      res.json(leads);
    } catch (error) {
      console.error("Error fetching leads:", error);
      res.status(500).json({ message: "Erro ao buscar leads" });
    }
  });

  // Get single lead (admin only)
  app.get('/api/leads/:id', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin' && user?.role !== 'superadmin') {
        return res.status(403).json({ message: "Acesso negado" });
      }

      const lead = await storage.getLead(parseInt(req.params.id));
      if (!lead) {
        return res.status(404).json({ message: "Lead não encontrado" });
      }

      res.json(lead);
    } catch (error) {
      console.error("Error fetching lead:", error);
      res.status(500).json({ message: "Erro ao buscar lead" });
    }
  });

  // Update lead status (admin only)
  app.patch('/api/leads/:id', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin' && user?.role !== 'superadmin') {
        return res.status(403).json({ message: "Acesso negado" });
      }

      // Validate request body
      const validationResult = updateLeadStatusSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Dados inválidos",
          errors: validationResult.error.errors 
        });
      }

      const leadId = parseInt(req.params.id);
      const updateData = {
        ...validationResult.data,
        lastContactedAt: validationResult.data.status === 'contacted' ? new Date() : undefined,
      };

      const lead = await storage.updateLeadStatus(leadId, updateData);
      res.json(lead);
    } catch (error) {
      console.error("Error updating lead:", error);
      res.status(500).json({ message: "Erro ao atualizar lead" });
    }
  });

  // Geocoding endpoint (proxy for Nominatim API)
  app.get('/api/geocode', async (req, res) => {
    try {
      const { query } = req.query;

      if (!query || typeof query !== 'string') {
        return res.status(400).json({ message: "Query parameter is required" });
      }

      // Call Nominatim API with proper headers
      const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&countrycodes=br`;
      
      const response = await fetch(nominatimUrl, {
        headers: {
          'User-Agent': 'RHNet/1.0 (HR Management System)',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Geocoding service error');
      }

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error geocoding:", error);
      res.status(500).json({ message: "Failed to geocode address" });
    }
  });

  // ========================================================================================
  // PUBLIC JOB APPLICATION ROUTES (No authentication required)
  // ========================================================================================
  
  // Configure multer for resume uploads
  const resumesDir = path.join(process.cwd(), 'uploads', 'resumes');
  if (!fs.existsSync(resumesDir)) {
    fs.mkdirSync(resumesDir, { recursive: true });
  }

  const resumeUpload = multer({
    storage: multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, resumesDir);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
        cb(null, `resume-${uniqueSuffix}-${sanitizedName}`);
      }
    }),
    limits: { 
      fileSize: 5 * 1024 * 1024 // 5MB limit for resumes
    },
    fileFilter: (req, file, cb) => {
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Only PDF and DOC files are allowed for resumes'), false);
      }
    }
  });

  // Get public job openings (published only)
  app.get('/api/public/jobs', async (req, res) => {
    try {
      const { companyId } = req.query;
      
      // Get all published job openings
      const jobOpenings = await storage.getPublicJobOpenings(companyId ? parseInt(companyId as string) : undefined);
      res.json(jobOpenings);
    } catch (error) {
      console.error("Error fetching public job openings:", error);
      res.status(500).json({ message: "Failed to fetch job openings" });
    }
  });

  // Get single job opening details (public)
  app.get('/api/public/jobs/:id', async (req, res) => {
    try {
      const jobId = parseInt(req.params.id);
      const jobOpening = await storage.getJobOpening(jobId);
      
      console.log("=== PUBLIC JOB DETAILS DEBUG ===");
      console.log("Job ID:", jobId);
      console.log("requiresDISC:", jobOpening?.requiresDISC);
      console.log("discTiming:", jobOpening?.discTiming);
      console.log("idealDISCProfile:", jobOpening?.idealDISCProfile);
      console.log("================================");
      
      if (!jobOpening) {
        return res.status(404).json({ message: "Job opening not found" });
      }
      
      if (jobOpening.status !== 'published') {
        return res.status(404).json({ message: "This job opening is no longer available" });
      }
      
      res.json(jobOpening);
    } catch (error) {
      console.error("Error fetching job opening:", error);
      res.status(500).json({ message: "Failed to fetch job opening" });
    }
  });

  // Public job application (accepting multipart form data for future file uploads)
  // Using resumeUpload with .fields() but allowing empty file fields
  app.post('/api/public/apply', resumeUpload.fields([
    { name: 'resume', maxCount: 1 }  // Optional file upload
  ]), async (req, res) => {
    try {
      console.log("=== PUBLIC APPLY DEBUG ===");
      console.log("req.body:", req.body);
      console.log("req.body keys:", Object.keys(req.body));
      console.log("req.body.jobOpeningId:", req.body.jobOpeningId);
      console.log("req.body.discResponses:", req.body.discResponses);
      console.log("discResponses type:", typeof req.body.discResponses);
      console.log("=========================");
      
      let { jobOpeningId, name, email, phone, cpf, coverLetter, city, state, requirementResponses } = req.body;
      
      // Parse requirementResponses if it's a JSON string (from FormData)
      if (typeof requirementResponses === 'string') {
        try {
          requirementResponses = JSON.parse(requirementResponses);
        } catch (e) {
          console.error("Failed to parse requirementResponses:", e);
          return res.status(400).json({ message: "Invalid requirement responses format" });
        }
      }
      
      console.log("Parsed requirementResponses:", requirementResponses);
      
      if (!jobOpeningId || !name || !email) {
        console.error("Missing required fields!");
        console.error("req.body:", JSON.stringify(req.body));
        console.error("jobOpeningId:", jobOpeningId);
        console.error("name:", name);
        console.error("email:", email);
        return res.status(400).json({ 
          message: "Missing required fields", 
          debug: {
            body: req.body,
            jobOpeningId: !!jobOpeningId,
            name: !!name,
            email: !!email
          }
        });
      }

      // Validate job opening exists and is published
      const jobOpening = await storage.getJobOpening(parseInt(jobOpeningId));
      if (!jobOpening) {
        return res.status(404).json({ message: "Job opening not found" });
      }
      
      if (jobOpening.status !== 'published') {
        return res.status(400).json({ message: "This job opening is no longer accepting applications" });
      }

      // Handle resume upload
      let resumeUrl = null;
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      if (files && files.resume && files.resume.length > 0) {
        resumeUrl = `/uploads/resumes/${files.resume[0].filename}`;
      }

      // Check if candidate already exists by email and company
      const existingCandidates = await storage.getCandidates(jobOpening.companyId);
      let candidate = existingCandidates.find(c => c.email.toLowerCase() === email.toLowerCase());
      
      if (!candidate) {
        // Create new candidate
        candidate = await storage.createCandidate({
          companyId: jobOpening.companyId,
          name,
          email,
          phone: phone || null,
          cpf: cpf || null,
          city: city || null,
          state: state || null,
          resumeUrl,
          source: 'website'
        });
      } else {
        // Update resume if new one was uploaded
        if (resumeUrl) {
          candidate = await storage.updateCandidate(candidate.id, { resumeUrl });
        }
      }

      // Check if application already exists
      const existingApplications = await storage.getApplications(parseInt(jobOpeningId));
      const existingApplication = existingApplications.find(app => app.candidateId === candidate.id);
      
      const crypto = await import('crypto');
      let application;
      
      if (existingApplication) {
        // Update existing application with new data
        const accessToken = existingApplication.accessToken || crypto.randomBytes(32).toString('hex');
        application = await storage.updateApplication(existingApplication.id, {
          coverLetter: coverLetter || existingApplication.coverLetter,
          status: 'applied', // Reset to applied
          score: 0, // Will be recalculated
          accessToken
        });
        application.id = existingApplication.id;
      } else {
        // Generate unique access token for new application
        const accessToken = crypto.randomBytes(32).toString('hex');

        // Create new application
        application = await storage.createApplication({
          jobOpeningId: parseInt(jobOpeningId),
          candidateId: candidate.id,
          status: 'applied',
          coverLetter: coverLetter || null,
          score: 0,
          accessToken
        });
      }

      // Process requirement responses and calculate score if provided
      let scoreResult = null;
      if (requirementResponses && Array.isArray(requirementResponses) && requirementResponses.length > 0) {
        try {
          scoreResult = await storage.submitAndScoreApplication(application.id, requirementResponses);
          
          // Update application with calculated score
          await storage.updateApplication(application.id, {
            score: scoreResult.score,
            status: scoreResult.isQualified ? 'applied' : 'rejected'
          });
        } catch (scoreError) {
          console.error("Error scoring application:", scoreError);
          // Don't fail the application if scoring fails
        }
      }

      // Process DISC responses if provided (when discTiming='on_application')
      let discAssessmentId = null;
      if (req.body.discResponses) {
        try {
          let discResponses = typeof req.body.discResponses === 'string' 
            ? JSON.parse(req.body.discResponses) 
            : req.body.discResponses;

          if (discResponses && Object.keys(discResponses).length > 0) {
            // Validate DISC responses format and values
            const validResponses: Record<string, number> = {};
            for (const [questionId, value] of Object.entries(discResponses)) {
              // Convert to number, accepting both number and string inputs
              const numValue = typeof value === 'number' ? value : parseInt(String(value), 10);
              
              // Validate value is between 1-5 and is a valid integer
              if (isNaN(numValue) || !Number.isInteger(numValue) || numValue < 1 || numValue > 5) {
                throw new Error(`Invalid DISC response value: ${value}. Must be integer between 1-5.`);
              }
              
              validResponses[questionId] = numValue;
            }

            // Verify minimum number of questions answered
            const activeQuestions = await storage.getActiveDISCQuestions();
            if (Object.keys(validResponses).length < activeQuestions.length) {
              throw new Error(`Incomplete DISC assessment: ${Object.keys(validResponses).length}/${activeQuestions.length} questions answered.`);
            }

            // Generate access token for DISC assessment
            const discAccessToken = crypto.randomBytes(32).toString('hex');

            // Create DISC assessment
            const discAssessment = await storage.createDISCAssessment({
              applicationId: application.id,
              candidateId: candidate.id,
              jobOpeningId: parseInt(jobOpeningId),
              accessToken: discAccessToken,
              status: 'completed',
            });

            discAssessmentId = discAssessment.id;

            // Save DISC responses and calculate scores
            const responses = Object.entries(validResponses).map(([questionId, value]) => ({
              assessmentId: discAssessment.id,
              questionId: parseInt(questionId, 10),
              selectedValue: value,
            }));

            await storage.saveDISCResponses(discAssessment.id, responses);
            console.log(`DISC assessment completed for candidate ${name} (${email}) - ${responses.length} questions answered`);
          }
        } catch (discError: any) {
          console.error("Error processing DISC responses:", discError);
          // Fail the application if DISC was required but processing failed
          if (jobOpening.requiresDISC && jobOpening.discTiming === 'on_application') {
            return res.status(400).json({ 
              message: `Erro ao processar teste DISC: ${discError.message || 'Falha no processamento'}`,
              error: 'DISC_PROCESSING_FAILED'
            });
          }
        }
      }

      // NOTE: In-app message notifications removed as candidates are not system users
      // Admins can view new applications in the Recruitment & Selection dashboard
      console.log(`New application submitted for ${jobOpening.title} by ${name} (${email}) with score: ${scoreResult?.score || 0}`);

      res.status(201).json({ 
        message: "Application submitted successfully",
        applicationId: application.id,
        candidateId: candidate.id,
        score: scoreResult?.score || 0,
        isQualified: scoreResult?.isQualified ?? true,
        discAssessmentId: discAssessmentId
      });
    } catch (error) {
      console.error("Error submitting application:", error);
      res.status(500).json({ message: "Failed to submit application" });
    }
  });

  // Public DISC questions endpoint (for job application forms)
  app.get('/api/disc-questions', async (req, res) => {
    try {
      const questions = await storage.getActiveDISCQuestions();
      res.json(questions);
    } catch (error: any) {
      console.error("Error fetching DISC questions:", error);
      res.status(500).json({ message: "Erro ao carregar questões DISC" });
    }
  });

  // ========================================================================================
  // ADMIN ROUTES (Authentication required)
  // ========================================================================================
  
  // Job Openings Routes
  app.get('/api/job-openings', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.companyId) {
        return res.status(400).json({ message: "User must be assigned to a company" });
      }
      
      const { status } = req.query;
      const jobOpenings = await storage.getJobOpenings(user.companyId, status as string);
      res.json(jobOpenings);
    } catch (error) {
      console.error("Error fetching job openings:", error);
      res.status(500).json({ message: "Failed to fetch job openings" });
    }
  });

  app.post('/api/job-openings', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin' && user?.role !== 'superadmin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      if (!user?.companyId) {
        return res.status(400).json({ message: "User must be assigned to a company" });
      }

      const jobOpening = await storage.createJobOpening({
        ...req.body,
        companyId: user.companyId,
        createdBy: user.id
      });
      
      res.status(201).json(jobOpening);
    } catch (error) {
      console.error("Error creating job opening:", error);
      res.status(500).json({ message: "Failed to create job opening" });
    }
  });

  app.get('/api/job-openings/:id', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const jobOpening = await storage.getJobOpening(parseInt(req.params.id));
      if (!jobOpening) {
        return res.status(404).json({ message: "Job opening not found" });
      }
      res.json(jobOpening);
    } catch (error) {
      console.error("Error fetching job opening:", error);
      res.status(500).json({ message: "Failed to fetch job opening" });
    }
  });

  app.put('/api/job-openings/:id', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin' && user?.role !== 'superadmin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const jobOpening = await storage.updateJobOpening(parseInt(req.params.id), req.body);
      res.json(jobOpening);
    } catch (error) {
      console.error("Error updating job opening:", error);
      res.status(500).json({ message: "Failed to update job opening" });
    }
  });

  app.post('/api/job-openings/:id/publish', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin' && user?.role !== 'superadmin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const jobOpening = await storage.publishJobOpening(parseInt(req.params.id));
      res.json(jobOpening);
    } catch (error) {
      console.error("Error publishing job opening:", error);
      res.status(500).json({ message: "Failed to publish job opening" });
    }
  });

  app.delete('/api/job-openings/:id', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin' && user?.role !== 'superadmin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      // Verify ownership: check that the job opening belongs to user's company
      const jobOpening = await storage.getJobOpening(parseInt(req.params.id));
      if (!jobOpening) {
        return res.status(404).json({ message: "Job opening not found" });
      }
      if (user.role === 'admin' && jobOpening.companyId !== user.companyId) {
        return res.status(403).json({ message: "Cannot delete other companies' job openings" });
      }

      await storage.deleteJobOpening(parseInt(req.params.id));
      res.json({ message: "Job opening deleted successfully" });
    } catch (error) {
      console.error("Error deleting job opening:", error);
      res.status(500).json({ message: "Failed to delete job opening" });
    }
  });

  // Job Requirements Routes
  app.get('/api/job-openings/:id/requirements', async (req: any, res) => {
    try {
      const requirements = await storage.getJobRequirements(parseInt(req.params.id));
      res.json(requirements);
    } catch (error) {
      console.error("Error fetching job requirements:", error);
      res.status(500).json({ message: "Failed to fetch job requirements" });
    }
  });

  app.post('/api/job-openings/:id/requirements/bulk', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin' && user?.role !== 'superadmin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      // Verify ownership: check that the job opening belongs to user's company
      const jobOpening = await storage.getJobOpening(parseInt(req.params.id));
      if (!jobOpening) {
        return res.status(404).json({ message: "Job opening not found" });
      }
      if (user.role === 'admin' && jobOpening.companyId !== user.companyId) {
        return res.status(403).json({ message: "Cannot update requirements for other companies' job openings" });
      }

      // Validate array of requirements
      const requirementsArray = Array.isArray(req.body) ? req.body : [];
      const jobOpeningId = parseInt(req.params.id);
      
      const validated = requirementsArray.map(reqData => {
        // Remove auto-generated fields and add jobOpeningId from URL
        const { id, createdAt, updatedAt, jobOpeningId: _, ...rest } = reqData;
        const validationResult = insertJobRequirementSchema.safeParse({
          ...rest,
          jobOpeningId, // Add jobOpeningId from route parameter
        });
        if (!validationResult.success) {
          throw new Error(`Invalid requirement data: ${JSON.stringify(validationResult.error.errors)}`);
        }
        return validationResult.data;
      });

      // Atomically replace all requirements using transaction
      const newRequirements = await storage.bulkReplaceJobRequirements(jobOpeningId, validated);
      res.json(newRequirements);
    } catch (error: any) {
      console.error("Error bulk replacing job requirements:", error);
      res.status(500).json({ message: "Failed to bulk replace requirements", error: error.message });
    }
  });

  app.post('/api/job-openings/:id/requirements', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin' && user?.role !== 'superadmin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      // Verify ownership: check that the job opening belongs to user's company
      const jobOpening = await storage.getJobOpening(parseInt(req.params.id));
      if (!jobOpening) {
        return res.status(404).json({ message: "Job opening not found" });
      }
      if (jobOpening.companyId !== user.companyId) {
        return res.status(403).json({ message: "Cannot create requirements for other companies' job openings" });
      }

      // Validate request body with Zod
      const validationResult = insertJobRequirementSchema.safeParse({
        ...req.body,
        jobOpeningId: parseInt(req.params.id),
      });

      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Invalid requirement data",
          errors: validationResult.error.errors 
        });
      }

      const requirement = await storage.createJobRequirement(validationResult.data);
      res.status(201).json(requirement);
    } catch (error) {
      console.error("Error creating job requirement:", error);
      res.status(500).json({ message: "Failed to create job requirement" });
    }
  });

  app.put('/api/job-requirements/:id', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin' && user?.role !== 'superadmin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      // Verify ownership: check that the requirement's job opening belongs to user's company
      const requirement = await storage.getJobRequirement(parseInt(req.params.id));
      if (!requirement) {
        return res.status(404).json({ message: "Requirement not found" });
      }
      
      const jobOpening = await storage.getJobOpening(requirement.jobOpeningId);
      if (!jobOpening || jobOpening.companyId !== user.companyId) {
        return res.status(403).json({ message: "Cannot update requirements for other companies' job openings" });
      }

      // Block jobOpeningId changes to prevent moving requirements to other companies' jobs
      const { jobOpeningId, ...updateData } = req.body;
      if (jobOpeningId !== undefined) {
        return res.status(400).json({ message: "Cannot change jobOpeningId of existing requirement" });
      }

      // Validate request body with Zod (partial update, without jobOpeningId)
      const validationResult = insertJobRequirementSchema.partial().omit({ jobOpeningId: true }).safeParse(updateData);
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Invalid requirement data",
          errors: validationResult.error.errors 
        });
      }

      const updated = await storage.updateJobRequirement(parseInt(req.params.id), validationResult.data);
      res.json(updated);
    } catch (error) {
      console.error("Error updating job requirement:", error);
      res.status(500).json({ message: "Failed to update job requirement" });
    }
  });

  app.delete('/api/job-requirements/:id', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin' && user?.role !== 'superadmin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      // Verify ownership: check that the requirement's job opening belongs to user's company
      const requirement = await storage.getJobRequirement(parseInt(req.params.id));
      if (!requirement) {
        return res.status(404).json({ message: "Requirement not found" });
      }
      
      const jobOpening = await storage.getJobOpening(requirement.jobOpeningId);
      if (!jobOpening || jobOpening.companyId !== user.companyId) {
        return res.status(403).json({ message: "Cannot delete requirements for other companies' job openings" });
      }

      await storage.deleteJobRequirement(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting job requirement:", error);
      res.status(500).json({ message: "Failed to delete job requirement" });
    }
  });

  // Application Requirement Responses Routes
  app.get('/api/applications/:id/requirements', async (req: any, res) => {
    try {
      const accessToken = req.headers['x-access-token'] as string;
      
      // Verify access token
      const application = await storage.getApplication(parseInt(req.params.id));
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }
      
      if (!accessToken || application.accessToken !== accessToken) {
        return res.status(403).json({ message: "Invalid access token" });
      }

      const responses = await storage.getApplicationRequirementResponses(parseInt(req.params.id));
      res.json(responses);
    } catch (error) {
      console.error("Error fetching application requirement responses:", error);
      res.status(500).json({ message: "Failed to fetch requirement responses" });
    }
  });

  app.post('/api/applications/:id/requirements', async (req: any, res) => {
    try {
      const accessToken = req.headers['x-access-token'] as string;
      const { responses } = req.body;
      
      // Verify access token
      const application = await storage.getApplication(parseInt(req.params.id));
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }
      
      if (!accessToken || application.accessToken !== accessToken) {
        return res.status(403).json({ message: "Invalid access token" });
      }
      
      // Validate that responses is an array
      if (!Array.isArray(responses)) {
        return res.status(400).json({ message: "Responses must be an array" });
      }

      // Validate each response with Zod
      const responseSchema = z.object({
        requirementId: z.number().int(),
        proficiencyLevel: z.string().min(1),
      });

      for (const response of responses) {
        const validation = responseSchema.safeParse(response);
        if (!validation.success) {
          return res.status(400).json({ 
            message: "Invalid response data",
            errors: validation.error.errors 
          });
        }
      }

      const result = await storage.submitAndScoreApplication(
        parseInt(req.params.id), 
        responses
      );
      
      res.json(result);
    } catch (error) {
      console.error("Error submitting application requirements:", error);
      res.status(500).json({ 
        message: "Failed to submit application requirements",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Candidates Routes
  app.get('/api/candidates', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.companyId) {
        return res.status(400).json({ message: "User must be assigned to a company" });
      }

      const candidates = await storage.getCandidates(user.companyId);
      res.json(candidates);
    } catch (error) {
      console.error("Error fetching candidates:", error);
      res.status(500).json({ message: "Failed to fetch candidates" });
    }
  });

  app.post('/api/candidates', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.companyId) {
        return res.status(400).json({ message: "User must be assigned to a company" });
      }

      const candidate = await storage.createCandidate({
        ...req.body,
        companyId: user.companyId
      });
      
      res.status(201).json(candidate);
    } catch (error) {
      console.error("Error creating candidate:", error);
      res.status(500).json({ message: "Failed to create candidate" });
    }
  });

  // Applications Routes
  app.get('/api/applications/all', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.companyId) {
        return res.status(400).json({ message: "User must be assigned to a company" });
      }

      // Get all applications for the company with job and candidate details
      const jobOpenings = await storage.getJobOpenings(user.companyId);
      const allApplications = [];

      for (const job of jobOpenings) {
        const applications = await storage.getApplications(job.id);
        const jobRequirements = await storage.getJobRequirements(job.id);
        
        for (const app of applications) {
          const candidate = await storage.getCandidate(app.candidateId);
          
          // Get DISC assessment for candidate (if exists)
          const discAssessments = await storage.getDISCAssessmentsByCandidate(app.candidateId);
          const candidateDISC = discAssessments.find(
            d => d.jobOpeningId === job.id && d.status === 'completed'
          );
          
          // Calculate DISC compatibility if both exist
          let discCompatibility = null;
          if (candidateDISC && job.requiresDISC && job.idealDISCProfile) {
            const { calculateCompatibility } = await import('./services/discAssessmentService');
            const compatibility = calculateCompatibility(
              {
                dScore: candidateDISC.dScore || 0,
                iScore: candidateDISC.iScore || 0,
                sScore: candidateDISC.sScore || 0,
                cScore: candidateDISC.cScore || 0
              },
              job.idealDISCProfile
            );
            discCompatibility = compatibility.compatibilityScore;
          }
          
          // Get requirement responses
          const requirementResponses = await storage.getApplicationRequirementResponses(app.id);
          
          allApplications.push({
            ...app,
            jobTitle: job.title,
            jobLocation: job.location,
            jobDescription: job.description,
            jobRequirements: jobRequirements,
            requirementResponses: requirementResponses,
            candidateName: candidate?.name,
            candidateEmail: candidate?.email,
            candidatePhone: candidate?.phone,
            candidateDISC: candidateDISC ? {
              dScore: candidateDISC.dScore,
              iScore: candidateDISC.iScore,
              sScore: candidateDISC.sScore,
              cScore: candidateDISC.cScore,
              primaryProfile: candidateDISC.primaryProfile,
              completedAt: candidateDISC.completedAt
            } : null,
            discCompatibility: discCompatibility,
            idealDISCProfile: job.idealDISCProfile
          });
        }
      }

      res.json(allApplications);
    } catch (error) {
      console.error("Error fetching all applications:", error);
      res.status(500).json({ message: "Failed to fetch applications" });
    }
  });

  app.get('/api/job-openings/:jobId/applications', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const applications = await storage.getApplications(parseInt(req.params.jobId));
      res.json(applications);
    } catch (error) {
      console.error("Error fetching applications:", error);
      res.status(500).json({ message: "Failed to fetch applications" });
    }
  });

  app.post('/api/applications', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      // Generate unique access token if not provided
      const crypto = await import('crypto');
      const accessToken = req.body.accessToken || crypto.randomBytes(32).toString('hex');
      
      const application = await storage.createApplication({
        ...req.body,
        accessToken
      });
      res.status(201).json(application);
    } catch (error) {
      console.error("Error creating application:", error);
      res.status(500).json({ message: "Failed to create application" });
    }
  });

  app.put('/api/applications/:id', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const application = await storage.updateApplication(parseInt(req.params.id), req.body);
      res.json(application);
    } catch (error) {
      console.error("Error updating application:", error);
      res.status(500).json({ message: "Failed to update application" });
    }
  });

  app.post('/api/applications/bulk-delete', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin' && user?.role !== 'superadmin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { ids } = req.body;
      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ message: "Invalid request: ids array is required" });
      }

      const deletedCount = await storage.deleteApplicationsBulk(ids);
      res.json({ deletedCount, message: `${deletedCount} application(s) deleted successfully` });
    } catch (error) {
      console.error("Error deleting applications:", error);
      res.status(500).json({ message: "Failed to delete applications" });
    }
  });

  // Onboarding Links Routes
  app.get('/api/onboarding-links', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.companyId) {
        return res.status(400).json({ message: "User must be assigned to a company" });
      }

      const links = await storage.getOnboardingLinks(user.companyId);
      res.json(links);
    } catch (error) {
      console.error("Error fetching onboarding links:", error);
      res.status(500).json({ message: "Failed to fetch onboarding links" });
    }
  });

  app.post('/api/onboarding-links', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin' && user?.role !== 'superadmin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      // Generate unique token
      const token = `onb_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      
      const link = await storage.createOnboardingLink({
        ...req.body,
        token,
        createdBy: user.id
      });
      
      res.status(201).json(link);
    } catch (error) {
      console.error("Error creating onboarding link:", error);
      res.status(500).json({ message: "Failed to create onboarding link" });
    }
  });

  // Public onboarding route (no auth required)
  app.get('/api/onboarding/:token', async (req, res) => {
    try {
      const link = await storage.getOnboardingLinkByToken(req.params.token);
      if (!link) {
        return res.status(404).json({ message: "Onboarding link not found" });
      }
      if (link.status === 'expired' || (link.expiresAt && new Date(link.expiresAt) < new Date())) {
        return res.status(410).json({ message: "Onboarding link has expired" });
      }
      
      const formData = await storage.getOnboardingFormData(link.id);
      res.json({ link, formData });
    } catch (error) {
      console.error("Error fetching onboarding:", error);
      res.status(500).json({ message: "Failed to fetch onboarding" });
    }
  });

  app.post('/api/onboarding/:token/submit', async (req, res) => {
    try {
      const link = await storage.getOnboardingLinkByToken(req.params.token);
      if (!link) {
        return res.status(404).json({ message: "Onboarding link not found" });
      }

      const formData = await storage.upsertOnboardingFormData({
        onboardingLinkId: link.id,
        ...req.body,
        isComplete: true,
        submittedAt: new Date()
      });

      await storage.updateOnboardingLink(link.id, { status: 'in_progress' });
      
      res.json({ success: true, formData });
    } catch (error) {
      console.error("Error submitting onboarding:", error);
      res.status(500).json({ message: "Failed to submit onboarding" });
    }
  });

  // Note: Static file serving for uploads will be added separately

  // ========================================================================================
  // OVERTIME & TIME BANK ROUTES
  // ========================================================================================

  // Get overtime rules for a department
  app.get('/api/overtime-rules/:departmentId', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const departmentId = parseInt(req.params.departmentId);
      const rules = await storage.getOvertimeRules(departmentId);
      res.json(rules);
    } catch (error) {
      console.error("Error fetching overtime rules:", error);
      res.status(500).json({ message: "Failed to fetch overtime rules" });
    }
  });

  // Create overtime rule
  app.post('/api/overtime-rules', isAuthenticatedHybrid, requireAdminRole, async (req: any, res) => {
    try {
      console.log("[OVERTIME] Creating overtime rule with data:", JSON.stringify(req.body, null, 2));
      const rule = await storage.createOvertimeRule(req.body);
      console.log("[OVERTIME] Rule created successfully:", rule);
      res.json(rule);
    } catch (error: any) {
      console.error("[OVERTIME] Error creating overtime rule:", error);
      console.error("[OVERTIME] Error details:", {
        message: error.message,
        stack: error.stack,
        body: req.body
      });
      res.status(500).json({ message: error.message || "Failed to create overtime rule" });
    }
  });

  // Update overtime rule
  app.put('/api/overtime-rules/:id', isAuthenticatedHybrid, requireAdminRole, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const rule = await storage.updateOvertimeRule(id, req.body);
      res.json(rule);
    } catch (error) {
      console.error("Error updating overtime rule:", error);
      res.status(500).json({ message: "Failed to update overtime rule" });
    }
  });

  // Delete overtime rule
  app.delete('/api/overtime-rules/:id', isAuthenticatedHybrid, requireAdminRole, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteOvertimeRule(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting overtime rule:", error);
      res.status(500).json({ message: "Failed to delete overtime rule" });
    }
  });

  // Get overtime tiers for a rule
  app.get('/api/overtime-tiers/:ruleId', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const ruleId = parseInt(req.params.ruleId);
      const tiers = await storage.getOvertimeTiers(ruleId);
      res.json(tiers);
    } catch (error) {
      console.error("Error fetching overtime tiers:", error);
      res.status(500).json({ message: "Failed to fetch overtime tiers" });
    }
  });

  // Create overtime tier
  app.post('/api/overtime-tiers', isAuthenticatedHybrid, requireAdminRole, async (req: any, res) => {
    try {
      const tier = await storage.createOvertimeTier(req.body);
      res.json(tier);
    } catch (error) {
      console.error("Error creating overtime tier:", error);
      res.status(500).json({ message: "Failed to create overtime tier" });
    }
  });

  // Update overtime tier
  app.put('/api/overtime-tiers/:id', isAuthenticatedHybrid, requireAdminRole, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const tier = await storage.updateOvertimeTier(id, req.body);
      res.json(tier);
    } catch (error) {
      console.error("Error updating overtime tier:", error);
      res.status(500).json({ message: "Failed to update overtime tier" });
    }
  });

  // Delete overtime tier
  app.delete('/api/overtime-tiers/:id', isAuthenticatedHybrid, requireAdminRole, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteOvertimeTier(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting overtime tier:", error);
      res.status(500).json({ message: "Failed to delete overtime tier" });
    }
  });

  // Get current user's time bank (simplified endpoint)
  app.get('/api/my-time-bank', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const timeBank = await storage.getTimeBank(userId);
      
      if (!timeBank) {
        // Initialize time bank if doesn't exist
        await storage.updateTimeBankBalance(userId, 0, 'credit', 'initial', 'Initial balance', undefined, userId);
        const newTimeBank = await storage.getTimeBank(userId);
        return res.json(newTimeBank || { userId, balance: 0, lastUpdated: new Date().toISOString() });
      }
      
      res.json(timeBank);
    } catch (error) {
      console.error("Error fetching time bank:", error);
      res.status(500).json({ message: "Failed to fetch time bank" });
    }
  });

  // Get current user's time bank transactions (simplified endpoint)
  app.get('/api/my-time-bank-transactions', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = parseInt(req.query.limit as string) || 50;
      const transactions = await storage.getTimeBankTransactions(userId, limit);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching time bank transactions:", error);
      res.status(500).json({ message: "Failed to fetch time bank transactions" });
    }
  });

  // Get time bank for user
  app.get('/api/time-bank/:userId', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const userId = req.params.userId;
      const currentUser = req.user.claims.sub;
      
      // Check permissions
      if (currentUser !== userId && req.user.claims.role === 'employee') {
        return res.status(403).json({ message: "Not authorized" });
      }

      const timeBank = await storage.getTimeBank(userId);
      const balance = await storage.getTimeBankBalance(userId);
      
      res.json({ 
        timeBank, 
        balance 
      });
    } catch (error) {
      console.error("Error fetching time bank:", error);
      res.status(500).json({ message: "Failed to fetch time bank" });
    }
  });

  // Get time bank transactions
  app.get('/api/time-bank/:userId/transactions', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const userId = req.params.userId;
      const currentUser = req.user.claims.sub;
      const limit = parseInt(req.query.limit as string) || 50;
      
      // Check permissions
      if (currentUser !== userId && req.user.claims.role === 'employee') {
        return res.status(403).json({ message: "Not authorized" });
      }

      const transactions = await storage.getTimeBankTransactions(userId, limit);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching time bank transactions:", error);
      res.status(500).json({ message: "Failed to fetch time bank transactions" });
    }
  });

  // Manual time bank adjustment (admin only)
  app.post('/api/time-bank/:userId/adjust', isAuthenticatedHybrid, requireAdminRole, async (req: any, res) => {
    try {
      const userId = req.params.userId;
      const currentUser = req.user.claims.sub;
      const { hours, type, reason, description } = req.body;
      
      const timeBank = await storage.updateTimeBankBalance(
        userId,
        hours,
        type,
        reason,
        description,
        undefined,
        currentUser
      );
      
      res.json(timeBank);
    } catch (error) {
      console.error("Error adjusting time bank:", error);
      res.status(500).json({ message: "Failed to adjust time bank" });
    }
  });

  // ===== LEGAL FILES (AFD/AEJ) ROUTES =====
  
  // Export AFD file
  app.post('/api/legal-files/afd/export', isAuthenticatedHybrid, requireAdminRole, async (req: any, res) => {
    try {
      const { periodStart, periodEnd } = req.body;
      const companyId = req.user.claims.companyId;
      const userId = req.user.claims.sub;

      if (!periodStart || !periodEnd) {
        return res.status(400).json({ message: "Período obrigatório" });
      }

      const { exportAFD } = await import('./services/legalFiles/legalFileService');
      const result = await exportAFD({
        companyId,
        periodStart: new Date(periodStart),
        periodEnd: new Date(periodEnd),
        userId
      });

      res.json({ 
        success: true, 
        fileId: result.id,
        fileName: result.filePath 
      });
    } catch (error: any) {
      console.error("Error exporting AFD:", error);
      res.status(500).json({ message: error.message || "Failed to export AFD" });
    }
  });

  // Export AEJ file
  app.post('/api/legal-files/aej/export', isAuthenticatedHybrid, requireAdminRole, async (req: any, res) => {
    try {
      const { periodStart, periodEnd } = req.body;
      const companyId = req.user.claims.companyId;
      const userId = req.user.claims.sub;

      if (!periodStart || !periodEnd) {
        return res.status(400).json({ message: "Período obrigatório" });
      }

      const { exportAEJ } = await import('./services/legalFiles/legalFileService');
      const result = await exportAEJ({
        companyId,
        periodStart: new Date(periodStart),
        periodEnd: new Date(periodEnd),
        userId
      });

      res.json({ 
        success: true, 
        fileId: result.id,
        fileName: result.filePath 
      });
    } catch (error: any) {
      console.error("Error exporting AEJ:", error);
      res.status(500).json({ message: error.message || "Failed to export AEJ" });
    }
  });

  // List legal files
  app.get('/api/legal-files', isAuthenticatedHybrid, requireAdminRole, async (req: any, res) => {
    try {
      const companyId = req.user.claims.companyId;

      const { listLegalFiles } = await import('./services/legalFiles/legalFileService');
      const files = await listLegalFiles(companyId);

      res.json(files);
    } catch (error: any) {
      console.error("Error listing legal files:", error);
      res.status(500).json({ message: error.message || "Failed to list legal files" });
    }
  });

  // Download legal file
  app.get('/api/legal-files/:id/download', isAuthenticatedHybrid, requireAdminRole, async (req: any, res) => {
    try {
      const fileId = parseInt(req.params.id);
      const companyId = req.user.claims.companyId;

      const { getLegalFile } = await import('./services/legalFiles/legalFileService');
      const filePath = await getLegalFile(fileId, companyId);

      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: "Arquivo não encontrado" });
      }

      res.download(filePath);
    } catch (error: any) {
      console.error("Error downloading legal file:", error);
      res.status(500).json({ message: error.message || "Failed to download file" });
    }
  });

  // Import AFD file
  app.post('/api/legal-files/afd/import', isAuthenticatedHybrid, requireAdminRole, async (req: any, res) => {
    try {
      const { fileContent } = req.body;
      const companyId = req.user.claims.companyId;
      const userId = req.user.claims.sub;

      if (!fileContent) {
        return res.status(400).json({ message: "Conteúdo do arquivo obrigatório" });
      }

      const { importAFD } = await import('./services/legalFiles/legalFileService');
      const result = await importAFD({
        companyId,
        fileContent,
        userId
      });

      res.json({ 
        success: true, 
        imported: result.imported,
        errors: result.errors 
      });
    } catch (error: any) {
      console.error("Error importing AFD:", error);
      res.status(500).json({ message: error.message || "Failed to import AFD" });
    }
  });

  // ========================================================================================
  // INVENTORY & EPI MANAGEMENT ROUTES
  // ========================================================================================

  // ===================== INVENTORY CATEGORIES =====================

  // Get all categories (admin and supervisor)
  app.get('/api/inventory/categories', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || (user.role !== 'admin' && user.role !== 'superadmin' && user.role !== 'supervisor')) {
        return res.status(403).json({ message: "Acesso negado" });
      }

      const companyId = user.companyId;
      const categories = await storage.getInventoryCategories(companyId);
      res.json(categories);
    } catch (error) {
      console.error("Error fetching inventory categories:", error);
      res.status(500).json({ message: "Erro ao buscar categorias" });
    }
  });

  // Create category (admin only)
  app.post('/api/inventory/categories', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
        return res.status(403).json({ message: "Acesso negado - apenas administradores" });
      }

      const category = await storage.createInventoryCategory({
        companyId: user.companyId,
        name: req.body.name,
        description: req.body.description,
        type: req.body.type || 'epi',
      });

      res.status(201).json(category);
    } catch (error) {
      console.error("Error creating inventory category:", error);
      res.status(500).json({ message: "Erro ao criar categoria" });
    }
  });

  // Update category (admin only)
  app.put('/api/inventory/categories/:id', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
        return res.status(403).json({ message: "Acesso negado - apenas administradores" });
      }

      const category = await storage.updateInventoryCategory(parseInt(req.params.id), {
        name: req.body.name,
        description: req.body.description,
      });

      res.json(category);
    } catch (error) {
      console.error("Error updating inventory category:", error);
      res.status(500).json({ message: "Erro ao atualizar categoria" });
    }
  });

  // Delete category (admin only)
  app.delete('/api/inventory/categories/:id', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
        return res.status(403).json({ message: "Acesso negado - apenas administradores" });
      }

      await storage.deleteInventoryCategory(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting inventory category:", error);
      res.status(500).json({ message: "Erro ao excluir categoria" });
    }
  });

  // ===================== INVENTORY ITEMS =====================

  // Get all items (admin and supervisor)
  app.get('/api/inventory/items', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || (user.role !== 'admin' && user.role !== 'superadmin' && user.role !== 'supervisor')) {
        return res.status(403).json({ message: "Acesso negado" });
      }

      const companyId = user.companyId;
      const categoryId = req.query.categoryId ? parseInt(req.query.categoryId) : undefined;
      const isActive = req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined;

      const items = await storage.getInventoryItems(companyId, { categoryId, isActive });
      res.json(items);
    } catch (error) {
      console.error("Error fetching inventory items:", error);
      res.status(500).json({ message: "Erro ao buscar itens" });
    }
  });

  // Get single item (admin and supervisor)
  app.get('/api/inventory/items/:id', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || (user.role !== 'admin' && user.role !== 'superadmin' && user.role !== 'supervisor')) {
        return res.status(403).json({ message: "Acesso negado" });
      }

      const item = await storage.getInventoryItem(parseInt(req.params.id));
      if (!item || item.companyId !== user.companyId) {
        return res.status(404).json({ message: "Item não encontrado" });
      }

      res.json(item);
    } catch (error) {
      console.error("Error fetching inventory item:", error);
      res.status(500).json({ message: "Erro ao buscar item" });
    }
  });

  // Create item (admin only)
  app.post('/api/inventory/items', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
        return res.status(403).json({ message: "Acesso negado - apenas administradores" });
      }

      const item = await storage.createInventoryItem({
        companyId: user.companyId,
        categoryId: req.body.categoryId,
        code: req.body.code,
        name: req.body.name,
        description: req.body.description,
        unit: req.body.unit,
        hasValidity: req.body.hasValidity || false,
        validityMonths: req.body.validityMonths,
        minStock: req.body.minStock || 0,
        isActive: req.body.isActive !== false,
      });

      res.status(201).json(item);
    } catch (error) {
      console.error("Error creating inventory item:", error);
      res.status(500).json({ message: "Erro ao criar item" });
    }
  });

  // Update item (admin only)
  app.put('/api/inventory/items/:id', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
        return res.status(403).json({ message: "Acesso negado - apenas administradores" });
      }

      const item = await storage.updateInventoryItem(parseInt(req.params.id), {
        categoryId: req.body.categoryId,
        code: req.body.code,
        name: req.body.name,
        description: req.body.description,
        unit: req.body.unit,
        hasValidity: req.body.hasValidity,
        validityMonths: req.body.validityMonths,
        minStock: req.body.minStock,
        isActive: req.body.isActive,
      });

      res.json(item);
    } catch (error) {
      console.error("Error updating inventory item:", error);
      res.status(500).json({ message: "Erro ao atualizar item" });
    }
  });

  // Delete item (admin only)
  app.delete('/api/inventory/items/:id', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
        return res.status(403).json({ message: "Acesso negado - apenas administradores" });
      }

      await storage.deleteInventoryItem(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting inventory item:", error);
      res.status(500).json({ message: "Erro ao excluir item" });
    }
  });

  // ===================== INVENTORY STOCK =====================

  // Get current stock (admin and supervisor)
  app.get('/api/inventory/stock', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || (user.role !== 'admin' && user.role !== 'superadmin' && user.role !== 'supervisor')) {
        return res.status(403).json({ message: "Acesso negado" });
      }

      const companyId = user.companyId;
      const stock = await storage.getInventoryStock(companyId);
      res.json(stock);
    } catch (error) {
      console.error("Error fetching inventory stock:", error);
      res.status(500).json({ message: "Erro ao buscar estoque" });
    }
  });

  // Get low stock items (admin and supervisor)
  app.get('/api/inventory/stock/low', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || (user.role !== 'admin' && user.role !== 'superadmin' && user.role !== 'supervisor')) {
        return res.status(403).json({ message: "Acesso negado" });
      }

      const companyId = user.companyId;
      const lowStockItems = await storage.getLowStockItems(companyId);
      res.json(lowStockItems);
    } catch (error) {
      console.error("Error fetching low stock items:", error);
      res.status(500).json({ message: "Erro ao buscar itens com estoque baixo" });
    }
  });

  // ===================== INVENTORY MOVEMENTS =====================

  // Get movements (admin and supervisor)
  app.get('/api/inventory/movements', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || (user.role !== 'admin' && user.role !== 'superadmin' && user.role !== 'supervisor')) {
        return res.status(403).json({ message: "Acesso negado" });
      }

      const companyId = user.companyId;
      const filters: any = {};

      if (req.query.itemId) filters.itemId = parseInt(req.query.itemId);
      if (req.query.type) filters.type = req.query.type;
      if (req.query.startDate) filters.startDate = new Date(req.query.startDate);
      if (req.query.endDate) filters.endDate = new Date(req.query.endDate);

      const movements = await storage.getInventoryMovements(companyId, filters);
      res.json(movements);
    } catch (error) {
      console.error("Error fetching inventory movements:", error);
      res.status(500).json({ message: "Erro ao buscar movimentações" });
    }
  });

  // Create movement (admin only)
  app.post('/api/inventory/movements', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
        return res.status(403).json({ message: "Acesso negado - apenas administradores" });
      }

      const movement = await storage.createInventoryMovement({
        companyId: user.companyId,
        itemId: req.body.itemId,
        type: req.body.type,
        quantity: req.body.quantity,
        reason: req.body.reason,
        referenceId: req.body.referenceId,
        notes: req.body.notes,
        transactionDate: req.body.transactionDate ? new Date(req.body.transactionDate) : undefined,
        createdBy: user.id,
      });

      res.status(201).json(movement);
    } catch (error) {
      console.error("Error creating inventory movement:", error);
      res.status(500).json({ message: "Erro ao criar movimentação" });
    }
  });

  // ===================== EMPLOYEE ITEMS (DISTRIBUTION) =====================

  // Get employee items - for specific employee (admin, supervisor, or employee self)
  app.get('/api/inventory/employee-items', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user) {
        return res.status(403).json({ message: "Acesso negado" });
      }

      const employeeId = req.query.employeeId as string;
      const status = req.query.status as string | undefined;

      // Employee can only see their own items
      if (user.role === 'employee') {
        if (employeeId && employeeId !== user.id) {
          return res.status(403).json({ message: "Acesso negado - você só pode ver seus próprios itens" });
        }
        const items = await storage.getEmployeeItems(user.id, { status });
        return res.json(items);
      }

      // Supervisor can see items from their department
      if (user.role === 'supervisor') {
        if (employeeId) {
          const employee = await storage.getUser(employeeId);
          if (!employee || employee.departmentId !== user.departmentId) {
            return res.status(403).json({ message: "Acesso negado - funcionário não pertence ao seu departamento" });
          }
          const items = await storage.getEmployeeItems(employeeId, { status });
          return res.json(items);
        } else {
          // Return all items from supervisor's department
          const items = await storage.getEmployeeItemsByDepartment(user.departmentId, { status });
          return res.json(items);
        }
      }

      // Admin can see all items
      if (employeeId) {
        const items = await storage.getEmployeeItems(employeeId, { status });
        return res.json(items);
      } else {
        // Return all items from all departments
        const items = await storage.getEmployeeItemsByDepartment(user.departmentId, { status });
        return res.json(items);
      }
    } catch (error) {
      console.error("Error fetching employee items:", error);
      res.status(500).json({ message: "Erro ao buscar itens do funcionário" });
    }
  });

  // Get single employee item (admin, supervisor, or employee self)
  app.get('/api/inventory/employee-items/:id', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user) {
        return res.status(403).json({ message: "Acesso negado" });
      }

      const item = await storage.getEmployeeItem(parseInt(req.params.id));
      if (!item) {
        return res.status(404).json({ message: "Item não encontrado" });
      }

      // Check permissions
      if (user.role === 'employee' && item.employeeId !== user.id) {
        return res.status(403).json({ message: "Acesso negado" });
      }

      if (user.role === 'supervisor') {
        const employee = await storage.getUser(item.employeeId);
        if (!employee || employee.departmentId !== user.departmentId) {
          return res.status(403).json({ message: "Acesso negado - funcionário não pertence ao seu departamento" });
        }
      }

      res.json(item);
    } catch (error) {
      console.error("Error fetching employee item:", error);
      res.status(500).json({ message: "Erro ao buscar item do funcionário" });
    }
  });

  // Distribute items to employee (admin and supervisor)
  app.post('/api/inventory/employee-items', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || (user.role !== 'admin' && user.role !== 'superadmin' && user.role !== 'supervisor')) {
        return res.status(403).json({ message: "Acesso negado" });
      }

      const employeeId = req.body.employeeId;

      // Supervisor can only distribute to employees in their department
      if (user.role === 'supervisor') {
        const employee = await storage.getUser(employeeId);
        if (!employee || employee.departmentId !== user.departmentId) {
          return res.status(403).json({ message: "Acesso negado - funcionário não pertence ao seu departamento" });
        }
      }

      const employeeItem = await storage.createEmployeeItem({
        companyId: user.companyId,
        employeeId: employeeId,
        itemId: req.body.itemId,
        quantity: req.body.quantity,
        deliveryDate: new Date(req.body.deliveryDate),
        expiryDate: req.body.expiryDate ? new Date(req.body.expiryDate) : null,
        deliverySignature: req.body.deliverySignature,
        deliveredBy: user.id,
        status: 'active',
      });

      res.status(201).json(employeeItem);
    } catch (error) {
      console.error("Error distributing item to employee:", error);
      res.status(500).json({ message: "Erro ao distribuir item para funcionário" });
    }
  });

  // Return employee item (admin and supervisor)
  app.put('/api/inventory/employee-items/:id', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || (user.role !== 'admin' && user.role !== 'superadmin' && user.role !== 'supervisor')) {
        return res.status(403).json({ message: "Acesso negado" });
      }

      const item = await storage.getEmployeeItem(parseInt(req.params.id));
      if (!item) {
        return res.status(404).json({ message: "Item não encontrado" });
      }

      // Supervisor can only return items from employees in their department
      if (user.role === 'supervisor') {
        const employee = await storage.getUser(item.employeeId);
        if (!employee || employee.departmentId !== user.departmentId) {
          return res.status(403).json({ message: "Acesso negado - funcionário não pertence ao seu departamento" });
        }
      }

      const updatedItem = await storage.updateEmployeeItem(parseInt(req.params.id), {
        status: req.body.status,
        returnDate: req.body.returnDate ? new Date(req.body.returnDate) : undefined,
        returnSignature: req.body.returnSignature,
        returnReason: req.body.returnReason,
        returnedBy: user.id,
        deliveryDocumentId: req.body.deliveryDocumentId,
        returnDocumentId: req.body.returnDocumentId,
      });

      res.json(updatedItem);
    } catch (error) {
      console.error("Error updating employee item:", error);
      res.status(500).json({ message: "Erro ao atualizar item do funcionário" });
    }
  });

  // Get expiring items (admin and supervisor)
  app.get('/api/inventory/employee-items/expiring/:days', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || (user.role !== 'admin' && user.role !== 'superadmin' && user.role !== 'supervisor')) {
        return res.status(403).json({ message: "Acesso negado" });
      }

      const daysAhead = parseInt(req.params.days);
      const companyId = user.companyId;
      const expiringItems = await storage.getExpiringItems(companyId, daysAhead);

      // Filter by department for supervisors
      if (user.role === 'supervisor') {
        const filteredItems = [];
        for (const item of expiringItems) {
          const employee = await storage.getUser(item.employeeId);
          if (employee && employee.departmentId === user.departmentId) {
            filteredItems.push(item);
          }
        }
        return res.json(filteredItems);
      }

      res.json(expiringItems);
    } catch (error) {
      console.error("Error fetching expiring items:", error);
      res.status(500).json({ message: "Erro ao buscar itens a vencer" });
    }
  });

  // ========================================================================================
  // DISC ASSESSMENT ROUTES
  // ========================================================================================

  // Get all DISC questions (for admins)
  app.get('/api/disc/questions', isAuthenticatedHybrid, requireAdminRole, async (req: any, res) => {
    try {
      const questions = await storage.getActiveDISCQuestions();
      res.json(questions);
    } catch (error: any) {
      console.error("Error fetching DISC questions:", error);
      res.status(500).json({ message: "Erro ao carregar questões DISC" });
    }
  });

  // Create a new DISC assessment (admin only - for sending to candidates)
  app.post('/api/disc/assessments', isAuthenticatedHybrid, requireAdminRole, async (req: any, res) => {
    try {
      const { candidateId, jobOpeningId, applicationId } = req.body;
      
      // Defensive guard: ensure we have a valid userId from claims
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: "Usuário não autenticado corretamente" });
      }

      if (!candidateId || !jobOpeningId) {
        return res.status(400).json({ message: "candidateId e jobOpeningId são obrigatórios" });
      }

      const { generateAccessToken } = await import('./services/discAssessmentService');
      const accessToken = generateAccessToken();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      const assessment = await storage.createDISCAssessment({
        candidateId,
        jobOpeningId,
        applicationId: applicationId || null,
        accessToken,
        status: 'pending',
        expiresAt,
        createdBy: userId,
      });

      res.json(assessment);
    } catch (error: any) {
      console.error("Error creating DISC assessment:", error);
      res.status(500).json({ message: "Erro ao criar avaliação DISC" });
    }
  });

  // Get assessment by token (public route for candidates)
  app.get('/api/disc/assessments/token/:token', async (req, res) => {
    try {
      const { token } = req.params;
      
      const assessment = await storage.getDISCAssessmentByToken(token);
      if (!assessment) {
        return res.status(404).json({ message: "Avaliação não encontrada ou link expirado" });
      }

      if (assessment.expiresAt && new Date() > assessment.expiresAt) {
        return res.status(410).json({ message: "Link expirado" });
      }

      if (assessment.status === 'completed') {
        return res.status(400).json({ message: "Avaliação já concluída" });
      }

      const questions = await storage.getActiveDISCQuestions();

      res.json({
        assessment,
        questions,
      });
    } catch (error: any) {
      console.error("Error fetching assessment by token:", error);
      res.status(500).json({ message: "Erro ao carregar avaliação" });
    }
  });

  // Start assessment (mark as in_progress)
  app.post('/api/disc/assessments/:id/start', async (req, res) => {
    try {
      const assessmentId = parseInt(req.params.id);
      
      const assessment = await storage.getDISCAssessment(assessmentId);
      if (!assessment) {
        return res.status(404).json({ message: "Avaliação não encontrada" });
      }

      if (assessment.status !== 'pending') {
        return res.status(400).json({ message: "Avaliação já iniciada" });
      }

      const updated = await storage.updateDISCAssessment(assessmentId, {
        status: 'in_progress',
        startedAt: new Date(),
      });

      res.json(updated);
    } catch (error: any) {
      console.error("Error starting assessment:", error);
      res.status(500).json({ message: "Erro ao iniciar avaliação" });
    }
  });

  // Submit responses and complete assessment
  app.post('/api/disc/assessments/:id/submit', async (req, res) => {
    try {
      const assessmentId = parseInt(req.params.id);
      const { responses } = req.body;

      if (!Array.isArray(responses) || responses.length === 0) {
        return res.status(400).json({ message: "Respostas são obrigatórias" });
      }

      const assessment = await storage.getDISCAssessment(assessmentId);
      if (!assessment) {
        return res.status(404).json({ message: "Avaliação não encontrada" });
      }

      if (assessment.status === 'completed') {
        return res.status(400).json({ message: "Avaliação já concluída" });
      }

      for (const response of responses) {
        await storage.createDISCResponse({
          assessmentId,
          questionId: response.questionId,
          selectedValue: response.selectedValue,
        });
      }

      const questions = await storage.getActiveDISCQuestions();
      const savedResponses = await storage.getDISCResponses(assessmentId);

      const { calculateDISCScores } = await import('./services/discAssessmentService');
      const scores = calculateDISCScores(questions, savedResponses);

      const completedAssessment = await storage.finalizeDISCAssessment(assessmentId, scores);

      res.json(completedAssessment);
    } catch (error: any) {
      console.error("Error submitting assessment:", error);
      res.status(500).json({ message: "Erro ao enviar respostas" });
    }
  });

  // Get assessment results (admin only)
  app.get('/api/disc/assessments/:id/results', isAuthenticatedHybrid, requireAdminRole, async (req: any, res) => {
    try {
      const assessmentId = parseInt(req.params.id);
      
      const assessment = await storage.getDISCAssessment(assessmentId);
      if (!assessment) {
        return res.status(404).json({ message: "Avaliação não encontrada" });
      }

      const responses = await storage.getDISCResponses(assessmentId);

      const { getProfileDescription, calculateCompatibility } = await import('./services/discAssessmentService');
      
      let compatibility = null;
      if (assessment.jobOpeningId) {
        const jobOpening = await storage.getJobOpening(assessment.jobOpeningId);
        if (jobOpening && jobOpening.idealDISCProfile) {
          compatibility = calculateCompatibility(
            {
              dScore: assessment.dScore || 0,
              iScore: assessment.iScore || 0,
              sScore: assessment.sScore || 0,
              cScore: assessment.cScore || 0,
            },
            jobOpening.idealDISCProfile as any
          );
        }
      }

      const profileDescription = assessment.primaryProfile 
        ? getProfileDescription(assessment.primaryProfile as any)
        : null;

      res.json({
        assessment,
        responses,
        profileDescription,
        compatibility,
      });
    } catch (error: any) {
      console.error("Error fetching assessment results:", error);
      res.status(500).json({ message: "Erro ao carregar resultados" });
    }
  });

  // List all assessments with candidate/job info (admin only)
  app.get('/api/disc/assessments', isAuthenticatedHybrid, requireAdminRole, async (req: any, res) => {
    try {
      const { db } = storage as any;
      const { discAssessments, candidates, jobOpenings } = await import('shared/schema');
      const { eq } = await import('drizzle-orm');

      const assessments = await db
        .select({
          id: discAssessments.id,
          status: discAssessments.status,
          accessToken: discAssessments.accessToken,
          expiresAt: discAssessments.expiresAt,
          startedAt: discAssessments.startedAt,
          completedAt: discAssessments.completedAt,
          dScore: discAssessments.dScore,
          iScore: discAssessments.iScore,
          sScore: discAssessments.sScore,
          cScore: discAssessments.cScore,
          primaryProfile: discAssessments.primaryProfile,
          jobOpeningId: discAssessments.jobOpeningId,
          candidateId: discAssessments.candidateId,
          candidate: candidates,
          jobOpening: jobOpenings,
        })
        .from(discAssessments)
        .leftJoin(candidates, eq(discAssessments.candidateId, candidates.id))
        .leftJoin(jobOpenings, eq(discAssessments.jobOpeningId, jobOpenings.id))
        .orderBy(discAssessments.id);

      res.json(assessments);
    } catch (error: any) {
      console.error("Error fetching all assessments:", error);
      res.status(500).json({ message: "Erro ao carregar avaliações" });
    }
  });

  // List assessments by job opening (admin only)
  app.get('/api/disc/assessments/job/:jobOpeningId', isAuthenticatedHybrid, requireAdminRole, async (req: any, res) => {
    try {
      const jobOpeningId = parseInt(req.params.jobOpeningId);
      const assessments = await storage.getDISCAssessmentsByJobOpening(jobOpeningId);
      res.json(assessments);
    } catch (error: any) {
      console.error("Error fetching assessments:", error);
      res.status(500).json({ message: "Erro ao carregar avaliações" });
    }
  });

  // List assessments by candidate (admin only)
  app.get('/api/disc/assessments/candidate/:candidateId', isAuthenticatedHybrid, requireAdminRole, async (req: any, res) => {
    try {
      const candidateId = parseInt(req.params.candidateId);
      const assessments = await storage.getDISCAssessmentsByCandidate(candidateId);
      res.json(assessments);
    } catch (error: any) {
      console.error("Error fetching assessments:", error);
      res.status(500).json({ message: "Erro ao carregar avaliações" });
    }
  });

  // ========== ABSENCE MANAGEMENT ROUTES ==========
  
  // Upload absence document (employee)
  app.post('/api/absences/upload', isAuthenticatedHybrid, absenceUpload.single('file'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Nenhum arquivo enviado" });
      }

      // Return the file path that can be used in the absence creation
      const filePath = `/uploads/absences/${req.file.filename}`;
      res.status(200).json({ 
        filePath,
        filename: req.file.originalname,
        message: "Arquivo enviado com sucesso" 
      });
    } catch (error: any) {
      console.error("Error uploading absence document:", error);
      res.status(500).json({ message: "Erro ao fazer upload do documento" });
    }
  });
  
  // Get absences (employee or admin or superadmin)
  app.get('/api/absences', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const user = req.user;
      const { status, type, startDate, endDate, companyId } = req.query;
      
      let absences;
      if (user.role === 'superadmin') {
        // Superadmin: can view all absences, optionally filtered by companyId
        const filters: any = {};
        if (status) filters.status = status;
        if (type) filters.type = type;
        if (startDate) filters.startDate = new Date(startDate);
        if (endDate) filters.endDate = new Date(endDate);
        
        if (companyId) {
          absences = await storage.getAbsencesByCompany(parseInt(companyId), filters);
        } else {
          // TODO: Implement getAll absences for superadmin, for now return empty
          absences = [];
        }
      } else if (user.role === 'admin') {
        // Admin: get all absences for their company with filters
        const filters: any = {};
        if (status) filters.status = status;
        if (type) filters.type = type;
        if (startDate) filters.startDate = new Date(startDate);
        if (endDate) filters.endDate = new Date(endDate);
        
        absences = await storage.getAbsencesByCompany(user.companyId, filters);
      } else {
        // Employee: get only their own absences
        absences = await storage.getAbsencesByEmployee(user.id);
      }
      
      res.json(absences);
    } catch (error: any) {
      console.error("Error fetching absences:", error);
      res.status(500).json({ message: "Erro ao buscar ausências" });
    }
  });
  
  // Get pending absences (admin only)
  app.get('/api/absences/pending', isAuthenticatedHybrid, requireAdminRole, async (req: any, res) => {
    try {
      const { companyId } = req.user;
      const absences = await storage.getPendingAbsences(companyId);
      res.json(absences);
    } catch (error: any) {
      console.error("Error fetching pending absences:", error);
      res.status(500).json({ message: "Erro ao buscar ausências pendentes" });
    }
  });
  
  // Get specific absence
  app.get('/api/absences/:id', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const absence = await storage.getAbsence(id);
      
      if (!absence) {
        return res.status(404).json({ message: "Ausência não encontrada" });
      }
      
      // Check access: only owner or admin
      if (req.user.role !== 'admin' && absence.employeeId !== req.user.id) {
        return res.status(403).json({ message: "Acesso negado" });
      }
      
      res.json(absence);
    } catch (error: any) {
      console.error("Error fetching absence:", error);
      res.status(500).json({ message: "Erro ao buscar ausência" });
    }
  });
  
  // Create absence request
  app.post('/api/absences', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const { insertAbsenceSchema } = await import('shared/schema');
      const validatedData = insertAbsenceSchema.parse(req.body);
      
      // Ensure employee creates for themselves
      const absenceData = {
        ...validatedData,
        employeeId: req.user.id,
        companyId: req.user.companyId,
        status: 'pending' as const,
      };
      
      const newAbsence = await storage.createAbsence(absenceData);
      
      // TODO: Send notifications (email + internal message) to HR/Admin
      
      res.status(201).json(newAbsence);
    } catch (error: any) {
      console.error("Error creating absence:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Erro ao criar solicitação de ausência" });
    }
  });
  
  // Update absence (only if pending)
  app.put('/api/absences/:id', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const { updateAbsenceSchema } = await import('shared/schema');
      const id = parseInt(req.params.id);
      const absence = await storage.getAbsence(id);
      
      if (!absence) {
        return res.status(404).json({ message: "Ausência não encontrada" });
      }
      
      // Only owner can update and only if pending
      if (absence.employeeId !== req.user.id) {
        return res.status(403).json({ message: "Acesso negado" });
      }
      
      if (absence.status !== 'pending') {
        return res.status(400).json({ message: "Apenas solicitações pendentes podem ser editadas" });
      }
      
      // Validate update data
      const validatedData = updateAbsenceSchema.parse(req.body);
      const updatedAbsence = await storage.updateAbsence(id, validatedData);
      res.json(updatedAbsence);
    } catch (error: any) {
      console.error("Error updating absence:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Erro ao atualizar ausência" });
    }
  });
  
  // Approve absence (admin only)
  app.post('/api/absences/:id/approve', isAuthenticatedHybrid, requireAdminRole, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const approvedBy = req.user.id;
      
      const absence = await storage.getAbsence(id);
      if (!absence) {
        return res.status(404).json({ message: "Ausência não encontrada" });
      }
      
      // Verify company ownership (except superadmin)
      if (req.user.role !== 'superadmin' && absence.companyId !== req.user.companyId) {
        return res.status(403).json({ message: "Acesso negado: ausência de outra empresa" });
      }
      
      if (absence.status !== 'pending') {
        return res.status(400).json({ message: "Apenas solicitações pendentes podem ser aprovadas" });
      }
      
      const updatedAbsence = await storage.approveAbsence(id, approvedBy);
      
      // TODO: Send notification (email + internal message) to employee
      
      res.json(updatedAbsence);
    } catch (error: any) {
      console.error("Error approving absence:", error);
      res.status(500).json({ message: error.message || "Erro ao aprovar ausência" });
    }
  });
  
  // Reject absence (admin only)
  app.post('/api/absences/:id/reject', isAuthenticatedHybrid, requireAdminRole, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const approvedBy = req.user.id;
      const { rejectionReason } = req.body;
      
      if (!rejectionReason) {
        return res.status(400).json({ message: "Motivo da rejeição é obrigatório" });
      }
      
      const absence = await storage.getAbsence(id);
      if (!absence) {
        return res.status(404).json({ message: "Ausência não encontrada" });
      }
      
      // Verify company ownership (except superadmin)
      if (req.user.role !== 'superadmin' && absence.companyId !== req.user.companyId) {
        return res.status(403).json({ message: "Acesso negado: ausência de outra empresa" });
      }
      
      if (absence.status !== 'pending') {
        return res.status(400).json({ message: "Apenas solicitações pendentes podem ser rejeitadas" });
      }
      
      const updatedAbsence = await storage.rejectAbsence(id, approvedBy, rejectionReason);
      
      // TODO: Send notification (email + internal message) to employee
      
      res.json(updatedAbsence);
    } catch (error: any) {
      console.error("Error rejecting absence:", error);
      res.status(500).json({ message: "Erro ao rejeitar ausência" });
    }
  });
  
  // Cancel absence
  app.post('/api/absences/:id/cancel', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const absence = await storage.getAbsence(id);
      
      if (!absence) {
        return res.status(404).json({ message: "Ausência não encontrada" });
      }
      
      // Only owner, admin of same company, or superadmin can cancel
      const isOwner = absence.employeeId === req.user.id;
      const isAdminSameCompany = req.user.role === 'admin' && absence.companyId === req.user.companyId;
      const isSuperadmin = req.user.role === 'superadmin';
      
      if (!isOwner && !isAdminSameCompany && !isSuperadmin) {
        return res.status(403).json({ message: "Acesso negado" });
      }
      
      const updatedAbsence = await storage.cancelAbsence(id);
      res.json(updatedAbsence);
    } catch (error: any) {
      console.error("Error cancelling absence:", error);
      res.status(500).json({ message: error.message || "Erro ao cancelar ausência" });
    }
  });
  
  // Get vacation balance for employee
  app.get('/api/vacation-balance/:employeeId', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const { employeeId } = req.params;
      
      // Check access: only own data or admin
      if (req.user.role !== 'admin' && employeeId !== req.user.id) {
        return res.status(403).json({ message: "Acesso negado" });
      }
      
      let balance = await storage.getVacationBalance(employeeId);
      
      // If balance doesn't exist, calculate and create it
      if (!balance) {
        balance = await storage.createOrUpdateVacationBalance(employeeId, req.user.companyId);
      }
      
      res.json(balance);
    } catch (error: any) {
      console.error("Error fetching vacation balance:", error);
      res.status(500).json({ message: error.message || "Erro ao buscar saldo de férias" });
    }
  });
  
  // Recalculate vacation balance (admin only)
  app.post('/api/vacation-balance/:employeeId/calculate', isAuthenticatedHybrid, requireAdminRole, async (req: any, res) => {
    try {
      const { employeeId } = req.params;
      const balance = await storage.createOrUpdateVacationBalance(employeeId, req.user.companyId);
      res.json(balance);
    } catch (error: any) {
      console.error("Error recalculating vacation balance:", error);
      res.status(500).json({ message: error.message || "Erro ao recalcular saldo de férias" });
    }
  });

  // Temporary endpoint to download database dump
  app.get('/download-dump', (req, res) => {
    const dumpPath = path.join(process.cwd(), 'rhnet-database-dump.sql.gz');
    if (fs.existsSync(dumpPath)) {
      res.download(dumpPath, 'rhnet-database-dump.sql.gz');
    } else {
      res.status(404).send('Dump file not found');
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
