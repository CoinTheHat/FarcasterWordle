# WordCast - Farcaster Daily Word Puzzle Mini-App

**Version:** 2.0.0 (November 2025)  
**Latest Feature:** Unlimited Practice Mode - Play as many times as you want! Only first game counts for leaderboards.

## Overview
WordCast is a production-ready, multi-language (Turkish/English) Wordle-style daily word game designed as a Farcaster Mini-App. It allows players to guess a 5-letter word in 6 attempts, with the word changing daily. The application supports Farcaster authentication, tracks device-independent progress and streaks, and facilitates social sharing. A robust scoring system is integrated with blockchain transactions on the Base network for saving scores to a leaderboard, enabling weekly USDC rewards for top players. The project aims to provide an engaging and competitive daily puzzle experience within the Farcaster ecosystem, leveraging blockchain for transparent rewards and score persistence.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
The frontend is built with React, TypeScript, and Vite, utilizing Wouter for routing. UI components are styled with TailwindCSS, Shadcn/ui, and Radix UI primitives, featuring custom animations. State management employs TanStack Query for server state, local React state for UI, and LocalStorage for user preferences (e.g., color-blind mode, language). Internationalization is handled via an `I18nProvider` context, supporting live language switching (TR/EN) with over 140 translation keys and persistence via localStorage. Game logic is client-side with server-side validation for guesses, supporting language-specific word lists and timezone handling (Europe/Istanbul UTC+3) via Luxon. A "Practice Mode" allows unlimited play after the first daily game, with clear UX indicators differentiating it from score-contributing games.

### Backend
The backend uses Node.js with Express, featuring custom middleware for Farcaster FID authentication. Data persistence is managed with PostgreSQL (Neon) for user profiles, daily results, streaks, weekly rewards, practice results, and **game sessions**. The system includes anti-cheat measures, server-side word validation, and idempotent transaction handling. Business logic encompasses session-based random word selection, language-specific word lists, streak calculation, and profile management. All server-side date operations use the Europe/Istanbul timezone (UTC+3) for consistent daily boundaries and word rotation. Scores are only saved to the database after a valid blockchain transaction hash is submitted, ensuring participation for leaderboard eligibility. Practice mode results are tracked separately for future analytics without affecting leaderboards or streaks.

**Anti-Exploit Measure (Session Persistence):** Daily game sessions persist to the database to prevent users from refreshing the page to get easier words. When a user starts a daily game (non-practice), the session is created in the `game_sessions` table with the selected word. On subsequent refreshes, `/api/start-game` retrieves the existing session and returns the same word along with all previous guesses and feedback. The frontend restores the game state, including guesses, colored feedback, and keyboard letter states. This ensures fair competition for weekly USDC rewards by eliminating word-cycling exploits. Practice mode sessions remain in-memory only and are not persisted.

### Database Schema
-   **profiles:** Stores Farcaster `fid`, `username`, `wallet_address`, `created_at`, `last_seen_at`.
-   **daily_results:** Records `fid`, `yyyymmdd`, `attempts`, `won`, `score`, `created_at` (unique on fid, yyyymmdd).
-   **streaks:** Tracks `current_streak`, `max_streak`, `last_played_yyyymmdd`, `updated_at`.
-   **weekly_rewards:** Logs `fid`, `week_start`, `week_end`, `rank`, `amount_usd`, `tx_hash`, `status`, `error_message`, `created_at`, `distributed_at` (unique on fid, week_start).
-   **practice_results:** Tracks `fid`, `yyyymmdd`, `attempt_number`, `attempts`, `won`, `score`, `tx_hash`, `created_at` (unique on fid, yyyymmdd, attempt_number) - stores unlimited practice games for future analytics.
-   **game_sessions:** Persists daily game sessions with `session_id`, `fid`, `yyyymmdd`, `language`, `solution`, `guesses` (JSONB array), `attempts_used`, `completed`, `won`, `created_at`, `updated_at` (unique on fid, yyyymmdd) - prevents word-cycling exploits by maintaining session state across refreshes.

### API Endpoints
-   `/api/me`: Retrieves user stats, creates/updates profile.
-   `/api/start-game`: Initiates a new game session.
-   `/api/guess`: Validates guess, provides feedback, updates session.
-   `/api/complete-game`: Finalizes game, validates transaction hash, updates database.
-   `/api/board`: Provides game board statistics.
-   `/api/admin/*`: Admin-specific endpoints for balance checking and reward distribution.

### Authentication
Farcaster SDK is used for authentication, extracting FID for all API requests via the `x-farcaster-fid` header. A guard screen is displayed if FID is unavailable.

### Weekly Reward System
The system distributes USDC rewards to the top 3 players weekly (1st: 10 USDC, 2nd: 5 USDC, 3rd: 3 USDC) based on cumulative scores from Monday to Sunday (Europe/Istanbul UTC+3). An admin panel with tabbed interface ("Distribution" and "Failed Rewards") allows manual triggering of distributions via Base network. The retry mechanism uses atomic updates (`atomicUpdateRewardToPending`) with WHERE status='failed' clause to prevent race conditions and double-payments during concurrent retry attempts. Error handling wraps blockchain transfers in try/catch blocks, reverting failed transfers back to 'failed' status with error messages to prevent rewards from being stranded in 'pending' state. Bulk retry operations process all selected rewards sequentially, collecting per-item results for partial success scenarios. The `weekly_rewards` table tracks all distributions with status transitions.

## External Dependencies

### Farcaster Integration
-   `@farcaster/miniapp-sdk`
-   `@farcaster/miniapp-wagmi-connector`

### Database
-   `better-sqlite3`

### Utility Libraries
-   `Luxon` (date/time)
-   `clsx`, `tailwind-merge`, `class-variance-authority` (styling utilities)
-   `nanoid` (ID generation)

### Type Safety
-   `Zod` (runtime schema validation)
-   `TypeScript`

### Blockchain Integration
-   `viem` (Base network interaction, USDC transfers)
-   Base USDC contract: `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`