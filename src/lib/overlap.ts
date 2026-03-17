import type { TeamMember, Holiday } from "@/types";
import { getUtcOffsetHours } from "./timezone";

export interface OverlapResult {
  startUtc: number; // UTC hour [0, 24), can be fractional
  endUtc: number; // UTC hour, can exceed 24 when overlap wraps midnight
}

/** Convert a local hour to UTC hour for a given timezone on a given date */
function localHourToUtc(localHour: number, timezone: string, date: Date): number {
  const offset = getUtcOffsetHours(timezone, date);
  let utc = localHour - offset;
  // Normalize to [0, 24)
  if (utc < 0) utc += 24;
  if (utc >= 24) utc -= 24;
  return utc;
}

/** Get the UTC working range for a member. Returns [start, end] in UTC hours. */
export function getMemberUtcRange(
  member: TeamMember,
  date: Date
): { start: number; end: number } {
  const start = localHourToUtc(member.workStart, member.timezone, date);
  const end = localHourToUtc(member.workEnd, member.timezone, date);
  return { start, end };
}

/** Check if a member has a holiday on a given date */
export function memberHasHoliday(
  member: TeamMember,
  dateStr: string,
  holidays: Record<string, Holiday[]>
): boolean {
  const memberHolidays = holidays[member.countryCode] ?? [];
  return memberHolidays.some((h) => h.date === dateStr);
}

/** Compute overlap of working hours across active members (no holiday) */
export function computeOverlap(
  members: TeamMember[],
  date: Date,
  holidays: Record<string, Holiday[]>
): OverlapResult | null {
  const dateStr = date.toISOString().split("T")[0];
  const activeMembers = members.filter((m) => !memberHasHoliday(m, dateStr, holidays));

  if (activeMembers.length < 2) return null;

  // Get UTC ranges for each member
  const ranges = activeMembers.map((m) => getMemberUtcRange(m, date));

  // Handle the simple case where all ranges don't wrap midnight
  const allSimple = ranges.every((r) => r.start < r.end);

  if (allSimple) {
    const maxStart = Math.max(...ranges.map((r) => r.start));
    const minEnd = Math.min(...ranges.map((r) => r.end));
    if (maxStart >= minEnd) return null;
    return { startUtc: maxStart, endUtc: minEnd };
  }

  // For ranges that wrap midnight (e.g., start=22, end=6),
  // check each quarter-hour slot across 24h for overlap
  const SLOTS = 96; // 15-min slots
  const slotOccupied = new Array(SLOTS).fill(true);

  for (const range of ranges) {
    for (let s = 0; s < SLOTS; s++) {
      const hour = s / 4;
      let inRange: boolean;
      if (range.start < range.end) {
        inRange = hour >= range.start && hour < range.end;
      } else {
        // Wraps midnight
        inRange = hour >= range.start || hour < range.end;
      }
      if (!inRange) slotOccupied[s] = false;
    }
  }

  // Find the longest consecutive run of true slots
  let bestStart = -1;
  let bestLen = 0;
  let curStart = -1;
  let curLen = 0;

  for (let s = 0; s < SLOTS; s++) {
    if (slotOccupied[s]) {
      if (curStart === -1) curStart = s;
      curLen++;
    } else {
      if (curLen > bestLen) {
        bestStart = curStart;
        bestLen = curLen;
      }
      curStart = -1;
      curLen = 0;
    }
  }
  if (curLen > bestLen) {
    bestStart = curStart;
    bestLen = curLen;
  }

  if (bestLen === 0) return null;

  // Handle overlap that wraps midnight by joining the tail and head runs
  if (slotOccupied[0] && slotOccupied[SLOTS - 1]) {
    let tailLen = 0;
    for (let s = SLOTS - 1; s >= 0 && slotOccupied[s]; s--) tailLen++;
    let headLen = 0;
    for (let s = 0; s < SLOTS && slotOccupied[s]; s++) headLen++;
    // Guard: head and tail must not overlap each other (i.e., not all slots occupied)
    if (tailLen + headLen < SLOTS && tailLen + headLen > bestLen) {
      bestStart = SLOTS - tailLen;
      bestLen = tailLen + headLen;
    }
  }

  return {
    startUtc: bestStart / 4,
    endUtc: (bestStart + bestLen) / 4,
  };
}

/** Format a UTC hour as "HH:MM". Hours >= 24 are wrapped via modulo 24. */
export function formatUtcHour(hour: number): string {
  const normalized = hour % 24;
  const h = Math.floor(normalized);
  const m = Math.round((normalized - h) * 60);
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

/** Convert UTC hour to local time string for a timezone */
export function utcHourToLocalString(utcHour: number, timezone: string, date: Date): string {
  const offset = getUtcOffsetHours(timezone, date);
  let local = utcHour + offset;
  if (local < 0) local += 24;
  if (local >= 24) local -= 24;
  const h = Math.floor(local);
  const m = Math.round((local - h) * 60);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:${m.toString().padStart(2, "0")} ${ampm}`;
}
