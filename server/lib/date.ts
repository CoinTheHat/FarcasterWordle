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

export function getLastWeekDateRange(): { startDate: string; endDate: string } {
  // Use Turkey time for weekly prize distribution (resets Monday 00:00 TR)
  const nowTR = getNowInIstanbul();
  
  // Find this week's Monday at 00:00 Turkey time
  // weekday: Monday=1, Tuesday=2, ..., Sunday=7
  // Subtract (weekday-1) days to get to Monday
  const thisMonday = nowTR.minus({ days: nowTR.weekday - 1 }).startOf('day');
  
  // Last week = previous Monday to previous Sunday
  const lastMonday = thisMonday.minus({ weeks: 1 });
  const lastSunday = lastMonday.plus({ days: 6 });
  
  return {
    startDate: lastMonday.toFormat("yyyyMMdd"),
    endDate: lastSunday.toFormat("yyyyMMdd"),
  };
}

export function getCurrentWeekDateRange(): { startDate: string; endDate: string } {
  // Get current week's date range (Monday to Sunday in Turkey time)
  const nowTR = getNowInIstanbul();
  
  // Find this week's Monday at 00:00 Turkey time
  const thisMonday = nowTR.minus({ days: nowTR.weekday - 1 }).startOf('day');
  const thisSunday = thisMonday.plus({ days: 6 });
  
  return {
    startDate: thisMonday.toFormat("yyyyMMdd"),
    endDate: thisSunday.toFormat("yyyyMMdd"),
  };
}
