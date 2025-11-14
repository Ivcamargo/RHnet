# RHNet - "A Rede do RH"

## Overview

RHNet is a comprehensive human resources management system designed to streamline HR-employee interactions. It integrates electronic timekeeping with geolocation and facial recognition, corporate messaging, document management, and employee training. Key capabilities include advanced reporting, PWA support, and a dedicated terminal/kiosk mode for time clocking. The system aims to provide a unified, full-stack web solution for efficient HR management, enhancing communication, and ensuring data accuracy.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework**: React 18 with TypeScript.
- **State Management**: TanStack Query (server state), React Hook Form (form state).
- **Routing**: Wouter.
- **UI/Styling**: shadcn/ui (Radix UI primitives), Tailwind CSS with custom branding (Navy Blue, Turquoise), Lucide React icons.
- **Visual Identity**: Modern gradient design (`bg-gradient-to-r from-[hsl(220,65%,18%)] to-[hsl(175,65%,45%)]`) applied consistently across all headers (TopBar, Landing, Recruitment, Manual) and primary CTA buttons. Simplified footer displays copyright and contact email (infosis@infosis.com.br) with mailto link.
- **Build Tool**: Vite.
- **PWA**: Full offline support, installability, service worker for caching static assets (cache-first) and network-first for API requests.

### Backend
- **Framework**: Express.js with TypeScript.
- **Database ORM**: Drizzle ORM.
- **API Design**: RESTful.
- **Session Management**: Express sessions with PostgreSQL store (production).
- **Security**: Rate limiting, argon2id password hashing, role-based access control (superadmin/admin/employee).

### Database Schema
- **Core Entities**: Users, Departments, Time Entries, Break Entries, Face Profiles, Sessions, User Shift Assignments.
- **Key Fields**: `passwordHash`, `mustChangePassword`, `passwordResetToken`, `internalId` for user integration.
- **Shift Assignments**: Flexible temporal assignments via `userShiftAssignments` table.

### Key Features
- **Geolocation & Geofencing**: Browser Geolocation API, Haversine formula, `react-leaflet` for interactive map-based geofencing (10-1000m radius), Nominatim API for address search. Sector-based geofence configuration.
- **Time Tracking**: Clock in/out with location/facial verification, break management. Includes IP address tracking, geofence proximity validation, shift schedule compliance (including overnight shifts), and UTC timestamp storage with Brazil timezone conversion for display. Admin edits are audited with detailed tracking. Features configurable time tolerance per shift (toleranceBeforeMinutes/toleranceAfterMinutes, default 5 minutes) to control when early arrivals and late arrivals are flagged as irregularities.
- **Terminal/Kiosk Mode**: Tablet-optimized interface for fixed time clock stations with compact logo display (180px). Features device registration, public interface (`/terminal-ponto`) with simplified flow fitting on screen without scroll, stateless authentication, auto-logout, and data masking. Records `deviceId` for provenance.
- **Shift & Rotation Management**: Comprehensive CRUD for shifts and rotation templates (daily, weekly, monthly, custom) with advanced interval support.
- **Automatic Break Management**: Shift-specific break configuration system (`department_shift_breaks`) allows administrators to define automatic breaks (paid/unpaid) that are automatically deducted from worked hours during clock-out. Features include:
  - **Break Configuration**: Multiple breaks per shift with duration (minutes), paid status, auto-deduct flag, and minimum work time requirement (default 6 hours).
  - **User Interface**: Integrated ShiftBreaksManager component accessible from Sectors page with full CRUD operations.
  - **Smart Deduction Logic**: `computeNetWorkedHours()` applies breaks only from employee's assigned shift (via `userShiftAssignments`) for the specific date, preventing cross-shift deduction errors in multi-shift departments. Checks minimum work hours and prevents duplicate deductions when overlapping manual breaks exist.
  - **API Endpoints**: GET/POST `/api/department-shifts/:shiftId/breaks`, PATCH/DELETE `/api/shift-breaks/:id`.
  - **Important Notes**: Break deductions apply only at clock-out time; existing time entries are not retroactively recalculated when new breaks are configured. Admins can manually adjust historical records via Admin → Time Entries.
- **Employee-Shift Assignment**: Flexible system for assigning employees to shifts with optional start/end dates. Supports cross-company assignments for superadmins and cross-department flexibility.
- **Password Management**: Self-service password change.
- **Course Management**: Admin interface for quizzes with question CRUD and validation.
- **Messaging System**: Advanced multi-target messaging with support for individual, department, sector, position, and broadcast messages. Features contextual messaging from documents via "Tirar Dúvida" button that pre-fills message form with document reference. Supports isolated sender-side archiving/deletion.
- **Legal Files (AFD/AEJ)**: Generates and imports mandatory legal files per Portaria 671/2021. AFD (Arquivo Fonte de Dados) exports raw time entry data with CRC-16 validation and SHA-256 integrity. AEJ (Arquivo Eletrônico de Jornada) consolidates employee schedules and worked hours. Features NSR sequencing, ISO 8859-1 encoding, administrative interface at `/admin/arquivos-legais`, file history tracking, and AFD import capability with validation.
- **CSV Import/Export**: Bulk employee management with template download, validation, error reporting, and company-filtered export. Supports `internalId` and uses semicolon delimiter/UTF-8 BOM for Excel compatibility.
- **Reporting & Analytics**: Monthly time summaries with interactive UI enhancements (clickable warning indicators, facial verification icons with tooltips, validation details modal), dashboard statistics, data export. Includes "Inconsistency Reporting" with advanced irregularity detection (late arrivals, insufficient hours, missing punches) based on shift schedules, stored in `timeEntries` with detailed reasons. Fixed timezone bug in date display that was causing records to appear as previous day (string dates now parsed without UTC conversion).
- **Recruitment & Selection Module**: Manages hiring workflow from job openings to digital onboarding. Includes job postings, candidate database, application tracking (status flow: applied → hired), and secure digital onboarding links. All data is company-scoped. Features sophisticated candidate filtering with weighted scoring system:
  - **Job Requirements System**: Full CRUD for job requirements with atomic transactional updates via `db.transaction()`. Each requirement includes: title, description, requirementType (mandatory/desirable), category (hard_skill/soft_skill/administrative), weight (1-5), and proficiencyLevels (JSONB array with level/points).
  - **RequirementsManager Component**: Integrated into create/edit dialogs with full requirement management (add, edit, delete). Supports rollback state handling and null-safe operations.
  - **Atomic Bulk Endpoint**: POST `/api/job-openings/:id/requirements/bulk` uses `db.transaction()` for atomic delete+insert operations. Server-side injects `jobOpeningId` from route parameter before Zod validation to ensure data integrity.
  - **Weighted Scoring Formula**: Candidate evaluation uses Σ(Pi×Wi) where Pi is proficiency points and Wi is requirement weight. Two-phase evaluation: mandatory requirements cut → weighted ranking of remaining candidates.
  - **API Endpoints**: GET/POST `/api/job-openings/:id/requirements`, POST `/api/job-openings/:id/requirements/bulk` (atomic replace), PATCH/DELETE `/api/job-requirements/:id`.
  - **Data Integrity**: All requirement operations include ownership checks, validation via Zod schemas, and proper error handling with descriptive messages.
- **Overtime & Time Bank System**: Comprehensive overtime management with configurable percentage rates by department/shift. Supports multiple tier brackets (e.g., 0-2h @ 50%, 2-4h @ 100%, 4h+ @ 200%), separate rules for weekdays/weekends/holidays, and dual modes (paid overtime or time bank credits). Includes administrative interface (`/admin/overtime-config`) for rule configuration, automatic calculation during clock-out, and employee time bank balance tracking with full transaction history.
  - **Database Tables**: `overtime_rules` (department/shift-specific rules with priority system), `overtime_tiers` (percentage brackets), `time_bank` (employee balance tracking), `time_bank_transactions` (credit/debit history).
  - **Calculation Logic**: Automatic overtime processing via `processOvertimeForTimeEntry()` applies applicable rules based on date type (weekday/weekend/holiday), calculates hours across multiple percentage tiers, and credits time bank or marks for payment.
  - **API Endpoints**: Full CRUD for rules (`/api/overtime-rules`), tiers (`/api/overtime-tiers`), and time bank queries (`/api/time-bank/:userId`). Admin-only manual adjustments supported.
- **System User Manual**: In-app documentation (`/manual`) in protected area (requires login) with 8 tabbed sections covering all system features, written in simple language. Accessible via sidebar "Manual do Sistema" link for all authenticated users. Features PDF export functionality with professional formatting, real screenshots of application screens, and comprehensive coverage of all modules. Export generates a complete manual with cover page, table of contents, and actual screenshots of main interface screens.
  - **Manual Sections**: Introdução, Controle de Ponto, Terminal de Ponto, Gestão de Recursos (Turnos/Escalas with practical examples: 12×36, 5×2, 4×2, 5×1 rotativa, 6×1 fixa), Relatórios, Recrutamento e Seleção, Arquivos Legais (AFD/AEJ per Portaria 671/2021), Outros Recursos.
  - **Screenshot Capture System**: Dedicated helper page (`/screenshot-helper`) captures real screenshots of 7 main application screens (Home, Employees, Sectors, Reports, Recruitment, Legal Files, Terminal) using html2canvas. Screenshots are saved to localStorage as base64 PNG images and automatically embedded in PDF export.
  - **PDF Generation**: Client-side PDF generation using jsPDF with 200ms setTimeout delay to ensure UI feedback shows loading state ("Gerando PDF..."). PDF includes 8 sections with detailed content and embedded screenshots. If screenshots not available, prompts user to visit screenshot helper page first.
  - **User Flow**: Users access screenshot helper, capture all screens with single click, return to manual page, and export PDF with embedded real screenshots. No backend API calls required - fully client-side operation.
  - **Layout**: Uses internal admin layout (TopBar + Sidebar) instead of public landing layout. Manual now integrated into main application navigation.

## External Dependencies

- **Database**: Neon PostgreSQL, `@neondatabase/serverless`.
- **UI**: Radix UI, Tailwind CSS, Lucide React.
- **Development**: TypeScript, ESBuild, Zod.
- **Geolocation**: Browser Geolocation API, Nominatim API (OpenStreetMap).
- **Mapping**: react-leaflet, OpenStreetMap.
- **Facial Recognition**: MediaDevices API, Canvas API.
- **PDF Generation**: jsPDF, html2canvas.
- **Other**: WebSocket Constructor (custom for Neon).