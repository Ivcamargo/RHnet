import type { Express } from "express";
import { createServer, type Server } from "http";
import path from "path";
import fs from "fs";
import { storage } from "./storage";
import { setupAuth } from "./replitAuth";
import { setupLocalAuth, isAuthenticatedHybrid } from "./localAuth";
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
  insertSupervisorAssignmentSchema,
  insertFaceProfileSchema,
  insertTimePeriodSchema,
  type ClockInRequest,
  type ClockOutRequest,
  type InsertMessage,
  type InsertMessageCategory,
  type InsertDocument,
  type InsertCourse,
  type InsertEmployeeCourse,
  type InsertCertificate,
  type InsertCompleteEmployee,
  type InsertAuditLog,
  type InsertSector,
  type InsertDepartmentShift,
  type InsertSupervisorAssignment,
  type InsertFaceProfile,
  type InsertTimePeriod
} from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import { getBrazilianTime, getBrazilianDateString } from "../shared/timezone";

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
      success: true, // Mark as successful
      createdAt: new Date(),
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
  
  // 2. Subtract automatic unpaid breaks (from department shift configuration)
  if (timeEntry.departmentId) {
    const shifts = await storage.getDepartmentShifts(timeEntry.departmentId);
    
    for (const shift of shifts) {
      const shiftBreaks = await storage.getShiftBreaks(shift.id);
      
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
              const matchingManualBreak = manualBreaks.find(mb => 
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
  departmentId: number,
  storage: Storage
): Promise<number> {
  try {
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
  departmentId: number, 
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
  await setupAuth(app);
  setupLocalAuth(app);

  // Configure multer for file uploads
  const upload = multer({
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
      const breakData = insertDepartmentShiftBreakSchema.parse({
        ...req.body,
        shiftId
      });
      
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
      
      if (!user || !user.departmentId || !user.companyId) {
        return res.status(400).json({ message: "User must be assigned to a department and company" });
      }

      // Check if user is already clocked in
      const activeEntry = await storage.getActiveTimeEntry(userId);
      if (activeEntry) {
        return res.status(400).json({ message: "Already clocked in" });
      }

      const { latitude, longitude, faceRecognitionData }: ClockInRequest = clockInSchema.parse(req.body);
      
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
      
      // Get department for geofence validation
      const department = await storage.getDepartment(user.departmentId);
      if (!department) {
        return res.status(400).json({ message: "Department not found" });
      }

      // Validate geolocation
      const distance = calculateDistance(latitude, longitude, department.latitude, department.longitude);
      const radius = department.radius || 100; // Default to 100m if null
      if (distance > radius) {
        return res.status(400).json({ 
          message: "Outside allowed location", 
          distance: Math.round(distance),
          maxDistance: radius 
        });
      }

      // Process facial recognition data
      const faceRecognitionVerified = !!faceRecognitionData;
      const clockInPhotoUrl = faceRecognitionData?.photoUrl || null;

      const timeEntry = await storage.createTimeEntry({
        userId,
        departmentId: user.departmentId,
        clockInTime: now,
        clockInLatitude: latitude,
        clockInLongitude: longitude,
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
          faceRecognitionVerified
        },
        userId
      );

      res.json(timeEntry);
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
      
      if (!user || !user.departmentId || !user.companyId) {
        return res.status(400).json({ message: "User must be assigned to a department and company" });
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

      const { latitude, longitude, faceRecognitionData }: ClockOutRequest = clockOutSchema.parse(req.body);
      
      // Get department for geofence validation
      const department = await storage.getDepartment(user.departmentId);
      if (!department) {
        return res.status(400).json({ message: "Department not found" });
      }

      // Validate geolocation
      const distance = calculateDistance(latitude, longitude, department.latitude, department.longitude);
      const radius = department.radius || 100; // Default to 100m if null
      if (distance > radius) {
        return res.status(400).json({ 
          message: "Outside allowed location", 
          distance: Math.round(distance),
          maxDistance: radius 
        });
      }

      const now = getBrazilianTime();
      const grossHours = calculateHours(new Date(activeEntry.clockInTime!), now);

      // First, update the time entry with clock-out info and gross hours
      const timeEntryWithClockOut = await storage.updateTimeEntry(activeEntry.id, {
        clockOutTime: now,
        clockOutLatitude: latitude,
        clockOutLongitude: longitude,
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
          totalHours: grossHours.toString()
        },
        userId
      );

      res.json(updatedEntry);
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
      const userId = req.user.claims.sub;
      const { year, month } = req.query;
      
      if (!year || !month) {
        return res.status(400).json({ message: "Year and month are required" });
      }
      
      const stats = await storage.getUserMonthlyStats(
        userId, 
        parseInt(year as string), 
        parseInt(month as string)
      );
      
      // Get detailed entries for the month
      const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
      const endDate = `${year}-${month.toString().padStart(2, '0')}-31`;
      const entries = await storage.getTimeEntriesByUser(userId, startDate, endDate);
      
      res.json({
        stats,
        entries,
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
      
      // Create uploads directory if it doesn't exist
      const fs = require('fs');
      const path = require('path');
      const uploadsDir = path.join(process.cwd(), 'uploads', 'face-captures');
      
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      
      // Generate unique filename
      const filename = `face_${userId}_${Date.now()}.jpg`;
      const filepath = path.join(uploadsDir, filename);
      
      // Convert base64 to buffer and save file
      const imageBuffer = Buffer.from(image, 'base64');
      fs.writeFileSync(filepath, imageBuffer);
      
      // Generate photo URL (relative path for serving)
      const photoUrl = `/uploads/face-captures/${filename}`;
      
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
    const userRole = req.user.claims.role;
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
      
      // Create new user with complete employee data
      const userData = {
        id: userId,
        ...employeeData,
        isActive: true,
      };
      
      const newUser = await storage.upsertUser(userData);
      
      // Get department info if assigned
      let department = null;
      if (newUser.departmentId) {
        department = await storage.getDepartment(newUser.departmentId);
      }
      
      res.status(201).json({ ...newUser, department });
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
      
      // Handle mass messages or specific recipient
      if (messageData.recipientId === 'all' || messageData.isMassMessage) {
        // Get all employees in the company
        const employees = await storage.getCompanyEmployees(user.companyId);
        for (const employee of employees) {
          if (employee.id !== userId) { // Don't send to sender
            await storage.createMessageRecipient({
              messageId: message.id,
              userId: employee.id,
              isDelivered: true,
              deliveredAt: new Date().toISOString()
            });
          }
        }
      } else if (messageData.recipientId) {
        // Send to specific recipient
        await storage.createMessageRecipient({
          messageId: message.id,
          userId: messageData.recipientId,
          isDelivered: true,
          deliveredAt: new Date().toISOString()
        });
      }

      res.status(201).json(message);
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

  // Get users (for recipient selection)
  app.get('/api/users', isAuthenticatedHybrid, async (req: any, res) => {
    try {
      const scope = await getUserScope(req.user.claims.sub);
      
      if (!scope.user) {
        return res.status(404).json({ message: "User not found" });
      }

      let users;
      if (scope.type === 'superadmin') {
        users = await storage.getAllUsers();
      } else if (scope.type === 'admin') {
        users = await storage.getCompanyEmployees(scope.companyId!);
      } else if (scope.type === 'supervisor') {
        // Supervisors can only see users from their assigned sectors
        users = await storage.getUsersByScope(scope.companyId, scope.departmentIds!);
      } else {
        // Employees can see all users in their company (for recipient selection)
        users = await storage.getCompanyEmployees(scope.companyId!);
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
      const title = req.body.title || req.file.originalname;
      const mimeType = req.file.mimetype;

      // Validate with schema (excluding generated fields)
      const documentData: InsertDocument = insertDocumentSchema.parse({
        title,
        content: `[File: ${req.file.originalname}, Size: ${req.file.size} bytes]`,
        mimeType,
        companyId: user.companyId,
        uploadedBy: userId,
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

  // Note: Static file serving for uploads will be added separately

  const httpServer = createServer(app);
  return httpServer;
}
