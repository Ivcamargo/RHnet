# RHNet - "A Rede do RH"

## Overview

RHNet is a comprehensive human resources management system designed to streamline HR-employee interactions. It integrates electronic timekeeping with geolocation and facial recognition, corporate messaging, document management, employee training, and a robust recruitment module with DISC assessment. The system provides a unified, full-stack web solution for efficient HR management, enhancing communication, ensuring data accuracy, and improving operational efficiency and employee engagement. Key capabilities include advanced reporting, PWA support, a dedicated terminal/kiosk mode for time clocking, and an integrated inventory management system for EPIs.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework**: React 18 with TypeScript.
- **State Management**: TanStack Query, React Hook Form.
- **Routing**: Wouter.
- **UI/Styling**: shadcn/ui (Radix UI primitives), Tailwind CSS with custom branding (Navy Blue, Turquoise), Lucide React icons.
- **Visual Identity**: Modern gradient design on headers and primary CTA buttons.
- **Build Tool**: Vite.
- **PWA**: Full offline support, installability, service worker for caching.

### Backend
- **Framework**: Express.js with TypeScript.
- **Database ORM**: Drizzle ORM.
- **API Design**: RESTful.
- **Session Management**: Express sessions with PostgreSQL store.
- **Security**: Rate limiting, argon2id password hashing, role-based access control.

### Database Schema
- **Core Entities**: Users, Departments, Time Entries, Break Entries, Face Profiles, Sessions, User Shift Assignments, Job Openings, Applications, DISC Assessments, Inventory Items, Inventory Movements, Absences, Vacation Balances.

### Core Features
- **System Initialization**: First-time setup flow for production deployments.
- **Automatic User Provisioning**: Generates secure temporary passwords, sends credentials via SMTP email, and enforces password change on first login.
- **Time Tracking**: Clock in/out with location/facial verification, break management, IP tracking, shift schedule compliance, and UTC timestamp storage. Includes geolocation & geofencing.
- **Terminal/Kiosk Mode**: Tablet-optimized interface for time clock stations.
- **Shift & Rotation Management**: CRUD for shifts and rotation templates.
- **Password Management**: Self-service and admin-initiated password reset.
- **Course Management**: Admin interface for quizzes.
- **Messaging System**: Multi-target messaging with contextual messaging from documents.
- **Legal Files (AFD/AEJ)**: Generation and import of mandatory legal files fully compliant with Portaria 671/2021 MTE, including:
  - AFD/AEJ headers with separate CNPJ/CPF indicator field (1 = CNPJ, 2 = CPF)
  - REP type field using numeric code "3" for REP-P
  - Optional Tipo 06 (eSocial multiple employment bonds)
  - **Tipo 07 (Absences & Time Bank)**: Fully implemented with:
    - MTE-compliant codes for 10 absence types (vacation, medical, maternity/paternity, bereavement, wedding, blood donation, military service, jury duty, other)
    - Time bank credit/debit transaction codes (BANCOCRED, BANCODEB)
    - One record per business day within export period (480 minutes/day = 8h CLT standard)
    - Automatic date clamping for absences crossing period boundaries
    - Weekend exclusion (only business days exported)
    - Known limitation: Fractional-day absences (half days) currently treated as full days - planned enhancement
  - Correct AEJ totalizador (Tipo 99) including itself in the count
  - CRC-16/KERMIT checksum validation for all records
- **CSV Import/Export**: Bulk employee management with automatic account creation.
- **Reporting & Analytics**: Monthly time summaries, dashboard statistics, data export, and "Inconsistency Reporting".
- **Recruitment & Selection Module**: Manages hiring workflow from job openings to digital onboarding, including weighted scoring.
- **DISC Personality Assessment**: Integrated 24-28 question DISC assessment within recruitment, with configurable requirements and compatibility scoring.
- **Overtime & Time Bank System**: Configurable overtime management with percentage rates and dual modes.
- **Vacation & Absence Management**: Complete vacation and absence request/approval workflow with:
  - 10 absence types (vacation, medical leave, maternity/paternity, bereavement, wedding, blood donation, military service, jury duty, other)
  - Automatic vacation balance calculation (30 days/year CLT standard)
  - Self-service request portal for employees with balance display and visual date pickers
  - Document upload system for supporting evidence (PDF, JPG, PNG up to 5MB) with race condition prevention
  - Admin approval/rejection interface with reason tracking and document visualization
  - Status workflow: pending → approved/rejected/cancelled
  - Dual notifications (email + internal messaging) on status changes
  - Advanced filtering system: by type, status, employee, and department
  - Document attachment column in both employee and admin views
  - Company-level isolation with superadmin override
- **System User Manual**: In-app documentation with PDF export.
- **Lead Capture System**: Commercial prospecting functionality with lead lifecycle management.
- **Inventory & EPI Management**: Comprehensive system including categories, items, stock, movements, and employee-assigned items with digital signatures and role-based access.

### Planned Features

#### 1. Offline Mode for Login and Time Tracking
Allows offline operation with automatic synchronization upon regaining connectivity. This includes local authentication, IndexedDB storage for time entries, background sync via Service Worker, and a review system for HR to manage invalid offline entries.

**Technical Considerations:**
- PWA service worker already implements cache update strategy with `skipWaiting()` and versioned cache names
- Service worker updates automatically on deployment via cache version change (`rhnet-v3-no-api-cache`)
- Network-first strategy for API requests ensures fresh data when online
- Cache-first for static assets with automatic cleanup of old caches

#### 2. Advanced Inventory Distribution with Signature Workflow
Complete acceptance/rejection flow for EPIs/Uniforms/Tools distribution with temporary custody and stock reservation system.

**Key Features:**
- **Rename Module**: Change all "EPIs" references to "EPIs/Uniformes/Ferramentas" throughout UI
- **Asynchronous Distribution**: Remove mandatory signature at distribution time
- **Temporary Custody**: Items assigned to department supervisor until employee accepts
- **Stock Reservation System**: Items marked as RESERVED (not removed from stock) until employee acceptance
- **Employee Acceptance Portal**: Dedicated page showing pending items with Accept/Reject options per item
- **Digital Signature on Acceptance**: Employee signs only when accepting items
- **Item Rejection**: Employee can reject individual items with mandatory justification (defective, wrong size, etc.)
- **Supervisor Custody Management**: View all items under temporary custody with cancellation option
- **Distribution Cancellation**: Supervisor can cancel pending distributions (lost, damaged) with reason tracking
- **Stock Flow States**:
  - `pending_signature`: Item reserved, in supervisor custody, stock shows as "Reserved"
  - `accepted`: Stock deducted, custody transferred to employee, signature recorded
  - `rejected`: Reservation released, stock available again, supervisor retains custody
  - `cancelled`: Stock deducted as loss, supervisor marked as responsible party
- **Status Tracking**: Visual badges (Pending, Accepted, Rejected, Cancelled) in history view
- **Notifications**: Alert supervisor on rejections, alert employee on new pending items
- **Accountability**: Full audit trail of who accepted/rejected/cancelled what and when

**Database Schema Changes:**
- `inventoryMovements.status`: enum ('pending_signature', 'accepted', 'rejected', 'cancelled')
- `inventoryMovements.rejectionReason`: text (employee justification for rejection)
- `inventoryMovements.cancellationReason`: text (supervisor reason for cancellation)
- `inventoryMovements.signedAt`: timestamp (when employee signed acceptance)
- `inventoryMovements.temporaryCustodianId`: references users table (supervisor holding items)

**User Flows:**
1. Supervisor distributes items → status: pending_signature, custody: supervisor, stock: reserved
2. Employee views "Meus Itens Pendentes" → sees all items awaiting signature
3. Employee accepts item → signs digitally → status: accepted, custody: employee, stock: deducted
4. Employee rejects item → enters reason → status: rejected, custody: supervisor, stock: released
5. Supervisor views "Itens sob Minha Custódia" → sees pending items
6. Supervisor cancels distribution → selects reason → status: cancelled, stock: deducted as loss

#### 3. Visual Calendar for Absences and Vacations
Calendar view showing team availability, vacation periods, and absence patterns.

#### 4. Advanced Dashboard Analytics
Enhanced statistics, charts, and KPIs for management decision-making.

#### 5. Advanced Reports Module
Customizable reports with filters, exports, and scheduled delivery.

#### 6. Expanded Notification System
Real-time notifications for critical events with email/SMS integration.

#### 7. Biometric Authentication (WebAuthn)
Passwordless and biometric authentication using the W3C WebAuthn standard for secure, fast login and action confirmation.

**Supported Biometrics:**
- **iOS/iPadOS**: Face ID, Touch ID
- **Android**: Fingerprint, Face Unlock
- **macOS**: Touch ID
- **Windows**: Windows Hello (fingerprint, face recognition, PIN)

**Key Features:**
- **Quick Login**: Employees can log in with biometrics instead of password
- **Time Clock Verification**: Additional biometric confirmation when clocking in/out
- **EPI/Document Signing**: Use biometrics as alternative to canvas signature
- **Sensitive Actions**: Step-up authentication for critical operations
- **Fallback Support**: Automatic fallback to password for unsupported devices
- **Privacy First**: Biometric data NEVER leaves the device (only cryptographic keys are stored)

**Security Benefits:**
- Phishing-resistant (credentials bound to origin)
- No shared secrets (public keys on server are useless alone)
- Device-bound authentication (private keys in secure hardware TPM/Secure Enclave)
- Multi-factor built-in ("something you have" + "something you are")

**Implementation:**
- Uses `@simplewebauthn/browser` and `@simplewebauthn/server` libraries
- Registration flow: User opts-in via profile settings
- Authentication flow: Browser prompts for biometric, device signs challenge
- Database: Store credential IDs and public keys per user

**User Flows:**
1. Employee logs in normally (first time)
2. System offers: "Enable biometric login?"
3. Employee confirms with fingerprint/face
4. System stores cryptographic credential (NOT biometric data)
5. Next login: Employee uses biometric → instant access

## External Dependencies

- **Database**: Neon PostgreSQL, `@neondatabase/serverless`.
- **UI**: Radix UI, Tailwind CSS, Lucide React.
- **Development**: TypeScript, ESBuild, Zod.
- **Geolocation**: Browser Geolocation API, Nominatim API (OpenStreetMap).
- **Mapping**: react-leaflet, OpenStreetMap.
- **Facial Recognition**: MediaDevices API, Canvas API.
- **PDF Generation**: jsPDF, html2canvas.
- **Email Notifications**: nodemailer with SMTP.