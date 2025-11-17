# RHNet - "A Rede do RH"

## Overview

RHNet is a comprehensive human resources management system designed to streamline HR-employee interactions. It integrates electronic timekeeping with geolocation and facial recognition, corporate messaging, document management, and employee training. Key capabilities include advanced reporting, PWA support, and a dedicated terminal/kiosk mode for time clocking. The system aims to provide a unified, full-stack web solution for efficient HR management, enhancing communication, and ensuring data accuracy, ultimately improving operational efficiency and employee engagement.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

**November 17, 2025** (latest): Enhanced inventory movements with searchable item selection and transaction date tracking:
- **TopBar Standardization**: Updated all inventory module pages to use specific TopBar titles matching their purpose:
  - Dashboard de Estoque, Gestão de Itens, Distribuição de EPIs, Histórico de EPIs, Movimentações de Estoque
- **Searchable Item Selection**: Replaced dropdown with Combobox component (Command + Popover):
  - Type-to-filter by item code or name
  - Displays stock quantity while searching
  - Validation ensures item is selected from list (not just typed)
- **Transaction Date Field**: Added dedicated date picker for recording actual transaction dates:
  - Allows recording invoice dates or when movement actually occurred
  - DatePicker with calendar widget (pt-BR format: dd/MM/yyyy)
  - Defaults to current date
  - Timezone-safe: normalizes to local noon (12:00) before ISO conversion to prevent day-shift bugs
- **Database Schema**: Added `transaction_date` column to `inventory_movements` table (timestamp NOT NULL, default CURRENT_TIMESTAMP)
- **Enhanced Validation**: Separate, specific validation messages for:
  - Item selection required
  - Positive quantity required  
  - Reason selection required
- **History Display**: Movement table now shows transaction date instead of creation date for accurate tracking

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
- **Core Entities**: Users, Departments, Time Entries, Break Entries, Face Profiles, Sessions, User Shift Assignments.
- **Key Fields**: `passwordHash`, `mustChangePassword`, `passwordResetToken`, `internalId`.

### Core Features
- **System Initialization**: First-time setup flow for production deployments, including superadmin creation.
- **Geolocation & Geofencing**: Time tracking with location verification, geofencing, and address search.
- **Time Tracking**: Clock in/out with location/facial verification, break management, IP address tracking, geofence proximity, shift schedule compliance, and UTC timestamp storage with timezone conversion. Includes audited admin edits and configurable tolerance.
- **Terminal/Kiosk Mode**: Tablet-optimized interface for time clock stations with device registration and stateless authentication.
- **Shift & Rotation Management**: CRUD for shifts and rotation templates.
- **Automatic Break Management**: Configurable automatic breaks per shift.
- **Employee-Shift Assignment**: Flexible system for assigning employees to shifts.
- **Password Management**: Self-service password change.
- **Course Management**: Admin interface for quizzes with question CRUD.
- **Messaging System**: Multi-target messaging with contextual messaging from documents.
- **Legal Files (AFD/AEJ)**: Generation and import of mandatory legal files (Portaria 671/2021) with integrity checks.
- **CSV Import/Export**: Bulk employee management.
- **Reporting & Analytics**: Monthly time summaries, dashboard statistics, data export, and "Inconsistency Reporting".
- **Recruitment & Selection Module**: Manages hiring workflow from job openings to digital onboarding. Includes job postings, candidate database, application tracking, secure digital onboarding links, and a weighted scoring system based on configurable job requirements.
- **DISC Personality Assessment**: Integrated 24-28 question DISC assessment embedded in the recruitment workflow, with configurable requirements, timing, ideal profile specification, and compatibility scoring.
- **Overtime & Time Bank System**: Configurable overtime management with percentage rates by department/shift, supporting multiple tiers and dual modes (paid overtime or time bank credits).
- **System User Manual**: In-app documentation with tabbed sections and PDF export functionality.
- **Lead Capture System**: Commercial prospecting functionality with lead lifecycle management, public-facing form, automated email notifications to sales, and an admin interface for lead management, status updates, and tracking.
- **Inventory & EPI Management**: Comprehensive system including inventory categories, items, stock, movements, and employee-assigned items. Features digital signatures for distribution/returns, role-based access control (Admin, Supervisor, Employee), department filtering, and automatic expiry calculation.

## External Dependencies

- **Database**: Neon PostgreSQL, `@neondatabase/serverless`.
- **UI**: Radix UI, Tailwind CSS, Lucide React.
- **Development**: TypeScript, ESBuild, Zod.
- **Geolocation**: Browser Geolocation API, Nominatim API (OpenStreetMap).
- **Mapping**: react-leaflet, OpenStreetMap.
- **Facial Recognition**: MediaDevices API, Canvas API.
- **PDF Generation**: jsPDF, html2canvas.
- **Email Notifications**: SendGrid.
- **Other**: WebSocket Constructor (custom for Neon).