import { pgTable, integer, text, timestamp, serial, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Database Tables
export const profiles = pgTable("profiles", {
  fid: integer("fid").primaryKey(),
  username: text("username"),
  walletAddress: text("wallet_address"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  lastSeenAt: timestamp("last_seen_at").notNull().defaultNow(),
});

export const dailyResults = pgTable("daily_results", {
  id: serial("id").primaryKey(),
  fid: integer("fid").notNull(),
  yyyymmdd: text("yyyymmdd").notNull(),
  attempts: integer("attempts").notNull(),
  won: boolean("won").notNull(),
  score: integer("score").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  uniqueFidDate: {
    columns: [table.fid, table.yyyymmdd],
    isUnique: true,
  },
}));

export const streaks = pgTable("streaks", {
  fid: integer("fid").primaryKey(),
  currentStreak: integer("current_streak").notNull().default(0),
  maxStreak: integer("max_streak").notNull().default(0),
  lastPlayedYyyymmdd: text("last_played_yyyymmdd"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const weeklyRewards = pgTable("weekly_rewards", {
  id: serial("id").primaryKey(),
  fid: integer("fid").notNull(),
  weekStart: text("week_start").notNull(),
  weekEnd: text("week_end").notNull(),
  rank: integer("rank").notNull(),
  amountUsd: integer("amount_usd").notNull(),
  txHash: text("tx_hash"),
  status: text("status").notNull().default("pending"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  distributedAt: timestamp("distributed_at"),
}, (table) => ({
  uniqueFidWeek: {
    columns: [table.fid, table.weekStart],
    isUnique: true,
  },
}));

export const practiceResults = pgTable("practice_results", {
  id: serial("id").primaryKey(),
  fid: integer("fid").notNull(),
  yyyymmdd: text("yyyymmdd").notNull(),
  attemptNumber: integer("attempt_number").notNull(),
  attempts: integer("attempts").notNull(),
  won: boolean("won").notNull(),
  score: integer("score").notNull().default(0),
  txHash: text("tx_hash"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  uniqueFidDateAttempt: {
    columns: [table.fid, table.yyyymmdd, table.attemptNumber],
    isUnique: true,
  },
}));

export const gameSessions = pgTable("game_sessions", {
  sessionId: text("session_id").primaryKey(),
  fid: integer("fid").notNull(),
  yyyymmdd: text("yyyymmdd").notNull(),
  solution: text("solution").notNull(),
  language: text("language").notNull(),
  guesses: text("guesses").array().notNull().default([]),
  attemptsUsed: integer("attempts_used").notNull().default(0),
  completed: boolean("completed").notNull().default(false),
  isPracticeMode: boolean("is_practice_mode").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
}, (table) => ({
  uniqueFidDate: {
    columns: [table.fid, table.yyyymmdd],
    isUnique: true,
  },
}));

// Insert Schemas
export const insertProfileSchema = createInsertSchema(profiles).omit({
  createdAt: true,
  lastSeenAt: true,
});

export const insertDailyResultSchema = createInsertSchema(dailyResults).omit({
  id: true,
  createdAt: true,
});

export const insertStreakSchema = createInsertSchema(streaks).omit({
  updatedAt: true,
});

export const insertWeeklyRewardSchema = createInsertSchema(weeklyRewards).omit({
  id: true,
  createdAt: true,
  distributedAt: true,
});

export const insertPracticeResultSchema = createInsertSchema(practiceResults).omit({
  id: true,
  createdAt: true,
});

export const insertGameSessionSchema = createInsertSchema(gameSessions).omit({
  createdAt: true,
  completedAt: true,
});

// Types
export type Profile = typeof profiles.$inferSelect;
export type InsertProfile = z.infer<typeof insertProfileSchema>;

export type DailyResult = typeof dailyResults.$inferSelect;
export type InsertDailyResult = z.infer<typeof insertDailyResultSchema>;

export type Streak = typeof streaks.$inferSelect;
export type InsertStreak = z.infer<typeof insertStreakSchema>;

export type WeeklyReward = typeof weeklyRewards.$inferSelect;
export type InsertWeeklyReward = z.infer<typeof insertWeeklyRewardSchema>;

export type PracticeResult = typeof practiceResults.$inferSelect;
export type InsertPracticeResult = z.infer<typeof insertPracticeResultSchema>;

export type GameSession = typeof gameSessions.$inferSelect;
export type InsertGameSession = z.infer<typeof insertGameSessionSchema>;

// Game Types
export type TileFeedback = "correct" | "present" | "absent" | "empty";
export type GameStatus = "playing" | "won" | "lost";
export type Language = "en" | "tr";

export interface GameState {
  guesses: string[];
  currentGuess: string;
  feedback: TileFeedback[][];
  status: GameStatus;
  attemptsUsed: number;
  remainingAttempts: number;
}

export interface UserStats {
  fid: number;
  username: string | null;
  walletAddress?: string | null;
  streak: number;
  maxStreak: number;
  lastPlayed: string | null;
  today: string;
  remainingAttempts: number;
  hasCompletedToday?: boolean;
  todayScore?: number;
}

export const guessRequestSchema = z.object({
  guess: z.string().length(5).regex(/^[A-Z]+$/),
});

export type GuessRequest = z.infer<typeof guessRequestSchema>;

export interface GuessResponse {
  feedback: TileFeedback[];
  attemptsUsed: number;
  won: boolean;
  remainingAttempts: number;
  gameOver?: boolean;
  solution?: string;
  score?: number;
  isPracticeMode?: boolean;
}

export interface BoardStats {
  date: string;
  totalPlayers: number;
  wonCount: number;
  lostCount: number;
  averageAttempts: number;
}

export interface LeaderboardEntry {
  fid: number;
  username: string | null;
  walletAddress?: string | null;
  score: number;
  attempts: number;
  won: number;
  rank: number;
}

export interface LeaderboardResponse {
  period: "daily" | "weekly" | "all-time";
  date?: string;
  startDate?: string;
  endDate?: string;
  leaderboard: LeaderboardEntry[];
}
