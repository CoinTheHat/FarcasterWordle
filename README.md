# WordCast - Daily Word Puzzle Farcaster Mini-App

A production-ready Wordle-style daily word game built as a Farcaster Mini-App. Guess the 5-letter word in 6 tries, track your streak, and share your results!

## Features

✅ **Farcaster Mini-App Integration**
- Seamless authentication with Farcaster FID
- Share results directly to Farcaster
- Device-independent progress tracking

✅ **Daily Word Puzzle**
- New 5-letter word every day at midnight Istanbul time (UTC+3)
- Deterministic word selection using salted hash
- Server-side validation to prevent cheating

✅ **Streak Tracking**
- Maintain your daily streak
- Track your maximum streak
- Consecutive day logic with Istanbul timezone

✅ **Beautiful UI**
- Mobile-first responsive design
- Smooth flip animations on tile reveal
- On-screen keyboard with letter states
- Color-blind mode with patterns
- Dark mode support

✅ **Robust Backend**
- SQLite database for persistence
- In-memory active game tracking
- 6-attempt limit per day per user
- Rate limiting and validation

## Tech Stack

### Frontend
- **React** + **TypeScript** + **Vite**
- **TailwindCSS** for styling
- **@farcaster/miniapp-sdk** for Farcaster integration
- **Luxon** for timezone handling
- **Shadcn/ui** components

### Backend
- **Node.js** + **Express**
- **better-sqlite3** for database
- **Salted hash** word selection
- **Europe/Istanbul** timezone

## Getting Started

### Prerequisites
- Node.js 20+ (Replit provides this)
- Replit account
- Farcaster account for testing

### Setup

1. **Environment Variables**
   - Add `WORD_SALT` to Replit Secrets (any random string, e.g., "my-secret-salt-2025")
   - `SESSION_SECRET` is already configured

2. **Run the Application**
   ```bash
   npm run dev
   ```
   The app will start on port 5000 with hot module replacement.

3. **Build for Production**
   ```bash
   npm run build
   npm start
   ```

### Development

The project uses a single Express process that:
- Serves API endpoints under `/api/*`
- Hosts the React frontend
- Handles Vite HMR in development
- Serves static files in production

### Database

SQLite database is automatically created at `./data/app.db` on first API call.

**Tables:**
- `profiles` - Farcaster user profiles
- `daily_results` - Completed game results
- `streaks` - User streak data

### API Endpoints

- `GET /api/me` - Get user stats (streak, remaining attempts)
- `POST /api/guess` - Submit a guess
- `GET /api/board` - Get anonymized daily stats
- `GET /version.json` - App version for cache-busting

### Testing in Farcaster

1. **Enable Developer Mode** in Farcaster
   - Go to Settings → Developer Tools
   - Toggle on "Developer Mode"

2. **Add Your Mini-App**
   - Navigate to the developer section
   - Add your Replit URL as a Mini-App
   - Test within the Farcaster client

3. **Local Testing**
   - Development mode uses a mock FID (12345)
   - Test game logic without Farcaster client
   - API endpoints accessible directly

## Game Rules

1. Guess the 5-letter word in 6 tries
2. Each guess must be a valid English word
3. After each guess, tiles change color:
   - 🟩 **Green** - Correct letter in correct position
   - 🟨 **Yellow** - Correct letter in wrong position
   - ⬜ **Gray** - Letter not in the word
4. New word available daily at midnight Istanbul time
5. Keep your streak going!

## Project Structure

```
/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── lib/          # Utilities (date, words, api, fc)
│   │   └── pages/        # Game page
│   └── index.html
├── server/                # Express backend
│   ├── lib/              # Server utilities
│   ├── db.ts             # Database setup
│   ├── routes.ts         # API endpoints
│   └── index.ts          # Server entry
├── shared/               # Shared types
│   └── schema.ts
├── public/               # Static assets
│   └── version.json
└── data/                 # SQLite database (auto-created)
    └── app.db
```

## Key Features Explained

### Timezone Handling
All date operations use **Europe/Istanbul (UTC+3)** timezone:
- Daily word changes at midnight Istanbul time
- Streak calculations respect Istanbul date boundaries
- Both frontend and backend use Luxon for consistent timezone handling

### Word Selection
Daily word is selected deterministically:
```typescript
hash(WORD_SALT + YYYYMMDD_ISTANBUL) % WORD_LIST_LENGTH
```
This ensures:
- Same word for all players on a given day
- Unpredictable word sequence
- No way to predict future words

### Streak Logic
- Playing consecutive days increments streak
- Missing a day resets to 0
- Max streak is tracked separately
- Losing doesn't break streak (only missing days)

### Active Game Tracking
- Games in progress stored in memory (Map)
- Only completed games persisted to database
- Prevents duplicate results per day
- Enforces 6-attempt limit

## Security

- Server-side word validation
- Salted hash prevents word prediction
- FID-based authentication via headers
- Rate limiting via database checks
- No mock data in production paths

## Troubleshooting

### Database Not Found
Database is created on first API call. If issues persist:
```bash
rm -rf data/
# Restart the app
```

### Farcaster SDK Errors
- Ensure you're testing in Farcaster client
- Check Developer Mode is enabled
- Verify your Mini-App URL is correct

### API Errors
- Check `WORD_SALT` is set in Secrets
- Verify server is running on port 5000
- Check logs with `refresh_all_logs` tool

## Deployment

This app is designed for Replit hosting:

1. All dependencies are pre-configured
2. Database persists in `/data` directory
3. Port 5000 is automatically exposed
4. Environment variables via Replit Secrets
5. Single process handles everything

## Credits

Built with ❤️ for the Farcaster ecosystem. Inspired by the original Wordle game.

## License

MIT
