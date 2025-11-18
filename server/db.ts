import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";
import type { LeaderboardEntry } from "@shared/schema";
import { eq, and, desc, asc, sql, count } from "drizzle-orm";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle({ client: pool, schema });

// Type exports
export type Profile = typeof schema.profiles.$inferSelect;
export type DailyResult = typeof schema.dailyResults.$inferSelect;
export type Streak = typeof schema.streaks.$inferSelect;
export type WeeklyReward = typeof schema.weeklyRewards.$inferSelect;
export type PracticeResult = typeof schema.practiceResults.$inferSelect;

// Database functions
export async function getOrCreateProfile(fid: number): Promise<Profile> {
  const existing = await db.select().from(schema.profiles).where(eq(schema.profiles.fid, fid));
  
  if (existing.length > 0) {
    await db.update(schema.profiles)
      .set({ lastSeenAt: new Date() })
      .where(eq(schema.profiles.fid, fid));
    
    return {
      ...existing[0],
      lastSeenAt: new Date(),
    };
  }

  const [newProfile] = await db.insert(schema.profiles)
    .values({ fid })
    .returning();

  return newProfile;
}

export async function getDailyResult(fid: number, yyyymmdd: string): Promise<DailyResult | null> {
  const results = await db.select()
    .from(schema.dailyResults)
    .where(
      and(
        eq(schema.dailyResults.fid, fid),
        eq(schema.dailyResults.yyyymmdd, yyyymmdd)
      )
    );

  return results.length > 0 ? results[0] : null;
}

export async function createDailyResult(
  fid: number,
  yyyymmdd: string,
  attempts: number,
  won: boolean,
  score: number
): Promise<DailyResult> {
  const [result] = await db.insert(schema.dailyResults)
    .values({
      fid,
      yyyymmdd,
      attempts,
      won,
      score,
    })
    .returning();

  return result;
}

export async function updateUsername(fid: number, username: string): Promise<void> {
  await db.update(schema.profiles)
    .set({ username })
    .where(eq(schema.profiles.fid, fid));
}

export async function updateWalletAddress(fid: number, walletAddress: string): Promise<void> {
  await db.update(schema.profiles)
    .set({ walletAddress })
    .where(eq(schema.profiles.fid, fid));
}

export async function getOrCreateStreak(fid: number): Promise<Streak> {
  const existing = await db.select()
    .from(schema.streaks)
    .where(eq(schema.streaks.fid, fid));

  if (existing.length > 0) {
    return existing[0];
  }

  const [newStreak] = await db.insert(schema.streaks)
    .values({
      fid,
      currentStreak: 0,
      maxStreak: 0,
      lastPlayedYyyymmdd: null,
    })
    .returning();

  return newStreak;
}

export async function updateStreak(
  fid: number,
  currentStreak: number,
  maxStreak: number,
  lastPlayedYyyymmdd: string
): Promise<void> {
  await db.update(schema.streaks)
    .set({
      currentStreak,
      maxStreak,
      lastPlayedYyyymmdd,
      updatedAt: new Date(),
    })
    .where(eq(schema.streaks.fid, fid));
}

export async function getBoardStats(yyyymmdd: string): Promise<{
  totalPlayers: number;
  wonCount: number;
  lostCount: number;
  averageAttempts: number;
}> {
  const results = await db.select({
    totalPlayers: count(),
    wonCount: sql<number>`SUM(CASE WHEN ${schema.dailyResults.won} = true THEN 1 ELSE 0 END)`,
    lostCount: sql<number>`SUM(CASE WHEN ${schema.dailyResults.won} = false THEN 1 ELSE 0 END)`,
    averageAttempts: sql<number>`AVG(${schema.dailyResults.attempts})`,
  })
  .from(schema.dailyResults)
  .where(eq(schema.dailyResults.yyyymmdd, yyyymmdd));

  const stats = results[0];

  return {
    totalPlayers: Number(stats.totalPlayers) || 0,
    wonCount: Number(stats.wonCount) || 0,
    lostCount: Number(stats.lostCount) || 0,
    averageAttempts: Number(stats.averageAttempts) || 0,
  };
}

export async function getDailyLeaderboard(yyyymmdd: string, limit: number = 100): Promise<LeaderboardEntry[]> {
  const results = await db.select({
    fid: schema.dailyResults.fid,
    username: schema.profiles.username,
    score: schema.dailyResults.score,
    attempts: schema.dailyResults.attempts,
    won: schema.dailyResults.won,
    rank: sql<number>`RANK() OVER (ORDER BY ${schema.dailyResults.score} DESC, ${schema.dailyResults.attempts} ASC, ${schema.dailyResults.createdAt} ASC)`,
  })
  .from(schema.dailyResults)
  .leftJoin(schema.profiles, eq(schema.dailyResults.fid, schema.profiles.fid))
  .where(eq(schema.dailyResults.yyyymmdd, yyyymmdd))
  .orderBy(desc(schema.dailyResults.score), asc(schema.dailyResults.attempts), asc(schema.dailyResults.createdAt))
  .limit(limit);

  return results.map(row => ({
    fid: row.fid,
    username: row.username || null,
    score: row.score,
    attempts: row.attempts,
    won: row.won ? 1 : 0,
    rank: Number(row.rank),
  }));
}

export async function getWeeklyLeaderboard(startDate: string, endDate: string, limit: number = 100): Promise<LeaderboardEntry[]> {
  const weeklyTotalScores = db.$with('weekly_total_scores').as(
    db.select({
      fid: schema.dailyResults.fid,
      totalScore: sql<number>`SUM(${schema.dailyResults.score})`.as('total_score'),
      gamesPlayed: sql<number>`COUNT(*)`.as('games_played'),
      gamesWon: sql<number>`SUM(CASE WHEN ${schema.dailyResults.won} THEN 1 ELSE 0 END)`.as('games_won'),
      firstPlayedAt: sql<string>`MIN(${schema.dailyResults.createdAt})`.as('first_played_at'),
    })
    .from(schema.dailyResults)
    .where(
      and(
        sql`${schema.dailyResults.yyyymmdd} >= ${startDate}`,
        sql`${schema.dailyResults.yyyymmdd} <= ${endDate}`
      )
    )
    .groupBy(schema.dailyResults.fid)
  );

  const results = await db.with(weeklyTotalScores)
    .select({
      fid: weeklyTotalScores.fid,
      username: schema.profiles.username,
      walletAddress: schema.profiles.walletAddress,
      score: weeklyTotalScores.totalScore,
      attempts: weeklyTotalScores.gamesPlayed,
      won: weeklyTotalScores.gamesWon,
      rank: sql<number>`RANK() OVER (ORDER BY ${weeklyTotalScores.totalScore} DESC, ${weeklyTotalScores.firstPlayedAt} ASC)`,
    })
    .from(weeklyTotalScores)
    .leftJoin(schema.profiles, eq(weeklyTotalScores.fid, schema.profiles.fid))
    .orderBy(desc(weeklyTotalScores.totalScore), asc(weeklyTotalScores.firstPlayedAt))
    .limit(limit);

  return results.map(row => ({
    fid: row.fid,
    username: row.username || null,
    walletAddress: row.walletAddress || null,
    score: row.score,
    attempts: row.attempts,
    won: (row.won as number) > 0 ? 1 : 0,
    rank: Number(row.rank),
  }));
}

export async function getBestScoresLeaderboard(limit: number = 100): Promise<LeaderboardEntry[]> {
  const bestScores = db.$with('best_scores').as(
    db.select({
      fid: schema.dailyResults.fid,
      bestScore: sql<number>`MAX(${schema.dailyResults.score})`.as('best_score'),
    })
    .from(schema.dailyResults)
    .groupBy(schema.dailyResults.fid)
  );

  const rankedGames = db.$with('ranked_games').as(
    db.select({
      fid: schema.dailyResults.fid,
      score: schema.dailyResults.score,
      attempts: schema.dailyResults.attempts,
      won: schema.dailyResults.won,
      createdAt: schema.dailyResults.createdAt,
      rn: sql<number>`ROW_NUMBER() OVER (PARTITION BY ${schema.dailyResults.fid} ORDER BY ${schema.dailyResults.score} DESC, ${schema.dailyResults.attempts} ASC, ${schema.dailyResults.createdAt} ASC)`.as('rn'),
    })
    .from(schema.dailyResults)
    .innerJoin(
      bestScores,
      and(
        eq(schema.dailyResults.fid, bestScores.fid),
        eq(schema.dailyResults.score, bestScores.bestScore)
      )
    )
  );

  const results = await db.with(bestScores, rankedGames)
    .select({
      fid: rankedGames.fid,
      username: schema.profiles.username,
      score: rankedGames.score,
      attempts: rankedGames.attempts,
      won: rankedGames.won,
      rank: sql<number>`RANK() OVER (ORDER BY ${rankedGames.score} DESC, ${rankedGames.attempts} ASC, ${rankedGames.createdAt} ASC)`,
    })
    .from(rankedGames)
    .leftJoin(schema.profiles, eq(rankedGames.fid, schema.profiles.fid))
    .where(eq(rankedGames.rn, 1))
    .orderBy(desc(rankedGames.score), asc(rankedGames.attempts), asc(rankedGames.createdAt))
    .limit(limit);

  return results.map(row => ({
    fid: row.fid,
    username: row.username || null,
    score: row.score,
    attempts: row.attempts,
    won: row.won ? 1 : 0,
    rank: Number(row.rank),
  }));
}

export async function createWeeklyReward(
  fid: number,
  weekStart: string,
  weekEnd: string,
  rank: number,
  amountUsd: number
): Promise<WeeklyReward> {
  const [reward] = await db.insert(schema.weeklyRewards)
    .values({
      fid,
      weekStart,
      weekEnd,
      rank,
      amountUsd,
      status: 'pending',
    })
    .returning();

  return reward;
}

export async function updateWeeklyRewardStatus(
  id: number,
  status: string,
  txHash?: string,
  errorMessage?: string
): Promise<void> {
  await db.update(schema.weeklyRewards)
    .set({
      status,
      txHash: txHash || null,
      errorMessage: errorMessage || null,
      distributedAt: status === 'sent' ? new Date() : null,
    })
    .where(eq(schema.weeklyRewards.id, id));
}

export async function atomicUpdateRewardToPending(id: number): Promise<WeeklyReward | null> {
  const results = await db.update(schema.weeklyRewards)
    .set({
      status: 'pending',
      errorMessage: null,
    })
    .where(
      and(
        eq(schema.weeklyRewards.id, id),
        eq(schema.weeklyRewards.status, 'failed')
      )
    )
    .returning();

  return results.length > 0 ? results[0] : null;
}

export async function getWeeklyReward(
  fid: number,
  weekStart: string
): Promise<WeeklyReward | null> {
  const results = await db.select()
    .from(schema.weeklyRewards)
    .where(
      and(
        eq(schema.weeklyRewards.fid, fid),
        eq(schema.weeklyRewards.weekStart, weekStart)
      )
    );

  return results.length > 0 ? results[0] : null;
}

export async function getPendingWeeklyRewards(): Promise<WeeklyReward[]> {
  return await db.select()
    .from(schema.weeklyRewards)
    .where(eq(schema.weeklyRewards.status, 'pending'))
    .orderBy(asc(schema.weeklyRewards.createdAt));
}

export async function getWeeklyRewardsHistory(limit: number = 50): Promise<WeeklyReward[]> {
  return await db.select()
    .from(schema.weeklyRewards)
    .orderBy(desc(schema.weeklyRewards.createdAt))
    .limit(limit);
}

export async function getFailedWeeklyRewards(weekStart?: string): Promise<any[]> {
  const whereConditions = weekStart 
    ? and(
        eq(schema.weeklyRewards.status, 'failed'),
        eq(schema.weeklyRewards.weekStart, weekStart)
      )
    : eq(schema.weeklyRewards.status, 'failed');

  const results = await db.select({
    id: schema.weeklyRewards.id,
    fid: schema.weeklyRewards.fid,
    username: schema.profiles.username,
    walletAddress: schema.profiles.walletAddress,
    weekStart: schema.weeklyRewards.weekStart,
    weekEnd: schema.weeklyRewards.weekEnd,
    rank: schema.weeklyRewards.rank,
    amountUsd: schema.weeklyRewards.amountUsd,
    txHash: schema.weeklyRewards.txHash,
    status: schema.weeklyRewards.status,
    errorMessage: schema.weeklyRewards.errorMessage,
    createdAt: schema.weeklyRewards.createdAt,
    distributedAt: schema.weeklyRewards.distributedAt,
  })
  .from(schema.weeklyRewards)
  .leftJoin(schema.profiles, eq(schema.weeklyRewards.fid, schema.profiles.fid))
  .where(whereConditions)
  .orderBy(desc(schema.weeklyRewards.createdAt));
  
  return results;
}

export async function getWeeklyRewardById(id: number): Promise<any | null> {
  const results = await db.select({
    id: schema.weeklyRewards.id,
    fid: schema.weeklyRewards.fid,
    username: schema.profiles.username,
    walletAddress: schema.profiles.walletAddress,
    weekStart: schema.weeklyRewards.weekStart,
    weekEnd: schema.weeklyRewards.weekEnd,
    rank: schema.weeklyRewards.rank,
    amountUsd: schema.weeklyRewards.amountUsd,
    txHash: schema.weeklyRewards.txHash,
    status: schema.weeklyRewards.status,
    errorMessage: schema.weeklyRewards.errorMessage,
    createdAt: schema.weeklyRewards.createdAt,
    distributedAt: schema.weeklyRewards.distributedAt,
  })
  .from(schema.weeklyRewards)
  .leftJoin(schema.profiles, eq(schema.weeklyRewards.fid, schema.profiles.fid))
  .where(eq(schema.weeklyRewards.id, id));

  return results.length > 0 ? results[0] : null;
}

export async function getPracticeResultCount(fid: number, yyyymmdd: string): Promise<number> {
  const results = await db.select({ count: count() })
    .from(schema.practiceResults)
    .where(
      and(
        eq(schema.practiceResults.fid, fid),
        eq(schema.practiceResults.yyyymmdd, yyyymmdd)
      )
    );
  
  return Number(results[0]?.count || 0);
}

export async function createPracticeResult(
  fid: number,
  yyyymmdd: string,
  attemptNumber: number,
  attempts: number,
  won: boolean,
  score: number,
  txHash: string | null = null
): Promise<PracticeResult> {
  const [result] = await db.insert(schema.practiceResults)
    .values({
      fid,
      yyyymmdd,
      attemptNumber,
      attempts,
      won,
      score,
      txHash,
    })
    .returning();

  return result;
}

export async function createGameSession(
  sessionId: string,
  fid: number,
  yyyymmdd: string,
  solution: string,
  language: string,
  isPracticeMode: boolean
): Promise<schema.GameSession> {
  const [session] = await db.insert(schema.gameSessions)
    .values({
      sessionId,
      fid,
      yyyymmdd,
      solution,
      language,
      guesses: [],
      attemptsUsed: 0,
      completed: false,
      isPracticeMode,
    })
    .returning();

  return session;
}

export async function getGameSession(sessionId: string): Promise<schema.GameSession | null> {
  const results = await db.select()
    .from(schema.gameSessions)
    .where(eq(schema.gameSessions.sessionId, sessionId));

  return results.length > 0 ? results[0] : null;
}

export async function getTodayGameSession(fid: number, yyyymmdd: string): Promise<schema.GameSession | null> {
  const results = await db.select()
    .from(schema.gameSessions)
    .where(
      and(
        eq(schema.gameSessions.fid, fid),
        eq(schema.gameSessions.yyyymmdd, yyyymmdd),
        eq(schema.gameSessions.completed, false)
      )
    );

  return results.length > 0 ? results[0] : null;
}

export async function updateGameSessionGuess(
  sessionId: string,
  guesses: string[],
  attemptsUsed: number
): Promise<void> {
  await db.update(schema.gameSessions)
    .set({
      guesses,
      attemptsUsed,
    })
    .where(eq(schema.gameSessions.sessionId, sessionId));
}

export async function completeGameSession(sessionId: string): Promise<void> {
  await db.update(schema.gameSessions)
    .set({
      completed: true,
      completedAt: new Date(),
    })
    .where(eq(schema.gameSessions.sessionId, sessionId));
}
