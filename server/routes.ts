import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import {
  getOrCreateProfile,
  getDailyResult,
  createDailyResult,
  getOrCreateStreak,
  updateStreak,
  getBoardStats,
  getDailyLeaderboard,
  getWeeklyLeaderboard,
  getBestScoresLeaderboard,
} from "./db";
import { getTodayDateString, isConsecutiveDay, getDateStringDaysAgo } from "./lib/date";
import { getWordOfTheDay, isValidGuess, calculateFeedback, calculateScore, getRandomWord, type Language } from "./lib/words";
import { randomBytes } from "crypto";

const MAX_ATTEMPTS = 6;

interface ActiveGame {
  fid: number;
  sessionId: string;
  solution: string;
  language: Language;
  guesses: string[];
  attemptsUsed: number;
  totalScore: number;
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
  app.get("/.well-known/farcaster.json", (_req, res) => {
    res.redirect(307, "https://api.farcaster.xyz/miniapps/hosted-manifest/019a177b-f4e8-441a-3d4b-845ed29fe535");
  });

  app.get("/api/me", requireAuth, (req: AuthRequest, res: Response) => {
    const fid = req.fid!;
    const today = getTodayDateString();

    getOrCreateProfile(fid);
    const streak = getOrCreateStreak(fid);
    const todayResult = getDailyResult(fid, today);

    const remainingAttempts = todayResult ? 0 : MAX_ATTEMPTS;

    res.json({
      fid,
      streak: streak.currentStreak,
      maxStreak: streak.maxStreak,
      lastPlayed: streak.lastPlayedYyyymmdd,
      today,
      remainingAttempts,
      hasCompletedToday: !!todayResult,
    });
  });

  app.post("/api/start-game", requireAuth, (req: AuthRequest, res: Response) => {
    const fid = req.fid!;
    const { language = "en" } = req.body;
    const today = getTodayDateString();
    
    if (language !== "en" && language !== "tr") {
      res.status(400).json({ error: "Invalid language. Must be 'en' or 'tr'" });
      return;
    }
    
    const todayResult = getDailyResult(fid, today);
    if (todayResult) {
      res.status(400).json({ error: "Already completed today's game" });
      return;
    }

    activeGames.forEach((game, sid) => {
      if (game.fid === fid && game.completed) {
        activeGames.delete(sid);
      }
    });

    const sessionId = generateSessionId();
    const solution = getRandomWord(language as Language);
    
    const activeGame: ActiveGame = {
      fid,
      sessionId,
      solution,
      language: language as Language,
      guesses: [],
      attemptsUsed: 0,
      totalScore: 0,
      won: null,
      createdAt: new Date().toISOString(),
      completed: false,
    };
    
    activeGames.set(sessionId, activeGame);
    
    res.json({
      sessionId,
      maxAttempts: MAX_ATTEMPTS,
    });
  });

  app.post("/api/guess", requireAuth, (req: AuthRequest, res: Response) => {
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

    // Use Turkish locale for proper uppercase conversion (i → İ)
    const normalized = guess.toLocaleUpperCase('tr-TR').trim();

    const activeGame = activeGames.get(sessionId);

    if (!activeGame) {
      res.status(400).json({ error: "Game session not found or expired. Please start a new game." });
      return;
    }

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
    const roundScore = calculateScore(feedback, activeGame.attemptsUsed);
    activeGame.totalScore += roundScore;
    
    const won = normalized === activeGame.solution;
    const gameOver = won || activeGame.attemptsUsed >= MAX_ATTEMPTS;

    if (gameOver) {
      activeGame.won = won;
    }

    res.json({
      feedback,
      attemptsUsed: activeGame.attemptsUsed,
      won,
      remainingAttempts: MAX_ATTEMPTS - activeGame.attemptsUsed,
      gameOver,
      solution: gameOver ? activeGame.solution : undefined,
      roundScore,
      totalScore: activeGame.totalScore,
    });
  });

  app.post("/api/complete-game", requireAuth, (req: AuthRequest, res: Response) => {
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
    const todayResult = getDailyResult(fid, today);

    if (todayResult) {
      res.status(400).json({ error: "Already saved today's result" });
      return;
    }

    if (activeGame.completed) {
      const streak = getOrCreateStreak(fid);
      res.json({
        success: true,
        streak: streak.currentStreak,
        maxStreak: streak.maxStreak,
        message: "Score already saved (idempotent)",
      });
      return;
    }

    createDailyResult(fid, today, activeGame.attemptsUsed, activeGame.won, activeGame.totalScore);

    const streak = getOrCreateStreak(fid);
    let newCurrentStreak = streak.currentStreak;
    let newMaxStreak = streak.maxStreak;

    if (activeGame.won) {
      if (isConsecutiveDay(streak.lastPlayedYyyymmdd, today)) {
        newCurrentStreak = streak.currentStreak + 1;
      } else {
        newCurrentStreak = 1;
      }
      newMaxStreak = Math.max(newMaxStreak, newCurrentStreak);
    } else {
      newCurrentStreak = 0;
    }

    updateStreak(fid, newCurrentStreak, newMaxStreak, today);

    activeGame.completed = true;
    activeGame.completedAt = new Date().toISOString();

    res.json({
      success: true,
      streak: newCurrentStreak,
      maxStreak: newMaxStreak,
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

  app.get("/api/board", (req: Request, res: Response) => {
    const date = (req.query.date as string) || getTodayDateString();
    const stats = getBoardStats(date);

    res.json({
      date,
      totalPlayers: stats.totalPlayers,
      wonCount: stats.wonCount,
      lostCount: stats.lostCount,
      averageAttempts: stats.averageAttempts,
    });
  });

  app.get("/api/leaderboard/daily", (req: Request, res: Response) => {
    const date = (req.query.date as string) || getTodayDateString();
    const limit = parseInt(req.query.limit as string) || 100;
    
    const leaderboard = getDailyLeaderboard(date, limit);
    
    res.json({
      period: "daily",
      date,
      leaderboard,
    });
  });

  app.get("/api/leaderboard/weekly", (req: Request, res: Response) => {
    const today = getTodayDateString();
    const startDate = getDateStringDaysAgo(6);
    
    const limit = parseInt(req.query.limit as string) || 100;
    
    const leaderboard = getWeeklyLeaderboard(startDate, today, limit);
    
    res.json({
      period: "weekly",
      startDate,
      endDate: today,
      leaderboard,
    });
  });

  app.get("/api/leaderboard/best-scores", (req: Request, res: Response) => {
    const limit = parseInt(req.query.limit as string) || 100;
    
    const leaderboard = getBestScoresLeaderboard(limit);
    
    res.json({
      period: "all-time",
      leaderboard,
    });
  });

  app.get("/version.json", (req: Request, res: Response) => {
    res.json({ version: process.env.npm_package_version || "1.0.0" });
  });

  const httpServer = createServer(app);
  return httpServer;
}
