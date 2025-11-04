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

// Types
export type Profile = typeof profiles.$inferSelect;
export type InsertProfile = z.infer<typeof insertProfileSchema>;

export type DailyResult = typeof dailyResults.$inferSelect;
export type InsertDailyResult = z.infer<typeof insertDailyResultSchema>;

export type Streak = typeof streaks.$inferSelect;
export type InsertStreak = z.infer<typeof insertStreakSchema>;

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
