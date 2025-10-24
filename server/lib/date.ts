import { DateTime } from "luxon";

const TIMEZONE = "Europe/Istanbul";

export function getNowInIstanbul(): DateTime {
  return DateTime.now().setZone(TIMEZONE);
}

export function getTodayDateString(): string {
  return getNowInIstanbul().toFormat("yyyyMMdd");
}

export function getYesterdayDateString(): string {
  return getNowInIstanbul().minus({ days: 1 }).toFormat("yyyyMMdd");
}

export function getDateStringDaysAgo(days: number): string {
  return getNowInIstanbul().minus({ days }).toFormat("yyyyMMdd");
}

export function isConsecutiveDay(lastPlayed: string | null, today: string): boolean {
  if (!lastPlayed) return false;
  
  const lastDate = DateTime.fromFormat(lastPlayed, "yyyyMMdd", { zone: TIMEZONE });
  const todayDate = DateTime.fromFormat(today, "yyyyMMdd", { zone: TIMEZONE });
  
  const daysDiff = todayDate.diff(lastDate, "days").days;
  return daysDiff === 1;
}
