import {
  users,
  departments,
  sectors,
  departmentShifts,
  supervisorAssignments,
  timeEntries,
  breakEntries,
  faceProfiles,
  companies,
  holidays,
  messages,
  messageCategories,
  messageRecipients,
  documents,
  courses,
  employeeCourses,
  certificates,
  auditLog,
  timePeriods,
  type User,
  type UpsertUser,
  type Department,
  type InsertDepartment,
  type Sector,
  type InsertSector,
  type DepartmentShift,
  type InsertDepartmentShift,
  type SupervisorAssignment,
  type InsertSupervisorAssignment,
  type TimeEntry,
  type Company,
  type InsertCompany,
  type Holiday,
  type InsertHoliday,
  type Message,
  type InsertMessage,
  type MessageCategory,
  type InsertMessageCategory,
  type MessageRecipient,
  type InsertMessageRecipient,
  type Document,
  type InsertDocument,
  type Course,
  type InsertCourse,
  type EmployeeCourse,
  type InsertEmployeeCourse,
  type Certificate,
  type InsertCertificate,
  type AuditLog,
  type InsertAuditLog,
  type TimePeriod,
  type InsertTimePeriod,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, isNull, desc, gte, lte, sql } from "drizzle-orm";

// Local type aliases for tables that don't have exported types
type InsertTimeEntry = typeof timeEntries.$inferInsert;
type BreakEntry = typeof breakEntries.$inferSelect;
type InsertBreakEntry = typeof breakEntries.$inferInsert;
type FaceProfile = typeof faceProfiles.$inferSelect;
type InsertFaceProfile = typeof faceProfiles.$inferInsert;

// Supervisor scope type for access control
type SupervisorScope = {
  companyId: number;
  sectorIds: number[];
  departmentIds: number[];
};

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  getUsersByCompany(companyId: number): Promise<User[]>;
  updateUser(id: string, user: Partial<UpsertUser>): Promise<User>;
  updateUserCompany(userId: string, companyId: number): Promise<void>;
  canHardDeleteUser(id: string): Promise<{allowed: boolean; dependencies: Record<string, number>}>;
  deleteUserPermanently(id: string): Promise<void>;
  
  // Department operations
  getDepartments(): Promise<Department[]>;
  getDepartmentsByCompany(companyId: number): Promise<Department[]>;
  getDepartment(id: number): Promise<Department | undefined>;
  createDepartment(department: InsertDepartment): Promise<Department>;
  updateDepartment(id: number, department: Partial<InsertDepartment>): Promise<Department>;
  
  // Sector operations
  getSectors(): Promise<Sector[]>;
  getSectorsByCompany(companyId: number): Promise<Sector[]>;
  getSector(id: number): Promise<Sector | undefined>;
  createSector(sector: InsertSector): Promise<Sector>;
  updateSector(id: number, sector: Partial<InsertSector>): Promise<Sector>;
  deleteSector(id: number): Promise<void>;
  
  // Department shift operations
  getDepartmentShifts(departmentId: number): Promise<DepartmentShift[]>;
  getDepartmentShift(id: number): Promise<DepartmentShift | undefined>;
  createDepartmentShift(shift: InsertDepartmentShift): Promise<DepartmentShift>;
  updateDepartmentShift(id: number, shift: Partial<InsertDepartmentShift>): Promise<DepartmentShift>;
  deleteDepartmentShift(id: number): Promise<void>;
  
  // Supervisor assignment operations
  getSupervisorAssignments(supervisorId: string): Promise<SupervisorAssignment[]>;
  getSupervisorsBySector(sectorId: number): Promise<SupervisorAssignment[]>;
  getAllCompanySupervisorAssignments(companyId: number): Promise<(SupervisorAssignment & { supervisor: User; sector: Sector })[]>;
  createSupervisorAssignment(assignment: InsertSupervisorAssignment): Promise<SupervisorAssignment>;
  deleteSupervisorAssignment(supervisorId: string, sectorId: number): Promise<void>;
  
  // Access control and scope operations
  getSupervisorScope(userId: string): Promise<SupervisorScope | null>;
  getUsersByScope(companyId: number, departmentIds: number[]): Promise<User[]>;
  getDepartmentsByScope(departmentIds: number[]): Promise<Department[]>;
  
  // Time entry operations
  getActiveTimeEntry(userId: string): Promise<TimeEntry | undefined>;
  createTimeEntry(timeEntry: InsertTimeEntry): Promise<TimeEntry>;
  updateTimeEntry(id: number, timeEntry: Partial<InsertTimeEntry>): Promise<TimeEntry>;
  getTimeEntriesByUser(userId: string, startDate?: string, endDate?: string): Promise<TimeEntry[]>;
  getTimeEntriesByDateRange(startDate: string, endDate: string): Promise<TimeEntry[]>;
  
  // Manual time entry operations
  createManualTimeEntry(timeEntry: InsertTimeEntry): Promise<TimeEntry>;
  getPendingTimeEntries(companyId: number): Promise<TimeEntry[]>;
  getTimeEntriesForApproval(supervisorId: string): Promise<TimeEntry[]>;
  approveTimeEntry(entryId: number, supervisorId: string): Promise<TimeEntry>;
  rejectTimeEntry(entryId: number, supervisorId: string, reason: string): Promise<TimeEntry>;
  
  // Break entry operations
  createBreakEntry(breakEntry: InsertBreakEntry): Promise<BreakEntry>;
  updateBreakEntry(id: number, breakEntry: Partial<InsertBreakEntry>): Promise<BreakEntry>;
  getBreakEntriesByTimeEntry(timeEntryId: number): Promise<BreakEntry[]>;
  
  // Face profile operations
  getFaceProfile(userId: string): Promise<FaceProfile | undefined>;
  createFaceProfile(faceProfile: InsertFaceProfile): Promise<FaceProfile>;
  updateFaceProfile(userId: string, faceProfile: Partial<InsertFaceProfile>): Promise<FaceProfile>;
  
  // Company operations
  getCompanies(): Promise<Company[]>;
  getCompany(id: number): Promise<Company | undefined>;
  createCompany(company: InsertCompany): Promise<Company>;
  updateCompany(id: number, company: Partial<InsertCompany>): Promise<Company>;
  
  // Holiday operations
  getHolidays(companyId: number): Promise<Holiday[]>;
  getHoliday(id: number): Promise<Holiday | undefined>;
  createHoliday(holiday: InsertHoliday): Promise<Holiday>;
  updateHoliday(id: number, holiday: Partial<InsertHoliday>): Promise<Holiday>;
  deleteHoliday(id: number): Promise<void>;
  isHoliday(date: string, companyId: number): Promise<boolean>;
  
  // Statistics and reports
  getUserMonthlyStats(userId: string, year: number, month: number): Promise<{
    totalHours: number;
    totalDays: number;
    averageHours: number;
  }>;
  getDepartmentStats(departmentId: number): Promise<{
    totalEmployees: number;
    activeEmployees: number;
  }>;
  
  // Message operations
  getReceivedMessages(userId: string, companyId: number): Promise<any[]>;
  getSentMessages(userId: string, companyId: number): Promise<any[]>;
  getArchivedMessages(userId: string, companyId: number): Promise<any[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  createMessageRecipient(recipient: InsertMessageRecipient): Promise<MessageRecipient>;
  markMessageAsRead(messageId: number, userId: string): Promise<void>;
  getMessageCategories(companyId: number): Promise<MessageCategory[]>;
  createMessageCategory(category: InsertMessageCategory): Promise<MessageCategory>;
  getCompanyEmployees(companyId: number): Promise<User[]>;
  
  // Document operations
  getDocuments(companyId: number, userId?: string): Promise<Document[]>;
  getDocument(id: number): Promise<Document | undefined>;
  createDocument(document: InsertDocument): Promise<Document>;
  updateDocument(id: number, document: Partial<InsertDocument>): Promise<Document>;
  deleteDocument(id: number): Promise<void>;
  getDocumentsByCategory(companyId: number, category: string): Promise<Document[]>;
  getDocumentsAssignedToUser(userId: string): Promise<Document[]>;
  
  // Course operations
  getCourses(companyId: number): Promise<Course[]>;
  getCourse(id: number): Promise<Course | undefined>;
  createCourse(course: InsertCourse): Promise<Course>;
  updateCourse(id: number, course: Partial<InsertCourse>): Promise<Course>;
  deleteCourse(id: number): Promise<void>;
  getRequiredCourses(companyId: number): Promise<Course[]>;
  
  // Employee course operations
  getEmployeeCourses(userId: string, companyId: number): Promise<EmployeeCourse[]>;
  getEmployeeCourse(userId: string, courseId: number): Promise<EmployeeCourse | undefined>;
  createEmployeeCourse(employeeCourse: InsertEmployeeCourse): Promise<EmployeeCourse>;
  updateEmployeeCourse(id: number, employeeCourse: Partial<InsertEmployeeCourse>): Promise<EmployeeCourse>;
  startCourse(userId: string, courseId: number, companyId: number): Promise<EmployeeCourse>;
  updateCourseProgress(userId: string, courseId: number, progress: number): Promise<EmployeeCourse>;
  completeCourse(userId: string, courseId: number, score?: number): Promise<EmployeeCourse>;
  
  // Certificate operations
  getCertificates(userId: string, companyId: number): Promise<Certificate[]>;
  getCertificate(id: number): Promise<Certificate | undefined>;
  createCertificate(certificate: InsertCertificate): Promise<Certificate>;
  verifyCertificate(id: number, verifiedBy: string): Promise<Certificate>;
  
  // Audit operations
  createAuditLog(auditEntry: InsertAuditLog): Promise<AuditLog>;
  getAuditLogs(companyId?: number, targetUserId?: string, action?: string): Promise<AuditLog[]>;
  getAuditLog(companyId?: number, filters?: {
    limit?: number;
    offset?: number;
    action?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<AuditLog[]>;
  
  // Time period operations
  getTimePeriods(companyId: number): Promise<TimePeriod[]>;
  getTimePeriod(id: number): Promise<TimePeriod | undefined>;
  createTimePeriod(period: InsertTimePeriod): Promise<TimePeriod>;
  closeTimePeriod(id: number, closedBy: string, reason: string): Promise<TimePeriod>;
  reopenTimePeriod(id: number, reopenedBy: string, reason: string): Promise<TimePeriod>;
  canModifyTimeEntries(companyId: number, date: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(users.firstName, users.lastName);
  }

  async updateUser(id: string, userData: Partial<UpsertUser>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...userData, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async canHardDeleteUser(id: string): Promise<{allowed: boolean; dependencies: Record<string, number>}> {
    // First check if user exists and is inactive
    const user = await this.getUser(id);
    if (!user) {
      return { allowed: false, dependencies: { user: 0 } };
    }
    
    if (user.isActive) {
      return { allowed: false, dependencies: { activeUser: 1 } };
    }
    
    // Count dependencies across all related tables
    const dependencies: Record<string, number> = {};
    
    // Check time entries - these prevent deletion as they contain historical work data
    const [timeEntriesCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(timeEntries)
      .where(eq(timeEntries.userId, id));
    dependencies.timeEntries = Number(timeEntriesCount?.count) || 0;
    
    // Check face profiles - these prevent deletion as they contain biometric data
    const [faceProfilesCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(faceProfiles)
      .where(eq(faceProfiles.userId, id));
    dependencies.faceProfiles = Number(faceProfilesCount?.count) || 0;
    
    // Check messages sent - these prevent deletion to maintain message history
    const [messagesSentCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(messages)
      .where(eq(messages.senderId, id));
    dependencies.messagesSent = Number(messagesSentCount?.count) || 0;
    
    // Check message recipients - these prevent deletion to maintain message history
    const [messageRecipientsCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(messageRecipients)
      .where(eq(messageRecipients.userId, id));
    dependencies.messageRecipients = Number(messageRecipientsCount?.count) || 0;
    
    // Check documents uploaded - documents will be nullified, not deleted, so they don't block deletion
    const [documentsCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(documents)
      .where(eq(documents.uploadedBy, id));
    dependencies.documents = Number(documentsCount?.count) || 0;
    
    // Check employee courses - these prevent deletion as they contain training history
    const [employeeCoursesCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(employeeCourses)
      .where(eq(employeeCourses.userId, id));
    dependencies.employeeCourses = Number(employeeCoursesCount?.count) || 0;
    
    // Check certificates - these prevent deletion as they contain certification records
    const [certificatesCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(certificates)
      .where(eq(certificates.userId, id));
    dependencies.certificates = Number(certificatesCount?.count) || 0;
    
    // User can be hard deleted if no BLOCKING dependencies exist
    // Documents don't block deletion since they're nullified, not deleted
    const blockingDependencies = { ...dependencies };
    delete blockingDependencies.documents; // Documents don't block deletion
    
    const totalBlockingDependencies = Object.values(blockingDependencies).reduce((sum, count) => sum + count, 0);
    const allowed = totalBlockingDependencies === 0;
    
    return { allowed, dependencies };
  }

  async deleteUserPermanently(id: string): Promise<void> {
    // Execute all deletions in a transaction for atomicity
    await db.transaction(async (tx) => {
      // Note: Only call this method after confirming canHardDeleteUser returns true
      // Delete in order of dependencies (child records first, then parent)
      
      // Delete break entries (tied to time entries) - use type-safe subquery
      const userTimeEntries = await tx.select({ id: timeEntries.id })
        .from(timeEntries)
        .where(eq(timeEntries.userId, id));
      
      if (userTimeEntries.length > 0) {
        const timeEntryIds = userTimeEntries.map(entry => entry.id);
        for (const timeEntryId of timeEntryIds) {
          await tx.delete(breakEntries)
            .where(eq(breakEntries.timeEntryId, timeEntryId));
        }
      }
      
      // Delete time entries
      await tx.delete(timeEntries)
        .where(eq(timeEntries.userId, id));
      
      // Delete face profiles
      await tx.delete(faceProfiles)
        .where(eq(faceProfiles.userId, id));
      
      // Delete message recipients
      await tx.delete(messageRecipients)
        .where(eq(messageRecipients.userId, id));
      
      // Delete messages sent by user
      await tx.delete(messages)
        .where(eq(messages.senderId, id));
      
      // Delete employee courses
      await tx.delete(employeeCourses)
        .where(eq(employeeCourses.userId, id));
      
      // Delete certificates
      await tx.delete(certificates)
        .where(eq(certificates.userId, id));
      
      // Update documents to remove reference (instead of deleting them)
      // This preserves document history while removing user reference
      await tx.update(documents)
        .set({ uploadedBy: sql`NULL` })
        .where(eq(documents.uploadedBy, id));
      
      // Finally, delete the user record
      await tx.delete(users)
        .where(eq(users.id, id));
    });
  }

  // Department operations
  async getDepartments(): Promise<Department[]> {
    return await db.select().from(departments).where(eq(departments.isActive, true));
  }

  async getDepartmentsByCompany(companyId: number): Promise<Department[]> {
    return await db.select().from(departments).where(
      and(
        eq(departments.companyId, companyId),
        eq(departments.isActive, true)
      )
    );
  }

  async getDepartment(id: number): Promise<Department | undefined> {
    const [department] = await db.select().from(departments).where(eq(departments.id, id));
    return department;
  }

  async createDepartment(department: InsertDepartment): Promise<Department> {
    const [newDepartment] = await db.insert(departments).values(department).returning();
    return newDepartment;
  }

  async updateDepartment(id: number, department: Partial<InsertDepartment>): Promise<Department> {
    const [updatedDepartment] = await db
      .update(departments)
      .set({ ...department, updatedAt: new Date() })
      .where(eq(departments.id, id))
      .returning();
    return updatedDepartment;
  }

  // Sector operations
  async getSectors(): Promise<Sector[]> {
    return await db.select().from(sectors).where(eq(sectors.isActive, true));
  }

  async getSectorsByCompany(companyId: number): Promise<Sector[]> {
    return await db.select().from(sectors).where(
      and(
        eq(sectors.companyId, companyId),
        eq(sectors.isActive, true)
      )
    );
  }

  async getSector(id: number): Promise<Sector | undefined> {
    const [sector] = await db.select().from(sectors).where(eq(sectors.id, id));
    return sector;
  }

  async createSector(sector: InsertSector): Promise<Sector> {
    const [newSector] = await db.insert(sectors).values(sector).returning();
    return newSector;
  }

  async updateSector(id: number, sector: Partial<InsertSector>): Promise<Sector> {
    const [updatedSector] = await db
      .update(sectors)
      .set({ ...sector, updatedAt: new Date() })
      .where(eq(sectors.id, id))
      .returning();
    return updatedSector;
  }

  async deleteSector(id: number): Promise<void> {
    // Check if sector has any departments
    const departmentsInSector = await db
      .select()
      .from(departments)
      .where(eq(departments.sectorId, id));
    
    if (departmentsInSector.length > 0) {
      throw new Error("Cannot delete sector: sector has departments assigned");
    }
    
    // Check if sector has any supervisor assignments
    const supervisorAssignmentsInSector = await db
      .select()
      .from(supervisorAssignments)
      .where(eq(supervisorAssignments.sectorId, id));
    
    if (supervisorAssignmentsInSector.length > 0) {
      throw new Error("Cannot delete sector: sector has supervisor assignments");
    }
    
    const [deleted] = await db
      .delete(sectors)
      .where(eq(sectors.id, id))
      .returning();
    
    if (!deleted) {
      throw new Error("Sector not found");
    }
  }

  // Department shift operations
  async getDepartmentShifts(departmentId: number): Promise<DepartmentShift[]> {
    console.log('=== STORAGE DEBUG - getDepartmentShifts called ===');
    console.log('Department ID received:', departmentId);
    
    const result = await db.select().from(departmentShifts).where(
      and(
        eq(departmentShifts.departmentId, departmentId),
        eq(departmentShifts.isActive, true)
      )
    );
    
    console.log('Raw DB result:', result);
    console.log('Result length:', result.length);
    console.log('First result keys:', Object.keys(result[0] || {}));
    console.log('First result sample:', result[0]);
    console.log('=== END STORAGE DEBUG ===');
    
    return result;
  }

  async getDepartmentShift(id: number): Promise<DepartmentShift | undefined> {
    const [shift] = await db.select().from(departmentShifts).where(eq(departmentShifts.id, id));
    return shift;
  }

  async createDepartmentShift(shift: InsertDepartmentShift): Promise<DepartmentShift> {
    const [newShift] = await db.insert(departmentShifts).values(shift).returning();
    return newShift;
  }

  async updateDepartmentShift(id: number, shift: Partial<InsertDepartmentShift>): Promise<DepartmentShift> {
    const [updatedShift] = await db
      .update(departmentShifts)
      .set({ ...shift, updatedAt: new Date() })
      .where(eq(departmentShifts.id, id))
      .returning();
    return updatedShift;
  }

  async deleteDepartmentShift(id: number): Promise<void> {
    await db.delete(departmentShifts).where(eq(departmentShifts.id, id));
  }

  // Supervisor assignment operations
  async getSupervisorAssignments(supervisorId: string): Promise<SupervisorAssignment[]> {
    return await db.select().from(supervisorAssignments).where(eq(supervisorAssignments.supervisorId, supervisorId));
  }

  async getSupervisorsBySector(sectorId: number): Promise<SupervisorAssignment[]> {
    return await db.select().from(supervisorAssignments).where(eq(supervisorAssignments.sectorId, sectorId));
  }

  async getAllCompanySupervisorAssignments(companyId: number): Promise<(SupervisorAssignment & { supervisor: User; sector: Sector })[]> {
    const result = await db
      .select()
      .from(supervisorAssignments)
      .innerJoin(users, eq(supervisorAssignments.supervisorId, users.id))
      .innerJoin(sectors, eq(supervisorAssignments.sectorId, sectors.id))
      .where(eq(sectors.companyId, companyId));

    return result.map(row => ({
      id: row.supervisor_assignments.id,
      supervisorId: row.supervisor_assignments.supervisorId,
      sectorId: row.supervisor_assignments.sectorId,
      createdAt: row.supervisor_assignments.createdAt,
      supervisor: row.users,
      sector: row.sectors,
    }));
  }

  async createSupervisorAssignment(assignment: InsertSupervisorAssignment): Promise<SupervisorAssignment> {
    // Validate company consistency - supervisor and sector must be in same company
    const [supervisor] = await db.select({ companyId: users.companyId }).from(users).where(eq(users.id, assignment.supervisorId));
    const [sector] = await db.select({ companyId: sectors.companyId }).from(sectors).where(eq(sectors.id, assignment.sectorId));
    
    if (!supervisor || !sector) {
      throw new Error("Supervisor or sector not found");
    }
    
    if (supervisor.companyId !== sector.companyId) {
      throw new Error("Supervisor and sector must be in the same company");
    }
    
    const [newAssignment] = await db.insert(supervisorAssignments).values(assignment).returning();
    return newAssignment;
  }

  async deleteSupervisorAssignment(supervisorId: string, sectorId: number): Promise<void> {
    await db.delete(supervisorAssignments).where(
      and(
        eq(supervisorAssignments.supervisorId, supervisorId),
        eq(supervisorAssignments.sectorId, sectorId)
      )
    );
  }

  // Access control and scope operations
  async getSupervisorScope(userId: string): Promise<SupervisorScope | null> {
    // Get supervisor assignments and related data
    const assignments = await db
      .select({
        sectorId: supervisorAssignments.sectorId,
        companyId: sectors.companyId,
      })
      .from(supervisorAssignments)
      .innerJoin(sectors, eq(supervisorAssignments.sectorId, sectors.id))
      .where(eq(supervisorAssignments.supervisorId, userId));

    if (assignments.length === 0) {
      return null;
    }

    const companyId = assignments[0].companyId;
    const sectorIds = assignments.map(a => a.sectorId);

    // Get all department IDs in the supervisor's sectors
    const depts = await db
      .select({ id: departments.id })
      .from(departments)
      .where(
        and(
          eq(departments.companyId, companyId),
          sql`${departments.sectorId} = ANY(${sectorIds})`
        )
      );

    const departmentIds = depts.map(d => d.id);

    return {
      companyId,
      sectorIds,
      departmentIds,
    };
  }

  async getUsersByScope(companyId: number, departmentIds: number[]): Promise<User[]> {
    if (departmentIds.length === 0) {
      return [];
    }
    
    let conditions = [
      eq(users.companyId, companyId), 
      eq(users.isActive, true),
      sql`${users.departmentId} = ANY(${departmentIds})`
    ];

    return await db
      .select()
      .from(users)
      .where(and(...conditions))
      .orderBy(users.firstName, users.lastName);
  }

  async getDepartmentsByScope(departmentIds: number[]): Promise<Department[]> {
    if (departmentIds.length === 0) {
      return [];
    }
    
    return await db
      .select()
      .from(departments)
      .where(
        and(
          sql`${departments.id} = ANY(${departmentIds})`,
          eq(departments.isActive, true)
        )
      );
  }

  // Time entry operations
  async getActiveTimeEntry(userId: string): Promise<TimeEntry | undefined> {
    const [entry] = await db
      .select()
      .from(timeEntries)
      .where(and(eq(timeEntries.userId, userId), eq(timeEntries.status, "active")))
      .orderBy(desc(timeEntries.createdAt));
    return entry;
  }

  async createTimeEntry(timeEntry: InsertTimeEntry): Promise<TimeEntry> {
    const [newEntry] = await db.insert(timeEntries).values(timeEntry).returning();
    return newEntry;
  }

  async updateTimeEntry(id: number, timeEntry: Partial<InsertTimeEntry>): Promise<TimeEntry> {
    const [updatedEntry] = await db
      .update(timeEntries)
      .set({ ...timeEntry, updatedAt: new Date() })
      .where(eq(timeEntries.id, id))
      .returning();
    return updatedEntry;
  }

  async getTimeEntriesByUser(userId: string, startDate?: string, endDate?: string): Promise<TimeEntry[]> {
    let conditions = [eq(timeEntries.userId, userId)];
    
    if (startDate && endDate) {
      conditions.push(gte(timeEntries.date, startDate));
      conditions.push(lte(timeEntries.date, endDate));
    }
    
    return await db
      .select()
      .from(timeEntries)
      .where(and(...conditions))
      .orderBy(desc(timeEntries.date));
  }

  async getTimeEntriesByDateRange(startDate: string, endDate: string): Promise<TimeEntry[]> {
    return await db
      .select()
      .from(timeEntries)
      .where(and(gte(timeEntries.date, startDate), lte(timeEntries.date, endDate)))
      .orderBy(desc(timeEntries.date));
  }

  // Manual time entry operations
  async createManualTimeEntry(timeEntry: InsertTimeEntry): Promise<TimeEntry> {
    const [newEntry] = await db.insert(timeEntries).values({
      ...timeEntry,
      entryType: 'manual_insertion',
      approvalStatus: 'pending',
    }).returning();
    return newEntry;
  }

  async getPendingTimeEntries(companyId: number): Promise<TimeEntry[]> {
    return await db
      .select()
      .from(timeEntries)
      .leftJoin(users, eq(timeEntries.userId, users.id))
      .where(and(
        eq(timeEntries.approvalStatus, 'pending'),
        eq(users.companyId, companyId)
      ))
      .orderBy(desc(timeEntries.createdAt));
  }

  async getTimeEntriesForApproval(supervisorId: string): Promise<TimeEntry[]> {
    // Get supervisor scope to determine which entries they can approve
    const scope = await this.getSupervisorScope(supervisorId);
    if (!scope) return [];

    return await db
      .select()
      .from(timeEntries)
      .leftJoin(users, eq(timeEntries.userId, users.id))
      .leftJoin(departments, eq(timeEntries.departmentId, departments.id))
      .where(and(
        eq(timeEntries.approvalStatus, 'pending'),
        sql`${departments.id} = ANY(${scope.departmentIds})`,
        eq(users.companyId, scope.companyId)
      ))
      .orderBy(desc(timeEntries.createdAt));
  }

  async approveTimeEntry(entryId: number, supervisorId: string): Promise<TimeEntry> {
    const [updatedEntry] = await db
      .update(timeEntries)
      .set({ 
        approvalStatus: 'approved',
        approvedBy: supervisorId,
        updatedAt: new Date()
      })
      .where(eq(timeEntries.id, entryId))
      .returning();
    return updatedEntry;
  }

  async rejectTimeEntry(entryId: number, supervisorId: string, reason: string): Promise<TimeEntry> {
    const [updatedEntry] = await db
      .update(timeEntries)
      .set({ 
        approvalStatus: 'rejected',
        approvedBy: supervisorId,
        justification: reason,
        updatedAt: new Date()
      })
      .where(eq(timeEntries.id, entryId))
      .returning();
    return updatedEntry;
  }

  // Break entry operations
  async createBreakEntry(breakEntry: InsertBreakEntry): Promise<BreakEntry> {
    const [newBreakEntry] = await db.insert(breakEntries).values(breakEntry).returning();
    return newBreakEntry;
  }

  async updateBreakEntry(id: number, breakEntry: Partial<InsertBreakEntry>): Promise<BreakEntry> {
    const [updatedBreakEntry] = await db
      .update(breakEntries)
      .set(breakEntry)
      .where(eq(breakEntries.id, id))
      .returning();
    return updatedBreakEntry;
  }

  async getBreakEntriesByTimeEntry(timeEntryId: number): Promise<BreakEntry[]> {
    return await db.select().from(breakEntries).where(eq(breakEntries.timeEntryId, timeEntryId));
  }

  // Face profile operations
  async getFaceProfile(userId: string): Promise<FaceProfile | undefined> {
    const [profile] = await db.select().from(faceProfiles).where(eq(faceProfiles.userId, userId));
    return profile;
  }

  async createFaceProfile(faceProfile: InsertFaceProfile): Promise<FaceProfile> {
    const [newProfile] = await db.insert(faceProfiles).values(faceProfile).returning();
    return newProfile;
  }

  async updateFaceProfile(userId: string, faceProfile: Partial<InsertFaceProfile>): Promise<FaceProfile> {
    const [updatedProfile] = await db
      .update(faceProfiles)
      .set({ ...faceProfile, updatedAt: new Date() })
      .where(eq(faceProfiles.userId, userId))
      .returning();
    return updatedProfile;
  }

  // Statistics and reports
  async getUserMonthlyStats(userId: string, year: number, month: number): Promise<{
    totalHours: number;
    totalDays: number;
    averageHours: number;
  }> {
    const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
    const endDate = `${year}-${month.toString().padStart(2, '0')}-31`;
    
    const entries = await this.getTimeEntriesByUser(userId, startDate, endDate);
    const completedEntries = entries.filter(entry => entry.status === 'completed' && entry.totalHours);
    
    const totalHours = completedEntries.reduce((sum, entry) => {
      return sum + (parseFloat(entry.totalHours || '0'));
    }, 0);
    
    const totalDays = completedEntries.length;
    const averageHours = totalDays > 0 ? totalHours / totalDays : 0;
    
    return {
      totalHours,
      totalDays,
      averageHours,
    };
  }

  async getDepartmentStats(departmentId: number): Promise<{
    totalEmployees: number;
    activeEmployees: number;
  }> {
    const [stats] = await db
      .select({
        totalEmployees: sql<number>`count(*)`,
        activeEmployees: sql<number>`count(case when ${users.isActive} then 1 end)`,
      })
      .from(users)
      .where(eq(users.departmentId, departmentId));
    
    return stats || { totalEmployees: 0, activeEmployees: 0 };
  }

  // Company operations
  async getCompanies(): Promise<Company[]> {
    return await db.select().from(companies).where(eq(companies.isActive, true));
  }

  async getCompany(id: number): Promise<Company | undefined> {
    const [company] = await db.select().from(companies).where(eq(companies.id, id));
    return company;
  }

  async createCompany(company: InsertCompany): Promise<Company> {
    const [newCompany] = await db.insert(companies).values(company).returning();
    return newCompany;
  }

  async updateCompany(id: number, company: Partial<InsertCompany>): Promise<Company> {
    const [updatedCompany] = await db
      .update(companies)
      .set({ ...company, updatedAt: new Date() })
      .where(eq(companies.id, id))
      .returning();
    return updatedCompany;
  }

  // Holiday operations
  async getHolidays(companyId: number): Promise<Holiday[]> {
    return await db.select().from(holidays).where(
      and(
        eq(holidays.companyId, companyId),
        eq(holidays.isActive, true)
      )
    );
  }

  async getHoliday(id: number): Promise<Holiday | undefined> {
    const [holiday] = await db.select().from(holidays).where(eq(holidays.id, id));
    return holiday;
  }

  async createHoliday(holiday: InsertHoliday): Promise<Holiday> {
    const [newHoliday] = await db.insert(holidays).values(holiday).returning();
    return newHoliday;
  }

  async updateHoliday(id: number, holiday: Partial<InsertHoliday>): Promise<Holiday> {
    const [updatedHoliday] = await db
      .update(holidays)
      .set({ ...holiday, updatedAt: new Date() })
      .where(eq(holidays.id, id))
      .returning();
    return updatedHoliday;
  }

  async deleteHoliday(id: number): Promise<void> {
    await db.update(holidays).set({ isActive: false }).where(eq(holidays.id, id));
  }

  async isHoliday(date: string, companyId: number): Promise<boolean> {
    // Check for exact date match
    const [exactHoliday] = await db
      .select()
      .from(holidays)
      .where(
        and(
          eq(holidays.companyId, companyId),
          eq(holidays.date, date),
          eq(holidays.isActive, true)
        )
      );
    
    if (exactHoliday) {
      return true;
    }
    
    // Check for recurring holidays (same month and day)
    if (date) {
      const [, month, day] = date.split('-').map(Number);
      const recurringHolidays = await db
        .select()
        .from(holidays)
        .where(
          and(
            eq(holidays.companyId, companyId),
            eq(holidays.isRecurring, true),
            eq(holidays.isActive, true)
          )
        );
      
      for (const holiday of recurringHolidays) {
        if (holiday.date) {
          const [, holidayMonth, holidayDay] = holiday.date.split('-').map(Number);
          if (month === holidayMonth && day === holidayDay) {
            return true;
          }
        }
      }
    }
    
    return false;
  }

  // Message operations
  async getReceivedMessages(userId: string, companyId: number): Promise<any[]> {
    const results = await db
      .select({
        // Message fields
        id: messages.id,
        subject: messages.subject,
        content: messages.content,
        priority: messages.priority,
        isMassMessage: messages.isMassMessage,
        createdAt: messages.createdAt,
        updatedAt: messages.updatedAt,
        senderId: messages.senderId,
        categoryId: messages.categoryId,
        companyId: messages.companyId,
        // Sender info
        senderName: sql<string>`CONCAT(${users.firstName}, ' ', ${users.lastName})`,
        senderEmail: users.email,
        // Category info
        categoryName: messageCategories.name,
        categoryColor: messageCategories.color,
        // Recipient status
        isRead: messageRecipients.isRead,
        readAt: messageRecipients.readAt,
        isDelivered: messageRecipients.isDelivered,
        deliveredAt: messageRecipients.deliveredAt,
      })
      .from(messageRecipients)
      .leftJoin(messages, eq(messageRecipients.messageId, messages.id))
      .leftJoin(users, eq(messages.senderId, users.id))
      .leftJoin(messageCategories, eq(messages.categoryId, messageCategories.id))
      .where(
        and(
          eq(messageRecipients.userId, userId),
          eq(messages.companyId, companyId),
          eq(messageRecipients.isDeleted, false)
        )
      )
      .orderBy(desc(messages.createdAt));

    return results;
  }

  async getSentMessages(userId: string, companyId: number): Promise<any[]> {
    const results = await db
      .select({
        // Message fields
        id: messages.id,
        subject: messages.subject,
        content: messages.content,
        priority: messages.priority,
        isMassMessage: messages.isMassMessage,
        createdAt: messages.createdAt,
        updatedAt: messages.updatedAt,
        senderId: messages.senderId,
        categoryId: messages.categoryId,
        companyId: messages.companyId,
        // Sender info (current user)
        senderName: sql<string>`CONCAT(${users.firstName}, ' ', ${users.lastName})`,
        senderEmail: users.email,
        // Category info
        categoryName: messageCategories.name,
        categoryColor: messageCategories.color,
        // For sent messages, we don't have recipient status
        isRead: sql<boolean>`null`,
        readAt: sql<string>`null`,
        isDelivered: sql<boolean>`true`,
        deliveredAt: messages.createdAt,
      })
      .from(messages)
      .leftJoin(messageCategories, eq(messages.categoryId, messageCategories.id))
      .leftJoin(users, eq(messages.senderId, users.id))
      .where(
        and(
          eq(messages.senderId, userId),
          eq(messages.companyId, companyId)
        )
      )
      .orderBy(desc(messages.createdAt));

    return results;
  }

  async getArchivedMessages(userId: string, companyId: number): Promise<any[]> {
    // Archived messages are received messages that user has deleted/archived
    const results = await db
      .select({
        // Message fields
        id: messages.id,
        subject: messages.subject,
        content: messages.content,
        priority: messages.priority,
        isMassMessage: messages.isMassMessage,
        createdAt: messages.createdAt,
        updatedAt: messages.updatedAt,
        senderId: messages.senderId,
        categoryId: messages.categoryId,
        companyId: messages.companyId,
        // Sender info
        senderName: sql<string>`CONCAT(${users.firstName}, ' ', ${users.lastName})`,
        senderEmail: users.email,
        // Category info
        categoryName: messageCategories.name,
        categoryColor: messageCategories.color,
        // Recipient status
        isRead: messageRecipients.isRead,
        readAt: messageRecipients.readAt,
        isDelivered: messageRecipients.isDelivered,
        deliveredAt: messageRecipients.deliveredAt,
      })
      .from(messageRecipients)
      .leftJoin(messages, eq(messageRecipients.messageId, messages.id))
      .leftJoin(users, eq(messages.senderId, users.id))
      .leftJoin(messageCategories, eq(messages.categoryId, messageCategories.id))
      .where(
        and(
          eq(messageRecipients.userId, userId),
          eq(messages.companyId, companyId),
          eq(messageRecipients.isDeleted, true)
        )
      )
      .orderBy(desc(messageRecipients.deletedAt));

    return results;
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const [createdMessage] = await db
      .insert(messages)
      .values(message)
      .returning();
    return createdMessage;
  }

  async createMessageRecipient(recipient: InsertMessageRecipient): Promise<MessageRecipient> {
    const [createdRecipient] = await db
      .insert(messageRecipients)
      .values(recipient)
      .returning();
    return createdRecipient;
  }

  async markMessageAsRead(messageId: number, userId: string): Promise<void> {
    await db
      .update(messageRecipients)
      .set({ 
        isRead: true, 
        readAt: new Date() 
      })
      .where(
        and(
          eq(messageRecipients.messageId, messageId),
          eq(messageRecipients.userId, userId)
        )
      );
  }

  async getMessageCategories(companyId: number): Promise<MessageCategory[]> {
    return await db
      .select()
      .from(messageCategories)
      .where(eq(messageCategories.companyId, companyId))
      .orderBy(messageCategories.name);
  }

  async createMessageCategory(category: InsertMessageCategory): Promise<MessageCategory> {
    const [createdCategory] = await db
      .insert(messageCategories)
      .values(category)
      .returning();
    return createdCategory;
  }

  async getCompanyEmployees(companyId: number): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.companyId, companyId),
          eq(users.isActive, true)
        )
      )
      .orderBy(users.firstName, users.lastName);
  }

  // User management methods
  async getUsersByCompany(companyId: number): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .where(eq(users.companyId, companyId))
      .orderBy(desc(users.isActive), users.firstName, users.lastName);
  }

  async updateUserCompany(userId: string, companyId: number): Promise<void> {
    await db
      .update(users)
      .set({ companyId, updatedAt: new Date() })
      .where(eq(users.id, userId));
  }

  // Document operations
  async getDocuments(companyId: number, userId?: string): Promise<Document[]> {
    if (userId) {
      // Filter documents assigned to user or general documents
      return await db
        .select()
        .from(documents)
        .where(
          and(
            eq(documents.companyId, companyId),
            eq(documents.isActive, true),
            or(
              eq(documents.assignedTo, userId),
              isNull(documents.assignedTo)
            )
          )
        )
        .orderBy(desc(documents.createdAt));
    }
    
    // Return all company documents if no user specified
    return await db
      .select()
      .from(documents)
      .where(
        and(
          eq(documents.companyId, companyId),
          eq(documents.isActive, true)
        )
      )
      .orderBy(desc(documents.createdAt));
  }

  async getDocument(id: number): Promise<Document | undefined> {
    const [document] = await db.select().from(documents).where(eq(documents.id, id));
    return document;
  }

  async createDocument(document: InsertDocument): Promise<Document> {
    const [newDocument] = await db.insert(documents).values(document).returning();
    return newDocument;
  }

  async updateDocument(id: number, document: Partial<InsertDocument>): Promise<Document> {
    const [updatedDocument] = await db
      .update(documents)
      .set({ ...document, updatedAt: new Date() })
      .where(eq(documents.id, id))
      .returning();
    return updatedDocument;
  }

  async deleteDocument(id: number): Promise<void> {
    await db.update(documents).set({ isActive: false }).where(eq(documents.id, id));
  }

  async getDocumentsByCategory(companyId: number, category: string): Promise<Document[]> {
    return await db
      .select()
      .from(documents)
      .where(
        and(
          eq(documents.companyId, companyId),
          eq(documents.category, category),
          eq(documents.isActive, true)
        )
      )
      .orderBy(desc(documents.createdAt));
  }

  async getDocumentsAssignedToUser(userId: string): Promise<Document[]> {
    return await db
      .select()
      .from(documents)
      .where(
        and(
          eq(documents.assignedTo, userId),
          eq(documents.isActive, true)
        )
      )
      .orderBy(desc(documents.createdAt));
  }

  // Course operations
  async getCourses(companyId: number): Promise<Course[]> {
    return await db
      .select()
      .from(courses)
      .where(
        and(
          eq(courses.companyId, companyId),
          eq(courses.isActive, true)
        )
      )
      .orderBy(courses.title);
  }

  async getCourse(id: number): Promise<Course | undefined> {
    const [course] = await db.select().from(courses).where(eq(courses.id, id));
    return course;
  }

  async createCourse(course: InsertCourse): Promise<Course> {
    const [newCourse] = await db.insert(courses).values(course).returning();
    return newCourse;
  }

  async updateCourse(id: number, course: Partial<InsertCourse>): Promise<Course> {
    const [updatedCourse] = await db
      .update(courses)
      .set({ ...course, updatedAt: new Date() })
      .where(eq(courses.id, id))
      .returning();
    return updatedCourse;
  }

  async deleteCourse(id: number): Promise<void> {
    await db.update(courses).set({ isActive: false }).where(eq(courses.id, id));
  }

  async getRequiredCourses(companyId: number): Promise<Course[]> {
    return await db
      .select()
      .from(courses)
      .where(
        and(
          eq(courses.companyId, companyId),
          eq(courses.isRequired, true),
          eq(courses.isActive, true)
        )
      )
      .orderBy(courses.title);
  }

  // Employee course operations
  async getEmployeeCourses(userId: string, companyId: number): Promise<EmployeeCourse[]> {
    return await db
      .select()
      .from(employeeCourses)
      .where(
        and(
          eq(employeeCourses.userId, userId),
          eq(employeeCourses.companyId, companyId)
        )
      )
      .orderBy(desc(employeeCourses.createdAt));
  }

  async getEmployeeCourse(userId: string, courseId: number): Promise<EmployeeCourse | undefined> {
    const [employeeCourse] = await db
      .select()
      .from(employeeCourses)
      .where(
        and(
          eq(employeeCourses.userId, userId),
          eq(employeeCourses.courseId, courseId)
        )
      );
    return employeeCourse;
  }

  async createEmployeeCourse(employeeCourse: InsertEmployeeCourse): Promise<EmployeeCourse> {
    const [newEmployeeCourse] = await db.insert(employeeCourses).values(employeeCourse).returning();
    return newEmployeeCourse;
  }

  async updateEmployeeCourse(id: number, employeeCourse: Partial<InsertEmployeeCourse>): Promise<EmployeeCourse> {
    const [updatedEmployeeCourse] = await db
      .update(employeeCourses)
      .set({ ...employeeCourse, updatedAt: new Date() })
      .where(eq(employeeCourses.id, id))
      .returning();
    return updatedEmployeeCourse;
  }

  async startCourse(userId: string, courseId: number, companyId: number): Promise<EmployeeCourse> {
    // Check if course enrollment already exists
    const existing = await this.getEmployeeCourse(userId, courseId);
    if (existing) {
      // Update existing enrollment to started status
      return await this.updateEmployeeCourse(existing.id, {
        status: 'in_progress',
        startedAt: new Date(),
        progress: 0
      });
    }
    
    // Create new enrollment
    return await this.createEmployeeCourse({
      userId,
      courseId,
      companyId,
      status: 'in_progress',
      startedAt: new Date(),
      progress: 0
    });
  }

  async updateCourseProgress(userId: string, courseId: number, progress: number): Promise<EmployeeCourse> {
    const employeeCourse = await this.getEmployeeCourse(userId, courseId);
    if (!employeeCourse) {
      throw new Error('Employee course enrollment not found');
    }
    
    return await this.updateEmployeeCourse(employeeCourse.id, {
      progress,
      status: progress >= 100 ? 'completed' : 'in_progress'
    });
  }

  async completeCourse(userId: string, courseId: number, score?: number): Promise<EmployeeCourse> {
    const employeeCourse = await this.getEmployeeCourse(userId, courseId);
    if (!employeeCourse) {
      throw new Error('Employee course enrollment not found');
    }
    
    return await this.updateEmployeeCourse(employeeCourse.id, {
      status: 'completed',
      progress: 100,
      score,
      completedAt: new Date()
    });
  }

  // Certificate operations
  async getCertificates(userId: string, companyId: number): Promise<Certificate[]> {
    return await db
      .select()
      .from(certificates)
      .where(
        and(
          eq(certificates.userId, userId),
          eq(certificates.companyId, companyId)
        )
      )
      .orderBy(desc(certificates.issuedDate));
  }

  async getCertificate(id: number): Promise<Certificate | undefined> {
    const [certificate] = await db.select().from(certificates).where(eq(certificates.id, id));
    return certificate;
  }

  async createCertificate(certificate: InsertCertificate): Promise<Certificate> {
    const [newCertificate] = await db.insert(certificates).values(certificate).returning();
    return newCertificate;
  }

  async verifyCertificate(id: number, verifiedBy: string): Promise<Certificate> {
    const [verifiedCertificate] = await db
      .update(certificates)
      .set({
        isVerified: true,
        verifiedBy,
        verifiedAt: new Date()
      })
      .where(eq(certificates.id, id))
      .returning();
    return verifiedCertificate;
  }
  
  // Audit operations
  async createAuditLog(auditEntry: InsertAuditLog): Promise<AuditLog> {
    const [audit] = await db.insert(auditLog).values(auditEntry).returning();
    return audit;
  }
  
  async getAuditLogs(companyId?: number, targetUserId?: string, action?: string): Promise<AuditLog[]> {
    let conditions = [];
    
    if (companyId) {
      conditions.push(eq(auditLog.companyId, companyId));
    }
    
    if (targetUserId) {
      conditions.push(eq(auditLog.targetUserId, targetUserId));
    }
    
    if (action) {
      conditions.push(eq(auditLog.action, action));
    }
    
    return await db
      .select()
      .from(auditLog)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(auditLog.createdAt));
  }

  async getAuditLog(companyId?: number, filters?: {
    limit?: number;
    offset?: number;
    action?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<AuditLog[]> {
    let conditions = [];
    
    if (companyId) {
      conditions.push(eq(auditLog.companyId, companyId));
    }
    
    if (filters?.action) {
      conditions.push(eq(auditLog.action, filters.action));
    }
    
    if (filters?.startDate) {
      conditions.push(gte(auditLog.createdAt, new Date(filters.startDate)));
    }
    
    if (filters?.endDate) {
      conditions.push(lte(auditLog.createdAt, new Date(filters.endDate)));
    }
    
    let query = db
      .select()
      .from(auditLog)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(auditLog.createdAt));
    
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }
    
    if (filters?.offset) {
      query = query.offset(filters.offset);
    }
    
    return await query;
  }

  // Time period operations
  async getTimePeriods(companyId: number): Promise<TimePeriod[]> {
    return await db
      .select()
      .from(timePeriods)
      .where(eq(timePeriods.companyId, companyId))
      .orderBy(desc(timePeriods.endDate));
  }

  async getTimePeriod(id: number): Promise<TimePeriod | undefined> {
    const [period] = await db
      .select()
      .from(timePeriods)
      .where(eq(timePeriods.id, id));
    return period;
  }

  async createTimePeriod(period: InsertTimePeriod): Promise<TimePeriod> {
    const [newPeriod] = await db
      .insert(timePeriods)
      .values(period)
      .returning();
    return newPeriod;
  }

  async closeTimePeriod(id: number, closedBy: string, reason: string): Promise<TimePeriod> {
    const [closedPeriod] = await db
      .update(timePeriods)
      .set({
        status: 'closed',
        closedBy,
        closedAt: new Date(),
        reason,
        updatedAt: new Date(),
      })
      .where(eq(timePeriods.id, id))
      .returning();
    return closedPeriod;
  }

  async reopenTimePeriod(id: number, reopenedBy: string, reason: string): Promise<TimePeriod> {
    const [reopenedPeriod] = await db
      .update(timePeriods)
      .set({
        status: 'open',
        reopenedBy,
        reopenedAt: new Date(),
        reason,
        updatedAt: new Date(),
      })
      .where(eq(timePeriods.id, id))
      .returning();
    return reopenedPeriod;
  }

  async canModifyTimeEntries(companyId: number, date: string): Promise<boolean> {
    // Check if there's a closed period that contains this date
    const closedPeriods = await db
      .select()
      .from(timePeriods)
      .where(
        and(
          eq(timePeriods.companyId, companyId),
          eq(timePeriods.status, 'closed'),
          lte(timePeriods.startDate, date),
          gte(timePeriods.endDate, date)
        )
      );
    
    return closedPeriods.length === 0;
  }
}

export const storage = new DatabaseStorage();
