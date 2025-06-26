# Plant Care Assistant

## Overview

This is a full-stack plant care application built with React (frontend) and Express.js (backend), designed to help users manage their plants, track watering schedules, and monitor plant health. The application features plant identification using AI, push notifications, and comprehensive plant care tracking.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Library**: Shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS with custom mint/nature theme
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **Authentication**: Passport.js with local and Google OAuth strategies
- **Session Management**: Express sessions with PostgreSQL store
- **API Design**: RESTful endpoints with JSON responses

### Database Architecture
- **Database**: PostgreSQL with Neon serverless hosting
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema**: Comprehensive plant care schema with users, plants, tasks, records, and notifications
- **Migrations**: Drizzle Kit for schema management

## Key Components

### Authentication System
- Local username/password authentication with bcrypt hashing
- Google OAuth 2.0 integration
- Session-based authentication with secure cookies
- Protected routes on both frontend and backend

### Plant Management
- CRUD operations for plants with detailed metadata
- Plant categorization (indoor/outdoor)
- Image storage for plant photos
- Care requirements tracking (watering frequency, light, temperature, humidity)

### Task System
- Automated task generation based on plant care schedules
- Task types: watering, misting, fertilizing
- Flexible repeat patterns (one-time, daily, every N days, weekly)
- Task completion tracking with notifications

### Plant Identification & Health Analysis
- Integration with Plant.ID API for plant identification
- Health scanning with issue detection and recommendations
- Plant record keeping with photos and notes
- Species identification with confidence scores

### Notification System
- Firebase Cloud Messaging for push notifications
- Task reminders and overdue notifications
- Real-time notification management
- Configurable notification preferences

### Progressive Web App Features
- Service worker with offline caching and background sync
- Web app manifest with custom plant-themed icons
- Install prompt component for home screen installation
- Camera integration for plant photography
- Responsive design optimized for mobile devices
- Push notifications through Firebase Cloud Messaging

## Data Flow

1. **Authentication Flow**: User logs in → Session created → Auth context updated → Protected routes accessible
2. **Plant Care Flow**: User adds plant → Tasks auto-generated → Notifications scheduled → User completes tasks
3. **Identification Flow**: User captures photo → Sent to Plant.ID API → Results processed → Option to save as new plant
4. **Notification Flow**: Task due → Background job creates notification → Push notification sent → User receives alert

## External Dependencies

### APIs and Services
- **Plant.ID API**: Plant identification and health analysis
- **Firebase**: Push notifications and cloud messaging
- **Google OAuth**: Third-party authentication
- **Neon Database**: Serverless PostgreSQL hosting

### Key Libraries
- **Frontend**: React, Vite, TanStack Query, Tailwind CSS, Shadcn/ui, Wouter
- **Backend**: Express.js, Passport.js, Drizzle ORM, Neon serverless
- **Shared**: Zod for validation, date-fns for date handling

## Deployment Strategy

### Development Environment
- Replit-based development with hot reload
- PostgreSQL module for database
- Environment variables for API keys and secrets

### Production Build
- Vite builds optimized frontend bundle
- esbuild compiles backend TypeScript to ESM
- Static assets served from dist/public
- Server runs compiled JavaScript from dist/

### Database Management
- Drizzle migrations for schema changes
- Connection pooling with Neon serverless
- Environment-based configuration

## Changelog

- June 26, 2025. Initial setup
- June 27, 2025. Implemented PWA functionality with custom icons, manifest, service worker, offline caching, and install prompt

## User Preferences

Preferred communication style: Simple, everyday language.