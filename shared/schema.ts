import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  decimal,
  boolean,
  real,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").default("employee"), // employee, admin
  departmentId: integer("department_id"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Departments table
export const departments = pgTable("departments", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  description: text("description"),
  shiftStart: varchar("shift_start").notNull(), // "08:00"
  shiftEnd: varchar("shift_end").notNull(), // "17:00"
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  radius: integer("radius").default(100), // meters
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Time entries table
export const timeEntries = pgTable("time_entries", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  departmentId: integer("department_id").notNull(),
  clockInTime: timestamp("clock_in_time"),
  clockOutTime: timestamp("clock_out_time"),
  clockInLatitude: real("clock_in_latitude"),
  clockInLongitude: real("clock_in_longitude"),
  clockOutLatitude: real("clock_out_latitude"),
  clockOutLongitude: real("clock_out_longitude"),
  totalHours: decimal("total_hours", { precision: 4, scale: 2 }),
  status: varchar("status").default("active"), // active, completed, incomplete
  faceRecognitionVerified: boolean("face_recognition_verified").default(false),
  date: varchar("date").notNull(), // YYYY-MM-DD format
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Break entries table
export const breakEntries = pgTable("break_entries", {
  id: serial("id").primaryKey(),
  timeEntryId: integer("time_entry_id").notNull(),
  breakStart: timestamp("break_start"),
  breakEnd: timestamp("break_end"),
  duration: decimal("duration", { precision: 4, scale: 2 }),
  type: varchar("type").default("break"), // break, lunch
  createdAt: timestamp("created_at").defaultNow(),
});

// Employee facial recognition data
export const faceProfiles = pgTable("face_profiles", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().unique(),
  faceData: jsonb("face_data"), // Store face recognition embeddings
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Schema types and validation
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export const insertDepartmentSchema = createInsertSchema(departments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertDepartment = z.infer<typeof insertDepartmentSchema>;
export type Department = typeof departments.$inferSelect;

export const insertTimeEntrySchema = createInsertSchema(timeEntries).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertTimeEntry = z.infer<typeof insertTimeEntrySchema>;
export type TimeEntry = typeof timeEntries.$inferSelect;

export const insertBreakEntrySchema = createInsertSchema(breakEntries).omit({
  id: true,
  createdAt: true,
});
export type InsertBreakEntry = z.infer<typeof insertBreakEntrySchema>;
export type BreakEntry = typeof breakEntries.$inferSelect;

export const insertFaceProfileSchema = createInsertSchema(faceProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertFaceProfile = z.infer<typeof insertFaceProfileSchema>;
export type FaceProfile = typeof faceProfiles.$inferSelect;

// Clock in/out request schemas
export const clockInSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  faceRecognitionData: z.any().optional(),
});
export type ClockInRequest = z.infer<typeof clockInSchema>;

export const clockOutSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  faceRecognitionData: z.any().optional(),
});
export type ClockOutRequest = z.infer<typeof clockOutSchema>;
