import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import {
  getOrCreateProfile,
  getDailyResult,
  createDailyResult,
  getOrCreateStreak,
  updateStreak,
  getBoardStats,
} from "./db";
import { getTodayDateString, isConsecutiveDay } from "./lib/date";
import { getWordOfTheDay, isValidGuess, calculateFeedback, calculateScore } from "./lib/words";

const MAX_ATTEMPTS = 6;

interface ActiveGame {
  fid: number;
  date: string;
  guesses: string[];
  attemptsUsed: number;
  totalScore: number;
}

const activeGames = new Map<string, ActiveGame>();

function getGameKey(fid: number, date: string): string {
  return `${fid}-${date}`;
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
  app.get("/api/me", requireAuth, (req: AuthRequest, res: Response) => {
    const fid = req.fid!;
    const today = getTodayDateString();

    getOrCreateProfile(fid);
    const streak = getOrCreateStreak(fid);
    const todayResult = getDailyResult(fid, today);

    const remainingAttempts = todayResult ? MAX_ATTEMPTS - todayResult.attempts : MAX_ATTEMPTS;

    res.json({
      fid,
      streak: streak.currentStreak,
      maxStreak: streak.maxStreak,
      lastPlayed: streak.lastPlayedYyyymmdd,
      today,
      remainingAttempts,
    });
  });

  app.post("/api/guess", requireAuth, (req: AuthRequest, res: Response) => {
    const fid = req.fid!;
    const { guess } = req.body;

    if (!guess || typeof guess !== "string") {
      res.status(400).json({ error: "Invalid guess" });
      return;
    }

    const normalized = guess.toUpperCase().trim();

    if (!isValidGuess(normalized)) {
      res.status(400).json({ error: "Not a valid word" });
      return;
    }

    const today = getTodayDateString();
    const solution = getWordOfTheDay(today);
    
    const todayResult = getDailyResult(fid, today);

    if (todayResult) {
      res.status(400).json({ error: "Already completed today's game" });
      return;
    }

    const gameKey = getGameKey(fid, today);
    let activeGame = activeGames.get(gameKey);

    if (!activeGame) {
      activeGame = {
        fid,
        date: today,
        guesses: [],
        attemptsUsed: 0,
        totalScore: 0,
      };
      activeGames.set(gameKey, activeGame);
    }

    if (activeGame.attemptsUsed >= MAX_ATTEMPTS) {
      res.status(400).json({ error: "No attempts remaining" });
      return;
    }

    activeGame.guesses.push(normalized);
    activeGame.attemptsUsed++;

    const feedback = calculateFeedback(normalized, solution);
    const roundScore = calculateScore(feedback, activeGame.attemptsUsed);
    activeGame.totalScore += roundScore;
    
    const won = normalized === solution;
    const gameOver = won || activeGame.attemptsUsed >= MAX_ATTEMPTS;

    if (gameOver) {
      createDailyResult(fid, today, activeGame.attemptsUsed, won);

      const streak = getOrCreateStreak(fid);
      let newCurrentStreak = streak.currentStreak;
      let newMaxStreak = streak.maxStreak;

      if (won) {
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

      activeGames.delete(gameKey);
    }

    res.json({
      feedback,
      attemptsUsed: activeGame.attemptsUsed,
      won,
      remainingAttempts: MAX_ATTEMPTS - activeGame.attemptsUsed,
      gameOver,
      solution: gameOver ? solution : undefined,
      roundScore,
      totalScore: activeGame.totalScore,
    });
  });

  app.get("/api/hint", requireAuth, (req: AuthRequest, res: Response) => {
    const today = getTodayDateString();
    const solution = getWordOfTheDay(today);
    
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

  app.get("/version.json", (req: Request, res: Response) => {
    res.json({ version: process.env.npm_package_version || "1.0.0" });
  });

  const httpServer = createServer(app);
  return httpServer;
}
