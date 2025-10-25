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
- **Time Tracking**: Clock in/out with location/facial verification, break management. Includes IP address tracking, geofence proximity validation, shift schedule compliance (including overnight shifts), and UTC timestamp storage with Brazil timezone conversion for display. Admin edits are audited with detailed tracking.
- **Terminal/Kiosk Mode**: Tablet-optimized interface for fixed time clock stations with compact logo display (180px). Features device registration, public interface (`/terminal-ponto`) with simplified flow fitting on screen without scroll, stateless authentication, auto-logout, and data masking. Records `deviceId` for provenance.
- **Shift & Rotation Management**: Comprehensive CRUD for shifts and rotation templates (daily, weekly, monthly, custom) with advanced interval support.
- **Employee-Shift Assignment**: Flexible system for assigning employees to shifts with optional start/end dates. Supports cross-company assignments for superadmins and cross-department flexibility.
- **Password Management**: Self-service password change.
- **Course Management**: Admin interface for quizzes with question CRUD and validation.
- **Messaging System**: Supports isolated sender-side archiving/deletion.
- **CSV Import/Export**: Bulk employee management with template download, validation, error reporting, and company-filtered export. Supports `internalId` and uses semicolon delimiter/UTF-8 BOM for Excel compatibility.
- **Reporting & Analytics**: Monthly time summaries, dashboard statistics, data export. Includes "Inconsistency Reporting" with advanced irregularity detection (late arrivals, insufficient hours, missing punches) based on shift schedules, stored in `timeEntries` with detailed reasons.
- **Recruitment & Selection Module**: Manages hiring workflow from job openings to digital onboarding. Includes job postings, candidate database, application tracking (status flow: applied → hired), and secure digital onboarding links. All data is company-scoped.
- **System User Manual**: In-app documentation (`/manual`) with tabbed sections covering all system features, written in simple language.

## External Dependencies

- **Database**: Neon PostgreSQL, `@neondatabase/serverless`.
- **UI**: Radix UI, Tailwind CSS, Lucide React.
- **Development**: TypeScript, ESBuild, Zod.
- **Geolocation**: Browser Geolocation API, Nominatim API (OpenStreetMap).
- **Mapping**: react-leaflet, OpenStreetMap.
- **Facial Recognition**: MediaDevices API, Canvas API.
- **Other**: WebSocket Constructor (custom for Neon).