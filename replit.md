# RHNet - "A Rede do RH"

## Overview

RHNet é um sistema completo de gestão de recursos humanos que integra controle de ponto eletrônico, mensageria corporativa, gestão de documentos e capacitação de funcionários. O sistema oferece uma solução unificada para comunicação entre RH e colaboradores, com funcionalidades avançadas de geolocalização, reconhecimento facial e relatórios abrangentes.

O sistema é projetado como uma aplicação web full-stack com frontend React e backend Express.js, utilizando PostgreSQL para persistência de dados e integração com sistema de autenticação Replit.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (October 2025)

### Password Change Functionality (October 8, 2025)
- **User Password Management**: Added self-service password change functionality for all authenticated users
- **Backend API**: POST /api/auth/change-password endpoint with current password validation and Zod schema validation
- **Frontend Page**: Dedicated /change-password route with secure form (current password, new password, confirm password)
- **Sidebar Integration**: Added "Alterar Senha" button with Key icon in sidebar footer for easy access
- **Security**: Validates current password before allowing change; uses argon2id hashing; auto-clears mustChangePassword flag
- **UX Features**: Success toast notification, auto-redirect to dashboard, form validation with error messages

### Admin Access Improvements (October 8, 2025)
- **In-Progress Course Management**: Fixed bug where admin controls (Edit and Questions buttons) only appeared in "Cursos Disponíveis" section
- **Consistent Admin UX**: Admin buttons now visible in both "Cursos Disponíveis" and "Cursos em Andamento" sections
- **Universal Access**: All admin/superadmin users can now manage questions and edit courses regardless of course enrollment status
- **UI Enhancement**: Questions (HelpCircle) and Edit buttons added to in-progress course cards for admin users

### Course Questions Management Interface (October 8, 2025)
- **Admin Question Management**: Added complete UI for managing course quiz questions
- **Question CRUD Operations**: Admins can create, view, and delete questions directly from the training page
- **Smart Validation**: Frontend validates that questions have at least 2 options and correct answer matches an option
- **Radio Selection UX**: Improved UX by using radio buttons for selecting correct answers instead of free text
- **Security Controls**: All question routes enforce company-level access control and admin-only modifications
- **Backend APIs**:
  - GET /api/courses/:id/questions - Retrieves all questions for a course
  - POST /api/courses/:id/questions - Creates a new question (admin only, with Zod validation)
  - DELETE /api/courses/:courseId/questions/:questionId - Deletes a question (admin only)
- **UI Components**: 
  - HelpCircle icon button on each course card opens questions management dialog
  - Dialog shows existing questions with delete buttons
  - Form to add new questions with 4 options and radio button selection for correct answer
  - Real-time query invalidation keeps UI in sync with backend

### Messaging System Enhancements
- **Archive/Delete for Sent Messages**: Added `senderDeleted` and `senderDeletedAt` fields to messages table to support sender-side archiving and deletion without affecting recipients
- **Isolated Soft Delete**: Sender deletions (senderDeleted) are independent from recipient deletions (messageRecipients.isDeleted), preserving message visibility for recipients
- **Smart Delete/Archive Logic**: 
  - When sender deletes/archives: updates `messages.senderDeleted = true` (recipients still see in inbox)
  - When recipient deletes/archives: updates `messageRecipients.isDeleted = true` (sender still sees in sent)
  - Both methods check user ownership before updating to prevent privilege escalation
- **Query Optimization**: Separated message queries by tab (inbox/sent/archived) with proper filtering
  - Sent messages: filters by `senderId = userId AND senderDeleted = false`
  - Archived messages: filters by `senderId = userId AND senderDeleted = true`
  - Inbox messages: joins messageRecipients where `userId = userId AND isDeleted = false`
- **Cache Invalidation**: Fixed cache invalidation to use tab-specific query keys (`/api/messages/${tab}`) for immediate UI updates
- **Permission Controls**: Only inbox (received) messages can be edited; sent messages are view-only
- **Data Integrity**: Sender and recipient actions are completely isolated - each user's delete/archive only affects their own view
- **Security**: All delete/archive operations include ownership checks to prevent unauthorized message manipulation

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for client-side routing
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database ORM**: Drizzle ORM for type-safe database operations
- **API Design**: RESTful API endpoints with proper error handling
- **Session Management**: Express sessions with PostgreSQL session store
- **File Structure**: Organized into routes, storage layer, and database configuration

### Authentication System
- **Hybrid Architecture**: Supports both Replit OIDC and local email/password authentication
- **Primary Strategy**: Local email/password with argon2id password hashing
- **Fallback Strategy**: Replit OIDC (OpenID Connect) for migration compatibility
- **Session Management**: Express sessions with memory store (development)
- **Authorization**: Role-based access control (superadmin/admin/employee roles)
- **Security Features**: Rate limiting, secure password hashing, session-based authentication
- **Migration Path**: Gradual transition from OIDC to independent local authentication

### Database Schema
- **Users**: Profile information, roles, department assignments, password hashing (passwordHash, mustChangePassword, passwordResetToken, passwordResetExpires)
- **Departments**: Location-based work units with geofencing coordinates
- **Time Entries**: Clock in/out records with geolocation and facial recognition data
- **Break Entries**: Break time tracking linked to time entries
- **Face Profiles**: Facial recognition data storage
- **Sessions**: Authentication session persistence

### Hybrid Authentication Implementation
- **Backend Integration** (server/localAuth.ts): Complete local authentication system with argon2id password hashing
- **Middleware Integration** (isAuthenticatedHybrid): Unified middleware supporting both OIDC and local auth
- **Frontend Pages**: Login (/login), Registration (/register), Password Setup (/set-password)
- **Migration Strategy**: Existing OIDC users can be migrated by setting passwordHash field
- **Security Measures**: Rate limiting, secure session management, role-based authorization
- **User Roles**: First user automatically becomes superadmin, subsequent users require superadmin approval

### Geolocation Features
- **Browser Geolocation API**: Real-time location tracking
- **Distance Calculation**: Haversine formula for location verification
- **Department Geofencing**: Configurable radius-based location validation
- **Location Status Tracking**: Real-time location permission and accuracy monitoring

### Time Tracking System
- **Clock In/Out**: Location and optionally face-verified time entries
- **Break Management**: Separate break time tracking within work sessions
- **Automatic Calculations**: Total hours, break time, and overtime calculations
- **Status Management**: Active/inactive entry states with proper validation

### Shift Management System (Consolidated)
- **Centralized Management**: All shift management is consolidated in the "Gestão de Setores" (Sectors Management) page
- **Tabbed Interface**: Two-tab system separating sector management and shift management
- **Advanced Interval Support**: Shifts include breakStart/breakEnd fields for configurable break times
- **Real-time Calculations**: Automatic calculation of net working hours excluding break time
- **Comprehensive CRUD**: Full create, read, update, delete operations for shifts within sectors
- **Architectural Decision**: Eliminated duplicate shift management functionality from departments page

### Advanced Rotation Management System (NEW)
- **Comprehensive Interface**: Complete administrative interface at `/admin/rotation-management` accessible via sidebar
- **Template Creation**: Full CRUD operations for rotation templates with cadence types (daily, weekly, monthly, custom)
- **Segment Configuration**: Detailed segment management for complex rotation patterns (12x36, sequential shifts, etc.)
- **Automatic Schedule Generation**: Preview and generate employee shift assignments based on rotation templates
- **Flexible Parameters**: Configurable cycle length, start days, and rotation patterns
- **Complete Backend APIs**: 10 specialized endpoints for template, segment, and schedule management
- **Audit Trail**: Full logging of all rotation changes and schedule generations
- **Real-time Validation**: Sequential date validation for multiple shift assignments per employee
- **Integration Ready**: Fully integrated with existing shift and employee management systems

### Employee-Shift Assignment System
- **Advanced Assignment Management**: Complete system for linking employees to specific shifts with temporal controls
- **Flexible Period Support**: Optional start/end dates for shift assignments enabling employee rotations and temporary assignments
- **Visual Indicators**: Real-time badges showing employee count per shift and shift count per department
- **Comprehensive Interface**: Dedicated dialog for managing employee assignments with intuitive controls
- **Database Architecture**: userShiftAssignments table with userId, shiftId, startDate, endDate fields for flexible assignment tracking
- **API Security**: Full CRUD endpoints with proper company-level access control and role-based authorization
- **User Experience Features**: 
  - Employee management button on each shift for quick access
  - Real-time assignment count updates
  - Period-aware assignment display (permanent, temporary, or date-ranged)
  - Available employee filtering (excludes already assigned employees)
  - Success/error feedback for all operations

### Reporting and Analytics
- **Monthly Reports**: Comprehensive time summaries by user and date range
- **Dashboard Statistics**: Real-time metrics for today, week, and month
- **Export Capabilities**: Structured data export for external reporting
- **Historical Data**: Complete audit trail of all time entries

## External Dependencies

### Database
- **Neon PostgreSQL**: Serverless PostgreSQL database hosting
- **Connection Pooling**: @neondatabase/serverless for optimized connections

### Authentication
- **Hybrid System**: Local email/password authentication with OIDC fallback compatibility
- **Local Authentication**: Independent system with argon2id password hashing
- **Migration Support**: Gradual transition from Replit OIDC to self-hosted authentication

### Production Considerations
**Current Implementation Status**: Development-ready hybrid authentication system
**Production Requirements** (for deployment):
- Persistent session store (Redis/PostgreSQL instead of memory store)
- Enhanced rate limiting with IP-based protection and shared storage
- Secure cookie configuration (secure, httpOnly, sameSite attributes)
- Error handling improvements (remove crash-on-error middleware)
- TLS/SSL certificate configuration for secure authentication
- Environment variable management for secrets and database connections

### UI and Styling
- **Radix UI**: Comprehensive accessible component primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library for consistent iconography
- **Color Palette**: Reflects logomarca colors
  - Primary: Azul escuro (hsl(210, 100%, 25%))
  - Secondary: Verde água/azul claro (hsl(180, 60%, 70%))
  - Accent: Verde claro (hsl(120, 50%, 70%))
  - Consistent application across all internal pages and components

### Development Tools
- **TypeScript**: Type safety across frontend and backend
- **ESBuild**: Fast JavaScript bundling for production
- **Vite**: Development server and build tool with HMR

### Geolocation Services
- **Browser Geolocation API**: Native location services
- **WebSocket Constructor**: Custom WebSocket implementation for Neon database

### Facial Recognition
- **MediaDevices API**: Camera access for facial recognition capture
- **Canvas API**: Image processing and capture functionality

### State Management
- **TanStack Query**: Server state synchronization and caching
- **React Hook Form**: Form state management with validation
- **Zod**: Schema validation for API endpoints and forms