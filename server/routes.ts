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
  createWeeklyReward,
  updateWeeklyRewardStatus,
  getWeeklyReward,
  getPendingWeeklyRewards,
  getWeeklyRewardsHistory,
  getFailedWeeklyRewards,
  getWeeklyRewardById,
  atomicUpdateRewardToPending,
  getPracticeResultCount,
  createPracticeResult,
  createGameSession,
  getGameSession,
  getTodayGameSession,
  updateGameSessionGuess,
  completeGameSession,
} from "./db";
import { getTodayDateString, isConsecutiveDay, getDateStringDaysAgo, getLastWeekDateRange, getCurrentWeekDateRange } from "./lib/date";
import { getWordOfTheDay, isValidGuess, calculateFeedback, calculateWinScore, calculateLossScore, getRandomWord, type Language } from "./lib/words";
import { randomBytes } from "crypto";
import { sendReward, getWalletBalance } from "./lib/blockchain";

const MAX_ATTEMPTS = 6;

interface ActiveGame {
  fid: number;
  sessionId: string;
  solution: string;
  language: Language;
  guesses: string[];
  attemptsUsed: number;
  won: boolean | null;
  finalScore?: number;
  createdAt: string;
  completed: boolean;
  completedAt?: string;
  isPracticeMode: boolean;
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

function requireAdminAuth(req: Request, res: Response, next: () => void) {
  const adminToken = req.headers["x-admin-token"];
  const expectedToken = process.env.ADMIN_SECRET_TOKEN;

  if (!expectedToken) {
    res.status(500).json({ error: "Admin authentication not configured" });
    return;
  }

  if (adminToken !== expectedToken) {
    res.status(403).json({ error: "Forbidden: Invalid admin token" });
    return;
  }

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
      todayScore: todayResult?.score || 0,
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
    
    // Check if user already completed today's game
    const todayResult = await getDailyResult(fid, today);
    const isPracticeMode = !!todayResult; // Practice mode enabled after first daily game completion

    // ANTI-EXPLOIT FIX: For daily games, use database persistence to prevent refresh exploit
    if (!isPracticeMode) {
      // Check database for existing session for today
      const existingDbSession = await getTodayGameSession(fid, today);
      
      if (existingDbSession) {
        // Found existing session in DB - return it (same word even after refresh!)
        // CRITICAL FIX: Restore won/finalScore from persisted guesses to prevent completion blocking
        const rawGuesses = existingDbSession.guesses || [];
        const rawSolution = existingDbSession.solution;
        const attemptsUsed = existingDbSession.attemptsUsed;
        const lang = existingDbSession.language as Language;
        
        // Normalize guesses AND solution with identical locale rules for accurate win detection
        const guesses = rawGuesses.map(g => 
          lang === 'tr' ? g.toLocaleUpperCase('tr-TR') : g.toUpperCase()
        );
        const solution = lang === 'tr' 
          ? rawSolution.toLocaleUpperCase('tr-TR') 
          : rawSolution.toUpperCase();
        
        // Check if player already won (solution is in normalized guesses)
        const hasWon = guesses.includes(solution);
        const gameOver = hasWon || attemptsUsed >= MAX_ATTEMPTS;
        
        // Recalculate final score from persisted state
        let finalScore: number | undefined;
        let won: boolean | null = null;
        
        if (hasWon) {
          won = true;
          finalScore = calculateWinScore(attemptsUsed);
        } else if (gameOver && guesses.length > 0) {
          // Player lost - calculate loss score from last guess (only if guesses exist)
          won = false;
          const lastGuess = guesses[guesses.length - 1];
          const feedback = calculateFeedback(lastGuess, solution);
          finalScore = calculateLossScore(feedback);
        } else if (gameOver) {
          // Edge case: game over but no guesses (corruption) - default to 0
          won = false;
          finalScore = 0;
        }
        
        // Also add to in-memory cache for faster lookups
        const activeGame: ActiveGame = {
          fid: existingDbSession.fid,
          sessionId: existingDbSession.sessionId,
          solution: existingDbSession.solution,
          language: lang,
          guesses,
          attemptsUsed,
          won,
          finalScore,
          createdAt: existingDbSession.createdAt.toISOString(),
          completed: existingDbSession.completed,
          isPracticeMode: false,
        };
        
        activeGames.set(existingDbSession.sessionId, activeGame);
        
        // Generate feedback for each persisted guess to restore UI state
        const guessHistory = guesses.map(guess => ({
          guess,
          feedback: calculateFeedback(guess, solution),
        }));
        
        // Check if TX was already submitted (score saved to daily_results)
        const txSubmitted = !!todayResult; // If daily_results exists, TX was submitted
        
        res.json({
          sessionId: existingDbSession.sessionId,
          maxAttempts: MAX_ATTEMPTS,
          isPracticeMode: false,
          resumed: true,
          guesses: guessHistory,
          attemptsUsed,
          txSubmitted, // NEW: Tell frontend if TX already submitted
          ...(gameOver ? { 
            won,
            gameOver: true,
            solution,
            score: finalScore 
          } : {}),
          ...(process.env.NODE_ENV === 'development' ? { solution: existingDbSession.solution } : {}),
        });
        return;
      }
      
      // No existing session - create new one and save to DB
      const sessionId = generateSessionId();
      const solution = getRandomWord(language as Language);
      
      // Save to database for persistence across refreshes
      await createGameSession(sessionId, fid, today, solution, language, false);
      
      // Also add to in-memory cache
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
        isPracticeMode: false,
      };
      
      activeGames.set(sessionId, activeGame);
      
      res.json({
        sessionId,
        maxAttempts: MAX_ATTEMPTS,
        isPracticeMode: false,
        ...(process.env.NODE_ENV === 'development' ? { solution } : {}),
      });
      return;
    }

    // PRACTICE MODE: Use in-memory sessions (old logic)
    let existingSession: ActiveGame | undefined;
    let existingSessionId: string | undefined;
    
    activeGames.forEach((game, sid) => {
      if (game.fid === fid && game.isPracticeMode) {
        // Clean up completed or used-up sessions
        if (game.completed || game.attemptsUsed >= MAX_ATTEMPTS) {
          activeGames.delete(sid);
        } else if (!existingSession) {
          existingSession = game;
          existingSessionId = sid;
        }
      }
    });

    if (existingSession && existingSessionId) {
      const sessionDate = existingSession.createdAt ? existingSession.createdAt.substring(0, 10).replace(/-/g, '') : '';
      
      if (sessionDate === today && existingSession.language === language) {
        res.json({
          sessionId: existingSessionId,
          maxAttempts: MAX_ATTEMPTS,
          isPracticeMode: true,
          resumed: true,
        });
        return;
      } else {
        activeGames.delete(existingSessionId);
      }
    }

    // Create new practice session (in-memory only)
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
      isPracticeMode: true,
    };
    
    activeGames.set(sessionId, activeGame);
    
    res.json({
      sessionId,
      maxAttempts: MAX_ATTEMPTS,
      isPracticeMode: true,
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

    // ANTI-EXPLOIT: Sync daily game sessions to database after each guess
    if (!activeGame.isPracticeMode) {
      await updateGameSessionGuess(sessionId, activeGame.guesses, activeGame.attemptsUsed);
    }

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

    if (gameOver) {
      activeGame.won = won;
      activeGame.finalScore = finalScore;
    }

    res.json({
      feedback,
      attemptsUsed: activeGame.attemptsUsed,
      won,
      remainingAttempts: MAX_ATTEMPTS - activeGame.attemptsUsed,
      gameOver,
      solution: gameOver ? activeGame.solution : undefined,
      isPracticeMode: activeGame.isPracticeMode,
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
    const finalScore = activeGame.finalScore || 0;
    
    // CRITICAL: Re-validate isPracticeMode against current DB state
    // This prevents stale flags from discarding legitimate daily wins
    const existingResult = await getDailyResult(fid, today);
    const actualIsPracticeMode = !!existingResult && activeGame.isPracticeMode;
    
    // PRACTICE MODE: Validate TX and save to practice_results (for future analytics)
    if (actualIsPracticeMode) {
      const streak = await getOrCreateStreak(fid);
      
      // Save practice result to database
      try {
        const practiceCount = await getPracticeResultCount(fid, today);
        const attemptNumber = practiceCount + 1;
        
        await createPracticeResult(
          fid,
          today,
          attemptNumber,
          activeGame.attemptsUsed,
          activeGame.won,
          finalScore,
          txHash
        );
      } catch (practiceErr) {
        console.error("Failed to save practice result:", practiceErr);
        // Continue anyway - practice results are optional for now
      }
      
      // Mark session as completed
      activeGame.completed = true;
      activeGame.completedAt = new Date().toISOString();
      
      res.json({
        success: true,
        isPracticeMode: true,
        streak: streak.currentStreak,
        maxStreak: streak.maxStreak,
        message: "Practice mode - TX validated but score not saved (already played today)",
      });
      return;
    }
    
    // Safety check: duplicate result (race condition or server restart)
    if (existingResult) {
      const streak = await getOrCreateStreak(fid);
      res.json({
        success: true,
        isPracticeMode: true,
        streak: streak.currentStreak,
        maxStreak: streak.maxStreak,
        message: "Duplicate: Score already saved today (ranked game completed earlier)",
      });
      return;
    }

    // SECURITY FIX: Save score ONLY after TX validation
    
    try {
      await createDailyResult(fid, today, activeGame.attemptsUsed, activeGame.won, finalScore);
      
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

      // Mark session as completed in database and memory
      activeGame.completed = true;
      activeGame.completedAt = new Date().toISOString();
      await completeGameSession(sessionId);

      res.json({
        success: true,
        streak: newCurrentStreak,
        maxStreak: newMaxStreak,
      });
    } catch (error: any) {
      // Handle unique constraint violation (race condition)
      if (error?.code === '23505') {
        const streak = await getOrCreateStreak(fid);
        res.json({
          success: true,
          isPracticeMode: true,
          streak: streak.currentStreak,
          maxStreak: streak.maxStreak,
          message: "Practice mode - score already saved (race condition)",
        });
      } else {
        throw error;
      }
    }
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
    const { startDate, endDate } = getCurrentWeekDateRange();
    
    const limit = parseInt(req.query.limit as string) || 100;
    
    const leaderboard = await getWeeklyLeaderboard(startDate, endDate, limit);
    
    res.json({
      period: "weekly",
      startDate,
      endDate,
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

  app.get("/api/leaderboard/current-week-winners", async (req: Request, res: Response) => {
    const { startDate, endDate } = getCurrentWeekDateRange();
    
    const allEntries = await getWeeklyLeaderboard(startDate, endDate, 100);
    const topThree = allEntries.filter(entry => {
      const hasWallet = (entry as any).walletAddress;
      return entry.rank <= 3 && hasWallet;
    });
    
    res.json({
      period: "current-week",
      startDate,
      endDate,
      leaderboard: topThree,
    });
  });

  async function calculateWeeklyRewards(startDate: string, endDate: string) {
    const weekStartFormatted = startDate.slice(0, 4) + '-' + startDate.slice(4, 6) + '-' + startDate.slice(6, 8);
    const weekEndFormatted = endDate.slice(0, 4) + '-' + endDate.slice(4, 6) + '-' + endDate.slice(6, 8);
    
    const leaderboard = await getWeeklyLeaderboard(startDate, endDate, 100);
    const rewardAmounts = [10, 5, 3];
    
    const topThreeWithWallets = leaderboard.filter(entry => entry.rank <= 3 && entry.walletAddress).slice(0, 3);
    const topThreeWithoutWallets = leaderboard.filter(entry => entry.rank <= 3 && !entry.walletAddress);
    
    const winners = topThreeWithWallets.map((winner) => ({
      fid: winner.fid,
      username: winner.username,
      walletAddress: winner.walletAddress,
      rank: winner.rank,
      totalScore: winner.score,
      rewardAmountUsd: rewardAmounts[winner.rank - 1],
      missingWallet: false,
    }));
    
    const missingWallets = topThreeWithoutWallets.map((winner) => ({
      fid: winner.fid,
      username: winner.username,
      walletAddress: null,
      rank: winner.rank,
      totalScore: winner.score,
      rewardAmountUsd: rewardAmounts[winner.rank - 1],
      missingWallet: true,
    }));
    
    const topThreeWithWalletsCheck = topThreeWithWallets.slice(0, 3);
    const distributionChecks = await Promise.all(
      topThreeWithWalletsCheck.map(w => getWeeklyReward(w.fid, weekStartFormatted))
    );
    const alreadyDistributed = distributionChecks.some(r => r && r.status === 'sent');
    
    return {
      weekStart: weekStartFormatted,
      weekEnd: weekEndFormatted,
      winners,
      missingWallets,
      alreadyDistributed,
    };
  }

  app.get("/api/admin/preview-weekly-rewards", requireAdminAuth, async (req: Request, res: Response) => {
    try {
      const { startDate, endDate } = getLastWeekDateRange();
      const preview = await calculateWeeklyRewards(startDate, endDate);
      res.json(preview);
    } catch (error: any) {
      console.error("Preview error:", error);
      res.status(500).json({ error: error.message || "Preview failed" });
    }
  });

  app.post("/api/admin/distribute-weekly-rewards", requireAdminAuth, async (req: Request, res: Response) => {
    try {
      const dryRun = req.query.dryRun === 'true';
      const { startDate, endDate } = getLastWeekDateRange();
      const preview = await calculateWeeklyRewards(startDate, endDate);
      
      if (preview.alreadyDistributed && !dryRun) {
        res.json({
          success: false,
          message: "Rewards for this week have already been distributed",
          distributed: [],
        });
        return;
      }

      if (preview.winners.length === 0) {
        res.json({
          success: true,
          message: "No eligible winners with wallet addresses",
          distributed: [],
          dryRun,
        });
        return;
      }

      const rewardAmounts = [10, 5, 3];
      const results = [];

      for (let i = 0; i < preview.winners.length; i++) {
        const winner = preview.winners[i];
        const rank = winner.rank;
        const amountUsd = winner.rewardAmountUsd;

        const existingReward = await getWeeklyReward(winner.fid, preview.weekStart);
        
        if (existingReward && existingReward.status === 'sent' && !dryRun) {
          results.push({
            fid: winner.fid,
            rank,
            status: "already_sent",
            existingTxHash: existingReward.txHash,
          });
          continue;
        }

        let rewardId = existingReward?.id;
        
        if (!existingReward && !dryRun) {
          const newReward = await createWeeklyReward(
            winner.fid,
            preview.weekStart,
            preview.weekEnd,
            rank,
            amountUsd
          );
          rewardId = newReward.id;
        }

        const memo = `${rank}. Reward - Week ${preview.weekStart} Rank #${rank}`;
        const transferResult = await sendReward(winner.walletAddress!, amountUsd, memo, dryRun);

        if (transferResult.success) {
          if (!dryRun) {
            await updateWeeklyRewardStatus(rewardId!, 'sent', transferResult.txHash);
          }
          results.push({
            fid: winner.fid,
            username: winner.username,
            rank,
            amountUsd,
            status: dryRun ? "dry_run_success" : (existingReward ? "retry_success" : "sent"),
            txHash: transferResult.txHash,
            dryRun: transferResult.dryRun,
          });
        } else {
          if (!dryRun) {
            await updateWeeklyRewardStatus(rewardId!, 'failed', undefined, transferResult.error);
          }
          results.push({
            fid: winner.fid,
            username: winner.username,
            rank,
            amountUsd,
            status: dryRun ? "dry_run_failed" : (existingReward ? "retry_failed" : "failed"),
            error: transferResult.error,
          });
        }
      }

      res.json({
        success: true,
        weekStart: preview.weekStart,
        weekEnd: preview.weekEnd,
        distributed: results,
        dryRun,
      });
    } catch (error: any) {
      console.error("Weekly reward distribution error:", error);
      res.status(500).json({ error: error.message || "Distribution failed" });
    }
  });

  app.get("/api/admin/weekly-rewards", requireAdminAuth, async (req: Request, res: Response) => {
    const limit = parseInt(req.query.limit as string) || 50;
    const rewards = await getWeeklyRewardsHistory(limit);
    res.json({ rewards });
  });

  app.get("/api/admin/wallet-balance", requireAdminAuth, async (req: Request, res: Response) => {
    const result = await getWalletBalance();
    res.json(result);
  });

  app.get("/api/admin/failed-rewards", requireAdminAuth, async (req: Request, res: Response) => {
    try {
      const weekStart = req.query.weekStart as string | undefined;
      const failedRewards = await getFailedWeeklyRewards(weekStart);
      res.json({ 
        success: true,
        rewards: failedRewards 
      });
    } catch (error: any) {
      console.error("Failed to fetch failed rewards:", error);
      res.status(500).json({ error: error.message || "Failed to fetch failed rewards" });
    }
  });

  app.post("/api/admin/retry-reward/:id", requireAdminAuth, async (req: Request, res: Response) => {
    try {
      const rewardId = parseInt(req.params.id);
      
      if (isNaN(rewardId)) {
        res.status(400).json({ error: "Invalid reward ID" });
        return;
      }

      const reward = await getWeeklyRewardById(rewardId);
      
      if (!reward) {
        res.status(404).json({ error: "Reward not found" });
        return;
      }

      if (reward.status === 'sent') {
        res.status(400).json({ error: "This reward has already been successfully sent" });
        return;
      }

      if (!reward.walletAddress) {
        res.status(400).json({ error: "Winner does not have a wallet address" });
        return;
      }

      const updated = await atomicUpdateRewardToPending(rewardId);
      
      if (!updated) {
        res.status(409).json({ 
          error: "Reward is not in failed status or is already being retried by another process" 
        });
        return;
      }

      try {
        const memo = `${reward.rank}. Reward - Week ${reward.weekStart} Rank #${reward.rank}`;
        const transferResult = await sendReward(reward.walletAddress, reward.amountUsd, memo, false);

        if (transferResult.success) {
          await updateWeeklyRewardStatus(rewardId, 'sent', transferResult.txHash);
          res.json({
            success: true,
            reward: {
              id: rewardId,
              fid: reward.fid,
              username: reward.username,
              rank: reward.rank,
              amountUsd: reward.amountUsd,
              status: 'sent',
              txHash: transferResult.txHash,
            }
          });
        } else {
          await updateWeeklyRewardStatus(rewardId, 'failed', undefined, transferResult.error);
          res.status(500).json({
            success: false,
            error: transferResult.error,
            reward: {
              id: rewardId,
              fid: reward.fid,
              username: reward.username,
              rank: reward.rank,
              amountUsd: reward.amountUsd,
              status: 'failed',
              error: transferResult.error,
            }
          });
        }
      } catch (sendError: any) {
        await updateWeeklyRewardStatus(rewardId, 'failed', undefined, sendError.message || 'Transfer failed');
        throw sendError;
      }
    } catch (error: any) {
      console.error("Retry reward error:", error);
      res.status(500).json({ error: error.message || "Retry failed" });
    }
  });

  app.post("/api/admin/retry-rewards", requireAdminAuth, async (req: Request, res: Response) => {
    try {
      const { rewardIds } = req.body;
      
      if (!Array.isArray(rewardIds) || rewardIds.length === 0) {
        res.status(400).json({ error: "Invalid request: rewardIds must be a non-empty array" });
        return;
      }

      const results = [];

      for (const rewardId of rewardIds) {
        const reward = await getWeeklyRewardById(rewardId);
        
        if (!reward) {
          results.push({
            id: rewardId,
            status: 'error',
            error: 'Reward not found',
          });
          continue;
        }

        if (reward.status === 'sent') {
          results.push({
            id: rewardId,
            fid: reward.fid,
            username: reward.username,
            status: 'already_sent',
            txHash: reward.txHash,
          });
          continue;
        }

        if (!reward.walletAddress) {
          results.push({
            id: rewardId,
            fid: reward.fid,
            username: reward.username,
            status: 'no_wallet',
            error: 'No wallet address',
          });
          continue;
        }

        const updated = await atomicUpdateRewardToPending(rewardId);
        
        if (!updated) {
          results.push({
            id: rewardId,
            fid: reward.fid,
            username: reward.username,
            status: 'skipped',
            error: 'Already being processed or not in failed status',
          });
          continue;
        }

        try {
          const memo = `${reward.rank}. Reward - Week ${reward.weekStart} Rank #${reward.rank}`;
          const transferResult = await sendReward(reward.walletAddress, reward.amountUsd, memo, false);

          if (transferResult.success) {
            await updateWeeklyRewardStatus(rewardId, 'sent', transferResult.txHash);
            results.push({
              id: rewardId,
              fid: reward.fid,
              username: reward.username,
              rank: reward.rank,
              amountUsd: reward.amountUsd,
              status: 'sent',
              txHash: transferResult.txHash,
            });
          } else {
            await updateWeeklyRewardStatus(rewardId, 'failed', undefined, transferResult.error);
            results.push({
              id: rewardId,
              fid: reward.fid,
              username: reward.username,
              rank: reward.rank,
              amountUsd: reward.amountUsd,
              status: 'failed',
              error: transferResult.error,
            });
          }
        } catch (sendError: any) {
          await updateWeeklyRewardStatus(rewardId, 'failed', undefined, sendError.message || 'Transfer failed');
          results.push({
            id: rewardId,
            fid: reward.fid,
            username: reward.username,
            rank: reward.rank,
            amountUsd: reward.amountUsd,
            status: 'failed',
            error: sendError.message || 'Transfer failed',
          });
        }
      }

      const successCount = results.filter(r => r.status === 'sent').length;
      const failureCount = results.filter(r => r.status === 'failed').length;

      res.json({
        success: true,
        summary: {
          total: rewardIds.length,
          successful: successCount,
          failed: failureCount,
        },
        results,
      });
    } catch (error: any) {
      console.error("Bulk retry error:", error);
      res.status(500).json({ error: error.message || "Bulk retry failed" });
    }
  });

  app.get("/version.json", (req: Request, res: Response) => {
    res.json({ version: process.env.npm_package_version || "1.0.0" });
  });

  const httpServer = createServer(app);
  return httpServer;
}
