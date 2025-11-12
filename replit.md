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
-   **weekly_rewards:** Tracks weekly reward distributions including `fid`, `week_start`, `week_end`, `rank`, `amount_usd`, `tx_hash`, `status`, `memo`, and `created_at`, with a unique constraint on (fid, week_start).

### API Endpoints

-   **GET /api/me:** Retrieves user stats including `todayScore` from database, creates profile if new, updates `last_seen_at`. Returns FID, username, wallet, streaks, and today's score (source of truth).
-   **POST /api/start-game:** Initiates a new game session with a random word based on the specified language.
-   **POST /api/guess:** Validates a user's guess, provides feedback, and updates game status within the session.
-   **POST /api/complete-game:** Marks a game session as completed, validates transaction hash, and updates `daily_results` and `streaks`.
-   **GET /api/board:** Provides game board statistics for analytics.
-   **GET /api/admin/balance:** Retrieves USDC balance of sponsor wallet (requires `x-admin-token` header).
-   **POST /api/admin/distribute-weekly-rewards:** Calculates top 3 players from previous week and distributes USDC rewards (requires `x-admin-token` header, manual trigger only).

### Authentication Flow

Farcaster SDK initializes on app load, extracts FID for authentication (or uses a development fallback), and sends FID in `x-farcaster-fid` header for all API requests. A guard screen is displayed if FID is unavailable.

### Game Flow

User loads the app, Farcaster context is initialized, and user stats are fetched. The game board is set up, and user guesses are sent to the server for validation and feedback. Upon win/loss, game results are stored in session memory (not database). A modal appears with share options and blockchain TX requirement. **Scores are ONLY saved to database after valid transaction hash submission** to `/api/complete-game` endpoint. This prevents users from earning weekly rewards without blockchain participation.

### Score Persistence Security

**TX-Gated Score Saving (Nov 12, 2025):**
-   **Problem:** Users could earn weekly USDC rewards without blockchain participation
-   **Solution:** Scores only saved to `daily_results` and `streaks` tables after TX hash validation
-   **Architecture:**
    -   `/api/guess`: Validates guesses, calculates score, stores result in session memory ONLY
    -   `/api/complete-game`: Requires valid TX hash, then saves score to database
    -   GameOverModal: Prevents modal close without TX submission, shows bilingual warning
-   **TX Validation:** Format validation (`0x` + 64 hex characters) provides strong protection against casual exploitation
-   **Security Trade-off:** TX hash format validated but NOT verified on-chain for performance/simplicity
    -   Sophisticated attackers could generate fake TX hashes
    -   Acceptable risk: Most users submit genuine transactions
    -   Future enhancement: Add Base RPC verification if fraud becomes significant
-   **UX Protection:** Modal close blocked until TX submitted, animated warning in both languages
-   **Idempotency:** Duplicate TX hash submissions prevented by unique database constraint

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
    - **Nov 11, 2025:** 
      - Turkish word list cleanup and expansion - removed inappropriate/foreign/wrong-length words (CIRIT, CUCUK, BOCAK, BOSUN, etc.), fixed diacritics (PURUZ→PÜRÜZ), expanded ALLOWED_GUESSES_TR from 312 to 580 words (312 curated solutions + 268 additional valid guesses) using user-provided dictionary. Implemented proper Wordle mechanics with separate TARGET (narrow, curated) and ALLOWED (broad, validated) lists.
      - Farcaster share link fix - added embeds[] parameter to Warpcast compose URL (https://warpcast.com/~/compose?text=...&embeds[]=https://farcasterwordle.com/) to enable miniapp recognition instead of plain text link.
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

**Blockchain Integration:**
-   `viem` for Base network interaction and USDC transfers.
-   Base USDC contract: `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`.

## Weekly Reward System

**Overview:** WordCast distributes weekly USDC rewards to the top 3 players every Monday based on the previous week's cumulative scores (Monday-Sunday).

**Reward Structure:**
-   1st Place: 10 USDC ($10)
-   2nd Place: 5 USDC ($5)
-   3rd Place: 3 USDC ($3)

**Architecture:**

### Leaderboard Calculation
-   **Time Period:** Monday 00:00 - Sunday 23:59 (Europe/Istanbul UTC+3)
-   **Scoring Method:** Sum of all daily scores for the week (not best single score)
-   **Eligibility:** Must have valid Farcaster wallet address registered
-   **Ranking:** Ties broken by earliest game completion timestamp

### Distribution Flow
1. Admin accesses `/admin` panel using `ADMIN_SECRET_TOKEN`
2. Views previous week's top 3 leaderboard
3. Checks sponsor wallet USDC balance
4. Manually triggers "Distribute Last Week Rewards" button
5. Backend sends USDC transfers to winner wallets via Base network
6. Transaction hashes recorded in `weekly_rewards` table
7. Status tracking: `pending` → `sent` (or `failed` for errors)

### Retry Mechanism
-   Failed transfers can be retried via same button
-   Only rewards with status `sent` are skipped
-   Statuses: `pending`, `sent`, `failed`, `retry_success`, `retry_failed`, `already_sent`

### Security & Configuration
-   **ADMIN_SECRET_TOKEN:** Secret password for admin panel access (user-defined)
-   **SPONSOR_WALLET_PRIVATE_KEY:** Private key for wallet holding USDC on Base network
-   **Memo Storage:** Transfer memos stored in database (format: "Rank #N - Week [dates]")
-   **Idempotency:** Unique constraint on (fid, week_start) prevents duplicate distributions

### Admin Panel Features
-   URL: `https://farcasterwordle.com/admin`
-   USDC balance checker
-   Previous week leaderboard preview
-   Manual distribution trigger with confirmation
-   Distribution history viewer
-   Retry failed transfers

### Technical Implementation
-   **Blockchain Library:** viem for ERC20 USDC transfers
-   **USDC Decimals:** 6 (standard for USDC on Base)
-   **Network:** Base mainnet (Chain ID: 8453)
-   **RPC:** `https://mainnet.base.org` (configurable via `BASE_RPC_URL`)
-   **Transfer Method:** `writeContract` with USDC ERC20 `transfer` function

### Recent Updates
-   **Nov 12, 2025:** 
    - **Security Enhancement:** Implemented TX-gated score saving - scores now only persist to database after valid transaction hash submission to prevent USDC reward fraud. Format validation provides strong protection against casual exploitation while maintaining performance.
    - **Admin Panel Optimization:** Added 500ms debounce and 10-character minimum to token input, preventing excessive API calls during typing.
    - **Reward Migration:** Migrated from ETH to USDC for exact dollar-value guarantees. USDC is a stablecoin (1 USDC = $1) eliminating price volatility concerns. Admin panel updated to show USDC balances and amounts.