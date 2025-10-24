import type { UserStats, GuessResponse, BoardStats } from "@shared/schema";

let currentFid: number | null = null;

export function setFid(fid: number | null) {
  currentFid = fid;
}

function getHeaders(): HeadersInit {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  
  if (currentFid) {
    headers["x-farcaster-fid"] = currentFid.toString();
  }
  
  return headers;
}

export async function fetchUserStats(): Promise<UserStats> {
  const response = await fetch("/api/me", {
    headers: getHeaders(),
  });
  
  if (!response.ok) {
    throw new Error("Failed to fetch user stats");
  }
  return response.json();
}

export interface StartGameResponse {
  sessionId: string;
  maxAttempts: number;
}

export async function startGame(language: string = "en"): Promise<StartGameResponse> {
  const response = await fetch("/api/start-game", {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ language }),
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Failed to start game" }));
    throw new Error(error.error || error.message || "Failed to start game");
  }
  
  return response.json();
}

export async function submitGuess(guess: string, sessionId: string): Promise<GuessResponse> {
  const response = await fetch("/api/guess", {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ guess, sessionId }),
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Failed to submit guess" }));
    throw new Error(error.error || error.message || "Failed to submit guess");
  }
  
  return response.json();
}

export interface CompleteGameResponse {
  success: boolean;
  streak: number;
  maxStreak: number;
}

export async function completeGame(sessionId: string, txHash: string): Promise<CompleteGameResponse> {
  const response = await fetch("/api/complete-game", {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ sessionId, txHash }),
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Failed to complete game" }));
    throw new Error(error.error || error.message || "Failed to complete game");
  }
  
  return response.json();
}

export async function fetchBoardStats(date?: string): Promise<BoardStats> {
  const url = date ? `/api/board?date=${date}` : "/api/board";
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error("Failed to fetch board stats");
  }
  
  return response.json();
}

export async function checkVersion(): Promise<{ version: string }> {
  const response = await fetch("/version.json");
  if (!response.ok) {
    throw new Error("Failed to check version");
  }
  return response.json();
}

export interface HintResponse {
  position: number;
  letter: string;
  hint: string;
}

export async function fetchHint(sessionId: string): Promise<HintResponse> {
  const response = await fetch(`/api/hint?sessionId=${sessionId}`, {
    headers: getHeaders(),
  });
  
  if (!response.ok) {
    throw new Error("Failed to fetch hint");
  }
  
  return response.json();
}
