import {
  users,
  departments,
  sectors,
  departmentShifts,
  departmentShiftBreaks,
  supervisorAssignments,
  userShiftAssignments,
  timeEntries,
  breakEntries,
  faceProfiles,
  authorizedDevices,
  companies,
  holidays,
  messages,
  messageCategories,
  messageRecipients,
  documents,
  courses,
  courseQuestions,
  courseAnswers,
  employeeCourses,
  certificates,
  auditLog,
  timeEntryAudit,
  timePeriods,
  rotationTemplates,
  rotationSegments,
  rotationInstances,
  rotationUserAssignments,
  rotationExceptions,
  rotationAudit,
  jobOpenings,
  jobRequirements,
  candidates,
  applications,
  applicationRequirementResponses,
  leads,
  selectionStages,
  interviewTemplates,
  interviews,
  onboardingLinks,
  onboardingDocuments,
  onboardingFormData,
  overtimeRules,
  overtimeTiers,
  timeBank,
  timeBankTransactions,
  discQuestions,
  discAssessments,
  discResponses,
  inventoryCategories,
  inventoryItems,
  inventoryStock,
  inventoryMovements,
  employeeItems,
  absences,
  vacationBalances,
  type User,
  type UpsertUser,
  type Department,
  type InsertDepartment,
  type Sector,
  type InsertSector,
  type DepartmentShift,
  type InsertDepartmentShift,
  type SelectDepartmentShiftBreak,
  type InsertDepartmentShiftBreak,
  type SupervisorAssignment,
  type InsertSupervisorAssignment,
  type SelectUserShiftAssignment,
  type InsertUserShiftAssignment,
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
  type CourseQuestion,
  type InsertCourseQuestion,
  type CourseAnswer,
  type InsertCourseAnswer,
  type EmployeeCourse,
  type InsertEmployeeCourse,
  type Certificate,
  type InsertCertificate,
  type AuditLog,
  type InsertAuditLog,
  type TimePeriod,
  type InsertTimePeriod,
  type AuthorizedDevice,
  type InsertAuthorizedDevice,
  type RotationTemplate,
  type InsertRotationTemplate,
  type RotationSegment,
  type InsertRotationSegment,
  type RotationInstance,
  type RotationUserAssignment,
  type InsertRotationUserAssignment,
  type RotationException,
  type InsertRotationException,
  type RotationAudit,
  type OvertimeRule,
  type InsertOvertimeRule,
  type OvertimeTier,
  type InsertOvertimeTier,
  type TimeBank,
  type InsertTimeBank,
  type TimeBankTransaction,
  type InsertTimeBankTransaction,
  type Lead,
  type InsertLead,
  type DISCQuestion,
  type DISCAssessment,
  type DISCResponse,
  type InventoryCategory,
  type InsertInventoryCategory,
  type InventoryItem,
  type InsertInventoryItem,
  type InventoryStock,
  type InsertInventoryStock,
  type InventoryMovement,
  type InsertInventoryMovement,
  type EmployeeItem,
  type InsertEmployeeItem,
  type Absence,
  type InsertAbsence,
  type VacationBalance,
  type InsertVacationBalance,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, isNull, desc, gte, lte, sql, ne, inArray } from "drizzle-orm";

// Local type aliases for tables that don't have exported types
type InsertTimeEntry = typeof timeEntries.$inferInsert;
type BreakEntry = typeof breakEntries.$inferSelect;
type InsertBreakEntry = typeof breakEntries.$inferInsert;
type FaceProfile = typeof faceProfiles.$inferSelect;
type InsertFaceProfile = typeof faceProfiles.$inferInsert;
type InsertDISCQuestion = typeof discQuestions.$inferInsert;
type InsertDISCAssessment = typeof discAssessments.$inferInsert;
type InsertDISCResponse = typeof discResponses.$inferInsert;

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
  getAllDepartmentShifts(companyId: number): Promise<DepartmentShift[]>;
  getDepartmentShift(id: number): Promise<DepartmentShift | undefined>;
  createDepartmentShift(shift: InsertDepartmentShift): Promise<DepartmentShift>;
  updateDepartmentShift(id: number, shift: Partial<InsertDepartmentShift>): Promise<DepartmentShift>;
  deleteDepartmentShift(id: number): Promise<void>;
  
  // Department shift break operations
  getShiftBreaks(shiftId: number): Promise<SelectDepartmentShiftBreak[]>;
  getShiftBreak(id: number): Promise<SelectDepartmentShiftBreak | undefined>;
  createShiftBreak(breakData: InsertDepartmentShiftBreak): Promise<SelectDepartmentShiftBreak>;
  updateShiftBreak(id: number, breakData: Partial<InsertDepartmentShiftBreak>): Promise<SelectDepartmentShiftBreak>;
  deleteShiftBreak(id: number): Promise<void>;
  
  // Supervisor assignment operations
  getSupervisorAssignments(supervisorId: string): Promise<SupervisorAssignment[]>;
  getSupervisorsBySector(sectorId: number): Promise<SupervisorAssignment[]>;
  getAllCompanySupervisorAssignments(companyId: number): Promise<(SupervisorAssignment & { supervisor: User; sector: Sector })[]>;
  createSupervisorAssignment(assignment: InsertSupervisorAssignment): Promise<SupervisorAssignment>;
  deleteSupervisorAssignment(supervisorId: string, sectorId: number): Promise<void>;

  // User shift assignment operations
  getUserShiftAssignments(userId: string): Promise<SelectUserShiftAssignment[]>;
  getShiftAssignments(shiftId: number): Promise<(SelectUserShiftAssignment & { user: User })[]>;
  getUserShiftAssignment(id: number): Promise<SelectUserShiftAssignment | undefined>;
  createUserShiftAssignment(assignment: InsertUserShiftAssignment): Promise<SelectUserShiftAssignment>;
  updateUserShiftAssignment(id: number, assignment: Partial<InsertUserShiftAssignment>): Promise<SelectUserShiftAssignment>;
  deleteUserShiftAssignment(id: number): Promise<void>;
  getUserActiveShift(userId: string, date?: Date): Promise<(SelectUserShiftAssignment & { shift: DepartmentShift }) | undefined>;
  
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
  deleteMessage(messageId: number): Promise<void>;
  archiveMessage(messageId: number, userId: string): Promise<void>;
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
  
  // Course question operations
  getCourseQuestions(courseId: number): Promise<CourseQuestion[]>;
  createCourseQuestion(question: InsertCourseQuestion): Promise<CourseQuestion>;
  deleteCourseQuestion(questionId: number): Promise<void>;
  
  // Employee course operations
  getEmployeeCourses(userId: string, companyId: number): Promise<EmployeeCourse[]>;
  getEmployeeCourse(userId: string, courseId: number): Promise<EmployeeCourse | undefined>;
  getEmployeeCourseById(id: number): Promise<EmployeeCourse | undefined>;
  createEmployeeCourse(employeeCourse: InsertEmployeeCourse): Promise<EmployeeCourse>;
  updateEmployeeCourse(id: number, employeeCourse: Partial<InsertEmployeeCourse>): Promise<EmployeeCourse>;
  startCourse(userId: string, courseId: number, companyId: number): Promise<EmployeeCourse>;
  updateCourseProgress(userId: string, courseId: number, progress: number): Promise<EmployeeCourse>;
  completeCourse(userId: string, courseId: number, score?: number): Promise<EmployeeCourse>;
  
  // Course answer operations
  createCourseAnswer(answer: InsertCourseAnswer): Promise<CourseAnswer>;
  getEmployeeCourseAnswers(employeeCourseId: number): Promise<CourseAnswer[]>;
  
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
  
  // Authorized device operations
  getAuthorizedDevices(companyId: number): Promise<AuthorizedDevice[]>;
  getAuthorizedDevice(id: number): Promise<AuthorizedDevice | undefined>;
  getAuthorizedDeviceByCode(deviceCode: string): Promise<AuthorizedDevice | undefined>;
  createAuthorizedDevice(device: InsertAuthorizedDevice): Promise<AuthorizedDevice>;
  updateAuthorizedDevice(id: number, device: Partial<InsertAuthorizedDevice>): Promise<AuthorizedDevice>;
  deleteAuthorizedDevice(id: number): Promise<void>;
  updateDeviceLastUsed(id: number): Promise<void>;
  
  // Enhanced user shift assignment operations with sequential validation
  validateSequentialAssignment(userId: string, shiftId: number, startDate?: string, endDate?: string, excludeAssignmentId?: number): Promise<{ valid: boolean; conflictingAssignments?: SelectUserShiftAssignment[] }>;
  createUserShiftAssignmentWithValidation(assignment: InsertUserShiftAssignment): Promise<SelectUserShiftAssignment>;
  
  // Rotation template operations
  getRotationTemplates(companyId: number, departmentId?: number): Promise<RotationTemplate[]>;
  getRotationTemplate(id: number): Promise<RotationTemplate | undefined>;
  createRotationTemplate(template: InsertRotationTemplate): Promise<RotationTemplate>;
  updateRotationTemplate(id: number, template: Partial<InsertRotationTemplate>): Promise<RotationTemplate>;
  deleteRotationTemplate(id: number): Promise<void>;
  
  // Rotation segment operations
  getRotationSegments(templateId: number): Promise<RotationSegment[]>;
  getRotationSegment(id: number): Promise<RotationSegment | undefined>;
  createRotationSegment(segment: InsertRotationSegment): Promise<RotationSegment>;
  updateRotationSegment(id: number, segment: Partial<InsertRotationSegment>): Promise<RotationSegment>;
  deleteRotationSegment(id: number): Promise<void>;
  
  // Rotation user assignment operations
  getRotationUserAssignments(templateId: number): Promise<RotationUserAssignment[]>;
  getUserRotationAssignments(userId: string): Promise<RotationUserAssignment[]>;
  getRotationUserAssignment(id: number): Promise<RotationUserAssignment | undefined>;
  createRotationUserAssignment(assignment: InsertRotationUserAssignment): Promise<RotationUserAssignment>;
  updateRotationUserAssignment(id: number, assignment: Partial<InsertRotationUserAssignment>): Promise<RotationUserAssignment>;
  deleteRotationUserAssignment(id: number): Promise<void>;
  
  // Rotation exception operations
  getRotationExceptions(templateId: number, userId?: string, date?: string): Promise<RotationException[]>;
  createRotationException(exception: InsertRotationException): Promise<RotationException>;
  deleteRotationException(id: number): Promise<void>;
  
  // Rotation scheduling and preview operations
  previewRotationSchedule(templateId: number, startDate: string, endDate: string, userIds?: string[]): Promise<{
    userId: string;
    date: string;
    shiftId: number | null;
    segmentName: string;
    isRestDay: boolean;
  }[]>;
  generateRotationAssignments(templateId: number, startDate: string, endDate: string, performedBy: string): Promise<{
    generatedAssignments: number;
    affectedUsers: number;
    dateRange: string;
  }>;
  
  // Rotation audit operations
  createRotationAudit(audit: InsertRotationException): Promise<RotationAudit>;
  getRotationAuditHistory(templateId: number, limit?: number): Promise<RotationAudit[]>;
  
  // ========================================================================================
  // RECRUITMENT & SELECTION OPERATIONS
  // ========================================================================================
  
  // Job opening operations
  getJobOpenings(companyId: number, status?: string): Promise<any[]>;
  getPublicJobOpenings(companyId?: number): Promise<any[]>;
  getJobOpening(id: number): Promise<any | undefined>;
  createJobOpening(jobOpening: any): Promise<any>;
  updateJobOpening(id: number, jobOpening: Partial<any>): Promise<any>;
  deleteJobOpening(id: number): Promise<void>;
  publishJobOpening(id: number): Promise<any>;
  closeJobOpening(id: number): Promise<any>;
  
  // Job requirements operations
  getJobRequirements(jobOpeningId: number): Promise<any[]>;
  getJobRequirement(id: number): Promise<any | undefined>;
  createJobRequirement(requirement: any): Promise<any>;
  updateJobRequirement(id: number, requirement: Partial<any>): Promise<any>;
  deleteJobRequirement(id: number): Promise<void>;
  bulkReplaceJobRequirements(jobOpeningId: number, requirements: any[]): Promise<any[]>;
  
  // Candidate operations
  getCandidates(companyId: number): Promise<any[]>;
  getCandidate(id: number): Promise<any | undefined>;
  createCandidate(candidate: any): Promise<any>;
  updateCandidate(id: number, candidate: Partial<any>): Promise<any>;
  getCandidateByEmail(companyId: number, email: string): Promise<any | undefined>;
  
  // Application operations
  getApplications(jobOpeningId: number): Promise<any[]>;
  getApplication(id: number): Promise<any | undefined>;
  createApplication(application: any): Promise<any>;
  updateApplication(id: number, application: Partial<any>): Promise<any>;
  deleteApplicationsBulk(ids: number[]): Promise<number>;
  getCandidateApplications(candidateId: number): Promise<any[]>;
  getApplicationsByStatus(jobOpeningId: number, status: string): Promise<any[]>;
  
  // Application requirement responses operations (atomic transaction)
  getApplicationRequirementResponses(applicationId: number): Promise<any[]>;
  submitAndScoreApplication(applicationId: number, responses: any[]): Promise<{ 
    score: number; 
    isQualified: boolean; 
    missingMandatoryRequirements: string[];
  }>;
  
  // Selection stage operations
  getSelectionStages(jobOpeningId: number): Promise<any[]>;
  createSelectionStage(stage: any): Promise<any>;
  updateSelectionStage(id: number, stage: Partial<any>): Promise<any>;
  deleteSelectionStage(id: number): Promise<void>;
  
  // Interview template operations
  getInterviewTemplates(companyId: number): Promise<any[]>;
  getInterviewTemplate(id: number): Promise<any | undefined>;
  createInterviewTemplate(template: any): Promise<any>;
  updateInterviewTemplate(id: number, template: Partial<any>): Promise<any>;
  deleteInterviewTemplate(id: number): Promise<void>;
  
  // Interview operations
  getInterviews(applicationId: number): Promise<any[]>;
  getInterview(id: number): Promise<any | undefined>;
  createInterview(interview: any): Promise<any>;
  updateInterview(id: number, interview: Partial<any>): Promise<any>;
  completeInterview(id: number, feedback: string, rating: number, evaluation: any): Promise<any>;
  
  // Onboarding link operations
  getOnboardingLinks(companyId: number): Promise<any[]>;
  getOnboardingLinkByToken(token: string): Promise<any | undefined>;
  createOnboardingLink(link: any): Promise<any>;
  updateOnboardingLink(id: number, link: Partial<any>): Promise<any>;
  completeOnboarding(token: string): Promise<any>;
  
  // Onboarding document operations
  getOnboardingDocuments(onboardingLinkId: number): Promise<any[]>;
  createOnboardingDocument(document: any): Promise<any>;
  updateOnboardingDocument(id: number, document: Partial<any>): Promise<any>;
  reviewOnboardingDocument(id: number, status: string, reviewNotes: string, reviewedBy: string): Promise<any>;
  
  // Onboarding form data operations
  getOnboardingFormData(onboardingLinkId: number): Promise<any | undefined>;
  upsertOnboardingFormData(formData: any): Promise<any>;
  
  // Overtime Rules operations
  getOvertimeRules(departmentId: number): Promise<OvertimeRule[]>;
  getOvertimeRule(id: number): Promise<OvertimeRule | undefined>;
  createOvertimeRule(rule: InsertOvertimeRule): Promise<OvertimeRule>;
  updateOvertimeRule(id: number, rule: Partial<InsertOvertimeRule>): Promise<OvertimeRule>;
  deleteOvertimeRule(id: number): Promise<void>;
  getApplicableOvertimeRule(departmentId: number, shiftId: number | null, date: Date): Promise<(OvertimeRule & { tiers: OvertimeTier[] }) | undefined>;
  
  // Overtime Tiers operations
  getOvertimeTiers(overtimeRuleId: number): Promise<OvertimeTier[]>;
  createOvertimeTier(tier: InsertOvertimeTier): Promise<OvertimeTier>;
  updateOvertimeTier(id: number, tier: Partial<InsertOvertimeTier>): Promise<OvertimeTier>;
  deleteOvertimeTier(id: number): Promise<void>;
  
  // Time Bank operations
  getTimeBank(userId: string): Promise<TimeBank | undefined>;
  createTimeBank(timeBank: InsertTimeBank): Promise<TimeBank>;
  updateTimeBankBalance(userId: string, hours: number, type: 'credit' | 'debit', reason: string, description?: string, timeEntryId?: number, createdBy?: string): Promise<TimeBank>;
  getTimeBankBalance(userId: string): Promise<number>;
  
  // Time Bank Transaction operations
  getTimeBankTransactions(userId: string, limit?: number): Promise<TimeBankTransaction[]>;
  createTimeBankTransaction(transaction: InsertTimeBankTransaction): Promise<TimeBankTransaction>;
  
  // Lead operations
  createLead(lead: InsertLead): Promise<Lead>;
  getLeads(filters?: { status?: string }): Promise<Lead[]>;
  getLead(id: number): Promise<Lead | undefined>;
  updateLeadStatus(id: number, update: { status?: string; followUpNotes?: string; assignedTo?: string; lastContactedAt?: Date }): Promise<Lead>;
  
  // DISC assessment operations
  getDISCQuestions(): Promise<DISCQuestion[]>;
  getActiveDISCQuestions(): Promise<DISCQuestion[]>;
  createDISCAssessment(assessment: InsertDISCAssessment): Promise<DISCAssessment>;
  getDISCAssessment(id: number): Promise<DISCAssessment | undefined>;
  getDISCAssessmentByToken(token: string): Promise<DISCAssessment | undefined>;
  getDISCAssessmentsByJobOpening(jobOpeningId: number): Promise<DISCAssessment[]>;
  getDISCAssessmentsByCandidate(candidateId: number): Promise<DISCAssessment[]>;
  updateDISCAssessment(id: number, assessment: Partial<InsertDISCAssessment>): Promise<DISCAssessment>;
  createDISCResponse(response: InsertDISCResponse): Promise<DISCResponse>;
  getDISCResponses(assessmentId: number): Promise<DISCResponse[]>;
  saveDISCResponses(assessmentId: number, responses: InsertDISCResponse[]): Promise<DISCResponse[]>;
  finalizeDISCAssessment(assessmentId: number, scores: { dScore: number; iScore: number; sScore: number; cScore: number; primaryProfile: string }): Promise<DISCAssessment>;
  
  // Inventory Category operations
  getInventoryCategories(companyId: number): Promise<InventoryCategory[]>;
  getInventoryCategory(id: number): Promise<InventoryCategory | undefined>;
  createInventoryCategory(category: InsertInventoryCategory): Promise<InventoryCategory>;
  updateInventoryCategory(id: number, category: Partial<InsertInventoryCategory>): Promise<InventoryCategory>;
  deleteInventoryCategory(id: number): Promise<void>;
  
  // Inventory Item operations
  getInventoryItems(companyId: number, filters?: { categoryId?: number; isActive?: boolean }): Promise<InventoryItem[]>;
  getInventoryItem(id: number): Promise<InventoryItem | undefined>;
  createInventoryItem(item: InsertInventoryItem): Promise<InventoryItem>;
  updateInventoryItem(id: number, item: Partial<InsertInventoryItem>): Promise<InventoryItem>;
  deleteInventoryItem(id: number): Promise<void>;
  
  // Inventory Stock operations
  getInventoryStock(companyId: number): Promise<InventoryStock[]>;
  getStockByItem(itemId: number): Promise<InventoryStock | undefined>;
  updateInventoryStock(itemId: number, companyId: number, quantity: number, userId: string): Promise<InventoryStock>;
  getLowStockItems(companyId: number): Promise<Array<InventoryItem & { currentStock: number }>>;
  
  // Inventory Movement operations
  getInventoryMovements(companyId: number, filters?: { itemId?: number; type?: string; startDate?: Date; endDate?: Date }): Promise<InventoryMovement[]>;
  createInventoryMovement(movement: InsertInventoryMovement): Promise<InventoryMovement>;
  
  // Employee Item operations (distribution)
  getEmployeeItems(employeeId: string, filters?: { status?: string }): Promise<EmployeeItem[]>;
  getEmployeeItemsByDepartment(departmentId: number, filters?: { status?: string }): Promise<EmployeeItem[]>;
  getEmployeeItem(id: number): Promise<EmployeeItem | undefined>;
  createEmployeeItem(employeeItem: InsertEmployeeItem): Promise<EmployeeItem>;
  updateEmployeeItem(id: number, employeeItem: Partial<InsertEmployeeItem>): Promise<EmployeeItem>;
  getExpiringItems(companyId: number, daysAhead: number): Promise<Array<EmployeeItem & { employeeName: string; itemName: string }>>;
  
  // Absence Management operations
  createAbsence(absence: InsertAbsence): Promise<Absence>;
  getAbsence(id: number): Promise<Absence | undefined>;
  getAbsencesByEmployee(employeeId: string): Promise<Absence[]>;
  getAbsencesByCompany(companyId: number, filters?: { status?: string; type?: string; startDate?: Date; endDate?: Date }): Promise<Absence[]>;
  getPendingAbsences(companyId: number): Promise<Absence[]>;
  approveAbsence(id: number, approvedBy: string): Promise<Absence>;
  rejectAbsence(id: number, approvedBy: string, rejectionReason: string): Promise<Absence>;
  cancelAbsence(id: number): Promise<Absence>;
  updateAbsence(id: number, absence: Partial<InsertAbsence>): Promise<Absence>;
  
  // Vacation Balance operations
  getVacationBalance(employeeId: string): Promise<VacationBalance | undefined>;
  createOrUpdateVacationBalance(employeeId: string, companyId: number): Promise<VacationBalance>;
  calculateVacationBalance(employeeId: string, admissionDate: Date): Promise<{ totalDaysEarned: number; totalDaysUsed: number; currentBalance: number }>;
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
    return await db.select().from(departmentShifts).where(
      and(
        eq(departmentShifts.departmentId, departmentId),
        eq(departmentShifts.isActive, true)
      )
    );
  }

  async getAllDepartmentShifts(companyId: number): Promise<DepartmentShift[]> {
    return await db
      .select({
        id: departmentShifts.id,
        departmentId: departmentShifts.departmentId,
        name: departmentShifts.name,
        startTime: departmentShifts.startTime,
        endTime: departmentShifts.endTime,
        daysOfWeek: departmentShifts.daysOfWeek,
        isActive: departmentShifts.isActive,
        createdAt: departmentShifts.createdAt,
        updatedAt: departmentShifts.updatedAt,
        breakStart: departmentShifts.breakStart,
        breakEnd: departmentShifts.breakEnd,
      })
      .from(departmentShifts)
      .innerJoin(departments, eq(departmentShifts.departmentId, departments.id))
      .where(
        and(
          eq(departments.companyId, companyId),
          eq(departmentShifts.isActive, true)
        )
      )
      .orderBy(departmentShifts.name);
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

  // Department shift break operations
  async getShiftBreaks(shiftId: number): Promise<SelectDepartmentShiftBreak[]> {
    return db
      .select()
      .from(departmentShiftBreaks)
      .where(and(
        eq(departmentShiftBreaks.shiftId, shiftId),
        eq(departmentShiftBreaks.isActive, true)
      ))
      .orderBy(departmentShiftBreaks.scheduledStart);
  }

  async getShiftBreak(id: number): Promise<SelectDepartmentShiftBreak | undefined> {
    const result = await db
      .select()
      .from(departmentShiftBreaks)
      .where(eq(departmentShiftBreaks.id, id))
      .limit(1);
    return result[0];
  }

  async createShiftBreak(breakData: InsertDepartmentShiftBreak): Promise<SelectDepartmentShiftBreak> {
    const [newBreak] = await db
      .insert(departmentShiftBreaks)
      .values(breakData)
      .returning();
    return newBreak;
  }

  async updateShiftBreak(id: number, breakData: Partial<InsertDepartmentShiftBreak>): Promise<SelectDepartmentShiftBreak> {
    const [updatedBreak] = await db
      .update(departmentShiftBreaks)
      .set(breakData)
      .where(eq(departmentShiftBreaks.id, id))
      .returning();
    return updatedBreak;
  }

  async deleteShiftBreak(id: number): Promise<void> {
    await db.delete(departmentShiftBreaks).where(eq(departmentShiftBreaks.id, id));
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

  // User shift assignment operations
  async getUserShiftAssignments(userId: string): Promise<SelectUserShiftAssignment[]> {
    return await db.select().from(userShiftAssignments).where(eq(userShiftAssignments.userId, userId));
  }

  async getShiftAssignments(shiftId: number, includeRotationSchedule = true): Promise<(SelectUserShiftAssignment & { user: User })[]> {
    // Get regular permanent assignments
    const regularResult = await db
      .select()
      .from(userShiftAssignments)
      .innerJoin(users, eq(userShiftAssignments.userId, users.id))
      .where(eq(userShiftAssignments.shiftId, shiftId));

    const regularAssignments = regularResult.map(row => ({
      id: row.user_shift_assignments.id,
      userId: row.user_shift_assignments.userId,
      shiftId: row.user_shift_assignments.shiftId,
      startDate: row.user_shift_assignments.startDate,
      endDate: row.user_shift_assignments.endDate,
      assignmentType: row.user_shift_assignments.assignmentType,
      isActive: row.user_shift_assignments.isActive,
      createdAt: row.user_shift_assignments.createdAt,
      updatedAt: row.user_shift_assignments.updatedAt,
      user: row.users,
    }));

    // If rotation schedule is not requested, return only regular assignments
    if (!includeRotationSchedule) {
      return regularAssignments;
    }

    // Get rotation assignments for current date range (today + next 30 days)
    const today = new Date().toISOString().split('T')[0];
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);
    const futureDateStr = futureDate.toISOString().split('T')[0];

    const rotationResult = await db
      .select()
      .from(userShiftAssignments)
      .innerJoin(users, eq(userShiftAssignments.userId, users.id))
      .where(
        and(
          eq(userShiftAssignments.shiftId, shiftId),
          eq(userShiftAssignments.assignmentType, 'temporary'), // Rotation assignments are marked as temporary
          gte(userShiftAssignments.startDate, today),
          lte(userShiftAssignments.startDate, futureDateStr)
        )
      );

    const rotationAssignments = rotationResult.map(row => ({
      id: row.user_shift_assignments.id,
      userId: row.user_shift_assignments.userId,
      shiftId: row.user_shift_assignments.shiftId,
      startDate: row.user_shift_assignments.startDate,
      endDate: row.user_shift_assignments.endDate,
      assignmentType: row.user_shift_assignments.assignmentType,
      isActive: row.user_shift_assignments.isActive,
      createdAt: row.user_shift_assignments.createdAt,
      updatedAt: row.user_shift_assignments.updatedAt,
      user: row.users,
    }));

    console.log(`[DEBUG] Found ${regularAssignments.length} regular assignments and ${rotationAssignments.length} rotation assignments for shift ${shiftId}`);

    // Combine regular and rotation assignments
    return [...regularAssignments, ...rotationAssignments];
  }

  async getUserShiftAssignment(id: number): Promise<SelectUserShiftAssignment | undefined> {
    const [assignment] = await db.select().from(userShiftAssignments).where(eq(userShiftAssignments.id, id));
    return assignment;
  }

  async createUserShiftAssignment(assignment: InsertUserShiftAssignment): Promise<SelectUserShiftAssignment> {
    // Validate user exists and get their company
    const [user] = await db.select({ 
      companyId: users.companyId,
      departmentId: users.departmentId 
    }).from(users).where(eq(users.id, assignment.userId));
    if (!user) {
      throw new Error("User not found");
    }

    // Validate shift exists and get its department's company
    const shiftWithDept = await db
      .select({
        departmentId: departmentShifts.departmentId,
        companyId: departments.companyId
      })
      .from(departmentShifts)
      .innerJoin(departments, eq(departmentShifts.departmentId, departments.id))
      .where(eq(departmentShifts.id, assignment.shiftId));

    if (shiftWithDept.length === 0) {
      throw new Error("Shift not found");
    }

    const shift = shiftWithDept[0];

    // Only validate that user and shift are in the same company
    // Allow cross-department assignments for flexibility (transfers, coverage, etc)
    if (user.companyId !== shift.companyId) {
      throw new Error("User and shift must be in the same company");
    }

    const [newAssignment] = await db.insert(userShiftAssignments).values(assignment).returning();
    return newAssignment;
  }

  async updateUserShiftAssignment(id: number, assignment: Partial<InsertUserShiftAssignment>): Promise<SelectUserShiftAssignment> {
    const [updatedAssignment] = await db
      .update(userShiftAssignments)
      .set({ ...assignment, updatedAt: new Date() })
      .where(eq(userShiftAssignments.id, id))
      .returning();
    return updatedAssignment;
  }

  async deleteUserShiftAssignment(id: number): Promise<void> {
    await db.delete(userShiftAssignments).where(eq(userShiftAssignments.id, id));
  }

  async getUserActiveShift(userId: string, date: Date = new Date()): Promise<(SelectUserShiftAssignment & { shift: DepartmentShift }) | undefined> {
    const currentDate = date.toISOString().split('T')[0]; // Format as YYYY-MM-DD

    const result = await db
      .select()
      .from(userShiftAssignments)
      .innerJoin(departmentShifts, eq(userShiftAssignments.shiftId, departmentShifts.id))
      .where(
        and(
          eq(userShiftAssignments.userId, userId),
          eq(userShiftAssignments.isActive, true),
          or(
            // Permanent assignment (no end date)
            and(
              eq(userShiftAssignments.assignmentType, 'permanent'),
              isNull(userShiftAssignments.endDate)
            ),
            // Temporary assignment within date range
            and(
              eq(userShiftAssignments.assignmentType, 'temporary'),
              or(
                isNull(userShiftAssignments.startDate),
                lte(userShiftAssignments.startDate, currentDate)
              ),
              or(
                isNull(userShiftAssignments.endDate),
                gte(userShiftAssignments.endDate, currentDate)
              )
            )
          )
        )
      );

    if (result.length === 0) {
      return undefined;
    }

    const row = result[0];
    return {
      id: row.user_shift_assignments.id,
      userId: row.user_shift_assignments.userId,
      shiftId: row.user_shift_assignments.shiftId,
      startDate: row.user_shift_assignments.startDate,
      endDate: row.user_shift_assignments.endDate,
      assignmentType: row.user_shift_assignments.assignmentType,
      isActive: row.user_shift_assignments.isActive,
      createdAt: row.user_shift_assignments.createdAt,
      updatedAt: row.user_shift_assignments.updatedAt,
      shift: row.department_shifts,
    };
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

  async createTimeEntryAudit(audit: {
    timeEntryId: number;
    fieldName: string;
    oldValue: string | null;
    newValue: string | null;
    justification: string;
    attachmentUrl?: string | null;
    editedBy: string;
    ipAddress?: string;
  }) {
    const [newAudit] = await db.insert(timeEntryAudit).values(audit).returning();
    return newAudit;
  }

  async getTimeEntryAuditHistory(timeEntryId: number) {
    return await db
      .select()
      .from(timeEntryAudit)
      .where(eq(timeEntryAudit.timeEntryId, timeEntryId))
      .orderBy(desc(timeEntryAudit.createdAt));
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

  async getTimeEntriesByDateRange(startDate: string, endDate: string, companyId?: number): Promise<TimeEntry[]> {
    // If companyId is provided, filter by company users
    if (companyId) {
      const companyUsers = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.companyId, companyId));
      
      const userIds = companyUsers.map(u => u.id);
      
      if (userIds.length === 0) {
        return [];
      }
      
      return await db
        .select()
        .from(timeEntries)
        .where(and(
          gte(timeEntries.date, startDate),
          lte(timeEntries.date, endDate),
          inArray(timeEntries.userId, userIds)
        ))
        .orderBy(desc(timeEntries.date));
    }
    
    // Otherwise return all entries in the date range
    return await db
      .select()
      .from(timeEntries)
      .where(and(gte(timeEntries.date, startDate), lte(timeEntries.date, endDate)))
      .orderBy(desc(timeEntries.date));
  }

  async getTimeEntriesByDate(date: string, companyId: number): Promise<TimeEntry[]> {
    // Get user IDs from the company first
    const companyUsers = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.companyId, companyId));
    
    const userIds = companyUsers.map(u => u.id);
    
    if (userIds.length === 0) {
      return [];
    }
    
    // Then get time entries for those users on the specific date
    return await db
      .select()
      .from(timeEntries)
      .where(and(
        eq(timeEntries.date, date),
        inArray(timeEntries.userId, userIds)
      ))
      .orderBy(desc(timeEntries.clockInTime));
  }

  async getTimeEntry(id: number): Promise<TimeEntry | null> {
    const [entry] = await db
      .select()
      .from(timeEntries)
      .where(eq(timeEntries.id, id))
      .limit(1);
    return entry || null;
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
    const completedEntries = entries.filter(entry => entry.status === 'completed');
    
    const totalHours = completedEntries.reduce((sum, entry) => {
      if (!entry.totalHours) return sum;
      return sum + (parseFloat(entry.totalHours || '0'));
    }, 0);
    
    const totalDays = new Set(completedEntries.map((entry) => entry.date)).size;
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
          eq(messages.companyId, companyId),
          eq(messages.senderDeleted, false)
        )
      )
      .orderBy(desc(messages.createdAt));

    return results;
  }

  async getArchivedMessages(userId: string, companyId: number): Promise<any[]> {
    // Arquivadas são mensagens enviadas que o remetente deletou/arquivou
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
        // For archived messages
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
          eq(messages.companyId, companyId),
          eq(messages.senderDeleted, true)
        )
      )
      .orderBy(desc(messages.senderDeletedAt));

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

  async deleteMessage(messageId: number, userId: string): Promise<void> {
    // Verifica se o usuário é o remetente
    const message = await db
      .select()
      .from(messages)
      .where(eq(messages.id, messageId))
      .limit(1);
    
    if (message.length > 0 && message[0].senderId === userId) {
      // Usuário é o remetente - marca senderDeleted
      await db
        .update(messages)
        .set({ 
          senderDeleted: true, 
          senderDeletedAt: new Date() 
        })
        .where(and(
          eq(messages.id, messageId),
          eq(messages.senderId, userId)
        ));
    } else {
      // Usuário é destinatário - marca isDeleted em messageRecipients
      await db
        .update(messageRecipients)
        .set({ 
          isDeleted: true, 
          deletedAt: new Date() 
        })
        .where(
          and(
            eq(messageRecipients.messageId, messageId),
            eq(messageRecipients.userId, userId)
          )
        );
    }
  }

  async archiveMessage(messageId: number, userId: string): Promise<void> {
    // Verifica se o usuário é o remetente
    const message = await db
      .select()
      .from(messages)
      .where(eq(messages.id, messageId))
      .limit(1);
    
    if (message.length > 0 && message[0].senderId === userId) {
      // Usuário é o remetente - marca senderDeleted
      await db
        .update(messages)
        .set({ 
          senderDeleted: true, 
          senderDeletedAt: new Date() 
        })
        .where(and(
          eq(messages.id, messageId),
          eq(messages.senderId, userId)
        ));
    } else {
      // Usuário é destinatário - marca isDeleted em messageRecipients
      await db
        .update(messageRecipients)
        .set({ 
          isDeleted: true, 
          deletedAt: new Date() 
        })
        .where(
          and(
            eq(messageRecipients.messageId, messageId),
            eq(messageRecipients.userId, userId)
          )
        );
    }
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

  // Course question operations
  async getCourseQuestions(courseId: number): Promise<CourseQuestion[]> {
    return await db
      .select()
      .from(courseQuestions)
      .where(eq(courseQuestions.courseId, courseId))
      .orderBy(courseQuestions.order);
  }

  async createCourseQuestion(question: InsertCourseQuestion): Promise<CourseQuestion> {
    const [newQuestion] = await db.insert(courseQuestions).values(question).returning();
    return newQuestion;
  }

  async deleteCourseQuestion(questionId: number): Promise<void> {
    await db.delete(courseQuestions).where(eq(courseQuestions.id, questionId));
  }

  async getEmployeeCourseById(id: number): Promise<EmployeeCourse | undefined> {
    const [employeeCourse] = await db.select().from(employeeCourses).where(eq(employeeCourses.id, id));
    return employeeCourse;
  }

  async createCourseAnswer(answer: InsertCourseAnswer): Promise<CourseAnswer> {
    const [newAnswer] = await db.insert(courseAnswers).values(answer).returning();
    return newAnswer;
  }

  async getEmployeeCourseAnswers(employeeCourseId: number): Promise<CourseAnswer[]> {
    return await db
      .select()
      .from(courseAnswers)
      .where(eq(courseAnswers.employeeCourseId, employeeCourseId));
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

  // Authorized device operations
  async getAuthorizedDevices(companyId: number): Promise<AuthorizedDevice[]> {
    return await db
      .select()
      .from(authorizedDevices)
      .where(eq(authorizedDevices.companyId, companyId))
      .orderBy(desc(authorizedDevices.createdAt));
  }

  async getAuthorizedDevice(id: number): Promise<AuthorizedDevice | undefined> {
    const [device] = await db
      .select()
      .from(authorizedDevices)
      .where(eq(authorizedDevices.id, id));
    return device;
  }

  async getAuthorizedDeviceByCode(deviceCode: string): Promise<AuthorizedDevice | undefined> {
    const [device] = await db
      .select()
      .from(authorizedDevices)
      .where(eq(authorizedDevices.deviceCode, deviceCode));
    return device;
  }

  async createAuthorizedDevice(device: InsertAuthorizedDevice): Promise<AuthorizedDevice> {
    const [newDevice] = await db
      .insert(authorizedDevices)
      .values(device)
      .returning();
    return newDevice;
  }

  async updateAuthorizedDevice(id: number, device: Partial<InsertAuthorizedDevice>): Promise<AuthorizedDevice> {
    const [updatedDevice] = await db
      .update(authorizedDevices)
      .set({ ...device, updatedAt: new Date() })
      .where(eq(authorizedDevices.id, id))
      .returning();
    return updatedDevice;
  }

  async deleteAuthorizedDevice(id: number): Promise<void> {
    await db
      .delete(authorizedDevices)
      .where(eq(authorizedDevices.id, id));
  }

  async updateDeviceLastUsed(id: number): Promise<void> {
    await db
      .update(authorizedDevices)
      .set({ lastUsedAt: new Date() })
      .where(eq(authorizedDevices.id, id));
  }

  // Enhanced user shift assignment operations with sequential validation
  async validateSequentialAssignment(
    userId: string, 
    shiftId: number, 
    startDate?: string, 
    endDate?: string, 
    excludeAssignmentId?: number
  ): Promise<{ valid: boolean; conflictingAssignments?: SelectUserShiftAssignment[] }> {
    let conditions = [
      eq(userShiftAssignments.userId, userId),
      eq(userShiftAssignments.shiftId, shiftId),
      eq(userShiftAssignments.isActive, true)
    ];

    // Exclude current assignment when updating
    if (excludeAssignmentId) {
      conditions.push(sql`${userShiftAssignments.id} != ${excludeAssignmentId}`);
    }

    const existingAssignments = await db
      .select()
      .from(userShiftAssignments)
      .where(and(...conditions))
      .orderBy(userShiftAssignments.startDate);

    // If no date range provided, it's a permanent assignment - check for any overlap
    if (!startDate || !endDate) {
      return existingAssignments.length > 0 
        ? { valid: false, conflictingAssignments: existingAssignments }
        : { valid: true };
    }

    // Check for overlapping date ranges
    const conflicts = existingAssignments.filter(assignment => {
      // If existing assignment has no dates, it's permanent - conflict
      if (!assignment.startDate || !assignment.endDate) {
        return true;
      }

      const newStart = new Date(startDate);
      const newEnd = new Date(endDate);
      const existingStart = new Date(assignment.startDate);
      const existingEnd = new Date(assignment.endDate);

      // Check for any overlap: new assignment overlaps if it starts before existing ends
      // and ends after existing starts
      return newStart <= existingEnd && newEnd >= existingStart;
    });

    return conflicts.length > 0 
      ? { valid: false, conflictingAssignments: conflicts }
      : { valid: true };
  }

  async createUserShiftAssignmentWithValidation(assignment: InsertUserShiftAssignment): Promise<SelectUserShiftAssignment> {
    // Validate sequential assignment
    const validation = await this.validateSequentialAssignment(
      assignment.userId,
      assignment.shiftId,
      assignment.startDate || undefined,
      assignment.endDate || undefined
    );

    if (!validation.valid) {
      throw new Error(
        `Conflito de vinculação: Funcionário já possui vinculação neste turno para o período especificado. ` +
        `Para múltiplas vinculações sequenciais, certifique-se de que a data final da vinculação anterior ` +
        `seja menor que a data inicial da nova vinculação.`
      );
    }

    // Create the assignment
    return this.createUserShiftAssignment(assignment);
  }

  // Rotation template operations
  async getRotationTemplates(companyId: number, departmentId?: number): Promise<RotationTemplate[]> {
    let conditions = [eq(rotationTemplates.companyId, companyId)];
    
    if (departmentId) {
      conditions.push(eq(rotationTemplates.departmentId, departmentId));
    }

    return await db
      .select()
      .from(rotationTemplates)
      .where(and(...conditions))
      .orderBy(rotationTemplates.name);
  }

  async getRotationTemplate(id: number): Promise<RotationTemplate | undefined> {
    const [template] = await db
      .select()
      .from(rotationTemplates)
      .where(eq(rotationTemplates.id, id));
    return template;
  }

  async createRotationTemplate(template: InsertRotationTemplate): Promise<RotationTemplate> {
    const [newTemplate] = await db
      .insert(rotationTemplates)
      .values(template)
      .returning();
    return newTemplate;
  }

  async updateRotationTemplate(id: number, template: Partial<InsertRotationTemplate>): Promise<RotationTemplate> {
    const [updatedTemplate] = await db
      .update(rotationTemplates)
      .set({ ...template, updatedAt: new Date() })
      .where(eq(rotationTemplates.id, id))
      .returning();
    return updatedTemplate;
  }

  async deleteRotationTemplate(id: number): Promise<void> {
    await db
      .delete(rotationTemplates)
      .where(eq(rotationTemplates.id, id));
  }

  // Rotation segment operations
  async getRotationSegments(templateId: number): Promise<RotationSegment[]> {
    return await db
      .select()
      .from(rotationSegments)
      .where(eq(rotationSegments.templateId, templateId))
      .orderBy(rotationSegments.sequenceOrder);
  }

  async getRotationSegment(id: number): Promise<RotationSegment | undefined> {
    const [segment] = await db
      .select()
      .from(rotationSegments)
      .where(eq(rotationSegments.id, id));
    return segment;
  }

  async createRotationSegment(segment: InsertRotationSegment): Promise<RotationSegment> {
    const [newSegment] = await db
      .insert(rotationSegments)
      .values(segment)
      .returning();
    return newSegment;
  }

  async updateRotationSegment(id: number, segment: Partial<InsertRotationSegment>): Promise<RotationSegment> {
    const [updatedSegment] = await db
      .update(rotationSegments)
      .set({ ...segment, updatedAt: new Date() })
      .where(eq(rotationSegments.id, id))
      .returning();
    return updatedSegment;
  }

  async deleteRotationSegment(id: number): Promise<void> {
    await db
      .delete(rotationSegments)
      .where(eq(rotationSegments.id, id));
  }

  // Rotation user assignment operations
  async getRotationUserAssignments(templateId: number): Promise<RotationUserAssignment[]> {
    return await db
      .select()
      .from(rotationUserAssignments)
      .where(
        and(
          eq(rotationUserAssignments.templateId, templateId),
          eq(rotationUserAssignments.isActive, true)
        )
      );
  }

  async getUserRotationAssignments(userId: string): Promise<RotationUserAssignment[]> {
    return await db
      .select()
      .from(rotationUserAssignments)
      .where(
        and(
          eq(rotationUserAssignments.userId, userId),
          eq(rotationUserAssignments.isActive, true)
        )
      );
  }

  async getRotationUserAssignment(id: number): Promise<RotationUserAssignment | undefined> {
    const [assignment] = await db
      .select()
      .from(rotationUserAssignments)
      .where(eq(rotationUserAssignments.id, id));
    return assignment;
  }

  async createRotationUserAssignment(assignment: InsertRotationUserAssignment): Promise<RotationUserAssignment> {
    const [newAssignment] = await db
      .insert(rotationUserAssignments)
      .values(assignment)
      .returning();
    return newAssignment;
  }

  async updateRotationUserAssignment(id: number, assignment: Partial<InsertRotationUserAssignment>): Promise<RotationUserAssignment> {
    const [updatedAssignment] = await db
      .update(rotationUserAssignments)
      .set(assignment)
      .where(eq(rotationUserAssignments.id, id))
      .returning();
    return updatedAssignment;
  }

  async deleteRotationUserAssignment(id: number): Promise<void> {
    await db
      .update(rotationUserAssignments)
      .set({ 
        isActive: false,
        deactivatedAt: new Date()
      })
      .where(eq(rotationUserAssignments.id, id));
  }

  // Rotation exception operations
  async getRotationExceptions(templateId: number, userId?: string, date?: string): Promise<RotationException[]> {
    let conditions = [eq(rotationExceptions.templateId, templateId)];
    
    if (userId) {
      const userCondition = or(
        eq(rotationExceptions.userId, userId),
        isNull(rotationExceptions.userId) // Global exceptions
      );
      if (userCondition) {
        conditions.push(userCondition);
      }
    }
    
    if (date) {
      conditions.push(eq(rotationExceptions.exceptionDate, date));
    }

    return await db
      .select()
      .from(rotationExceptions)
      .where(and(...conditions))
      .orderBy(rotationExceptions.exceptionDate);
  }

  async createRotationException(exception: InsertRotationException): Promise<RotationException> {
    const [newException] = await db
      .insert(rotationExceptions)
      .values(exception)
      .returning();
    return newException;
  }

  async deleteRotationException(id: number): Promise<void> {
    await db
      .delete(rotationExceptions)
      .where(eq(rotationExceptions.id, id));
  }

  // Rotation scheduling and preview operations (simplified implementations)
  async previewRotationSchedule(
    templateId: number, 
    startDate: string, 
    endDate: string, 
    userIds?: string[]
  ): Promise<{
    userId: string;
    date: string;
    shiftId: number | null;
    segmentName: string;
    isRestDay: boolean;
  }[]> {
    console.log(`[DEBUG] Preview rotation schedule for template ${templateId}, ${startDate} to ${endDate}`);
    
    const template = await this.getRotationTemplate(templateId);
    const segments = await this.getRotationSegments(templateId);
    
    console.log(`[DEBUG] Template found:`, template);
    console.log(`[DEBUG] Segments found:`, segments);
    
    if (!template || segments.length === 0) {
      console.log(`[DEBUG] Early return: template=${!!template}, segments.length=${segments.length}`);
      return [];
    }

    // Get employees from the company if no specific userIds provided
    let employees: User[] = [];
    if (userIds && userIds.length > 0) {
      // Use specific users
      for (const userId of userIds) {
        const user = await this.getUser(userId);
        if (user && user.companyId === template.companyId) {
          employees.push(user);
        }
      }
    } else {
      // Get all non-admin users from the company for demo
      employees = await db
        .select()
        .from(users)
        .where(and(
          eq(users.companyId, template.companyId),
          ne(users.role, 'superadmin') // Exclude superadmin only
        ))
        .limit(3); // Limit to 3 users for demo
    }

    console.log(`[DEBUG] Found ${employees.length} users for company ${template.companyId}`);

    if (employees.length === 0) {
      // Create demo data if no employees found
      console.log(`[DEBUG] No employees found, creating demo preview data`);
      const demoUser = {
        id: 'demo_user_1',
        name: 'Funcionário Demo',
        email: 'demo@example.com'
      };
      
      // Generate a few demo entries
      for (let dayOffset = 0; dayOffset < Math.min(7, totalDays); dayOffset++) {
        const currentDate = new Date(start);
        currentDate.setDate(start.getDate() + dayOffset);
        const dateStr = currentDate.toISOString().split('T')[0];
        
        const segmentIndex = dayOffset % sortedSegments.length;
        const activeSegment = sortedSegments[segmentIndex];
        
        if (activeSegment) {
          result.push({
            userId: demoUser.id,
            date: dateStr,
            shiftId: activeSegment.shiftId,
            segmentName: activeSegment.name,
            isRestDay: !activeSegment.shiftId
          });
        }
      }
      
      console.log(`[DEBUG] Generated ${result.length} demo rotation entries`);
      return result;
    }

    const result: {
      userId: string;
      date: string;
      shiftId: number | null;
      segmentName: string;
      isRestDay: boolean;
    }[] = [];

    const start = new Date(startDate);
    const end = new Date(endDate);
    const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    console.log(`[DEBUG] Employees found:`, employees.length);

    // Simple rotation logic based on segments
    const sortedSegments = segments.sort((a, b) => a.sequenceOrder - b.sequenceOrder);
    console.log(`[DEBUG] Sorted segments:`, sortedSegments);

    // Generate schedule for each day
    for (let dayOffset = 0; dayOffset < totalDays; dayOffset++) {
      const currentDate = new Date(start);
      currentDate.setDate(start.getDate() + dayOffset);
      const dateStr = currentDate.toISOString().split('T')[0];

      // For each employee, create a rotation assignment
      employees.forEach((employee, employeeIndex) => {
        // Simple round-robin: each employee gets assigned to a different segment based on day and employee index
        const segmentIndex = (dayOffset + employeeIndex) % sortedSegments.length;
        const activeSegment = sortedSegments[segmentIndex];

        if (activeSegment) {
          result.push({
            userId: employee.id,
            date: dateStr,
            shiftId: activeSegment.shiftId,
            segmentName: activeSegment.name,
            isRestDay: !activeSegment.shiftId
          });
        }
      });
    }

    console.log(`[DEBUG] Generated ${result.length} rotation entries`);

    return result;
  }

  async generateRotationAssignments(
    templateId: number, 
    startDate: string, 
    endDate: string, 
    performedBy: string
  ): Promise<{
    generatedAssignments: number;
    affectedUsers: number;
    dateRange: string;
  }> {
    console.log(`[DEBUG] Generating rotation assignments for template ${templateId}, ${startDate} to ${endDate}`);
    
    // Reuse preview logic to calculate assignments
    const previewData = await this.previewRotationSchedule(templateId, startDate, endDate);
    
    if (previewData.length === 0) {
      console.log(`[DEBUG] No preview data to generate assignments from`);
      return {
        generatedAssignments: 0,
        affectedUsers: 0,
        dateRange: `${startDate} to ${endDate}`
      };
    }

    // Clear existing assignments for this date range and template
    const template = await this.getRotationTemplate(templateId);
    if (!template) {
      throw new Error("Template not found");
    }

    // Delete existing user shift assignments in the date range for this company
    await db.execute(sql`
      DELETE FROM user_shift_assignments 
      WHERE user_id IN (
        SELECT id FROM users WHERE company_id = ${template.companyId}
      ) 
      AND start_date >= ${startDate} 
      AND start_date <= ${endDate}
    `);

    console.log(`[DEBUG] Cleared existing assignments for date range`);

    // Create new assignments from preview data
    let generatedCount = 0;
    const affectedUserIds = new Set<string>();

    for (const entry of previewData) {
      if (entry.shiftId && entry.userId !== 'demo_user_1') {
        try {
          // Create assignment for this specific date
          await db.insert(userShiftAssignments).values({
            userId: entry.userId,
            shiftId: entry.shiftId,
            startDate: entry.date,
            endDate: entry.date,
            assignmentType: 'temporary' // Mark as temporary rotation assignment
          });
          
          generatedCount++;
          affectedUserIds.add(entry.userId);
        } catch (error) {
          console.error(`[DEBUG] Error creating assignment for ${entry.userId} on ${entry.date}:`, error);
        }
      }
    }

    console.log(`[DEBUG] Generated ${generatedCount} assignments for ${affectedUserIds.size} users`);

    return {
      generatedAssignments: generatedCount,
      affectedUsers: affectedUserIds.size,
      dateRange: `${startDate} to ${endDate}`
    };
  }

  // Rotation audit operations
  async createRotationAudit(audit: any): Promise<RotationAudit> {
    const [newAudit] = await db
      .insert(rotationAudit)
      .values(audit)
      .returning();
    return newAudit;
  }

  async getRotationAuditHistory(templateId: number, limit = 50): Promise<RotationAudit[]> {
    return await db
      .select()
      .from(rotationAudit)
      .where(eq(rotationAudit.templateId, templateId))
      .orderBy(desc(rotationAudit.performedAt))
      .limit(limit);
  }

  // ========================================================================================
  // RECRUITMENT & SELECTION IMPLEMENTATIONS
  // ========================================================================================

  // Job opening operations
  async getJobOpenings(companyId: number, status?: string): Promise<any[]> {
    if (status) {
      return await db
        .select()
        .from(jobOpenings)
        .where(and(eq(jobOpenings.companyId, companyId), eq(jobOpenings.status, status)))
        .orderBy(desc(jobOpenings.createdAt));
    }
    return await db
      .select()
      .from(jobOpenings)
      .where(eq(jobOpenings.companyId, companyId))
      .orderBy(desc(jobOpenings.createdAt));
  }

  async getPublicJobOpenings(companyId?: number): Promise<any[]> {
    // Return only published job openings for public viewing with company name
    const whereConditions = companyId
      ? and(eq(jobOpenings.companyId, companyId), eq(jobOpenings.status, 'published'))
      : eq(jobOpenings.status, 'published');

    const results = await db
      .select({
        job: jobOpenings,
        company: companies,
      })
      .from(jobOpenings)
      .leftJoin(companies, eq(jobOpenings.companyId, companies.id))
      .where(whereConditions)
      .orderBy(desc(jobOpenings.createdAt));

    // Map results to include companyName at the top level
    return results.map((row) => ({
      ...row.job,
      companyName: row.company?.name || null,
    }));
  }

  async getJobOpening(id: number): Promise<any | undefined> {
    const [result] = await db
      .select({
        job: jobOpenings,
        company: companies,
      })
      .from(jobOpenings)
      .leftJoin(companies, eq(jobOpenings.companyId, companies.id))
      .where(eq(jobOpenings.id, id));
    
    if (!result) return undefined;
    
    return {
      ...result.job,
      companyName: result.company?.name || null,
    };
  }

  async createJobOpening(jobOpening: any): Promise<any> {
    const [newJob] = await db.insert(jobOpenings).values(jobOpening).returning();
    return newJob;
  }

  async updateJobOpening(id: number, jobOpening: Partial<any>): Promise<any> {
    const [updated] = await db
      .update(jobOpenings)
      .set({ ...jobOpening, updatedAt: new Date() })
      .where(eq(jobOpenings.id, id))
      .returning();
    return updated;
  }

  async deleteJobOpening(id: number): Promise<void> {
    await db.delete(jobOpenings).where(eq(jobOpenings.id, id));
  }

  async publishJobOpening(id: number): Promise<any> {
    const [updated] = await db
      .update(jobOpenings)
      .set({ status: 'published', publishedAt: new Date(), updatedAt: new Date() })
      .where(eq(jobOpenings.id, id))
      .returning();
    return updated;
  }

  async closeJobOpening(id: number): Promise<any> {
    const [updated] = await db
      .update(jobOpenings)
      .set({ status: 'closed', closedAt: new Date(), updatedAt: new Date() })
      .where(eq(jobOpenings.id, id))
      .returning();
    return updated;
  }

  // Candidate operations
  async getCandidates(companyId: number): Promise<any[]> {
    return await db
      .select()
      .from(candidates)
      .where(eq(candidates.companyId, companyId))
      .orderBy(desc(candidates.createdAt));
  }

  async getCandidate(id: number): Promise<any | undefined> {
    const [candidate] = await db.select().from(candidates).where(eq(candidates.id, id));
    return candidate;
  }

  async createCandidate(candidate: any): Promise<any> {
    const [newCandidate] = await db.insert(candidates).values(candidate).returning();
    return newCandidate;
  }

  async updateCandidate(id: number, candidate: Partial<any>): Promise<any> {
    const [updated] = await db
      .update(candidates)
      .set({ ...candidate, updatedAt: new Date() })
      .where(eq(candidates.id, id))
      .returning();
    return updated;
  }

  async getCandidateByEmail(companyId: number, email: string): Promise<any | undefined> {
    const [candidate] = await db
      .select()
      .from(candidates)
      .where(and(eq(candidates.companyId, companyId), eq(candidates.email, email)));
    return candidate;
  }

  // Application operations
  async getApplications(jobOpeningId: number): Promise<any[]> {
    return await db
      .select()
      .from(applications)
      .where(eq(applications.jobOpeningId, jobOpeningId))
      .orderBy(desc(applications.appliedAt));
  }

  async getApplication(id: number): Promise<any | undefined> {
    const [application] = await db.select().from(applications).where(eq(applications.id, id));
    return application;
  }

  async createApplication(application: any): Promise<any> {
    const [newApplication] = await db.insert(applications).values(application).returning();
    return newApplication;
  }

  async updateApplication(id: number, application: Partial<any>): Promise<any> {
    const [updated] = await db
      .update(applications)
      .set({ ...application, updatedAt: new Date() })
      .where(eq(applications.id, id))
      .returning();
    return updated;
  }

  async deleteApplicationsBulk(ids: number[]): Promise<number> {
    if (ids.length === 0) return 0;
    await db
      .delete(applications)
      .where(inArray(applications.id, ids));
    // Return the count of IDs requested for deletion
    // Note: Drizzle delete doesn't return rowCount, so we return the input length
    return ids.length;
  }

  async getCandidateApplications(candidateId: number): Promise<any[]> {
    return await db
      .select()
      .from(applications)
      .where(eq(applications.candidateId, candidateId))
      .orderBy(desc(applications.appliedAt));
  }

  async getApplicationsByStatus(jobOpeningId: number, status: string): Promise<any[]> {
    return await db
      .select()
      .from(applications)
      .where(and(eq(applications.jobOpeningId, jobOpeningId), eq(applications.status, status)))
      .orderBy(desc(applications.appliedAt));
  }

  // Job requirements operations
  async getJobRequirements(jobOpeningId: number): Promise<any[]> {
    return await db
      .select()
      .from(jobRequirements)
      .where(eq(jobRequirements.jobOpeningId, jobOpeningId))
      .orderBy(jobRequirements.order);
  }

  async getJobRequirement(id: number): Promise<any | undefined> {
    const [requirement] = await db
      .select()
      .from(jobRequirements)
      .where(eq(jobRequirements.id, id));
    return requirement;
  }

  async createJobRequirement(requirement: any): Promise<any> {
    const [newReq] = await db
      .insert(jobRequirements)
      .values(requirement)
      .returning();
    return newReq;
  }

  async updateJobRequirement(id: number, requirement: Partial<any>): Promise<any> {
    const [updated] = await db
      .update(jobRequirements)
      .set({ ...requirement, updatedAt: new Date() })
      .where(eq(jobRequirements.id, id))
      .returning();
    return updated;
  }

  async deleteJobRequirement(id: number): Promise<void> {
    await db.delete(jobRequirements).where(eq(jobRequirements.id, id));
  }

  async bulkReplaceJobRequirements(jobOpeningId: number, requirements: any[]): Promise<any[]> {
    // Wrap delete + insert in a transaction for atomicity
    return await db.transaction(async (tx) => {
      // Delete all existing requirements for this job opening
      await tx
        .delete(jobRequirements)
        .where(eq(jobRequirements.jobOpeningId, jobOpeningId));
      
      // Insert new requirements if any
      if (requirements.length === 0) {
        return [];
      }

      const newRequirements = await tx
        .insert(jobRequirements)
        .values(requirements.map((req, index) => ({
          ...req,
          jobOpeningId,
          order: req.order ?? index,
        })))
        .returning();
      
      return newRequirements;
    });
  }

  // Application requirement responses operations
  async getApplicationRequirementResponses(applicationId: number): Promise<any[]> {
    return await db
      .select()
      .from(applicationRequirementResponses)
      .where(eq(applicationRequirementResponses.applicationId, applicationId));
  }

  async submitAndScoreApplication(applicationId: number, responses: any[]): Promise<{ 
    score: number; 
    isQualified: boolean; 
    missingMandatoryRequirements: string[];
  }> {
    // Step 1: Get the application to find the job opening
    const application = await this.getApplication(applicationId);
    if (!application) {
      throw new Error('Application not found');
    }

    // Step 2: Get all requirements for this job opening
    const allRequirements = await this.getJobRequirements(application.jobOpeningId);
    
    // Step 3: Identify mandatory requirements
    const mandatoryRequirements = allRequirements.filter(
      req => req.requirementType === 'mandatory'
    );
    
    // Step 4: Check which mandatory requirements have responses
    const respondedRequirementIds = new Set(responses.map(r => r.requirementId));
    const missingMandatory = mandatoryRequirements.filter(
      req => !respondedRequirementIds.has(req.id)
    );
    
    const missingMandatoryRequirements = missingMandatory.map(req => req.title);
    const isQualified = missingMandatory.length === 0;
    
    // Step 5: Upsert responses (delete existing + insert new)
    await db
      .delete(applicationRequirementResponses)
      .where(eq(applicationRequirementResponses.applicationId, applicationId));
    
    if (responses.length > 0) {
      // Step 6: For each response, find the requirement and calculate points earned
      const responsesWithPoints = await Promise.all(
        responses.map(async (response) => {
          const requirement = allRequirements.find(r => r.id === response.requirementId);
          if (!requirement) {
            throw new Error(`Requirement ${response.requirementId} not found`);
          }
          
          // Find the points for the selected proficiency level
          const proficiencyLevels = requirement.proficiencyLevels as any[];
          const selectedLevel = proficiencyLevels.find(
            level => level.level === response.proficiencyLevel
          );
          
          if (!selectedLevel) {
            throw new Error(
              `Proficiency level "${response.proficiencyLevel}" not found for requirement ${requirement.title}`
            );
          }
          
          return {
            applicationId,
            requirementId: response.requirementId,
            proficiencyLevel: response.proficiencyLevel,
            pointsEarned: selectedLevel.points,
          };
        })
      );
      
      await db
        .insert(applicationRequirementResponses)
        .values(responsesWithPoints);
      
      // Step 7: Calculate weighted score: Σ(Pi × Wi)
      let totalScore = 0;
      for (const response of responsesWithPoints) {
        const requirement = allRequirements.find(r => r.id === response.requirementId);
        if (requirement) {
          totalScore += response.pointsEarned * requirement.weight;
        }
      }
      
      // Step 8: Update application with score and qualification status
      await db
        .update(applications)
        .set({ 
          score: totalScore, 
          isQualified,
          updatedAt: new Date()
        })
        .where(eq(applications.id, applicationId));
      
      return {
        score: totalScore,
        isQualified,
        missingMandatoryRequirements,
      };
    } else {
      // No responses submitted, set score to 0
      await db
        .update(applications)
        .set({ 
          score: 0, 
          isQualified,
          updatedAt: new Date()
        })
        .where(eq(applications.id, applicationId));
      
      return {
        score: 0,
        isQualified,
        missingMandatoryRequirements,
      };
    }
  }

  // Selection stage operations
  async getSelectionStages(jobOpeningId: number): Promise<any[]> {
    return await db
      .select()
      .from(selectionStages)
      .where(eq(selectionStages.jobOpeningId, jobOpeningId))
      .orderBy(selectionStages.order);
  }

  async createSelectionStage(stage: any): Promise<any> {
    const [newStage] = await db.insert(selectionStages).values(stage).returning();
    return newStage;
  }

  async updateSelectionStage(id: number, stage: Partial<any>): Promise<any> {
    const [updated] = await db
      .update(selectionStages)
      .set(stage)
      .where(eq(selectionStages.id, id))
      .returning();
    return updated;
  }

  async deleteSelectionStage(id: number): Promise<void> {
    await db.delete(selectionStages).where(eq(selectionStages.id, id));
  }

  // Interview template operations
  async getInterviewTemplates(companyId: number): Promise<any[]> {
    return await db
      .select()
      .from(interviewTemplates)
      .where(eq(interviewTemplates.companyId, companyId))
      .orderBy(desc(interviewTemplates.createdAt));
  }

  async getInterviewTemplate(id: number): Promise<any | undefined> {
    const [template] = await db.select().from(interviewTemplates).where(eq(interviewTemplates.id, id));
    return template;
  }

  async createInterviewTemplate(template: any): Promise<any> {
    const [newTemplate] = await db.insert(interviewTemplates).values(template).returning();
    return newTemplate;
  }

  async updateInterviewTemplate(id: number, template: Partial<any>): Promise<any> {
    const [updated] = await db
      .update(interviewTemplates)
      .set({ ...template, updatedAt: new Date() })
      .where(eq(interviewTemplates.id, id))
      .returning();
    return updated;
  }

  async deleteInterviewTemplate(id: number): Promise<void> {
    await db.delete(interviewTemplates).where(eq(interviewTemplates.id, id));
  }

  // Interview operations
  async getInterviews(applicationId: number): Promise<any[]> {
    return await db
      .select()
      .from(interviews)
      .where(eq(interviews.applicationId, applicationId))
      .orderBy(desc(interviews.scheduledAt));
  }

  async getInterview(id: number): Promise<any | undefined> {
    const [interview] = await db.select().from(interviews).where(eq(interviews.id, id));
    return interview;
  }

  async createInterview(interview: any): Promise<any> {
    const [newInterview] = await db.insert(interviews).values(interview).returning();
    return newInterview;
  }

  async updateInterview(id: number, interview: Partial<any>): Promise<any> {
    const [updated] = await db
      .update(interviews)
      .set(interview)
      .where(eq(interviews.id, id))
      .returning();
    return updated;
  }

  async completeInterview(id: number, feedback: string, rating: number, evaluation: any): Promise<any> {
    const [updated] = await db
      .update(interviews)
      .set({ 
        status: 'completed', 
        feedback, 
        rating, 
        evaluation, 
        completedAt: new Date() 
      })
      .where(eq(interviews.id, id))
      .returning();
    return updated;
  }

  // Onboarding link operations
  async getOnboardingLinks(companyId: number): Promise<any[]> {
    const links = await db
      .select({
        onboardingLink: onboardingLinks,
        application: applications,
        jobOpening: jobOpenings
      })
      .from(onboardingLinks)
      .leftJoin(applications, eq(onboardingLinks.applicationId, applications.id))
      .leftJoin(jobOpenings, eq(applications.jobOpeningId, jobOpenings.id))
      .where(eq(jobOpenings.companyId, companyId))
      .orderBy(desc(onboardingLinks.createdAt));
    
    return links.map(l => ({ ...l.onboardingLink, application: l.application, jobOpening: l.jobOpening }));
  }

  async getOnboardingLinkByToken(token: string): Promise<any | undefined> {
    const [link] = await db.select().from(onboardingLinks).where(eq(onboardingLinks.token, token));
    return link;
  }

  async createOnboardingLink(link: any): Promise<any> {
    const [newLink] = await db.insert(onboardingLinks).values(link).returning();
    return newLink;
  }

  async updateOnboardingLink(id: number, link: Partial<any>): Promise<any> {
    const [updated] = await db
      .update(onboardingLinks)
      .set(link)
      .where(eq(onboardingLinks.id, id))
      .returning();
    return updated;
  }

  async completeOnboarding(token: string): Promise<any> {
    const [updated] = await db
      .update(onboardingLinks)
      .set({ status: 'completed', completedAt: new Date() })
      .where(eq(onboardingLinks.token, token))
      .returning();
    return updated;
  }

  // Onboarding document operations
  async getOnboardingDocuments(onboardingLinkId: number): Promise<any[]> {
    return await db
      .select()
      .from(onboardingDocuments)
      .where(eq(onboardingDocuments.onboardingLinkId, onboardingLinkId))
      .orderBy(onboardingDocuments.uploadedAt);
  }

  async createOnboardingDocument(document: any): Promise<any> {
    const [newDocument] = await db.insert(onboardingDocuments).values(document).returning();
    return newDocument;
  }

  async updateOnboardingDocument(id: number, document: Partial<any>): Promise<any> {
    const [updated] = await db
      .update(onboardingDocuments)
      .set(document)
      .where(eq(onboardingDocuments.id, id))
      .returning();
    return updated;
  }

  async reviewOnboardingDocument(id: number, status: string, reviewNotes: string, reviewedBy: string): Promise<any> {
    const [updated] = await db
      .update(onboardingDocuments)
      .set({ 
        status, 
        reviewNotes, 
        reviewedBy, 
        reviewedAt: new Date() 
      })
      .where(eq(onboardingDocuments.id, id))
      .returning();
    return updated;
  }

  // Onboarding form data operations
  async getOnboardingFormData(onboardingLinkId: number): Promise<any | undefined> {
    const [formData] = await db
      .select()
      .from(onboardingFormData)
      .where(eq(onboardingFormData.onboardingLinkId, onboardingLinkId));
    return formData;
  }

  async upsertOnboardingFormData(formData: any): Promise<any> {
    const [data] = await db
      .insert(onboardingFormData)
      .values(formData)
      .onConflictDoUpdate({
        target: onboardingFormData.onboardingLinkId,
        set: {
          ...formData,
          updatedAt: new Date()
        }
      })
      .returning();
    return data;
  }

  // ========================================================================================
  // OVERTIME & TIME BANK OPERATIONS
  // ========================================================================================

  // Overtime Rules operations
  async getOvertimeRules(departmentId: number): Promise<OvertimeRule[]> {
    return await db
      .select()
      .from(overtimeRules)
      .where(eq(overtimeRules.departmentId, departmentId))
      .orderBy(desc(overtimeRules.priority));
  }

  async getOvertimeRule(id: number): Promise<OvertimeRule | undefined> {
    const [rule] = await db
      .select()
      .from(overtimeRules)
      .where(eq(overtimeRules.id, id));
    return rule;
  }

  async createOvertimeRule(rule: InsertOvertimeRule): Promise<OvertimeRule> {
    const [newRule] = await db.insert(overtimeRules).values(rule).returning();
    return newRule;
  }

  async updateOvertimeRule(id: number, rule: Partial<InsertOvertimeRule>): Promise<OvertimeRule> {
    const [updated] = await db
      .update(overtimeRules)
      .set({ ...rule, updatedAt: new Date() })
      .where(eq(overtimeRules.id, id))
      .returning();
    return updated;
  }

  async deleteOvertimeRule(id: number): Promise<void> {
    await db.delete(overtimeRules).where(eq(overtimeRules.id, id));
  }

  async getApplicableOvertimeRule(
    departmentId: number, 
    shiftId: number | null, 
    date: Date
  ): Promise<(OvertimeRule & { tiers: OvertimeTier[] }) | undefined> {
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    
    // Check if date is a holiday
    const dateStr = date.toISOString().split('T')[0];
    const [holiday] = await db
      .select()
      .from(holidays)
      .where(
        and(
          eq(holidays.date, dateStr),
          eq(holidays.isActive, true)
        )
      );
    const isHoliday = !!holiday;
    
    // Find applicable rules ordered by priority
    const rules = await db
      .select()
      .from(overtimeRules)
      .where(
        and(
          eq(overtimeRules.departmentId, departmentId),
          eq(overtimeRules.isActive, true),
          or(
            isNull(overtimeRules.shiftId),
            shiftId ? eq(overtimeRules.shiftId, shiftId) : sql`true`
          )
        )
      )
      .orderBy(desc(overtimeRules.priority));
    
    // Find the first rule that applies to this day type
    for (const rule of rules) {
      if (isHoliday && rule.applyToHolidays) {
        const tiers = await this.getOvertimeTiers(rule.id);
        return { ...rule, tiers };
      }
      if (isWeekend && rule.applyToWeekends) {
        const tiers = await this.getOvertimeTiers(rule.id);
        return { ...rule, tiers };
      }
      if (!isWeekend && !isHoliday && rule.applyToWeekdays) {
        const tiers = await this.getOvertimeTiers(rule.id);
        return { ...rule, tiers };
      }
    }
    
    return undefined;
  }

  // Overtime Tiers operations
  async getOvertimeTiers(overtimeRuleId: number): Promise<OvertimeTier[]> {
    return await db
      .select()
      .from(overtimeTiers)
      .where(eq(overtimeTiers.overtimeRuleId, overtimeRuleId))
      .orderBy(overtimeTiers.orderIndex);
  }

  async createOvertimeTier(tier: InsertOvertimeTier): Promise<OvertimeTier> {
    const [newTier] = await db.insert(overtimeTiers).values(tier).returning();
    return newTier;
  }

  async updateOvertimeTier(id: number, tier: Partial<InsertOvertimeTier>): Promise<OvertimeTier> {
    const [updated] = await db
      .update(overtimeTiers)
      .set(tier)
      .where(eq(overtimeTiers.id, id))
      .returning();
    return updated;
  }

  async deleteOvertimeTier(id: number): Promise<void> {
    await db.delete(overtimeTiers).where(eq(overtimeTiers.id, id));
  }

  // Time Bank operations
  async getTimeBank(userId: string): Promise<TimeBank | undefined> {
    const [bank] = await db
      .select()
      .from(timeBank)
      .where(eq(timeBank.userId, userId));
    return bank;
  }

  async createTimeBank(timeBankData: InsertTimeBank): Promise<TimeBank> {
    const [newBank] = await db.insert(timeBank).values(timeBankData).returning();
    return newBank;
  }

  async updateTimeBankBalance(
    userId: string,
    hours: number,
    type: 'credit' | 'debit',
    reason: string,
    description?: string,
    timeEntryId?: number,
    createdBy?: string
  ): Promise<TimeBank> {
    // Get or create time bank
    let bank = await this.getTimeBank(userId);
    if (!bank) {
      const [user] = await db.select().from(users).where(eq(users.id, userId));
      if (!user?.companyId) throw new Error('User company not found');
      bank = await this.createTimeBank({ userId, companyId: user.companyId });
    }

    // Calculate new balance
    const currentBalance = parseFloat(bank.balanceHours || '0');
    const hoursNum = parseFloat(hours.toString());
    const newBalance = type === 'credit' 
      ? currentBalance + hoursNum 
      : currentBalance - hoursNum;

    // Update time bank
    const [updated] = await db
      .update(timeBank)
      .set({
        balanceHours: newBalance.toFixed(2),
        totalCredited: type === 'credit'
          ? (parseFloat(bank.totalCredited || '0') + hoursNum).toFixed(2)
          : bank.totalCredited,
        totalDebited: type === 'debit'
          ? (parseFloat(bank.totalDebited || '0') + hoursNum).toFixed(2)
          : bank.totalDebited,
        updatedAt: new Date()
      })
      .where(eq(timeBank.userId, userId))
      .returning();

    // Create transaction record
    await this.createTimeBankTransaction({
      timeBankId: bank.id,
      userId,
      transactionType: type,
      hours: hoursNum.toFixed(2),
      balanceAfter: newBalance.toFixed(2),
      timeEntryId,
      reason,
      description,
      createdBy
    });

    return updated;
  }

  async getTimeBankBalance(userId: string): Promise<number> {
    const bank = await this.getTimeBank(userId);
    return bank ? parseFloat(bank.balanceHours || '0') : 0;
  }

  // Time Bank Transaction operations
  async getTimeBankTransactions(userId: string, limit = 50): Promise<TimeBankTransaction[]> {
    return await db
      .select()
      .from(timeBankTransactions)
      .where(eq(timeBankTransactions.userId, userId))
      .orderBy(desc(timeBankTransactions.createdAt))
      .limit(limit);
  }

  async createTimeBankTransaction(transaction: InsertTimeBankTransaction): Promise<TimeBankTransaction> {
    const [newTransaction] = await db
      .insert(timeBankTransactions)
      .values(transaction)
      .returning();
    return newTransaction;
  }

  // Overtime calculation logic
  calculateOvertimeBreakdown(
    overtimeHours: number,
    tiers: OvertimeTier[]
  ): { totalEquivalentHours: number; breakdown: Array<{ tierName: string; hours: number; percentage: number; equivalentHours: number }> } {
    const breakdown: Array<{ tierName: string; hours: number; percentage: number; equivalentHours: number }> = [];
    let remainingHours = overtimeHours;
    let totalEquivalentHours = 0;

    // Sort tiers by order
    const sortedTiers = [...tiers].sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));

    for (const tier of sortedTiers) {
      if (remainingHours <= 0) break;

      const minHours = parseFloat(tier.minHours);
      const maxHours = tier.maxHours ? parseFloat(tier.maxHours) : Infinity;
      const percentage = tier.percentage;

      // Calculate hours in this tier
      const tierRange = maxHours - minHours;
      const hoursInThisTier = Math.min(remainingHours, Math.max(0, maxHours - Math.max(minHours, overtimeHours - remainingHours)));

      if (hoursInThisTier > 0) {
        const equivalentHours = hoursInThisTier * (1 + percentage / 100);
        breakdown.push({
          tierName: tier.description || `Faixa ${tier.orderIndex || 0}`,
          hours: parseFloat(hoursInThisTier.toFixed(2)),
          percentage,
          equivalentHours: parseFloat(equivalentHours.toFixed(2))
        });
        totalEquivalentHours += equivalentHours;
        remainingHours -= hoursInThisTier;
      }
    }

    return {
      totalEquivalentHours: parseFloat(totalEquivalentHours.toFixed(2)),
      breakdown
    };
  }

  async processOvertimeForTimeEntry(
    timeEntryId: number,
    userId: string,
    departmentId: number,
    shiftId: number | null,
    workedHours: number,
    expectedHours: number,
    entryDate: Date
  ): Promise<void> {
    const overtimeHours = Math.max(0, workedHours - expectedHours);
    if (overtimeHours === 0) return;

    // Get applicable overtime rule
    const rule = await this.getApplicableOvertimeRule(departmentId, shiftId, entryDate);
    if (!rule) return;

    // Calculate overtime breakdown
    const { totalEquivalentHours, breakdown } = this.calculateOvertimeBreakdown(overtimeHours, rule.tiers);

    // Update time entry with overtime info
    await db.update(timeEntries)
      .set({
        overtimeRuleId: rule.id,
        overtimeType: rule.overtimeType,
        overtimeBreakdown: JSON.stringify(breakdown),
        timeBankHours: rule.overtimeType === 'time_bank' ? totalEquivalentHours.toFixed(2) : null
      })
      .where(eq(timeEntries.id, timeEntryId));

    // If time bank, credit the hours
    if (rule.overtimeType === 'time_bank') {
      await this.updateTimeBankBalance(
        userId,
        totalEquivalentHours,
        'credit',
        'overtime',
        `HE processada: ${overtimeHours}h trabalhadas = ${totalEquivalentHours}h creditadas`,
        timeEntryId
      );
    }
  }

  // Lead operations
  async createLead(lead: InsertLead): Promise<Lead> {
    const [newLead] = await db
      .insert(leads)
      .values({
        ...lead,
        status: "new",
        sourceChannel: "website",
      })
      .returning();
    return newLead;
  }

  async getLeads(filters?: { status?: string }): Promise<Lead[]> {
    let query = db
      .select()
      .from(leads)
      .orderBy(desc(leads.createdAt));

    if (filters?.status) {
      query = query.where(eq(leads.status, filters.status)) as any;
    }

    return await query;
  }

  async getLead(id: number): Promise<Lead | undefined> {
    const results = await db
      .select()
      .from(leads)
      .where(eq(leads.id, id))
      .limit(1);
    return results[0];
  }

  async updateLeadStatus(
    id: number,
    update: { status?: string; followUpNotes?: string; assignedTo?: string; lastContactedAt?: Date }
  ): Promise<Lead> {
    const [updatedLead] = await db
      .update(leads)
      .set({
        ...update,
        updatedAt: new Date(),
      })
      .where(eq(leads.id, id))
      .returning();
    return updatedLead;
  }

  // DISC assessment operations
  async getDISCQuestions(): Promise<DISCQuestion[]> {
    return await db.select().from(discQuestions).orderBy(discQuestions.order);
  }

  async getActiveDISCQuestions(): Promise<DISCQuestion[]> {
    return await db
      .select()
      .from(discQuestions)
      .where(eq(discQuestions.isActive, true))
      .orderBy(discQuestions.order);
  }

  async createDISCAssessment(assessment: InsertDISCAssessment): Promise<DISCAssessment> {
    const [newAssessment] = await db
      .insert(discAssessments)
      .values(assessment)
      .returning();
    return newAssessment;
  }

  async getDISCAssessment(id: number): Promise<DISCAssessment | undefined> {
    const results = await db
      .select()
      .from(discAssessments)
      .where(eq(discAssessments.id, id))
      .limit(1);
    return results[0];
  }

  async getDISCAssessmentByToken(token: string): Promise<DISCAssessment | undefined> {
    const results = await db
      .select()
      .from(discAssessments)
      .where(eq(discAssessments.accessToken, token))
      .limit(1);
    return results[0];
  }

  async getDISCAssessmentsByJobOpening(jobOpeningId: number): Promise<DISCAssessment[]> {
    return await db
      .select()
      .from(discAssessments)
      .where(eq(discAssessments.jobOpeningId, jobOpeningId))
      .orderBy(desc(discAssessments.createdAt));
  }

  async getDISCAssessmentsByCandidate(candidateId: number): Promise<DISCAssessment[]> {
    return await db
      .select()
      .from(discAssessments)
      .where(eq(discAssessments.candidateId, candidateId))
      .orderBy(desc(discAssessments.createdAt));
  }

  async updateDISCAssessment(id: number, assessment: Partial<InsertDISCAssessment>): Promise<DISCAssessment> {
    const [updated] = await db
      .update(discAssessments)
      .set(assessment)
      .where(eq(discAssessments.id, id))
      .returning();
    return updated;
  }

  async createDISCResponse(response: InsertDISCResponse): Promise<DISCResponse> {
    const [newResponse] = await db
      .insert(discResponses)
      .values(response)
      .returning();
    return newResponse;
  }

  async getDISCResponses(assessmentId: number): Promise<DISCResponse[]> {
    return await db
      .select()
      .from(discResponses)
      .where(eq(discResponses.assessmentId, assessmentId))
      .orderBy(discResponses.questionId);
  }

  async saveDISCResponses(assessmentId: number, responses: InsertDISCResponse[]): Promise<DISCResponse[]> {
    if (responses.length === 0) return [];
    
    const insertedResponses = await db
      .insert(discResponses)
      .values(responses)
      .returning();
    
    return insertedResponses;
  }

  async finalizeDISCAssessment(
    assessmentId: number,
    scores: { dScore: number; iScore: number; sScore: number; cScore: number; primaryProfile: string }
  ): Promise<DISCAssessment> {
    const [updated] = await db
      .update(discAssessments)
      .set({
        status: 'completed',
        completedAt: new Date(),
        dScore: scores.dScore,
        iScore: scores.iScore,
        sScore: scores.sScore,
        cScore: scores.cScore,
        primaryProfile: scores.primaryProfile,
      })
      .where(eq(discAssessments.id, assessmentId))
      .returning();
    return updated;
  }

  // ============= INVENTORY SYSTEM OPERATIONS =============

  // Inventory Category operations
  async getInventoryCategories(companyId: number): Promise<InventoryCategory[]> {
    return await db
      .select()
      .from(inventoryCategories)
      .where(eq(inventoryCategories.companyId, companyId))
      .orderBy(inventoryCategories.name);
  }

  async getInventoryCategory(id: number): Promise<InventoryCategory | undefined> {
    const [category] = await db
      .select()
      .from(inventoryCategories)
      .where(eq(inventoryCategories.id, id));
    return category;
  }

  async createInventoryCategory(category: InsertInventoryCategory): Promise<InventoryCategory> {
    const [newCategory] = await db
      .insert(inventoryCategories)
      .values(category)
      .returning();
    return newCategory;
  }

  async updateInventoryCategory(id: number, category: Partial<InsertInventoryCategory>): Promise<InventoryCategory> {
    const [updated] = await db
      .update(inventoryCategories)
      .set({
        ...category,
        updatedAt: new Date(),
      })
      .where(eq(inventoryCategories.id, id))
      .returning();
    return updated;
  }

  async deleteInventoryCategory(id: number): Promise<void> {
    await db
      .delete(inventoryCategories)
      .where(eq(inventoryCategories.id, id));
  }

  // Inventory Item operations
  async getInventoryItems(companyId: number, filters?: { categoryId?: number; isActive?: boolean }): Promise<InventoryItem[]> {
    const conditions = [eq(inventoryItems.companyId, companyId)];
    
    if (filters?.categoryId) {
      conditions.push(eq(inventoryItems.categoryId, filters.categoryId));
    }
    
    if (filters?.isActive !== undefined) {
      conditions.push(eq(inventoryItems.isActive, filters.isActive));
    }

    return await db
      .select()
      .from(inventoryItems)
      .where(and(...conditions))
      .orderBy(inventoryItems.name);
  }

  async getInventoryItem(id: number): Promise<InventoryItem | undefined> {
    const [item] = await db
      .select()
      .from(inventoryItems)
      .where(eq(inventoryItems.id, id));
    return item;
  }

  async createInventoryItem(item: InsertInventoryItem): Promise<InventoryItem> {
    const [newItem] = await db
      .insert(inventoryItems)
      .values(item)
      .returning();
    
    // Initialize stock for this item
    await db.insert(inventoryStock).values({
      itemId: newItem.id,
      companyId: newItem.companyId,
      quantity: 0,
      location: 'Estoque Principal',
    });
    
    return newItem;
  }

  async updateInventoryItem(id: number, item: Partial<InsertInventoryItem>): Promise<InventoryItem> {
    const [updated] = await db
      .update(inventoryItems)
      .set({
        ...item,
        updatedAt: new Date(),
      })
      .where(eq(inventoryItems.id, id))
      .returning();
    return updated;
  }

  async deleteInventoryItem(id: number): Promise<void> {
    await db
      .delete(inventoryItems)
      .where(eq(inventoryItems.id, id));
  }

  // Inventory Stock operations
  async getInventoryStock(companyId: number): Promise<InventoryStock[]> {
    return await db
      .select()
      .from(inventoryStock)
      .where(eq(inventoryStock.companyId, companyId));
  }

  async getStockByItem(itemId: number): Promise<InventoryStock | undefined> {
    const [stock] = await db
      .select()
      .from(inventoryStock)
      .where(eq(inventoryStock.itemId, itemId));
    return stock;
  }

  async updateInventoryStock(itemId: number, companyId: number, quantity: number, userId: string): Promise<InventoryStock> {
    const [updated] = await db
      .update(inventoryStock)
      .set({
        quantity,
        lastUpdateBy: userId,
        lastUpdateAt: new Date(),
      })
      .where(and(
        eq(inventoryStock.itemId, itemId),
        eq(inventoryStock.companyId, companyId)
      ))
      .returning();
    return updated;
  }

  async getLowStockItems(companyId: number): Promise<Array<InventoryItem & { currentStock: number }>> {
    const result = await db
      .select({
        id: inventoryItems.id,
        companyId: inventoryItems.companyId,
        categoryId: inventoryItems.categoryId,
        code: inventoryItems.code,
        name: inventoryItems.name,
        description: inventoryItems.description,
        unit: inventoryItems.unit,
        hasValidity: inventoryItems.hasValidity,
        validityMonths: inventoryItems.validityMonths,
        minStock: inventoryItems.minStock,
        isActive: inventoryItems.isActive,
        createdAt: inventoryItems.createdAt,
        updatedAt: inventoryItems.updatedAt,
        currentStock: sql<number>`COALESCE(${inventoryStock.quantity}, 0)`,
      })
      .from(inventoryItems)
      .leftJoin(inventoryStock, eq(inventoryItems.id, inventoryStock.itemId))
      .where(
        and(
          eq(inventoryItems.companyId, companyId),
          eq(inventoryItems.isActive, true),
          sql`COALESCE(${inventoryStock.quantity}, 0) <= ${inventoryItems.minStock}`
        )
      );
    
    return result;
  }

  // Inventory Movement operations
  async getInventoryMovements(
    companyId: number, 
    filters?: { itemId?: number; type?: string; startDate?: Date; endDate?: Date }
  ): Promise<InventoryMovement[]> {
    const conditions = [eq(inventoryMovements.companyId, companyId)];
    
    if (filters?.itemId) {
      conditions.push(eq(inventoryMovements.itemId, filters.itemId));
    }
    
    if (filters?.type) {
      conditions.push(eq(inventoryMovements.type, filters.type));
    }
    
    if (filters?.startDate) {
      conditions.push(gte(inventoryMovements.createdAt, filters.startDate));
    }
    
    if (filters?.endDate) {
      conditions.push(lte(inventoryMovements.createdAt, filters.endDate));
    }

    return await db
      .select()
      .from(inventoryMovements)
      .where(and(...conditions))
      .orderBy(desc(inventoryMovements.createdAt));
  }

  async createInventoryMovement(movement: InsertInventoryMovement): Promise<InventoryMovement> {
    const [newMovement] = await db
      .insert(inventoryMovements)
      .values(movement)
      .returning();
    
    // Update stock automatically
    const stock = await this.getStockByItem(movement.itemId);
    if (stock) {
      const newQuantity = movement.type === 'in' 
        ? stock.quantity + movement.quantity 
        : stock.quantity - movement.quantity;
      
      await this.updateInventoryStock(
        movement.itemId,
        movement.companyId,
        newQuantity,
        movement.createdBy
      );
    }
    
    return newMovement;
  }

  // Employee Item operations (distribution)
  async getEmployeeItems(employeeId: string, filters?: { status?: string }): Promise<EmployeeItem[]> {
    const conditions = [eq(employeeItems.employeeId, employeeId)];
    
    if (filters?.status) {
      conditions.push(eq(employeeItems.status, filters.status));
    }

    return await db
      .select()
      .from(employeeItems)
      .where(and(...conditions))
      .orderBy(desc(employeeItems.deliveryDate));
  }

  async getEmployeeItemsByDepartment(departmentId: number, filters?: { status?: string }): Promise<EmployeeItem[]> {
    const conditions = [eq(users.departmentId, departmentId)];
    
    if (filters?.status) {
      conditions.push(eq(employeeItems.status, filters.status));
    }

    return await db
      .select({
        id: employeeItems.id,
        employeeId: employeeItems.employeeId,
        itemId: employeeItems.itemId,
        companyId: employeeItems.companyId,
        quantity: employeeItems.quantity,
        deliveryDate: employeeItems.deliveryDate,
        expiryDate: employeeItems.expiryDate,
        deliverySignature: employeeItems.deliverySignature,
        deliveredBy: employeeItems.deliveredBy,
        returnDate: employeeItems.returnDate,
        returnSignature: employeeItems.returnSignature,
        returnReason: employeeItems.returnReason,
        returnedBy: employeeItems.returnedBy,
        status: employeeItems.status,
        deliveryDocumentId: employeeItems.deliveryDocumentId,
        returnDocumentId: employeeItems.returnDocumentId,
        createdAt: employeeItems.createdAt,
        updatedAt: employeeItems.updatedAt,
      })
      .from(employeeItems)
      .innerJoin(users, eq(employeeItems.employeeId, users.id))
      .where(and(...conditions))
      .orderBy(desc(employeeItems.deliveryDate));
  }

  async getEmployeeItem(id: number): Promise<EmployeeItem | undefined> {
    const [item] = await db
      .select()
      .from(employeeItems)
      .where(eq(employeeItems.id, id));
    return item;
  }

  async createEmployeeItem(employeeItem: InsertEmployeeItem): Promise<EmployeeItem> {
    const [newEmployeeItem] = await db
      .insert(employeeItems)
      .values(employeeItem)
      .returning();
    
    // Create inventory movement for distribution
    await this.createInventoryMovement({
      itemId: employeeItem.itemId,
      companyId: employeeItem.companyId,
      type: 'out',
      quantity: employeeItem.quantity,
      reason: 'distribution',
      referenceId: newEmployeeItem.id,
      createdBy: employeeItem.deliveredBy,
    });
    
    return newEmployeeItem;
  }

  async updateEmployeeItem(id: number, employeeItem: Partial<InsertEmployeeItem> & { status?: string }): Promise<EmployeeItem> {
    const [updated] = await db
      .update(employeeItems)
      .set({
        ...employeeItem,
        updatedAt: new Date(),
      })
      .where(eq(employeeItems.id, id))
      .returning();
    
    // If returning item, create inventory movement
    if (employeeItem.status === 'returned' && employeeItem.returnDate) {
      const original = await this.getEmployeeItem(id);
      if (original) {
        await this.createInventoryMovement({
          itemId: original.itemId,
          companyId: original.companyId,
          type: 'in',
          quantity: original.quantity,
          reason: 'return',
          referenceId: id,
          notes: employeeItem.returnReason,
          createdBy: employeeItem.returnedBy || original.deliveredBy,
        });
      }
    }
    
    return updated;
  }

  async getExpiringItems(companyId: number, daysAhead: number): Promise<Array<EmployeeItem & { employeeName: string; itemName: string }>> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);

    const result = await db
      .select({
        id: employeeItems.id,
        employeeId: employeeItems.employeeId,
        itemId: employeeItems.itemId,
        companyId: employeeItems.companyId,
        quantity: employeeItems.quantity,
        deliveryDate: employeeItems.deliveryDate,
        expiryDate: employeeItems.expiryDate,
        deliverySignature: employeeItems.deliverySignature,
        deliveredBy: employeeItems.deliveredBy,
        returnDate: employeeItems.returnDate,
        returnSignature: employeeItems.returnSignature,
        returnReason: employeeItems.returnReason,
        returnedBy: employeeItems.returnedBy,
        status: employeeItems.status,
        deliveryDocumentId: employeeItems.deliveryDocumentId,
        returnDocumentId: employeeItems.returnDocumentId,
        createdAt: employeeItems.createdAt,
        updatedAt: employeeItems.updatedAt,
        employeeName: sql<string>`${users.firstName} || ' ' || ${users.lastName}`,
        itemName: inventoryItems.name,
      })
      .from(employeeItems)
      .innerJoin(users, eq(employeeItems.employeeId, users.id))
      .innerJoin(inventoryItems, eq(employeeItems.itemId, inventoryItems.id))
      .where(
        and(
          eq(employeeItems.companyId, companyId),
          eq(employeeItems.status, 'active'),
          lte(employeeItems.expiryDate, futureDate),
          gte(employeeItems.expiryDate, new Date())
        )
      )
      .orderBy(employeeItems.expiryDate);

    return result;
  }

  // =========== ABSENCE MANAGEMENT OPERATIONS ===========
  
  async createAbsence(absence: InsertAbsence): Promise<Absence> {
    // Convert date strings to Date objects if needed
    const absenceData = {
      ...absence,
      startDate: typeof absence.startDate === 'string' ? new Date(absence.startDate) : absence.startDate,
      endDate: typeof absence.endDate === 'string' ? new Date(absence.endDate) : absence.endDate,
    };
    const [newAbsence] = await db.insert(absences).values(absenceData as any).returning();
    return newAbsence;
  }

  async getAbsence(id: number): Promise<Absence | undefined> {
    const [absence] = await db.select().from(absences).where(eq(absences.id, id));
    return absence;
  }

  async getAbsencesByEmployee(employeeId: string): Promise<Absence[]> {
    return await db
      .select()
      .from(absences)
      .where(eq(absences.employeeId, employeeId))
      .orderBy(desc(absences.startDate));
  }

  async getAbsencesByCompany(
    companyId: number,
    filters?: { status?: string; type?: string; startDate?: Date; endDate?: Date }
  ): Promise<Absence[]> {
    const conditions = [eq(absences.companyId, companyId)];

    if (filters?.status) {
      conditions.push(eq(absences.status, filters.status));
    }
    if (filters?.type) {
      conditions.push(eq(absences.type, filters.type));
    }
    if (filters?.startDate) {
      conditions.push(gte(absences.startDate, filters.startDate));
    }
    if (filters?.endDate) {
      conditions.push(lte(absences.endDate, filters.endDate));
    }

    return await db
      .select()
      .from(absences)
      .where(and(...conditions))
      .orderBy(desc(absences.startDate));
  }

  async getPendingAbsences(companyId: number): Promise<Absence[]> {
    return await db
      .select()
      .from(absences)
      .where(and(eq(absences.companyId, companyId), eq(absences.status, "pending")))
      .orderBy(absences.createdAt);
  }

  async approveAbsence(id: number, approvedBy: string): Promise<Absence> {
    const [updatedAbsence] = await db
      .update(absences)
      .set({
        status: "approved",
        approvedBy,
        approvedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(absences.id, id))
      .returning();

    // Update vacation balance if type is vacation
    if (updatedAbsence.type === "vacation") {
      const balance = await this.getVacationBalance(updatedAbsence.employeeId);
      if (balance) {
        await db
          .update(vacationBalances)
          .set({
            totalDaysUsed: balance.totalDaysUsed + updatedAbsence.totalDays,
            currentBalance: balance.currentBalance - updatedAbsence.totalDays,
            updatedAt: new Date(),
          })
          .where(eq(vacationBalances.employeeId, updatedAbsence.employeeId));
      }
    }

    return updatedAbsence;
  }

  async rejectAbsence(id: number, approvedBy: string, rejectionReason: string): Promise<Absence> {
    const [updatedAbsence] = await db
      .update(absences)
      .set({
        status: "rejected",
        approvedBy,
        approvedAt: new Date(),
        rejectionReason,
        updatedAt: new Date(),
      })
      .where(eq(absences.id, id))
      .returning();
    return updatedAbsence;
  }

  async cancelAbsence(id: number): Promise<Absence> {
    const absence = await this.getAbsence(id);
    if (!absence) {
      throw new Error("Ausência não encontrada");
    }

    // If previously approved vacation, restore balance
    if (absence.status === "approved" && absence.type === "vacation") {
      const balance = await this.getVacationBalance(absence.employeeId);
      if (balance) {
        await db
          .update(vacationBalances)
          .set({
            totalDaysUsed: balance.totalDaysUsed - absence.totalDays,
            currentBalance: balance.currentBalance + absence.totalDays,
            updatedAt: new Date(),
          })
          .where(eq(vacationBalances.employeeId, absence.employeeId));
      }
    }

    const [updatedAbsence] = await db
      .update(absences)
      .set({
        status: "cancelled",
        updatedAt: new Date(),
      })
      .where(eq(absences.id, id))
      .returning();
    return updatedAbsence;
  }

  async updateAbsence(id: number, absence: Partial<InsertAbsence>): Promise<Absence> {
    // Convert date strings to Date objects if needed
    const updateData: any = { ...absence, updatedAt: new Date() };
    if (updateData.startDate && typeof updateData.startDate === 'string') {
      updateData.startDate = new Date(updateData.startDate);
    }
    if (updateData.endDate && typeof updateData.endDate === 'string') {
      updateData.endDate = new Date(updateData.endDate);
    }
    const [updatedAbsence] = await db
      .update(absences)
      .set(updateData)
      .where(eq(absences.id, id))
      .returning();
    return updatedAbsence;
  }

  // Vacation Balance operations
  async getVacationBalance(employeeId: string): Promise<VacationBalance | undefined> {
    const [balance] = await db
      .select()
      .from(vacationBalances)
      .where(eq(vacationBalances.employeeId, employeeId));
    return balance;
  }

  async createOrUpdateVacationBalance(employeeId: string, companyId: number): Promise<VacationBalance> {
    // Get employee admission date
    const user = await this.getUser(employeeId);
    if (!user || !user.admissionDate) {
      throw new Error("Funcionário não encontrado ou sem data de admissão");
    }

    // Calculate balance
    const calculated = await this.calculateVacationBalance(employeeId, new Date(user.admissionDate));

    // Upsert balance
    const [balance] = await db
      .insert(vacationBalances)
      .values({
        employeeId,
        companyId,
        totalDaysEarned: calculated.totalDaysEarned,
        totalDaysUsed: calculated.totalDaysUsed,
        currentBalance: calculated.currentBalance,
        lastCalculatedAt: new Date(),
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: vacationBalances.employeeId,
        set: {
          totalDaysEarned: calculated.totalDaysEarned,
          totalDaysUsed: calculated.totalDaysUsed,
          currentBalance: calculated.currentBalance,
          lastCalculatedAt: new Date(),
          updatedAt: new Date(),
        },
      })
      .returning();

    return balance;
  }

  async calculateVacationBalance(
    employeeId: string,
    admissionDate: Date
  ): Promise<{ totalDaysEarned: number; totalDaysUsed: number; currentBalance: number }> {
    // Calculate years worked
    const now = new Date();
    const yearsWorked = (now.getTime() - admissionDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
    
    // 30 days per year worked (Brazilian law: CLT Art. 130)
    const totalDaysEarned = Math.floor(yearsWorked * 30);

    // Get approved vacations
    const approvedVacations = await db
      .select()
      .from(absences)
      .where(
        and(
          eq(absences.employeeId, employeeId),
          eq(absences.type, "vacation"),
          eq(absences.status, "approved")
        )
      );

    const totalDaysUsed = approvedVacations.reduce((sum, vacation) => sum + vacation.totalDays, 0);
    const currentBalance = totalDaysEarned - totalDaysUsed;

    return {
      totalDaysEarned,
      totalDaysUsed,
      currentBalance,
    };
  }
}

export const storage = new DatabaseStorage();
