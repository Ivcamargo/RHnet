# RHNet - "A Rede do RH"

## Overview

RHNet is a comprehensive human resources management system designed to streamline HR-employee interactions. It integrates electronic timekeeping with geolocation and facial recognition, corporate messaging, document management, and employee training. Key capabilities include advanced reporting, PWA support, and a dedicated terminal/kiosk mode for time clocking. The system aims to provide a unified, full-stack web solution for efficient HR management, enhancing communication, and ensuring data accuracy. The project's ambition is to offer a robust, all-in-one HR platform that significantly improves operational efficiency and employee engagement.

## User Preferences

Preferred communication style: Simple, everyday language.

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