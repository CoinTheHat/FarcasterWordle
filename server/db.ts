import Database from "better-sqlite3";
import { DB_PATH } from "./env";
import { mkdirSync } from "fs";
import { dirname } from "path";

mkdirSync(dirname(DB_PATH), { recursive: true });

export const db = new Database(DB_PATH);

db.exec(`
  CREATE TABLE IF NOT EXISTS profiles (
    fid INTEGER PRIMARY KEY,
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

export interface Profile {
  fid: number;
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
      createdAt: existing.created_at,
      lastSeenAt: now,
    };
  }

  db.prepare("INSERT INTO profiles (fid, created_at, last_seen_at) VALUES (?, ?, ?)").run(
    fid,
    now,
    now
  );

  return {
    fid,
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
  score: number;
  attempts: number;
  won: number;
  rank: number;
}

export function getDailyLeaderboard(yyyymmdd: string, limit: number = 100): LeaderboardEntry[] {
  const rows = db
    .prepare(
      `SELECT 
        fid, 
        score, 
        attempts, 
        won,
        RANK() OVER (ORDER BY score DESC, attempts ASC) as rank
      FROM daily_results
      WHERE yyyymmdd = ?
      ORDER BY score DESC, attempts ASC
      LIMIT ?`
    )
    .all(yyyymmdd, limit) as any[];

  return rows.map(row => ({
    fid: row.fid,
    score: row.score || 0,
    attempts: row.attempts,
    won: row.won,
    rank: row.rank,
  }));
}

export function getWeeklyLeaderboard(startDate: string, endDate: string, limit: number = 100): LeaderboardEntry[] {
  const rows = db
    .prepare(
      `SELECT 
        fid,
        SUM(score) as total_score,
        AVG(attempts) as avg_attempts,
        SUM(won) as total_won,
        RANK() OVER (ORDER BY SUM(score) DESC, AVG(attempts) ASC) as rank
      FROM daily_results
      WHERE yyyymmdd >= ? AND yyyymmdd <= ?
      GROUP BY fid
      ORDER BY total_score DESC, avg_attempts ASC
      LIMIT ?`
    )
    .all(startDate, endDate, limit) as any[];

  return rows.map(row => ({
    fid: row.fid,
    score: row.total_score || 0,
    attempts: Math.round(row.avg_attempts || 0),
    won: row.total_won || 0,
    rank: row.rank,
  }));
}
