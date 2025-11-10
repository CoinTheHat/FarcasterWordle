# WordCast - Farcaster Daily Word Puzzle Mini-App

## Overview

WordCast is a production-ready Wordle-style daily word game built as a Farcaster Mini-App. Players guess a 5-letter word in 6 attempts, with the word changing daily. The application supports Farcaster authentication, device-independent progress tracking, streak maintenance, and social sharing. It offers multi-language support (Turkish/English) and a robust scoring system integrated with blockchain transactions on the Base network for saving scores to a leaderboard.

## User Preferences

Preferred communication style: Simple, everyday language.

## Deployment

**Production Domain:** https://farcasterwordle.com
**Previous Domain:** farcaster-wordle.replit.app (migrated October 2025)
**Domain Migration:** Completed with new accountAssociation signature for farcasterwordle.com domain ownership verification.

## System Architecture

### Frontend Architecture

**Framework & Build System:** React with TypeScript, Vite, Wouter for routing.
**UI Components & Styling:** TailwindCSS, Shadcn/ui, custom animations, Radix UI primitives.
**State Management:** TanStack Query for server state, local React state for UI, LocalStorage for user preferences (color-blind mode, language).
**Internationalization (i18n):** Centralized translation system via I18nProvider context with 130+ translation keys, live language switching (TR/EN) without page reload, localStorage persistence, callback registration system for language change events, comprehensive modal and page translations including SettingsModal with language-reactive updates.
**Game Logic:** Client-side game state, server validation for guesses, session-based random word selection, multi-language support with language-specific word validation (EN: 270 words, TR: 306 words including vowel disharmony words), timezone handling via Luxon (Europe/Istanbul UTC+3).

### Backend Architecture

**Server Framework:** Node.js with Express for RESTful API, custom middleware for Farcaster FID authentication.
**Data Persistence:** SQLite via better-sqlite3 for file-based storage, with `profiles`, `daily_results`, and `streaks` tables. Active game sessions are stored in an in-memory Map.
**Anti-Cheat & Validation:** Server-side word validation against language-specific lists, feedback calculation, 6-attempt limit enforcement, idempotent TX handling.
**Business Logic:** Session-based random word selection, language-specific word lists, streak calculation (consecutive days, max streak), profile management.
**Date/Time Handling:** All server date operations use Europe/Istanbul timezone (UTC+3) for daily boundaries and word rotation, utilizing the Luxon library.

### Database Schema

-   **profiles:** Stores Farcaster user identifiers (`fid`), `created_at`, and `last_seen_at`.
-   **daily_results:** Records game outcomes per user per day, including `fid`, `yyyymmdd`, `attempts`, `won`, and `created_at`, with a unique constraint on (fid, yyyymmdd).
-   **streaks:** Tracks `current_streak`, `max_streak`, `last_played_yyyymmdd`, and `updated_at` for each user.

### API Endpoints

-   **GET /api/me:** Retrieves user stats, creates profile if new, updates `last_seen_at`.
-   **POST /api/start-game:** Initiates a new game session with a random word based on the specified language.
-   **POST /api/guess:** Validates a user's guess, provides feedback, and updates game status within the session.
-   **POST /api/complete-game:** Marks a game session as completed, validates transaction hash, and updates `daily_results` and `streaks`.
-   **GET /api/board:** Provides game board statistics for analytics.

### Authentication Flow

Farcaster SDK initializes on app load, extracts FID for authentication (or uses a development fallback), and sends FID in `x-farcaster-fid` header for all API requests. A guard screen is displayed if FID is unavailable.

### Game Flow

User loads the app, Farcaster context is initialized, and user stats are fetched. The game board is set up, and user guesses are sent to the server for validation and feedback. Upon win/loss, streaks are updated, and a modal with share options appears. Scores can be saved to the blockchain via a transaction.

## i18n Architecture

**Implementation Details:**
-   **Provider System:** I18nProvider context wraps the entire app at root level, provides `t` (translations), `tf` (translation functions), `language`, and `setLanguage()`.
-   **Translation Keys:** 130+ keys organized by component/feature (header, game, modals, leaderboard) in `client/src/lib/i18n.tsx`.
-   **Language Storage:** Persisted to localStorage as 'wordcast-language' (default: 'en'), synchronized across tabs/windows.
-   **Callback System:** Components can register callbacks via `registerLanguageChange()` to react to language switches (e.g., Game.tsx restarts game session with new language word list).
-   **Score Scoping:** LocalStorage score keys include language (`wordcast-score-${language}-${date}`) to prevent cross-contamination between languages.
-   **Live Updates:** All UI components use `t.*` keys and update immediately when language changes, no page reload required.
-   **Supported Languages:** English (en), Turkish (tr) with full modal, page, and game UI coverage.

## External Dependencies

**Farcaster Integration:**
-   `@farcaster/miniapp-sdk` for authentication and context.
-   `@farcaster/miniapp-wagmi-connector` for wallet integration.

**Database & ORM:**
-   `better-sqlite3` for synchronous SQLite operations.
-   `Drizzle Kit` for schema definition (though SQLite is currently used).

**Utility Libraries:**
-   `Luxon` for timezone-aware date operations.
-   `clsx` and `tailwind-merge` for conditional class composition.
-   `class-variance-authority` for component variant management.
-   `nanoid` for unique identifier generation.

**Type Safety:**
-   `Zod` for runtime schema validation.
-   `TypeScript` strict mode across the codebase.