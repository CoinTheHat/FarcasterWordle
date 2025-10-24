# WordCast - Farcaster Daily Word Puzzle Mini-App

## Overview

WordCast is a production-ready Wordle-style daily word game built as a Farcaster Mini-App. Players have 6 attempts to guess a 5-letter word that changes daily at midnight Istanbul time (UTC+3). The application features seamless Farcaster authentication, device-independent progress tracking, streak maintenance, and social sharing capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- React with TypeScript for type safety and developer experience
- Vite for fast development and optimized production builds
- Wouter for lightweight client-side routing

**UI Components & Styling**
- TailwindCSS for utility-first styling with custom design tokens
- Shadcn/ui component library for consistent, accessible UI primitives
- Custom animations (flip, shake, bounce-in) for game interactions
- Radix UI primitives for complex interactive components (dialogs, tooltips, etc.)

**State Management**
- TanStack Query (React Query) for server state management and caching
- Local React state for game board and UI interactions
- LocalStorage for persisting user preferences (color-blind mode)

**Game Logic**
- Client-side game state (current guess, letter states, feedback visualization)
- Server validation for all guess submissions to prevent cheating
- Deterministic word selection using salted hash of date string
- Timezone handling via Luxon (Europe/Istanbul UTC+3)

### Backend Architecture

**Server Framework**
- Node.js with Express for RESTful API endpoints
- Custom middleware for Farcaster FID authentication via headers
- Development mode fallback FID (12345) for testing

**Data Persistence**
- SQLite via better-sqlite3 for file-based database storage
- Three core tables: `profiles`, `daily_results`, `streaks`
- In-memory Map for active game sessions (guesses, attempts)

**Anti-Cheat & Validation**
- Server-side word validation against allowed guess list
- Server-side feedback calculation for each guess
- Enforcement of 6-attempt limit per user per day
- One completed game per date per user constraint

**Business Logic**
- Daily word selection: salted hash of YYYYMMDD date string
- Streak calculation: consecutive day detection with timezone awareness
- Max streak tracking across user lifetime
- Profile management with created_at and last_seen_at timestamps

**Date/Time Handling**
- All server date operations use Europe/Istanbul timezone (UTC+3)
- Daily boundaries at midnight Istanbul time
- Luxon library for timezone-aware date manipulation
- Deterministic word rotation based on Istanbul date

### Database Schema

**profiles table**
- `fid` (INTEGER PRIMARY KEY): Farcaster user identifier
- `created_at` (TEXT): ISO timestamp of first visit
- `last_seen_at` (TEXT): ISO timestamp of most recent activity

**daily_results table**
- `id` (INTEGER PRIMARY KEY AUTOINCREMENT)
- `fid` (INTEGER): Foreign key to user
- `yyyymmdd` (TEXT): Date string in YYYYMMDD format
- `attempts` (INTEGER): Number of guesses used (1-6)
- `won` (INTEGER): Boolean (0/1) indicating win/loss
- `created_at` (TEXT): ISO timestamp of completion
- Unique constraint on (fid, yyyymmdd) to prevent duplicate entries

**streaks table**
- `fid` (INTEGER PRIMARY KEY)
- `current_streak` (INTEGER): Current consecutive day count
- `max_streak` (INTEGER): All-time best streak
- `last_played_yyyymmdd` (TEXT): Last completion date for gap detection
- `updated_at` (TEXT): ISO timestamp of last update

### External Dependencies

**Farcaster Integration**
- `@farcaster/miniapp-sdk` for authentication and context
- FID extraction from Farcaster user context
- Share-to-cast functionality for social features
- Guard screen when not running inside Farcaster Mini-App

**Development Tools**
- Replit-specific plugins for development experience
- Vite runtime error overlay
- Cartographer for code navigation
- Dev banner for environment awareness

**Database & ORM**
- better-sqlite3 for synchronous SQLite operations
- Drizzle Kit configured for PostgreSQL (schema definition tool)
- Note: Current implementation uses SQLite; Drizzle schema may be adapted

**Utility Libraries**
- Luxon for timezone-aware date operations
- clsx and tailwind-merge for conditional className composition
- class-variance-authority for component variant management
- nanoid for generating unique identifiers

**Type Safety**
- Zod for runtime schema validation
- Shared schema types between frontend and backend
- TypeScript strict mode enabled across entire codebase

### API Endpoints

**GET /api/me**
- Returns user stats: fid, streak, maxStreak, lastPlayed
- Creates profile if first visit
- Updates last_seen_at timestamp

**POST /api/guess**
- Accepts guess string in request body
- Validates guess against allowed word list
- Returns feedback array and game status
- Updates streaks on game completion
- Enforces 6-attempt maximum

**GET /api/board**
- Optional date parameter for historical data
- Returns board statistics for analytics

### Authentication Flow

1. Frontend initializes Farcaster SDK on app load
2. Extract FID from SDK context or use development fallback
3. Send FID in x-farcaster-fid header with all API requests
4. Server middleware validates and extracts FID
5. Guard screen displays if FID not available (production only)

### Game Flow

1. User loads app, Farcaster context initialized
2. Fetch user stats (creates profile if needed)
3. Check for existing daily result (prevents replay)
4. Load active game or start fresh (6 empty rows)
5. User types guess, submits via on-screen keyboard
6. Client sends guess to server for validation
7. Server validates, calculates feedback, tracks attempts
8. Client displays feedback with flip animation
9. On win/loss: update streaks, show modal with share option
10. Streak logic: consecutive day = increment, gap = reset to 0