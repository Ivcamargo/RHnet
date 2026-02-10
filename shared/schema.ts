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
  toleranceBeforeMinutes: integer("tolerance_before_minutes").default(5), // Tolerância para entrada antecipada (padrão: 5 min)
  toleranceAfterMinutes: integer("tolerance_after_minutes").default(5), // Tolerância para entrada atrasada (padrão: 5 min)
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
  deviceId: integer("device_id"), // ID do terminal autorizado (se registrado via terminal fixo)
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
  
  // Overtime tracking (novo sistema de HE)
  overtimeRuleId: integer("overtime_rule_id"), // ID da regra de HE aplicada
  overtimeType: varchar("overtime_type"), // "paid" ou "time_bank"
  overtimeBreakdown: jsonb("overtime_breakdown"), // Detalhamento por tier: [{ tier: 1, hours: 2, percentage: 50, equivalentHours: 3 }]
  timeBankHours: decimal("time_bank_hours", { precision: 6, scale: 2 }).default('0'), // Horas creditadas no banco
  
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

// Authorized devices for fixed time clock terminals
export const authorizedDevices = pgTable("authorized_devices", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull(),
  deviceCode: varchar("device_code", { length: 50 }).notNull().unique(),
  deviceName: varchar("device_name", { length: 100 }).notNull(),
  location: varchar("location", { length: 100 }).notNull(), // Text description
  latitude: real("latitude"), // Terminal geofence center
  longitude: real("longitude"), // Terminal geofence center
  radius: integer("radius").default(100), // Meters - geofence radius
  isActive: boolean("is_active").default(true),
  lastUsedAt: timestamp("last_used_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  companyReference: foreignKey({
    columns: [table.companyId],
    foreignColumns: [companies.id],
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
  targetType: varchar("target_type"), // 'individual' | 'all' | 'department' | 'sector' | 'position'
  targetId: integer("target_id"), // ID do departamento, setor (quando aplicável)
  targetValue: varchar("target_value"), // Valor específico como nome do cargo
  relatedDocumentId: integer("related_document_id"), // Link para documento relacionado
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

// Time Entry Audit table - tracks all changes to time entries
export const timeEntryAudit = pgTable("time_entry_audit", {
  id: serial("id").primaryKey(),
  timeEntryId: integer("time_entry_id").notNull(),
  fieldName: varchar("field_name").notNull(), // clockInTime, clockOutTime, etc.
  oldValue: text("old_value"), // Valor anterior
  newValue: text("new_value"), // Valor novo
  justification: text("justification").notNull(), // Justificativa obrigatória
  attachmentUrl: text("attachment_url"), // URL do arquivo de comprovante (atestado, recibo, etc)
  editedBy: varchar("edited_by").notNull(), // User ID que fez a alteração
  ipAddress: varchar("ip_address"), // IP do editor
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  timeEntryReference: foreignKey({
    columns: [table.timeEntryId],
    foreignColumns: [timeEntries.id],
  }).onDelete('cascade'),
  editedByReference: foreignKey({
    columns: [table.editedBy],
    foreignColumns: [users.id],
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
export type TimeEntryAudit = typeof timeEntryAudit.$inferSelect;
export type TimePeriod = typeof timePeriods.$inferSelect;
export type AuthorizedDevice = typeof authorizedDevices.$inferSelect;

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
// Apenas campos básicos são obrigatórios. Demais campos são opcionais e podem ser preenchidos depois.
export const baseCompleteEmployeeSchema = insertUserSchema.extend({
  // ===== CAMPOS OBRIGATÓRIOS (BÁSICOS) =====
  
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
  
  // Dados profissionais obrigatórios
  position: z.string().min(2, "Cargo é obrigatório"),
  
  // ===== CAMPOS OPCIONAIS COM VALIDAÇÃO CONDICIONAL =====
  
  // Documentos opcionais (validam formato apenas se preenchidos)
  rg: z.string().min(5, "RG deve ter pelo menos 5 caracteres").or(z.literal("")).optional(),
  rgIssuingOrgan: z.string().min(2, "Órgão emissor deve ter pelo menos 2 caracteres").or(z.literal("")).optional(),
  ctps: z.string().or(z.literal("")).optional(),
  pisPasep: z.string().or(z.literal("")).optional(),
  tituloEleitor: z.string().or(z.literal("")).optional(),
  
  // Dados pessoais opcionais
  birthDate: z.string()
    .refine((date) => {
      if (!date || date === "") return true; // Aceita vazio
      const birthDate = new Date(date);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      return age >= 16 && age <= 100;
    }, "Idade deve estar entre 16 e 100 anos")
    .or(z.literal(""))
    .nullable()
    .optional(),
  
  maritalStatus: z.enum(["solteiro", "casado", "divorciado", "viuvo", "uniao_estavel"]).or(z.literal("")).optional(),
  gender: z.enum(["masculino", "feminino", "outro", "prefiro_nao_informar"]).or(z.literal("")).optional(),
  nationality: z.string().or(z.literal("")).optional(),
  naturalness: z.string().or(z.literal("")).optional(),
  
  // Endereço opcional
  cep: z.string()
    .refine((cep) => {
      if (!cep || cep === "") return true; // Aceita vazio
      return /^\d{5}-\d{3}$/.test(cep);
    }, "CEP deve estar no formato XXXXX-XXX")
    .or(z.literal(""))
    .optional(),
  address: z.string().or(z.literal("")).optional(),
  addressNumber: z.string().or(z.literal("")).optional(),
  addressComplement: z.string().or(z.literal("")).optional(),
  neighborhood: z.string().or(z.literal("")).optional(),
  city: z.string().or(z.literal("")).optional(),
  state: z.string()
    .refine((state) => {
      if (!state || state === "") return true; // Aceita vazio
      return state.length === 2;
    }, "Estado deve ter 2 caracteres")
    .or(z.literal(""))
    .optional(),
  country: z.string().or(z.literal("")).optional(),
  
  // Contatos opcionais
  personalPhone: z.string()
    .refine((phone) => {
      if (!phone || phone === "") return true; // Aceita vazio
      return /^\(\d{2}\) \d{4,5}-\d{4}$/.test(phone);
    }, "Telefone deve estar no formato (XX) XXXXX-XXXX")
    .or(z.literal(""))
    .optional(),
  commercialPhone: z.string()
    .refine((phone) => {
      if (!phone || phone === "") return true; // Aceita vazio
      return /^\(\d{2}\) \d{4,5}-\d{4}$/.test(phone);
    }, "Telefone deve estar no formato (XX) XXXXX-XXXX")
    .or(z.literal(""))
    .optional(),
  emergencyContactName: z.string().or(z.literal("")).optional(),
  emergencyContactPhone: z.string()
    .refine((phone) => {
      if (!phone || phone === "") return true; // Aceita vazio
      return /^\(\d{2}\) \d{4,5}-\d{4}$/.test(phone);
    }, "Telefone deve estar no formato (XX) XXXXX-XXXX")
    .or(z.literal(""))
    .optional(),
  emergencyContactRelationship: z.string().or(z.literal("")).optional(),
  
  // Dados profissionais opcionais
  internalId: z.string().or(z.literal("")).optional(),
  admissionDate: z.string()
    .refine((date) => {
      if (!date || date === "") return true; // Aceita vazio
      const admissionDate = new Date(date);
      const today = new Date();
      return admissionDate <= today;
    }, "Data de admissão não pode ser futura")
    .or(z.literal(""))
    .nullable()
    .optional(),
  contractType: z.enum(["clt", "pj", "estagio", "terceirizado", "temporario"]).or(z.literal("")).optional(),
  workSchedule: z.enum(["integral", "meio_periodo", "flexivel"]).or(z.literal("")).optional(),
  salary: z.coerce.number().min(0, "Salário deve ser positivo").or(z.literal("")).or(z.literal(0)).optional(),
  benefits: z.string().or(z.literal("")).optional(),
  
  // Dados bancários opcionais
  bankCode: z.string()
    .refine((code) => {
      if (!code || code === "") return true; // Aceita vazio
      return code.length === 3;
    }, "Código do banco deve ter 3 dígitos")
    .or(z.literal(""))
    .optional(),
  bankName: z.string().or(z.literal("")).optional(),
  agencyNumber: z.string().or(z.literal("")).optional(),
  accountNumber: z.string().or(z.literal("")).optional(),
  accountType: z.enum(["corrente", "poupanca"]).or(z.literal("")).optional(),
  pixKey: z.string().or(z.literal("")).optional(),
  
  // Escolaridade opcional
  educationLevel: z.enum(["fundamental", "medio", "superior", "pos_graduacao", "mestrado", "doutorado"]).or(z.literal("")).optional(),
  institution: z.string().or(z.literal("")).optional(),
  course: z.string().or(z.literal("")).optional(),
  graduationYear: z.coerce.number().or(z.literal("")).or(z.literal(0)).optional(),
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

export const insertAuthorizedDeviceSchema = createInsertSchema(authorizedDevices).omit({
  id: true,
  lastUsedAt: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertAuthorizedDevice = z.infer<typeof insertAuthorizedDeviceSchema>;

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
  salaryMin: decimal("salary_min", { precision: 10, scale: 2 }), // Salário mínimo
  salaryMax: decimal("salary_max", { precision: 10, scale: 2 }), // Salário máximo
  salaryRange: varchar("salary_range"), // Legacy field, deprecated - use salaryMin/Max
  workSchedule: varchar("work_schedule"), // "Segunda a Sexta, 8h-17h"
  vacancies: integer("vacancies").default(1), // Número de vagas
  status: varchar("status").default("draft"), // draft, published, closed, filled
  requiresDISC: boolean("requires_disc").default(false), // Se a vaga exige teste DISC
  discTiming: varchar("disc_timing"), // "on_application" ou "during_selection"
  idealDISCProfile: jsonb("ideal_disc_profile"), // {d: 30, i: 25, s: 25, c: 20} percentuais do perfil ideal
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
  score: integer("score").default(0), // Pontuação ponderada (Σ(Pi × Wi))
  isQualified: boolean("is_qualified").default(true), // false se reprovou no corte obrigatório
  distanceKm: real("distance_km"), // Distância em km do candidato até o local da vaga
  coverLetter: text("cover_letter"),
  accessToken: varchar("access_token"), // Token único para acesso público às respostas de requisitos
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
  accessTokenIndex: index("access_token_idx").on(table.accessToken),
}));

// Job requirements / Requisitos da vaga
export const jobRequirements = pgTable("job_requirements", {
  id: serial("id").primaryKey(),
  jobOpeningId: integer("job_opening_id").notNull(),
  title: varchar("title").notNull(), // Ex: "JavaScript", "Liderança", "Experiência mínima"
  description: text("description"), // Descrição detalhada do requisito
  category: varchar("category").notNull(), // "hard_skill", "soft_skill", "administrative"
  requirementType: varchar("requirement_type").notNull(), // "mandatory" (corte), "desirable" (pontuação)
  weight: integer("weight").default(1), // Peso de 1 a 5 para requisitos desejáveis
  proficiencyLevels: jsonb("proficiency_levels").notNull(), // [{level: "Básico", points: 1}, {level: "Intermediário", points: 3}, ...]
  order: integer("order").default(0), // Ordem de exibição
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  jobOpeningReference: foreignKey({
    columns: [table.jobOpeningId],
    foreignColumns: [jobOpenings.id],
  }).onDelete('cascade'),
  jobOpeningIndex: index("job_requirements_job_opening_idx").on(table.jobOpeningId),
}));

// Application requirement responses / Respostas dos candidatos aos requisitos
export const applicationRequirementResponses = pgTable("application_requirement_responses", {
  id: serial("id").primaryKey(),
  applicationId: integer("application_id").notNull(),
  requirementId: integer("requirement_id").notNull(),
  proficiencyLevel: varchar("proficiency_level").notNull(), // Nível declarado pelo candidato
  pointsEarned: integer("points_earned").default(0), // Pontos ganhos neste requisito
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  applicationReference: foreignKey({
    columns: [table.applicationId],
    foreignColumns: [applications.id],
  }).onDelete('cascade'),
  requirementReference: foreignKey({
    columns: [table.requirementId],
    foreignColumns: [jobRequirements.id],
  }).onDelete('cascade'),
  uniqueResponse: uniqueIndex("unique_requirement_response").on(table.applicationId, table.requirementId),
  applicationIndex: index("app_requirement_responses_application_idx").on(table.applicationId),
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
// DISC PERSONALITY ASSESSMENT
// ========================================================================================

// DISC questions / Questões do teste DISC
export const discQuestions = pgTable("disc_questions", {
  id: serial("id").primaryKey(),
  questionText: text("question_text").notNull(), // Texto da questão
  profileType: varchar("profile_type").notNull(), // "D", "I", "S", "C"
  order: integer("order").notNull(), // Ordem de exibição
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// DISC assessments / Avaliações DISC aplicadas
export const discAssessments = pgTable("disc_assessments", {
  id: serial("id").primaryKey(),
  applicationId: integer("application_id"), // Vinculado a candidatura (pode ser null se enviado antes)
  candidateId: integer("candidate_id"), // Vinculado a candidato
  jobOpeningId: integer("job_opening_id").notNull(), // Vaga relacionada
  accessToken: varchar("access_token").notNull().unique(), // Token único para acesso público
  status: varchar("status").default("pending"), // pending, in_progress, completed
  dScore: integer("d_score").default(0), // Pontuação Dominância (0-100%)
  iScore: integer("i_score").default(0), // Pontuação Influência (0-100%)
  sScore: integer("s_score").default(0), // Pontuação Estabilidade (0-100%)
  cScore: integer("c_score").default(0), // Pontuação Conformidade (0-100%)
  primaryProfile: varchar("primary_profile"), // Perfil predominante: "D", "I", "S", "C"
  sentAt: timestamp("sent_at").defaultNow(),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  expiresAt: timestamp("expires_at"), // Data de expiração do link
  createdBy: varchar("created_by"), // Quem enviou o teste (NULL para candidaturas públicas)
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  applicationReference: foreignKey({
    columns: [table.applicationId],
    foreignColumns: [applications.id],
  }).onDelete('cascade'),
  candidateReference: foreignKey({
    columns: [table.candidateId],
    foreignColumns: [candidates.id],
  }).onDelete('cascade'),
  jobOpeningReference: foreignKey({
    columns: [table.jobOpeningId],
    foreignColumns: [jobOpenings.id],
  }).onDelete('cascade'),
  accessTokenIndex: index("disc_access_token_idx").on(table.accessToken),
}));

// DISC responses / Respostas do candidato
export const discResponses = pgTable("disc_responses", {
  id: serial("id").primaryKey(),
  assessmentId: integer("assessment_id").notNull(),
  questionId: integer("question_id").notNull(),
  selectedValue: integer("selected_value").notNull(), // Escala 1-5 (Discordo totalmente a Concordo totalmente)
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  assessmentReference: foreignKey({
    columns: [table.assessmentId],
    foreignColumns: [discAssessments.id],
  }).onDelete('cascade'),
  questionReference: foreignKey({
    columns: [table.questionId],
    foreignColumns: [discQuestions.id],
  }),
  uniqueResponse: uniqueIndex("unique_disc_response").on(table.assessmentId, table.questionId),
  assessmentIndex: index("disc_responses_assessment_idx").on(table.assessmentId),
}));

// ========================================================================================
// RECRUITMENT & SELECTION TYPES AND VALIDATION
// ========================================================================================

export type JobOpening = typeof jobOpenings.$inferSelect;
export type Candidate = typeof candidates.$inferSelect;
export type Application = typeof applications.$inferSelect;
export type JobRequirement = typeof jobRequirements.$inferSelect;
export type ApplicationRequirementResponse = typeof applicationRequirementResponses.$inferSelect;
export type SelectionStage = typeof selectionStages.$inferSelect;
export type InterviewTemplate = typeof interviewTemplates.$inferSelect;
export type Interview = typeof interviews.$inferSelect;
export type OnboardingLink = typeof onboardingLinks.$inferSelect;
export type OnboardingDocument = typeof onboardingDocuments.$inferSelect;
export type OnboardingFormData = typeof onboardingFormData.$inferSelect;
export type DISCQuestion = typeof discQuestions.$inferSelect;
export type DISCAssessment = typeof discAssessments.$inferSelect;
export type DISCResponse = typeof discResponses.$inferSelect;

export const insertJobOpeningSchema = createInsertSchema(jobOpenings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).refine((data) => {
  // Validate that salaryMin <= salaryMax when both are provided
  if (data.salaryMin && data.salaryMax) {
    const min = parseFloat(data.salaryMin);
    const max = parseFloat(data.salaryMax);
    return min <= max;
  }
  return true;
}, {
  message: "Salário mínimo deve ser menor ou igual ao salário máximo",
  path: ["salaryMax"]
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

// Proficiency level schema for job requirements
export const proficiencyLevelSchema = z.object({
  level: z.string().min(1, "Nível é obrigatório"),
  points: z.number().int().min(0, "Pontos devem ser >= 0"),
});

// Job requirement insert schema with validation
export const insertJobRequirementSchema = createInsertSchema(jobRequirements).omit({
  id: true,
  createdAt: true,
}).extend({
  category: z.enum(["hard_skill", "soft_skill", "administrative"], {
    errorMap: () => ({ message: "Categoria deve ser hard_skill, soft_skill ou administrative" }),
  }),
  requirementType: z.enum(["mandatory", "desirable"], {
    errorMap: () => ({ message: "Tipo deve ser mandatory ou desirable" }),
  }),
  weight: z.number().int().min(1).max(5).optional().default(1),
  proficiencyLevels: z.array(proficiencyLevelSchema).min(1, "Deve ter ao menos um nível de proficiência"),
});
export type InsertJobRequirement = z.infer<typeof insertJobRequirementSchema>;

// Application requirement response insert schema
export const insertApplicationRequirementResponseSchema = createInsertSchema(applicationRequirementResponses).omit({
  id: true,
  createdAt: true,
  pointsEarned: true, // Calculado automaticamente
});
export type InsertApplicationRequirementResponse = z.infer<typeof insertApplicationRequirementResponseSchema>;

// DISC question insert schema
export const insertDISCQuestionSchema = createInsertSchema(discQuestions).omit({
  id: true,
  createdAt: true,
});
export type InsertDISCQuestion = z.infer<typeof insertDISCQuestionSchema>;

// DISC assessment insert schema
export const insertDISCAssessmentSchema = createInsertSchema(discAssessments).omit({
  id: true,
  sentAt: true,
  createdAt: true,
  dScore: true,
  iScore: true,
  sScore: true,
  cScore: true,
  primaryProfile: true,
  startedAt: true,
  completedAt: true,
});
export type InsertDISCAssessment = z.infer<typeof insertDISCAssessmentSchema>;

// DISC response insert schema
export const insertDISCResponseSchema = createInsertSchema(discResponses).omit({
  id: true,
  createdAt: true,
}).extend({
  selectedValue: z.number().int().min(1).max(5, "Valor deve ser entre 1 e 5"),
});
export type InsertDISCResponse = z.infer<typeof insertDISCResponseSchema>;

// ========================================================================================
// OVERTIME & TIME BANK SYSTEM
// ========================================================================================

// Overtime rules - Configuration for overtime calculation by department/shift
export const overtimeRules = pgTable("overtime_rules", {
  id: serial("id").primaryKey(),
  departmentId: integer("department_id").notNull(),
  shiftId: integer("shift_id"), // Optional: specific shift, null = applies to all shifts in department
  name: varchar("name").notNull(), // "Regra de HE Padrão", "HE Fim de Semana"
  overtimeType: varchar("overtime_type").notNull(), // "paid" or "time_bank"
  applyToWeekdays: boolean("apply_to_weekdays").default(true),
  applyToWeekends: boolean("apply_to_weekends").default(false),
  applyToHolidays: boolean("apply_to_holidays").default(false),
  isActive: boolean("is_active").default(true),
  priority: integer("priority").default(0), // Higher priority rules override lower ones
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  departmentReference: foreignKey({
    columns: [table.departmentId],
    foreignColumns: [departments.id],
  }).onDelete('cascade'),
  shiftReference: foreignKey({
    columns: [table.shiftId],
    foreignColumns: [departmentShifts.id],
  }).onDelete('cascade'),
}));

// Overtime tiers - Percentage rates for different hour ranges
export const overtimeTiers = pgTable("overtime_tiers", {
  id: serial("id").primaryKey(),
  overtimeRuleId: integer("overtime_rule_id").notNull(),
  minHours: decimal("min_hours", { precision: 4, scale: 2 }).notNull(), // 0.00
  maxHours: decimal("max_hours", { precision: 4, scale: 2 }), // null = no limit
  percentage: integer("percentage").notNull(), // 50, 100, 200 (represents 50%, 100%, 200%)
  description: varchar("description"), // "Primeiras 2 horas", "Acima de 2 horas"
  orderIndex: integer("order_index").default(0),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  overtimeRuleReference: foreignKey({
    columns: [table.overtimeRuleId],
    foreignColumns: [overtimeRules.id],
  }).onDelete('cascade'),
}));

// Time bank - Employee time bank balance
export const timeBank = pgTable("time_bank", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().unique(),
  companyId: integer("company_id").notNull(),
  balanceHours: decimal("balance_hours", { precision: 8, scale: 2 }).default('0'), // Current balance
  totalCredited: decimal("total_credited", { precision: 8, scale: 2 }).default('0'), // Total hours credited
  totalDebited: decimal("total_debited", { precision: 8, scale: 2 }).default('0'), // Total hours debited
  expirationDate: date("expiration_date"), // Optional: date when balance expires
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
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

// Time bank transactions - History of credits and debits
export const timeBankTransactions = pgTable("time_bank_transactions", {
  id: serial("id").primaryKey(),
  timeBankId: integer("time_bank_id").notNull(),
  userId: varchar("user_id").notNull(),
  transactionType: varchar("transaction_type").notNull(), // "credit" or "debit"
  hours: decimal("hours", { precision: 6, scale: 2 }).notNull(),
  balanceAfter: decimal("balance_after", { precision: 8, scale: 2 }).notNull(),
  timeEntryId: integer("time_entry_id"), // Link to the time entry that generated this transaction
  reason: varchar("reason").notNull(), // "Hora extra trabalhada", "Compensação utilizada", "Ajuste manual"
  description: text("description"), // Additional details
  createdBy: varchar("created_by"), // Admin who created manual adjustments
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  timeBankReference: foreignKey({
    columns: [table.timeBankId],
    foreignColumns: [timeBank.id],
  }).onDelete('cascade'),
  userReference: foreignKey({
    columns: [table.userId],
    foreignColumns: [users.id],
  }).onDelete('cascade'),
  timeEntryReference: foreignKey({
    columns: [table.timeEntryId],
    foreignColumns: [timeEntries.id],
  }),
}));

// Types for Overtime System
export type OvertimeRule = typeof overtimeRules.$inferSelect;
export type OvertimeTier = typeof overtimeTiers.$inferSelect;
export type TimeBank = typeof timeBank.$inferSelect;
export type TimeBankTransaction = typeof timeBankTransactions.$inferSelect;

// Insert schemas
export const insertOvertimeRuleSchema = createInsertSchema(overtimeRules).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertOvertimeRule = z.infer<typeof insertOvertimeRuleSchema>;

export const insertOvertimeTierSchema = createInsertSchema(overtimeTiers).omit({
  id: true,
  createdAt: true,
});
export type InsertOvertimeTier = z.infer<typeof insertOvertimeTierSchema>;

export const insertTimeBankSchema = createInsertSchema(timeBank).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertTimeBank = z.infer<typeof insertTimeBankSchema>;

export const insertTimeBankTransactionSchema = createInsertSchema(timeBankTransactions).omit({
  id: true,
  createdAt: true,
});
export type InsertTimeBankTransaction = z.infer<typeof insertTimeBankTransactionSchema>;

// Legal Files - AFD/AEJ metadata storage
export const legalFiles = pgTable("legal_files", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull(),
  type: varchar("type").notNull(), // "AFD" or "AEJ"
  periodStart: date("period_start").notNull(),
  periodEnd: date("period_end").notNull(),
  nsrStart: integer("nsr_start"), // First NSR in this file
  nsrEnd: integer("nsr_end"), // Last NSR in this file
  totalRecords: integer("total_records").default(0),
  filePath: text("file_path"), // Path to stored file
  sha256Hash: varchar("sha256_hash", { length: 64 }), // SHA-256 of file content
  crcAggregate: varchar("crc_aggregate"), // Aggregate CRC for validation
  repIdentifier: varchar("rep_identifier").default("REP-P-001"), // REP equipment identifier
  generatedBy: varchar("generated_by"), // User who generated the file
  generatedAt: timestamp("generated_at").defaultNow(),
  status: varchar("status").default("generated"), // generated, downloaded, submitted
  digitalSignatureMeta: jsonb("digital_signature_meta"), // Placeholder for future CAdES signature
  description: text("description"), // Additional notes
}, (table) => ({
  companyReference: foreignKey({
    columns: [table.companyId],
    foreignColumns: [companies.id],
  }),
  generatedByReference: foreignKey({
    columns: [table.generatedBy],
    foreignColumns: [users.id],
  }),
}));

// Legal NSR Sequences - Ensures monotonic NSR per company/REP
export const legalNsrSequences = pgTable("legal_nsr_sequences", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull().unique(),
  currentNsr: integer("current_nsr").default(0).notNull(),
  repIdentifier: varchar("rep_identifier").default("REP-P-001").notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  companyReference: foreignKey({
    columns: [table.companyId],
    foreignColumns: [companies.id],
  }),
}));

// Types for Legal Files
export type LegalFile = typeof legalFiles.$inferSelect;
export type LegalNsrSequence = typeof legalNsrSequences.$inferSelect;

// Insert schemas
export const insertLegalFileSchema = createInsertSchema(legalFiles).omit({
  id: true,
  generatedAt: true,
});
export type InsertLegalFile = z.infer<typeof insertLegalFileSchema>;

export const insertLegalNsrSequenceSchema = createInsertSchema(legalNsrSequences).omit({
  id: true,
  updatedAt: true,
});
export type InsertLegalNsrSequence = z.infer<typeof insertLegalNsrSequenceSchema>;

// Leads - Pre-sales contact capture
export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  email: varchar("email").notNull(),
  phone: varchar("phone"),
  companyName: varchar("company_name"),
  message: text("message"),
  status: varchar("status").default("new").notNull(), // new, contacted, meeting_scheduled, proposal_sent, contracted, lost
  sourceChannel: varchar("source_channel").default("website"), // website, referral, etc
  utmSource: varchar("utm_source"),
  utmMedium: varchar("utm_medium"),
  utmCampaign: varchar("utm_campaign"),
  assignedTo: varchar("assigned_to"), // User ID of sales rep
  companyId: integer("company_id"), // Nullable - only set if lead converts to customer
  followUpNotes: text("follow_up_notes"),
  lastContactedAt: timestamp("last_contacted_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  assignedToReference: foreignKey({
    columns: [table.assignedTo],
    foreignColumns: [users.id],
  }),
  companyReference: foreignKey({
    columns: [table.companyId],
    foreignColumns: [companies.id],
  }),
}));

// Types for Leads
export type Lead = typeof leads.$inferSelect;

// Insert schema for leads
export const insertLeadSchema = createInsertSchema(leads, {
  email: z.string().email("Email inválido"),
  phone: z.string().optional(),
  companyName: z.string().optional(),
  message: z.string().optional(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastContactedAt: true,
  status: true,
  sourceChannel: true,
  assignedTo: true,
  companyId: true,
  followUpNotes: true,
  utmSource: true,
  utmMedium: true,
  utmCampaign: true,
});
export type InsertLead = z.infer<typeof insertLeadSchema>;

// Update schema for lead status management (admin only)
export const updateLeadStatusSchema = z.object({
  status: z.enum(["new", "contacted", "meeting_scheduled", "proposal_sent", "contracted", "lost"]),
  followUpNotes: z.string().optional(),
  assignedTo: z.string().optional(),
});

// ============= INVENTORY & EPI MANAGEMENT SYSTEM =============

// Inventory Categories - Types of inventory items (EPI, Uniforms, Materials)
export const inventoryCategories = pgTable("inventory_categories", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull(),
  name: varchar("name").notNull(),
  description: text("description"),
  type: varchar("type").notNull(), // "epi", "uniform", "material", "tool"
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  companyReference: foreignKey({
    columns: [table.companyId],
    foreignColumns: [companies.id],
  }),
}));

// Inventory Items - Catalog of items available in inventory
export const inventoryItems = pgTable("inventory_items", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id").notNull(),
  categoryId: integer("category_id").notNull(),
  code: varchar("code").notNull(), // SKU or internal code
  name: varchar("name").notNull(),
  description: text("description"),
  unit: varchar("unit").default("un"), // un, par, kg, m, etc
  hasValidity: boolean("has_validity").default(false), // EPIs usually have expiry
  validityMonths: integer("validity_months"), // Default validity in months (e.g., 6 for helmet)
  minStock: integer("min_stock").default(0), // Alert threshold
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  companyReference: foreignKey({
    columns: [table.companyId],
    foreignColumns: [companies.id],
  }),
  categoryReference: foreignKey({
    columns: [table.categoryId],
    foreignColumns: [inventoryCategories.id],
  }),
}));

// Inventory Stock - Current stock levels by location
export const inventoryStock = pgTable("inventory_stock", {
  id: serial("id").primaryKey(),
  itemId: integer("item_id").notNull(),
  companyId: integer("company_id").notNull(),
  quantity: integer("quantity").default(0).notNull(),
  location: varchar("location").default("Estoque Principal"), // Storage location
  lastUpdateBy: varchar("last_update_by"),
  lastUpdateAt: timestamp("last_update_at").defaultNow(),
}, (table) => ({
  itemReference: foreignKey({
    columns: [table.itemId],
    foreignColumns: [inventoryItems.id],
  }),
  companyReference: foreignKey({
    columns: [table.companyId],
    foreignColumns: [companies.id],
  }),
  lastUpdateByReference: foreignKey({
    columns: [table.lastUpdateBy],
    foreignColumns: [users.id],
  }),
}));

// Inventory Movements - Track all stock movements (in/out)
export const inventoryMovements = pgTable("inventory_movements", {
  id: serial("id").primaryKey(),
  itemId: integer("item_id").notNull(),
  companyId: integer("company_id").notNull(),
  type: varchar("type").notNull(), // "in" (entrada), "out" (saída), "adjustment"
  quantity: integer("quantity").notNull(),
  reason: varchar("reason").notNull(), // Entrada: "purchase", "return", "donation" | Saída: "distribution", "loss", "damage", "expired", "disposal" | Ajuste: "correction", "recount"
  referenceId: integer("reference_id"), // Link to employee_items if distribution
  notes: text("notes"),
  transactionDate: timestamp("transaction_date").notNull().defaultNow(), // Data real da movimentação (ex: data da NF)
  createdBy: varchar("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  itemReference: foreignKey({
    columns: [table.itemId],
    foreignColumns: [inventoryItems.id],
  }),
  companyReference: foreignKey({
    columns: [table.companyId],
    foreignColumns: [companies.id],
  }),
  createdByReference: foreignKey({
    columns: [table.createdBy],
    foreignColumns: [users.id],
  }),
}));

// Employee Items - Items distributed to employees (with digital signatures)
export const employeeItems = pgTable("employee_items", {
  id: serial("id").primaryKey(),
  employeeId: varchar("employee_id").notNull(),
  itemId: integer("item_id").notNull(),
  companyId: integer("company_id").notNull(),
  quantity: integer("quantity").notNull(),
  
  // Delivery information
  deliveryDate: timestamp("delivery_date").defaultNow().notNull(),
  expiryDate: timestamp("expiry_date"), // Calculated based on hasValidity
  deliverySignature: text("delivery_signature"), // Base64 encoded signature image
  deliveredBy: varchar("delivered_by").notNull(), // Admin/Supervisor who delivered
  
  // Return information
  returnDate: timestamp("return_date"),
  returnSignature: text("return_signature"), // Base64 encoded signature image
  returnReason: text("return_reason"),
  returnedBy: varchar("returned_by"), // Admin/Supervisor who processed return
  
  // Status tracking
  status: varchar("status").default("active").notNull(), // "active", "returned", "expired"
  
  // Document integration
  deliveryDocumentId: integer("delivery_document_id"), // Link to documents table
  returnDocumentId: integer("return_document_id"), // Link to documents table
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  employeeReference: foreignKey({
    columns: [table.employeeId],
    foreignColumns: [users.id],
  }),
  itemReference: foreignKey({
    columns: [table.itemId],
    foreignColumns: [inventoryItems.id],
  }),
  companyReference: foreignKey({
    columns: [table.companyId],
    foreignColumns: [companies.id],
  }),
  deliveredByReference: foreignKey({
    columns: [table.deliveredBy],
    foreignColumns: [users.id],
  }),
  returnedByReference: foreignKey({
    columns: [table.returnedBy],
    foreignColumns: [users.id],
  }),
  deliveryDocumentReference: foreignKey({
    columns: [table.deliveryDocumentId],
    foreignColumns: [documents.id],
  }),
  returnDocumentReference: foreignKey({
    columns: [table.returnDocumentId],
    foreignColumns: [documents.id],
  }),
}));

// Types for Inventory System
export type InventoryCategory = typeof inventoryCategories.$inferSelect;
export type InventoryItem = typeof inventoryItems.$inferSelect;
export type InventoryStock = typeof inventoryStock.$inferSelect;
export type InventoryMovement = typeof inventoryMovements.$inferSelect;
export type EmployeeItem = typeof employeeItems.$inferSelect;

// Insert schemas for Inventory System
export const insertInventoryCategorySchema = createInsertSchema(inventoryCategories).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertInventoryCategory = z.infer<typeof insertInventoryCategorySchema>;

export const insertInventoryItemSchema = createInsertSchema(inventoryItems).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertInventoryItem = z.infer<typeof insertInventoryItemSchema>;

export const insertInventoryStockSchema = createInsertSchema(inventoryStock).omit({
  id: true,
  lastUpdateAt: true,
});
export type InsertInventoryStock = z.infer<typeof insertInventoryStockSchema>;

export const insertInventoryMovementSchema = createInsertSchema(inventoryMovements).omit({
  id: true,
  createdAt: true,
});
export type InsertInventoryMovement = z.infer<typeof insertInventoryMovementSchema>;

export const insertEmployeeItemSchema = createInsertSchema(employeeItems).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  deliveryDate: true,
  status: true,
});
export type InsertEmployeeItem = z.infer<typeof insertEmployeeItemSchema>;

// ============= ABSENCE MANAGEMENT SYSTEM (Férias e Afastamentos) =============

// Enums para validação de ausências
export const absenceTypeEnum = z.enum([
  "vacation",           // Férias
  "medical_leave",      // Licença médica
  "maternity_leave",    // Licença maternidade
  "paternity_leave",    // Licença paternidade
  "bereavement",        // Luto/Nojo
  "wedding",            // Casamento (gala)
  "blood_donation",     // Doação de sangue
  "military_service",   // Serviço militar
  "jury_duty",          // Serviço como jurado
  "other"               // Outros
]);

export const absenceStatusEnum = z.enum([
  "pending",    // Pendente de aprovação
  "approved",   // Aprovado
  "rejected",   // Rejeitado
  "cancelled"   // Cancelado
]);

export type AbsenceType = z.infer<typeof absenceTypeEnum>;
export type AbsenceStatus = z.infer<typeof absenceStatusEnum>;

// Absences - Férias, licenças médicas, afastamentos
export const absences = pgTable("absences", {
  id: serial("id").primaryKey(),
  employeeId: varchar("employee_id").notNull(),
  companyId: integer("company_id").notNull(),
  departmentId: integer("department_id"),
  type: varchar("type").notNull(), // "vacation" (férias), "medical_leave", "maternity_leave", "paternity_leave", "bereavement", "wedding", "other"
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  totalDays: integer("total_days").notNull(), // Calculated: business days
  status: varchar("status").notNull().default("pending"), // "pending", "approved", "rejected", "cancelled"
  reason: text("reason"), // Motivo/observações do funcionário
  rejectionReason: text("rejection_reason"), // Motivo da rejeição (se rejeitado)
  documentUrl: varchar("document_url"), // URL do atestado/documento
  approvedBy: varchar("approved_by"), // ID do aprovador (RH/Admin)
  approvedAt: timestamp("approved_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  employeeReference: foreignKey({
    columns: [table.employeeId],
    foreignColumns: [users.id],
  }),
  companyReference: foreignKey({
    columns: [table.companyId],
    foreignColumns: [companies.id],
  }),
  departmentReference: foreignKey({
    columns: [table.departmentId],
    foreignColumns: [departments.id],
  }),
  approvedByReference: foreignKey({
    columns: [table.approvedBy],
    foreignColumns: [users.id],
  }),
}));

// Vacation Balance - Saldo de férias por funcionário
export const vacationBalances = pgTable("vacation_balances", {
  id: serial("id").primaryKey(),
  employeeId: varchar("employee_id").notNull().unique(),
  companyId: integer("company_id").notNull(),
  totalDaysEarned: integer("total_days_earned").default(0).notNull(), // Total acumulado
  totalDaysUsed: integer("total_days_used").default(0).notNull(), // Total usado
  currentBalance: integer("current_balance").default(0).notNull(), // Saldo atual
  lastCalculatedAt: timestamp("last_calculated_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  employeeReference: foreignKey({
    columns: [table.employeeId],
    foreignColumns: [users.id],
  }),
  companyReference: foreignKey({
    columns: [table.companyId],
    foreignColumns: [companies.id],
  }),
}));

// Types for Absence System
export type Absence = typeof absences.$inferSelect;
export type VacationBalance = typeof vacationBalances.$inferSelect;

// Insert schemas for Absence System
export const insertAbsenceSchema = createInsertSchema(absences).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  approvedBy: true,
  approvedAt: true,
  rejectionReason: true,
  status: true,
  employeeId: true,  // Excluded: set by backend based on logged user
  companyId: true,    // Excluded: set by backend based on logged user
}).extend({
  type: absenceTypeEnum,
  startDate: z.string().or(z.date()),
  endDate: z.string().or(z.date()),
  totalDays: z.number().int().positive("Total de dias deve ser positivo"),
  reason: z.string().min(10, "Motivo deve ter pelo menos 10 caracteres").optional(),
  documentUrl: z.string().url("URL de documento inválida").optional(),
}).refine(
  (data) => {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    return end >= start;
  },
  { message: "Data final deve ser maior ou igual à data inicial", path: ["endDate"] }
);
export type InsertAbsence = z.infer<typeof insertAbsenceSchema>;

// Update schema for Absence (employee can only update these fields)
export const updateAbsenceSchema = z.object({
  type: absenceTypeEnum.optional(),
  startDate: z.string().or(z.date()).optional(),
  endDate: z.string().or(z.date()).optional(),
  totalDays: z.number().int().positive("Total de dias deve ser positivo").optional(),
  reason: z.string().min(10, "Motivo deve ter pelo menos 10 caracteres").optional(),
  documentUrl: z.string().url("URL de documento inválida").optional(),
  departmentId: z.number().optional(),
}).refine(
  (data) => {
    if (data.startDate && data.endDate) {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      return end >= start;
    }
    return true;
  },
  { message: "Data final deve ser maior ou igual à data inicial", path: ["endDate"] }
);
export type UpdateAbsence = z.infer<typeof updateAbsenceSchema>;

export const insertVacationBalanceSchema = createInsertSchema(vacationBalances).omit({
  id: true,
  lastCalculatedAt: true,
  updatedAt: true,
});
export type InsertVacationBalance = z.infer<typeof insertVacationBalanceSchema>;
