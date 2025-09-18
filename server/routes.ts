import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
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
  insertAuditLogSchema,
  insertSectorSchema,
  insertDepartmentShiftSchema,
  insertSupervisorAssignmentSchema,
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
  type InsertSupervisorAssignment
} from "@shared/schema";
import { z } from "zod";
import multer from "multer";

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
  // Auth middleware
  await setupAuth(app);

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

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Get department info if user has one
      let department = null;
      if (user.departmentId) {
        department = await storage.getDepartment(user.departmentId);
      }
      
      // Get company info if user has one
      let company = null;
      if (user.companyId) {
        company = await storage.getCompany(user.companyId);
      }
      
      res.json({ ...user, department, company });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

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
  app.get('/api/departments', isAuthenticated, async (req: any, res) => {
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

  app.post('/api/departments', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin' && user?.role !== 'superadmin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      if (!user?.companyId) {
        return res.status(400).json({ message: "User must be assigned to a company" });
      }

      const departmentData = insertDepartmentSchema.parse(req.body);
      // Force companyId to be the user's company - security critical
      departmentData.companyId = user.companyId;
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

  app.get('/api/departments/:id', isAuthenticated, async (req: any, res) => {
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
  app.get('/api/sectors', isAuthenticated, async (req: any, res) => {
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
  app.post('/api/sectors', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin' && user?.role !== 'superadmin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      if (!user?.companyId) {
        return res.status(400).json({ message: "User must be assigned to a company" });
      }

      // Add user's companyId to request body before validation - security critical
      const bodyWithCompanyId = {
        ...req.body,
        companyId: user.companyId
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
  app.put('/api/sectors/:id', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin' && user?.role !== 'superadmin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      if (!user?.companyId) {
        return res.status(400).json({ message: "User must be assigned to a company" });
      }

      const id = parseInt(req.params.id);
      const sector = await storage.getSector(id);
      if (!sector) {
        return res.status(404).json({ message: "Sector not found" });
      }
      
      // CRITICAL SECURITY: Verify sector belongs to user's company
      if (sector.companyId !== user.companyId) {
        return res.status(403).json({ message: "Access denied: sector not accessible" });
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

  // ==== DEPARTMENT SHIFT ROUTES ====
  
  // Get shifts for a department
  app.get('/api/departments/:id/shifts', isAuthenticated, async (req: any, res) => {
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
  app.post('/api/departments/:id/shifts', isAuthenticated, async (req: any, res) => {
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

      const shiftData = insertDepartmentShiftSchema.parse(req.body);
      shiftData.departmentId = departmentId;
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
  app.put('/api/department-shifts/:id', isAuthenticated, async (req: any, res) => {
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
      
      const shiftData = insertDepartmentShiftSchema.partial().parse(req.body);
      // Prevent departmentId modification
      delete shiftData.departmentId;
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
  app.delete('/api/department-shifts/:id', isAuthenticated, async (req: any, res) => {
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
  app.get('/api/supervisor-assignments', isAuthenticated, async (req: any, res) => {
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
  app.get('/api/admin/supervisor-assignments', isAuthenticated, async (req: any, res) => {
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
  app.post('/api/supervisor-assignments', isAuthenticated, async (req: any, res) => {
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
  app.delete('/api/supervisor-assignments', isAuthenticated, async (req: any, res) => {
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
  app.post('/api/claim-superadmin', isAuthenticated, async (req: any, res) => {
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
  app.get('/api/superadmin/companies', isAuthenticated, async (req: any, res) => {
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

  app.post('/api/superadmin/companies', isAuthenticated, async (req: any, res) => {
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

  app.get('/api/superadmin/users', isAuthenticated, async (req: any, res) => {
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

  app.put('/api/superadmin/users/:id/role', isAuthenticated, async (req: any, res) => {
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

  app.put('/api/superadmin/companies/:id', isAuthenticated, async (req: any, res) => {
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

  app.get('/api/superadmin/companies/:id/users', isAuthenticated, async (req: any, res) => {
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
  app.get('/api/companies', isAuthenticated, async (req: any, res) => {
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

  app.post('/api/companies', isAuthenticated, async (req: any, res) => {
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

  app.get('/api/companies/:id', isAuthenticated, async (req: any, res) => {
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

  app.put('/api/companies/:id', isAuthenticated, async (req: any, res) => {
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
  app.get('/api/holidays', isAuthenticated, async (req: any, res) => {
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

  app.post('/api/holidays', isAuthenticated, async (req: any, res) => {
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

  app.put('/api/holidays/:id', isAuthenticated, async (req: any, res) => {
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

  app.delete('/api/holidays/:id', isAuthenticated, async (req: any, res) => {
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

  app.get('/api/holidays/check/:date', isAuthenticated, async (req: any, res) => {
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
  app.get('/api/admin/users', isAuthenticated, async (req: any, res) => {
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

  app.put('/api/users/:id/company', isAuthenticated, async (req: any, res) => {
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
  app.get('/api/time-clock/status', isAuthenticated, async (req: any, res) => {
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

  app.post('/api/time-clock/clock-in', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || !user.departmentId) {
        return res.status(400).json({ message: "User must be assigned to a department" });
      }

      // Check if user is already clocked in
      const activeEntry = await storage.getActiveTimeEntry(userId);
      if (activeEntry) {
        return res.status(400).json({ message: "Already clocked in" });
      }

      const { latitude, longitude, faceRecognitionData }: ClockInRequest = clockInSchema.parse(req.body);
      
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

      // Mock facial recognition validation (would be replaced with real implementation)
      const faceRecognitionVerified = !!faceRecognitionData;

      const now = new Date();
      const today = now.toISOString().split('T')[0];

      const timeEntry = await storage.createTimeEntry({
        userId,
        departmentId: user.departmentId,
        clockInTime: now,
        clockInLatitude: latitude,
        clockInLongitude: longitude,
        faceRecognitionVerified,
        date: today,
        status: 'active',
      });

      res.json(timeEntry);
    } catch (error) {
      console.error("Error clocking in:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid clock in data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to clock in" });
    }
  });

  app.post('/api/time-clock/clock-out', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || !user.departmentId) {
        return res.status(400).json({ message: "User must be assigned to a department" });
      }

      // Check if user is clocked in
      const activeEntry = await storage.getActiveTimeEntry(userId);
      if (!activeEntry) {
        return res.status(400).json({ message: "Not currently clocked in" });
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

      const now = new Date();
      const totalHours = calculateHours(new Date(activeEntry.clockInTime!), now);

      const updatedEntry = await storage.updateTimeEntry(activeEntry.id, {
        clockOutTime: now,
        clockOutLatitude: latitude,
        clockOutLongitude: longitude,
        totalHours: totalHours.toString(),
        status: 'completed',
      });

      res.json(updatedEntry);
    } catch (error) {
      console.error("Error clocking out:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid clock out data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to clock out" });
    }
  });

  // Time entries and reports
  app.get('/api/time-entries', isAuthenticated, async (req: any, res) => {
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

  app.get('/api/reports/monthly', isAuthenticated, async (req: any, res) => {
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
  app.get('/api/face-profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const profile = await storage.getFaceProfile(userId);
      res.json(profile);
    } catch (error) {
      console.error("Error fetching face profile:", error);
      res.status(500).json({ message: "Failed to fetch face profile" });
    }
  });

  app.post('/api/face-profile', isAuthenticated, async (req: any, res) => {
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


  app.put('/api/admin/users/:id', isAuthenticated, async (req: any, res) => {
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
  app.delete('/api/admin/users/:id', isAuthenticated, async (req: any, res) => {
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
  app.post('/api/admin/users/:id/hard-delete', isAuthenticated, async (req: any, res) => {
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
  app.post('/api/admin/users', isAuthenticated, async (req: any, res) => {
    try {
      const currentUser = await storage.getUser(req.user.claims.sub);
      if (currentUser?.role !== 'admin' && currentUser?.role !== 'superadmin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      if (!currentUser?.companyId) {
        return res.status(400).json({ message: "Admin must be assigned to a company" });
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

      // Set companyId from current user
      requestData.companyId = currentUser.companyId;

      const validationResult = insertCompleteEmployeeSchema.safeParse(requestData);
      if (!validationResult.success) {
        console.error("Employee validation error:", validationResult.error.errors);
        return res.status(400).json({ 
          message: "Invalid employee data", 
          errors: validationResult.error.errors 
        });
      }

      const employeeData = validationResult.data;
      
      // Validate department belongs to current user's company
      if (employeeData.departmentId) {
        const department = await storage.getDepartment(employeeData.departmentId);
        if (!department || department.companyId !== currentUser.companyId) {
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
  app.put('/api/admin/users/:id', isAuthenticated, async (req: any, res) => {
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
      const updateEmployeeSchema = insertCompleteEmployeeSchema.partial().extend({
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

      // Validate department belongs to current user's company
      if (updateData.departmentId) {
        const department = await storage.getDepartment(updateData.departmentId);
        if (!department || department.companyId !== currentUser.companyId) {
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
  app.get('/api/dashboard/stats', isAuthenticated, async (req: any, res) => {
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

  // ===== MESSAGE ROUTES =====
  
  // Get messages for current user based on type (inbox, sent, archived)
  app.get('/api/messages/:type', isAuthenticated, async (req: any, res) => {
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
  app.get('/api/messages', isAuthenticated, async (req: any, res) => {
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
  app.post('/api/messages', isAuthenticated, async (req: any, res) => {
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
  app.patch('/api/messages/:id/read', isAuthenticated, async (req: any, res) => {
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
  app.get('/api/message-categories', isAuthenticated, async (req: any, res) => {
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
  app.post('/api/message-categories', isAuthenticated, async (req: any, res) => {
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
  app.get('/api/users', isAuthenticated, async (req: any, res) => {
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
  app.get('/api/documents', isAuthenticated, async (req: any, res) => {
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
  app.get('/api/documents/:id', isAuthenticated, async (req: any, res) => {
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
  app.post('/api/documents/upload', isAuthenticated, upload.single('file'), async (req: any, res) => {
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
  app.post('/api/documents', isAuthenticated, async (req: any, res) => {
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
  app.put('/api/documents/:id', isAuthenticated, async (req: any, res) => {
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
  app.delete('/api/documents/:id', isAuthenticated, async (req: any, res) => {
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
  app.get('/api/courses', isAuthenticated, async (req: any, res) => {
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
  app.get('/api/courses/:id', isAuthenticated, async (req: any, res) => {
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
  app.post('/api/courses', isAuthenticated, async (req: any, res) => {
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
  app.get('/api/employee-courses', isAuthenticated, async (req: any, res) => {
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
  app.post('/api/employee-courses/start', isAuthenticated, async (req: any, res) => {
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
  app.put('/api/employee-courses/progress', isAuthenticated, async (req: any, res) => {
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
  app.post('/api/employee-courses/complete', isAuthenticated, async (req: any, res) => {
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
  app.get('/api/certificates', isAuthenticated, async (req: any, res) => {
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
  app.post('/api/certificates', isAuthenticated, async (req: any, res) => {
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
  app.put('/api/certificates/:id/verify', isAuthenticated, async (req: any, res) => {
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

  const httpServer = createServer(app);
  return httpServer;
}
