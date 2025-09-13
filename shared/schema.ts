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
  date,
  foreignKey,
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

// Companies table
export const companies = pgTable("companies", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  cnpj: varchar("cnpj").unique(),
  address: text("address"),
  phone: varchar("phone"),
  email: varchar("email"),
  logoUrl: varchar("logo_url"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Holidays table
export const holidays = pgTable("holidays", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull(),
  name: varchar("name").notNull(),
  date: date("date").notNull(),
  type: varchar("type").default("national"), // national, regional, company
  isRecurring: boolean("is_recurring").default(false),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  companyReference: foreignKey({
    columns: [table.companyId],
    foreignColumns: [companies.id],
  }),
}));

// Departments table
export const departments = pgTable("departments", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull(),
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
}, (table) => ({
  companyReference: foreignKey({
    columns: [table.companyId],
    foreignColumns: [companies.id],
  }),
}));

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").default("employee"), // employee, admin, superadmin
  companyId: integer("company_id"), // Nullable for superadmins
  departmentId: integer("department_id"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  companyReference: foreignKey({
    columns: [table.companyId],
    foreignColumns: [companies.id],
  }).onDelete('set null'),
  departmentReference: foreignKey({
    columns: [table.departmentId],
    foreignColumns: [departments.id],
  }).onDelete('set null'),
}));

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
}, (table) => ({
  userReference: foreignKey({
    columns: [table.userId],
    foreignColumns: [users.id],
  }).onDelete('cascade'),
  departmentReference: foreignKey({
    columns: [table.departmentId],
    foreignColumns: [departments.id],
  }),
}));

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
}, (table) => ({
  userReference: foreignKey({
    columns: [table.userId],
    foreignColumns: [users.id],
  }).onDelete('cascade'),
}));

// Message categories for organizing communications
export const messageCategories = pgTable("message_categories", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  description: text("description"),
  color: varchar("color").default("#3B82F6"), // Hex color for UI
  companyId: integer("company_id").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  companyReference: foreignKey({
    columns: [table.companyId],
    foreignColumns: [companies.id],
  }),
}));

// Messages between HR and employees
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull(),
  senderId: varchar("sender_id").notNull(), // User who sent the message
  categoryId: integer("category_id"),
  subject: varchar("subject").notNull(),
  content: text("content").notNull(),
  isMassMessage: boolean("is_mass_message").default(false),
  priority: varchar("priority").default("normal"), // low, normal, high
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  companyReference: foreignKey({
    columns: [table.companyId],
    foreignColumns: [companies.id],
  }),
  senderReference: foreignKey({
    columns: [table.senderId],
    foreignColumns: [users.id],
  }),
  categoryReference: foreignKey({
    columns: [table.categoryId],
    foreignColumns: [messageCategories.id],
  }).onDelete('set null'),
}));

// Message recipients for tracking delivery and read status per user
export const messageRecipients = pgTable("message_recipients", {
  id: serial("id").primaryKey(),
  messageId: integer("message_id").notNull(),
  userId: varchar("user_id").notNull(),
  isDelivered: boolean("is_delivered").default(false),
  deliveredAt: timestamp("delivered_at"),
  isRead: boolean("is_read").default(false),
  readAt: timestamp("read_at"),
  isDeleted: boolean("is_deleted").default(false),
  deletedAt: timestamp("deleted_at"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  messageReference: foreignKey({
    columns: [table.messageId],
    foreignColumns: [messages.id],
  }).onDelete('cascade'),
  userReference: foreignKey({
    columns: [table.userId],
    foreignColumns: [users.id],
  }).onDelete('cascade'),
  uniqueMessageRecipient: index("unique_message_recipient").unique().on(table.messageId, table.userId),
}));

// Message attachments and documents
export const messageAttachments = pgTable("message_attachments", {
  id: serial("id").primaryKey(),
  messageId: integer("message_id").notNull(),
  fileName: varchar("file_name").notNull(),
  originalName: varchar("original_name").notNull(),
  fileSize: integer("file_size").notNull(), // in bytes
  mimeType: varchar("mime_type").notNull(),
  filePath: text("file_path").notNull(), // Server storage path
  uploadedBy: varchar("uploaded_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  messageReference: foreignKey({
    columns: [table.messageId],
    foreignColumns: [messages.id],
  }).onDelete('cascade'),
  uploadedByReference: foreignKey({
    columns: [table.uploadedBy],
    foreignColumns: [users.id],
  }),
}));

// Document management system
export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull(),
  title: varchar("title").notNull(),
  description: text("description"),
  fileName: varchar("file_name").notNull(),
  originalName: varchar("original_name").notNull(),
  fileSize: integer("file_size").notNull(),
  mimeType: varchar("mime_type").notNull(),
  filePath: text("file_path").notNull(),
  category: varchar("category").default("general"), // general, hr, payroll, etc.
  uploadedBy: varchar("uploaded_by").notNull(), // User ID
  assignedTo: varchar("assigned_to"), // Null for general documents
  version: integer("version").default(1),
  parentDocumentId: integer("parent_document_id"), // For versioning
  isActive: boolean("is_active").default(true),
  expiresAt: timestamp("expires_at"), // For temporary documents
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  companyReference: foreignKey({
    columns: [table.companyId],
    foreignColumns: [companies.id],
  }),
  uploadedByReference: foreignKey({
    columns: [table.uploadedBy],
    foreignColumns: [users.id],
  }),
  assignedToReference: foreignKey({
    columns: [table.assignedTo],
    foreignColumns: [users.id],
  }).onDelete('set null'),
  parentReference: foreignKey({
    columns: [table.parentDocumentId],
    foreignColumns: [table.id],
  }).onDelete('set null'),
  uniqueDocumentVersion: index("unique_document_version").unique().on(table.companyId, table.title, table.version),
}));

// Training courses
export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull(),
  title: varchar("title").notNull(),
  description: text("description"),
  category: varchar("category"), // technical, soft-skills, compliance, etc.
  duration: integer("duration"), // in minutes
  isRequired: boolean("is_required").default(false),
  externalUrl: text("external_url"), // Link to external course platform
  certificateTemplate: text("certificate_template"), // For auto-generation
  passingScore: integer("passing_score"), // Percentage required to pass
  validityPeriod: integer("validity_period"), // in days, for renewal
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  companyReference: foreignKey({
    columns: [table.companyId],
    foreignColumns: [companies.id],
  }),
}));

// Job training tracks - courses assigned to specific roles/departments
export const jobTrainingTracks = pgTable("job_training_tracks", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull(),
  departmentId: integer("department_id"),
  jobRole: varchar("job_role"), // For role-based training
  courseId: integer("course_id").notNull(),
  isRequired: boolean("is_required").default(false),
  daysToComplete: integer("days_to_complete").default(30),
  order: integer("order").default(0), // Course sequence in track
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  companyReference: foreignKey({
    columns: [table.companyId],
    foreignColumns: [companies.id],
  }),
  departmentReference: foreignKey({
    columns: [table.departmentId],
    foreignColumns: [departments.id],
  }).onDelete('cascade'),
  courseReference: foreignKey({
    columns: [table.courseId],
    foreignColumns: [courses.id],
  }).onDelete('cascade'),
}));

// Employee course progress and completion
export const employeeCourses = pgTable("employee_courses", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  courseId: integer("course_id").notNull(),
  companyId: integer("company_id").notNull(),
  status: varchar("status").default("not_started"), // not_started, in_progress, completed, expired
  progress: integer("progress").default(0), // Percentage completed
  score: integer("score"), // Final score if applicable
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  expiresAt: timestamp("expires_at"), // For courses with validity period
  certificateUrl: text("certificate_url"), // Path to generated certificate
  validatedBy: varchar("validated_by"), // HR user who validated completion
  validatedAt: timestamp("validated_at"),
  notes: text("notes"), // HR notes about the course completion
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userReference: foreignKey({
    columns: [table.userId],
    foreignColumns: [users.id],
  }).onDelete('cascade'),
  courseReference: foreignKey({
    columns: [table.courseId],
    foreignColumns: [courses.id],
  }).onDelete('cascade'),
  companyReference: foreignKey({
    columns: [table.companyId],
    foreignColumns: [companies.id],
  }),
  validatedByReference: foreignKey({
    columns: [table.validatedBy],
    foreignColumns: [users.id],
  }).onDelete('set null'),
  uniqueUserCourse: index("unique_user_course_active").unique().on(table.userId, table.courseId),
}));

// Certificates earned by employees
export const certificates = pgTable("certificates", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  courseId: integer("course_id").notNull(),
  companyId: integer("company_id").notNull(),
  certificateNumber: varchar("certificate_number").unique().notNull(),
  title: varchar("title").notNull(),
  issuedDate: date("issued_date").notNull(),
  expiryDate: date("expiry_date"), // For certificates that expire
  fileUrl: text("file_url"), // Path to certificate file
  isVerified: boolean("is_verified").default(false),
  verifiedBy: varchar("verified_by"), // HR user who verified
  verifiedAt: timestamp("verified_at"),
  metadata: jsonb("metadata"), // Additional certificate data
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userReference: foreignKey({
    columns: [table.userId],
    foreignColumns: [users.id],
  }).onDelete('cascade'),
  courseReference: foreignKey({
    columns: [table.courseId],
    foreignColumns: [courses.id],
  }),
  companyReference: foreignKey({
    columns: [table.companyId],
    foreignColumns: [companies.id],
  }),
  verifiedByReference: foreignKey({
    columns: [table.verifiedBy],
    foreignColumns: [users.id],
  }).onDelete('set null'),
}));

// Notifications system
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  companyId: integer("company_id").notNull(),
  type: varchar("type").notNull(), // message, document, course, system
  title: varchar("title").notNull(),
  content: text("content"),
  relatedId: integer("related_id"), // ID of related entity (message, course, etc.)
  relatedType: varchar("related_type"), // message, course, document, etc.
  isRead: boolean("is_read").default(false),
  readAt: timestamp("read_at"),
  emailSent: boolean("email_sent").default(false),
  emailSentAt: timestamp("email_sent_at"),
  priority: varchar("priority").default("normal"), // low, normal, high
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userReference: foreignKey({
    columns: [table.userId],
    foreignColumns: [users.id],
  }).onDelete('cascade'),
  companyReference: foreignKey({
    columns: [table.companyId],
    foreignColumns: [companies.id],
  }),
}));

// Schema types and validation
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Company = typeof companies.$inferSelect;
export type Department = typeof departments.$inferSelect;
export type TimeEntry = typeof timeEntries.$inferSelect;
export type Holiday = typeof holidays.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type MessageCategory = typeof messageCategories.$inferSelect;
export type MessageRecipient = typeof messageRecipients.$inferSelect;
export type MessageAttachment = typeof messageAttachments.$inferSelect;
export type Document = typeof documents.$inferSelect;
export type Course = typeof courses.$inferSelect;
export type JobTrainingTrack = typeof jobTrainingTracks.$inferSelect;
export type EmployeeCourse = typeof employeeCourses.$inferSelect;
export type Certificate = typeof certificates.$inferSelect;
export type Notification = typeof notifications.$inferSelect;

// Insert schemas using drizzle-zod
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCompanySchema = createInsertSchema(companies).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDepartmentSchema = createInsertSchema(departments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertHolidaySchema = createInsertSchema(holidays).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMessageCategorySchema = createInsertSchema(messageCategories).omit({
  id: true,
  createdAt: true,
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCourseSchema = createInsertSchema(courses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEmployeeCourseSchema = createInsertSchema(employeeCourses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCertificateSchema = createInsertSchema(certificates).omit({
  id: true,
  createdAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export const insertMessageRecipientSchema = createInsertSchema(messageRecipients).omit({
  id: true,
  createdAt: true,
});

export const insertMessageAttachmentSchema = createInsertSchema(messageAttachments).omit({
  id: true,
  createdAt: true,
});

export const insertJobTrainingTrackSchema = createInsertSchema(jobTrainingTracks).omit({
  id: true,
  createdAt: true,
});

// Insert types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertCompany = z.infer<typeof insertCompanySchema>;
export type InsertDepartment = z.infer<typeof insertDepartmentSchema>;
export type InsertHoliday = z.infer<typeof insertHolidaySchema>;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type InsertMessageCategory = z.infer<typeof insertMessageCategorySchema>;
export type InsertMessageRecipient = z.infer<typeof insertMessageRecipientSchema>;
export type InsertMessageAttachment = z.infer<typeof insertMessageAttachmentSchema>;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type InsertJobTrainingTrack = z.infer<typeof insertJobTrainingTrackSchema>;
export type InsertEmployeeCourse = z.infer<typeof insertEmployeeCourseSchema>;
export type InsertCertificate = z.infer<typeof insertCertificateSchema>;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;


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
