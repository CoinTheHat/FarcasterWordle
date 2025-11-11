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
**Internationalization (i18n):** Centralized translation system via I18nProvider context with 140+ translation keys, live language switching (TR/EN) without page reload, localStorage persistence, callback registration system for language change events, comprehensive modal and page translations including SettingsModal with language-reactive updates. Game UI fully translated including stats cards (Streak/Seri, Max/Maks, Score/Puan, Left/Kalan), input placeholder (Type.../Yaz...), submit button (Submit/Gönder), and wallet connection messages.
**Game Logic:** Client-side game state, server validation for guesses, session-based random word selection, multi-language support with language-specific word validation. Turkish word list cleaned (Nov 11, 2025) to remove inappropriate/foreign/wrong-length words and expanded to 580 allowed guesses (312 curated TARGET solutions + 268 additional valid words). English: 266 TARGET words with broader ALLOWED guess list. All words NFC normalized, 5-letter validated. Timezone handling via Luxon (Europe/Istanbul UTC+3).

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

-   **GET /api/me:** Retrieves user stats including `todayScore` from database, creates profile if new, updates `last_seen_at`. Returns FID, username, wallet, streaks, and today's score (source of truth).
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
-   **Translation Keys:** 140+ keys organized by component/feature (header, game, modals, leaderboard) in `client/src/lib/i18n.tsx`.
-   **Translation Functions:** Dynamic functions including `encouragementMessage(attempts)` that returns attempt-specific motivational messages (6 variations per language).
-   **Language Storage:** Persisted to localStorage as 'wordcast-ui-language' (default: 'en'), synchronized across tabs/windows.
-   **Callback System:** Components can register callbacks via `registerLanguageChange()` to react to language switches (e.g., Game.tsx restarts game session with new language word list).
-   **Score Scoping:** LocalStorage score keys include language (`wordcast-score-${language}-${date}`) to prevent cross-contamination between languages. Backend database is the source of truth for scores.
-   **Live Updates:** All UI components use `t.*` keys and update immediately when language changes, no page reload required.
-   **Supported Languages:** English (en), Turkish (tr) with complete coverage including game UI, stats cards, input elements, buttons, wallet messages, modals, and all user-facing text.
-   **Recent Updates:** 
    - **Nov 11, 2025:** Turkish word list cleanup and expansion - removed inappropriate/foreign/wrong-length words (CIRIT, CUCUK, BOCAK, BOSUN, etc.), fixed diacritics (PURUZ→PÜRÜZ), expanded ALLOWED_GUESSES_TR from 312 to 580 words (312 curated solutions + 268 additional valid guesses) using user-provided dictionary. Implemented proper Wordle mechanics with separate TARGET (narrow, curated) and ALLOWED (broad, validated) lists.
    - **Nov 10, 2025:** Game page fully translated - stats display cards (Streak→Seri, Max→Maks, Score→Puan, Left→Kalan), input placeholder (Type...→Yaz...), submit button (Submit→Gönder), wallet guard screen, and connection status messages now fully bilingual. Added dynamic encouragement messages in GameOverModal based on number of attempts (1-6), with different motivational copy per language.

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