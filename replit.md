# RHNet - "A Rede do RH"

## Overview

RHNet is a comprehensive human resources management system designed to streamline HR-employee interactions. It integrates electronic timekeeping with geolocation and facial recognition, corporate messaging, document management, and employee training. Key capabilities include advanced reporting, PWA support, and a dedicated terminal/kiosk mode for time clocking. The system aims to provide a unified, full-stack web solution for efficient HR management, enhancing communication, and ensuring data accuracy. The project's ambition is to offer a robust, all-in-one HR platform that significantly improves operational efficiency and employee engagement.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

**November 17, 2025**: Fixed critical Inventory CRUD bugs and improved UX:
- **Bug Fix - Category Creation**: Resolved NOT NULL constraint violation by adding required 'type' field to category creation form (Select component with EPI/Uniform/Material/Tool options) and backend route validation
- **Layout Fix - InventoryDashboard**: Corrected content clipping issue by wrapping page content in `flex-1 overflow-y-auto` container with internal padding, ensuring full scrollability
- **Error Handling**: Added onError handler with destructive toast notification for category creation mutation failures
- **Code Cleanup**: Removed unused Package icon import from dashboard.tsx
- **UI Improvements**: 
  - Removed Inventory & EPIs card from main dashboard (changed grid from 5 to 4 columns)
  - Added "Gestão de Estoque e EPIs de Funcionários" feature section to landing page with Package icon and turquoise branding
  - **Sidebar Navigation**: Added "Estoque e EPIs" menu item with submenu (Dashboard, Gestão de Itens [admin-only], Distribuir EPIs, Histórico) positioned after "Capacitação"
- **Documentation**: Updated system manual with comprehensive Inventory & EPI Management section
- **Quality Assurance**: All changes reviewed and approved by Architect agent with confirmed functionality via server logs

**November 16, 2025**: Implemented complete Inventory & EPI Management System with digital signatures and role-based access control:
- **Backend Infrastructure**: Created 5 new database tables (inventory_categories, inventory_items, inventory_stock, inventory_movements, employee_items) with full CRUD operations via storage layer and API routes
- **Digital Signatures**: Installed react-signature-canvas package and created reusable SignaturePad UI component for delivery/return signatures
- **Frontend Pages**: Built 4 complete pages - InventoryDashboard (overview with stats), InventoryItems (CRUD management), InventoryDistribution (EPI distribution with signatures), InventoryHistory (employee history with returns)
- **Role-Based Permissions**: Implemented proper access control - Admin (full access to all features), Supervisor (department-filtered access to distribution/history), Employee (view own items only)
- **Department Filtering**: Supervisors see only employees from their department in distribution and history pages
- **Automatic Expiry Calculation**: System automatically calculates expiry dates based on deliveryDate + validityMonths for items with validity
- **UI Components**: Added "success" variant to Badge component for status indicators
- **Routes Integration**: Added 4 new protected routes to App.tsx (/admin/inventory, /admin/inventory/items, /admin/inventory/distribute, /admin/inventory/history)
- **Code Quality**: All pages reviewed and approved by Architect agent with proper TypeScript typing, error handling, and data-testid attributes for automated testing
- **Next Steps**: Planned features include PDF receipt generation, document integration, messaging system notifications, expiration alerts, and comprehensive reporting

**November 15, 2025**: Fixed critical React infinite loop bug caused by multiple `useAuth()` hook invocations:
- **Root Cause**: Both Router component and ProtectedRoute component were calling `useAuth()`, creating duplicate subscriptions and triggering infinite re-renders
- **Solution**: Centralized authentication state by calling `useAuth()` only once in Router component, passing `isAuthenticated` and `isLoading` as props to ProtectedRoute
- **Implementation**: Updated all protected routes to use `component={(routeProps) => <ProtectedRoute component={X} isAuthenticated={isAuthenticated} isLoading={isLoading} {...routeProps} />}` pattern
- **Impact**: Ensures proper route parameter forwarding for dynamic routes (`:id` parameters) while eliminating hook duplication
- **Testing**: Verified via end-to-end Playwright test that login page loads without infinite loop errors, form validation works, and UI is responsive

## System Architecture

### Frontend
- **Framework**: React 18 with TypeScript.
- **State Management**: TanStack Query, React Hook Form.
- **Routing**: Wouter.
- **UI/Styling**: shadcn/ui (Radix UI primitives), Tailwind CSS with custom branding (Navy Blue, Turquoise), Lucide React icons.
- **Visual Identity**: Modern gradient design on headers and primary CTA buttons. Simplified footer.
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
- **System Initialization**: First-time setup flow for production deployments. Login page automatically detects if no superadmin exists via GET `/api/auth/has-superadmin` endpoint and displays initialization form instead of standard login. Form collects email, first name, last name, and password to create the first superadmin account via POST `/api/setup/init`. After successful creation, system performs automatic login and redirects to dashboard. Includes loading states, validation, and error handling.
- **Geolocation & Geofencing**: Browser Geolocation API, Haversine formula, `react-leaflet` for interactive map-based geofencing, Nominatim API for address search.
- **Time Tracking**: Clock in/out with location/facial verification, break management, IP address tracking, geofence proximity validation, shift schedule compliance, and UTC timestamp storage with Brazil timezone conversion. Admin edits are audited. Configurable time tolerance.
- **Terminal/Kiosk Mode**: Tablet-optimized interface for fixed time clock stations, device registration, stateless authentication, auto-logout, and data masking.
- **Shift & Rotation Management**: CRUD for shifts and rotation templates with advanced interval support.
- **Automatic Break Management**: Configurable automatic breaks (paid/unpaid) per shift, deducted at clock-out. Includes smart deduction logic to prevent errors.
- **Employee-Shift Assignment**: Flexible system for assigning employees to shifts with optional dates, supporting cross-company and cross-department assignments.
- **Password Management**: Self-service password change.
- **Course Management**: Admin interface for quizzes with question CRUD.
- **Messaging System**: Multi-target messaging (individual, department, broadcast) with contextual messaging from documents.
- **Legal Files (AFD/AEJ)**: Generation and import of mandatory legal files (Portaria 671/2021) with CRC-16 validation and SHA-256 integrity.
- **CSV Import/Export**: Bulk employee management with template download, validation, and error reporting.
- **Reporting & Analytics**: Monthly time summaries, dashboard statistics, data export, and "Inconsistency Reporting" with irregularity detection.
- **Recruitment & Selection Module**: Manages hiring workflow from job openings to digital onboarding. Includes job postings, candidate database, application tracking, and secure digital onboarding links. Features a weighted scoring system for candidate evaluation based on configurable job requirements. Candidates self-evaluate against requirements. **DISC Personality Assessment**: Integrated 24-28 question DISC assessment (Dominance, Influence, Steadiness, Conformity) fully embedded in recruitment workflow. Job opening configuration includes DISC requirements via user-friendly dropdown selects (Não relevante/Baixo/Médio/Alto/Muito Alto mapping to 0/25/50/75/100) replacing numeric inputs, timing preferences (on application vs. during selection), ideal profile specification stored as JSONB, compatibility scoring with signed directional indicators, and centralized validation preventing empty profiles. Shared utilities (discOptions.ts) ensure consistent value handling across create/edit forms with legacy value snapping for backward compatibility.
- **Overtime & Time Bank System**: Configurable overtime management with percentage rates by department/shift, supporting multiple tiers and dual modes (paid overtime or time bank credits). Includes an administrative interface and automatic calculation.
- **System User Manual**: In-app documentation with 8 tabbed sections, PDF export functionality with real screenshots captured client-side using `html2canvas` and generated with `jsPDF`.
- **Lead Capture System**: Commercial prospecting functionality with complete lead lifecycle management. Public-facing form on landing page ("Começar Agora" button) captures contact information (name, email, phone, company, message) and UTM tracking parameters for marketing attribution. Upon submission, system creates lead in database with status "new" and sends automated email notification to sales team (infosis@infosis.com.br) via SendGrid with formatted lead details and next steps. Admin interface at `/admin/leads` provides comprehensive lead management with dashboard cards showing lead counts by status (new → contacted → meeting_scheduled → proposal_sent → contracted/lost), filterable table with click-to-email/call links, details dialog for viewing full lead information and marketing UTM data, and status update functionality with follow-up notes. API endpoints: POST `/api/leads` (public), GET `/api/leads?status=X` (admin), PATCH `/api/leads/:id` (admin). Email service (emailService.ts) uses SendGrid with branded HTML templates and graceful fallback logging when API key not configured. Requires environment variables: SENDGRID_API_KEY, SALES_EMAIL, FROM_EMAIL.

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