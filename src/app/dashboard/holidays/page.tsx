"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import type { TeamMember, Holiday } from "@/types";
import { getMembers, getHolidaysForCountry, setHolidayCache } from "@/lib/storage";
import { fetchHolidays } from "@/lib/api/holidays";
import HolidayList from "@/components/features/HolidayList";
import CountryFilter from "@/components/features/CountryFilter";
import Skeleton from "@/components/ui/Skeleton";
import { CalendarDays } from "lucide-react";
import Link from "next/link";

export default function HolidaysPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [holidayMap, setHolidayMap] = useState<Record<string, Holiday[]>>({});
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);

  const loadHolidays = useCallback(async (memberList: TeamMember[]) => {
    const year = new Date().getFullYear();
    const countryCodes = [...new Set(memberList.map((m) => m.countryCode))];
    const newMap: Record<string, Holiday[]> = {};
    const toFetch: string[] = [];

    for (const code of countryCodes) {
      const cached = getHolidaysForCountry(code, year);
      if (cached) {
        newMap[code] = cached;
      } else {
        toFetch.push(code);
      }
    }

    if (toFetch.length > 0) {
      const results = await Promise.allSettled(
        toFetch.map((code) => fetchHolidays(code, year))
      );
      results.forEach((result, i) => {
        if (result.status === "fulfilled") {
          newMap[toFetch[i]] = result.value;
          setHolidayCache(toFetch[i], year, result.value);
        }
      });
    }

    setHolidayMap(newMap);
  }, []);

  useEffect(() => {
    async function init() {
      const stored = await getMembers();
      setMembers(stored);
      setLoading(false);
      if (stored.length > 0) loadHolidays(stored);
    }
    init();
  }, [loadHolidays]);

  const countries = useMemo(() => {
    const seen = new Set<string>();
    return members
      .filter((m) => {
        if (seen.has(m.countryCode)) return false;
        seen.add(m.countryCode);
        return true;
      })
      .map((m) => ({ code: m.countryCode, name: m.countryName, flagEmoji: m.flagEmoji }));
  }, [members]);

  const entries = useMemo(() => {
    const today = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);
    // Use local date components to avoid off-by-one for non-UTC browsers
    const pad = (n: number) => String(n).padStart(2, "0");
    const todayStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
    const endStr = `${endDate.getFullYear()}-${pad(endDate.getMonth() + 1)}-${pad(endDate.getDate())}`;

    const allHolidays: (Holiday & { affectedMembers: TeamMember[] })[] = [];
    const filteredCodes = filter === "ALL" ? Object.keys(holidayMap) : [filter];

    for (const code of filteredCodes) {
      const holidays = holidayMap[code] ?? [];
      for (const h of holidays) {
        if (h.date >= todayStr && h.date <= endStr) {
          const affected = members.filter((m) => m.countryCode === h.countryCode);
          allHolidays.push({ ...h, affectedMembers: affected });
        }
      }
    }

    const grouped: Record<string, (Holiday & { affectedMembers: TeamMember[] })[]> = {};
    for (const h of allHolidays) {
      if (!grouped[h.date]) grouped[h.date] = [];
      grouped[h.date].push(h);
    }

    return Object.entries(grouped)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, holidays]) => ({ date, holidays }));
  }, [holidayMap, members, filter]);

  if (loading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-8 w-44" />
          <Skeleton className="h-9 w-40" />
        </div>
        <Skeleton className="h-6 w-80 mb-4" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <div className="text-center py-16 animate-fade-in-up">
        <CalendarDays size={48} className="mx-auto text-text-secondary/30 mb-4" />
        <h2 className="font-heading font-semibold text-lg mb-2">
          No team members yet
        </h2>
        <p className="text-sm text-text-secondary mb-4">
          Add team members to see their upcoming public holidays.
        </p>
        <Link
          href="/dashboard"
          className="text-sm text-primary hover:underline transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:outline-none rounded-sm"
        >
          Go to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 animate-fade-in">
        <h1 className="font-heading font-bold text-2xl">Holiday Calendar</h1>
        <CountryFilter
          countries={countries}
          selected={filter}
          onChange={setFilter}
        />
      </div>

      <p className="text-sm text-text-secondary mb-4">
        Upcoming public holidays in the next 30 days across your team.
      </p>

      <HolidayList entries={entries} />
    </div>
  );
}
