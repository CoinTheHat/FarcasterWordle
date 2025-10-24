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

export async function submitGuess(guess: string): Promise<GuessResponse> {
  const response = await fetch("/api/guess", {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ guess }),
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Failed to submit guess" }));
    throw new Error(error.error || error.message || "Failed to submit guess");
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

export async function fetchHint(): Promise<HintResponse> {
  const response = await fetch("/api/hint", {
    headers: getHeaders(),
  });
  
  if (!response.ok) {
    throw new Error("Failed to fetch hint");
  }
  
  return response.json();
}
