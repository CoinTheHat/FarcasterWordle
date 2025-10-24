import Database from "better-sqlite3";
import { DB_PATH } from "./env";
import { mkdirSync } from "fs";
import { dirname } from "path";

mkdirSync(dirname(DB_PATH), { recursive: true });

export const db = new Database(DB_PATH);

db.exec(`
  CREATE TABLE IF NOT EXISTS profiles (
    fid INTEGER PRIMARY KEY,
    username TEXT,
    created_at TEXT NOT NULL,
    last_seen_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS daily_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fid INTEGER NOT NULL,
    yyyymmdd TEXT NOT NULL,
    attempts INTEGER NOT NULL,
    won INTEGER NOT NULL,
    score INTEGER DEFAULT 0,
    created_at TEXT NOT NULL,
    UNIQUE(fid, yyyymmdd)
  );

  CREATE TABLE IF NOT EXISTS streaks (
    fid INTEGER PRIMARY KEY,
    current_streak INTEGER NOT NULL DEFAULT 0,
    max_streak INTEGER NOT NULL DEFAULT 0,
    last_played_yyyymmdd TEXT,
    updated_at TEXT NOT NULL
  );
`);

// Add username column if it doesn't exist (migration)
try {
  db.exec(`ALTER TABLE profiles ADD COLUMN username TEXT;`);
} catch (e) {
  // Column already exists, ignore error
}

export interface Profile {
  fid: number;
  username: string | null;
  createdAt: string;
  lastSeenAt: string;
}

export interface DailyResult {
  id: number;
  fid: number;
  yyyymmdd: string;
  attempts: number;
  won: number;
  score: number;
  createdAt: string;
}

export interface Streak {
  fid: number;
  currentStreak: number;
  maxStreak: number;
  lastPlayedYyyymmdd: string | null;
  updatedAt: string;
}

export function getOrCreateProfile(fid: number): Profile {
  const now = new Date().toISOString();
  
  const existing = db.prepare("SELECT * FROM profiles WHERE fid = ?").get(fid) as any;
  
  if (existing) {
    db.prepare("UPDATE profiles SET last_seen_at = ? WHERE fid = ?").run(now, fid);
    return {
      fid: existing.fid,
      username: existing.username || null,
      createdAt: existing.created_at,
      lastSeenAt: now,
    };
  }

  db.prepare("INSERT INTO profiles (fid, username, created_at, last_seen_at) VALUES (?, ?, ?, ?)").run(
    fid,
    null,
    now,
    now
  );

  return {
    fid,
    username: null,
    createdAt: now,
    lastSeenAt: now,
  };
}

export function getDailyResult(fid: number, yyyymmdd: string): DailyResult | null {
  const row = db
    .prepare("SELECT * FROM daily_results WHERE fid = ? AND yyyymmdd = ?")
    .get(fid, yyyymmdd) as any;

  if (!row) return null;

  return {
    id: row.id,
    fid: row.fid,
    yyyymmdd: row.yyyymmdd,
    attempts: row.attempts,
    won: row.won,
    score: row.score || 0,
    createdAt: row.created_at,
  };
}

export function createDailyResult(
  fid: number,
  yyyymmdd: string,
  attempts: number,
  won: boolean,
  score: number
): DailyResult {
  const now = new Date().toISOString();

  const result = db
    .prepare(
      "INSERT INTO daily_results (fid, yyyymmdd, attempts, won, score, created_at) VALUES (?, ?, ?, ?, ?, ?)"
    )
    .run(fid, yyyymmdd, attempts, won ? 1 : 0, score, now);

  return {
    id: result.lastInsertRowid as number,
    fid,
    yyyymmdd,
    attempts,
    won: won ? 1 : 0,
    score,
    createdAt: now,
  };
}

export function updateUsername(fid: number, username: string): void {
  db.prepare("UPDATE profiles SET username = ? WHERE fid = ?").run(username, fid);
}

export function getOrCreateStreak(fid: number): Streak {
  const now = new Date().toISOString();
  
  const existing = db.prepare("SELECT * FROM streaks WHERE fid = ?").get(fid) as any;

  if (existing) {
    return {
      fid: existing.fid,
      currentStreak: existing.current_streak,
      maxStreak: existing.max_streak,
      lastPlayedYyyymmdd: existing.last_played_yyyymmdd,
      updatedAt: existing.updated_at,
    };
  }

  db.prepare(
    "INSERT INTO streaks (fid, current_streak, max_streak, last_played_yyyymmdd, updated_at) VALUES (?, ?, ?, ?, ?)"
  ).run(fid, 0, 0, null, now);

  return {
    fid,
    currentStreak: 0,
    maxStreak: 0,
    lastPlayedYyyymmdd: null,
    updatedAt: now,
  };
}

export function updateStreak(
  fid: number,
  currentStreak: number,
  maxStreak: number,
  lastPlayedYyyymmdd: string
): void {
  const now = new Date().toISOString();

  db.prepare(
    "UPDATE streaks SET current_streak = ?, max_streak = ?, last_played_yyyymmdd = ?, updated_at = ? WHERE fid = ?"
  ).run(currentStreak, maxStreak, lastPlayedYyyymmdd, now, fid);
}

export function getBoardStats(yyyymmdd: string): {
  totalPlayers: number;
  wonCount: number;
  lostCount: number;
  averageAttempts: number;
} {
  const stats = db
    .prepare(
      `SELECT 
        COUNT(*) as total_players,
        SUM(won) as won_count,
        COUNT(*) - SUM(won) as lost_count,
        AVG(attempts) as avg_attempts
      FROM daily_results
      WHERE yyyymmdd = ?`
    )
    .get(yyyymmdd) as any;

  return {
    totalPlayers: stats.total_players || 0,
    wonCount: stats.won_count || 0,
    lostCount: stats.lost_count || 0,
    averageAttempts: stats.avg_attempts || 0,
  };
}

export interface LeaderboardEntry {
  fid: number;
  username: string | null;
  score: number;
  attempts: number;
  won: number;
  rank: number;
}

export function getDailyLeaderboard(yyyymmdd: string, limit: number = 100): LeaderboardEntry[] {
  const rows = db
    .prepare(
      `SELECT 
        dr.fid, 
        p.username,
        dr.score, 
        dr.attempts, 
        dr.won,
        RANK() OVER (ORDER BY dr.score DESC, dr.attempts ASC) as rank
      FROM daily_results dr
      LEFT JOIN profiles p ON dr.fid = p.fid
      WHERE dr.yyyymmdd = ?
      ORDER BY dr.score DESC, dr.attempts ASC
      LIMIT ?`
    )
    .all(yyyymmdd, limit) as any[];

  return rows.map(row => ({
    fid: row.fid,
    username: row.username || null,
    score: row.score || 0,
    attempts: row.attempts,
    won: row.won,
    rank: row.rank,
  }));
}

export function getWeeklyLeaderboard(startDate: string, endDate: string, limit: number = 100): LeaderboardEntry[] {
  const rows = db
    .prepare(
      `WITH weekly_best_scores AS (
        SELECT 
          fid,
          MAX(score) as best_score
        FROM daily_results
        WHERE yyyymmdd >= ? AND yyyymmdd <= ?
        GROUP BY fid
      ),
      ranked_weekly_games AS (
        SELECT 
          dr.fid,
          dr.score,
          dr.attempts,
          dr.won,
          dr.created_at,
          ROW_NUMBER() OVER (
            PARTITION BY dr.fid 
            ORDER BY dr.score DESC, dr.attempts ASC, dr.created_at ASC
          ) as rn
        FROM daily_results dr
        INNER JOIN weekly_best_scores wbs ON dr.fid = wbs.fid AND dr.score = wbs.best_score
        WHERE dr.yyyymmdd >= ? AND dr.yyyymmdd <= ?
      )
      SELECT 
        rwg.fid,
        p.username,
        rwg.score,
        rwg.attempts,
        rwg.won,
        RANK() OVER (ORDER BY rwg.score DESC, rwg.attempts ASC, rwg.created_at ASC) as rank
      FROM ranked_weekly_games rwg
      LEFT JOIN profiles p ON rwg.fid = p.fid
      WHERE rwg.rn = 1
      ORDER BY rwg.score DESC, rwg.attempts ASC, rwg.created_at ASC
      LIMIT ?`
    )
    .all(startDate, endDate, startDate, endDate, limit) as any[];

  return rows.map(row => ({
    fid: row.fid,
    username: row.username || null,
    score: row.score || 0,
    attempts: row.attempts,
    won: row.won,
    rank: row.rank,
  }));
}

export function getBestScoresLeaderboard(limit: number = 100): LeaderboardEntry[] {
  const rows = db
    .prepare(
      `WITH best_scores AS (
        SELECT 
          fid,
          MAX(score) as best_score
        FROM daily_results
        GROUP BY fid
      ),
      ranked_games AS (
        SELECT 
          dr.fid,
          dr.score,
          dr.attempts,
          dr.won,
          dr.created_at,
          ROW_NUMBER() OVER (
            PARTITION BY dr.fid 
            ORDER BY dr.score DESC, dr.attempts ASC, dr.created_at ASC
          ) as rn
        FROM daily_results dr
        INNER JOIN best_scores bs ON dr.fid = bs.fid AND dr.score = bs.best_score
      )
      SELECT 
        rg.fid,
        p.username,
        rg.score,
        rg.attempts,
        rg.won,
        RANK() OVER (ORDER BY rg.score DESC, rg.attempts ASC) as rank
      FROM ranked_games rg
      LEFT JOIN profiles p ON rg.fid = p.fid
      WHERE rg.rn = 1
      ORDER BY rg.score DESC, rg.attempts ASC
      LIMIT ?`
    )
    .all(limit) as any[];

  return rows.map(row => ({
    fid: row.fid,
    username: row.username || null,
    score: row.score || 0,
    attempts: row.attempts,
    won: row.won,
    rank: row.rank,
  }));
}
