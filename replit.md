# WordCast - Farcaster Daily Word Puzzle Mini-App

## Overview
WordCast is a production-ready, multi-language (Turkish/English) Wordle-style daily word game designed as a Farcaster Mini-App. It allows players to guess a 5-letter word in 6 attempts, with the word changing daily. The application supports Farcaster authentication, tracks device-independent progress and streaks, and facilitates social sharing. A robust scoring system is integrated with blockchain transactions on the Base network for saving scores to a leaderboard, enabling weekly USDC rewards for top players. The project aims to provide an engaging and competitive daily puzzle experience within the Farcaster ecosystem, leveraging blockchain for transparent rewards and score persistence.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
The frontend is built with React, TypeScript, and Vite, utilizing Wouter for routing. UI components are styled with TailwindCSS, Shadcn/ui, and Radix UI primitives, featuring custom animations. State management employs TanStack Query for server state, local React state for UI, and LocalStorage for user preferences (e.g., color-blind mode, language). Internationalization is handled via an `I18nProvider` context, supporting live language switching (TR/EN) with over 140 translation keys and persistence via localStorage. Game logic is client-side with server-side validation for guesses, supporting language-specific word lists and timezone handling (Europe/Istanbul UTC+3) via Luxon. A "Practice Mode" allows unlimited play after the first daily game, with clear UX indicators differentiating it from score-contributing games.

### Backend
The backend uses Node.js with Express, featuring custom middleware for Farcaster FID authentication. Data persistence is managed with SQLite (`better-sqlite3`) for user profiles, daily results, and streaks, while active game sessions are stored in an in-memory Map. The system includes anti-cheat measures, server-side word validation, and idempotent transaction handling. Business logic encompasses session-based random word selection, language-specific word lists, streak calculation, and profile management. All server-side date operations use the Europe/Istanbul timezone (UTC+3) for consistent daily boundaries and word rotation. Scores are only saved to the database after a valid blockchain transaction hash is submitted, ensuring participation for leaderboard eligibility.

### Database Schema
-   **profiles:** Stores Farcaster `fid`, `created_at`, `last_seen_at`.
-   **daily_results:** Records `fid`, `yyyymmdd`, `attempts`, `won`, `created_at` (unique on fid, yyyymmdd).
-   **streaks:** Tracks `current_streak`, `max_streak`, `last_played_yyyymmdd`, `updated_at`.
-   **weekly_rewards:** Logs `fid`, `week_start`, `week_end`, `rank`, `amount_usd`, `tx_hash`, `status`, `memo`, `created_at` (unique on fid, week_start).

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
The system distributes USDC rewards to the top 3 players weekly (1st: 10 USDC, 2nd: 5 USDC, 3rd: 3 USDC) based on cumulative scores from Monday to Sunday (Europe/Istanbul UTC+3). An admin panel allows manual triggering of distributions, which are sent via the Base network. Failed transfers can be retried, and a `weekly_rewards` table tracks all distributions.

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