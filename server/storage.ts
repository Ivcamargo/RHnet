import {
  users,
  departments,
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
  type User,
  type UpsertUser,
  type Department,
  type InsertDepartment,
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
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, gte, lte, sql } from "drizzle-orm";

// Local type aliases for tables that don't have exported types
type InsertTimeEntry = typeof timeEntries.$inferInsert;
type BreakEntry = typeof breakEntries.$inferSelect;
type InsertBreakEntry = typeof breakEntries.$inferInsert;
type FaceProfile = typeof faceProfiles.$inferSelect;
type InsertFaceProfile = typeof faceProfiles.$inferInsert;

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
  
  // Time entry operations
  getActiveTimeEntry(userId: string): Promise<TimeEntry | undefined>;
  createTimeEntry(timeEntry: InsertTimeEntry): Promise<TimeEntry>;
  updateTimeEntry(id: number, timeEntry: Partial<InsertTimeEntry>): Promise<TimeEntry>;
  getTimeEntriesByUser(userId: string, startDate?: string, endDate?: string): Promise<TimeEntry[]>;
  getTimeEntriesByDateRange(startDate: string, endDate: string): Promise<TimeEntry[]>;
  
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
    // Count dependencies across all related tables
    const dependencies: Record<string, number> = {};
    
    // Check time entries
    const [timeEntriesCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(timeEntries)
      .where(eq(timeEntries.userId, id));
    dependencies.timeEntries = Number(timeEntriesCount?.count) || 0;
    
    // Check face profiles
    const [faceProfilesCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(faceProfiles)
      .where(eq(faceProfiles.userId, id));
    dependencies.faceProfiles = Number(faceProfilesCount?.count) || 0;
    
    // Check messages sent
    const [messagesSentCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(messages)
      .where(eq(messages.senderId, id));
    dependencies.messagesSent = Number(messagesSentCount?.count) || 0;
    
    // Check message recipients
    const [messageRecipientsCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(messageRecipients)
      .where(eq(messageRecipients.recipientId, id));
    dependencies.messageRecipients = Number(messageRecipientsCount?.count) || 0;
    
    // Check documents uploaded
    const [documentsCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(documents)
      .where(eq(documents.uploadedBy, id));
    dependencies.documents = Number(documentsCount?.count) || 0;
    
    // Check employee courses
    const [employeeCoursesCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(employeeCourses)
      .where(eq(employeeCourses.userId, id));
    dependencies.employeeCourses = Number(employeeCoursesCount?.count) || 0;
    
    // Check certificates
    const [certificatesCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(certificates)
      .where(eq(certificates.userId, id));
    dependencies.certificates = Number(certificatesCount?.count) || 0;
    
    // User can only be hard deleted if no dependencies exist
    const totalDependencies = Object.values(dependencies).reduce((sum, count) => sum + count, 0);
    const allowed = totalDependencies === 0;
    
    return { allowed, dependencies };
  }

  async deleteUserPermanently(id: string): Promise<void> {
    // Execute all deletions in a transaction for atomicity
    await db.transaction(async (tx) => {
      // Note: Only call this method after confirming canHardDeleteUser returns true
      // Delete in order of dependencies (child records first, then parent)
      
      // Delete break entries (tied to time entries)
      await tx.delete(breakEntries)
        .where(sql`time_entry_id IN (SELECT id FROM time_entries WHERE user_id = ${id})`);
      
      // Delete time entries
      await tx.delete(timeEntries)
        .where(eq(timeEntries.userId, id));
      
      // Delete face profiles
      await tx.delete(faceProfiles)
        .where(eq(faceProfiles.userId, id));
      
      // Delete message recipients
      await tx.delete(messageRecipients)
        .where(eq(messageRecipients.recipientId, id));
      
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
        .set({ uploadedBy: null })
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
            sql`(${documents.assignedTo} = ${userId} OR ${documents.assignedTo} IS NULL)`
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
}

export const storage = new DatabaseStorage();
