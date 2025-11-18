# RHNet - "A Rede do RH"

## Overview

RHNet is a comprehensive human resources management system designed to streamline HR-employee interactions. It integrates electronic timekeeping with geolocation and facial recognition, corporate messaging, document management, and employee training. Key capabilities include advanced reporting, PWA support, and a dedicated terminal/kiosk mode for time clocking. The system aims to provide a unified, full-stack web solution for efficient HR management, enhancing communication, and ensuring data accuracy, ultimately improving operational efficiency and employee engagement.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

**November 18, 2025** (latest): System manual documentation updates:
- **LSP Error Resolution**: Fixed 4 import errors by adding Award, Package, and CalendarDays icons to lucide-react imports
- **Inventory Movements Documentation**: Added complete section documenting the stock movements system with:
  - 10 categorized movement reasons (Entradas, Saídas, Ajustes) with visual emojis and inline indicators (+/-/±)
  - Item search field and transaction date picker documentation
  - Complete movement history tracking features
- **Searchable Employee Field**: Documented the searchable Combobox for employee selection in Distribution page (filter by ID, name, or surname)
- **Documentation Accuracy**: Moved implemented features (stock movements, PDF receipts) from "Em Desenvolvimento" to main sections; renamed section to "Recursos Futuros" listing only pending features
- **DISC Section Validation**: Reviewed and confirmed DISC documentation is complete and accurate

**November 17, 2025**: Inventory module UX improvements and layout standardization:
- **Searchable Employee Field**: Transformed employee selection in Distribution page from Select dropdown to searchable Combobox
  - Users can now type to filter employees by internal ID, first name, or last name
  - Instant filtering improves workflow for large employee lists
  - Properly integrated with react-hook-form using field.onChange for state management
  - Uses shadcn/ui Command + Popover pattern for accessibility
- **Layout Consistency**: Fixed sidebar alignment issues across all inventory pages
  - InventoryHistory and InventoryItems now show properly aligned sidebar for unauthorized users
  - All 5 inventory pages maintain consistent TopBar + Sidebar + Main content structure
- **Previous UI Enhancements**:
  - Form Simplification: Removed "Tipo de Movimentação" field, eliminating redundancy with "Motivo"
  - Smart Motivo Field: Single dropdown now shows all 10 movement reasons with visual emojis and inline indicators:
    - Entradas: 📦 (+) Compra, ↩️ (+) Devolução, 🎁 (+) Doação Recebida
    - Saídas: 👷 (-) Distribuição de EPI, ❌ (-) Perda/Estravio, 🔨 (-) Dano/Avaria, 📅 (-) Vencimento, 🗑️ (-) Descarte
    - Ajustes: ✏️ (±) Correção de Inventário, 🔢 (±) Recontagem
  - Inline Operation Indicators: (+), (-), and (±) symbols directly in dropdown options
  - Header Consistency: All 5 inventory pages follow system-wide pattern with h1 title + descriptive subtitle
  - Automatic Type Calculation: System determines entrada/saída/ajuste based on selected reason
  - Searchable Combobox for item selection (type to filter by code or name)
  - Transaction date field with calendar picker (pt-BR format)
  - Timezone-safe date handling and enhanced validation

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