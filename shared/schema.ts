import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  uniqueIndex,
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

// Sectors table - organizational divisions within companies
export const sectors = pgTable("sectors", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull(),
  name: varchar("name").notNull(),
  description: text("description"),
  // Geolocation for geofencing - moved from departments
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

// Departments table
export const departments = pgTable("departments", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull(),
  sectorId: integer("sector_id").notNull(),
  name: varchar("name").notNull(),
  description: text("description"),
  // Note: shift times moved to departmentShifts table
  // Note: geolocation moved to sectors table
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  companyReference: foreignKey({
    columns: [table.companyId],
    foreignColumns: [companies.id],
  }),
  sectorReference: foreignKey({
    columns: [table.sectorId],
    foreignColumns: [sectors.id],
  }),
}));

// Department shifts - flexible shift management
export const departmentShifts = pgTable("department_shifts", {
  id: serial("id").primaryKey(),
  departmentId: integer("department_id").notNull(),
  name: varchar("name").notNull(), // "Turno da Manhã", "Turno da Tarde"
  startTime: varchar("start_time").notNull(), // "08:00"
  endTime: varchar("end_time").notNull(), // "17:00"
  breakStart: varchar("break_start"), // "12:00" - Início do intervalo
  breakEnd: varchar("break_end"), // "13:00" - Fim do intervalo
  daysOfWeek: integer("days_of_week").array(), // [1,2,3,4,5] for Mon-Fri
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  departmentReference: foreignKey({
    columns: [table.departmentId],
    foreignColumns: [departments.id],
  }).onDelete('cascade'),
}));

// User shift assignments - vincula funcionários aos turnos com períodos
export const userShiftAssignments = pgTable("user_shift_assignments", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  shiftId: integer("shift_id").notNull(),
  startDate: date("start_date"), // Data inicial da vinculação (opcional)
  endDate: date("end_date"), // Data final da vinculação (opcional - para escalas temporárias)
  assignmentType: varchar("assignment_type").default("permanent"), // "permanent" ou "temporary"
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userReference: foreignKey({
    columns: [table.userId],
    foreignColumns: [users.id],
  }).onDelete('cascade'),
  shiftReference: foreignKey({
    columns: [table.shiftId],
    foreignColumns: [departmentShifts.id],
  }).onDelete('cascade'),
  // Removed unique constraint to allow multiple sequential assignments
  // Instead, validation will be handled in business logic to ensure:
  // 1. No overlapping date ranges for same user+shift
  // 2. Sequential assignments have endDate < next.startDate
}));

// Department shift breaks - configurable breaks for each shift
export const departmentShiftBreaks = pgTable("department_shift_breaks", {
  id: serial("id").primaryKey(),
  shiftId: integer("shift_id").notNull(),
  name: varchar("name").notNull(), // "Almoço", "Lanche da Tarde", etc.
  durationMinutes: integer("duration_minutes").notNull(), // 60 for 1 hour lunch
  isPaid: boolean("is_paid").default(false), // paid vs unpaid break
  autoDeduct: boolean("auto_deduct").default(false), // automatic vs manual break
  scheduledStart: varchar("scheduled_start"), // Optional HH:mm like "12:00"
  scheduledEnd: varchar("scheduled_end"), // Optional HH:mm like "13:00"
  minWorkMinutes: integer("min_work_minutes").default(360), // 6 hours minimum before break applies
  toleranceBeforeMinutes: integer("tolerance_before_minutes").default(0),
  toleranceAfterMinutes: integer("tolerance_after_minutes").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  shiftReference: foreignKey({
    columns: [table.shiftId],
    foreignColumns: [departmentShifts.id],
  }).onDelete('cascade'),
}));

// Supervisor assignments - which supervisors manage which sectors
export const supervisorAssignments = pgTable("supervisor_assignments", {
  id: serial("id").primaryKey(),
  supervisorId: varchar("supervisor_id").notNull(),
  sectorId: integer("sector_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  supervisorReference: foreignKey({
    columns: [table.supervisorId],
    foreignColumns: [users.id],
  }).onDelete('cascade'),
  sectorReference: foreignKey({
    columns: [table.sectorId],
    foreignColumns: [sectors.id],
  }).onDelete('cascade'),
  uniqueSupervisorSector: uniqueIndex("unique_supervisor_sector").on(table.supervisorId, table.sectorId),
}));

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  
  // Documentos pessoais
  cpf: varchar("cpf", { length: 14 }), // XXX.XXX.XXX-XX
  rg: varchar("rg", { length: 20 }),
  rgIssuingOrgan: varchar("rg_issuing_organ", { length: 10 }), // SSP-SP, PC-RJ, etc
  ctps: varchar("ctps", { length: 20 }), // Carteira de Trabalho
  pisPasep: varchar("pis_pasep", { length: 15 }),
  tituloEleitor: varchar("titulo_eleitor", { length: 15 }),
  
  // Dados pessoais
  birthDate: date("birth_date"),
  maritalStatus: varchar("marital_status"), // solteiro, casado, divorciado, viuvo, uniao_estavel
  gender: varchar("gender"), // masculino, feminino, outro, prefiro_nao_informar
  nationality: varchar("nationality").default("Brasileira"),
  naturalness: varchar("naturalness"), // Cidade de nascimento
  
  // Endereço
  cep: varchar("cep", { length: 9 }), // XXXXX-XXX
  address: text("address"),
  addressNumber: varchar("address_number", { length: 10 }),
  addressComplement: varchar("address_complement"),
  neighborhood: varchar("neighborhood"),
  city: varchar("city"),
  state: varchar("state", { length: 2 }),
  country: varchar("country").default("Brasil"),
  
  // Contatos
  personalPhone: varchar("personal_phone", { length: 15 }),
  commercialPhone: varchar("commercial_phone", { length: 15 }),
  emergencyContactName: varchar("emergency_contact_name"),
  emergencyContactPhone: varchar("emergency_contact_phone", { length: 15 }),
  emergencyContactRelationship: varchar("emergency_contact_relationship"),
  
  // Dados profissionais
  internalId: varchar("internal_id", { length: 50 }), // Registro interno para integração com outros sistemas
  role: varchar("role").default("employee"), // employee, admin, supervisor, superadmin
  companyId: integer("company_id"), // Nullable for superadmins
  departmentId: integer("department_id"),
  position: varchar("position"), // Cargo
  admissionDate: date("admission_date"),
  contractType: varchar("contract_type"), // clt, pj, estagio, terceirizado, temporario
  workSchedule: varchar("work_schedule"), // integral, meio_periodo, flexivel
  salary: decimal("salary", { precision: 10, scale: 2 }),
  benefits: text("benefits"), // Benefícios em texto livre
  
  // Dados bancários
  bankCode: varchar("bank_code", { length: 3 }),
  bankName: varchar("bank_name"),
  agencyNumber: varchar("agency_number", { length: 10 }),
  accountNumber: varchar("account_number", { length: 20 }),
  accountType: varchar("account_type"), // corrente, poupanca
  pixKey: varchar("pix_key"),
  
  // Escolaridade e formação
  educationLevel: varchar("education_level"), // fundamental, medio, superior, pos_graduacao, mestrado, doutorado
  institution: varchar("institution"),
  course: varchar("course"),
  graduationYear: integer("graduation_year"),
  
  // Dependentes (armazenado como JSON)
  dependents: jsonb("dependents"), // Array de objetos com nome, parentesco, data nascimento, CPF
  
  // Autenticação local
  passwordHash: varchar("password_hash"), // Hash da senha (argon2id)
  mustChangePassword: boolean("must_change_password").default(false),
  passwordResetToken: varchar("password_reset_token"),
  passwordResetExpires: timestamp("password_reset_expires"),
  
  // Sistema
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
  totalHours: decimal("total_hours", { precision: 6, scale: 2 }),
  regularHours: decimal("regular_hours", { precision: 6, scale: 2 }).default('0'),
  overtimeHours: decimal("overtime_hours", { precision: 6, scale: 2 }).default('0'),
  expectedHours: decimal("expected_hours", { precision: 6, scale: 2 }), // Horas esperadas do turno
  lateMinutes: integer("late_minutes"), // Minutos de atraso no início
  shortfallMinutes: integer("shortfall_minutes"), // Minutos a menos trabalhados
  irregularityReasons: text("irregularity_reasons").array(), // Motivos de irregularidade
  status: varchar("status").default("active"), // active, completed, incomplete, irregular
  faceRecognitionVerified: boolean("face_recognition_verified").default(false),
  
  // Fotos de reconhecimento facial
  clockInPhotoUrl: varchar("clock_in_photo_url"), // URL da foto na entrada
  clockOutPhotoUrl: varchar("clock_out_photo_url"), // URL da foto na saída
  
  // Validação de IP e geolocalização
  clockInIpAddress: varchar("clock_in_ip_address"), // IP da entrada
  clockOutIpAddress: varchar("clock_out_ip_address"), // IP da saída
  clockInWithinGeofence: boolean("clock_in_within_geofence"), // Se estava dentro da cerca na entrada
  clockOutWithinGeofence: boolean("clock_out_within_geofence"), // Se estava dentro da cerca na saída
  clockInShiftCompliant: boolean("clock_in_shift_compliant"), // Se estava no turno correto na entrada
  clockOutShiftCompliant: boolean("clock_out_shift_compliant"), // Se estava no turno correto na saída
  clockInValidationMessage: text("clock_in_validation_message"), // Mensagem de validação na entrada
  clockOutValidationMessage: text("clock_out_validation_message"), // Mensagem de validação na saída
  
  // Sistema de inclusão manual e aprovação
  entryType: varchar("entry_type").default("automatic"), // automatic, manual_insertion, manual_edit
  insertedBy: varchar("inserted_by"), // ID do usuário que incluiu/editou manualmente
  approvedBy: varchar("approved_by"), // ID do supervisor que aprovou
  approvalStatus: varchar("approval_status").default("approved"), // pending, approved, rejected
  justification: text("justification"), // Justificativa para inclusão/alteração manual
  supportDocumentUrl: varchar("support_document_url"), // URL do documento anexado (atestado, etc)
  
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
  senderDeleted: boolean("sender_deleted").default(false), // Sender archived/deleted (doesn't affect recipients)
  senderDeletedAt: timestamp("sender_deleted_at"), // When sender deleted/archived
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
  uniqueMessageRecipient: uniqueIndex("unique_message_recipient").on(table.messageId, table.userId),
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
  uniqueDocumentVersion: uniqueIndex("unique_document_version").on(table.companyId, table.title, table.version),
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
  videoUrl: text("video_url"), // URL do vídeo do curso (YouTube, Vimeo, etc)
  externalUrl: text("external_url"), // Link to external course platform
  certificateTemplate: text("certificate_template"), // For auto-generation
  passingScore: integer("passing_score").default(70), // Percentage required to pass
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
  uniqueUserCourse: uniqueIndex("unique_user_course_active").on(table.userId, table.courseId),
}));

// Course questions for quizzes
export const courseQuestions = pgTable("course_questions", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id").notNull(),
  question: text("question").notNull(),
  questionType: varchar("question_type").default("multiple_choice"), // multiple_choice, true_false
  options: jsonb("options").notNull(), // Array of options for multiple choice
  correctAnswer: varchar("correct_answer").notNull(), // The correct answer
  order: integer("order").default(0), // Question order in quiz
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  courseReference: foreignKey({
    columns: [table.courseId],
    foreignColumns: [courses.id],
  }).onDelete('cascade'),
}));

// User answers to course questions
export const courseAnswers = pgTable("course_answers", {
  id: serial("id").primaryKey(),
  employeeCourseId: integer("employee_course_id").notNull(),
  questionId: integer("question_id").notNull(),
  answer: varchar("answer").notNull(),
  isCorrect: boolean("is_correct").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  employeeCourseReference: foreignKey({
    columns: [table.employeeCourseId],
    foreignColumns: [employeeCourses.id],
  }).onDelete('cascade'),
  questionReference: foreignKey({
    columns: [table.questionId],
    foreignColumns: [courseQuestions.id],
  }).onDelete('cascade'),
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

// Audit trail table for security-critical operations
export const auditLog = pgTable("audit_log", {
  id: serial("id").primaryKey(),
  action: varchar("action").notNull(), // user_hard_delete, user_role_change, etc.
  performedBy: varchar("performed_by").notNull(), // User ID who performed the action
  targetUserId: varchar("target_user_id"), // User ID being affected (nullable for non-user actions)
  targetResource: varchar("target_resource"), // Additional resource identifier
  companyId: integer("company_id"), // Company context
  details: jsonb("details"), // Additional action details
  ipAddress: varchar("ip_address"), // Client IP for security tracking
  userAgent: text("user_agent"), // Client user agent
  success: boolean("success").notNull(), // Whether the action succeeded
  errorMessage: text("error_message"), // Error details if action failed
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  performedByReference: foreignKey({
    columns: [table.performedBy],
    foreignColumns: [users.id],
  }).onDelete('set null'),
  targetUserReference: foreignKey({
    columns: [table.targetUserId],
    foreignColumns: [users.id],
  }).onDelete('set null'),
  companyReference: foreignKey({
    columns: [table.companyId],
    foreignColumns: [companies.id],
  }).onDelete('set null'),
}));

// Schema types and validation
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Company = typeof companies.$inferSelect;
export type Sector = typeof sectors.$inferSelect;
export type Department = typeof departments.$inferSelect;
export type DepartmentShift = typeof departmentShifts.$inferSelect;
export type SupervisorAssignment = typeof supervisorAssignments.$inferSelect;
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
export type CourseQuestion = typeof courseQuestions.$inferSelect;
export type CourseAnswer = typeof courseAnswers.$inferSelect;
export type Certificate = typeof certificates.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type AuditLog = typeof auditLog.$inferSelect;
export type TimePeriod = typeof timePeriods.$inferSelect;

// Insert schemas using drizzle-zod
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSectorSchema = createInsertSchema(sectors).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertSector = z.infer<typeof insertSectorSchema>;


export const insertDepartmentShiftSchema = createInsertSchema(departmentShifts).omit({
  id: true,
  departmentId: true, // Comes from URL params
  createdAt: true,
  updatedAt: true,
});
export type InsertDepartmentShift = z.infer<typeof insertDepartmentShiftSchema>;
export type SelectDepartmentShift = typeof departmentShifts.$inferSelect;

export const insertDepartmentShiftBreakSchema = createInsertSchema(departmentShiftBreaks).omit({
  id: true,
  shiftId: true, // Comes from URL params
  createdAt: true,
  updatedAt: true,
});
export type InsertDepartmentShiftBreak = z.infer<typeof insertDepartmentShiftBreakSchema>;
export type SelectDepartmentShiftBreak = typeof departmentShiftBreaks.$inferSelect;

export const insertSupervisorAssignmentSchema = createInsertSchema(supervisorAssignments).omit({
  id: true,
  createdAt: true,
});
export type InsertSupervisorAssignment = z.infer<typeof insertSupervisorAssignmentSchema>;

// Base complete employee registration schema for HR
export const baseCompleteEmployeeSchema = insertUserSchema.extend({
  // Dados pessoais obrigatórios
  firstName: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  lastName: z.string().min(2, "Sobrenome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  cpf: z.string()
    .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, "CPF deve estar no formato XXX.XXX.XXX-XX")
    .refine((cpf) => {
      // Validação básica de CPF
      const numbers = cpf.replace(/\D/g, '');
      return numbers.length === 11 && !numbers.split('').every(n => n === numbers[0]);
    }, "CPF inválido"),
  
  // Documentos
  rg: z.string().min(5, "RG é obrigatório").optional(),
  rgIssuingOrgan: z.string().min(2, "Órgão emissor é obrigatório").optional(),
  ctps: z.string().optional(),
  pisPasep: z.string().optional(),
  
  // Dados pessoais
  birthDate: z.string().min(1, "Data de nascimento é obrigatória").refine((date) => {
    const birthDate = new Date(date);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    return age >= 16 && age <= 100;
  }, "Idade deve estar entre 16 e 100 anos"),
  
  maritalStatus: z.enum(["solteiro", "casado", "divorciado", "viuvo", "uniao_estavel"]),
  gender: z.enum(["masculino", "feminino", "outro", "prefiro_nao_informar"]),
  
  // Endereço
  cep: z.string().regex(/^\d{5}-\d{3}$/, "CEP deve estar no formato XXXXX-XXX"),
  address: z.string().min(10, "Endereço deve ter pelo menos 10 caracteres"),
  addressNumber: z.string().min(1, "Número é obrigatório"),
  neighborhood: z.string().min(2, "Bairro é obrigatório"),
  city: z.string().min(2, "Cidade é obrigatória"),
  state: z.string().length(2, "Estado deve ter 2 caracteres"),
  
  // Contatos
  personalPhone: z.string()
    .regex(/^\(\d{2}\) \d{4,5}-\d{4}$/, "Telefone deve estar no formato (XX) XXXXX-XXXX"),
  emergencyContactName: z.string().min(2, "Nome do contato de emergência é obrigatório"),
  emergencyContactPhone: z.string()
    .regex(/^\(\d{2}\) \d{4,5}-\d{4}$/, "Telefone deve estar no formato (XX) XXXXX-XXXX"),
  emergencyContactRelationship: z.string().min(2, "Parentesco é obrigatório"),
  
  // Dados profissionais
  position: z.string().min(2, "Cargo é obrigatório"),
  admissionDate: z.string().min(1, "Data de admissão é obrigatória").refine((date) => {
    const admissionDate = new Date(date);
    const today = new Date();
    return admissionDate <= today;
  }, "Data de admissão não pode ser futura"),
  contractType: z.enum(["clt", "pj", "estagio", "terceirizado", "temporario"]),
  workSchedule: z.enum(["integral", "meio_periodo", "flexivel"]),
  salary: z.coerce.number().min(0, "Salário deve ser positivo"),
  
  // Dados bancários
  bankCode: z.string().length(3, "Código do banco deve ter 3 dígitos"),
  bankName: z.string().min(2, "Nome do banco é obrigatório"),
  agencyNumber: z.string().min(1, "Número da agência é obrigatório"),
  accountNumber: z.string().min(1, "Número da conta é obrigatório"),
  accountType: z.enum(["corrente", "poupanca"]),
  
  // Escolaridade
  educationLevel: z.enum(["fundamental", "medio", "superior", "pos_graduacao", "mestrado", "doutorado"]),
});

// Complete employee registration schema with conditional validation for departmentId
export const insertCompleteEmployeeSchema = baseCompleteEmployeeSchema.refine(
  (data) => {
    // If role is 'admin', departmentId is optional (can be null)
    if (data.role === 'admin') {
      return true;
    }
    // For non-admin roles, departmentId is required
    return data.departmentId !== null && data.departmentId !== undefined;
  },
  {
    message: "Departamento é obrigatório para funcionários",
    path: ["departmentId"]
  }
);

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
}).extend({
  companyId: z.number().optional(),
  description: z.string().optional().default(""),
  duration: z.number().optional().default(0),
  isRequired: z.boolean().optional().default(false),
  videoUrl: z.string().optional(),
  passingScore: z.number().optional().default(70),
});

export const insertCourseQuestionSchema = createInsertSchema(courseQuestions).omit({
  id: true,
  createdAt: true,
});

export const insertCourseAnswerSchema = createInsertSchema(courseAnswers).omit({
  id: true,
  createdAt: true,
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

export const insertAuditLogSchema = createInsertSchema(auditLog).omit({
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

export const insertFaceProfileSchema = createInsertSchema(faceProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Update schemas (partial versions for PUT requests)
export const updateDocumentSchema = insertDocumentSchema.partial().omit({
  companyId: true,
  uploadedBy: true,
});

export const updateCourseSchema = insertCourseSchema.partial().omit({
  companyId: true,
});

export const updateEmployeeCourseSchema = insertEmployeeCourseSchema.partial().omit({
  userId: true,
  courseId: true,
  companyId: true,
});

// Time periods for controlling open/closed time tracking periods
export const timePeriods = pgTable("time_periods", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull(),
  name: varchar("name").notNull(), // "Janeiro 2024", "Período 15/01 a 31/01"
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  status: varchar("status").default("open"), // open, closed
  closedBy: varchar("closed_by"), // User ID who closed the period
  closedAt: timestamp("closed_at"),
  reopenedBy: varchar("reopened_by"), // User ID who reopened the period
  reopenedAt: timestamp("reopened_at"),
  reason: text("reason"), // Reason for closing/reopening
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  companyReference: foreignKey({
    columns: [table.companyId],
    foreignColumns: [companies.id],
  }),
  closedByReference: foreignKey({
    columns: [table.closedBy],
    foreignColumns: [users.id],
  }),
  reopenedByReference: foreignKey({
    columns: [table.reopenedBy],
    foreignColumns: [users.id],
  }),
}));

// Insert schemas for new tables
export const insertTimePeriodSchema = createInsertSchema(timePeriods).omit({
  id: true,
  closedAt: true,
  reopenedAt: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBreakEntrySchema = createInsertSchema(breakEntries).omit({
  id: true,
  createdAt: true,
});

// Insert types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertCompleteEmployee = z.infer<typeof insertCompleteEmployeeSchema>;
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
export type InsertCourseQuestion = z.infer<typeof insertCourseQuestionSchema>;
export type InsertCourseAnswer = z.infer<typeof insertCourseAnswerSchema>;
export type InsertCertificate = z.infer<typeof insertCertificateSchema>;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type InsertFaceProfile = z.infer<typeof insertFaceProfileSchema>;
export type InsertTimePeriod = z.infer<typeof insertTimePeriodSchema>;
export type InsertBreakEntry = z.infer<typeof insertBreakEntrySchema>;

// Schema para vinculação de funcionários aos turnos
export const insertUserShiftAssignmentSchema = createInsertSchema(userShiftAssignments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertUserShiftAssignment = z.infer<typeof insertUserShiftAssignmentSchema>;
export type SelectUserShiftAssignment = typeof userShiftAssignments.$inferSelect;


// Clock in/out request schemas
export const clockInSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  faceRecognitionData: z.any().optional(),
  locationFallback: z.boolean().optional(),
});
export type ClockInRequest = z.infer<typeof clockInSchema>;

export const clockOutSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  faceRecognitionData: z.any().optional(),
  locationFallback: z.boolean().optional(),
});
export type ClockOutRequest = z.infer<typeof clockOutSchema>;

// ========================================================================================
// ROTATION MANAGEMENT SYSTEM
// ========================================================================================

// Rotation templates - configurable rotation patterns (12x36, weekly cycles, etc.)
export const rotationTemplates = pgTable("rotation_templates", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull(),
  departmentId: integer("department_id"), // Optional - can apply to entire company
  name: varchar("name").notNull(), // "Revezamento 12x36", "Escala Semanal"
  description: text("description"),
  cadenceType: varchar("cadence_type").notNull(), // "daily", "weekly", "monthly", "custom"
  cycleLength: integer("cycle_length").notNull(), // Number of segments in one complete cycle
  startsOn: varchar("starts_on").default("monday"), // "monday", "first_day", etc.
  isActive: boolean("is_active").default(true),
  createdBy: varchar("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  companyReference: foreignKey({
    columns: [table.companyId],
    foreignColumns: [companies.id],
  }),
  departmentReference: foreignKey({
    columns: [table.departmentId],
    foreignColumns: [departments.id],
  }).onDelete('cascade'),
  createdByReference: foreignKey({
    columns: [table.createdBy],
    foreignColumns: [users.id],
  }),
}));

// Rotation segments - individual parts of a rotation cycle
export const rotationSegments = pgTable("rotation_segments", {
  id: serial("id").primaryKey(),
  templateId: integer("template_id").notNull(),
  sequenceOrder: integer("sequence_order").notNull(), // 1, 2, 3... within the cycle
  shiftId: integer("shift_id"), // Optional - null for rest periods
  name: varchar("name").notNull(), // "Manhã Semana 1", "Descanso", "Tarde"
  workDurationHours: decimal("work_duration_hours", { precision: 4, scale: 2 }), // 12.0 for 12x36
  restDurationHours: decimal("rest_duration_hours", { precision: 4, scale: 2 }), // 36.0 for 12x36
  daysOfWeekMask: integer("days_of_week_mask").array(), // [1,2,3,4,5] for Mon-Fri
  consecutiveDays: integer("consecutive_days").default(1), // How many consecutive days this segment applies
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  templateReference: foreignKey({
    columns: [table.templateId],
    foreignColumns: [rotationTemplates.id],
  }).onDelete('cascade'),
  shiftReference: foreignKey({
    columns: [table.shiftId],
    foreignColumns: [departmentShifts.id],
  }).onDelete('set null'),
  uniqueTemplateSequence: uniqueIndex("unique_template_sequence").on(table.templateId, table.sequenceOrder),
}));

// Rotation instances - generated cycles with specific date ranges
export const rotationInstances = pgTable("rotation_instances", {
  id: serial("id").primaryKey(),
  templateId: integer("template_id").notNull(),
  cycleNumber: integer("cycle_number").notNull(), // 1, 2, 3... for tracking cycles
  effectiveStart: date("effective_start").notNull(),
  effectiveEnd: date("effective_end").notNull(),
  status: varchar("status").default("active"), // "active", "completed", "cancelled"
  generatedAt: timestamp("generated_at").defaultNow(),
  generatedBy: varchar("generated_by"), // User who triggered generation
}, (table) => ({
  templateReference: foreignKey({
    columns: [table.templateId],
    foreignColumns: [rotationTemplates.id],
  }).onDelete('cascade'),
  generatedByReference: foreignKey({
    columns: [table.generatedBy],
    foreignColumns: [users.id],
  }),
  uniqueTemplateCycle: uniqueIndex("unique_template_cycle").on(table.templateId, table.cycleNumber),
}));

// User assignments to rotation templates
export const rotationUserAssignments = pgTable("rotation_user_assignments", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  templateId: integer("template_id").notNull(),
  anchorDate: date("anchor_date").notNull(), // Starting reference date for this user's rotation
  startingSegmentOrder: integer("starting_segment_order").default(1), // Which segment to start with
  activeInstanceId: integer("active_instance_id"), // Current active rotation instance
  isActive: boolean("is_active").default(true),
  assignedBy: varchar("assigned_by").notNull(),
  assignedAt: timestamp("assigned_at").defaultNow(),
  deactivatedAt: timestamp("deactivated_at"),
  deactivatedBy: varchar("deactivated_by"),
}, (table) => ({
  userReference: foreignKey({
    columns: [table.userId],
    foreignColumns: [users.id],
  }).onDelete('cascade'),
  templateReference: foreignKey({
    columns: [table.templateId],
    foreignColumns: [rotationTemplates.id],
  }).onDelete('cascade'),
  activeInstanceReference: foreignKey({
    columns: [table.activeInstanceId],
    foreignColumns: [rotationInstances.id],
  }).onDelete('set null'),
  assignedByReference: foreignKey({
    columns: [table.assignedBy],
    foreignColumns: [users.id],
  }),
  deactivatedByReference: foreignKey({
    columns: [table.deactivatedBy],
    foreignColumns: [users.id],
  }),
  uniqueUserTemplate: uniqueIndex("unique_user_template_active").on(table.userId, table.templateId, table.isActive),
}));

// Exceptions for rotation scheduling (holidays, manual overrides)
export const rotationExceptions = pgTable("rotation_exceptions", {
  id: serial("id").primaryKey(),
  templateId: integer("template_id"),
  userId: varchar("user_id"), // If null, applies to all users in template
  exceptionDate: date("exception_date").notNull(),
  originalShiftId: integer("original_shift_id"), // What was originally scheduled
  overrideShiftId: integer("override_shift_id"), // What to schedule instead (null = day off)
  reason: varchar("reason").notNull(), // "holiday", "manual_override", "sick_leave", etc.
  notes: text("notes"),
  createdBy: varchar("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  templateReference: foreignKey({
    columns: [table.templateId],
    foreignColumns: [rotationTemplates.id],
  }).onDelete('cascade'),
  userReference: foreignKey({
    columns: [table.userId],
    foreignColumns: [users.id],
  }).onDelete('cascade'),
  originalShiftReference: foreignKey({
    columns: [table.originalShiftId],
    foreignColumns: [departmentShifts.id],
  }),
  overrideShiftReference: foreignKey({
    columns: [table.overrideShiftId],
    foreignColumns: [departmentShifts.id],
  }),
  createdByReference: foreignKey({
    columns: [table.createdBy],
    foreignColumns: [users.id],
  }),
}));

// Audit trail for rotation recalculations and changes
export const rotationAudit = pgTable("rotation_audit", {
  id: serial("id").primaryKey(),
  templateId: integer("template_id").notNull(),
  action: varchar("action").notNull(), // "template_created", "assignments_generated", "manual_override", etc.
  affectedUsers: integer("affected_users").default(0), // How many users were impacted
  dateRange: varchar("date_range"), // "2024-01-01 to 2024-01-31"
  oldAssignmentCount: integer("old_assignment_count").default(0),
  newAssignmentCount: integer("new_assignment_count").default(0),
  details: jsonb("details"), // Additional details about the change
  performedBy: varchar("performed_by").notNull(),
  performedAt: timestamp("performed_at").defaultNow(),
}, (table) => ({
  templateReference: foreignKey({
    columns: [table.templateId],
    foreignColumns: [rotationTemplates.id],
  }).onDelete('cascade'),
  performedByReference: foreignKey({
    columns: [table.performedBy],
    foreignColumns: [users.id],
  }),
}));

// ========================================================================================
// ROTATION SCHEMA TYPES AND VALIDATION
// ========================================================================================

export type RotationTemplate = typeof rotationTemplates.$inferSelect;
export type RotationSegment = typeof rotationSegments.$inferSelect;
export type RotationInstance = typeof rotationInstances.$inferSelect;
export type RotationUserAssignment = typeof rotationUserAssignments.$inferSelect;
export type RotationException = typeof rotationExceptions.$inferSelect;
export type RotationAudit = typeof rotationAudit.$inferSelect;

export const insertRotationTemplateSchema = createInsertSchema(rotationTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertRotationTemplate = z.infer<typeof insertRotationTemplateSchema>;

export const insertRotationSegmentSchema = createInsertSchema(rotationSegments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertRotationSegment = z.infer<typeof insertRotationSegmentSchema>;

export const insertRotationUserAssignmentSchema = createInsertSchema(rotationUserAssignments).omit({
  id: true,
  assignedAt: true,
  deactivatedAt: true,
});
export type InsertRotationUserAssignment = z.infer<typeof insertRotationUserAssignmentSchema>;

export const insertRotationExceptionSchema = createInsertSchema(rotationExceptions).omit({
  id: true,
  createdAt: true,
});
export type InsertRotationException = z.infer<typeof insertRotationExceptionSchema>;

// Enhanced user shift assignment validation for sequential assignments
export const insertUserShiftAssignmentSequentialSchema = insertUserShiftAssignmentSchema.extend({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
}).refine((data) => {
  // If both dates are provided, endDate must be after startDate
  if (data.startDate && data.endDate) {
    return new Date(data.endDate) > new Date(data.startDate);
  }
  return true;
}, {
  message: "Data final deve ser posterior à data inicial",
  path: ["endDate"]
});

// ========================================================================================
// RECRUITMENT & SELECTION MODULE
// ========================================================================================

// Job openings / Vagas
export const jobOpenings = pgTable("job_openings", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull(),
  departmentId: integer("department_id"),
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  requirements: text("requirements"),
  responsibilities: text("responsibilities"),
  benefits: text("benefits"),
  location: varchar("location"),
  employmentType: varchar("employment_type").notNull(), // "CLT", "PJ", "Estágio", "Temporário"
  salaryRange: varchar("salary_range"), // "R$ 3.000 - R$ 5.000"
  workSchedule: varchar("work_schedule"), // "Segunda a Sexta, 8h-17h"
  vacancies: integer("vacancies").default(1), // Número de vagas
  status: varchar("status").default("draft"), // draft, published, closed, filled
  publishedAt: timestamp("published_at"),
  closedAt: timestamp("closed_at"),
  expiresAt: timestamp("expires_at"),
  createdBy: varchar("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  companyReference: foreignKey({
    columns: [table.companyId],
    foreignColumns: [companies.id],
  }),
  departmentReference: foreignKey({
    columns: [table.departmentId],
    foreignColumns: [departments.id],
  }),
  createdByReference: foreignKey({
    columns: [table.createdBy],
    foreignColumns: [users.id],
  }),
}));

// Candidates / Candidatos
export const candidates = pgTable("candidates", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull(),
  name: varchar("name").notNull(),
  email: varchar("email").notNull(),
  phone: varchar("phone"),
  cpf: varchar("cpf"),
  birthDate: date("birth_date"),
  address: text("address"),
  city: varchar("city"),
  state: varchar("state"),
  zipCode: varchar("zip_code"),
  latitude: real("latitude"), // Para cálculo de distância
  longitude: real("longitude"),
  resumeUrl: text("resume_url"), // URL do currículo
  linkedinUrl: text("linkedin_url"),
  portfolioUrl: text("portfolio_url"),
  skills: text("skills").array(), // Array de habilidades
  experience: text("experience"), // Experiência profissional resumida
  education: text("education"), // Formação acadêmica
  sourceChannel: varchar("source_channel"), // "LinkedIn", "Indeed", "Indicação", etc.
  notes: text("notes"), // Anotações internas
  status: varchar("status").default("active"), // active, blacklisted, hired
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  companyReference: foreignKey({
    columns: [table.companyId],
    foreignColumns: [companies.id],
  }),
  uniqueEmail: uniqueIndex("unique_candidate_email").on(table.companyId, table.email),
}));

// Applications / Candidaturas
export const applications = pgTable("applications", {
  id: serial("id").primaryKey(),
  jobOpeningId: integer("job_opening_id").notNull(),
  candidateId: integer("candidate_id").notNull(),
  status: varchar("status").default("applied"), // applied, screening, interview, test, approved, rejected, hired
  currentStageId: integer("current_stage_id"), // Etapa atual do processo
  score: integer("score").default(0), // Pontuação automática (0-100)
  distanceKm: real("distance_km"), // Distância em km do candidato até o local da vaga
  coverLetter: text("cover_letter"),
  appliedAt: timestamp("applied_at").defaultNow(),
  screeningNotes: text("screening_notes"),
  rejectionReason: text("rejection_reason"),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  jobOpeningReference: foreignKey({
    columns: [table.jobOpeningId],
    foreignColumns: [jobOpenings.id],
  }).onDelete('cascade'),
  candidateReference: foreignKey({
    columns: [table.candidateId],
    foreignColumns: [candidates.id],
  }).onDelete('cascade'),
  uniqueApplication: uniqueIndex("unique_application").on(table.jobOpeningId, table.candidateId),
}));

// Selection stages / Etapas do processo seletivo
export const selectionStages = pgTable("selection_stages", {
  id: serial("id").primaryKey(),
  jobOpeningId: integer("job_opening_id").notNull(),
  name: varchar("name").notNull(), // "Triagem", "Entrevista RH", "Entrevista Técnica", "Teste Prático"
  description: text("description"),
  order: integer("order").notNull(), // Ordem da etapa (1, 2, 3...)
  type: varchar("type").notNull(), // "screening", "interview", "test", "approval"
  isRequired: boolean("is_required").default(true),
  durationDays: integer("duration_days").default(3), // Prazo esperado em dias
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  jobOpeningReference: foreignKey({
    columns: [table.jobOpeningId],
    foreignColumns: [jobOpenings.id],
  }).onDelete('cascade'),
}));

// Interview templates / Templates de roteiro de entrevista
export const interviewTemplates = pgTable("interview_templates", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull(),
  name: varchar("name").notNull(),
  description: text("description"),
  type: varchar("type").notNull(), // "rh", "technical", "behavioral", "manager"
  questions: jsonb("questions").notNull(), // Array de objetos com perguntas e critérios
  isActive: boolean("is_active").default(true),
  createdBy: varchar("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  companyReference: foreignKey({
    columns: [table.companyId],
    foreignColumns: [companies.id],
  }),
  createdByReference: foreignKey({
    columns: [table.createdBy],
    foreignColumns: [users.id],
  }),
}));

// Interviews / Entrevistas agendadas
export const interviews = pgTable("interviews", {
  id: serial("id").primaryKey(),
  applicationId: integer("application_id").notNull(),
  templateId: integer("template_id"),
  interviewerIds: varchar("interviewer_ids").array(), // Array de IDs dos entrevistadores
  scheduledAt: timestamp("scheduled_at").notNull(),
  location: varchar("location"), // "Presencial - Sala 1", "Google Meet", etc.
  meetingUrl: text("meeting_url"),
  status: varchar("status").default("scheduled"), // scheduled, completed, cancelled, no_show
  feedback: text("feedback"),
  rating: integer("rating"), // 1-5
  evaluation: jsonb("evaluation"), // Respostas do template de entrevista
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  applicationReference: foreignKey({
    columns: [table.applicationId],
    foreignColumns: [applications.id],
  }).onDelete('cascade'),
  templateReference: foreignKey({
    columns: [table.templateId],
    foreignColumns: [interviewTemplates.id],
  }),
}));

// Onboarding links / Links de admissão digital
export const onboardingLinks = pgTable("onboarding_links", {
  id: serial("id").primaryKey(),
  applicationId: integer("application_id").notNull(),
  token: varchar("token").notNull().unique(), // Token único para o link
  candidateName: varchar("candidate_name").notNull(),
  candidateEmail: varchar("candidate_email").notNull(),
  candidatePhone: varchar("candidate_phone"),
  position: varchar("position").notNull(), // Cargo
  department: varchar("department"),
  startDate: date("start_date"), // Data de início prevista
  status: varchar("status").default("pending"), // pending, in_progress, completed, expired
  expiresAt: timestamp("expires_at").notNull(),
  completedAt: timestamp("completed_at"),
  createdBy: varchar("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  applicationReference: foreignKey({
    columns: [table.applicationId],
    foreignColumns: [applications.id],
  }).onDelete('cascade'),
  createdByReference: foreignKey({
    columns: [table.createdBy],
    foreignColumns: [users.id],
  }),
}));

// Onboarding documents / Documentos de admissão
export const onboardingDocuments = pgTable("onboarding_documents", {
  id: serial("id").primaryKey(),
  onboardingLinkId: integer("onboarding_link_id").notNull(),
  documentType: varchar("document_type").notNull(), // "rg", "cpf", "ctps", "titulo_eleitor", "comprovante_residencia", etc.
  fileName: varchar("file_name").notNull(),
  fileUrl: text("file_url").notNull(),
  fileSize: integer("file_size"),
  mimeType: varchar("mime_type"),
  status: varchar("status").default("pending_review"), // pending_review, approved, rejected
  reviewNotes: text("review_notes"),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
  reviewedAt: timestamp("reviewed_at"),
  reviewedBy: varchar("reviewed_by"),
}, (table) => ({
  onboardingLinkReference: foreignKey({
    columns: [table.onboardingLinkId],
    foreignColumns: [onboardingLinks.id],
  }).onDelete('cascade'),
  reviewedByReference: foreignKey({
    columns: [table.reviewedBy],
    foreignColumns: [users.id],
  }),
}));

// Onboarding form data / Dados do formulário de admissão
export const onboardingFormData = pgTable("onboarding_form_data", {
  id: serial("id").primaryKey(),
  onboardingLinkId: integer("onboarding_link_id").notNull().unique(),
  personalData: jsonb("personal_data"), // Dados pessoais
  contactData: jsonb("contact_data"), // Dados de contato
  bankData: jsonb("bank_data"), // Dados bancários
  dependents: jsonb("dependents"), // Dependentes
  emergencyContact: jsonb("emergency_contact"), // Contato de emergência
  contractData: jsonb("contract_data"), // Dados do contrato
  isComplete: boolean("is_complete").default(false),
  submittedAt: timestamp("submitted_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  onboardingLinkReference: foreignKey({
    columns: [table.onboardingLinkId],
    foreignColumns: [onboardingLinks.id],
  }).onDelete('cascade'),
}));

// ========================================================================================
// RECRUITMENT & SELECTION TYPES AND VALIDATION
// ========================================================================================

export type JobOpening = typeof jobOpenings.$inferSelect;
export type Candidate = typeof candidates.$inferSelect;
export type Application = typeof applications.$inferSelect;
export type SelectionStage = typeof selectionStages.$inferSelect;
export type InterviewTemplate = typeof interviewTemplates.$inferSelect;
export type Interview = typeof interviews.$inferSelect;
export type OnboardingLink = typeof onboardingLinks.$inferSelect;
export type OnboardingDocument = typeof onboardingDocuments.$inferSelect;
export type OnboardingFormData = typeof onboardingFormData.$inferSelect;

export const insertJobOpeningSchema = createInsertSchema(jobOpenings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertJobOpening = z.infer<typeof insertJobOpeningSchema>;

export const insertCandidateSchema = createInsertSchema(candidates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertCandidate = z.infer<typeof insertCandidateSchema>;

export const insertApplicationSchema = createInsertSchema(applications).omit({
  id: true,
  appliedAt: true,
  updatedAt: true,
});
export type InsertApplication = z.infer<typeof insertApplicationSchema>;

export const insertSelectionStageSchema = createInsertSchema(selectionStages).omit({
  id: true,
  createdAt: true,
});
export type InsertSelectionStage = z.infer<typeof insertSelectionStageSchema>;

export const insertInterviewTemplateSchema = createInsertSchema(interviewTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertInterviewTemplate = z.infer<typeof insertInterviewTemplateSchema>;

export const insertInterviewSchema = createInsertSchema(interviews).omit({
  id: true,
  createdAt: true,
});
export type InsertInterview = z.infer<typeof insertInterviewSchema>;

export const insertOnboardingLinkSchema = createInsertSchema(onboardingLinks).omit({
  id: true,
  createdAt: true,
});
export type InsertOnboardingLink = z.infer<typeof insertOnboardingLinkSchema>;

export const insertOnboardingDocumentSchema = createInsertSchema(onboardingDocuments).omit({
  id: true,
  uploadedAt: true,
});
export type InsertOnboardingDocument = z.infer<typeof insertOnboardingDocumentSchema>;

export const insertOnboardingFormDataSchema = createInsertSchema(onboardingFormData).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertOnboardingFormData = z.infer<typeof insertOnboardingFormDataSchema>;
