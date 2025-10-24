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

export function getFormattedDate(date?: DateTime): string {
  const d = date || getNowInIstanbul();
  return d.toFormat("MMMM d, yyyy");
}

export function isConsecutiveDay(lastPlayed: string | null, today: string): boolean {
  if (!lastPlayed) return false;
  
  const lastDate = DateTime.fromFormat(lastPlayed, "yyyyMMdd", { zone: TIMEZONE });
  const todayDate = DateTime.fromFormat(today, "yyyyMMdd", { zone: TIMEZONE });
  
  const daysDiff = todayDate.diff(lastDate, "days").days;
  return daysDiff === 1;
}

export function parseDateString(yyyymmdd: string): DateTime {
  return DateTime.fromFormat(yyyymmdd, "yyyyMMdd", { zone: TIMEZONE });
}
