import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import {
  getOrCreateProfile,
  getDailyResult,
  createDailyResult,
  getOrCreateStreak,
  updateStreak,
  updateUsername,
  updateWalletAddress,
  getBoardStats,
  getDailyLeaderboard,
  getWeeklyLeaderboard,
  getBestScoresLeaderboard,
} from "./db";
import { getTodayDateString, isConsecutiveDay, getDateStringDaysAgo, getLastWeekDateRange } from "./lib/date";
import { getWordOfTheDay, isValidGuess, calculateFeedback, calculateWinScore, calculateLossScore, getRandomWord, type Language } from "./lib/words";
import { randomBytes } from "crypto";

const MAX_ATTEMPTS = 6;

interface ActiveGame {
  fid: number;
  sessionId: string;
  solution: string;
  language: Language;
  guesses: string[];
  attemptsUsed: number;
  won: boolean | null;
  createdAt: string;
  completed: boolean;
  completedAt?: string;
}

const activeGames = new Map<string, ActiveGame>();

function generateSessionId(): string {
  return randomBytes(16).toString("hex");
}

interface AuthRequest extends Request {
  fid?: number;
}

function extractFid(req: Request): number | null {
  const fidHeader = req.headers["x-farcaster-fid"];
  
  if (typeof fidHeader === "string") {
    const fid = parseInt(fidHeader, 10);
    return !isNaN(fid) ? fid : null;
  }
  
  if (Array.isArray(fidHeader) && fidHeader.length > 0) {
    const fid = parseInt(fidHeader[0], 10);
    return !isNaN(fid) ? fid : null;
  }

  const mockFid = process.env.NODE_ENV === "development" ? 12345 : null;
  return mockFid;
}

function requireAuth(req: AuthRequest, res: Response, next: () => void) {
  const fid = extractFid(req);
  
  if (!fid) {
    res.status(401).json({ error: "Unauthorized: No Farcaster FID found" });
    return;
  }

  req.fid = fid;
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/.well-known/farcaster.json", (req, res) => {
    const host = req.get('host') || '';
    const publicDir = process.cwd() + '/public';
    
    // Yeni domain için yeni manifest
    if (host.includes('farcasterwordle.com')) {
      res.sendFile("farcaster-new.json", { root: publicDir });
    } 
    // Eski domain için eski manifest
    else if (host.includes('replit.app')) {
      res.sendFile("farcaster-old.json", { root: publicDir });
    }
    // Fallback: yeni manifest
    else {
      res.sendFile("farcaster-new.json", { root: publicDir });
    }
  });

  app.post("/api/webhook", async (req: Request, res: Response) => {
    console.log("[Farcaster Webhook]", JSON.stringify(req.body, null, 2));
    res.json({ success: true });
  });

  app.get("/api/me", requireAuth, async (req: AuthRequest, res: Response) => {
    const fid = req.fid!;
    const today = getTodayDateString();

    const profile = await getOrCreateProfile(fid);
    const streak = await getOrCreateStreak(fid);
    const todayResult = await getDailyResult(fid, today);

    const remainingAttempts = todayResult ? 0 : MAX_ATTEMPTS;

    res.json({
      fid,
      username: profile.username,
      walletAddress: profile.walletAddress,
      streak: streak.currentStreak,
      maxStreak: streak.maxStreak,
      lastPlayed: streak.lastPlayedYyyymmdd,
      today,
      remainingAttempts,
      hasCompletedToday: !!todayResult,
    });
  });

  app.post("/api/update-username", requireAuth, async (req: AuthRequest, res: Response) => {
    const fid = req.fid!;
    const { username } = req.body;

    if (!username || typeof username !== "string") {
      res.status(400).json({ error: "Username is required" });
      return;
    }

    const trimmedUsername = username.trim();

    if (trimmedUsername.length === 0) {
      res.status(400).json({ error: "Username cannot be empty" });
      return;
    }

    if (trimmedUsername.length > 20) {
      res.status(400).json({ error: "Username must be 20 characters or less" });
      return;
    }

    // Simple validation: alphanumeric, underscores, hyphens
    if (!/^[a-zA-Z0-9_-]+$/.test(trimmedUsername)) {
      res.status(400).json({ error: "Username can only contain letters, numbers, underscores, and hyphens" });
      return;
    }

    await updateUsername(fid, trimmedUsername);

    res.json({
      success: true,
      username: trimmedUsername,
    });
  });

  app.post("/api/save-wallet", requireAuth, async (req: AuthRequest, res: Response) => {
    const fid = req.fid!;
    const { walletAddress } = req.body;

    if (!walletAddress || typeof walletAddress !== "string") {
      res.status(400).json({ error: "Wallet address is required" });
      return;
    }

    const trimmedAddress = walletAddress.trim();

    // Validate Ethereum address format (0x + 40 hex characters)
    if (!/^0x[a-fA-F0-9]{40}$/.test(trimmedAddress)) {
      res.status(400).json({ error: "Invalid Ethereum wallet address format" });
      return;
    }

    await updateWalletAddress(fid, trimmedAddress);

    res.json({
      success: true,
      walletAddress: trimmedAddress,
    });
  });

  app.post("/api/start-game", requireAuth, async (req: AuthRequest, res: Response) => {
    const fid = req.fid!;
    const { language = "en" } = req.body;
    const today = getTodayDateString();
    
    if (language !== "en" && language !== "tr") {
      res.status(400).json({ error: "Invalid language. Must be 'en' or 'tr'" });
      return;
    }
    
    // CRITICAL FIX: Block if user already has today's result (skip in development for testing)
    const todayResult = await getDailyResult(fid, today);
    if (todayResult && process.env.NODE_ENV !== 'development') {
      res.status(400).json({ error: "Already completed today's game" });
      return;
    }

    // CRITICAL FIX: Check for existing active (non-completed) session
    // This prevents multiple session exploit
    let existingSession: ActiveGame | undefined;
    let existingSessionId: string | undefined;
    
    activeGames.forEach((game, sid) => {
      if (game.fid === fid) {
        if (game.completed) {
          // Clean up completed sessions
          activeGames.delete(sid);
        } else if (!existingSession) {
          // Found active session - reuse it (only set first match)
          existingSession = game;
          existingSessionId = sid;
        }
      }
    });

    // If active session exists, validate it's for today AND same language before reusing
    if (existingSession && existingSessionId) {
      // CRITICAL FIX: Check if session is from today
      // If session is stale (from previous day), delete it and create new one
      const sessionDate = existingSession.createdAt ? existingSession.createdAt.substring(0, 10).replace(/-/g, '') : '';
      
      if (sessionDate === today && existingSession.language === language) {
        // Session is from today and same language, safe to reuse
        res.json({
          sessionId: existingSessionId,
          maxAttempts: MAX_ATTEMPTS,
          resumed: true,
        });
        return;
      } else {
        // Stale session or different language, delete and create new
        activeGames.delete(existingSessionId);
      }
    }

    const sessionId = generateSessionId();
    const solution = getRandomWord(language as Language);
    
    const activeGame: ActiveGame = {
      fid,
      sessionId,
      solution,
      language: language as Language,
      guesses: [],
      attemptsUsed: 0,
      won: null,
      createdAt: new Date().toISOString(),
      completed: false,
    };
    
    activeGames.set(sessionId, activeGame);
    
    res.json({
      sessionId,
      maxAttempts: MAX_ATTEMPTS,
      ...(process.env.NODE_ENV === 'development' ? { solution } : {}),
    });
  });

  app.post("/api/guess", requireAuth, async (req: AuthRequest, res: Response) => {
    const fid = req.fid!;
    const { guess, sessionId } = req.body;

    if (!guess || typeof guess !== "string") {
      res.status(400).json({ error: "Invalid guess" });
      return;
    }

    if (!sessionId || typeof sessionId !== "string") {
      res.status(400).json({ error: "Invalid session" });
      return;
    }

    const activeGame = activeGames.get(sessionId);

    if (!activeGame) {
      res.status(400).json({ error: "Game session not found or expired. Please start a new game." });
      return;
    }

    // Use language-aware normalization (Turkish locale for tr, standard for en)
    const normalized = activeGame.language === 'tr' 
      ? guess.toLocaleUpperCase('tr-TR').trim()
      : guess.toUpperCase().trim();

    // Accept any 5-letter word with Turkish characters (Ç, Ğ, İ, Ö, Ş, Ü)
    if (normalized.length !== 5 || !/^[A-ZÇĞİÖŞÜ]{5}$/.test(normalized)) {
      res.status(400).json({ error: "Must be 5 letters (A-Z or Turkish characters)" });
      return;
    }

    if (activeGame.fid !== fid) {
      res.status(403).json({ error: "Unauthorized" });
      return;
    }

    if (activeGame.attemptsUsed >= MAX_ATTEMPTS) {
      res.status(400).json({ error: "No attempts remaining" });
      return;
    }

    activeGame.guesses.push(normalized);
    activeGame.attemptsUsed++;

    const feedback = calculateFeedback(normalized, activeGame.solution);
    
    const won = normalized === activeGame.solution;
    const gameOver = won || activeGame.attemptsUsed >= MAX_ATTEMPTS;
    
    // Calculate final score: win score (with multiplier) or loss score (no multiplier)
    let finalScore = 0;
    if (won) {
      finalScore = calculateWinScore(activeGame.attemptsUsed);
    } else if (gameOver) {
      // Player lost but gets points based on their last attempt (green/yellow tiles)
      finalScore = calculateLossScore(feedback);
    }

    // CRITICAL FIX: Check if result already saved (multi-session protection)
    const today = getTodayDateString();
    const existingResult = await getDailyResult(fid, today);
    
    if (existingResult) {
      // User already completed today's game in another session
      res.status(400).json({ 
        error: "Already completed today's game",
        gameOver: true,
      });
      return;
    }

    if (gameOver) {
      activeGame.won = won;
      
      // CRITICAL FIX: Save game result immediately when game ends
      // Use try-catch to handle unique constraint violations gracefully
      try {
        await createDailyResult(fid, today, activeGame.attemptsUsed, won, finalScore);
        
        // Update streak (based on consecutive days played, not won)
        const streak = await getOrCreateStreak(fid);
        let newCurrentStreak = streak.currentStreak;
        let newMaxStreak = streak.maxStreak;

        if (isConsecutiveDay(streak.lastPlayedYyyymmdd, today)) {
          newCurrentStreak = streak.currentStreak + 1;
        } else {
          newCurrentStreak = 1;
        }
        newMaxStreak = Math.max(newMaxStreak, newCurrentStreak);

        await updateStreak(fid, newCurrentStreak, newMaxStreak, today);
      } catch (error: any) {
        // If unique constraint violation, game was already saved (race condition)
        // This is fine - just continue
        if (error?.code !== '23505') {
          throw error;
        }
      }
      
      // CRITICAL FIX: Mark session as completed to prevent stale session reuse
      activeGame.completed = true;
      activeGame.completedAt = new Date().toISOString();
    }

    res.json({
      feedback,
      attemptsUsed: activeGame.attemptsUsed,
      won,
      remainingAttempts: MAX_ATTEMPTS - activeGame.attemptsUsed,
      gameOver,
      solution: gameOver ? activeGame.solution : undefined,
      ...(gameOver ? { score: finalScore } : {}),
    });
  });

  app.post("/api/complete-game", requireAuth, async (req: AuthRequest, res: Response) => {
    const fid = req.fid!;
    const { sessionId, txHash } = req.body;

    if (!sessionId || typeof sessionId !== "string") {
      res.status(400).json({ error: "Invalid session" });
      return;
    }

    if (!txHash || typeof txHash !== "string") {
      res.status(400).json({ error: "Transaction hash is required" });
      return;
    }

    const txHashRegex = /^0x[a-fA-F0-9]{64}$/;
    if (!txHashRegex.test(txHash)) {
      res.status(400).json({ error: "Invalid transaction hash format" });
      return;
    }

    const activeGame = activeGames.get(sessionId);

    if (!activeGame) {
      res.status(400).json({ error: "Game session not found or expired. Please start a new game." });
      return;
    }

    if (activeGame.fid !== fid) {
      res.status(403).json({ error: "Unauthorized" });
      return;
    }

    if (activeGame.won === null) {
      res.status(400).json({ error: "Game not completed" });
      return;
    }

    const today = getTodayDateString();
    const todayResult = await getDailyResult(fid, today);

    // Result is now saved during /api/guess when game ends
    // This endpoint just marks TX as completed
    if (!todayResult) {
      res.status(400).json({ error: "No game result found for today" });
      return;
    }

    if (activeGame.completed) {
      // Idempotent: already marked as completed
      const streak = await getOrCreateStreak(fid);
      res.json({
        success: true,
        streak: streak.currentStreak,
        maxStreak: streak.maxStreak,
        message: "Score already saved (idempotent)",
      });
      return;
    }

    // Mark session as completed (TX successful)
    const streak = await getOrCreateStreak(fid);
    activeGame.completed = true;
    activeGame.completedAt = new Date().toISOString();

    res.json({
      success: true,
      streak: streak.currentStreak,
      maxStreak: streak.maxStreak,
    });
  });

  app.get("/api/hint", requireAuth, (req: AuthRequest, res: Response) => {
    const { sessionId } = req.query;
    
    if (!sessionId || typeof sessionId !== "string") {
      res.status(400).json({ error: "Invalid session" });
      return;
    }

    const activeGame = activeGames.get(sessionId);
    
    if (!activeGame) {
      res.status(400).json({ error: "Game session not found or expired. Please start a new game." });
      return;
    }
    
    const solution = activeGame.solution;
    const randomPosition = Math.floor(Math.random() * 5);
    const letter = solution[randomPosition];
    
    res.json({
      position: randomPosition,
      letter,
      hint: `The letter at position ${randomPosition + 1} is "${letter}"`
    });
  });

  app.get("/api/board", async (req: Request, res: Response) => {
    const date = (req.query.date as string) || getTodayDateString();
    const stats = await getBoardStats(date);

    res.json({
      date,
      totalPlayers: stats.totalPlayers,
      wonCount: stats.wonCount,
      lostCount: stats.lostCount,
      averageAttempts: stats.averageAttempts,
    });
  });

  app.get("/api/leaderboard/daily", async (req: Request, res: Response) => {
    const date = (req.query.date as string) || getTodayDateString();
    const limit = parseInt(req.query.limit as string) || 100;
    
    const leaderboard = await getDailyLeaderboard(date, limit);
    
    res.json({
      period: "daily",
      date,
      leaderboard,
    });
  });

  app.get("/api/leaderboard/weekly", async (req: Request, res: Response) => {
    const today = getTodayDateString();
    const startDate = getDateStringDaysAgo(6);
    
    const limit = parseInt(req.query.limit as string) || 100;
    
    const leaderboard = await getWeeklyLeaderboard(startDate, today, limit);
    
    res.json({
      period: "weekly",
      startDate,
      endDate: today,
      leaderboard,
    });
  });

  app.get("/api/leaderboard/best-scores", async (req: Request, res: Response) => {
    const limit = parseInt(req.query.limit as string) || 100;
    
    const leaderboard = await getBestScoresLeaderboard(limit);
    
    res.json({
      period: "all-time",
      leaderboard,
    });
  });

  app.get("/api/leaderboard/last-week-winners", async (req: Request, res: Response) => {
    const { startDate, endDate } = getLastWeekDateRange();
    
    const leaderboard = await getWeeklyLeaderboard(startDate, endDate, 3);
    
    res.json({
      period: "last-week",
      startDate,
      endDate,
      leaderboard: leaderboard.filter(entry => entry.rank <= 3),
    });
  });

  app.get("/version.json", (req: Request, res: Response) => {
    res.json({ version: process.env.npm_package_version || "1.0.0" });
  });

  const httpServer = createServer(app);
  return httpServer;
}
