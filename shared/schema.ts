import { z } from "zod";

export const profiles = {
  fid: z.number(),
  createdAt: z.string(),
  lastSeenAt: z.string(),
};

export const dailyResults = {
  id: z.number(),
  fid: z.number(),
  yyyymmdd: z.string(),
  attempts: z.number(),
  won: z.number(),
  createdAt: z.string(),
};

export const streaks = {
  fid: z.number(),
  currentStreak: z.number(),
  maxStreak: z.number(),
  lastPlayedYyyymmdd: z.string().nullable(),
  updatedAt: z.string(),
};

export const profileSchema = z.object(profiles);
export const dailyResultSchema = z.object(dailyResults);
export const streakSchema = z.object(streaks);

export type Profile = z.infer<typeof profileSchema>;
export type DailyResult = z.infer<typeof dailyResultSchema>;
export type Streak = z.infer<typeof streakSchema>;

export type TileFeedback = "correct" | "present" | "absent" | "empty";
export type GameStatus = "playing" | "won" | "lost";

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
  streak: number;
  maxStreak: number;
  lastPlayed: string | null;
  today: string;
  remainingAttempts: number;
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
}

export interface BoardStats {
  date: string;
  totalPlayers: number;
  wonCount: number;
  lostCount: number;
  averageAttempts: number;
}
