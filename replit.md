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
- **Core Entities**: Users, Departments, Time Entries, Break Entries, Face Profiles, Sessions, User Shift Assignments, Job Openings, Applications, DISC Assessments, Inventory Items, Inventory Movements.

### Core Features
- **System Initialization**: First-time setup flow for production deployments.
- **Geolocation & Geofencing**: Time tracking with location verification and geofencing.
- **Time Tracking**: Clock in/out with location/facial verification, break management, IP tracking, shift schedule compliance, and UTC timestamp storage.
- **Terminal/Kiosk Mode**: Tablet-optimized interface for time clock stations.
- **Shift & Rotation Management**: CRUD for shifts and rotation templates, with automatic break management.
- **Password Management**: Self-service password change.
- **Course Management**: Admin interface for quizzes.
- **Messaging System**: Multi-target messaging with contextual messaging from documents.
- **Legal Files (AFD/AEJ)**: Generation and import of mandatory legal files (Portaria 671/2021).
- **CSV Import/Export**: Bulk employee management.
- **Reporting & Analytics**: Monthly time summaries, dashboard statistics, data export, and "Inconsistency Reporting".
- **Recruitment & Selection Module**: Manages hiring workflow from job openings to digital onboarding, including a weighted scoring system based on configurable job requirements.
- **DISC Personality Assessment**: Integrated 24-28 question DISC assessment within recruitment, with configurable requirements, timing, ideal profile specification, and compatibility scoring.
- **Overtime & Time Bank System**: Configurable overtime management with percentage rates and dual modes (paid overtime or time bank credits).
- **System User Manual**: In-app documentation with PDF export.
- **Lead Capture System**: Commercial prospecting functionality with lead lifecycle management, public-facing forms, and admin interface.
- **Inventory & EPI Management**: Comprehensive system including categories, items, stock, movements, and employee-assigned items with digital signatures, role-based access, and expiry calculation.

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