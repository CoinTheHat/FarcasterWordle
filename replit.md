# WordCast - Farcaster Daily Word Puzzle Mini-App

## Overview

WordCast is a production-ready Wordle-style daily word game built as a Farcaster Mini-App. Players have 6 attempts to guess a 5-letter word that changes daily at midnight Istanbul time (UTC+3). The application features seamless Farcaster authentication, device-independent progress tracking, streak maintenance, and social sharing capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

**October 24, 2025 - Splash Screen & Leaderboard Improvements & Harder Turkish Words**
- Updated splash screen with large "WordCast" branding
  - Replaced simple loader with gradient text logo (6xl mobile, 8xl desktop)
  - Blue → Purple → Pink gradient with dark mode support
  - Pulse animation for visual appeal
  - Full app name instead of abbreviation
- Generated new app icon and splash images
  - Professional "WordCast" logo on purple gradient background
  - Replaced "WC" abbreviation with full app name
  - Updated favicon, icon.png, and splash.png in public folder
  - Added PWA manifest.json for installable app support
  - Apple touch icon support for iOS devices
- Fixed Leaderboard Display Issues:
  - Fixed Weekly Leaderboard: Now shows MAX score per user (not SUM)
    - Previously: User plays 3 games → scores added (50+40+30=120)
    - Now: User plays 3 games → shows best score only (50)
  - Added "Best Scores" (All-Time) leaderboard tab
    - Shows each user's highest score ever achieved across all games
    - CTE-based SQL with deterministic tiebreaker (fewest attempts, earliest date)
  - Replaced Turkish words with more challenging vocabulary
    - Old: ARABA, BAHCE, CANTA (easier words)
    - New: AFYON, ASLAN, BEKCI, BILGI, BOCEK, BOMBA, KAVGA, KORKU, etc. (harder words)
    - 102 challenging 5-letter Turkish words (validated)
  - All three leaderboards use same logic: Show each user's BEST score for the time period

**October 24, 2025 - Multi-Language Support (Turkish/English)**
- Added full multi-language support with Turkish and English word lists
- Language selection modal appears on first app launch
- Language switcher button in header (Globe icon, top left) for easy switching
- Language preference stored in localStorage
- Backend validates guesses against language-specific word lists
- Fixed critical validation bug: isValidGuess now uses Set.has() for proper word validation
- Each language has separate TARGET_WORDS and ALLOWED_GUESSES word lists
- Session-based games include language context for proper validation

**October 24, 2025 - Session Persistence & Idempotent TX Handling**
- Fixed "Transaction failed - Session not found" error after TX confirmation
- Added `completed` flag to ActiveGame interface to track TX completion status
- Implemented idempotent `/api/complete-game` endpoint: duplicate TX requests return cached response
- Session cleanup on new game start: removes completed sessions for same user to prevent memory leaks
- Session no longer deleted on successful TX → enables retry on network errors
- Better error recovery: network failures during TX confirmation won't lose game session

**October 24, 2025 - Mobile Optimization & Error Handling Fixes**
- Fixed "Saving..." button stuck state: Added isSavingScore state management with proper reset in finally block
- Improved TX error handling: Added "cancelled" detection to user rejection logic
- Enhanced clipboard error handling: Wrapped copyToClipboard in try-catch to prevent "Failed to copy" errors
- Mobile spacing optimization: Reduced padding throughout for better screen fit
  - Main layout: py-8 → py-4 (mobile), stats cards: p-3 → p-2 (mobile)
  - Board padding: p-6 → p-3 (mobile), tile gaps: gap-2 → gap-1.5 (mobile)
  - Keyboard: p-4 → p-3, button heights h-12 → h-11, gaps gap-1.5 → gap-1 (mobile)
- Shortened mobile labels: "Current Streak" → "Streak", "Max Streak" → "Max", "Remaining" → "Left"
- Font size adjustments: text-2xl → text-xl for stats, text-xs → text-[10px] for labels (mobile)
- Fixed GameStatus type error: Removed invalid "completed" status, using gameCompleted flag instead

**October 24, 2025 - Session-Based Game System with Security Fixes**
- Implemented session-based random word system (replaces daily fixed words)
- Backend endpoints: /api/start-game, /api/guess, /api/complete-game
- TX hash validation: Regex check for proper Ethereum hash format (0x + 64 hex chars)
- Improved error messages: "Game session not found or expired. Please start a new game."
- Auto-restart after TX failure: User can immediately replay with new random word
- Complete state reset on TX error: guesses, feedback, scores, hintUsed, etc.
- GameOverModal warning: Shows alert if user doesn't save score (won't count for leaderboard)
- Replay support: User can cancel TX and play again with different word
- Security: Backend validates TX hash format before persisting to daily_results
- UX: Clear toast messages explain what happened during TX cancellation/failure
- Fixed splash screen: Removed visible color codes, clean professional design
- Wagmi integration: Using @farcaster/miniapp-wagmi-connector for proper wallet support

**October 24, 2025 - Leaderboard System**
- Three leaderboard tabs: Daily, Weekly, Best Scores (All-Time)
- Trophy icon navigation in header to access leaderboard
- Daily leaderboard: Today's best scores (one entry per user)
- Weekly leaderboard: Last 7 days - shows each user's MAX score (not total)
- Best Scores: All-time highest score per user across entire history
- All leaderboards show top 100 players with deterministic ranking
- Mobile-responsive design with md: breakpoints throughout app
- Uses Europe/Istanbul timezone (UTC+3) for daily/weekly boundaries

**October 24, 2025 - Scoring System & Wallet Integration**
- Added scoring system: Green tiles +2 points, Yellow tiles +1 point
- Row multipliers: 1st row 5x, 2nd row 4x, 3rd row 3x, 4th row 2x, 5th row 1.5x, 6th row 1x
- Header displays total score during gameplay
- GameOver modal shows final score and displays solution when player loses
- Integrated Wagmi + Farcaster wallet connector for blockchain transactions
- Auto-connect wallet on app load using Farcaster Mini-App connector
- "Save Score to Blockchain" button in GameOver modal
- Transaction sends score as hex-encoded data to user's own address on Base network

**October 24, 2025 - Word Validation Update**
- Changed validation to accept ANY 5-letter word (A-Z characters)
- Removed restriction to ALLOWED_GUESSES word list
- Both frontend and backend now use simple format validation: 5 letters A-Z only
- Feedback system colors tiles based on solution word
- Players can try any 5-letter combination
- Works for both English and Turkish word lists

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
- LocalStorage for persisting user preferences (color-blind mode, language)

**Game Logic**
- Client-side game state (current guess, letter states, feedback visualization)
- Server validation for all guess submissions to prevent cheating
- Session-based random word selection (replaced daily fixed words)
- Multi-language support (Turkish/English) with language-specific word validation
- Language preference persisted in localStorage
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
- Server-side word validation against language-specific allowed guess lists
- Language context stored in ActiveGame session for proper validation
- Set-based word lookups (O(1) performance) for both English and Turkish
- Server-side feedback calculation for each guess
- Enforcement of 6-attempt limit per session
- Session-based game management with completed flag for idempotent TX handling

**Business Logic**
- Session-based random word selection per language
- Language-specific word lists: TARGET_WORDS_EN and TARGET_WORDS_TR
- Allowed guess lists: ALLOWED_GUESSES_EN_SET and ALLOWED_GUESSES_TR_SET
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

**POST /api/start-game**
- Accepts language parameter ('en' or 'tr')
- Generates random word from language-specific list
- Creates ActiveGame session with language context
- Returns sessionId and maxAttempts
- Cleans up completed sessions for same user

**POST /api/guess**
- Accepts guess string and sessionId in request body
- Retrieves ActiveGame to get language context
- Validates guess against language-specific allowed word list
- Returns feedback array and game status
- Calculates round score and total score
- Enforces 6-attempt maximum per session

**POST /api/complete-game**
- Accepts sessionId and txHash
- Validates transaction hash format
- Marks session as completed (idempotent)
- Updates daily_results and streaks
- Returns final game statistics

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