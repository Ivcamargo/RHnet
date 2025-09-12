# PointControl - Time Clock Management System

## Overview

PointControl is a modern electronic time clock system built for employee time tracking with advanced features including geolocation verification, facial recognition, and comprehensive reporting. The application provides both employee time-tracking capabilities and administrative management tools for departments, users, and time records.

The system is designed as a full-stack web application with a React frontend and Express.js backend, utilizing PostgreSQL for data persistence and integrating with Replit's authentication system.

## User Preferences

Preferred communication style: Simple, everyday language.

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
- **Provider**: Replit OIDC (OpenID Connect) integration
- **Strategy**: Passport.js with OpenID Connect strategy
- **Session Storage**: PostgreSQL-backed sessions using connect-pg-simple
- **Authorization**: Role-based access control (employee/admin roles)

### Database Schema
- **Users**: Profile information, roles, department assignments
- **Departments**: Location-based work units with geofencing coordinates
- **Time Entries**: Clock in/out records with geolocation and facial recognition data
- **Break Entries**: Break time tracking linked to time entries
- **Face Profiles**: Facial recognition data storage
- **Sessions**: Authentication session persistence

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
- **Replit OIDC**: Primary authentication provider
- **OpenID Connect**: Standard authentication protocol implementation

### UI and Styling
- **Radix UI**: Comprehensive accessible component primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library for consistent iconography

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