# RHNet - "A Rede do RH"

## Overview

RHNet is a comprehensive human resources management system integrating electronic timekeeping, corporate messaging, document management, and employee training. It provides a unified solution for HR-employee communication, featuring geolocation, facial recognition, and extensive reporting. The system is a full-stack web application with a React frontend, Express.js backend, PostgreSQL database, and a hybrid authentication system.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **State Management**: TanStack Query for server state, React Hook Form for form state
- **Routing**: Wouter for client-side routing
- **UI Components**: shadcn/ui built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables (Brand palette: Navy Blue hsl(220, 65%, 18%) primary, Turquoise hsl(175, 65%, 45%) secondary, modernized icon set from lucide-react)
- **Build Tool**: Vite

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database ORM**: Drizzle ORM
- **API Design**: RESTful API endpoints
- **Session Management**: Express sessions with PostgreSQL session store (production)
- **File Structure**: Organized into routes, storage layer, and database configuration

### Authentication System
- **Hybrid Architecture**: Supports local email/password (argon2id hashing) and Replit OIDC (for migration)
- **Session Management**: Express sessions (memory store for development, persistent store for production)
- **Authorization**: Role-based access control (superadmin/admin/employee)
- **Security Features**: Rate limiting, secure password hashing, session-based authentication

### Database Schema
- **Key Entities**: Users, Departments, Time Entries, Break Entries, Face Profiles, Sessions, User Shift Assignments
- **User Fields**: Includes passwordHash, mustChangePassword, passwordResetToken, passwordResetExpires, internalId (Registro Interno) for integration with external systems
- **Shift Assignments**: userShiftAssignments table with userId, shiftId, startDate, endDate for flexible temporal assignments.

### Features
- **Progressive Web App (PWA)**: Full offline support, installability, manifest configuration, service worker for intelligent caching, and PWA meta tags. **Service Worker Strategy**: Network-first for API requests (always fetch fresh data, no caching), cache-first for static assets (JS, CSS, images) for optimal performance without stale data issues.
- **Geolocation & Geofencing**: 
  - Browser Geolocation API, Haversine formula for distance validation
  - Interactive map-based geofencing with react-leaflet (click-to-set location, radius adjustment 10-1000m)
  - Address/CEP search using Nominatim API (OpenStreetMap) for easier location selection
  - Real-time location status and visual circle overlay showing allowed area
  - Geofence coordinates stored in sectors table (latitude, longitude, radius)
- **Sector Management**:
  - Auto-population of company field for non-superadmin users (uses logged-in user's company)
  - Backend filtering: superadmin sees all sectors, admin/employee see only their company's sectors, supervisors see assigned sectors
  - Geofencing configuration integrated into sector creation/editing workflow with landscape dialog layout (max-w-6xl, two-column grid)
  - Real-time cache invalidation and refetch after mutations ensures immediate UI updates
- **Time Tracking**: Clock in/out with location/facial verification, break management, automatic calculations. **Enhanced Validation**: Records IP address, validates geofence proximity (non-blocking), and verifies shift schedule compliance with overnight shift support. Validation results displayed to user via toast notifications. **Timezone**: All timestamps saved in UTC (real server time), frontend converts to Brazil timezone (America/Sao_Paulo) for display. Function `getBrazilianTime()` returns current UTC time, `getBrazilianDateString()` returns current date in Brazil timezone.
  - **IP Tracking**: Captures and normalizes client IP address (handles x-forwarded-for) for both clock-in and clock-out
  - **Geofence Validation**: Compares user location against sector boundaries, records compliance status and distance
  - **Shift Compliance**: Validates clock time against assigned shift schedule, handles overnight shifts (e.g., 22:00-06:00), checks day of week and time range
  - **Validation Messages**: Stores and displays user-friendly messages with ✓/⚠ indicators for location and shift compliance
- **Shift Management**: Consolidated interface in "Gestão de Setores" with tabbed navigation, advanced interval support (breakStart/breakEnd), and comprehensive CRUD for shifts.
- **Rotation Management**: Dedicated `/admin/rotation-management` interface for CRUD operations on rotation templates (daily, weekly, monthly, custom cadence), segment configuration, and automatic schedule generation.
- **Employee-Shift Assignment**: Advanced system for linking employees to shifts with optional start/end dates for flexible rotations, visual indicators, and dedicated assignment management dialogs.
  - **Superadmin Cross-Company Assignment**: Superadmins can assign employees from any company to any shift (bypasses company validation in routes.ts)
  - **Cross-Department Flexibility**: Employees can be assigned to shifts in different departments within the same company (storage validates company, not department)
  - **Validation Hierarchy**: Route-level checks user role and company permissions; storage-level validates company match for data integrity
- **Password Management**: Self-service password change functionality for users, including backend API, frontend page, and sidebar integration.
- **Course Management**: Admin interface for managing course quiz questions (CRUD operations), smart validation, radio button selection for correct answers, and security controls.
- **Messaging System**: Enhanced with `senderDeleted` and `senderDeletedAt` fields for isolated sender-side archiving/deletion, preserving recipient view.
- **CSV Import/Export**: Bulk employee management via CSV with template download, validation, error reporting, and company-filtered export. Uses semicolon delimiter and UTF-8 BOM for Excel compatibility.
  - **Template Download**: Pre-formatted CSV template with all employee fields including Registro Interno (internalId) and example data
  - **Import Validation**: Row-by-row validation with detailed error messages (duplicates, missing fields, company checks)
  - **Export Filtering**: Exports only employees from logged-in user's company (admin) or all companies (superadmin)
  - **Internal ID Support**: Registro Interno field can be imported and exported for integration with external systems
  - **Audit Trail**: All CSV imports logged with source tracking and user attribution
- **Reporting & Analytics**: Monthly time summaries, dashboard statistics, data export capabilities, historical data audit trail. **Inconsistency Reporting**: Displays validation warnings (geofence violations, shift non-compliance) in both admin time entries view and user monthly reports with visual indicators and detailed messages. **Advanced Irregularity Detection System**:
  - **Automatic Analysis**: Backend calculates irregularities for each time entry using the employee's assigned shift
  - **Shift-Aware**: Uses `getUserActiveShift()` to get the correct shift for the entry date, with fallback to department default
  - **Timezone-Correct**: Converts UTC timestamps to Brazil timezone (America/Sao_Paulo) before comparing with shift schedules
  - **Detections**: Late arrivals (>5min grace), insufficient hours worked (>15min tolerance), missing punches, incomplete records
  - **Smart Calculation**: Compares actual worked hours against expected hours (shift duration minus unpaid breaks)
  - **Night Shift Support**: Handles overnight shifts (e.g., 22:00-06:00) correctly
  - **Database Fields**: expectedHours, lateMinutes, shortfallMinutes, irregularityReasons[] stored in timeEntries
  - **Frontend Display**: "Irregular" badge in reports, detailed irregularity section in "Ver detalhes" dialog with specific reasons in Portuguese
- **Recruitment & Selection Module**: Complete hiring workflow management with four integrated sections accessible via `/recruitment`:
  - **Job Openings (Vagas)**: Create, edit, publish, and close job postings with detailed descriptions, requirements, location, employment type, salary ranges, and experience levels. Draft/published/closed status workflow.
  - **Candidates (Candidatos)**: Centralized candidate database with contact information, location, resume storage, and company-scoped access control.
  - **Applications (Candidaturas)**: Link candidates to specific job openings with comprehensive status tracking through the hiring pipeline:
    - **Status Flow**: applied → screening → interview → test → approved → rejected → hired
    - **Visual Status Management**: Color-coded badges using brand palette (navy/turquoise) for instant status recognition
    - **Action Buttons**: One-click status transitions with validation (e.g., 'hired' only available after 'approved')
    - **Screening Notes**: Track observations and feedback throughout the evaluation process
  - **Digital Onboarding (Admissão Digital)**: Generate secure onboarding links for approved candidates with expiration tracking, status monitoring (pending/in_progress/completed/expired), and one-click link copying for easy candidate distribution. Integrated document collection and form submission workflow.
  - **Company Scoping**: All recruitment data automatically filtered by company, with superadmin having cross-company visibility for system-wide oversight.
- **System User Manual**: Comprehensive in-app documentation accessible to all users via `/manual` with tabbed sections covering:
  - **Introduction**: System overview, access levels (superadmin/admin/employee), and navigation guide
  - **Time Clock**: Step-by-step instructions for clock in/out, geofencing, facial verification, and validation system
  - **Management**: Administrative features including employee management, CSV import/export, sector configuration, shift management, and rotation scheduling
  - **Reports**: Monthly time summaries, irregularity detection system, validation warnings, and administrative reporting
  - **Recruitment**: Complete hiring workflow documentation from job posting to digital onboarding
  - **Other Features**: Messaging, documents, training courses, account settings, and data import/export guides
  - Accessible from sidebar menu for all authenticated users, written in simple everyday language for non-technical users

## External Dependencies

### Database
- **Neon PostgreSQL**: Serverless PostgreSQL database hosting
- **@neondatabase/serverless**: Connection pooling for optimized database connections

### UI and Styling
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library

### Development Tools
- **TypeScript**: Type safety
- **ESBuild**: Fast JavaScript bundling
- **Zod**: Schema validation for API endpoints and forms

### Geolocation Services
- **Browser Geolocation API**: Native location services
- **Nominatim API (OpenStreetMap)**: Free geocoding service for address/CEP search with automatic Brazil filtering

### Mapping
- **react-leaflet**: Interactive maps with Leaflet.js integration
- **OpenStreetMap**: Tile layer provider for map visualization

### Facial Recognition
- **MediaDevices API**: Camera access
- **Canvas API**: Image processing

### Other
- **WebSocket Constructor**: Custom WebSocket implementation for Neon database.