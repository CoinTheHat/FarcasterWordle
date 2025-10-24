import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";
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

export interface LeaderboardEntry {
  fid: number;
  username: string | null;
  score: number;
  attempts: number;
  won: boolean;
  rank: number;
}

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
    rank: sql<number>`RANK() OVER (ORDER BY ${schema.dailyResults.score} DESC, ${schema.dailyResults.attempts} ASC)`,
  })
  .from(schema.dailyResults)
  .leftJoin(schema.profiles, eq(schema.dailyResults.fid, schema.profiles.fid))
  .where(eq(schema.dailyResults.yyyymmdd, yyyymmdd))
  .orderBy(desc(schema.dailyResults.score), asc(schema.dailyResults.attempts))
  .limit(limit);

  return results.map(row => ({
    fid: row.fid,
    username: row.username || null,
    score: row.score,
    attempts: row.attempts,
    won: row.won,
    rank: Number(row.rank),
  }));
}

export async function getWeeklyLeaderboard(startDate: string, endDate: string, limit: number = 100): Promise<LeaderboardEntry[]> {
  const weeklyBestScores = db.$with('weekly_best_scores').as(
    db.select({
      fid: schema.dailyResults.fid,
      bestScore: sql<number>`MAX(${schema.dailyResults.score})`.as('best_score'),
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

  const rankedWeeklyGames = db.$with('ranked_weekly_games').as(
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
      weeklyBestScores,
      and(
        eq(schema.dailyResults.fid, weeklyBestScores.fid),
        eq(schema.dailyResults.score, weeklyBestScores.bestScore)
      )
    )
    .where(
      and(
        sql`${schema.dailyResults.yyyymmdd} >= ${startDate}`,
        sql`${schema.dailyResults.yyyymmdd} <= ${endDate}`
      )
    )
  );

  const results = await db.with(weeklyBestScores, rankedWeeklyGames)
    .select({
      fid: rankedWeeklyGames.fid,
      username: schema.profiles.username,
      score: rankedWeeklyGames.score,
      attempts: rankedWeeklyGames.attempts,
      won: rankedWeeklyGames.won,
      rank: sql<number>`RANK() OVER (ORDER BY ${rankedWeeklyGames.score} DESC, ${rankedWeeklyGames.attempts} ASC, ${rankedWeeklyGames.createdAt} ASC)`,
    })
    .from(rankedWeeklyGames)
    .leftJoin(schema.profiles, eq(rankedWeeklyGames.fid, schema.profiles.fid))
    .where(eq(rankedWeeklyGames.rn, 1))
    .orderBy(desc(rankedWeeklyGames.score), asc(rankedWeeklyGames.attempts), asc(rankedWeeklyGames.createdAt))
    .limit(limit);

  return results.map(row => ({
    fid: row.fid,
    username: row.username || null,
    score: row.score,
    attempts: row.attempts,
    won: row.won,
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
      rank: sql<number>`RANK() OVER (ORDER BY ${rankedGames.score} DESC, ${rankedGames.attempts} ASC)`,
    })
    .from(rankedGames)
    .leftJoin(schema.profiles, eq(rankedGames.fid, schema.profiles.fid))
    .where(eq(rankedGames.rn, 1))
    .orderBy(desc(rankedGames.score), asc(rankedGames.attempts))
    .limit(limit);

  return results.map(row => ({
    fid: row.fid,
    username: row.username || null,
    score: row.score,
    attempts: row.attempts,
    won: row.won,
    rank: Number(row.rank),
  }));
}
