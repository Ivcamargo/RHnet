import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  insertDepartmentSchema, 
  clockInSchema, 
  clockOutSchema, 
  insertFaceProfileSchema,
  insertCompanySchema,
  insertHolidaySchema,
  type ClockInRequest,
  type ClockOutRequest
} from "@shared/schema";
import { z } from "zod";

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

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

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

  // Department routes
  app.get('/api/departments', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.companyId) {
        return res.status(400).json({ message: "User must be assigned to a company" });
      }
      
      const departments = await storage.getDepartmentsByCompany(user.companyId);
      res.json(departments);
    } catch (error) {
      console.error("Error fetching departments:", error);
      res.status(500).json({ message: "Failed to fetch departments" });
    }
  });

  app.post('/api/departments', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin') {
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
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.companyId) {
        return res.status(400).json({ message: "User must be assigned to a company" });
      }
      
      const id = parseInt(req.params.id);
      const department = await storage.getDepartment(id);
      if (!department) {
        return res.status(404).json({ message: "Department not found" });
      }
      
      // CRITICAL SECURITY: Verify department belongs to user's company
      if (department.companyId !== user.companyId) {
        return res.status(403).json({ message: "Access denied: department not accessible" });
      }
      
      const stats = await storage.getDepartmentStats(id);
      res.json({ ...department, stats });
    } catch (error) {
      console.error("Error fetching department:", error);
      res.status(500).json({ message: "Failed to fetch department" });
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
      
      if (!['employee', 'admin', 'superadmin'].includes(role)) {
        return res.status(400).json({ message: "Invalid role. Must be employee, admin, or superadmin" });
      }

      // If assigning admin or employee role, companyId is required
      if (role !== 'superadmin' && !companyId) {
        return res.status(400).json({ message: "Company ID is required for admin and employee roles" });
      }

      // If assigning superadmin role, companyId should be null
      const updateData: any = { role };
      if (role === 'superadmin') {
        updateData.companyId = null;
        updateData.departmentId = null;
      } else {
        updateData.companyId = companyId;
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
      if (user?.role !== 'admin') {
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
      if (user?.role !== 'admin') {
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
      if (user?.role !== 'admin') {
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
      if (user?.role !== 'admin') {
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
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      if (!user?.companyId) {
        return res.status(400).json({ message: "User must be assigned to a company" });
      }

      const holidayData = insertHolidaySchema.parse(req.body);
      // Force companyId to be the user's company - security critical
      holidayData.companyId = user.companyId;
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
      if (user?.role !== 'admin') {
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
      if (user?.role !== 'admin') {
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

  // User management routes
  app.get('/api/users', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      if (!user?.companyId) {
        return res.status(400).json({ message: "Admin must be assigned to a company" });
      }

      const users = await storage.getUsersByCompany(user.companyId);
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
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

  // User management routes (admin only)
  app.get('/api/admin/users', isAuthenticated, async (req: any, res) => {
    try {
      const currentUser = await storage.getUser(req.user.claims.sub);
      if (currentUser?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const users = await storage.getAllUsers();
      
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
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.put('/api/admin/users/:id', isAuthenticated, async (req: any, res) => {
    try {
      const currentUser = await storage.getUser(req.user.claims.sub);
      if (currentUser?.role !== 'admin') {
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

  const httpServer = createServer(app);
  return httpServer;
}
