import {
  users,
  departments,
  timeEntries,
  breakEntries,
  faceProfiles,
  type User,
  type UpsertUser,
  type Department,
  type InsertDepartment,
  type TimeEntry,
  type InsertTimeEntry,
  type BreakEntry,
  type InsertBreakEntry,
  type FaceProfile,
  type InsertFaceProfile,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, gte, lte, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Department operations
  getDepartments(): Promise<Department[]>;
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

  // Department operations
  async getDepartments(): Promise<Department[]> {
    return await db.select().from(departments).where(eq(departments.isActive, true));
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
    let query = db.select().from(timeEntries).where(eq(timeEntries.userId, userId));
    
    if (startDate && endDate) {
      query = query.where(and(
        eq(timeEntries.userId, userId),
        gte(timeEntries.date, startDate),
        lte(timeEntries.date, endDate)
      ));
    }
    
    return await query.orderBy(desc(timeEntries.date));
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
}

export const storage = new DatabaseStorage();
